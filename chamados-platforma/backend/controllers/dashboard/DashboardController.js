/**
 * Controller de Dashboard
 * Fornece métricas e estatísticas para o dashboard
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class DashboardController {
  
  /**
   * Obter estatísticas gerais do dashboard
   */
  static obterEstatisticas = asyncHandler(async (req, res) => {
    const usuarioId = req.user?.id;

    // Estatísticas básicas
    const [
      totalChamados,
      chamadosAbertos,
      chamadosEmAndamento,
      chamadosConcluidos,
      chamadosPorSistema,
      chamadosPorTipo,
      chamadosPorPrioridade,
      chamadosPorStatus,
      tempoMedioResolucao,
      chamadosPorMes,
      topUsuariosAbertura,
      topUsuariosResolucao
    ] = await Promise.all([
      // Total de chamados
      executeQuery('SELECT COUNT(*) as total FROM chamados WHERE ativo = 1'),
      
      // Chamados abertos
      executeQuery(`SELECT COUNT(*) as total FROM chamados WHERE status = 'aberto' AND ativo = 1`),
      
      // Chamados em andamento
      executeQuery(`SELECT COUNT(*) as total FROM chamados WHERE status IN ('em_analise', 'em_desenvolvimento', 'em_teste') AND ativo = 1`),
      
      // Chamados concluídos
      executeQuery(`SELECT COUNT(*) as total FROM chamados WHERE status = 'concluido' AND ativo = 1`),
      
      // Chamados por sistema
      executeQuery(`
        SELECT sistema, COUNT(*) as total 
        FROM chamados 
        WHERE ativo = 1 
        GROUP BY sistema 
        ORDER BY total DESC
      `),
      
      // Chamados por tipo
      executeQuery(`
        SELECT tipo, COUNT(*) as total 
        FROM chamados 
        WHERE ativo = 1 
        GROUP BY tipo 
        ORDER BY total DESC
      `),
      
      // Chamados por prioridade
      executeQuery(`
        SELECT prioridade, COUNT(*) as total 
        FROM chamados 
        WHERE ativo = 1 
        GROUP BY prioridade 
        ORDER BY 
          CASE prioridade 
            WHEN 'critica' THEN 1 
            WHEN 'alta' THEN 2 
            WHEN 'media' THEN 3 
            WHEN 'baixa' THEN 4 
          END
      `),
      
      // Chamados por status
      executeQuery(`
        SELECT status, COUNT(*) as total 
        FROM chamados 
        WHERE ativo = 1 
        GROUP BY status 
        ORDER BY total DESC
      `),
      
      // Tempo médio de resolução (em horas)
      executeQuery(`
        SELECT AVG(TIMESTAMPDIFF(HOUR, data_abertura, data_conclusao)) as tempo_medio
        FROM chamados 
        WHERE status = 'concluido' 
        AND data_conclusao IS NOT NULL 
        AND ativo = 1
        AND data_abertura >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `),
      
      // Chamados por mês (últimos 6 meses)
      executeQuery(`
        SELECT 
          DATE_FORMAT(data_abertura, '%Y-%m') as mes,
          COUNT(*) as total
        FROM chamados 
        WHERE ativo = 1 
        AND data_abertura >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(data_abertura, '%Y-%m')
        ORDER BY mes ASC
      `),
      
      // Top 5 usuários que mais abrem chamados
      executeQuery(`
        SELECT 
          u.id,
          u.nome,
          u.email,
          COUNT(c.id) as total_chamados
        FROM usuarios u
        INNER JOIN chamados c ON u.id = c.usuario_abertura_id
        WHERE c.ativo = 1
        GROUP BY u.id, u.nome, u.email
        ORDER BY total_chamados DESC
        LIMIT 5
      `),
      
      // Top 5 usuários que mais resolvem chamados
      executeQuery(`
        SELECT 
          u.id,
          u.nome,
          u.email,
          COUNT(c.id) as total_resolvidos
        FROM usuarios u
        INNER JOIN chamados c ON u.id = c.usuario_responsavel_id
        WHERE c.status = 'concluido' 
        AND c.ativo = 1
        GROUP BY u.id, u.nome, u.email
        ORDER BY total_resolvidos DESC
        LIMIT 5
      `)
    ]);

    // Chamados críticos abertos
    const chamadosCriticos = await executeQuery(`
      SELECT COUNT(*) as total 
      FROM chamados 
      WHERE prioridade = 'critica' 
      AND status != 'concluido' 
      AND status != 'fechado'
      AND ativo = 1
    `);

    // Chamados do usuário (se logado)
    let meusChamados = null;
    if (usuarioId) {
      const [meusAbertos, meusAtribuidos] = await Promise.all([
        executeQuery(`
          SELECT COUNT(*) as total 
          FROM chamados 
          WHERE usuario_abertura_id = ? 
          AND ativo = 1
        `, [usuarioId]),
        executeQuery(`
          SELECT COUNT(*) as total 
          FROM chamados 
          WHERE usuario_responsavel_id = ? 
          AND status != 'concluido' 
          AND status != 'fechado'
          AND ativo = 1
        `, [usuarioId])
      ]);
      
      meusChamados = {
        abertos: meusAbertos[0]?.total || 0,
        atribuidos: meusAtribuidos[0]?.total || 0
      };
    }

    const estatisticas = {
      resumo: {
        total: totalChamados[0]?.total || 0,
        abertos: chamadosAbertos[0]?.total || 0,
        em_andamento: chamadosEmAndamento[0]?.total || 0,
        concluidos: chamadosConcluidos[0]?.total || 0,
        criticos_abertos: chamadosCriticos[0]?.total || 0
      },
      distribuicao: {
        por_sistema: chamadosPorSistema,
        por_tipo: chamadosPorTipo,
        por_prioridade: chamadosPorPrioridade,
        por_status: chamadosPorStatus
      },
      metricas: {
        tempo_medio_resolucao_horas: parseFloat(tempoMedioResolucao[0]?.tempo_medio || 0).toFixed(2),
        chamados_por_mes: chamadosPorMes
      },
      rankings: {
        top_abertura: topUsuariosAbertura,
        top_resolucao: topUsuariosResolucao
      },
      meus_chamados: meusChamados
    };

    return successResponse(res, estatisticas, 'Estatísticas obtidas com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter dados temporais para gráficos
   */
  static obterDadosTemporais = asyncHandler(async (req, res) => {
    const { dias = 30 } = req.query;
    const user = req.user;

    // Calcular data inicial
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(dias));

    // Query base
    let baseQuery = `
      SELECT 
        DATE(c.data_abertura) as data,
        COUNT(*) as total,
        SUM(CASE WHEN c.status = 'aberto' THEN 1 ELSE 0 END) as abertos,
        SUM(CASE WHEN c.status IN ('concluido', 'fechado') THEN 1 ELSE 0 END) as concluidos
      FROM chamados c
      WHERE c.ativo = 1
      AND DATE(c.data_abertura) >= ?
    `;

    let params = [dataInicio.toISOString().split('T')[0]];

    // Aplicar filtros automáticos baseados no tipo de usuário
    if (user.tipo_de_acesso !== 'administrador') {
      if (user.tipo_de_acesso === 'usuario') {
        baseQuery += ' AND c.usuario_abertura_id = ?';
        params.push(user.id);
      } else if (user.tipo_de_acesso === 'tecnico') {
        baseQuery += ' AND (c.usuario_responsavel_id = ? OR c.usuario_responsavel_id IS NULL)';
        params.push(user.id);
      } else if (user.tipo_de_acesso === 'supervisor') {
        baseQuery += ' AND (c.usuario_responsavel_id = ? OR (c.usuario_responsavel_id IS NULL AND c.status = "aberto"))';
        params.push(user.id);
      }
    }

    baseQuery += ' GROUP BY DATE(c.data_abertura) ORDER BY data ASC';

    const dados = await executeQuery(baseQuery, params);

    // Formatar dados para o gráfico
    const dadosFormatados = dados.map(item => ({
      data: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total: parseInt(item.total),
      abertos: parseInt(item.abertos),
      concluidos: parseInt(item.concluidos)
    }));

    return successResponse(res, dadosFormatados, 'Dados temporais obtidos com sucesso', STATUS_CODES.OK);
  });
}

module.exports = DashboardController;

