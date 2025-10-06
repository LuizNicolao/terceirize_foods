const { query } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      escola_id, 
      data_inicio, 
      data_fim 
    } = req.query;
    
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Lógica de permissões por tipo de usuário
    if (userType === 'Nutricionista') {
      // Nutricionista: solicitações das escolas que ela é responsável
      whereClause += ' AND e.email_nutricionista = ?';
      params.push(req.user.email);
    } else if (userType === 'Coordenacao' || userType === 'Supervisor') {
      // Coordenador e Supervisor: acesso a todas as solicitações
      // Não adiciona filtro adicional
    } else {
      // Outros tipos: apenas suas próprias solicitações
      whereClause += ' AND sm.nutricionista_email = ?';
      params.push(req.user.email);
    }

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR sm.manutencao_descricao LIKE ? OR u.nome LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      // Suportar múltiplos status separados por vírgula
      if (status.includes(',')) {
        const statusList = status.split(',').map(s => s.trim());
        const placeholders = statusList.map(() => '?').join(',');
        whereClause += ` AND sm.status IN (${placeholders})`;
        params.push(...statusList);
      } else {
        whereClause += ' AND sm.status = ?';
        params.push(status);
      }
    }

    if (escola_id) {
      whereClause += ' AND sm.escola_id = ?';
      params.push(escola_id);
    }

    if (data_inicio) {
      whereClause += ' AND sm.data_solicitacao >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND sm.data_solicitacao <= ?';
      params.push(data_fim);
    }

    // Calcular paginação
    const pageNum = parseInt(page);
    const limitNum = limit === 'all' ? null : parseInt(limit);
    const offset = limitNum ? (pageNum - 1) * limitNum : 0;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = limitNum ? Math.ceil(totalItems / limitNum) : 1;

    // Query principal com paginação
    const limitClause = limitNum ? `LIMIT ${limitNum} OFFSET ${offset}` : '';
    const solicitacoes = await query(`
      SELECT 
        sm.id,
        sm.data_solicitacao,
        sm.escola_id,
        sm.cidade,
        sm.fornecedor,
        sm.nutricionista_email,
        sm.manutencao_descricao,
        sm.foto_equipamento,
        sm.valor,
        sm.data_servico,
        sm.numero_ordem_servico,
        sm.status,
        sm.observacoes,
        sm.data_cadastro,
        sm.data_atualizacao,
        e.nome_escola,
        e.rota,
        e.codigo_teknisa,
        u.nome as nutricionista_nome
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
      ORDER BY sm.data_solicitacao DESC, sm.data_cadastro DESC
      ${limitClause}
    `, params);

    // Calcular estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as totalSolicitacoes,
        SUM(CASE WHEN sm.status = 'Pendente' THEN 1 ELSE 0 END) as totalPendentes,
        SUM(CASE WHEN sm.status = 'Aprovado' THEN 1 ELSE 0 END) as totalAprovadas,
        SUM(CASE WHEN sm.status = 'Reprovado' THEN 1 ELSE 0 END) as totalReprovadas,
        SUM(CASE WHEN sm.status = 'Pendente manutencao' THEN 1 ELSE 0 END) as totalPendenteManutencao,
        SUM(CASE WHEN sm.status = 'Concluido' THEN 1 ELSE 0 END) as totalConcluidas,
        SUM(CASE WHEN sm.valor IS NOT NULL THEN sm.valor ELSE 0 END) as valorTotal
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
    `;
    
    const statsResult = await query(statsQuery, params);
    const stats = statsResult && statsResult[0] ? statsResult[0] : { 
      totalSolicitacoes: 0, 
      totalPendentes: 0, 
      totalAprovadas: 0, 
      totalReprovadas: 0, 
      totalPendenteManutencao: 0, 
      totalConcluidas: 0, 
      valorTotal: 0 
    };

    res.json({
      success: true,
      data: solicitacoes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        ...stats
      }
    });
  } catch (error) {
    console.error('Erro ao buscar solicitações de manutenção:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar solicitações de manutenção'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { search, status, escola_id, data_inicio, data_fim } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Lógica de permissões por tipo de usuário
    if (userType === 'Nutricionista') {
      // Nutricionista: solicitações das escolas que ela é responsável
      whereClause += ' AND e.email_nutricionista = ?';
      params.push(req.user.email);
    } else if (userType === 'Coordenacao' || userType === 'Supervisor') {
      // Acesso total
    } else {
      whereClause += ' AND sm.nutricionista_email = ?';
      params.push(req.user.email);
    }

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR sm.manutencao_descricao LIKE ? OR u.nome LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      // Suportar múltiplos status separados por vírgula
      if (status.includes(',')) {
        const statusList = status.split(',').map(s => s.trim());
        const placeholders = statusList.map(() => '?').join(',');
        whereClause += ` AND sm.status IN (${placeholders})`;
        params.push(...statusList);
      } else {
        whereClause += ' AND sm.status = ?';
        params.push(status);
      }
    }

    if (escola_id) {
      whereClause += ' AND sm.escola_id = ?';
      params.push(escola_id);
    }

    if (data_inicio) {
      whereClause += ' AND sm.data_solicitacao >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND sm.data_solicitacao <= ?';
      params.push(data_fim);
    }

    const solicitacoes = await query(`
      SELECT 
        sm.id,
        sm.data_solicitacao,
        sm.escola_id,
        sm.cidade,
        sm.fornecedor,
        sm.nutricionista_email,
        sm.manutencao_descricao,
        sm.foto_equipamento,
        sm.valor,
        sm.data_servico,
        sm.numero_ordem_servico,
        sm.status,
        sm.observacoes,
        sm.data_cadastro,
        sm.data_atualizacao,
        e.nome_escola,
        e.rota,
        e.codigo_teknisa,
        u.nome as nutricionista_nome
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
      ORDER BY sm.data_solicitacao DESC, sm.data_cadastro DESC
    `, params);

    res.json({
      success: true,
      data: solicitacoes
    });
  } catch (error) {
    console.error('Erro ao buscar solicitações de manutenção:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar solicitações de manutenção'
    });
  }
};

module.exports = {
  listar,
  listarTodas
};
