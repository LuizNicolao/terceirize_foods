/**
 * Controller de Busca de Motoristas
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');

class MotoristasSearchController {
  // Buscar motoristas ativos
  static async buscarMotoristasAtivos(req, res) {
    try {
      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.status, m.filial_id, m.cnh_validade,
          f.filial as filial_nome
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE m.status = 'ativo'
        ORDER BY m.nome ASC
      `;

      const motoristas = await executeQuery(query);

      res.json({
        success: true,
        data: motoristas
      });

    } catch (error) {
      console.error('Erro ao buscar motoristas ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os motoristas ativos'
      });
    }
  }

  // Buscar motoristas por filial
  static async buscarMotoristasPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.status, m.filial_id, m.cnh_validade,
          f.filial as filial_nome
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE m.filial_id = ? AND m.status = 'ativo'
        ORDER BY m.nome ASC
      `;

      const motoristas = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: motoristas
      });

    } catch (error) {
      console.error('Erro ao buscar motoristas por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os motoristas por filial'
      });
    }
  }

  // Buscar motoristas por categoria CNH
  static async buscarMotoristasPorCategoriaCnh(req, res) {
    try {
      const { categoria } = req.params;

      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.status, m.filial_id, m.cnh_validade,
          f.filial as filial_nome
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE m.categoria_cnh = ? AND m.status = 'ativo'
        ORDER BY m.nome ASC
      `;

      const motoristas = await executeQuery(query, [categoria]);

      res.json({
        success: true,
        data: motoristas
      });

    } catch (error) {
      console.error('Erro ao buscar motoristas por categoria CNH:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os motoristas por categoria CNH'
      });
    }
  }

  // Listar categorias CNH disponíveis
  static async listarCategoriasCnh(req, res) {
    try {
      const query = `
        SELECT DISTINCT categoria_cnh 
        FROM motoristas 
        WHERE categoria_cnh IS NOT NULL AND categoria_cnh != '' AND status = 'ativo'
        ORDER BY categoria_cnh ASC
      `;

      const categorias = await executeQuery(query);

      res.json({
        success: true,
        data: categorias.map(item => item.categoria_cnh)
      });

    } catch (error) {
      console.error('Erro ao listar categorias CNH:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as categorias CNH'
      });
    }
  }
}

module.exports = MotoristasSearchController;
