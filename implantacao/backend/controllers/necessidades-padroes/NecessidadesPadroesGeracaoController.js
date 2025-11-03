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
      if (!filial_id || !semana_consumo || !grupo_id) {
        return errorResponse(res, 'Filial, Semana de Consumo e Grupo de Produtos são obrigatórios', 400);
      }

      // Se semana_abastecimento não foi enviada, buscar automaticamente a partir de semana_consumo
      let semanaAbastecimentoFinal = semana_abastecimento;
      if (!semanaAbastecimentoFinal && semana_consumo) {
        const calendario = await executeQuery(`
          SELECT DISTINCT semana_abastecimento
          FROM calendario
          WHERE semana_consumo = ?
            AND semana_abastecimento IS NOT NULL
            AND semana_abastecimento != ''
          LIMIT 1
        `, [semana_consumo]);

        if (calendario.length > 0) {
          semanaAbastecimentoFinal = calendario[0].semana_abastecimento;
        } else {
          return errorResponse(res, 'Semana de abastecimento não encontrada para a semana de consumo informada', 400);
        }
      }

      if (!semanaAbastecimentoFinal) {
        return errorResponse(res, 'Semana de abastecimento é obrigatória', 400);
      }

      // Buscar dados de necessidades_padroes primeiro, filtrando por filial, grupo e opcionalmente escola
      // Isso garante que só processaremos escolas que realmente têm padrões cadastrados
      let whereConditions = [
        'np.ativo = 1',
        'np.grupo_id = ?',
        'e.filial_id = ?',
        'e.status = \'ativo\''
      ];
      let params = [grupo_id, filial_id];

      // Se escola_id foi especificada, filtrar por ela também
      if (escola_id) {
        whereConditions.push('np.escola_id = ?');
        params.push(escola_id);
      }

      // Buscar dados de padrões que serão usados para gerar necessidades
      // JOIN com unidades_escolares para garantir que a escola pertence à filial e está ativa
      const padroes = await executeQuery(`
        SELECT DISTINCT
          np.escola_id,
          np.escola_nome,
          np.grupo_id,
          np.grupo_nome,
          np.produto_id,
          np.produto_nome,
          np.unidade_medida_sigla,
          np.quantidade,
          e.rota_id,
          e.codigo_teknisa
        FROM necessidades_padroes np
        INNER JOIN foods_db.unidades_escolares e ON np.escola_id = e.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY np.escola_id, np.produto_nome
      `, params);

      if (padroes.length === 0) {
        return errorResponse(res, 'Nenhum dado padrão encontrado para os filtros selecionados', 404);
      }

      // Agrupar por escola e extrair lista única de escolas que têm padrões
      const necessidadesPorEscola = {};
      const escolasComPadroes = new Map(); // Map para armazenar dados completos das escolas
      
      padroes.forEach(padrao => {
        if (!necessidadesPorEscola[padrao.escola_id]) {
          necessidadesPorEscola[padrao.escola_id] = [];
          // Armazenar dados da escola
          escolasComPadroes.set(padrao.escola_id, {
            id: padrao.escola_id,
            nome_escola: padrao.escola_nome,
            rota_id: padrao.rota_id || '',
            codigo_teknisa: padrao.codigo_teknisa || ''
          });
        }
        necessidadesPorEscola[padrao.escola_id].push(padrao);
      });

      // Converter Map para Array - apenas escolas que têm padrões
      const escolasParaProcessar = Array.from(escolasComPadroes.values());

      if (escolasParaProcessar.length === 0) {
        return errorResponse(res, 'Nenhuma escola com padrões cadastrados encontrada para os filtros selecionados', 404);
      }

      const necessidadesCriadas = [];
      const escolasProcessadas = [];

      // Processar cada escola que tem padrões
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
        `, [escolaId, semana_consumo]);

        if (existing.length > 0) {
          console.warn(`Necessidade já existe para escola ${escola.nome_escola} na semana ${semana_consumo}`);
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

        // Buscar produtos padrão para esta escola (já garantimos que ela tem padrões)
        const produtosEscola = necessidadesPorEscola[escolaId] || [];
        
        // Se por algum motivo não houver produtos (não deveria acontecer), pular esta escola
        if (produtosEscola.length === 0) {
          console.warn(`Nenhum produto padrão encontrado para escola ${escola.nome_escola} (ID: ${escolaId})`);
          continue;
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
              semana_consumo,
              semanaAbastecimentoFinal,
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
   * Buscar semana de abastecimento baseado na semana de consumo
   * Busca na tabela calendario que contém a relação entre semana_consumo e semana_abastecimento
   */
  static async buscarSemanaAbastecimentoPorConsumo(req, res) {
    try {
      const { semana_consumo } = req.query;

      if (!semana_consumo) {
        return errorResponse(res, 'Semana de consumo é obrigatória', 400);
      }

      console.log('[buscarSemanaAbastecimentoPorConsumo] Buscando:', semana_consumo);

      // Primeiro, tentar busca exata
      let result = await executeQuery(`
        SELECT DISTINCT semana_abastecimento
        FROM calendario
        WHERE semana_consumo = ?
          AND semana_abastecimento IS NOT NULL
          AND semana_abastecimento != ''
        LIMIT 1
      `, [semana_consumo]);

      console.log('[buscarSemanaAbastecimentoPorConsumo] Resultado (exato):', result);

      // Se não encontrou, tentar buscar pelo padrão de data (ignorando ano)
      // Extrair padrão "05/01 a 11/01" da string "(05/01 a 11/01/25)"
      if (result.length === 0) {
        const padraoData = semana_consumo.replace(/[()]/g, '').replace(/\/\d{2}$/, '');
        console.log('[buscarSemanaAbastecimentoPorConsumo] Buscando por padrão (sem ano):', padraoData);
        
        // Incluir semana_consumo no SELECT para poder fazer ORDER BY
        const resultadosCompleto = await executeQuery(`
          SELECT DISTINCT semana_consumo, semana_abastecimento
          FROM calendario
          WHERE semana_consumo LIKE ?
            AND semana_abastecimento IS NOT NULL
            AND semana_abastecimento != ''
          ORDER BY semana_consumo DESC
          LIMIT 1
        `, [`%${padraoData}%`]);

        // Extrair apenas semana_abastecimento do resultado
        result = resultadosCompleto.length > 0 ? [{ semana_abastecimento: resultadosCompleto[0].semana_abastecimento }] : [];
        console.log('[buscarSemanaAbastecimentoPorConsumo] Resultado (por padrão):', result);
      }

      if (result.length > 0 && result[0].semana_abastecimento) {
        return successResponse(res, {
          semana_consumo,
          semana_abastecimento: result[0].semana_abastecimento
        }, 'Semana de abastecimento encontrada');
      } else {
        return errorResponse(res, 'Semana de abastecimento não encontrada para esta semana de consumo', 404);
      }
    } catch (error) {
      console.error('Erro ao buscar semana de abastecimento:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }
}

module.exports = NecessidadesPadroesGeracaoController;

