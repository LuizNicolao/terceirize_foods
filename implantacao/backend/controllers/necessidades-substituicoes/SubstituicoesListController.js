const { executeQuery } = require('../../config/database');
const axios = require('axios');

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
          n.produto_id as codigo_origem,
          n.produto as produto_origem_nome,
          n.produto_unidade as produto_origem_unidade,
          COALESCE(ns.produto_generico_id, '') as produto_generico_id,
          COALESCE(ns.produto_generico_codigo, '') as produto_generico_codigo,
          COALESCE(ns.produto_generico_nome, '') as produto_generico_nome,
          COALESCE(ns.produto_generico_unidade, '') as produto_generico_unidade,
          SUM(n.ajuste_conf_coord) as quantidade_total_origem,
          GROUP_CONCAT(DISTINCT n.necessidade_id) as necessidade_ids,
          n.semana_abastecimento,
          n.semana_consumo,
          n.grupo,
          GROUP_CONCAT(
            DISTINCT CONCAT(
              n.id, '|',
              n.escola_id, '|',
              n.escola, '|',
              n.ajuste_conf_coord
            ) SEPARATOR '::'
          ) as escolas_solicitantes
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          ns.produto_origem_id = n.produto_id 
          AND ns.ativo = 1 
          AND (ns.status IS NULL OR ns.status = 'conf')
        )
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY n.produto_id, n.produto, n.produto_unidade, n.semana_abastecimento, n.semana_consumo, n.grupo,
                 COALESCE(ns.produto_generico_id, ''), COALESCE(ns.produto_generico_codigo, ''), 
                 COALESCE(ns.produto_generico_nome, ''), COALESCE(ns.produto_generico_unidade, '')
        ORDER BY n.produto ASC, COALESCE(ns.produto_generico_nome, '') ASC
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

          return {
            ...necessidade,
            escolas,
            substituicoes_existentes: substituicoes.length > 0,
            produto_padrao_id: produtoPadraoId
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

          return {
            ...necessidade,
            produto_padrao_id: produtoPadraoId,
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
            }))
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
      const { aba } = req.query;
      
      let tiposRota;
      
      if (aba === 'coordenacao') {
        // Buscar tipos de rota que:
        // 1. Têm escolas na tabela necessidades_substituicoes com status conf log
        // 2. Têm grupos vinculados (grupo_id) que existem nas necessidades_substituicoes
        tiposRota = await executeQuery(`
          SELECT DISTINCT
            tr.id,
            tr.nome
          FROM foods_db.tipo_rota tr
          INNER JOIN foods_db.rotas r ON r.tipo_rota_id = tr.id
          INNER JOIN foods_db.unidades_escolares ue ON FIND_IN_SET(r.id, ue.rota_id) > 0
          INNER JOIN necessidades_substituicoes ns ON ns.escola_id = ue.id
          INNER JOIN foods_db.grupos g ON g.nome COLLATE utf8mb4_unicode_ci = ns.grupo COLLATE utf8mb4_unicode_ci
          WHERE tr.status = 'ativo'
            AND r.status = 'ativo'
            AND ue.status = 'ativo'
            AND ns.ativo = 1
            AND ns.status = 'conf log'
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
            AND tr.grupo_id IS NOT NULL
            AND tr.grupo_id != ''
            AND ns.grupo IS NOT NULL
            AND ns.grupo != ''
            -- Validar se o grupo existe no grupo_id do tipo_rota
            AND FIND_IN_SET(g.id, tr.grupo_id) > 0
          ORDER BY tr.nome ASC
        `);
      } else {
        // Buscar tipos de rota que:
        // 1. Têm escolas na tabela necessidades com status CONF (padrão: nutricionista)
        // 2. Têm grupos vinculados (grupo_id) que existem nas necessidades
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
          WHERE tr.status = 'ativo'
            AND r.status = 'ativo'
            AND ue.status = 'ativo'
            AND n.status = 'CONF'
            AND (n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
            AND tr.grupo_id IS NOT NULL
            AND tr.grupo_id != ''
            AND ppc.grupo IS NOT NULL
            AND ppc.grupo != ''
            -- Validar se o grupo existe no grupo_id do tipo_rota
            AND FIND_IN_SET(g.id, tr.grupo_id) > 0
          ORDER BY tr.nome ASC
        `);
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
      const { aba } = req.query;
      
      let rotas;
      
      if (aba === 'coordenacao') {
        // Buscar rotas que:
        // 1. Têm escolas na tabela necessidades_substituicoes com status conf log
        // 2. Têm grupos vinculados que existem nas necessidades_substituicoes
        rotas = await executeQuery(`
          SELECT DISTINCT
            r.id,
            r.nome
          FROM foods_db.rotas r
          INNER JOIN foods_db.unidades_escolares ue ON FIND_IN_SET(r.id, ue.rota_id) > 0
          INNER JOIN necessidades_substituicoes ns ON ns.escola_id = ue.id
          INNER JOIN foods_db.grupos g ON g.nome COLLATE utf8mb4_unicode_ci = ns.grupo COLLATE utf8mb4_unicode_ci
          INNER JOIN foods_db.tipo_rota tr ON r.tipo_rota_id = tr.id
          WHERE r.status = 'ativo'
            AND ue.status = 'ativo'
            AND ns.ativo = 1
            AND ns.status = 'conf log'
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
            AND tr.grupo_id IS NOT NULL
            AND tr.grupo_id != ''
            AND ns.grupo IS NOT NULL
            AND ns.grupo != ''
            -- Validar se o grupo existe no grupo_id do tipo_rota
            AND FIND_IN_SET(g.id, tr.grupo_id) > 0
          ORDER BY r.nome ASC
        `);
      } else {
        // Buscar rotas que:
        // 1. Têm escolas na tabela necessidades com status CONF (padrão: nutricionista)
        // 2. Têm grupos vinculados que existem nas necessidades
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
          WHERE r.status = 'ativo'
            AND ue.status = 'ativo'
            AND n.status = 'CONF'
            AND (n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
            AND tr.grupo_id IS NOT NULL
            AND tr.grupo_id != ''
            AND ppc.grupo IS NOT NULL
            AND ppc.grupo != ''
            -- Validar se o grupo existe no grupo_id do tipo_rota
            AND FIND_IN_SET(g.id, tr.grupo_id) > 0
          ORDER BY r.nome ASC
        `);
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
      const { aba, tipo_rota_id } = req.query;
      
      let grupos;
      
      if (aba === 'coordenacao') {
        if (tipo_rota_id) {
          // Buscar grupos que:
          // 1. Estão vinculados ao tipo_rota_id (no grupo_id do tipo_rota)
          // 2. Existem na tabela necessidades_substituicoes com status conf log
          grupos = await executeQuery(`
            SELECT DISTINCT 
              ns.grupo as id,
              ns.grupo as nome
            FROM necessidades_substituicoes ns
            INNER JOIN foods_db.grupos g ON g.nome COLLATE utf8mb4_unicode_ci = ns.grupo COLLATE utf8mb4_unicode_ci
            INNER JOIN foods_db.tipo_rota tr ON tr.id = ?
            WHERE ns.ativo = 1 
              AND ns.status = 'conf log'
              AND ns.grupo IS NOT NULL 
              AND ns.grupo != ''
              AND tr.grupo_id IS NOT NULL
              AND tr.grupo_id != ''
              -- Validar se o grupo existe no grupo_id do tipo_rota
              AND FIND_IN_SET(g.id, tr.grupo_id) > 0
            ORDER BY ns.grupo
          `, [tipo_rota_id]);
        } else {
          // Buscar grupos da tabela necessidades_substituicoes com status conf log
          grupos = await executeQuery(`
            SELECT DISTINCT 
              ns.grupo as id,
              ns.grupo as nome
            FROM necessidades_substituicoes ns
            WHERE ns.ativo = 1 
              AND ns.status = 'conf log'
              AND ns.grupo IS NOT NULL 
              AND ns.grupo != ''
            ORDER BY ns.grupo
          `);
        }
      } else {
        if (tipo_rota_id) {
          // Buscar grupos que:
          // 1. Estão vinculados ao tipo_rota_id (no grupo_id do tipo_rota)
          // 2. Existem na tabela necessidades com status CONF
          grupos = await executeQuery(`
            SELECT DISTINCT 
              ppc.grupo as id,
              ppc.grupo as nome
            FROM produtos_per_capita ppc
            INNER JOIN necessidades n ON n.produto_id = ppc.produto_id
            INNER JOIN foods_db.grupos g ON g.nome COLLATE utf8mb4_unicode_ci = ppc.grupo COLLATE utf8mb4_unicode_ci
            INNER JOIN foods_db.tipo_rota tr ON tr.id = ?
            WHERE ppc.ativo = 1 
              AND ppc.grupo IS NOT NULL 
              AND ppc.grupo != ''
              AND n.status = 'CONF'
              AND (n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)
              AND tr.grupo_id IS NOT NULL
              AND tr.grupo_id != ''
              -- Validar se o grupo existe no grupo_id do tipo_rota
              AND FIND_IN_SET(g.id, tr.grupo_id) > 0
            ORDER BY ppc.grupo
          `, [tipo_rota_id]);
        } else {
          // Buscar grupos da tabela necessidades com status CONF (padrão: nutricionista)
          grupos = await executeQuery(`
            SELECT DISTINCT 
              ppc.grupo as id,
              ppc.grupo as nome
            FROM produtos_per_capita ppc
            INNER JOIN necessidades n ON n.produto_id = ppc.produto_id
            WHERE ppc.ativo = 1 
              AND ppc.grupo IS NOT NULL 
              AND ppc.grupo != ''
              AND n.status = 'CONF'
              AND (n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)
            ORDER BY ppc.grupo
          `);
        }
      }

      res.json({
        success: true,
        data: grupos
      });
    } catch (error) {
      console.error('Erro ao buscar grupos disponíveis para substituição:', error);
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
