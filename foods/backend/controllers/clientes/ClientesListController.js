/**
 * Controller de Listagem de Clientes
 * Responsável por listar e buscar clientes
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ClientesListController {
  
  /**
   * Listar clientes com paginação, busca e HATEOAS
   */
  static listarClientes = asyncHandler(async (req, res) => {
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
      FROM clientes 
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
    const clientes = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM clientes WHERE 1=1${search ? ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)' : ''}${status !== undefined ? ' AND status = ?' : ''}${uf ? ' AND uf = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/clientes', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(clientes, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Clientes listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Buscar cliente por ID
   */
  static buscarClientePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const clientes = await executeQuery(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    if (clientes.length === 0) {
      return notFoundResponse(res, 'Cliente não encontrado');
    }

    const cliente = clientes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(cliente);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, cliente.id);

    return successResponse(res, data, 'Cliente encontrado com sucesso', STATUS_CODES.OK, {
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

module.exports = ClientesListController;
