/**
 * Controller de Busca de Ajudantes
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');

class AjudantesSearchController {
  // Buscar ajudantes ativos
  static async buscarAjudantesAtivos(req, res) {
    try {
      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, 
          a.status, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.status = 'ativo'
        ORDER BY a.nome ASC
      `;

      const ajudantes = await executeQuery(query);

      res.json({
        success: true,
        data: ajudantes
      });

    } catch (error) {
      console.error('Erro ao buscar ajudantes ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os ajudantes ativos'
      });
    }
  }

  // Buscar ajudantes por filial
  static async buscarAjudantesPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, 
          a.status, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.filial_id = ? AND a.status = 'ativo'
        ORDER BY a.nome ASC
      `;

      const ajudantes = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: ajudantes
      });

    } catch (error) {
      console.error('Erro ao buscar ajudantes por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os ajudantes por filial'
      });
    }
  }

  // Buscar ajudantes por status
  static async buscarAjudantesPorStatus(req, res) {
    try {
      const { status } = req.params;

      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, 
          a.status, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.status = ?
        ORDER BY a.nome ASC
      `;

      const ajudantes = await executeQuery(query, [status]);

      res.json({
        success: true,
        data: ajudantes
      });

    } catch (error) {
      console.error('Erro ao buscar ajudantes por status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os ajudantes por status'
      });
    }
  }

  // Listar status disponíveis
  static async listarStatus(req, res) {
    try {
      const query = `
        SELECT DISTINCT status 
        FROM ajudantes 
        WHERE status IS NOT NULL AND status != ''
        ORDER BY status ASC
      `;

      const status = await executeQuery(query);

      res.json({
        success: true,
        data: status.map(item => item.status)
      });

    } catch (error) {
      console.error('Erro ao listar status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os status'
      });
    }
  }
}

module.exports = AjudantesSearchController;
