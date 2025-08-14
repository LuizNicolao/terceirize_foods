const { executeQuery } = require('../../config/database');

/**
 * Controller do Dashboard
 * Gerencia estatísticas e dados principais do sistema
 */

class DashboardController {
  /**
   * Obter estatísticas gerais do dashboard
   * GET /cotacao/api/dashboard/stats
   */
  static async getStats(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;

      // Estatísticas de cotações
      const cotacoesStats = await this.getCotacoesStats(userId, userRole);
      
      // Estatísticas de fornecedores
      const fornecedoresStats = await this.getFornecedoresStats();
      
      // Estatísticas de produtos
      const produtosStats = await this.getProdutosStats();
      
      // Estatísticas de usuários
      const usuariosStats = await this.getUsuariosStats();
      
      // Cotação do dólar (última)
      const dolarRate = await this.getDolarRate();

      res.status(200).json({
        data: {
          cotacoes: cotacoesStats,
          fornecedores: fornecedoresStats,
          produtos: produtosStats,
          usuarios: usuariosStats,
          dolarRate: dolarRate
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }

  /**
   * Obter estatísticas de cotações
   */
  static async getCotacoesStats(userId, userRole) {
    try {
      let whereClause = '';
      
      // Filtrar por usuário se não for admin
      if (userRole !== 'administrador') {
        whereClause = 'WHERE created_by = ?';
      }

      // Total de cotações
      const totalQuery = `
        SELECT COUNT(*) as total FROM cotacoes ${whereClause}
      `;
      const totalResult = await executeQuery(totalQuery, userRole !== 'administrador' ? [userId] : []);

      // Cotações por status
      const statusQuery = `
        SELECT 
          status,
          COUNT(*) as count
        FROM cotacoes ${whereClause}
        GROUP BY status
      `;
      const statusResult = await executeQuery(statusQuery, userRole !== 'administrador' ? [userId] : []);

      // Cotações dos últimos 30 dias
      const recentQuery = `
        SELECT COUNT(*) as recent
        FROM cotacoes 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ${userRole !== 'administrador' ? 'AND created_by = ?' : ''}
      `;
      const recentResult = await executeQuery(recentQuery, userRole !== 'administrador' ? [userId] : []);

      // Valor total das cotações
      const valorQuery = `
        SELECT 
          SUM(valor_total) as valor_total,
          AVG(valor_total) as valor_medio
        FROM cotacoes 
        WHERE status = 'aprovada' ${userRole !== 'administrador' ? 'AND created_by = ?' : ''}
      `;
      const valorResult = await executeQuery(valorQuery, userRole !== 'administrador' ? [userId] : []);

      // Organizar dados por status
      const statusData = {};
      statusResult.forEach(item => {
        statusData[item.status] = item.count;
      });

      return {
        total: totalResult[0]?.total || 0,
        recent: recentResult[0]?.recent || 0,
        valorTotal: valorResult[0]?.valor_total || 0,
        valorMedio: valorResult[0]?.valor_medio || 0,
        porStatus: {
          pendente: statusData['pendente'] || 0,
          aprovada: statusData['aprovada'] || 0,
          rejeitada: statusData['rejeitada'] || 0,
          renegociacao: statusData['renegociacao'] || 0,
          cancelada: statusData['cancelada'] || 0
        }
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas de cotações:', error);
      return {
        total: 0,
        recent: 0,
        valorTotal: 0,
        valorMedio: 0,
        porStatus: {
          pendente: 0,
          aprovada: 0,
          rejeitada: 0,
          renegociacao: 0,
          cancelada: 0
        }
      };
    }
  }

  /**
   * Obter estatísticas de fornecedores
   */
  static async getFornecedoresStats() {
    try {
      // Total de fornecedores
      const totalQuery = 'SELECT COUNT(*) as total FROM fornecedores WHERE status = "ativo"';
      const totalResult = await executeQuery(totalQuery);

      // Fornecedores por categoria
      const categoriaQuery = `
        SELECT 
          categoria,
          COUNT(*) as count
        FROM fornecedores 
        WHERE status = "ativo"
        GROUP BY categoria
      `;
      const categoriaResult = await executeQuery(categoriaQuery);

      // Fornecedores dos últimos 30 dias
      const recentQuery = `
        SELECT COUNT(*) as recent
        FROM fornecedores 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status = "ativo"
      `;
      const recentResult = await executeQuery(recentQuery);

      return {
        total: totalResult[0]?.total || 0,
        recent: recentResult[0]?.recent || 0,
        porCategoria: categoriaResult.reduce((acc, item) => {
          acc[item.categoria] = item.count;
          return acc;
        }, {})
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas de fornecedores:', error);
      return {
        total: 0,
        recent: 0,
        porCategoria: {}
      };
    }
  }

  /**
   * Obter estatísticas de produtos
   */
  static async getProdutosStats() {
    try {
      // Total de produtos
      const totalQuery = 'SELECT COUNT(*) as total FROM produtos WHERE status = "ativo"';
      const totalResult = await executeQuery(totalQuery);

      // Produtos por categoria
      const categoriaQuery = `
        SELECT 
          categoria,
          COUNT(*) as count
        FROM produtos 
        WHERE status = "ativo"
        GROUP BY categoria
      `;
      const categoriaResult = await executeQuery(categoriaQuery);

      // Produtos dos últimos 30 dias
      const recentQuery = `
        SELECT COUNT(*) as recent
        FROM produtos 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status = "ativo"
      `;
      const recentResult = await executeQuery(recentQuery);

      return {
        total: totalResult[0]?.total || 0,
        recent: recentResult[0]?.recent || 0,
        porCategoria: categoriaResult.reduce((acc, item) => {
          acc[item.categoria] = item.count;
          return acc;
        }, {})
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas de produtos:', error);
      return {
        total: 0,
        recent: 0,
        porCategoria: {}
      };
    }
  }

  /**
   * Obter estatísticas de usuários
   */
  static async getUsuariosStats() {
    try {
      // Total de usuários ativos
      const totalQuery = 'SELECT COUNT(*) as total FROM users WHERE status = "ativo"';
      const totalResult = await executeQuery(totalQuery);

      // Usuários por role
      const roleQuery = `
        SELECT 
          role,
          COUNT(*) as count
        FROM users 
        WHERE status = "ativo"
        GROUP BY role
      `;
      const roleResult = await executeQuery(roleQuery);

      // Usuários dos últimos 30 dias
      const recentQuery = `
        SELECT COUNT(*) as recent
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status = "ativo"
      `;
      const recentResult = await executeQuery(recentQuery);

      return {
        total: totalResult[0]?.total || 0,
        recent: recentResult[0]?.recent || 0,
        porRole: roleResult.reduce((acc, item) => {
          acc[item.role] = item.count;
          return acc;
        }, {})
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
      return {
        total: 0,
        recent: 0,
        porRole: {}
      };
    }
  }

  /**
   * Obter cotação do dólar
   */
  static async getDolarRate() {
    try {
      // Buscar última cotação do dólar (se existir tabela específica)
      // Por enquanto, retornar valor fixo ou buscar de API externa
      return {
        valor: 5.25, // Valor exemplo
        data: new Date().toISOString(),
        fonte: 'API Externa'
      };

    } catch (error) {
      console.error('Erro ao buscar cotação do dólar:', error);
      return {
        valor: 0,
        data: new Date().toISOString(),
        fonte: 'Erro'
      };
    }
  }

  /**
   * Obter gráfico de cotações por mês
   * GET /cotacao/api/dashboard/chart-cotacoes
   */
  static async getCotacoesChart(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;

      let whereClause = '';
      if (userRole !== 'administrador') {
        whereClause = 'WHERE created_by = ?';
      }

      const query = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as mes,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'aprovada' THEN 1 ELSE 0 END) as aprovadas,
          SUM(CASE WHEN status = 'rejeitada' THEN 1 ELSE 0 END) as rejeitadas,
          SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes
        FROM cotacoes ${whereClause}
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY mes DESC
      `;

      const result = await executeQuery(query, userRole !== 'administrador' ? [userId] : []);

      res.status(200).json({
        data: result
      });

    } catch (error) {
      console.error('Erro ao buscar gráfico de cotações:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }

  /**
   * Obter últimas atividades
   * GET /cotacao/api/dashboard/recent-activities
   */
  static async getRecentActivities(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;

      let whereClause = '';
      if (userRole !== 'administrador') {
        whereClause = 'WHERE created_by = ?';
      }

      const query = `
        SELECT 
          id,
          titulo,
          status,
          created_at,
          created_by
        FROM cotacoes ${whereClause}
        ORDER BY created_at DESC
        LIMIT 10
      `;

      const result = await executeQuery(query, userRole !== 'administrador' ? [userId] : []);

      res.status(200).json({
        data: result
      });

    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }
}

module.exports = DashboardController;
