/**
 * Controller de Listagem de Produto Genérico
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

class ProdutoGenericoListController {
  
  /**
   * Listar produtos genéricos com paginação e busca
   */
  static listarProdutosGenericos = asyncHandler(async (req, res) => {
    const { search, status, grupo_id, subgrupo_id, classe_id, produto_origem_id, produto_padrao, page = 1, limit = 10 } = req.query;
    
    let baseQuery = `
      SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        po.codigo as produto_origem_codigo,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN usuarios uc ON pg.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON pg.usuario_atualizador_id = ua.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (pg.codigo LIKE ? OR pg.nome LIKE ? OR pg.referencia_mercado LIKE ? OR pg.referencia_interna LIKE ? OR pg.referencia_externa LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND pg.status = ?';
      params.push(parseInt(status));
    }

    if (grupo_id) {
      baseQuery += ' AND pg.grupo_id = ?';
      params.push(parseInt(grupo_id));
    }

    if (subgrupo_id) {
      baseQuery += ' AND pg.subgrupo_id = ?';
      params.push(parseInt(subgrupo_id));
    }

    if (classe_id) {
      baseQuery += ' AND pg.classe_id = ?';
      params.push(parseInt(classe_id));
    }

    if (produto_origem_id) {
      baseQuery += ' AND pg.produto_origem_id = ?';
      params.push(parseInt(produto_origem_id));
    }

    if (produto_padrao) {
      baseQuery += ' AND pg.produto_padrao = ?';
      params.push(produto_padrao);
    }

    baseQuery += ' GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, po.codigo, g.nome, sg.nome, c.nome, um.nome, uc.nome, ua.nome ORDER BY pg.nome ASC';

    // Aplicar paginação
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
    
    // Executar query paginada
    const produtosGenericos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `
      SELECT COUNT(DISTINCT pg.id) as total 
      FROM produto_generico pg
      WHERE 1=1${search ? ' AND (pg.codigo LIKE ? OR pg.nome LIKE ? OR pg.referencia_mercado LIKE ? OR pg.referencia_interna LIKE ? OR pg.referencia_externa LIKE ?)' : ''}${status !== undefined && status !== '' ? ' AND pg.status = ?' : ''}${grupo_id ? ' AND pg.grupo_id = ?' : ''}${subgrupo_id ? ' AND pg.subgrupo_id = ?' : ''}${classe_id ? ' AND pg.classe_id = ?' : ''}${produto_origem_id ? ' AND pg.produto_origem_id = ?' : ''}${produto_padrao ? ' AND pg.produto_padrao = ?' : ''}
    `;
    const countParams = [...params.slice(0, search ? 5 : 0), ...params.slice(search ? 5 : 0)];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inativos,
        SUM(CASE WHEN produto_padrao = 'Sim' THEN 1 ELSE 0 END) as produtos_padrao,
        SUM(CASE WHEN produto_origem_id IS NOT NULL AND produto_origem_id > 0 THEN 1 ELSE 0 END) as com_produto_origem,
        (SELECT COUNT(*) FROM produtos WHERE nome_generico_id IS NOT NULL AND status = 1) as total_produtos_vinculados
      FROM produto_generico
    `;
    
    console.log('Query de estatísticas:', statsQuery);
    const stats = await executeQuery(statsQuery);
    
    console.log('Estatísticas calculadas:', stats[0]);

    const response = {
      success: true,
      data: produtosGenericos,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      },
      statistics: stats[0]
    };
    
    console.log('Resposta final:', response);
    res.json(response);
  });

  /**
   * Buscar produto genérico por ID
   */
  static buscarProdutoGenericoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const produtoGenerico = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        po.codigo as produto_origem_codigo,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN usuarios uc ON pg.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON pg.usuario_atualizador_id = ua.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.id = ?
      GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, po.codigo, g.nome, sg.nome, c.nome, um.nome, uc.nome, ua.nome`,
      [id]
    );

    if (produtoGenerico.length === 0) {
      return notFoundResponse(res, 'Produto genérico não encontrado');
    }

    successResponse(res, produtoGenerico[0], 'Produto genérico encontrado');
  });

  /**
   * Buscar produtos genéricos por grupo
   */
  static buscarProdutosGenericosPorGrupo = asyncHandler(async (req, res) => {
    const { grupo_id } = req.params;

    const produtosGenericos = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.grupo_id = ? AND pg.status = 1
      GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, g.nome, sg.nome, c.nome, um.nome
      ORDER BY pg.nome ASC`,
      [grupo_id]
    );

    successResponse(res, produtosGenericos, 'Produtos genéricos encontrados');
  });

  /**
   * Buscar produtos genéricos por subgrupo
   */
  static buscarProdutosGenericosPorSubgrupo = asyncHandler(async (req, res) => {
    const { subgrupo_id } = req.params;

    const produtosGenericos = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.subgrupo_id = ? AND pg.status = 1
      GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, g.nome, sg.nome, c.nome, um.nome
      ORDER BY pg.nome ASC`,
      [subgrupo_id]
    );

    successResponse(res, produtosGenericos, 'Produtos genéricos encontrados');
  });

  /**
   * Buscar produtos genéricos por classe
   */
  static buscarProdutosGenericosPorClasse = asyncHandler(async (req, res) => {
    const { classe_id } = req.params;

    const produtosGenericos = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.classe_id = ? AND pg.status = 1
      GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, g.nome, sg.nome, c.nome, um.nome
      ORDER BY pg.nome ASC`,
      [classe_id]
    );

    successResponse(res, produtosGenericos, 'Produtos genéricos encontrados');
  });

  /**
   * Buscar produtos genéricos por produto origem
   */
  static buscarProdutosGenericosPorProdutoOrigem = asyncHandler(async (req, res) => {
    const { produto_origem_id } = req.params;

    const produtosGenericos = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.produto_origem_id = ? AND pg.status = 1
      GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, g.nome, sg.nome, c.nome, um.nome
      ORDER BY pg.nome ASC`,
      [produto_origem_id]
    );

    successResponse(res, produtosGenericos, 'Produtos genéricos encontrados');
  });

  /**
   * Buscar produtos genéricos ativos
   */
  static buscarProdutosGenericosAtivos = asyncHandler(async (req, res) => {
    const produtosGenericos = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.status = 1
      GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, g.nome, sg.nome, c.nome, um.nome
      ORDER BY pg.nome ASC`
    );

    successResponse(res, produtosGenericos, 'Produtos genéricos ativos encontrados');
  });

  /**
   * Buscar produtos genéricos padrão
   */
  static buscarProdutosGenericosPadrao = asyncHandler(async (req, res) => {
    const produtosGenericos = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.produto_padrao = 'Sim' AND pg.status = 1
      GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, g.nome, sg.nome, c.nome, um.nome
      ORDER BY pg.nome ASC`
    );

    successResponse(res, produtosGenericos, 'Produtos genéricos padrão encontrados');
  });

  /**
   * Buscar produto genérico por código
   */
  static buscarProdutoGenericoPorCodigo = asyncHandler(async (req, res) => {
    const { codigo } = req.params;

    const produtoGenerico = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.codigo = ?
      GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, g.nome, sg.nome, c.nome, um.nome`,
      [codigo]
    );

    if (produtoGenerico.length === 0) {
      return notFoundResponse(res, 'Produto genérico não encontrado');
    }

    successResponse(res, produtoGenerico[0], 'Produto genérico encontrado');
  });
}

module.exports = ProdutoGenericoListController;
