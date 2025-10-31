/**
 * Controller de Busca de Rotas
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');

class RotasSearchController {
  // Buscar rotas ativas
  static async buscarRotasAtivas(req, res) {
    try {
      const query = `
        SELECT 
          r.id, r.codigo, r.nome, r.frequencia_entrega, r.status, r.filial_id,
          f.filial as filial_nome
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query);

      // Buscar total de unidades para cada rota
      const rotasComUnidades = await Promise.all(
        rotas.map(async (rota) => {
          try {
            const unidadesQuery = `
              SELECT COUNT(*) as total_unidades 
              FROM unidades_escolares 
              WHERE rota_id = ? AND status = 'ativo'
            `;
            const unidadesResult = await executeQuery(unidadesQuery, [rota.id]);
            return {
              ...rota,
              total_unidades: unidadesResult[0]?.total_unidades || 0
            };
          } catch (error) {
            console.error(`Erro ao buscar unidades para rota ${rota.id}:`, error);
            return {
              ...rota,
              total_unidades: 0
            };
          }
        })
      );

      res.json({
        success: true,
        data: rotasComUnidades
      });

    } catch (error) {
      console.error('Erro ao buscar rotas ativas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as rotas ativas'
      });
    }
  }

  // Buscar rotas por filial
  static async buscarRotasPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          r.id, r.codigo, r.nome, r.frequencia_entrega, r.status, r.filial_id,
          f.filial as filial_nome
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.filial_id = ? AND r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query, [filialId]);

      // Buscar total de unidades para cada rota
      const rotasComUnidades = await Promise.all(
        rotas.map(async (rota) => {
          try {
            const unidadesQuery = `
              SELECT COUNT(*) as total_unidades 
              FROM unidades_escolares 
              WHERE rota_id = ? AND status = 'ativo'
            `;
            const unidadesResult = await executeQuery(unidadesQuery, [rota.id]);
            return {
              ...rota,
              total_unidades: unidadesResult[0]?.total_unidades || 0
            };
          } catch (error) {
            console.error(`Erro ao buscar unidades para rota ${rota.id}:`, error);
            return {
              ...rota,
              total_unidades: 0
            };
          }
        })
      );

      res.json({
        success: true,
        data: rotasComUnidades
      });

    } catch (error) {
      console.error('Erro ao buscar rotas por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as rotas por filial'
      });
    }
  }

  // Buscar rotas por tipo
  static async buscarRotasPorTipo(req, res) {
    try {
      const { tipo } = req.params;

      const query = `
        SELECT 
          r.id, r.codigo, r.nome, r.frequencia_entrega, r.status, r.filial_id,
          f.filial as filial_nome
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.frequencia_entrega = ? AND r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query, [tipo]);

      // Buscar total de unidades para cada rota
      const rotasComUnidades = await Promise.all(
        rotas.map(async (rota) => {
          try {
            const unidadesQuery = `
              SELECT COUNT(*) as total_unidades 
              FROM unidades_escolares 
              WHERE rota_id = ? AND status = 'ativo'
            `;
            const unidadesResult = await executeQuery(unidadesQuery, [rota.id]);
            return {
              ...rota,
              total_unidades: unidadesResult[0]?.total_unidades || 0
            };
          } catch (error) {
            console.error(`Erro ao buscar unidades para rota ${rota.id}:`, error);
            return {
              ...rota,
              total_unidades: 0
            };
          }
        })
      );

      res.json({
        success: true,
        data: rotasComUnidades
      });

    } catch (error) {
      console.error('Erro ao buscar rotas por frequência:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as rotas por frequência'
      });
    }
  }

  // Listar tipos de rota
  static async listarTiposRota(req, res) {
    try {
      const query = `
        SELECT DISTINCT frequencia_entrega 
        FROM rotas 
        WHERE frequencia_entrega IS NOT NULL AND frequencia_entrega != ''
        ORDER BY frequencia_entrega ASC
      `;

      const tipos = await executeQuery(query);

      res.json({
        success: true,
        data: tipos.map(item => item.frequencia_entrega)
      });

    } catch (error) {
      console.error('Erro ao listar frequências de entrega:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as frequências de entrega'
      });
    }
  }

  // Buscar unidades escolares de uma rota
  static async buscarUnidadesEscolaresRota(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado,
          ue.endereco, ue.ordem_entrega, ue.status
        FROM unidades_escolares ue
        WHERE ue.rota_id = ? AND ue.status = 'ativo'
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, [id]);

      res.json({
        success: true,
        data: {
          unidades: unidades,
          total: unidades.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares da rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares da rota'
      });
    }
  }
}

module.exports = RotasSearchController;
