const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// Middleware de autenticação
const auth = require('../middleware/auth');

// GET /api/dashboard/stats - Buscar estatísticas do dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    // Buscar estatísticas das cotações
    const cotacoesStats = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
        SUM(CASE WHEN status = 'aprovada' THEN 1 ELSE 0 END) as aprovadas,
        SUM(CASE WHEN status = 'rejeitada' THEN 1 ELSE 0 END) as rejeitadas
      FROM cotacoes 
      WHERE MONTH(data_criacao) = MONTH(CURRENT_DATE())
      AND YEAR(data_criacao) = YEAR(CURRENT_DATE())
    `);

    // Buscar economia total (diferença entre preços)
    const economiaStats = await executeQuery(`
      SELECT 
        COALESCE(SUM(economia_total), 0) as economia_total
      FROM cotacoes 
      WHERE status = 'aprovada'
      AND MONTH(data_criacao) = MONTH(CURRENT_DATE())
      AND YEAR(data_criacao) = YEAR(CURRENT_DATE())
    `);

    // Buscar usuários ativos
    const usuariosStats = await executeQuery(`
      SELECT COUNT(*) as usuarios_ativos
      FROM usuarios 
      WHERE status = 'ativo'
    `);

    const stats = {
      totalCotacoes: cotacoesStats[0]?.total || 0,
      cotacoesPendentes: cotacoesStats[0]?.pendentes || 0,
      cotacoesAprovadas: cotacoesStats[0]?.aprovadas || 0,
      cotacoesRejeitadas: cotacoesStats[0]?.rejeitadas || 0,
      totalEconomia: economiaStats[0]?.economia_total || 0,
      usuariosAtivos: usuariosStats[0]?.usuarios_ativos || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/activity - Buscar atividades recentes
router.get('/activity', auth, async (req, res) => {
  try {
    const activities = await executeQuery(`
      SELECT 
        'cotacao' as type,
        id,
        CONCAT('Cotação #', id, ' ', 
          CASE 
            WHEN status = 'aprovada' THEN 'aprovada'
            WHEN status = 'rejeitada' THEN 'rejeitada'
            WHEN status = 'pendente' THEN 'criada'
            ELSE status
          END
        ) as title,
        data_criacao as time,
        status
      FROM cotacoes 
      ORDER BY data_criacao DESC 
      LIMIT 10
    `);

    const formattedActivities = activities.map(activity => {
      const timeDiff = Math.floor((Date.now() - new Date(activity.time)) / (1000 * 60 * 60));
      let timeText = '';
      
      if (timeDiff < 1) {
        timeText = 'Agora mesmo';
      } else if (timeDiff < 24) {
        timeText = `${timeDiff} horas atrás`;
      } else {
        const days = Math.floor(timeDiff / 24);
        timeText = `${days} dia${days > 1 ? 's' : ''} atrás`;
      }

      let color = '#3B82F6'; // azul padrão
      if (activity.status === 'aprovada') color = '#10B981'; // verde
      if (activity.status === 'rejeitada') color = '#EF4444'; // vermelho
      if (activity.status === 'pendente') color = '#F59E0B'; // amarelo

      return {
        id: activity.id,
        type: `cotacao_${activity.status}`,
        title: activity.title,
        time: timeText,
        color: color
      };
    });

    res.json(formattedActivities);
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 