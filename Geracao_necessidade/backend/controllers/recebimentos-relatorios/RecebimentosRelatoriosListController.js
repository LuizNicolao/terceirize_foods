const { query } = require('../../config/database');

const relatorioPendencias = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { data_inicio, data_fim, tipo_entrega, rota, semana_abastecimento } = req.query;
    const { page = 1, limit = 10 } = req.pagination;
    
    let whereClause = 'WHERE re.tipo_recebimento = "Parcial"';
    let params = [];

    // Filtro por usuário (supervisores só veem suas rotas)
    if (userType === 'Supervisao') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    // Filtros opcionais
    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (rota) {
      whereClause += ' AND e.rota = ?';
      params.push(rota);
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

    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    const pendencias = await query(`
      SELECT 
        re.id,
        re.escola_id,
        e.nome_escola,
        e.rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        u.nome as nutricionista_nome,
        p.nome as produto_nome,
        rp.quantidade as produto_quantidade,
        p.unidade_medida as produto_unidade
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      LEFT JOIN recebimentos_produtos rp ON re.id = rp.recebimento_id
      LEFT JOIN produtos p ON rp.produto_id = p.id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, e.rota ASC, e.nome_escola ASC, p.nome ASC
      LIMIT ${limit} OFFSET ${offset}
    `, params);

    // Contar total de registros para paginação
    const [totalResult] = await query(`
      SELECT COUNT(*) as total
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      LEFT JOIN recebimentos_produtos rp ON re.id = rp.recebimento_id
      LEFT JOIN produtos p ON rp.produto_id = p.id
      ${whereClause}
    `, params);
    
    const totalRegistros = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(totalRegistros / limit);

    // Calcular métricas específicas de pendências baseadas no total geral (não apenas da página atual)
    // Buscar total de escolas com pendências (sem paginação)
    const escolasComPendenciasQuery = await query(`
      SELECT COUNT(DISTINCT re.escola_id) as total
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
    `, params);
    
    const escolasComPendencias = escolasComPendenciasQuery[0]?.total || 0;
    
    // Buscar total de registros de pendências (sem paginação)
    const totalProdutosQuery = await query(`
      SELECT COUNT(*) as total
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
    `, params);
    
    const totalProdutos = totalProdutosQuery[0]?.total || 0;
    
    // Buscar total de escolas na base (todas as escolas cadastradas, independente de recebimentos)
    const totalEscolasBase = await query(`
      SELECT COUNT(*) as total
      FROM escolas e
      WHERE e.ativo = 1
    `);
    
    const totalEscolas = totalEscolasBase[0].total;
    const escolasSemPendencia = totalEscolas - escolasComPendencias;
    const percentualPendencia = totalEscolas > 0 ? ((escolasComPendencias / totalEscolas) * 100).toFixed(1) : 0;
    
    // Agrupar por rota baseado no total geral (não apenas da página atual)
    const porRotaQuery = await query(`
      SELECT 
        e.rota,
        COUNT(DISTINCT re.escola_id) as escolas,
        COUNT(*) as produtos
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
      GROUP BY e.rota
      ORDER BY e.rota
    `, params);
    
    const porRota = {};
    porRotaQuery.forEach(item => {
      porRota[item.rota] = {
        escolas: item.escolas,
        produtos: item.produtos
      };
    });

    res.json({
      success: true,
      data: {
        pendencias,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalRegistros,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        metricas: {
          escolasComPendencias,
          escolasSemPendencia,
          totalRegistros: totalProdutos,
          totalEscolasBase: totalEscolas,
          percentualPendencia,
          porRota
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de pendências:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar relatório de pendências'
    });
  }
};

const relatorioCompletos = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { data_inicio, data_fim, tipo_entrega, rota, semana_abastecimento } = req.query;
    const { page = 1, limit = 10 } = req.pagination;
    
    let whereClause = 'WHERE re.tipo_recebimento = "Completo"';
    let params = [];

    // Filtro por usuário (supervisores só veem suas rotas)
    if (userType === 'Supervisao') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    // Filtros opcionais
    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (rota) {
      whereClause += ' AND e.rota = ?';
      params.push(rota);
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

    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    const completos = await query(`
      SELECT 
        re.id,
        re.escola_id,
        e.nome_escola,
        e.rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.pendencia_anterior,
        re.observacoes,
        u.nome as nutricionista_nome
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, e.rota ASC, e.nome_escola ASC
      LIMIT ${limit} OFFSET ${offset}
    `, params);

    // Contar total de registros para paginação
    const [totalResult] = await query(`
      SELECT COUNT(*) as total
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `, params);
    
    const totalRegistros = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(totalRegistros / limit);

    // Calcular métricas específicas de completos baseadas no total geral (não apenas da página atual)
    // Buscar total de escolas com recebimentos completos (sem paginação)
    const escolasCompletasQuery = await query(`
      SELECT COUNT(DISTINCT re.escola_id) as total
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `, params);
    
    const escolasCompletas = escolasCompletasQuery[0]?.total || 0;
    
    // Buscar total de escolas na base (todas as escolas cadastradas, independente de recebimentos)
    const totalEscolasBase = await query(`
      SELECT COUNT(*) as total
      FROM escolas e
      WHERE e.ativo = 1
    `);
    
    const totalEscolas = totalEscolasBase[0].total;
    const escolasIncompletas = totalEscolas - escolasCompletas;
    const percentualCompleto = totalEscolas > 0 ? ((escolasCompletas / totalEscolas) * 100).toFixed(1) : 0;
    
    // Agrupar por rota
    const porRota = completos.reduce((acc, c) => {
      if (!acc[c.rota]) {
        acc[c.rota] = { escolas: 0 };
      }
      acc[c.rota].escolas++;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        completos,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalRegistros,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        metricas: {
          escolasCompletas,
          escolasIncompletas,
          totalEscolasBase: totalEscolas,
          percentualCompleto,
          porRota
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de completos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar relatório de completos'
    });
  }
};

const listar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { data_inicio, data_fim, tipo_entrega, rota, tipo_recebimento } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro por usuário (supervisores só veem suas rotas)
    if (userType === 'Supervisao') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    // Filtros opcionais
    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (rota) {
      whereClause += ' AND e.rota = ?';
      params.push(rota);
    }

    if (tipo_recebimento) {
      whereClause += ' AND re.tipo_recebimento = ?';
      params.push(tipo_recebimento);
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
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        u.nome as nutricionista_nome
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, e.rota ASC, e.nome_escola ASC
    `, params);

    res.json({
      success: true,
      message: 'Relatórios carregados com sucesso',
      data: { items: recebimentos }
    });
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  relatorioPendencias,
  relatorioCompletos,
  listar
};
