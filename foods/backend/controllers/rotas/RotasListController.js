/**
 * Controller de Listagem de Rotas
 * Responsável por listar e buscar rotas
 */

const { executeQuery } = require('../../config/database');

class RotasListController {
  // Listar rotas com paginação, busca e filtros
  static async listarRotas(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        frequencia_entrega,
        filial_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(r.codigo LIKE ? OR r.nome LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('r.status = ?');
        params.push(status);
      }

      // Filtro por frequência de entrega
      if (frequencia_entrega) {
        whereConditions.push('r.frequencia_entrega = ?');
        params.push(frequencia_entrega);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('r.filial_id = ?');
        params.push(filial_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          r.*,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades,
          (SELECT ordem_entrega FROM unidades_escolares ue WHERE ue.rota_id = r.id LIMIT 1) as ordem_entrega
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY r.codigo ASC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      const rotas = await executeQuery(query, params);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: rotas,
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
          frequencia_entrega: frequencia_entrega || null,
          filial_id: filial_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar rotas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as rotas'
      });
    }
  }

  // Buscar rota por ID
  static async buscarRotaPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          r.*,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades,
          (SELECT ordem_entrega FROM unidades_escolares ue WHERE ue.rota_id = r.id LIMIT 1) as ordem_entrega
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.id = ?
      `;

      const rotas = await executeQuery(query, [id]);

      if (rotas.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Rota não encontrada',
          message: 'A rota especificada não foi encontrada no sistema'
        });
      }

      res.json({
        success: true,
        data: rotas[0]
      });

    } catch (error) {
      console.error('Erro ao buscar rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar a rota'
      });
    }
  }
}

module.exports = RotasListController;
