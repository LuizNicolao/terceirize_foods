const { executeQuery } = require('../../config/database');
const axios = require('axios');

const produtosGrupoCache = {};

const normalizarProdutosOrigem = (produtos) => {
  return produtos.map(produto => {
    const produtoOrigemId = produto.id || produto.produto_id || produto.codigo;

    let produtoGenericoPadrao = null;
    if (produto.produto_generico_padrao) {
      const padrao = produto.produto_generico_padrao;
      produtoGenericoPadrao = {
        id: padrao.id || padrao.codigo,
        codigo: padrao.codigo || padrao.id,
        nome: padrao.nome,
        unidade_medida: padrao.unidade_medida_sigla || padrao.unidade_medida || padrao.unidade || '',
        unidade_medida_sigla: padrao.unidade_medida_sigla || padrao.unidade_medida || padrao.unidade || '',
        fator_conversao: padrao.fator_conversao || 1
      };
    } else if (
      produto.produto_generico_padrao_id ||
      produto.produto_generico_padrao_nome ||
      produto.produto_generico_padrao_unidade
    ) {
      produtoGenericoPadrao = {
        id: produto.produto_generico_padrao_id || produto.produto_generico_padrao_codigo,
        codigo: produto.produto_generico_padrao_codigo || produto.produto_generico_padrao_id,
        nome: produto.produto_generico_padrao_nome,
        unidade_medida: produto.produto_generico_padrao_unidade || '',
        unidade_medida_sigla: produto.produto_generico_padrao_unidade || '',
        fator_conversao: produto.produto_generico_padrao_fator || 1
      };
    }

    return {
      produto_id: produtoOrigemId,
      produto_codigo: produto.codigo || produto.produto_codigo || produtoOrigemId,
      produto_nome: produto.nome || produto.produto_nome,
      unidade_medida: produto.unidade_medida_sigla || produto.unidade_medida || produto.unidade || '',
      grupo_id: produto.grupo_id,
      produto_generico_padrao: produtoGenericoPadrao
    };
  });
};

const buscarProdutosDoGrupo = async (grupoId, grupoNome, authHeader) => {
  const cacheKey = grupoId || grupoNome;

  if (!cacheKey) {
    return [];
  }

  if (produtosGrupoCache[cacheKey]) {
    return produtosGrupoCache[cacheKey];
  }

  let resolvedGrupoId = grupoId;

  if (!resolvedGrupoId && grupoNome) {
    const grupoResult = await executeQuery(
      'SELECT id FROM foods_db.grupos WHERE nome = ? LIMIT 1',
      [grupoNome]
    );
    resolvedGrupoId = grupoResult[0]?.id || null;
  }

  if (!resolvedGrupoId) {
    return [];
  }

  const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';

  try {
    const response = await axios.get(
      `${foodsApiUrl}/produto-origem/grupo/${resolvedGrupoId}?limit=1000`,
      {
        headers: {
          Authorization: authHeader
        },
        timeout: 10000
      }
    );

    let produtos = [];

    if (response.data?.data) {
      produtos = Array.isArray(response.data.data)
        ? response.data.data
        : response.data.data.items || [];
    } else if (Array.isArray(response.data)) {
      produtos = response.data;
    }

    const mapped = normalizarProdutosOrigem(produtos);
    produtosGrupoCache[cacheKey] = mapped;
    return mapped;
  } catch (error) {
    console.error('[Substituições] Erro ao buscar produtos do grupo no Foods:', error.message);

    // Fallback para banco local caso a API do Foods esteja indisponível
    try {
      const produtosFallback = await executeQuery(
        `
          SELECT 
            po.id AS produto_id,
            po.codigo AS produto_codigo,
            po.nome AS produto_nome,
            COALESCE(um.sigla, um.nome, '') AS unidade_medida,
            po.grupo_id,
            po.produto_generico_padrao_id,
            pg.codigo AS produto_generico_padrao_codigo,
            pg.nome AS produto_generico_padrao_nome,
            COALESCE(um_pg.sigla, um_pg.nome, '') AS produto_generico_padrao_unidade,
            pg.fator_conversao AS produto_generico_padrao_fator
          FROM foods_db.produto_origem po
          LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id
          LEFT JOIN foods_db.produto_generico pg ON po.produto_generico_padrao_id = pg.id
          LEFT JOIN foods_db.unidades_medida um_pg ON pg.unidade_medida_id = um_pg.id
          WHERE po.grupo_id = ? AND po.status = 1
          ORDER BY po.nome ASC
        `,
        [resolvedGrupoId]
      );

      const mappedFallback = normalizarProdutosOrigem(produtosFallback);
      produtosGrupoCache[cacheKey] = mappedFallback;
      return mappedFallback;
    } catch (fallbackError) {
      console.error('[Substituições] Erro no fallback local de produtos do grupo:', fallbackError.message);
      return [];
    }
  }
};

/**
 * Controller para listagem de substituições de necessidades
 * Busca necessidades com status CONF e agrupa por produto origem
 */
class SubstituicoesListController {
  /**
   * Listar necessidades para substituição (status CONF)
   * Agrupa por produto origem e mostra escolas solicitantes
   */
  static async listarParaSubstituicao(req, res) {
    try {
      const { grupo, semana_abastecimento, semana_consumo, tipo_rota_id, rota_id } = req.query;

      let whereConditions = ["n.status = 'CONF'", "(n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)"];
      let params = [];

      // Filtro por tipo de rota
      if (tipo_rota_id) {
        // Buscar IDs das rotas vinculadas a este tipo de rota
        // Depois buscar escolas que têm alguma dessas rotas no rota_id
        whereConditions.push(`n.escola_id IN (
          SELECT DISTINCT ue.id
          FROM foods_db.unidades_escolares ue
          INNER JOIN foods_db.rotas r ON FIND_IN_SET(r.id, ue.rota_id) > 0
          WHERE r.tipo_rota_id = ?
            AND ue.status = 'ativo'
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
        )`);
        params.push(tipo_rota_id);
      }

      // Filtro por rota específica
      if (rota_id) {
        // Buscar escolas que têm esta rota específica no rota_id
        whereConditions.push(`n.escola_id IN (
          SELECT DISTINCT ue.id
          FROM foods_db.unidades_escolares ue
          WHERE FIND_IN_SET(?, ue.rota_id) > 0
            AND ue.status = 'ativo'
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
        )`);
        params.push(rota_id);
      }

      // Filtro por grupo
      if (grupo) {
        whereConditions.push(`n.produto_id IN (
          SELECT DISTINCT ppc.produto_id 
          FROM produtos_per_capita ppc 
          WHERE ppc.grupo = ?
        )`);
        params.push(grupo);
      }

      // Filtro por semana de abastecimento
      if (semana_abastecimento) {
        // Buscar exatamente a semana fornecida (já no formato correto)
        whereConditions.push("n.semana_abastecimento = ?");
        params.push(semana_abastecimento);
      }

      // Filtro por semana de consumo
      if (semana_consumo) {
        // Buscar exatamente a semana fornecida (já no formato correto)
        whereConditions.push("n.semana_consumo = ?");
        params.push(semana_consumo);
      }

      // Buscar necessidades agrupadas por produto origem + produto genérico
      const necessidades = await executeQuery(`
        SELECT 
          base.codigo_origem,
          base.produto_origem_nome,
          base.produto_origem_unidade,
          base.produto_trocado_id,
          base.produto_trocado_nome,
          base.produto_trocado_unidade,
          MAX(base.produto_generico_id) AS produto_generico_id,
          MAX(base.produto_generico_codigo) AS produto_generico_codigo,
          MAX(base.produto_generico_nome) AS produto_generico_nome,
          MAX(base.produto_generico_unidade) AS produto_generico_unidade,
          SUM(base.quantidade_origem) AS quantidade_total_origem,
          GROUP_CONCAT(base.necessidade_id) AS necessidade_ids,
          base.semana_abastecimento,
          base.semana_consumo,
          base.grupo,
          base.grupo_id,
          GROUP_CONCAT(
            DISTINCT CONCAT(
              base.necessidade_id, '|',
              base.escola_id, '|',
              base.escola_nome, '|',
              base.quantidade_origem
            ) SEPARATOR '::'
          ) as escolas_solicitantes
        FROM (
          SELECT 
            ns.necessidade_id,
            ns.produto_origem_id AS codigo_origem,
            ns.produto_origem_nome,
            ns.produto_origem_unidade,
            ns.produto_trocado_id,
            ns.produto_trocado_nome,
            ns.produto_trocado_unidade,
            ns.produto_generico_id,
            ns.produto_generico_codigo,
            ns.produto_generico_nome,
            ns.produto_generico_unidade,
            ns.quantidade_origem,
            ns.semana_abastecimento,
            ns.semana_consumo,
            ns.grupo,
            ns.grupo_id,
            ns.escola_id,
            ns.escola_nome
          FROM necessidades_substituicoes ns
          WHERE ns.ativo = 1
            AND (ns.status IS NULL OR ns.status = 'conf')
          
          UNION ALL
          
          SELECT 
            n.id AS necessidade_id,
            n.produto_id AS codigo_origem,
            n.produto AS produto_origem_nome,
            n.produto_unidade AS produto_origem_unidade,
            NULL AS produto_trocado_id,
            '' AS produto_trocado_nome,
            '' AS produto_trocado_unidade,
            NULL AS produto_generico_id,
            NULL AS produto_generico_codigo,
            NULL AS produto_generico_nome,
            NULL AS produto_generico_unidade,
            n.ajuste_conf_coord AS quantidade_origem,
            n.semana_abastecimento,
            n.semana_consumo,
            n.grupo,
            n.grupo_id,
            n.escola_id,
            n.escola AS escola_nome
          FROM necessidades n
          WHERE n.status = 'CONF'
            AND (n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)
            AND NOT EXISTS (
              SELECT 1
              FROM necessidades_substituicoes ns2
              WHERE ns2.necessidade_id = n.id
                AND ns2.ativo = 1
                AND (ns2.status IS NULL OR ns2.status = 'conf')
            )
        ) base
        INNER JOIN necessidades n ON n.id = base.necessidade_id
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY 
          base.codigo_origem,
          base.produto_origem_nome,
          base.produto_origem_unidade,
          base.produto_trocado_id,
          base.produto_trocado_nome,
          base.produto_trocado_unidade,
          base.semana_abastecimento,
          base.semana_consumo,
          base.grupo,
          base.grupo_id
        ORDER BY base.produto_origem_nome ASC, base.semana_abastecimento ASC
      `, params);

      // Buscar substituições existentes para cada produto
      const produtosComSubstituicoes = await Promise.all(
        necessidades.map(async (necessidade) => {
          // Buscar produto padrão do produto origem no Foods
          let produtoPadraoId = null;
          try {
            const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
            const produtoOrigemResponse = await axios.get(`${foodsApiUrl}/produto-origem/${necessidade.codigo_origem}`, {
              headers: {
                'Authorization': req.headers.authorization
              },
              timeout: 5000
            });

            if (produtoOrigemResponse.data && produtoOrigemResponse.data.success) {
              produtoPadraoId = produtoOrigemResponse.data.data.produto_padrao_id;
            }
          } catch (error) {
            console.error(`Erro ao buscar produto padrão para produto origem ${necessidade.codigo_origem}:`, error.message);
          }

          // Buscar substituições existentes para este produto genérico específico
          const substituicoes = await executeQuery(`
            SELECT 
              ns.id,
              ns.produto_generico_id,
              ns.produto_generico_codigo,
              ns.produto_generico_nome,
              ns.produto_generico_unidade,
              ns.escola_id,
              ns.escola_nome,
              ns.quantidade_generico,
              ns.status,
              ns.necessidade_id
            FROM necessidades_substituicoes ns
            WHERE ns.produto_origem_id = ? 
              AND ns.produto_generico_id = ?
              AND ns.ativo = 1
              AND (ns.status IS NULL OR ns.status = 'conf')
          `, [necessidade.codigo_origem, necessidade.produto_generico_id]);

          // Processar escolas solicitantes
          let escolas = [];
          if (necessidade.escolas_solicitantes) {
            escolas = necessidade.escolas_solicitantes
              .split('::')
              .map(escolaStr => {
                const [necessidade_id, escola_id, escola_nome, quantidade] = escolaStr.split('|');
                return {
                  necessidade_id: parseInt(necessidade_id),
                  escola_id: parseInt(escola_id),
                  escola_nome,
                  quantidade_origem: parseFloat(quantidade)
                };
              });
          }

          // Se há produto genérico específico, filtrar apenas escolas que usam esse produto
          if (necessidade.produto_generico_id) {
            const escolasComSubstituicao = substituicoes.map(s => s.escola_id);
            escolas = escolas.filter(escola => escolasComSubstituicao.includes(escola.escola_id));
          }

          // Verificar quais escolas já têm substituição
          escolas.forEach(escola => {
            const substituicao = substituicoes.find(s => s.escola_id === escola.escola_id);
            escola.substituicao = substituicao || null;
          });

          const produtosGrupo = await buscarProdutosDoGrupo(
            necessidade.grupo_id,
            necessidade.grupo,
            req.headers.authorization
          );

          return {
            ...necessidade,
            escolas,
            substituicoes_existentes: substituicoes.length > 0,
            produto_padrao_id: produtoPadraoId,
            produtos_grupo: produtosGrupo,
            produto_trocado_id: necessidade.produto_trocado_id,
            produto_trocado_nome: necessidade.produto_trocado_nome,
            produto_trocado_unidade: necessidade.produto_trocado_unidade
          };
        })
      );

      res.json({
        success: true,
        data: produtosComSubstituicoes
      });
    } catch (error) {
      console.error('Erro ao listar necessidades para substituição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar necessidades para substituição'
      });
    }
  }

  /**
   * Buscar semana de consumo por semana de abastecimento
   */
  static async buscarSemanaConsumo(req, res) {
    try {
      const { semana_abastecimento } = req.query;

      if (!semana_abastecimento) {
        return res.status(400).json({
          success: false,
          message: 'Semana de abastecimento é obrigatória'
        });
      }

      // Buscar semana de consumo na tabela necessidades usando o formato exato
      const result = await executeQuery(`
        SELECT DISTINCT semana_consumo
        FROM necessidades
        WHERE semana_abastecimento = ?
          AND semana_consumo IS NOT NULL
          AND semana_consumo != ''
        LIMIT 1
      `, [semana_abastecimento]);

      if (result.length > 0) {
        res.json({
          success: true,
          data: {
            semana_abastecimento,
            semana_consumo: result[0].semana_consumo
          }
        });
      } else {
        res.json({
          success: false,
          message: 'Semana de consumo não encontrada para esta semana de abastecimento'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar semana de consumo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar semana de consumo'
      });
    }
  }

  /**
   * Buscar produtos genéricos do Foods por produto origem
   */
  static async buscarProdutosGenericos(req, res) {
    try {
      const { produto_origem_id, grupo, search } = req.query;
      const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';

      // Buscar produtos genéricos vinculados ao produto origem específico
      let url = `${foodsApiUrl}/produto-generico?limit=10000&status=1`;
      
      if (produto_origem_id) {
        url += `&produto_origem_id=${produto_origem_id}`;
      }
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': req.headers.authorization
        },
        timeout: 5000
      });

      // Extrair dados da resposta Foods (estrutura HATEOAS)
      let produtosGenericos = [];
      
      if (response.data) {
        // Verificar estrutura HATEOAS
        if (response.data.data && response.data.data.items) {
          produtosGenericos = response.data.data.items;
        } else if (response.data.data) {
          produtosGenericos = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response.data)) {
          produtosGenericos = response.data;
        }
      }

      res.json({
        success: true,
        data: produtosGenericos
      });
    } catch (error) {
      console.error('[Substituições] Erro ao buscar produtos genéricos:', error.message);
      console.error('[Substituições] Stack:', error.stack);
      res.json({
        success: true,
        data: []
      });
    }
  }
  /**
   * Listar necessidades para coordenação (status conf log)
   * Lê APENAS da tabela necessidades_substituicoes
   * Mostra apenas registros com status 'conf log'
   */
  static async listarParaCoordenacao(req, res) {
    try {
      const { grupo, semana_abastecimento, semana_consumo, tipo_rota_id, rota_id } = req.query;

      // Construir query base
      let whereConditions = ['status = "conf log"', 'ativo = 1'];
      const params = [];

      // Filtro por tipo de rota
      if (tipo_rota_id) {
        // Buscar IDs das rotas vinculadas a este tipo de rota
        // Depois buscar escolas que têm alguma dessas rotas no rota_id
        whereConditions.push(`escola_id IN (
          SELECT DISTINCT ue.id
          FROM foods_db.unidades_escolares ue
          INNER JOIN foods_db.rotas r ON FIND_IN_SET(r.id, ue.rota_id) > 0
          WHERE r.tipo_rota_id = ?
            AND ue.status = 'ativo'
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
        )`);
        params.push(tipo_rota_id);
      }

      // Filtro por rota específica
      if (rota_id) {
        // Buscar escolas que têm esta rota específica no rota_id
        whereConditions.push(`escola_id IN (
          SELECT DISTINCT ue.id
          FROM foods_db.unidades_escolares ue
          WHERE FIND_IN_SET(?, ue.rota_id) > 0
            AND ue.status = 'ativo'
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
        )`);
        params.push(rota_id);
      }

      if (grupo) {
        whereConditions.push('grupo = ?');
        params.push(grupo);
      }

      if (semana_abastecimento) {
        whereConditions.push('semana_abastecimento = ?');
        params.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('semana_consumo = ?');
        params.push(semana_consumo);
      }

      // Buscar necessidades agrupadas por produto origem e produto genérico
      const necessidades = await executeQuery(`
        SELECT 
          produto_origem_id as codigo_origem,
          produto_origem_nome,
          produto_origem_unidade,
          COALESCE(MAX(produto_trocado_id), NULL) as produto_trocado_id,
          COALESCE(MAX(produto_trocado_nome), '') as produto_trocado_nome,
          COALESCE(MAX(produto_trocado_unidade), '') as produto_trocado_unidade,
          grupo,
          grupo_id,
          semana_abastecimento,
          semana_consumo,
          SUM(quantidade_origem) as quantidade_total_origem,
          produto_generico_id,
          produto_generico_codigo,
          produto_generico_nome,
          produto_generico_unidade
        FROM necessidades_substituicoes
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY produto_origem_id, produto_origem_nome, produto_origem_unidade, grupo, grupo_id,
                 semana_abastecimento, semana_consumo, produto_generico_id, 
                 produto_generico_codigo, produto_generico_nome, produto_generico_unidade
        ORDER BY produto_origem_nome ASC, produto_generico_nome ASC
      `, params);

      // Buscar substituições existentes para cada produto
      const produtosComSubstituicoes = await Promise.all(
        necessidades.map(async (necessidade) => {
          // Buscar produto padrão do produto origem no Foods
          let produtoPadraoId = null;
          try {
            const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
            const produtoOrigemResponse = await axios.get(`${foodsApiUrl}/produto-origem/${necessidade.codigo_origem}`, {
              headers: {
                'Authorization': req.headers.authorization
              },
              timeout: 5000
            });

            if (produtoOrigemResponse.data && produtoOrigemResponse.data.success) {
              produtoPadraoId = produtoOrigemResponse.data.data.produto_padrao_id;
            }
          } catch (error) {
            console.error(`Erro ao buscar produto padrão para produto origem ${necessidade.codigo_origem}:`, error.message);
          }

          // Buscar substituições existentes para este produto genérico específico
          const substituicoes = await executeQuery(`
            SELECT 
              ns.id,
              ns.necessidade_id,
              ns.escola_id,
              ns.escola_nome,
              ns.quantidade_origem,
              ns.quantidade_generico,
              ns.status,
              ns.data_criacao,
              ns.data_atualizacao
            FROM necessidades_substituicoes ns
            WHERE ns.produto_origem_id = ?
              AND ns.produto_generico_id = ?
              AND ns.semana_abastecimento = ?
              AND ns.semana_consumo = ?
              AND ns.ativo = 1
              AND ns.status = 'conf log'
            ORDER BY ns.escola_nome ASC
          `, [
            necessidade.codigo_origem,
            necessidade.produto_generico_id || '',
            necessidade.semana_abastecimento,
            necessidade.semana_consumo
          ]);


          const produtosGrupo = await buscarProdutosDoGrupo(
            necessidade.grupo_id,
            necessidade.grupo,
            req.headers.authorization
          );

          return {
            ...necessidade,
            produto_padrao_id: produtoPadraoId,
            produtos_grupo: produtosGrupo,
            escolas: substituicoes.map(sub => ({
              necessidade_id: sub.necessidade_id,
              escola_id: sub.escola_id,
              escola_nome: sub.escola_nome,
              quantidade_origem: sub.quantidade_origem,
              quantidade_generico: sub.quantidade_generico,
              substituicao: {
                id: sub.id,
                status: sub.status,
                data_criacao: sub.data_criacao,
                data_atualizacao: sub.data_atualizacao
              }
            })),
            produto_trocado_id: necessidade.produto_trocado_id,
            produto_trocado_nome: necessidade.produto_trocado_nome,
            produto_trocado_unidade: necessidade.produto_trocado_unidade
          };
        })
      );

      res.json({
        success: true,
        data: produtosComSubstituicoes,
        total: produtosComSubstituicoes.length
      });

    } catch (error) {
      console.error('Erro ao listar necessidades para coordenação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar necessidades para coordenação'
      });
    }
  }

  /**
   * Buscar tipos de rota disponíveis
   * Busca tipos de rota que têm escolas vinculadas nas necessidades
   * E que têm grupos vinculados que existem nas necessidades
   * Suporta duas abas:
   * - nutricionista: busca tipos de rota com escolas em necessidades (status CONF)
   * - coordenacao: busca tipos de rota com escolas em necessidades_substituicoes (status conf log)
   */
  static async buscarTiposRotaDisponiveis(req, res) {
    try {
      const { aba, rota_id, semana_abastecimento } = req.query;
      
      let tiposRota;
      let params = [];
      let whereConditions = [];
      
      if (aba === 'coordenacao') {
        // Buscar tipos de rota que:
        // 1. Têm escolas na tabela necessidades_substituicoes com status conf log
        // 2. Têm grupos vinculados (grupo_id) que existem nas necessidades_substituicoes
        // 3. Se rota_id for fornecido, mostrar apenas tipos vinculados a essa rota
        // 4. Se semana_abastecimento for fornecido, filtrar por essa semana
        whereConditions = [
          "tr.status = 'ativo'",
          "r.status = 'ativo'",
          "ue.status = 'ativo'",
          "ns.ativo = 1",
          "ns.status = 'conf log'",
          "ue.rota_id IS NOT NULL",
          "ue.rota_id != ''",
          "tr.grupo_id IS NOT NULL",
          "tr.grupo_id != ''",
          "ns.grupo IS NOT NULL",
          "ns.grupo != ''"
        ];
        
        if (rota_id) {
          whereConditions.push("r.id = ?");
          params.push(rota_id);
        }

        if (semana_abastecimento) {
          whereConditions.push("ns.semana_abastecimento = ?");
          params.push(semana_abastecimento);
        }
        
        tiposRota = await executeQuery(`
          SELECT DISTINCT
            tr.id,
            tr.nome
          FROM foods_db.tipo_rota tr
          INNER JOIN foods_db.rotas r ON r.tipo_rota_id = tr.id
          INNER JOIN foods_db.unidades_escolares ue ON FIND_IN_SET(r.id, ue.rota_id) > 0
          INNER JOIN necessidades_substituicoes ns ON ns.escola_id = ue.id
          INNER JOIN foods_db.grupos g ON g.nome COLLATE utf8mb4_unicode_ci = ns.grupo COLLATE utf8mb4_unicode_ci
          WHERE ${whereConditions.join(' AND ')}
            -- Validar se o grupo existe no grupo_id do tipo_rota
            AND FIND_IN_SET(g.id, tr.grupo_id) > 0
          ORDER BY tr.nome ASC
        `, params);
      } else {
        // Buscar tipos de rota que:
        // 1. Têm escolas na tabela necessidades com status CONF (padrão: nutricionista)
        // 2. Têm grupos vinculados (grupo_id) que existem nas necessidades
        // 3. Se rota_id for fornecido, mostrar apenas tipos vinculados a essa rota
        // 4. Se semana_abastecimento for fornecido, filtrar por essa semana
        whereConditions = [
          "tr.status = 'ativo'",
          "r.status = 'ativo'",
          "ue.status = 'ativo'",
          "n.status = 'CONF'",
          "(n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)",
          "ue.rota_id IS NOT NULL",
          "ue.rota_id != ''",
          "tr.grupo_id IS NOT NULL",
          "tr.grupo_id != ''",
          "ppc.grupo IS NOT NULL",
          "ppc.grupo != ''"
        ];
        
        if (rota_id) {
          whereConditions.push("r.id = ?");
          params.push(rota_id);
        }

        if (semana_abastecimento) {
          whereConditions.push("n.semana_abastecimento = ?");
          params.push(semana_abastecimento);
        }
        
        tiposRota = await executeQuery(`
          SELECT DISTINCT
            tr.id,
            tr.nome
          FROM foods_db.tipo_rota tr
          INNER JOIN foods_db.rotas r ON r.tipo_rota_id = tr.id
          INNER JOIN foods_db.unidades_escolares ue ON FIND_IN_SET(r.id, ue.rota_id) > 0
          INNER JOIN necessidades n ON n.escola_id = ue.id
          INNER JOIN produtos_per_capita ppc ON n.produto_id = ppc.produto_id
          INNER JOIN foods_db.grupos g ON g.nome COLLATE utf8mb4_unicode_ci = ppc.grupo COLLATE utf8mb4_unicode_ci
          WHERE ${whereConditions.join(' AND ')}
            -- Validar se o grupo existe no grupo_id do tipo_rota
            AND FIND_IN_SET(g.id, tr.grupo_id) > 0
          ORDER BY tr.nome ASC
        `, params);
      }

      res.json({
        success: true,
        data: tiposRota
      });
    } catch (error) {
      console.error('Erro ao buscar tipos de rota disponíveis:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar tipos de rota disponíveis'
      });
    }
  }

  /**
   * Buscar rotas disponíveis
   * Busca rotas que têm escolas vinculadas nas necessidades
   * E que têm grupos vinculados que existem nas necessidades
   * Suporta duas abas:
   * - nutricionista: busca rotas com escolas em necessidades (status CONF)
   * - coordenacao: busca rotas com escolas em necessidades_substituicoes (status conf log)
   */
  static async buscarRotasDisponiveis(req, res) {
    try {
      const { aba, tipo_rota_id, semana_abastecimento } = req.query;
      
      let rotas;
      let params = [];
      let whereConditions = [];
      
      if (aba === 'coordenacao') {
        // Buscar rotas que:
        // 1. Têm escolas na tabela necessidades_substituicoes com status conf log
        // 2. Têm grupos vinculados que existem nas necessidades_substituicoes
        // 3. Se tipo_rota_id for fornecido, mostrar apenas rotas vinculadas a esse tipo
        // 4. Se semana_abastecimento for fornecido, filtrar por essa semana
        whereConditions = [
          "r.status = 'ativo'",
          "ue.status = 'ativo'",
          "ns.ativo = 1",
          "ns.status = 'conf log'",
          "ue.rota_id IS NOT NULL",
          "ue.rota_id != ''",
          "tr.grupo_id IS NOT NULL",
          "tr.grupo_id != ''",
          "ns.grupo IS NOT NULL",
          "ns.grupo != ''"
        ];
        
        if (tipo_rota_id) {
          whereConditions.push("tr.id = ?");
          params.push(tipo_rota_id);
        }

        if (semana_abastecimento) {
          whereConditions.push("ns.semana_abastecimento = ?");
          params.push(semana_abastecimento);
        }
        
        rotas = await executeQuery(`
          SELECT DISTINCT
            r.id,
            r.nome
          FROM foods_db.rotas r
          INNER JOIN foods_db.unidades_escolares ue ON FIND_IN_SET(r.id, ue.rota_id) > 0
          INNER JOIN necessidades_substituicoes ns ON ns.escola_id = ue.id
          INNER JOIN foods_db.grupos g ON g.nome COLLATE utf8mb4_unicode_ci = ns.grupo COLLATE utf8mb4_unicode_ci
          INNER JOIN foods_db.tipo_rota tr ON r.tipo_rota_id = tr.id
          WHERE ${whereConditions.join(' AND ')}
            -- Validar se o grupo existe no grupo_id do tipo_rota
            AND FIND_IN_SET(g.id, tr.grupo_id) > 0
          ORDER BY r.nome ASC
        `, params);
      } else {
        // Buscar rotas que:
        // 1. Têm escolas na tabela necessidades com status CONF (padrão: nutricionista)
        // 2. Têm grupos vinculados que existem nas necessidades
        // 3. Se tipo_rota_id for fornecido, mostrar apenas rotas vinculadas a esse tipo
        // 4. Se semana_abastecimento for fornecido, filtrar por essa semana
        whereConditions = [
          "r.status = 'ativo'",
          "ue.status = 'ativo'",
          "n.status = 'CONF'",
          "(n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)",
          "ue.rota_id IS NOT NULL",
          "ue.rota_id != ''",
          "tr.grupo_id IS NOT NULL",
          "tr.grupo_id != ''",
          "ppc.grupo IS NOT NULL",
          "ppc.grupo != ''"
        ];
        
        if (tipo_rota_id) {
          whereConditions.push("tr.id = ?");
          params.push(tipo_rota_id);
        }

        if (semana_abastecimento) {
          whereConditions.push("n.semana_abastecimento = ?");
          params.push(semana_abastecimento);
        }
        
        rotas = await executeQuery(`
          SELECT DISTINCT
            r.id,
            r.nome
          FROM foods_db.rotas r
          INNER JOIN foods_db.unidades_escolares ue ON FIND_IN_SET(r.id, ue.rota_id) > 0
          INNER JOIN necessidades n ON n.escola_id = ue.id
          INNER JOIN produtos_per_capita ppc ON n.produto_id = ppc.produto_id
          INNER JOIN foods_db.grupos g ON g.nome COLLATE utf8mb4_unicode_ci = ppc.grupo COLLATE utf8mb4_unicode_ci
          INNER JOIN foods_db.tipo_rota tr ON r.tipo_rota_id = tr.id
          WHERE ${whereConditions.join(' AND ')}
            -- Validar se o grupo existe no grupo_id do tipo_rota
            AND FIND_IN_SET(g.id, tr.grupo_id) > 0
          ORDER BY r.nome ASC
        `, params);
      }

      res.json({
        success: true,
        data: rotas
      });
    } catch (error) {
      console.error('Erro ao buscar rotas disponíveis:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar rotas disponíveis'
      });
    }
  }

  /**
   * Buscar grupos disponíveis para substituição
   * Suporta duas abas:
   * - nutricionista: busca de necessidades com status CONF
   * - coordenacao: busca de necessidades_substituicoes com status conf log
   * Se tipo_rota_id for fornecido, mostra apenas grupos vinculados a esse tipo de rota
   */
  static async buscarGruposDisponiveisParaSubstituicao(req, res) {
    try {
      const { aba, tipo_rota_id, semana_abastecimento } = req.query;
      
      let grupos;
      let params = [];
      let whereConditions = [];
      
      if (aba === 'coordenacao') {
        if (tipo_rota_id) {
          // Buscar grupos que:
          // 1. Estão vinculados ao tipo_rota_id (no grupo_id do tipo_rota)
          // 2. Existem na tabela necessidades_substituicoes com status conf log
          // 3. Se semana_abastecimento for fornecido, filtrar por essa semana
          whereConditions = [
            "ns.ativo = 1",
            "ns.status = 'conf log'",
            "ns.grupo IS NOT NULL",
            "ns.grupo != ''",
            "tr.grupo_id IS NOT NULL",
            "tr.grupo_id != ''"
          ];
          params = [tipo_rota_id];

          if (semana_abastecimento) {
            whereConditions.push("ns.semana_abastecimento = ?");
            params.push(semana_abastecimento);
          }

          grupos = await executeQuery(`
            SELECT DISTINCT 
              ns.grupo as id,
              ns.grupo as nome
            FROM necessidades_substituicoes ns
            INNER JOIN foods_db.grupos g ON g.nome COLLATE utf8mb4_unicode_ci = ns.grupo COLLATE utf8mb4_unicode_ci
            INNER JOIN foods_db.tipo_rota tr ON tr.id = ?
            WHERE ${whereConditions.join(' AND ')}
              -- Validar se o grupo existe no grupo_id do tipo_rota
              AND FIND_IN_SET(g.id, tr.grupo_id) > 0
            ORDER BY ns.grupo
          `, params);
        } else {
          // Buscar grupos da tabela necessidades_substituicoes com status conf log
          // Se semana_abastecimento for fornecido, filtrar por essa semana
          whereConditions = [
            "ns.ativo = 1",
            "ns.status = 'conf log'",
            "ns.grupo IS NOT NULL",
            "ns.grupo != ''"
          ];
          params = [];

          if (semana_abastecimento) {
            whereConditions.push("ns.semana_abastecimento = ?");
            params.push(semana_abastecimento);
          }

          grupos = await executeQuery(`
            SELECT DISTINCT 
              ns.grupo as id,
              ns.grupo as nome
            FROM necessidades_substituicoes ns
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY ns.grupo
          `, params);
        }
      } else {
        // Aba nutricionista: buscar diretamente na tabela necessidades (status CONF)
        const baseConditions = [
          "n.status = 'CONF'",
          "(n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)",
          "n.grupo IS NOT NULL",
          "n.grupo != ''"
        ];
        params = [];

        if (semana_abastecimento) {
          baseConditions.push("n.semana_abastecimento = ?");
          params.push(semana_abastecimento);
        }

        if (tipo_rota_id) {
          // Filtrar por tipo de rota utilizando unidades_escolares e rotas do Foods
          baseConditions.push(`
            n.escola_id IN (
              SELECT DISTINCT ue.id
              FROM foods_db.unidades_escolares ue
              INNER JOIN foods_db.rotas r ON FIND_IN_SET(r.id, ue.rota_id) > 0
              WHERE r.tipo_rota_id = ?
                AND ue.status = 'ativo'
                AND ue.rota_id IS NOT NULL
                AND ue.rota_id != ''
            )
          `);
          params.push(tipo_rota_id);
        }

        const whereClause = baseConditions.join(' AND ');


        grupos = await executeQuery(`
          SELECT DISTINCT 
            n.grupo AS id,
            n.grupo AS nome
          FROM necessidades n
          WHERE ${whereClause}
          ORDER BY n.grupo
        `, params);

      }

      res.json({
        success: true,
        data: grupos
      });
    } catch (error) {
      console.error('Erro ao buscar grupos disponíveis para substituição:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar grupos disponíveis'
      });
    }
  }

  /**
   * Buscar semanas de abastecimento disponíveis para substituição
   * Para nutricionista: busca de necessidades com status CONF
   * Para coordenação: busca de necessidades_substituicoes com status conf log
   */
  static async buscarSemanasAbastecimentoDisponiveisParaSubstituicao(req, res) {
    try {
      const { aba } = req.query; // 'nutricionista' ou 'coordenacao'
      
      let semanas;
      
      if (aba === 'coordenacao') {
        // Buscar semanas da tabela necessidades_substituicoes com status 'conf log'
        semanas = await executeQuery(`
          SELECT DISTINCT 
            ns.semana_abastecimento
          FROM necessidades_substituicoes ns
          WHERE ns.ativo = 1 
            AND ns.status = 'conf log'
            AND ns.semana_abastecimento IS NOT NULL 
            AND ns.semana_abastecimento != ''
          ORDER BY ns.semana_abastecimento DESC
        `);
      } else {
        // Buscar semanas da tabela necessidades com status 'CONF' (padrão: nutricionista)
        semanas = await executeQuery(`
          SELECT DISTINCT 
            n.semana_abastecimento
          FROM necessidades n
          WHERE n.status = 'CONF'
            AND (n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)
            AND n.semana_abastecimento IS NOT NULL 
            AND n.semana_abastecimento != ''
          ORDER BY n.semana_abastecimento DESC
        `);
      }

      res.json({
        success: true,
        data: semanas.map(s => ({
          semana_abastecimento: s.semana_abastecimento
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar semanas de abastecimento disponíveis para substituição:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar semanas de abastecimento disponíveis'
      });
    }
  }
}

module.exports = SubstituicoesListController;
