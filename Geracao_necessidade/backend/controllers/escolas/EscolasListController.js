const { query } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, rota, cidade, estado, ativo } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Lógica de permissões por tipo de usuário
    if (userType === 'Nutricionista') {
      // Nutricionista: apenas escolas associadas a ela
      whereClause += ' AND e.email_nutricionista = ?';
      params.push(req.user.email);
    } else if (userType === 'Coordenacao' || userType === 'Supervisor') {
      // Coordenador e Supervisor: acesso a todas as escolas
      // Não adiciona filtro adicional
    } else {
      // Outros tipos: sem acesso (retorna vazio)
      whereClause += ' AND 1=0';
    }

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR e.rota LIKE ? OR e.cidade LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (rota) {
      whereClause += ' AND e.rota = ?';
      params.push(rota);
    }

    if (cidade) {
      whereClause += ' AND e.cidade = ?';
      params.push(cidade);
    }

    if (estado) {
      whereClause += ' AND e.estado = ?';
      params.push(estado);
    }

    if (ativo !== undefined) {
      whereClause += ' AND e.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    // Calcular paginação
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM escolas e
      ${whereClause}
    `;
    
    const [countResult] = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Query principal com paginação
    const escolas = await query(`
      SELECT 
        e.id, 
        e.nome_escola, 
        e.rota, 
        e.cidade, 
        e.estado, 
        e.email_nutricionista,
        e.ativo,
        e.data_cadastro
      FROM escolas e
      ${whereClause}
      ORDER BY e.nome_escola ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `, params);

    res.json({
      success: true,
      data: escolas,
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
    console.error('Erro ao buscar escolas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar escolas'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { search, rota, cidade, estado, ativo } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Lógica de permissões por tipo de usuário
    if (userType === 'Nutricionista') {
      // Nutricionista: apenas escolas associadas a ela
      whereClause += ' AND e.email_nutricionista = ?';
      params.push(req.user.email);
    } else if (userType === 'Coordenacao' || userType === 'Supervisor') {
      // Coordenador e Supervisor: acesso a todas as escolas
      // Não adiciona filtro adicional
    } else {
      // Outros tipos: sem acesso (retorna vazio)
      whereClause += ' AND 1=0';
    }

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR e.rota LIKE ? OR e.cidade LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (rota) {
      whereClause += ' AND e.rota = ?';
      params.push(rota);
    }

    if (cidade) {
      whereClause += ' AND e.cidade = ?';
      params.push(cidade);
    }

    if (estado) {
      whereClause += ' AND e.estado = ?';
      params.push(estado);
    }

    if (ativo !== undefined) {
      whereClause += ' AND e.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    const escolas = await query(`
      SELECT 
        e.id, 
        e.nome_escola, 
        e.rota, 
        e.cidade, 
        e.estado, 
        e.email_nutricionista,
        e.ativo,
        e.data_cadastro
      FROM escolas e
      ${whereClause}
      ORDER BY e.nome_escola ASC
    `, params);

    res.json({
      success: true,
      data: escolas
    });
  } catch (error) {
    console.error('Erro ao buscar escolas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar escolas'
    });
  }
};

const buscarPorRota = async (req, res) => {
  try {
    const { rota } = req.params;

    const escolas = await query(`
      SELECT 
        id, 
        nome_escola, 
        rota, 
        cidade, 
        estado, 
        email_nutricionista,
        ativo
      FROM escolas 
      WHERE rota = ? AND ativo = 1
      ORDER BY nome_escola ASC
    `, [rota]);

    res.json({
      success: true,
      data: escolas
    });
  } catch (error) {
    console.error('Erro ao buscar escolas por rota:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar escolas por rota'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  buscarPorRota
};
