const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  asyncHandler 
} = require('../../middleware/responseHandler');
const DashboardStatsController = require('./DashboardStatsController');
const DashboardAlertsController = require('./DashboardAlertsController');
const DashboardRecentController = require('./DashboardRecentController');

class DashboardController {
  // GET /api/dashboard/stats - Buscar estatísticas do dashboard
  static getStats = asyncHandler(async (req, res) => {
    try {
      console.log('Iniciando busca de estatísticas do dashboard...');
      
      // Buscar todas as estatísticas em paralelo
      const [statusStats, typeStats, userStats, savingStats] = await Promise.all([
        DashboardStatsController.getStatusStats(),
        DashboardStatsController.getTypeStats(),
        DashboardStatsController.getUserStats(),
        DashboardStatsController.getSavingStats()
      ]);

      // Combinar todas as estatísticas
      const stats = {
        ...statusStats,
        ...typeStats,
        usuariosAtivos: userStats,
        ...savingStats,
        totalCotacoes: statusStats.pendentes + statusStats.aguardando_supervisor + 
                      statusStats.aprovadas + statusStats.rejeitadas + 
                      statusStats.renegociacao + statusStats.em_analise
      };

      // Adicionar links HATEOAS
      const responseData = res.addHateoasLinks(stats);

      return successResponse(res, responseData, 'Estatísticas carregadas com sucesso');
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  });

  // GET /api/dashboard/recent - Buscar cotações recentes
  static getRecent = asyncHandler(async (req, res) => {
    try {
      console.log('Iniciando busca de cotações recentes...');
      
      const { limit = 5 } = req.query;
      const recentData = await DashboardRecentController.getRecent(limit);

      // Adicionar links HATEOAS
      const responseData = res.addHateoasLinks(recentData);

      return successResponse(res, responseData, 'Cotações recentes carregadas com sucesso');
    } catch (error) {
      console.error('Erro ao obter cotações recentes:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  });

  // GET /api/dashboard/alerts - Buscar alertas
  static getAlerts = asyncHandler(async (req, res) => {
    try {
      console.log('Iniciando busca de alertas...');
      
      const alertas = await DashboardAlertsController.getAlerts();

      const responseData = {
        alertas,
        total: alertas.length
      };

      // Adicionar links HATEOAS
      const responseWithLinks = res.addHateoasLinks(responseData);

      return successResponse(res, responseWithLinks, 'Alertas carregados com sucesso');
    } catch (error) {
      console.error('Erro ao obter alertas:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  });

  // GET /api/dashboard/activity - Buscar atividades recentes
  static getActivity = asyncHandler(async (req, res) => {
    try {
      console.log('Iniciando busca de atividades recentes...');
      
      const { limit = 10, type = 'all' } = req.query;
      const limitNumber = Math.max(1, Math.min(50, parseInt(limit) || 10));
      const activities = [];

      // Buscar atividades de cotações
      try {
        const cotacoesActivity = await executeQuery(`
          SELECT 
            'cotacao' as type,
            id,
            CONCAT('Cotação #', id, ' ', status) as title,
            data_criacao as time,
            status
          FROM cotacoes 
          ORDER BY data_criacao DESC 
          LIMIT ${limitNumber}
        `, []);

        activities.push(...cotacoesActivity);
      } catch (error) {
        console.error('Erro ao buscar atividades de cotações:', error.message);
      }

      // Buscar atividades de usuários
      try {
        const usuariosActivity = await executeQuery(`
          SELECT 
            'usuario' as type,
            id,
            CONCAT('Usuário ', name, ' ', status) as title,
            created_at as time,
            status
          FROM users 
          ORDER BY created_at DESC 
          LIMIT ${limitNumber}
        `, []);

        activities.push(...usuariosActivity);
      } catch (error) {
        console.error('Erro ao buscar atividades de usuários:', error.message);
      }

      // Ordenar por data e limitar
      const sortedActivities = activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, limitNumber);

      // Formatar atividades
      const formattedActivities = sortedActivities.map(activity => {
        const timeText = formatRelativeTime(activity.time);

        let color = '#3B82F6'; // azul padrão
        let icon = '📋';

        switch (activity.type) {
          case 'cotacao':
            switch (activity.status) {
              case 'aprovada':
                color = '#10B981';
                icon = '✅';
                break;
              case 'rejeitada':
                color = '#EF4444';
                icon = '❌';
                break;
              case 'pendente':
                color = '#F59E0B';
                icon = '⏳';
                break;
              case 'em_analise':
                color = '#8B5CF6';
                icon = '🔍';
                break;
              default:
                color = '#6B7280';
                icon = '📋';
            }
            break;
          case 'usuario':
            color = '#3B82F6';
            icon = '👤';
            break;
        }

        return {
          id: activity.id,
          type: activity.type,
          title: activity.title,
          time: activity.time,
          timeText,
          status: activity.status,
          color,
          icon
        };
      });

      const responseData = {
        activities: formattedActivities,
        total: formattedActivities.length
      };

      // Adicionar links HATEOAS
      const responseWithLinks = res.addHateoasLinks(responseData);

      return successResponse(res, responseWithLinks, 'Atividades carregadas com sucesso');
    } catch (error) {
      console.error('Erro ao obter atividades recentes:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  });
}

// Função auxiliar para formatar tempo relativo
const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const activityDate = new Date(date);
  const diffInMs = now - activityDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Agora mesmo';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h atrás`;
  } else if (diffInDays < 7) {
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  } else {
    return activityDate.toLocaleDateString('pt-BR');
  }
};

module.exports = DashboardController;
