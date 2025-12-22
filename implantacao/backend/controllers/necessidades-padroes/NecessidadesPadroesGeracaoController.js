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
      // A rota será buscada depois baseada no grupo de produto
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
          // Armazenar dados da escola (sem rota ainda, será buscada depois baseada no grupo)
          escolasComPadroes.set(padrao.escola_id, {
            id: padrao.escola_id,
            nome_escola: padrao.escola_nome,
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

        // Buscar rota vinculada ao grupo de produto para esta escola
        // Cada grupo de produto está vinculado a um tipo_rota através do campo grupo_id no tipo_rota
        const rotaPorGrupo = {};
        
        // Buscar todas as rotas vinculadas aos grupos dos produtos desta escola
        const gruposIds = [...new Set(produtosEscola.map(p => p.grupo_id).filter(g => g))];
        
        if (gruposIds.length > 0) {
          const rotasGrupo = await executeQuery(`
            SELECT DISTINCT
              g.id as grupo_id,
              r.id as rota_id,
              r.nome as rota_nome
            FROM foods_db.grupos g
            INNER JOIN foods_db.tipo_rota tr ON FIND_IN_SET(g.id, tr.grupo_id) > 0
            INNER JOIN foods_db.rotas r ON r.tipo_rota_id = tr.id
            INNER JOIN foods_db.unidades_escolares ue ON FIND_IN_SET(r.id, ue.rota_id) > 0
            WHERE g.id IN (${gruposIds.map(() => '?').join(',')})
              AND ue.id = ?
              AND ue.status = 'ativo'
              AND tr.status = 'ativo'
              AND r.status = 'ativo'
            ORDER BY r.nome ASC
          `, [...gruposIds, escolaId]);
          
          // Agrupar rotas por grupo_id
          rotasGrupo.forEach(rota => {
            if (!rotaPorGrupo[rota.grupo_id]) {
              rotaPorGrupo[rota.grupo_id] = [];
            }
            rotaPorGrupo[rota.grupo_id].push({
              id: rota.rota_id,
              nome: rota.rota_nome
            });
          });
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
          
          // Buscar rota vinculada a este grupo de produto
          let rotaNome = '';
          if (grupo_id_final && rotaPorGrupo[grupo_id_final] && rotaPorGrupo[grupo_id_final].length > 0) {
            // Pegar a primeira rota vinculada ao grupo (se houver múltiplas, usar a primeira)
            rotaNome = rotaPorGrupo[grupo_id_final][0].nome;
          }

          try {
            // Verificar se já existe necessidade para este produto/escola/semana
            // Se existir, atualizar ao invés de criar nova
            const existing = await executeQuery(`
              SELECT id FROM necessidades 
              WHERE escola_id = ? AND produto_id = ? AND semana_consumo = ? AND status != 'EXCLUÍDO'
              LIMIT 1
            `, [escolaId, produto_id, semana_consumo]);

            if (existing.length > 0) {
              // Atualizar necessidade existente
              await executeQuery(`
                UPDATE necessidades SET
                  ajuste = ?,
                  semana_abastecimento = ?,
                  observacoes = ?,
                  data_atualizacao = NOW()
                WHERE id = ?
              `, [
                quantidade,
                semanaAbastecimentoFinal,
                'Atualizado automaticamente pedido mensal',
                existing[0].id
              ]);

              necessidadesCriadas.push({
                id: existing[0].id,
                escola: escola.nome_escola,
                produto: produto_nome,
                quantidade: quantidade,
                acao: 'atualizado'
              });
            } else {
              // Criar nova necessidade
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
                rotaNome, // Usar rota vinculada ao grupo de produto
                escola.codigo_teknisa || '',
                quantidade,
                semana_consumo,
                semanaAbastecimentoFinal,
                grupo,
                grupo_id_final,
                'NEC',
                'Gerado automaticamente pedido mensal',
                necessidadeId
              ]);

              necessidadesCriadas.push({
                id: result.insertId,
                escola: escola.nome_escola,
                produto: produto_nome,
                quantidade: quantidade,
                acao: 'criado'
              });
            }
          } catch (error) {
            console.error(`Erro ao criar/atualizar necessidade para produto ${produto_nome} na escola ${escola.nome_escola}:`, error);
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
   * Calcula a semana anterior programaticamente (mesma lógica do modal Gerar Necessidade)
   */
  static async buscarSemanaAbastecimentoPorConsumo(req, res) {
    try {
      const { semana_consumo } = req.query;

      if (!semana_consumo) {
        return errorResponse(res, 'Semana de consumo é obrigatória', 400);
      }

      // Calcular semana de abastecimento (semana anterior) - mesma lógica do frontend
      let data;
      
      try {
        // Se for uma string da semana (ex: "(09/02 a 13/02/26)"), converter para data
        if (typeof semana_consumo === 'string' && semana_consumo.includes(' a ')) {
          // Remover parênteses se existirem
          const dataLimpa = semana_consumo.replace(/[()]/g, '');
          // Extrair a primeira data da string (ex: "09/02" de "09/02 a 13/02/26")
          const primeiraData = dataLimpa.split(' a ')[0];
          const [dia, mes] = primeiraData.split('/');
          
          // Extrair ano da string original
          const anoMatch = semana_consumo.match(/\/(\d{2})[)]?$/);
          const ano2digitos = anoMatch ? anoMatch[1] : new Date().getFullYear().toString().slice(-2);
          const ano = parseInt(`20${ano2digitos}`);
          
          data = new Date(ano, parseInt(mes) - 1, parseInt(dia));
        } else {
          data = new Date(semana_consumo);
        }
        
        // Verificar se a data é válida
        if (isNaN(data.getTime())) {
          return errorResponse(res, 'Formato de semana de consumo inválido', 400);
        }
        
        // Calcular o início da semana anterior (segunda-feira)
        const inicioSemanaAnterior = new Date(data);
        inicioSemanaAnterior.setDate(data.getDate() - 7 - data.getDay() + 1); // -7 dias + ajuste para segunda-feira
        
        // Calcular o fim da semana anterior (sexta-feira - apenas 5 dias úteis)
        const fimSemanaAnterior = new Date(inicioSemanaAnterior);
        fimSemanaAnterior.setDate(inicioSemanaAnterior.getDate() + 4); // segunda + 4 dias = sexta (5 dias úteis)
        
        // Formatar as datas
        const formatarDataSemana = (data) => {
          const dia = String(data.getDate()).padStart(2, '0');
          const mes = String(data.getMonth() + 1).padStart(2, '0');
          return `${dia}/${mes}`;
        };
        
        const anoFormatado = fimSemanaAnterior.getFullYear().toString().slice(-2);
        const semanaAbastecimento = `(${formatarDataSemana(inicioSemanaAnterior)} a ${formatarDataSemana(fimSemanaAnterior)}/${anoFormatado})`;

        return successResponse(res, {
          semana_consumo,
          semana_abastecimento: semanaAbastecimento
        }, 'Semana de abastecimento calculada');
      } catch (error) {
        console.error('Erro ao calcular semana de abastecimento:', error);
        return errorResponse(res, 'Erro ao calcular semana de abastecimento', 500);
      }
    } catch (error) {
      console.error('Erro ao buscar semana de abastecimento:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }
}

module.exports = NecessidadesPadroesGeracaoController;

