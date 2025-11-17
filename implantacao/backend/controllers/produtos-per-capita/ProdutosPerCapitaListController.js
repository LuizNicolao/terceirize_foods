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
      produto_id = '',
      grupo_id = '',
      grupo = ''
    } = req.query;
    // Usar grupo_id se fornecido, caso contrário usar grupo (compatibilidade)
    const grupoFiltro = grupo_id || grupo;
    const pagination = req.pagination;

    // Query base - usando todos os campos da tabela produtos_per_capita
    let queryBase = `
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
        ppc.per_capita_parcial_manha,
        ppc.per_capita_parcial_tarde,
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
      queryBase += ' AND (';
      queryBase += `ppc.produto_nome LIKE ? OR `;
      queryBase += `ppc.produto_codigo LIKE ? OR `;
      queryBase += `ppc.grupo LIKE ? OR `;
      queryBase += `ppc.subgrupo LIKE ? OR `;
      queryBase += `ppc.classe LIKE ? OR `;
      queryBase += `ppc.unidade_medida LIKE ?`;
      queryBase += ')';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== 'todos') {
      queryBase += ' AND ppc.ativo = ?';
      params.push(status === 'ativo' ? 1 : 0);
    }

    if (produto_id) {
      queryBase += ' AND ppc.produto_id = ?';
      params.push(produto_id);
    }

    if (grupoFiltro) {
      queryBase += ' AND ppc.grupo = ?';
      params.push(grupoFiltro);
    }

    queryBase += ' ORDER BY ppc.data_cadastro DESC';

    // Aplicar paginação manualmente (seguindo o padrão das outras páginas)
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${queryBase} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const produtos = await executeQuery(query, params);

    // Contar total de registros (usando a mesma estrutura de filtros)
    let countQuery = `SELECT COUNT(*) as total FROM produtos_per_capita ppc WHERE 1=1`;
    let countParams = [];

    // Aplicar os mesmos filtros da query principal
    if (search) {
      countQuery += ' AND (';
      countQuery += `ppc.produto_nome LIKE ? OR `;
      countQuery += `ppc.produto_codigo LIKE ? OR `;
      countQuery += `ppc.grupo LIKE ? OR `;
      countQuery += `ppc.subgrupo LIKE ? OR `;
      countQuery += `ppc.classe LIKE ? OR `;
      countQuery += `ppc.unidade_medida LIKE ?`;
      countQuery += ')';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== 'todos') {
      countQuery += ' AND ppc.ativo = ?';
      countParams.push(status === 'ativo' ? 1 : 0);
    }

    if (produto_id) {
      countQuery += ' AND ppc.produto_id = ?';
      countParams.push(produto_id);
    }

    if (grupoFiltro) {
      countQuery += ' AND ppc.grupo = ?';
      countParams.push(grupoFiltro);
    }

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
   * Retorna produtos do Foods que NÃO têm percapita cadastrado
   */
  static buscarProdutosDisponiveis = asyncHandler(async (req, res) => {
    try {
      // Buscar IDs de produtos que já têm percapita cadastrado
      const produtosComPercapita = await executeQuery(
        'SELECT DISTINCT produto_id FROM produtos_per_capita WHERE ativo = 1'
      );
      
      const idsComPercapita = produtosComPercapita.map(p => p.produto_id);
      
      // Se não há produtos com percapita, retornar todos os produtos do Foods
      if (idsComPercapita.length === 0) {
        return successResponse(res, [], 'Todos os produtos estão disponíveis', STATUS_CODES.OK);
      }
      
      // Retornar os IDs que NÃO têm percapita para o frontend filtrar
      return successResponse(res, {
        produtos_com_percapita: idsComPercapita,
        message: 'IDs de produtos com percapita cadastrado'
      }, 'Produtos com percapita identificados', STATUS_CODES.OK);
    } catch (error) {
      console.error('Erro ao buscar produtos disponíveis:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar produtos disponíveis'
      });
    }
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
        ppc.per_capita_parcial_manha,
        ppc.per_capita_parcial_tarde,
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

  /**
   * Buscar grupos que têm produtos cadastrados em Produtos Per Capita
   */
  static buscarGruposComPercapita = asyncHandler(async (req, res) => {
    const grupos = await executeQuery(`
      SELECT DISTINCT 
        ppc.grupo as id,
        ppc.grupo as nome
      FROM produtos_per_capita ppc
      WHERE ppc.ativo = 1 AND ppc.grupo IS NOT NULL AND ppc.grupo != ''
      ORDER BY ppc.grupo
    `);

    return successResponse(res, grupos, 'Grupos com per capita encontrados com sucesso', STATUS_CODES.OK);
  });
}

module.exports = ProdutosPerCapitaListController;