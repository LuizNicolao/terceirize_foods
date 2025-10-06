const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller para listagem de Produtos Per Capita
 * Segue padrão de excelência do sistema
 */
class ProdutosPerCapitaListController {
  /**
   * Listar produtos per capita com filtros e paginação
   * Segue o padrão dos outros controllers do sistema
   */
  static listar = asyncHandler(async (req, res) => {
    const { 
      search = '', 
      status = 'todos',
      produto_id = ''
    } = req.query;
    const pagination = req.pagination;

    // Query base - usando todos os campos da tabela produtos_per_capita
    let baseQuery = `
      SELECT 
        ppc.id,
        ppc.produto_id,
        ppc.produto_origem_id,
        ppc.produto_nome,
        ppc.produto_codigo,
        ppc.unidade_medida,
        ppc.grupo,
        ppc.subgrupo,
        ppc.classe,
        ppc.per_capita_parcial,
        ppc.per_capita_lanche_manha,
        ppc.per_capita_lanche_tarde,
        ppc.per_capita_almoco,
        ppc.per_capita_eja,
        ppc.descricao,
        ppc.ativo,
        ppc.data_cadastro,
        ppc.data_atualizacao
      FROM produtos_per_capita ppc
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (ppc.descricao LIKE ? OR ppc.produto_nome LIKE ? OR ppc.produto_codigo LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== 'todos') {
      baseQuery += ' AND ppc.ativo = ?';
      params.push(status === 'ativo' ? 1 : 0);
    }

    if (produto_id) {
      baseQuery += ' AND ppc.produto_id = ?';
      params.push(produto_id);
    }

    baseQuery += ' ORDER BY ppc.data_cadastro DESC';

    // Aplicar paginação manualmente (seguindo o padrão das outras páginas)
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const produtos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM produtos_per_capita ppc WHERE 1=1${search ? ' AND (ppc.descricao LIKE ? OR ppc.produto_nome LIKE ? OR ppc.produto_codigo LIKE ?)' : ''}${status !== 'todos' ? ' AND ppc.ativo = ?' : ''}${produto_id ? ' AND ppc.produto_id = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/produtos-per-capita', queryParams);

    // Retornar resposta no formato esperado pelo frontend (compatível com estrutura antiga)
    res.json({
      success: true,
      data: produtos,
      pagination: {
        currentPage: meta.pagination.currentPage,
        totalPages: meta.pagination.totalPages,
        totalItems: meta.pagination.totalItems,
        itemsPerPage: meta.pagination.itemsPerPage,
        hasNextPage: meta.pagination.hasNextPage,
        hasPrevPage: meta.pagination.hasPrevPage
      },
      message: 'Produtos per capita listados com sucesso'
    });
  });

  /**
   * Buscar produtos disponíveis para per capita
   * NOTA: Esta funcionalidade foi desabilitada pois agora produtos vêm do sistema Foods
   * O frontend usa FoodsApiService.getProdutosOrigem() para buscar produtos
   */
  static buscarProdutosDisponiveis = asyncHandler(async (req, res) => {
    // Retornar array vazio pois produtos agora vêm do sistema Foods
    return successResponse(res, [], 'Produtos disponíveis agora vêm do sistema Foods', STATUS_CODES.OK);
  });

  /**
   * Buscar produtos per capita por produtos específicos
   */
  static buscarPorProdutos = asyncHandler(async (req, res) => {
    const { produto_ids } = req.body;

    if (!produto_ids || !Array.isArray(produto_ids) || produto_ids.length === 0) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        message: 'Lista de IDs de produtos é obrigatória'
      });
    }

    const placeholders = produto_ids.map(() => '?').join(',');
    
    const produtos = await executeQuery(
      `SELECT 
        ppc.id,
        ppc.produto_id,
        ppc.produto_origem_id,
        ppc.produto_nome,
        ppc.produto_codigo,
        ppc.unidade_medida,
        ppc.grupo,
        ppc.subgrupo,
        ppc.classe,
        ppc.per_capita_parcial,
        ppc.per_capita_lanche_manha,
        ppc.per_capita_lanche_tarde,
        ppc.per_capita_almoco,
        ppc.per_capita_eja,
        ppc.descricao,
        ppc.ativo,
        ppc.data_cadastro,
        ppc.data_atualizacao
      FROM produtos_per_capita ppc
      WHERE ppc.produto_id IN (${placeholders})
      ORDER BY ppc.produto_nome`,
      produto_ids
    );

    return successResponse(res, produtos, 'Produtos per capita encontrados com sucesso', STATUS_CODES.OK);
  });
}

module.exports = ProdutosPerCapitaListController;