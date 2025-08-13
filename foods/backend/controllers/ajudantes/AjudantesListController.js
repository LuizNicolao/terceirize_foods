/**
 * Controller de Listagem de Ajudantes
 * Responsável por listar e buscar ajudantes
 */

const { executeQuery } = require('../../config/database');

class AjudantesListController {
  // Listar ajudantes com paginação, busca e filtros
  static async listarAjudantes(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        filial_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(a.nome LIKE ? OR a.cpf LIKE ? OR a.email LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('a.status = ?');
        params.push(status);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('a.filial_id = ?');
        params.push(filial_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, a.endereco, 
          a.status, a.data_admissao, a.observacoes, 
          a.criado_em, a.atualizado_em, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY a.nome ASC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      const ajudantes = await executeQuery(query, params);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: ajudantes,
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
          filial_id: filial_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar ajudantes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os ajudantes'
      });
    }
  }

  // Buscar ajudante por ID
  static async buscarAjudantePorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, a.endereco, 
          a.status, a.data_admissao, a.observacoes, 
          a.criado_em, a.atualizado_em, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.id = ?
      `;

      const ajudantes = await executeQuery(query, [id]);

      if (ajudantes.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Ajudante não encontrado',
          message: 'O ajudante especificado não foi encontrado no sistema'
        });
      }

      res.json({
        success: true,
        data: ajudantes[0]
      });

    } catch (error) {
      console.error('Erro ao buscar ajudante:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o ajudante'
      });
    }
  }
}

module.exports = AjudantesListController;
