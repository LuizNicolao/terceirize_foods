/**
 * Controller de Listagem de Fornecedores
 * Responsável por listar e buscar fornecedores
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class FornecedoresListController {
  
  /**
   * Listar fornecedores com paginação, busca e HATEOAS
   */
  static listarFornecedores = asyncHandler(async (req, res) => {
    const { search = '', status, uf } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, 
        cnpj, 
        razao_social, 
        nome_fantasia, 
        logradouro, 
        numero, 
        cep, 
        bairro, 
        municipio, 
        uf, 
        email, 
        telefone, 
        status, 
        criado_em, 
        atualizado_em 
      FROM fornecedores 
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== undefined) {
      baseQuery += ' AND status = ?';
      params.push(status);
    }

    if (uf) {
      baseQuery += ' AND uf = ?';
      params.push(uf.toUpperCase());
    }

    baseQuery += ' ORDER BY razao_social ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const fornecedores = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM fornecedores WHERE 1=1${search ? ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)' : ''}${status !== undefined ? ' AND status = ?' : ''}${uf ? ' AND uf = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/fornecedores', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(fornecedores, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Fornecedores listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Buscar fornecedor por ID
   */
  static buscarFornecedorPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const fornecedores = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [id]
    );

    if (fornecedores.length === 0) {
      return notFoundResponse(res, 'Fornecedor não encontrado');
    }

    const fornecedor = fornecedores[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(fornecedor);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, fornecedor.id);

    return successResponse(res, data, 'Fornecedor encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões baseada no usuário
    // Por enquanto, retorna permissões básicas
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = FornecedoresListController;
