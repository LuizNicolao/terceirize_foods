const { query } = require('../../config/database');
const { successResponse, errorResponse, STATUS_CODES } = require('../../middleware/responseHandler');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, escola_id, search } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    let whereClause = 'WHERE 1=1';
    let params = [];

    // Se for nutricionista, filtrar apenas suas médias
    if (userType === 'Nutricionista') {
      whereClause += ' AND me.nutricionista_id = ?';
      params.push(userId);
    }
    // Coordenador e Supervisão podem ver médias de todas as escolas

    if (escola_id) {
      whereClause += ' AND me.escola_id = ?';
      params.push(escola_id);
    }

    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR e.rota LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Calcular paginação com validação
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    // Garantir que os valores sejam números válidos e positivos
    const validPageNum = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validLimitNum = isNaN(limitNum) || limitNum < 1 ? 10 : limitNum;
    
    const offset = (validPageNum - 1) * validLimitNum;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      INNER JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
    `;
    
    const [countResult] = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / validLimitNum);

    // Query principal com paginação
    const medias = await query(`
      SELECT 
        me.*,
        e.nome_escola,
        e.rota,
        u.nome as nutricionista_nome
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      INNER JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
      ORDER BY e.nome_escola ASC
      LIMIT ${validLimitNum} OFFSET ${offset}
    `, params);

    successResponse(res, medias, 'Médias listadas com sucesso', STATUS_CODES.OK, {
      pagination: {
        currentPage: validPageNum,
        totalPages,
        totalItems,
        itemsPerPage: validLimitNum,
        hasNextPage: validPageNum < totalPages,
        hasPrevPage: validPageNum > 1
      },
      filters: {
        search: search || null,
        escola_id: escola_id || null
      }
    });
  } catch (error) {
    console.error('Erro ao buscar médias:', error);
    errorResponse(res, 'Erro ao buscar médias das escolas', STATUS_CODES.INTERNAL_SERVER_ERROR, { code: 'INTERNAL_SERVER_ERROR' });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { escola_id, search } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    let whereClause = 'WHERE 1=1';
    let params = [];

    // Se for nutricionista, filtrar apenas suas médias
    if (userType === 'Nutricionista') {
      whereClause += ' AND me.nutricionista_id = ?';
      params.push(userId);
    }
    // Coordenador e Supervisão podem ver médias de todas as escolas

    if (escola_id) {
      whereClause += ' AND me.escola_id = ?';
      params.push(escola_id);
    }

    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR e.rota LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const medias = await query(`
      SELECT 
        me.*,
        e.nome_escola,
        e.rota,
        u.nome as nutricionista_nome
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      INNER JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
      ORDER BY e.nome_escola ASC
    `, params);

    res.json({
      success: true,
      data: medias
    });
  } catch (error) {
    console.error('Erro ao buscar médias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar médias das escolas'
    });
  }
};

const buscarPorEscola = async (req, res) => {
  try {
    const { escola_id } = req.params;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    let whereClause = 'WHERE me.escola_id = ?';
    let params = [escola_id];

    // Se for nutricionista, filtrar apenas suas médias
    if (userType === 'Nutricionista') {
      whereClause += ' AND me.nutricionista_id = ?';
      params.push(userId);
    }
    // Coordenador e Supervisão podem ver médias de qualquer escola

    const medias = await query(`
      SELECT 
        me.*,
        e.nome_escola,
        e.rota,
        u.nome as nutricionista_nome
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      LEFT JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
    `, params);

    if (medias.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Nenhuma média encontrada para esta escola'
      });
    }

    res.json({
      success: true,
      data: medias[0]
    });
  } catch (error) {
    console.error('Erro ao buscar médias da escola:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar médias da escola'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    let whereClause = 'WHERE me.id = ?';
    let params = [id];

    // Se for nutricionista, filtrar apenas suas médias
    if (userType === 'Nutricionista') {
      whereClause += ' AND me.nutricionista_id = ?';
      params.push(userId);
    }
    // Coordenador e Supervisão podem ver médias de qualquer escola

    const medias = await query(`
      SELECT 
        me.*,
        e.nome_escola,
        e.rota,
        u.nome as nutricionista_nome
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      LEFT JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
    `, params);

    if (medias.length === 0) {
      return res.status(404).json({
        error: 'Média não encontrada',
        message: 'Média não encontrada'
      });
    }

    res.json({
      success: true,
      data: medias[0]
    });
  } catch (error) {
    console.error('Erro ao buscar média:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar média'
    });
  }
};

const listarEscolasNutricionista = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userType = req.user.tipo_usuario;
    const userRota = req.user.rota;

    let whereClause = 'WHERE e.ativo = 1';
    let params = [userId];

    // Se for nutricionista, filtrar apenas suas escolas pela rota
    if (userType === 'Nutricionista') {
      // Extrair número da rota do usuário (ex: 'Rota 1' -> '1')
      const numeroRota = userRota.match(/\d+/)?.[0] || '1';
      
      // Buscar escolas que contenham o número da rota
      whereClause += ' AND e.rota LIKE ?';
      params.push(`%ROTA ${numeroRota.padStart(2, '0')}%`);
    }
    // Coordenador e Supervisão veem todas as escolas (sem filtro adicional)

    const escolas = await query(`
      SELECT 
        e.id,
        e.nome_escola,
        e.rota,
        e.cidade,
        e.estado,
        e.email_nutricionista,
        u.nome as nutricionista_nome,
        CASE 
          WHEN me.id IS NOT NULL THEN 1 
          ELSE 0 
        END as tem_media
      FROM escolas e
      LEFT JOIN usuarios u ON e.email_nutricionista = u.email
      LEFT JOIN medias_escolas me ON e.id = me.escola_id AND me.nutricionista_id = ?
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

module.exports = {
  listar,
  listarTodas,
  buscarPorEscola,
  buscarPorId,
  listarEscolasNutricionista
};
