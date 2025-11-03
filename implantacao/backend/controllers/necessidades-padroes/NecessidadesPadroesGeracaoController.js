const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse } = require('../../middleware/responseHandler');

/**
 * Controller para gerar necessidades padrão a partir de necessidades_substituicoes
 */
class NecessidadesPadroesGeracaoController {
  
  /**
   * Gerar necessidades padrão a partir de necessidades_substituicoes
   * Busca dados ajustados e cria necessidades na tabela necessidades com status 'NEC'
   */
  static async gerarNecessidadesPadrao(req, res) {
    try {
      const { filial_id, escola_id, semana_abastecimento, semana_consumo, grupo_id } = req.body;
      const usuario_id = req.user.id;

      // Validar dados obrigatórios
      if (!filial_id || !escola_id || !semana_abastecimento || !grupo_id) {
        return errorResponse(res, 'Filial, Escola, Semana de Abastecimento e Grupo de Produtos são obrigatórios', 400);
      }

      // Se semana_consumo não foi enviada, buscar automaticamente a partir de semana_abastecimento
      let semanaConsumoFinal = semana_consumo;
      if (!semanaConsumoFinal && semana_abastecimento) {
        const calendario = await executeQuery(`
          SELECT DISTINCT semana_consumo
          FROM calendario
          WHERE semana_abastecimento = ?
            AND semana_consumo IS NOT NULL
            AND semana_consumo != ''
          LIMIT 1
        `, [semana_abastecimento]);

        if (calendario.length > 0) {
          semanaConsumoFinal = calendario[0].semana_consumo;
        } else {
          return errorResponse(res, 'Semana de consumo não encontrada para a semana de abastecimento informada', 400);
        }
      }

      if (!semanaConsumoFinal) {
        return errorResponse(res, 'Semana de consumo é obrigatória', 400);
      }

      // Buscar escolas baseado nos filtros
      let escolasParaProcessar = [];
      
      if (escola_id) {
        // Processar apenas a escola especificada
        const escola = await executeQuery(`
          SELECT id, nome_escola, rota_id, codigo_teknisa
          FROM foods_db.unidades_escolares
          WHERE id = ? AND filial_id = ? AND status = 'ativo'
        `, [escola_id, filial_id]);

        if (escola.length > 0) {
          escolasParaProcessar = [escola[0]];
        } else {
          return errorResponse(res, 'Escola não encontrada ou não pertence à filial selecionada', 404);
        }
      } else {
        // Processar todas as escolas da filial
        const escolas = await executeQuery(`
          SELECT id, nome_escola, rota_id, codigo_teknisa
          FROM foods_db.unidades_escolares
          WHERE filial_id = ? AND status = 'ativo'
          ORDER BY nome_escola
        `, [filial_id]);

        escolasParaProcessar = escolas;
      }

      if (escolasParaProcessar.length === 0) {
        return errorResponse(res, 'Nenhuma escola encontrada para processar', 404);
      }

      // Buscar dados de necessidades_padroes com os filtros
      let whereConditions = [
        'np.ativo = 1',
        'np.grupo_id = ?'
      ];
      let params = [grupo_id];

      // Filtrar por escolas que serão processadas
      const escolaIds = escolasParaProcessar.map(e => e.id);
      whereConditions.push(`np.escola_id IN (${escolaIds.map(() => '?').join(',')})`);
      params.push(...escolaIds);

      // Buscar dados de padrões que serão usados para gerar necessidades
      const padroes = await executeQuery(`
        SELECT DISTINCT
          np.escola_id,
          np.escola_nome,
          np.grupo_id,
          np.grupo_nome,
          np.produto_id,
          np.produto_nome,
          np.unidade_medida_sigla,
          np.quantidade
        FROM necessidades_padroes np
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY np.escola_id, np.produto_nome
      `, params);

      if (padroes.length === 0) {
        return errorResponse(res, 'Nenhum dado padrão encontrado para os filtros selecionados', 404);
      }

      // Agrupar por escola
      const necessidadesPorEscola = {};
      padroes.forEach(padrao => {
        if (!necessidadesPorEscola[padrao.escola_id]) {
          necessidadesPorEscola[padrao.escola_id] = [];
        }
        necessidadesPorEscola[padrao.escola_id].push(padrao);
      });

      const necessidadesCriadas = [];
      const escolasProcessadas = [];

      // Processar cada escola
      for (const escola of escolasParaProcessar) {
        const escolaId = escola.id;
        
        // Buscar nutricionista vinculada à escola
        const nutricionista = await executeQuery(`
          SELECT DISTINCT 
            rn.usuario_id,
            u.nome as usuario_nome,
            u.email as usuario_email
          FROM foods_db.rotas_nutricionistas rn
          LEFT JOIN foods_db.usuarios u ON rn.usuario_id = u.id
          WHERE rn.status = 'ativo'
            AND rn.escolas_responsaveis IS NOT NULL 
            AND rn.escolas_responsaveis != ''
            AND FIND_IN_SET(?, rn.escolas_responsaveis) > 0
          LIMIT 1
        `, [escolaId]);

        if (nutricionista.length === 0) {
          console.warn(`Nutricionista não encontrada para escola ${escola.nome_escola} (ID: ${escolaId})`);
          continue; // Pular escola sem nutricionista
        }

        const nutricionistaData = nutricionista[0];

        // Verificar se já existe necessidade para esta escola/semana
        const existing = await executeQuery(`
          SELECT DISTINCT necessidade_id 
          FROM necessidades 
          WHERE escola_id = ? AND semana_consumo = ?
        `, [escolaId, semanaConsumoFinal]);

        if (existing.length > 0) {
          console.warn(`Necessidade já existe para escola ${escola.nome_escola} na semana ${semanaConsumoFinal}`);
          continue; // Pular escola que já tem necessidade
        }

        // Gerar ID sequencial para esta necessidade
        const ultimoId = await executeQuery(`
          SELECT COALESCE(MAX(CAST(necessidade_id AS UNSIGNED)), 0) as ultimo_id 
          FROM necessidades 
          WHERE necessidade_id REGEXP '^[0-9]+$'
        `);
        
        const proximoId = (ultimoId[0]?.ultimo_id || 0) + 1;
        const necessidadeId = proximoId.toString();

        // Buscar produtos padrão para esta escola
        const produtosEscola = necessidadesPorEscola[escolaId] || [];

        // Se não houver dados de padrão para esta escola, buscar do padrão geral (outras escolas do mesmo grupo)
        if (produtosEscola.length === 0) {
          // Buscar dados padrão mais recentes para o grupo (de qualquer escola)
          const dadosPadrao = await executeQuery(`
            SELECT DISTINCT
              np.produto_id,
              np.produto_nome,
              np.unidade_medida_sigla,
              np.quantidade,
              np.grupo_id,
              np.grupo_nome
            FROM necessidades_padroes np
            WHERE np.ativo = 1
              AND np.grupo_id = ?
              AND np.quantidade > 0
            ORDER BY np.data_atualizacao DESC
            LIMIT 50
          `, [grupo_id]);

          // Agrupar por produto para evitar duplicatas
          const produtosUnicos = {};
          dadosPadrao.forEach(prod => {
            const chave = prod.produto_id;
            if (chave && !produtosUnicos[chave]) {
              produtosUnicos[chave] = prod;
            }
          });

          produtosEscola.push(...Object.values(produtosUnicos));
        }

        // Inserir necessidades para cada produto
        for (const produto of produtosEscola) {
          // Usar dados da tabela necessidades_padroes
          const produto_id = produto.produto_id;
          const produto_nome = produto.produto_nome;
          const produto_unidade = produto.unidade_medida_sigla || '';
          const quantidade = parseFloat(produto.quantidade) || 0;

          if (!produto_id || !produto_nome || quantidade <= 0) {
            continue; // Pular produtos inválidos
          }

          // Usar grupo_id e grupo_nome da tabela necessidades_padroes
          const grupo = produto.grupo_nome || null;
          const grupo_id_final = produto.grupo_id || grupo_id;

          try {
            const result = await executeQuery(`
              INSERT INTO necessidades (
                usuario_email,
                usuario_id,
                produto_id,
                produto,
                produto_unidade,
                escola_id,
                escola,
                escola_rota,
                codigo_teknisa,
                ajuste,
                semana_consumo,
                semana_abastecimento,
                grupo,
                grupo_id,
                status,
                observacoes,
                necessidade_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              nutricionistaData.usuario_email,
              nutricionistaData.usuario_id,
              produto_id,
              produto_nome,
              produto_unidade || '',
              escolaId,
              escola.nome_escola,
              escola.rota_id || '',
              escola.codigo_teknisa || '',
              quantidade,
              semanaConsumoFinal,
              semana_abastecimento,
              grupo,
              grupo_id_final,
              'NEC',
              'Gerado automaticamente a partir de padrão',
              necessidadeId
            ]);

            necessidadesCriadas.push({
              id: result.insertId,
              escola: escola.nome_escola,
              produto: produto_nome,
              quantidade: quantidade
            });
          } catch (error) {
            console.error(`Erro ao criar necessidade para produto ${produto_nome} na escola ${escola.nome_escola}:`, error);
            // Continuar processando outros produtos
          }
        }

        if (produtosEscola.length > 0) {
          escolasProcessadas.push(escola.nome_escola);
        }
      }

      if (necessidadesCriadas.length === 0) {
        return errorResponse(res, 'Nenhuma necessidade foi gerada. Verifique se há dados padrão disponíveis e se as escolas têm nutricionistas vinculadas.', 404);
      }

      return successResponse(res, {
        total_necessidades: necessidadesCriadas.length,
        escolas_processadas: escolasProcessadas.length,
        escolas: escolasProcessadas,
        detalhes: necessidadesCriadas
      }, `Necessidades geradas com sucesso! ${necessidadesCriadas.length} necessidade(s) criada(s) para ${escolasProcessadas.length} escola(s).`);

    } catch (error) {
      console.error('Erro ao gerar necessidades padrão:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  /**
   * Buscar semana de consumo baseado na semana de abastecimento
   * Busca na tabela calendario que contém a relação entre semana_abastecimento e semana_consumo
   */
  static async buscarSemanaConsumoPorAbastecimento(req, res) {
    try {
      const { semana_abastecimento } = req.query;

      if (!semana_abastecimento) {
        return errorResponse(res, 'Semana de abastecimento é obrigatória', 400);
      }

      // Buscar semana de consumo na tabela calendario
      const result = await executeQuery(`
        SELECT DISTINCT semana_consumo
        FROM calendario
        WHERE semana_abastecimento = ?
          AND semana_consumo IS NOT NULL
          AND semana_consumo != ''
        LIMIT 1
      `, [semana_abastecimento]);

      if (result.length > 0) {
        return successResponse(res, {
          semana_abastecimento,
          semana_consumo: result[0].semana_consumo
        }, 'Semana de consumo encontrada');
      } else {
        return errorResponse(res, 'Semana de consumo não encontrada para esta semana de abastecimento', 404);
      }
    } catch (error) {
      console.error('Erro ao buscar semana de consumo:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }
}

module.exports = NecessidadesPadroesGeracaoController;

