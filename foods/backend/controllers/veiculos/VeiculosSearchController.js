/**
 * Controller de Busca de Veículos
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');

class VeiculosSearchController {
  // Buscar veículos ativos
  static async buscarVeiculosAtivos(req, res) {
    try {
      const query = `
        SELECT 
          v.id, v.placa, v.modelo, v.marca, v.tipo_veiculo, v.categoria,
          v.status, v.filial_id, v.motorista_id,
          f.filial as filial_nome,
          m.nome as motorista_nome
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        LEFT JOIN motoristas m ON v.motorista_id = m.id
        WHERE v.status = 'ativo'
        ORDER BY v.placa ASC
      `;

      const veiculos = await executeQuery(query);

      res.json({
        success: true,
        data: veiculos
      });

    } catch (error) {
      console.error('Erro ao buscar veículos ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os veículos ativos'
      });
    }
  }

  // Buscar veículos por filial
  static async buscarVeiculosPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          v.id, v.placa, v.modelo, v.marca, v.tipo_veiculo, v.categoria,
          v.status, v.filial_id, v.motorista_id,
          f.filial as filial_nome,
          m.nome as motorista_nome
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        LEFT JOIN motoristas m ON v.motorista_id = m.id
        WHERE v.filial_id = ? AND v.status = 'ativo'
        ORDER BY v.placa ASC
      `;

      const veiculos = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: veiculos
      });

    } catch (error) {
      console.error('Erro ao buscar veículos por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os veículos por filial'
      });
    }
  }

  // Buscar veículos por tipo
  static async buscarVeiculosPorTipo(req, res) {
    try {
      const { tipo } = req.params;

      const query = `
        SELECT 
          v.id, v.placa, v.modelo, v.marca, v.tipo_veiculo, v.categoria,
          v.status, v.filial_id, v.motorista_id,
          f.filial as filial_nome,
          m.nome as motorista_nome
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        LEFT JOIN motoristas m ON v.motorista_id = m.id
        WHERE v.tipo_veiculo = ?
        ORDER BY v.placa ASC
      `;

      const veiculos = await executeQuery(query, [tipo]);

      res.json({
        success: true,
        data: veiculos
      });

    } catch (error) {
      console.error('Erro ao buscar veículos por tipo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os veículos por tipo'
      });
    }
  }

  // Listar tipos de veículos
  static async listarTiposVeiculos(req, res) {
    try {
      const query = `
        SELECT DISTINCT tipo_veiculo 
        FROM veiculos 
        WHERE tipo_veiculo IS NOT NULL AND tipo_veiculo != ''
        ORDER BY tipo_veiculo ASC
      `;

      const tipos = await executeQuery(query);

      res.json({
        success: true,
        data: tipos.map(item => item.tipo_veiculo)
      });

    } catch (error) {
      console.error('Erro ao listar tipos de veículos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os tipos de veículos'
      });
    }
  }

  // Listar categorias de veículos
  static async listarCategoriasVeiculos(req, res) {
    try {
      const query = `
        SELECT DISTINCT categoria 
        FROM veiculos 
        WHERE categoria IS NOT NULL AND categoria != ''
        ORDER BY categoria ASC
      `;

      const categorias = await executeQuery(query);

      res.json({
        success: true,
        data: categorias.map(item => item.categoria)
      });

    } catch (error) {
      console.error('Erro ao listar categorias de veículos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as categorias de veículos'
      });
    }
  }
}

module.exports = VeiculosSearchController;
