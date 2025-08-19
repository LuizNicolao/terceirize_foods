/**
 * Controller de Listagem de Rotas
 * Responsável por listar e buscar rotas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { paginatedResponse } = require('../../middleware/pagination');

class RotasListController {
  // Listar rotas com paginação, busca e filtros
  static listarRotas = asyncHandler(async (req, res) => {
    const { 
      search = '', 
      status,
      tipo_rota,
      filial_id
    } = req.query;

    // Construir query base
    let baseQuery = `
      SELECT 
        r.*,
        f.filial as filial_nome,
        (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades
      FROM rotas r
      LEFT JOIN filiais f ON r.filial_id = f.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (r.codigo LIKE ? OR r.nome LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND r.status = ?';
      params.push(status);
    }

    if (tipo_rota) {
      baseQuery += ' AND r.tipo_rota = ?';
      params.push(tipo_rota);
    }

    if (filial_id) {
      baseQuery += ' AND r.filial_id = ?';
      params.push(filial_id);
    }

    baseQuery += ' ORDER BY r.codigo ASC';

    // Usar a função padronizada de paginação
    const result = await paginatedResponse(req, res, baseQuery, params, '/api/rotas');
    
    // Adicionar informações de filtros aplicados
    const filters = {
      search: search || null,
      status: status !== undefined && status !== '' ? status : null,
      tipo_rota: tipo_rota || null,
      filial_id: filial_id || null
    };

    return successResponse(res, result.data, 'Rotas listadas com sucesso', STATUS_CODES.OK, {
      ...result.meta,
      filters
    });
  });

  // Buscar rota por ID
  static async buscarRotaPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          r.*,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades
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
