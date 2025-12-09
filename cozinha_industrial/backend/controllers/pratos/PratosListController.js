const { executeQuery } = require('../../config/database');
const { successResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller para listagem de Pratos
 * Segue padrão de excelência do sistema
 */
class PratosListController {
  /**
   * Listar pratos com filtros e paginação
   */
  static listar = asyncHandler(async (req, res) => {
    const { 
      search = '', 
      tipo_prato = '',
      filial = '',
      centro_custo = ''
    } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        p.id,
        p.codigo,
        p.nome,
        p.descricao,
        p.tipo_prato_id,
        p.tipo_prato_nome as tipo_prato,
        p.status,
        p.data_cadastro,
        p.data_atualizacao,
        COUNT(DISTINCT pr.receita_id) as total_receitas,
        COUNT(DISTINCT pp.id) as total_produtos
      FROM pratos p
      LEFT JOIN pratos_receitas pr ON p.id = pr.prato_id
      LEFT JOIN produtos_pratos pp ON p.id = pp.prato_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        p.codigo LIKE ? OR 
        p.nome LIKE ? OR 
        p.descricao LIKE ? OR
        EXISTS (
          SELECT 1 FROM pratos_filiais pf 
          WHERE pf.prato_id = p.id 
          AND pf.filial_nome LIKE ?
        ) OR
        EXISTS (
          SELECT 1 FROM pratos_centros_custo pcc 
          WHERE pcc.prato_id = p.id 
          AND pcc.centro_custo_nome LIKE ?
        ) OR
        EXISTS (
          SELECT 1 FROM pratos_receitas pr2 
          WHERE pr2.prato_id = p.id 
          AND pr2.receita_nome LIKE ?
        )
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (tipo_prato) {
      baseQuery += ' AND p.tipo_prato_nome LIKE ?';
      params.push(`%${tipo_prato}%`);
    }

    if (filial) {
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM pratos_filiais pf 
        WHERE pf.prato_id = p.id 
        AND pf.filial_nome LIKE ?
      )`;
      params.push(`%${filial}%`);
    }

    if (centro_custo) {
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM pratos_centros_custo pcc 
        WHERE pcc.prato_id = p.id 
        AND pcc.centro_custo_nome LIKE ?
      )`;
      params.push(`%${centro_custo}%`);
    }

    baseQuery += ' GROUP BY p.id';

    // Ordenação
    const sortBy = req.query.sortBy || 'data_cadastro';
    const sortOrder = req.query.sortOrder || 'DESC';
    const allowedSortFields = ['id', 'codigo', 'nome', 'tipo_prato_nome', 'data_cadastro', 'data_atualizacao'];
    let finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'data_cadastro';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Ajustar campos de ordenação
    if (finalSortBy === 'tipo_prato_nome') {
      finalSortBy = 'p.tipo_prato_nome';
    } else {
      finalSortBy = `p.${finalSortBy}`;
    }
    
    baseQuery += ` ORDER BY ${finalSortBy} ${finalSortOrder}`;

    // Contar total de registros
    const countQuery = baseQuery.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT p.id) as total FROM');
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Aplicar paginação
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

    // Executar query
    const pratos = await executeQuery(query, params);

    // Preparar resposta com paginação (usando formato padronizado)
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(total, '/api/pratos', queryParams);
    
    const response = {
      items: pratos,
      pagination: meta.pagination
    };

    return successResponse(res, response, 'Pratos listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Exportar pratos em JSON
   */
  static exportarJSON = asyncHandler(async (req, res) => {
    const pratos = await executeQuery(
      `SELECT 
        p.id,
        p.codigo,
        p.nome,
        p.descricao,
        p.tipo_prato_nome as tipo_prato,
        p.status,
        p.data_cadastro,
        p.data_atualizacao
      FROM pratos p
      ORDER BY p.data_cadastro DESC`
    );

    // Buscar relacionamentos para cada prato
    for (const prato of pratos) {
      const filiais = await executeQuery(
        'SELECT filial_id as id, filial_nome as nome FROM pratos_filiais WHERE prato_id = ?',
        [prato.id]
      );
      prato.filiais = filiais;

      const centrosCusto = await executeQuery(
        'SELECT centro_custo_id as id, centro_custo_nome as nome, filial_id, filial_nome FROM pratos_centros_custo WHERE prato_id = ?',
        [prato.id]
      );
      prato.centros_custo = centrosCusto;

      const receitas = await executeQuery(
        'SELECT receita_id as id, receita_codigo as codigo, receita_nome as nome FROM pratos_receitas WHERE prato_id = ?',
        [prato.id]
      );
      prato.receitas = receitas;

      const produtos = await executeQuery(
        `SELECT 
          produto_origem_id,
          produto_origem_nome,
          grupo_nome,
          subgrupo_nome,
          classe_nome,
          unidade_medida_sigla,
          centro_custo_nome,
          percapta
        FROM produtos_pratos
        WHERE prato_id = ?`,
        [prato.id]
      );
      prato.produtos = produtos;
    }

    return successResponse(res, pratos, 'Pratos exportados com sucesso', STATUS_CODES.OK);
  });
}

module.exports = PratosListController;

