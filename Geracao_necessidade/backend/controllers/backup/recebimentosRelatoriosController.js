const { query } = require('../config/database');

// Relatório de Pendências (tipo_recebimento = 'Parcial')
const relatorioPendencias = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { data_inicio, data_fim, tipo_entrega, rota } = req.query;
    
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
    `, params);

    // Calcular métricas específicas de pendências
    const escolasUnicas = [...new Set(pendencias.map(p => p.escola_id))];
    const escolasComPendencias = escolasUnicas.length;
    const totalProdutos = pendencias.filter(p => p.produto_nome).length;
    
    // Buscar total de escolas na base (todas as escolas cadastradas, independente de recebimentos)
    const totalEscolasBase = await query(`
      SELECT COUNT(*) as total
      FROM escolas e
      WHERE e.ativo = 1
    `);
    
    const totalEscolas = totalEscolasBase[0].total;
    const escolasSemPendencia = totalEscolas - escolasComPendencias;
    const percentualPendencia = totalEscolas > 0 ? ((escolasComPendencias / totalEscolas) * 100).toFixed(1) : 0;
    
    // Agrupar por rota
    const porRota = {};
    escolasUnicas.forEach(escolaId => {
      const escola = pendencias.find(p => p.escola_id === escolaId);
      if (escola) {
        if (!porRota[escola.rota]) {
          porRota[escola.rota] = { escolas: 0, produtos: 0 };
        }
        porRota[escola.rota].escolas++;
        porRota[escola.rota].produtos += pendencias.filter(p => p.escola_id === escolaId && p.produto_nome).length;
      }
    });

    res.json({
      success: true,
      data: {
        pendencias,
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

// Relatório de Completos (tipo_recebimento = 'Completo')
const relatorioCompletos = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { data_inicio, data_fim, tipo_entrega, rota } = req.query;
    
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
    `, params);

    // Calcular métricas específicas de completos
    const escolasCompletas = completos.length;
    
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

// Dashboard geral com métricas
const dashboardRelatorios = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { data_inicio, data_fim } = req.query;
    
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

    // Métricas gerais
    const metricas = await query(`
      SELECT 
        COUNT(*) as total_recebimentos,
        COUNT(DISTINCT re.escola_id) as total_escolas,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as recebimentos_completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as recebimentos_parciais,
        COUNT(DISTINCT CASE WHEN re.tipo_recebimento = 'Completo' THEN re.escola_id END) as escolas_completas,
        COUNT(DISTINCT CASE WHEN re.tipo_recebimento = 'Parcial' THEN re.escola_id END) as escolas_parciais
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
    `, params);

    // Métricas por tipo de entrega
    const porTipoEntrega = await query(`
      SELECT 
        re.tipo_entrega,
        COUNT(*) as total,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais,
        COUNT(DISTINCT re.escola_id) as escolas_unicas
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
      GROUP BY re.tipo_entrega
      ORDER BY total DESC
    `, params);

    // Métricas por rota
    const porRota = await query(`
      SELECT 
        e.rota,
        COUNT(*) as total_recebimentos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais,
        COUNT(DISTINCT re.escola_id) as escolas_unicas
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
      GROUP BY e.rota
      ORDER BY total_recebimentos DESC
    `, params);

    res.json({
      success: true,
      data: {
        metricas: metricas[0],
        porTipoEntrega,
        porRota
      }
    });
  } catch (error) {
    console.error('Erro ao gerar dashboard:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar dashboard'
    });
  }
};

module.exports = {
  relatorioPendencias,
  relatorioCompletos,
  dashboardRelatorios
};
