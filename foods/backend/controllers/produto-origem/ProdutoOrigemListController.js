/**
 * Controller de Listagem de Produto Origem
 * Responsável por operações de busca e listagem
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutoOrigemListController {
  
  /**
   * Listar produtos origem com paginação e busca
   */
  static listarProdutosOrigem = asyncHandler(async (req, res) => {
    const { search, status, grupo_id, subgrupo_id, classe_id, page = 1, limit = 10 } = req.query;
    
    let baseQuery = `
      SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        ngp.nome as produto_generico_padrao_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN nome_generico_produto ngp ON po.produto_generico_padrao_id = ngp.id
      LEFT JOIN usuarios uc ON po.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON po.usuario_atualizador_id = ua.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (po.codigo LIKE ? OR po.nome LIKE ? OR po.referencia_mercado LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND po.status = ?';
      params.push(parseInt(status));
    }

    if (grupo_id) {
      baseQuery += ' AND po.grupo_id = ?';
      params.push(parseInt(grupo_id));
    }

    if (subgrupo_id) {
      baseQuery += ' AND po.subgrupo_id = ?';
      params.push(parseInt(subgrupo_id));
    }

    if (classe_id) {
      baseQuery += ' AND po.classe_id = ?';
      params.push(parseInt(classe_id));
    }

    baseQuery += ' ORDER BY po.nome ASC';

    // Aplicar paginação
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
    
    // Executar query paginada
    const produtosOrigem = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM produto_origem po
      WHERE 1=1${search ? ' AND (po.codigo LIKE ? OR po.nome LIKE ? OR po.referencia_mercado LIKE ?)' : ''}${status !== undefined && status !== '' ? ' AND po.status = ?' : ''}${grupo_id ? ' AND po.grupo_id = ?' : ''}${subgrupo_id ? ' AND po.subgrupo_id = ?' : ''}${classe_id ? ' AND po.classe_id = ?' : ''}
    `;
    const countParams = [...params.slice(0, search ? 3 : 0), ...params.slice(search ? 3 : 0)];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inativos
      FROM produto_origem
    `;
    const stats = await executeQuery(statsQuery);

    res.json({
      success: true,
      data: produtosOrigem,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      },
      statistics: stats[0]
    });
  });

  /**
   * Buscar produto origem por ID
   */
  static buscarProdutoOrigemPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const produtoOrigem = await executeQuery(
      `SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        ngp.nome as produto_generico_padrao_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN nome_generico_produto ngp ON po.produto_generico_padrao_id = ngp.id
      LEFT JOIN usuarios uc ON po.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON po.usuario_atualizador_id = ua.id
      WHERE po.id = ?`,
      [id]
    );

    if (produtoOrigem.length === 0) {
      return notFoundResponse(res, 'Produto origem não encontrado');
    }

    successResponse(res, 'Produto origem encontrado', produtoOrigem[0]);
  });

  /**
   * Buscar produtos origem por grupo
   */
  static buscarProdutosOrigemPorGrupo = asyncHandler(async (req, res) => {
    const { grupo_id } = req.params;

    const produtosOrigem = await executeQuery(
      `SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        ngp.nome as produto_generico_padrao_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN nome_generico_produto ngp ON po.produto_generico_padrao_id = ngp.id
      WHERE po.grupo_id = ? AND po.status = 1
      ORDER BY po.nome ASC`,
      [grupo_id]
    );

    successResponse(res, 'Produtos origem encontrados', produtosOrigem);
  });

  /**
   * Buscar produtos origem por subgrupo
   */
  static buscarProdutosOrigemPorSubgrupo = asyncHandler(async (req, res) => {
    const { subgrupo_id } = req.params;

    const produtosOrigem = await executeQuery(
      `SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        ngp.nome as produto_generico_padrao_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN nome_generico_produto ngp ON po.produto_generico_padrao_id = ngp.id
      WHERE po.subgrupo_id = ? AND po.status = 1
      ORDER BY po.nome ASC`,
      [subgrupo_id]
    );

    successResponse(res, 'Produtos origem encontrados', produtosOrigem);
  });

  /**
   * Buscar produtos origem por classe
   */
  static buscarProdutosOrigemPorClasse = asyncHandler(async (req, res) => {
    const { classe_id } = req.params;

    const produtosOrigem = await executeQuery(
      `SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        ngp.nome as produto_generico_padrao_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN nome_generico_produto ngp ON po.produto_generico_padrao_id = ngp.id
      WHERE po.classe_id = ? AND po.status = 1
      ORDER BY po.nome ASC`,
      [classe_id]
    );

    successResponse(res, 'Produtos origem encontrados', produtosOrigem);
  });

  /**
   * Buscar produtos origem ativos
   */
  static buscarProdutosOrigemAtivos = asyncHandler(async (req, res) => {
    const produtosOrigem = await executeQuery(
      `SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        ngp.nome as produto_generico_padrao_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN nome_generico_produto ngp ON po.produto_generico_padrao_id = ngp.id
      WHERE po.status = 1
      ORDER BY po.nome ASC`
    );

    successResponse(res, 'Produtos origem ativos encontrados', produtosOrigem);
  });

  /**
   * Buscar produto origem por código
   */
  static buscarProdutoOrigemPorCodigo = asyncHandler(async (req, res) => {
    const { codigo } = req.params;

    const produtoOrigem = await executeQuery(
      `SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        ngp.nome as produto_generico_padrao_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN nome_generico_produto ngp ON po.produto_generico_padrao_id = ngp.id
      WHERE po.codigo = ?`,
      [codigo]
    );

    if (produtoOrigem.length === 0) {
      return notFoundResponse(res, 'Produto origem não encontrado');
    }

    successResponse(res, 'Produto origem encontrado', produtoOrigem[0]);
  });

  /**
   * Listar grupos disponíveis
   */
  static listarGrupos = asyncHandler(async (req, res) => {
    const grupos = await executeQuery(
      'SELECT id, nome FROM grupos WHERE status = 1 ORDER BY nome ASC'
    );

    successResponse(res, 'Grupos encontrados', grupos);
  });

  /**
   * Listar subgrupos disponíveis
   */
  static listarSubgrupos = asyncHandler(async (req, res) => {
    const subgrupos = await executeQuery(
      'SELECT id, nome FROM subgrupos WHERE status = 1 ORDER BY nome ASC'
    );

    successResponse(res, 'Subgrupos encontrados', subgrupos);
  });

  /**
   * Listar classes disponíveis
   */
  static listarClasses = asyncHandler(async (req, res) => {
    const classes = await executeQuery(
      'SELECT id, nome FROM classes WHERE status = 1 ORDER BY nome ASC'
    );

    successResponse(res, 'Classes encontradas', classes);
  });

  /**
   * Listar unidades de medida disponíveis
   */
  static listarUnidadesMedida = asyncHandler(async (req, res) => {
    const unidades = await executeQuery(
      'SELECT id, nome FROM unidades_medida WHERE status = 1 ORDER BY nome ASC'
    );

    successResponse(res, 'Unidades de medida encontradas', unidades);
  });

  /**
   * Listar produtos genéricos padrão disponíveis
   */
  static listarProdutosGenericosPadrao = asyncHandler(async (req, res) => {
    const produtosGenericos = await executeQuery(
      'SELECT id, nome FROM nome_generico_produto WHERE status = 1 ORDER BY nome ASC'
    );

    successResponse(res, 'Produtos genéricos padrão encontrados', produtosGenericos);
  });
}

module.exports = ProdutoOrigemListController;
