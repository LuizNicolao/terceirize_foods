/**
 * Controller de Estatísticas para Cotações
 * Responsável pelas operações de estatísticas e relatórios
 */

const { executeQuery } = require('../../config/database');

class CotacoesStatsController {
  // GET /api/cotacoes/stats/overview - Estatísticas gerais
  static async buscarEstatisticas(req, res) {
    try {
      const [stats] = await executeQuery(`
        SELECT 
          status,
          COUNT(*) as count
        FROM cotacoes 
        GROUP BY status
      `);
      
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // GET /api/cotacoes/stats/por-periodo - Estatísticas por período
  static async buscarEstatisticasPorPeriodo(req, res) {
    try {
      const { inicio, fim } = req.query;
      
      let query = `
        SELECT 
          status,
          COUNT(*) as count,
          DATE(data_criacao) as data
        FROM cotacoes 
      `;
      
      const params = [];
      
      if (inicio && fim) {
        query += ` WHERE data_criacao BETWEEN ? AND ?`;
        params.push(inicio, fim);
      }
      
      query += ` GROUP BY status, DATE(data_criacao) ORDER BY data_criacao DESC`;
      
      const [stats] = await executeQuery(query, params);
      
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas por período:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // GET /api/cotacoes/stats/por-usuario - Estatísticas por usuário
  static async buscarEstatisticasPorUsuario(req, res) {
    try {
      const [stats] = await executeQuery(`
        SELECT 
          u.name as usuario,
          c.status,
          COUNT(*) as count
        FROM cotacoes c
        LEFT JOIN users u ON c.usuario_id = u.id
        GROUP BY u.name, c.status
        ORDER BY u.name, c.status
      `);
      
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas por usuário:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // GET /api/cotacoes/stats/por-tipo - Estatísticas por tipo de compra
  static async buscarEstatisticasPorTipo(req, res) {
    try {
      const [stats] = await executeQuery(`
        SELECT 
          tipo_compra,
          status,
          COUNT(*) as count
        FROM cotacoes 
        GROUP BY tipo_compra, status
        ORDER BY tipo_compra, status
      `);
      
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas por tipo:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // GET /api/cotacoes/stats/resumo - Resumo geral
  static async buscarResumoGeral(req, res) {
    try {
      // Total de cotações
      const [totalCotacoes] = await executeQuery(`
        SELECT COUNT(*) as total FROM cotacoes
      `);
      
      // Cotações por status
      const [cotacoesPorStatus] = await executeQuery(`
        SELECT 
          status,
          COUNT(*) as count
        FROM cotacoes 
        GROUP BY status
      `);
      
      // Cotações do mês atual
      const [cotacoesMesAtual] = await executeQuery(`
        SELECT COUNT(*) as count
        FROM cotacoes 
        WHERE MONTH(data_criacao) = MONTH(CURRENT_DATE())
        AND YEAR(data_criacao) = YEAR(CURRENT_DATE())
      `);
      
      // Cotações pendentes
      const [cotacoesPendentes] = await executeQuery(`
        SELECT COUNT(*) as count
        FROM cotacoes 
        WHERE status IN ('pendente', 'aguardando_aprovacao')
      `);
      
      const resumo = {
        total: totalCotacoes[0].total,
        porStatus: cotacoesPorStatus,
        mesAtual: cotacoesMesAtual[0].count,
        pendentes: cotacoesPendentes[0].count
      };
      
      res.json(resumo);
    } catch (error) {
      console.error('Erro ao buscar resumo geral:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }
}

module.exports = CotacoesStatsController;
