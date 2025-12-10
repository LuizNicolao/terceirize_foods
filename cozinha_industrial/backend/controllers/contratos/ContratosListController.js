const { executeQuery } = require('../../config/database');
const { successResponse, STATUS_CODES, asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller para listagem de Contratos
 * Segue padrão de excelência do sistema
 */
class ContratosListController {
  /**
   * Listar contratos com filtros e paginação
   */
  static listar = asyncHandler(async (req, res) => {
    const { search, status } = req.query;
    const pagination = req.pagination;

    let baseQuery = `
      SELECT 
        id,
        codigo,
        nome,
        cliente_id,
        cliente_nome,
        filial_id,
        filial_nome,
        centro_custo_id,
        centro_custo_nome,
        status,
        usuario_criador_id,
        usuario_atualizador_id,
        criado_em,
        atualizado_em
      FROM contratos
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        nome LIKE ? OR 
        codigo LIKE ? OR
        cliente_nome LIKE ? OR
        filial_nome LIKE ? OR
        centro_custo_nome LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (status) {
      baseQuery += ` AND status = ?`;
      params.push(status);
    }

    // Ordenação
    const sortBy = req.query.sortBy || 'criado_em';
    const sortOrder = req.query.sortOrder || 'DESC';
    baseQuery += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Contar total de registros
    const countQuery = baseQuery.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Aplicar paginação
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

    // Executar query
    const contratos = await executeQuery(query, params);

    // Buscar contagem de unidades e produtos vinculados para cada contrato
    for (const contrato of contratos) {
      const countUnidades = await executeQuery(
        'SELECT COUNT(*) as total FROM cozinha_industrial_contratos_unidades WHERE contrato_id = ? AND status = "ativo"',
        [contrato.id]
      );
      contrato.total_unidades_vinculadas = countUnidades[0]?.total || 0;

      const countProdutos = await executeQuery(
        'SELECT COUNT(*) as total FROM cozinha_industrial_contratos_produtos WHERE contrato_id = ? AND status = "ativo"',
        [contrato.id]
      );
      contrato.total_produtos_vinculados = countProdutos[0]?.total || 0;
    }

    // Preparar resposta com paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(total, '/api/contratos', queryParams);
    
    const response = {
      items: contratos,
      pagination: meta.pagination
    };

    return successResponse(res, response, 'Contratos listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Exportar contratos em JSON
   */
  static exportarJSON = asyncHandler(async (req, res) => {
    const contratos = await executeQuery(
      `SELECT 
        id,
        codigo,
        nome,
        cliente_id,
        cliente_nome,
        filial_id,
        filial_nome,
        centro_custo_id,
        centro_custo_nome,
        status,
        criado_em,
        atualizado_em
      FROM contratos
      ORDER BY criado_em DESC`
    );

    // Adicionar contagem de unidades e produtos vinculados
    for (const contrato of contratos) {
      const countUnidades = await executeQuery(
        'SELECT COUNT(*) as total FROM cozinha_industrial_contratos_unidades WHERE contrato_id = ? AND status = "ativo"',
        [contrato.id]
      );
      contrato.total_unidades_vinculadas = countUnidades[0]?.total || 0;

      const countProdutos = await executeQuery(
        'SELECT COUNT(*) as total FROM cozinha_industrial_contratos_produtos WHERE contrato_id = ? AND status = "ativo"',
        [contrato.id]
      );
      contrato.total_produtos_vinculados = countProdutos[0]?.total || 0;
    }

    return successResponse(res, contratos, 'Contratos exportados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar unidades vinculadas a um contrato
   */
  static buscarUnidadesVinculadas = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar vínculos
    const vinculos = await executeQuery(
      `SELECT 
        id,
        cozinha_industrial_id,
        unidade_nome,
        status,
        criado_em,
        atualizado_em
      FROM cozinha_industrial_contratos_unidades
      WHERE contrato_id = ?
      ORDER BY criado_em DESC`,
      [id]
    );

    return successResponse(
      res,
      vinculos,
      'Unidades vinculadas encontradas com sucesso',
      STATUS_CODES.OK
    );
  });

  /**
   * Buscar produtos vinculados a um contrato
   */
  static buscarProdutosVinculados = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar vínculos
    const vinculos = await executeQuery(
      `SELECT 
        id,
        produto_comercial_id,
        produto_comercial_nome,
        valor_unitario,
        status,
        criado_em,
        atualizado_em
      FROM cozinha_industrial_contratos_produtos
      WHERE contrato_id = ?
      ORDER BY criado_em DESC`,
      [id]
    );

    return successResponse(
      res,
      vinculos,
      'Produtos vinculados encontrados com sucesso',
      STATUS_CODES.OK
    );
  });
}

module.exports = ContratosListController;

