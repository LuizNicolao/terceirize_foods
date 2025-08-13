/**
 * Controller de Busca de Usuários
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class UsuariosSearchController {
  
  /**
   * Buscar usuários por tipo de acesso
   */
  static buscarPorTipoAcesso = asyncHandler(async (req, res) => {
    const { tipo } = req.params;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, 
        nome, 
        email, 
        nivel_de_acesso, 
        tipo_de_acesso, 
        status, 
        criado_em, 
        atualizado_em 
      FROM usuarios 
      WHERE tipo_de_acesso = ? AND status = 'ativo'
    `;
    
    let params = [tipo];
    baseQuery += ' ORDER BY nome ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const usuarios = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM usuarios WHERE tipo_de_acesso = ? AND status = 'ativo'`;
    const totalResult = await executeQuery(countQuery, [tipo]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/usuarios/tipo/${tipo}`, queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(usuarios, meta.pagination, queryParams);

    return successResponse(res, data, `Usuários do tipo ${tipo} listados com sucesso`, STATUS_CODES.OK, meta);
  });
}

module.exports = UsuariosSearchController;
