/**
 * Controller de Busca de Produto Origem
 * Responsável por operações de busca avançada e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutoOrigemSearchController {
  
  /**
   * Busca avançada de produtos origem
   */
  static buscaAvancada = asyncHandler(async (req, res) => {
    const { 
      search, 
      grupo_id, 
      subgrupo_id, 
      classe_id, 
      unidade_medida_id,
      status,
      fator_conversao_min,
      fator_conversao_max,
      peso_liquido_min,
      peso_liquido_max,
      produto_generico_padrao_id,
      page = 1, 
      limit = 10 
    } = req.query;
    
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

    // Busca por texto
    if (search) {
      baseQuery += ' AND (po.codigo LIKE ? OR po.nome LIKE ? OR po.referencia_mercado LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Filtros específicos
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

    if (unidade_medida_id) {
      baseQuery += ' AND po.unidade_medida_id = ?';
      params.push(parseInt(unidade_medida_id));
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND po.status = ?';
      params.push(parseInt(status));
    }

    if (produto_generico_padrao_id) {
      baseQuery += ' AND po.produto_generico_padrao_id = ?';
      params.push(parseInt(produto_generico_padrao_id));
    }

    // Filtros de faixa
    if (fator_conversao_min) {
      baseQuery += ' AND po.fator_conversao >= ?';
      params.push(parseFloat(fator_conversao_min));
    }

    if (fator_conversao_max) {
      baseQuery += ' AND po.fator_conversao <= ?';
      params.push(parseFloat(fator_conversao_max));
    }

    if (peso_liquido_min) {
      baseQuery += ' AND po.peso_liquido >= ?';
      params.push(parseFloat(peso_liquido_min));
    }

    if (peso_liquido_max) {
      baseQuery += ' AND po.peso_liquido <= ?';
      params.push(parseFloat(peso_liquido_max));
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
      WHERE 1=1${search ? ' AND (po.codigo LIKE ? OR po.nome LIKE ? OR po.referencia_mercado LIKE ?)' : ''}${grupo_id ? ' AND po.grupo_id = ?' : ''}${subgrupo_id ? ' AND po.subgrupo_id = ?' : ''}${classe_id ? ' AND po.classe_id = ?' : ''}${unidade_medida_id ? ' AND po.unidade_medida_id = ?' : ''}${status !== undefined && status !== '' ? ' AND po.status = ?' : ''}${produto_generico_padrao_id ? ' AND po.produto_generico_padrao_id = ?' : ''}${fator_conversao_min ? ' AND po.fator_conversao >= ?' : ''}${fator_conversao_max ? ' AND po.fator_conversao <= ?' : ''}${peso_liquido_min ? ' AND po.peso_liquido >= ?' : ''}${peso_liquido_max ? ' AND po.peso_liquido <= ?' : ''}
    `;
    const countParams = [...params.slice(0, search ? 3 : 0), ...params.slice(search ? 3 : 0)];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    res.json({
      success: true,
      data: produtosOrigem,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      }
    });
  });

  /**
   * Busca por similaridade de nome
   */
  static buscarPorSimilaridade = asyncHandler(async (req, res) => {
    const { nome, limit = 10 } = req.query;

    if (!nome) {
      return errorResponse(res, 'Nome é obrigatório para busca por similaridade', STATUS_CODES.BAD_REQUEST);
    }

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
      WHERE po.nome LIKE ? AND po.status = 1
      ORDER BY 
        CASE 
          WHEN po.nome = ? THEN 1
          WHEN po.nome LIKE ? THEN 2
          ELSE 3
        END,
        po.nome ASC
      LIMIT ?`,
      [`%${nome}%`, nome, `${nome}%`, parseInt(limit)]
    );

    successResponse(res, produtosOrigem, 'Produtos origem encontrados por similaridade');
  });

  /**
   * Busca por código exato ou similar
   */
  static buscarPorCodigo = asyncHandler(async (req, res) => {
    const { codigo, exact = false } = req.query;

    if (!codigo) {
      return errorResponse(res, 'Código é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    let query, params;

    if (exact === 'true') {
      query = `
        SELECT 
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
        WHERE po.codigo = ?
      `;
      params = [codigo];
    } else {
      query = `
        SELECT 
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
        WHERE po.codigo LIKE ? AND po.status = 1
        ORDER BY po.codigo ASC
      `;
      params = [`%${codigo}%`];
    }

    const produtosOrigem = await executeQuery(query, params);

    successResponse(res, produtosOrigem, 'Produtos origem encontrados por código');
  });

  /**
   * Busca produtos origem sem grupo/subgrupo/classe
   */
  static buscarSemClassificacao = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

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
      WHERE (po.grupo_id IS NULL OR po.subgrupo_id IS NULL OR po.classe_id IS NULL)
        AND po.status = 1
      ORDER BY po.nome ASC
      LIMIT ? OFFSET ?`,
      [limitNum, offset]
    );

    // Contar total
    const totalResult = await executeQuery(
      `SELECT COUNT(*) as total 
       FROM produto_origem 
       WHERE (grupo_id IS NULL OR subgrupo_id IS NULL OR classe_id IS NULL) 
         AND status = 1`
    );
    const totalItems = totalResult[0].total;

    res.json({
      success: true,
      data: produtosOrigem,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      }
    });
  });
}

module.exports = ProdutoOrigemSearchController;
