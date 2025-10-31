/**
 * Controller de Listagem de Tipo de Rota
 * Responsável por listar e buscar tipos de rota
 */

const { executeQuery } = require('../../config/database');

class TipoRotaListController {
  // Listar tipos de rota com paginação, busca e filtros
  static async listarTipoRotas(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        grupo_id,
        filial_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(tr.nome LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('tr.status = ?');
        params.push(status);
      }

      // Filtro por grupo
      if (grupo_id) {
        whereConditions.push('tr.grupo_id = ?');
        params.push(grupo_id);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('tr.filial_id = ?');
        params.push(filial_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          tr.*,
          f.filial as filial_nome,
          g.nome as grupo_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.tipo_rota_id = tr.id AND ue.status = 'ativo') as total_unidades
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY tr.nome ASC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      const tipoRotas = await executeQuery(query, params);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: tipoRotas,
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
          grupo_id: grupo_id || null,
          filial_id: filial_id || null
        }
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

  // Buscar tipo de rota por ID
  static async buscarTipoRotaPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          tr.*,
          f.filial as filial_nome,
          g.nome as grupo_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.tipo_rota_id = tr.id AND ue.status = 'ativo') as total_unidades
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        WHERE tr.id = ?
      `;

      const tipoRotas = await executeQuery(query, [id]);

      if (tipoRotas.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de rota não encontrado',
          message: 'O tipo de rota especificado não foi encontrado no sistema'
        });
      }

      res.json({
        success: true,
        data: tipoRotas[0]
      });

    } catch (error) {
      console.error('Erro ao buscar tipo de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o tipo de rota'
      });
    }
  }
}

module.exports = TipoRotaListController;

