const { query } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ativo } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (te.nome LIKE ? OR te.descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (ativo !== undefined) {
      whereClause += ' AND te.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    // Calcular paginação
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tipos_entrega te
      ${whereClause}
    `;
    
    const [countResult] = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Query principal com paginação
    const tiposEntrega = await query(`
      SELECT 
        te.id, 
        te.nome, 
        te.descricao,
        te.ativo,
        te.data_cadastro,
        te.data_atualizacao
      FROM tipos_entrega te
      ${whereClause}
      ORDER BY te.nome ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `, params);

    res.json({
      success: true,
      data: tiposEntrega,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tipos de entrega:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar tipos de entrega'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { search, ativo } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (te.nome LIKE ? OR te.descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (ativo !== undefined) {
      whereClause += ' AND te.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    const tiposEntrega = await query(`
      SELECT 
        te.id, 
        te.nome, 
        te.descricao,
        te.ativo,
        te.data_cadastro,
        te.data_atualizacao
      FROM tipos_entrega te
      ${whereClause}
      ORDER BY te.nome ASC
    `, params);

    res.json({
      success: true,
      data: tiposEntrega
    });
  } catch (error) {
    console.error('Erro ao buscar tipos de entrega:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar tipos de entrega'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const tiposEntrega = await query(`
      SELECT 
        te.id, 
        te.nome, 
        te.descricao,
        te.ativo,
        te.data_cadastro,
        te.data_atualizacao
      FROM tipos_entrega te
      WHERE te.id = ?
    `, [id]);

    if (tiposEntrega.length === 0) {
      return res.status(404).json({
        error: 'Tipo de entrega não encontrado',
        message: 'Tipo de entrega não encontrado'
      });
    }

    res.json({
      success: true,
      data: tiposEntrega[0]
    });
  } catch (error) {
    console.error('Erro ao buscar tipo de entrega:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar tipo de entrega'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  buscarPorId
};
