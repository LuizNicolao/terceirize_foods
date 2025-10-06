const { query } = require('../config/database');
const { paginatedResponse } = require('../middleware/pagination');

const listar = async (req, res) => {
  try {
    const { search, ativo } = req.query;
    
    // Construir condições WHERE
    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('p.nome LIKE ?');
      params.push(`%${search}%`);
    }

    if (ativo !== undefined) {
      whereConditions.push('ppc.ativo = ?');
      params.push(ativo === 'true' ? 1 : 0);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query base para buscar dados
    const baseQuery = `
      SELECT 
        ppc.id,
        ppc.produto_id,
        p.nome as nome_produto,
        p.unidade_medida,
        ppc.per_capita_parcial,
        ppc.per_capita_almoco,
        ppc.per_capita_lanche,
        ppc.per_capita_eja,
        ppc.ativo,
        ppc.data_cadastro,
        ppc.data_atualizacao
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
      ORDER BY p.nome ASC
    `;

    // Query para contar estatísticas totais (sem filtros)
    const statsQuery = `
      SELECT 
        COUNT(*) as totalGeral,
        SUM(CASE WHEN ppc.ativo = 1 THEN 1 ELSE 0 END) as totalAtivos,
        SUM(CASE WHEN ppc.ativo = 0 THEN 1 ELSE 0 END) as totalInativos
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
    `;
    
    const [statsResult] = await query(statsQuery);
    const stats = statsResult && statsResult[0] ? statsResult[0] : { totalAtivos: 0, totalInativos: 0 };

    // Usar middleware de paginação
    const result = await paginatedResponse(req, res, baseQuery, params, '/api/produtos-per-capita');
    
    // Adicionar estatísticas totais à paginação
    result.pagination = {
      ...result.meta.pagination,
      totalAtivos: stats.totalAtivos || 0,
      totalInativos: stats.totalInativos || 0
    };
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
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
        ppc.per_capita_parcial,
        ppc.per_capita_almoco,
        ppc.per_capita_lanche,
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

const criar = async (req, res) => {
  try {
    const {
      produto_id,
      per_capita_parcial,
      per_capita_almoco,
      per_capita_lanche,
      per_capita_eja
    } = req.body;

    // Validar campos obrigatórios
    if (!produto_id) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'Produto é obrigatório'
      });
    }

    // Verificar se o produto existe na tabela produtos
    const produtoExiste = await query(
      'SELECT id, nome FROM produtos WHERE id = ? AND ativo = 1',
      [produto_id]
    );

    if (produtoExiste.length === 0) {
      return res.status(400).json({
        error: 'Produto inválido',
        message: 'O produto selecionado não existe ou está inativo'
      });
    }

    // Verificar se já existe per capita para este produto
    const perCapitaExistente = await query(
      'SELECT id FROM produtos_per_capita WHERE produto_id = ?',
      [produto_id]
    );

    if (perCapitaExistente.length > 0) {
      return res.status(400).json({
        error: 'Per capita já existe',
        message: 'Já existe per capita definida para este produto'
      });
    }

    // Criar per capita
    const resultado = await query(`
      INSERT INTO produtos_per_capita (
        produto_id,
        per_capita_parcial, per_capita_almoco, per_capita_lanche, per_capita_eja
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      produto_id,
      per_capita_parcial !== undefined ? per_capita_parcial : 0,
      per_capita_almoco !== undefined ? per_capita_almoco : 0,
      per_capita_lanche !== undefined ? per_capita_lanche : 0,
      per_capita_eja !== undefined ? per_capita_eja : 0
    ]);

    res.status(201).json({
      success: true,
      message: 'Per capita criada com sucesso',
      data: { id: resultado.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar per capita:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar per capita'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      per_capita_parcial,
      per_capita_almoco,
      per_capita_lanche,
      per_capita_eja,
      ativo
    } = req.body;

    // Verificar se a per capita existe
    const perCapitaExistente = await query(
      'SELECT id FROM produtos_per_capita WHERE id = ?',
      [id]
    );

    if (perCapitaExistente.length === 0) {
      return res.status(404).json({
        error: 'Per capita não encontrada',
        message: 'Per capita não encontrada'
      });
    }

    // Tratar valores undefined como null
    const params = [
      per_capita_parcial !== undefined ? per_capita_parcial : null,
      per_capita_almoco !== undefined ? per_capita_almoco : null,
      per_capita_lanche !== undefined ? per_capita_lanche : null,
      per_capita_eja !== undefined ? per_capita_eja : null,
      ativo !== undefined ? ativo : null,
      id
    ];

    // Atualizar per capita
    await query(`
      UPDATE produtos_per_capita SET
        per_capita_parcial = COALESCE(?, per_capita_parcial),
        per_capita_almoco = COALESCE(?, per_capita_almoco),
        per_capita_lanche = COALESCE(?, per_capita_lanche),
        per_capita_eja = COALESCE(?, per_capita_eja),
        ativo = COALESCE(?, ativo),
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `, params);

    res.json({
      success: true,
      message: 'Per capita atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar per capita:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar per capita'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o produto existe
    const produtoExistente = await query(
      'SELECT id FROM produtos_per_capita WHERE id = ?',
      [id]
    );

    if (produtoExistente.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado',
        message: 'Produto não encontrado'
      });
    }

    // Deletar produto (soft delete - marcar como inativo)
    await query(
      'UPDATE produtos_per_capita SET ativo = 0, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Produto excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar produto per capita:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar produto per capita'
    });
  }
};

const listarProdutosDisponiveis = async (req, res) => {
  try {
    // Buscar produtos que ainda não têm per capita definida
    const produtos = await query(`
      SELECT 
        p.id,
        p.nome,
        p.unidade_medida
      FROM produtos p
      LEFT JOIN produtos_per_capita ppc ON p.id = ppc.produto_id
      WHERE p.ativo = 1 AND ppc.id IS NULL
      ORDER BY p.nome ASC
    `);

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
        ppc.per_capita_parcial,
        ppc.per_capita_almoco,
        ppc.per_capita_lanche,
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
  buscarPorId,
  criar,
  atualizar,
  deletar,
  listarProdutosDisponiveis,
  listarTodosProdutos,
  buscarPorProdutos
};
