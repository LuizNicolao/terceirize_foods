const { query } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, escola, grupo, data, semana_abastecimento } = req.query;
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
      // Outros tipos: apenas registros criados por eles
      whereClause += ' AND n.usuario_email = ?';
      params.push(req.user.email);
    }

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (n.produto LIKE ? OR e.nome_escola LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (escola) {
      whereClause += ' AND n.escola = ?';
      params.push(escola);
    }

    if (grupo) {
      whereClause += ' AND n.grupo_id = ?';
      params.push(grupo);
    }

    if (data) {
      whereClause += ' AND n.data_consumo = ?';
      params.push(data);
    }

    if (semana_abastecimento) {
      // Para semana de abastecimento, vamos filtrar por data_consumo dentro da semana
      // Assumindo que semana_abastecimento vem no formato "DD/MM a DD/MM"
      const [dataInicio, dataFim] = semana_abastecimento.split(' a ');
      if (dataInicio && dataFim) {
        // Converter formato DD/MM para YYYY-MM-DD (assumindo ano atual)
        const anoAtual = new Date().getFullYear();
        const [diaInicio, mesInicio] = dataInicio.split('/');
        const [diaFim, mesFim] = dataFim.split('/');
        
        const dataInicioFormatada = `${anoAtual}-${mesInicio.padStart(2, '0')}-${diaInicio.padStart(2, '0')}`;
        const dataFimFormatada = `${anoAtual}-${mesFim.padStart(2, '0')}-${diaFim.padStart(2, '0')}`;
        
        whereClause += ' AND n.data_consumo >= ? AND n.data_consumo <= ?';
        params.push(dataInicioFormatada, dataFimFormatada);
      }
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
      FROM necessidades n
      LEFT JOIN escolas e ON n.escola = e.nome_escola
      ${whereClause}
    `;
    
    const [countResult] = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / validLimitNum);

    // Query principal com paginação
    const necessidades = await query(`
      SELECT 
        n.*,
        p.id as produto_id,
        p.nome as produto_nome,
        p.unidade_medida,
        e.nome_escola,
        e.rota
      FROM necessidades n
      LEFT JOIN produtos p ON n.produto = p.nome
      LEFT JOIN escolas e ON n.escola = e.nome_escola
      ${whereClause}
      ORDER BY n.data_preenchimento DESC
      LIMIT ${validLimitNum} OFFSET ${offset}
    `, params);

    res.json({
      success: true,
      data: necessidades,
      pagination: {
        currentPage: validPageNum,
        totalPages,
        totalItems,
        itemsPerPage: validLimitNum,
        hasNextPage: validPageNum < totalPages,
        hasPrevPage: validPageNum > 1
      }
    });
  } catch (error) {
    console.error('Erro ao buscar necessidades:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar necessidades'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { search, escola } = req.query;
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
      // Outros tipos: apenas registros criados por eles
      whereClause += ' AND n.usuario_email = ?';
      params.push(req.user.email);
    }

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (n.produto LIKE ? OR e.nome_escola LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (escola) {
      whereClause += ' AND n.escola = ?';
      params.push(escola);
    }


    const necessidades = await query(`
      SELECT 
        n.*,
        p.id as produto_id,
        p.nome as produto_nome,
        p.unidade_medida,
        e.nome_escola,
        e.rota,
        e.codigo_teknisa
      FROM necessidades n
      LEFT JOIN produtos p ON n.produto = p.nome
      LEFT JOIN escolas e ON n.escola = e.nome_escola
      ${whereClause}
      ORDER BY n.data_preenchimento DESC
    `, params);

    res.json({
      success: true,
      data: necessidades
    });
  } catch (error) {
    console.error('Erro ao buscar necessidades:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar necessidades'
    });
  }
};

module.exports = {
  listar,
  listarTodas
};
