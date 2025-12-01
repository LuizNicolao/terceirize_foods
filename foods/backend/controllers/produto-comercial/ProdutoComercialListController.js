/**
 * Controller de Listagem de Produto Comercial
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

class ProdutoComercialListController {
  
  /**
   * Listar produtos comerciais com paginação e busca
   */
  static listarProdutosComerciais = asyncHandler(async (req, res) => {
    const { search, status, grupo_id, subgrupo_id, classe_id, sortField, sortDirection, page = 1, limit = 10 } = req.query;
    
    let baseQuery = `
      SELECT 
        pc.*,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_comercial pc
      LEFT JOIN unidades_medida um ON pc.unidade_medida_id = um.id
      LEFT JOIN grupos g ON pc.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pc.subgrupo_id = sg.id
      LEFT JOIN classes c ON pc.classe_id = c.id
      LEFT JOIN usuarios uc ON pc.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON pc.usuario_atualizador_id = ua.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (pc.codigo LIKE ? OR pc.nome_comercial LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND pc.status = ?';
      params.push(parseInt(status));
    }

    if (grupo_id) {
      baseQuery += ' AND pc.grupo_id = ?';
      params.push(parseInt(grupo_id));
    }

    if (subgrupo_id) {
      baseQuery += ' AND pc.subgrupo_id = ?';
      params.push(parseInt(subgrupo_id));
    }

    if (classe_id) {
      baseQuery += ' AND pc.classe_id = ?';
      params.push(parseInt(classe_id));
    }

    // Aplicar ordenação
    let orderBy = 'pc.nome_comercial ASC';
    if (sortField && sortDirection) {
      const validFields = ['codigo', 'nome_comercial', 'status', 'grupo_id', 'subgrupo_id', 'classe_id', 'unidade_medida_id'];
      if (validFields.includes(sortField)) {
        const direction = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        // Mapear campos para colunas do banco
        const fieldMap = {
          'codigo': 'pc.codigo',
          'nome_comercial': 'pc.nome_comercial',
          'status': 'pc.status',
          'grupo_id': 'pc.grupo_id',
          'subgrupo_id': 'pc.subgrupo_id',
          'classe_id': 'pc.classe_id',
          'unidade_medida_id': 'pc.unidade_medida_id'
        };
        
        orderBy = `${fieldMap[sortField]} ${direction}`;
      }
    }
    baseQuery += ` ORDER BY ${orderBy}`;

    // Aplicar paginação
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
    
    // Executar query paginada
    const produtosComerciais = await executeQuery(query, params);

    // Contar total de registros
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM produto_comercial pc
      WHERE 1=1
    `;
    let countParams = [];
    
    if (search) {
      countQuery += ' AND (pc.codigo LIKE ? OR pc.nome_comercial LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (status !== undefined && status !== '') {
      countQuery += ' AND pc.status = ?';
      countParams.push(parseInt(status));
    }
    if (grupo_id) {
      countQuery += ' AND pc.grupo_id = ?';
      countParams.push(parseInt(grupo_id));
    }
    if (subgrupo_id) {
      countQuery += ' AND pc.subgrupo_id = ?';
      countParams.push(parseInt(subgrupo_id));
    }
    if (classe_id) {
      countQuery += ' AND pc.classe_id = ?';
      countParams.push(parseInt(classe_id));
    }
    
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inativos
      FROM produto_comercial
    `;
    const stats = await executeQuery(statsQuery);

    res.json({
      success: true,
      data: produtosComerciais,
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
   * Buscar produto comercial por ID
   */
  static buscarProdutoComercialPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const produtoComercial = await executeQuery(
      `SELECT 
        pc.*,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_comercial pc
      LEFT JOIN unidades_medida um ON pc.unidade_medida_id = um.id
      LEFT JOIN grupos g ON pc.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pc.subgrupo_id = sg.id
      LEFT JOIN classes c ON pc.classe_id = c.id
      LEFT JOIN usuarios uc ON pc.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON pc.usuario_atualizador_id = ua.id
      WHERE pc.id = ?`,
      [id]
    );

    if (produtoComercial.length === 0) {
      return notFoundResponse(res, 'Produto comercial não encontrado');
    }

    successResponse(res, produtoComercial[0]);
  });

  /**
   * Listar grupos disponíveis (apenas do tipo venda)
   */
  static listarGrupos = asyncHandler(async (req, res) => {
    const grupos = await executeQuery(
      `SELECT id, codigo, nome, tipo 
       FROM grupos 
       WHERE tipo = 'Venda' OR tipo = 'venda'
       ORDER BY nome ASC`
    );

    successResponse(res, grupos);
  });

  /**
   * Listar subgrupos disponíveis
   */
  static listarSubgrupos = asyncHandler(async (req, res) => {
    const subgrupos = await executeQuery(
      'SELECT id, codigo, nome, grupo_id FROM subgrupos ORDER BY nome ASC'
    );

    successResponse(res, subgrupos);
  });

  /**
   * Listar classes disponíveis
   */
  static listarClasses = asyncHandler(async (req, res) => {
    const classes = await executeQuery(
      'SELECT id, codigo, nome, subgrupo_id FROM classes ORDER BY nome ASC'
    );

    successResponse(res, classes);
  });

  /**
   * Listar unidades de medida disponíveis
   */
  static listarUnidadesMedida = asyncHandler(async (req, res) => {
    const unidades = await executeQuery(
      'SELECT id, nome, sigla FROM unidades_medida WHERE status = 1 ORDER BY nome ASC'
    );

    successResponse(res, unidades);
  });
}

module.exports = ProdutoComercialListController;

