const { query } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { 
      search, 
      escola_id, 
      tipo_recebimento, 
      tipo_entrega, 
      data_inicio, 
      data_fim,
      semana_abastecimento,
      page = 1,
      limit = 10
    } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro por usuário (nutricionistas só veem suas escolas)
    if (userType === 'Nutricionista') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR e.rota LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (escola_id) {
      whereClause += ' AND re.escola_id = ?';
      params.push(escola_id);
    }

    if (tipo_recebimento) {
      whereClause += ' AND re.tipo_recebimento = ?';
      params.push(tipo_recebimento);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    // Filtro por semana de abastecimento
    if (semana_abastecimento && semana_abastecimento !== 'todas') {
      try {
        // Parse da semana no formato "DD/MM a DD/MM"
        const [inicioStr, fimStr] = semana_abastecimento.split(' a ');
        const [diaInicio, mesInicio] = inicioStr.split('/');
        const [diaFim, mesFim] = fimStr.split('/');
        
        // Usar ano atual ou ano dos dados existentes
        const anoRef = new Date().getFullYear();
        
        const dataInicio = `${anoRef}-${mesInicio.padStart(2, '0')}-${diaInicio.padStart(2, '0')}`;
        const dataFim = `${anoRef}-${mesFim.padStart(2, '0')}-${diaFim.padStart(2, '0')}`;
        
        whereClause += ' AND re.data_recebimento >= ? AND re.data_recebimento <= ?';
        params.push(dataInicio, dataFim);
      } catch (error) {
        console.error('Erro ao processar filtro de semana:', error);
        // Se houver erro no parsing, ignora o filtro
      }
    }

    // Calcular paginação com validação
    const pageNum = parseInt(page) || 1;
    const limitNum = limit === 'all' ? null : parseInt(limit) || 10;
    
    // Garantir que os valores sejam números válidos e positivos
    const validPageNum = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validLimitNum = limitNum === null ? null : (isNaN(limitNum) || limitNum < 1 ? 10 : limitNum);
    
    const offset = validLimitNum ? (validPageNum - 1) * validLimitNum : 0;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = validLimitNum ? Math.ceil(totalItems / validLimitNum) : 1;

    // Query principal com paginação
    const limitClause = validLimitNum ? `LIMIT ${validLimitNum} OFFSET ${offset}` : '';
    const recebimentos = await query(`
      SELECT 
        re.id,
        re.escola_id,
        e.nome_escola,
        e.rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.status_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        re.ativo,
        re.data_cadastro,
        re.data_atualizacao,
        u.nome as usuario_nome
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, e.nome_escola ASC
      ${limitClause}
    `, params);

    // Calcular estatísticas de status
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN re.status_entrega = 'No Prazo' THEN 1 ELSE 0 END) as noPrazo,
        SUM(CASE WHEN re.status_entrega = 'Atrasado' THEN 1 ELSE 0 END) as atrasado,
        SUM(CASE WHEN re.status_entrega = 'Antecipado' THEN 1 ELSE 0 END) as antecipado
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `;
    
    const statsResult = await query(statsQuery, params);
    const stats = statsResult && statsResult[0] ? statsResult[0] : { total: 0, noPrazo: 0, atrasado: 0, antecipado: 0 };

    res.json({
      success: true,
      data: recebimentos,
      pagination: {
        currentPage: validPageNum,
        totalPages,
        totalItems,
        itemsPerPage: validLimitNum || totalItems,
        hasNextPage: validPageNum < totalPages,
        hasPrevPage: validPageNum > 1,
        noPrazo: stats.noPrazo || 0,
        atrasado: stats.atrasado || 0,
        antecipado: stats.antecipado || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar recebimentos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar recebimentos'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { 
      search, 
      escola_id, 
      tipo_recebimento, 
      tipo_entrega, 
      data_inicio, 
      data_fim,
      semana_abastecimento
    } = req.query;
    
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro por usuário (nutricionistas só veem suas escolas)
    if (userType === 'Nutricionista') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR e.rota LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (escola_id) {
      whereClause += ' AND re.escola_id = ?';
      params.push(escola_id);
    }

    if (tipo_recebimento) {
      whereClause += ' AND re.tipo_recebimento = ?';
      params.push(tipo_recebimento);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    // Filtro por semana de abastecimento
    if (semana_abastecimento && semana_abastecimento !== 'todas') {
      try {
        // Parse da semana no formato "DD/MM a DD/MM"
        const [inicioStr, fimStr] = semana_abastecimento.split(' a ');
        const [diaInicio, mesInicio] = inicioStr.split('/');
        const [diaFim, mesFim] = fimStr.split('/');
        
        // Usar ano atual ou ano dos dados existentes
        const anoRef = new Date().getFullYear();
        
        const dataInicio = `${anoRef}-${mesInicio.padStart(2, '0')}-${diaInicio.padStart(2, '0')}`;
        const dataFim = `${anoRef}-${mesFim.padStart(2, '0')}-${diaFim.padStart(2, '0')}`;
        
        whereClause += ' AND re.data_recebimento >= ? AND re.data_recebimento <= ?';
        params.push(dataInicio, dataFim);
      } catch (error) {
        console.error('Erro ao processar filtro de semana:', error);
        // Se houver erro no parsing, ignora o filtro
      }
    }

    const recebimentos = await query(`
      SELECT 
        re.id,
        re.escola_id,
        e.nome_escola,
        e.rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.status_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        re.ativo,
        re.data_cadastro,
        re.data_atualizacao,
        u.nome as usuario_nome
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, e.nome_escola ASC
    `, params);


    res.json({
      success: true,
      data: recebimentos
    });
  } catch (error) {
    console.error('Erro ao buscar recebimentos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar recebimentos'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { id } = req.params;

    let whereClause = 'WHERE re.id = ?';
    let params = [id];

    // Filtro por usuário (nutricionistas só veem seus recebimentos)
    if (userType === 'Nutricionista') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    const recebimentos = await query(`
      SELECT 
        re.id,
        re.escola_id,
        e.nome_escola,
        e.rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.status_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        re.ativo,
        re.data_cadastro,
        re.data_atualizacao,
        u.nome as usuario_nome
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `, params);

    if (recebimentos.length === 0) {
      return res.status(404).json({
        error: 'Recebimento não encontrado',
        message: 'Recebimento não encontrado'
      });
    }

    const recebimento = recebimentos[0];

    // Se for recebimento parcial, buscar produtos
    if (recebimento.tipo_recebimento === 'Parcial') {
      const produtos = await query(`
        SELECT 
          rp.id,
          rp.produto_id,
          p.nome as nome_produto,
          p.unidade_medida,
          rp.quantidade
        FROM recebimentos_produtos rp
        INNER JOIN produtos p ON rp.produto_id = p.id
        WHERE rp.recebimento_id = ?
        ORDER BY p.nome ASC
      `, [id]);

      recebimento.produtos = produtos;
    }

    res.json({
      success: true,
      data: recebimento
    });
  } catch (error) {
    console.error('Erro ao buscar recebimento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar recebimento'
    });
  }
};

const listarProdutosPorTipo = async (req, res) => {
  try {
    const { tipo_entrega } = req.query;
    
    // Mapear tipos de entrega para tipos da tabela produtos
    const mapeamentoTipos = {
      'HORTI': 'Horti',
      'PAO': 'Pao', 
      'PERECIVEL': 'Pereciveis',
      'BASE SECA': 'Base Seca',
      'LIMPEZA': 'Limpeza'
    };
    
    let whereClause = 'WHERE p.ativo = 1';
    let params = [];
    
    // Se tipo_entrega foi especificado, filtrar por ele
    if (tipo_entrega && mapeamentoTipos[tipo_entrega]) {
      whereClause += ' AND p.tipo = ?';
      params.push(mapeamentoTipos[tipo_entrega]);
    }
    
    // Buscar todos os produtos (sem paginação para o dropdown)
    const produtos = await query(`
      SELECT 
        p.id, 
        p.nome, 
        p.unidade_medida,
        p.tipo
      FROM produtos p
      ${whereClause}
      ORDER BY p.nome ASC
    `, params);

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos por tipo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos por tipo'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  buscarPorId,
  listarProdutosPorTipo
};
