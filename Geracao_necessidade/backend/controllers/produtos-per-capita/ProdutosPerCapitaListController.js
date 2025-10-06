const { query } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ativo, per_capita, tipo_produto } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (search) {
      whereClause += ' AND p.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (ativo !== undefined) {
      whereClause += ' AND ppc.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    if (per_capita) {
      whereClause += ` AND ppc.per_capita_${per_capita} > 0`;
    }

    if (tipo_produto) {
      whereClause += ' AND p.tipo = ?';
      params.push(tipo_produto);
    }

    // Calcular paginação
    const pageNum = parseInt(page);
    const limitNum = limit === 'all' ? null : parseInt(limit);
    const offset = limitNum ? (pageNum - 1) * limitNum : 0;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = limitNum ? Math.ceil(totalItems / limitNum) : 1;

    // Query principal com paginação
    const limitClause = limitNum ? `LIMIT ${limitNum} OFFSET ${offset}` : '';
    const produtos = await query(`
      SELECT 
        ppc.id,
        ppc.produto_id,
        p.nome as nome_produto,
        p.unidade_medida,
        p.tipo as tipo_produto,
        ppc.per_capita_lanche_manha,
        ppc.per_capita_almoco,
        ppc.per_capita_lanche_tarde,
        ppc.per_capita_parcial,
        ppc.per_capita_eja,
        ppc.ativo,
        ppc.data_cadastro,
        ppc.data_atualizacao
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
      ORDER BY p.nome ASC
      ${limitClause}
    `, params);

    // Calcular estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as totalGeral,
        SUM(CASE WHEN ppc.ativo = 1 THEN 1 ELSE 0 END) as totalAtivos,
        SUM(CASE WHEN ppc.ativo = 0 THEN 1 ELSE 0 END) as totalInativos
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
    `;
    
    const statsResult = await query(statsQuery);
    const stats = statsResult && statsResult[0] ? statsResult[0] : { totalAtivos: 0, totalInativos: 0 };

    res.json({
      success: true,
      data: produtos,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        totalAtivos: stats.totalAtivos || 0,
        totalInativos: stats.totalInativos || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produtos per capita:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos per capita'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { search, ativo, tipo_produto } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (search) {
      whereClause += ' AND p.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (ativo !== undefined) {
      whereClause += ' AND ppc.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    if (tipo_produto) {
      whereClause += ' AND p.tipo = ?';
      params.push(tipo_produto);
    }

    const produtos = await query(`
      SELECT 
        ppc.id,
        ppc.produto_id,
        p.nome as nome_produto,
        p.unidade_medida,
        p.tipo as tipo_produto,
        ppc.per_capita_lanche_manha,
        ppc.per_capita_almoco,
        ppc.per_capita_lanche_tarde,
        ppc.per_capita_parcial,
        ppc.per_capita_eja,
        ppc.ativo,
        ppc.data_cadastro,
        ppc.data_atualizacao
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
      ORDER BY p.nome ASC
    `, params);

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos per capita:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos per capita'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const produtos = await query(`
      SELECT 
        ppc.id,
        ppc.produto_id,
        p.nome as nome_produto,
        p.unidade_medida,
        ppc.per_capita_lanche_manha,
        ppc.per_capita_almoco,
        ppc.per_capita_lanche_tarde,
        ppc.per_capita_parcial,
        ppc.per_capita_eja,
        ppc.ativo,
        ppc.data_cadastro,
        ppc.data_atualizacao
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      WHERE ppc.id = ?
    `, [id]);

    if (produtos.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado',
        message: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: produtos[0]
    });
  } catch (error) {
    console.error('Erro ao buscar produto per capita:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produto per capita'
    });
  }
};

const listarProdutosDisponiveis = async (req, res) => {
  try {
    const { incluir_produto_id } = req.query;
    
    let whereClause = 'WHERE p.ativo = 1 AND ppc.id IS NULL';
    let params = [];
    
    // Se foi solicitado incluir um produto específico (para edição)
    if (incluir_produto_id) {
      whereClause = 'WHERE p.ativo = 1 AND (ppc.id IS NULL OR p.id = ?)';
      params.push(incluir_produto_id);
    }
    
    // Buscar produtos que ainda não têm per capita definida (ou o produto específico)
    const produtos = await query(`
      SELECT 
        p.id,
        p.nome,
        p.unidade_medida
      FROM produtos p
      LEFT JOIN produtos_per_capita ppc ON p.id = ppc.produto_id
      ${whereClause}
      ORDER BY p.nome ASC
    `, params);

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos disponíveis:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos disponíveis'
    });
  }
};

const listarTodosProdutos = async (req, res) => {
  try {
    // Buscar todos os produtos ativos
    const produtos = await query(`
      SELECT 
        p.id,
        p.nome,
        p.unidade_medida
      FROM produtos p
      WHERE p.ativo = 1
      ORDER BY p.nome ASC
    `);

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar todos os produtos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar todos os produtos'
    });
  }
};

const buscarPorProdutos = async (req, res) => {
  try {
    const { produtoIds } = req.body;

    if (!Array.isArray(produtoIds) || produtoIds.length === 0) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Lista de IDs de produtos é obrigatória'
      });
    }

    // Criar placeholders para a query IN
    const placeholders = produtoIds.map(() => '?').join(',');

    const percapitas = await query(`
      SELECT 
        ppc.produto_id,
        ppc.per_capita_lanche_manha,
        ppc.per_capita_almoco,
        ppc.per_capita_lanche_tarde,
        ppc.per_capita_parcial,
        ppc.per_capita_eja,
        p.nome as produto_nome
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      WHERE ppc.produto_id IN (${placeholders}) AND ppc.ativo = 1
    `, produtoIds);

    res.json({
      success: true,
      data: percapitas
    });
  } catch (error) {
    console.error('Erro ao buscar percapitas por produtos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar percapitas por produtos'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  buscarPorId,
  listarProdutosDisponiveis,
  listarTodosProdutos,
  buscarPorProdutos
};
