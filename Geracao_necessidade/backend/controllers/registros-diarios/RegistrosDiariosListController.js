const { query } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, escola_id, tipo_media, data_inicio, data_fim, search } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    let whereClause = 'WHERE 1=1';
    let params = [];

    // Se for nutricionista, filtrar apenas escolas associadas a ela
    if (userType === 'Nutricionista') {
      whereClause += ' AND e.email_nutricionista = ?';
      params.push(req.user.email);
    }

    if (escola_id) {
      whereClause += ' AND rd.escola_id = ?';
      params.push(escola_id);
    }

    if (tipo_media) {
      whereClause += ' AND rd.tipo_media = ?';
      params.push(tipo_media);
    }

    if (data_inicio) {
      whereClause += ' AND rd.data >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND rd.data <= ?';
      params.push(data_fim);
    }

    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR e.rota LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Calcular paginação
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      INNER JOIN usuarios u ON rd.nutricionista_id = u.id
      ${whereClause}
    `;
    
    const [countResult] = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Query principal com paginação
    const registros = await query(`
      SELECT 
        rd.*,
        e.nome_escola,
        e.rota,
        u.nome as nutricionista_nome
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      INNER JOIN usuarios u ON rd.nutricionista_id = u.id
      ${whereClause}
      ORDER BY rd.data DESC, e.nome_escola ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `, params);

    res.json({
      success: true,
      data: registros,
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
    console.error('Erro ao buscar registros diários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar registros diários'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { escola_id, tipo_media, data_inicio, data_fim, search } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    let whereClause = 'WHERE 1=1';
    let params = [];

    // Se for nutricionista, filtrar apenas escolas associadas a ela
    if (userType === 'Nutricionista') {
      whereClause += ' AND e.email_nutricionista = ?';
      params.push(req.user.email);
    }

    if (escola_id) {
      whereClause += ' AND rd.escola_id = ?';
      params.push(escola_id);
    }

    if (tipo_media) {
      whereClause += ' AND rd.tipo_media = ?';
      params.push(tipo_media);
    }

    if (data_inicio) {
      whereClause += ' AND rd.data >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND rd.data <= ?';
      params.push(data_fim);
    }

    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR e.rota LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const registros = await query(`
      SELECT 
        rd.*,
        e.nome_escola,
        e.rota,
        u.nome as nutricionista_nome
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      INNER JOIN usuarios u ON rd.nutricionista_id = u.id
      ${whereClause}
      ORDER BY rd.data DESC, e.nome_escola ASC
    `, params);

    res.json({
      success: true,
      data: registros
    });
  } catch (error) {
    console.error('Erro ao buscar registros diários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar registros diários'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    let whereClause = 'WHERE rd.id = ?';
    let params = [id];

    // Se for nutricionista, filtrar apenas escolas associadas a ela
    if (userType === 'Nutricionista') {
      whereClause += ' AND e.email_nutricionista = ?';
      params.push(req.user.email);
    }

    const registros = await query(`
      SELECT 
        rd.*,
        e.nome_escola,
        e.rota,
        u.nome as nutricionista_nome
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      INNER JOIN usuarios u ON rd.nutricionista_id = u.id
      ${whereClause}
    `, params);

    if (registros.length === 0) {
      return res.status(404).json({
        error: 'Registro não encontrado',
        message: 'Registro não encontrado'
      });
    }

    res.json({
      success: true,
      data: registros[0]
    });
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar registro'
    });
  }
};

const { calcularPeriodoDiasUteis } = require('../../utils/diasUteisUtils');

const calcularMediasPorPeriodo = async (req, res) => {
  try {
    const { escola_id, data } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    if (!escola_id || !data) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios',
        message: 'Escola e data são obrigatórios'
      });
    }

    // Calcular período dos últimos 20 dias úteis
    const dataReferencia = new Date(data);
    const { dataInicio, dataFim } = calcularPeriodoDiasUteis(dataReferencia, 20);

    let whereClause = 'WHERE rd.ativo = 1 AND rd.escola_id = ? AND rd.data >= ? AND rd.data <= ?';
    let params = [escola_id, dataInicio, dataFim];

    // Se for nutricionista, filtrar apenas escolas associadas a ela
    if (userType === 'Nutricionista') {
      whereClause += ' AND e.email_nutricionista = ?';
      params.push(req.user.email);
    }

    // Buscar registros dos últimos 20 dias úteis e calcular média correta
    const medias = await query(`
      SELECT 
        rd.tipo_media,
        SUM(rd.valor) as soma_total,
        COUNT(*) as quantidade_registros,
        COUNT(DISTINCT rd.data) as dias_com_registro,
        CEIL(SUM(rd.valor) / COUNT(*)) as media_correta
      FROM registros_diarios rd
      LEFT JOIN escolas e ON rd.escola_id = e.id
      ${whereClause}
      GROUP BY rd.tipo_media
    `, params);

    // Organizar as médias por tipo (apenas os 5 tipos permitidos)
    const tiposPermitidos = ['lanche_manha', 'almoco', 'lanche_tarde', 'parcial', 'eja'];
    const mediasOrganizadas = {};
    
    // Inicializar todos os tipos com valores padrão
    tiposPermitidos.forEach(tipo => {
      mediasOrganizadas[tipo] = {
        media: 0,
        quantidade_registros: 0,
        dias_com_registro: 0
      };
    });

    // Preencher com os dados encontrados
    medias.forEach(media => {
      if (tiposPermitidos.includes(media.tipo_media)) {
        mediasOrganizadas[media.tipo_media] = {
          media: parseInt(media.media_correta) || 0,
          quantidade_registros: media.quantidade_registros,
          dias_com_registro: media.dias_com_registro
        };
      }
    });

    res.json({
      success: true,
      data: mediasOrganizadas
    });
  } catch (error) {
    console.error('Erro ao calcular médias por período:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao calcular médias por período'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  buscarPorId,
  calcularMediasPorPeriodo
};
