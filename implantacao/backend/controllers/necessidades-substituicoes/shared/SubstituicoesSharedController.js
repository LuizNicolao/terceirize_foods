/**
 * Controller Compartilhado para Métodos Comuns
 * Métodos utilizados por ambas as abas (Nutricionista e Coordenação)
 */

const { executeQuery } = require('../../../config/database');
const axios = require('axios');

class SubstituicoesSharedController {
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

      let produtosGenericos = [];
      
      if (response.data) {
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
      res.json({
        success: true,
        data: []
      });
    }
  }

  /**
   * Buscar tipos de rota disponíveis
   * Suporta duas abas: nutricionista e coordenacao
   */
  static async buscarTiposRotaDisponiveis(req, res) {
    try {
      const { aba, rota_id, semana_abastecimento } = req.query;
      
      let tiposRota;
      let params = [];
      let whereConditions = [];
      
      if (aba === 'coordenacao') {
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
            AND FIND_IN_SET(g.id, tr.grupo_id) > 0
          ORDER BY tr.nome ASC
        `, params);
      } else {
        // Aba nutricionista
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
   * Suporta duas abas: nutricionista e coordenacao
   */
  static async buscarRotasDisponiveis(req, res) {
    try {
      const { aba, tipo_rota_id, semana_abastecimento } = req.query;
      
      let rotas;
      let params = [];
      let whereConditions = [];
      
      if (aba === 'coordenacao') {
        whereConditions = [
          "r.status = 'ativo'",
          "ue.status = 'ativo'",
          "ns.ativo = 1",
          "(ns.status = 'conf log' OR ns.status = 'impressao')",
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
            AND FIND_IN_SET(g.id, tr.grupo_id) > 0
          ORDER BY r.nome ASC
        `, params);
      } else {
        // Aba nutricionista
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
   * Suporta duas abas: nutricionista e coordenacao
   */
  static async buscarGruposDisponiveisParaSubstituicao(req, res) {
    try {
      const { aba, tipo_rota_id, semana_abastecimento } = req.query;
      
      let grupos;
      let params = [];
      let whereConditions = [];
      
      if (aba === 'coordenacao') {
        if (tipo_rota_id) {
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
              AND FIND_IN_SET(g.id, tr.grupo_id) > 0
            ORDER BY ns.grupo
          `, params);
        } else {
          whereConditions = [
            "ns.ativo = 1",
            "ns.status = 'conf log'",
            "(ns.status IS NULL OR ns.status != 'EXCLUÍDO')",
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
        // Aba nutricionista
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
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar grupos disponíveis'
      });
    }
  }

  /**
   * Buscar semanas de abastecimento disponíveis para substituição
   * Suporta duas abas: nutricionista e coordenacao
   */
  static async buscarSemanasAbastecimentoDisponiveisParaSubstituicao(req, res) {
    try {
      const { aba } = req.query;
      
      let semanas;
      
      if (aba === 'coordenacao') {
        semanas = await executeQuery(`
          SELECT DISTINCT 
            ns.semana_abastecimento
          FROM necessidades_substituicoes ns
          WHERE ns.ativo = 1 
            AND ns.status = 'conf log'
            AND (ns.status IS NULL OR ns.status != 'EXCLUÍDO')
            AND ns.semana_abastecimento IS NOT NULL 
            AND ns.semana_abastecimento != ''
          ORDER BY ns.semana_abastecimento DESC
        `);
      } else {
        // Aba nutricionista
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

module.exports = SubstituicoesSharedController;

