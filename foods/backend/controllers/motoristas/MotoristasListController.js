/**
 * Controller de Listagem de Motoristas
 * Responsável por listar e buscar motoristas
 */

const { executeQuery } = require('../../config/database');

class MotoristasListController {
  // Listar motoristas com paginação, busca e filtros
  static async listarMotoristas(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        categoria_cnh,
        filial_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(m.nome LIKE ? OR m.cpf LIKE ? OR m.cnh LIKE ? OR m.email LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('m.status = ?');
        params.push(status);
      }

      // Filtro por categoria CNH
      if (categoria_cnh) {
        whereConditions.push('m.categoria_cnh = ?');
        params.push(categoria_cnh);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('m.filial_id = ?');
        params.push(filial_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.endereco, m.status, m.data_admissao, m.observacoes, 
          m.criado_em, m.atualizado_em, m.filial_id, m.cnh_validade,
          f.filial as filial_nome
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY m.nome ASC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      const motoristas = await executeQuery(query, params);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: motoristas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search: search || null,
          status: status !== undefined && status !== '' ? status : null,
          categoria_cnh: categoria_cnh || null,
          filial_id: filial_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar motoristas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os motoristas'
      });
    }
  }

  // Buscar motorista por ID
  static async buscarMotoristaPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.endereco, m.status, m.data_admissao, m.observacoes, 
          m.criado_em, m.atualizado_em, m.filial_id, m.cnh_validade,
          f.filial as filial_nome
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE m.id = ?
      `;

      const motoristas = await executeQuery(query, [id]);

      if (motoristas.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Motorista não encontrado',
          message: 'O motorista especificado não foi encontrado no sistema'
        });
      }

      res.json({
        success: true,
        data: motoristas[0]
      });

    } catch (error) {
      console.error('Erro ao buscar motorista:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o motorista'
      });
    }
  }
}

module.exports = MotoristasListController;
