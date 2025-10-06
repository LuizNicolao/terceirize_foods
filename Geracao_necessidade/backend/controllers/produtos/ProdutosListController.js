const { query } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tipo, ativo } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (p.nome LIKE ? OR p.tipo LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tipo) {
      whereClause += ' AND p.tipo = ?';
      params.push(tipo);
    }

    if (ativo !== undefined) {
      whereClause += ' AND p.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    // Calcular paginação
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM produtos p
      ${whereClause}
    `;
    
    const [countResult] = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Query principal com paginação
    const produtos = await query(`
      SELECT 
        p.id, 
        p.nome, 
        p.unidade_medida,
        p.tipo,
        p.ativo,
        p.data_cadastro
      FROM produtos p
      ${whereClause}
      ORDER BY p.nome ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `, params);

    res.json({
      success: true,
      data: produtos,
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
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { search, tipo, ativo } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (p.nome LIKE ? OR p.tipo LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tipo) {
      whereClause += ' AND p.tipo = ?';
      params.push(tipo);
    }

    if (ativo !== undefined) {
      whereClause += ' AND p.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    const produtos = await query(`
      SELECT 
        p.id, 
        p.nome, 
        p.unidade_medida,
        p.tipo,
        p.ativo,
        p.data_cadastro
      FROM produtos p
      ${whereClause}
      ORDER BY p.nome ASC
    `, params);

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos'
    });
  }
};

const buscarPorGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params;
    
    // Buscar o nome do grupo pelo ID (usando o mesmo mapeamento do buscarGrupos)
    const grupos = await query(`
      SELECT DISTINCT tipo as nome
      FROM produtos 
      WHERE ativo = 1 
      ORDER BY tipo ASC
    `);
    
    // Usar o índice baseado em 0 para encontrar o grupo
    const grupoIndex = parseInt(grupoId) - 1;
    const grupoNome = grupos[grupoIndex]?.nome;
    
    if (!grupoNome) {
      return res.status(404).json({
        success: false,
        error: 'Grupo não encontrado',
        message: 'O grupo selecionado não existe'
      });
    }
    
    const produtos = await query(`
      SELECT id, nome, unidade_medida, tipo as grupo_nome
      FROM produtos
      WHERE ativo = 1 AND tipo = ?
      ORDER BY nome ASC
    `, [grupoNome]);

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos por grupo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos por grupo'
    });
  }
};

const buscarGrupos = async (req, res) => {
  try {
    // Usar os tipos de produtos como grupos
    const grupos = await query(`
      SELECT DISTINCT tipo as nome, tipo as id
      FROM produtos 
      WHERE ativo = 1 
      ORDER BY tipo ASC
    `);

    // Transformar para o formato esperado
    const gruposFormatados = grupos.map((grupo, index) => ({
      id: index + 1,
      nome: grupo.nome,
      descricao: `Grupo de produtos ${grupo.nome}`
    }));

    res.json({
      success: true,
      data: gruposFormatados
    });
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar grupos'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  buscarPorGrupo,
  buscarGrupos
};
