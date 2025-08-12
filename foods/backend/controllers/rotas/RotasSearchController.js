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
          r.id, r.codigo, r.nome, r.distancia_km, r.tipo_rota, 
          r.custo_diario, r.filial_id,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query);

      res.json({
        success: true,
        data: rotas
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
          r.id, r.codigo, r.nome, r.distancia_km, r.tipo_rota, 
          r.custo_diario, r.filial_id,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.filial_id = ? AND r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: rotas
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
          r.id, r.codigo, r.nome, r.distancia_km, r.tipo_rota, 
          r.custo_diario, r.filial_id,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.tipo_rota = ? AND r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query, [tipo]);

      res.json({
        success: true,
        data: rotas
      });

    } catch (error) {
      console.error('Erro ao buscar rotas por tipo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as rotas por tipo'
      });
    }
  }

  // Listar tipos de rota
  static async listarTiposRota(req, res) {
    try {
      const query = `
        SELECT DISTINCT tipo_rota 
        FROM rotas 
        WHERE tipo_rota IS NOT NULL AND tipo_rota != ''
        ORDER BY tipo_rota ASC
      `;

      const tipos = await executeQuery(query);

      res.json({
        success: true,
        data: tipos.map(item => item.tipo_rota)
      });

    } catch (error) {
      console.error('Erro ao listar tipos de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os tipos de rota'
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
