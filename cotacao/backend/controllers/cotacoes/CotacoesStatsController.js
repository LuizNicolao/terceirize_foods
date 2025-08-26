const { executeQuery } = require('../../config/database');

class CotacoesStatsController {
  // GET /api/cotacoes/stats/overview - Estatísticas gerais
  static async getStatsOverview(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_cotacoes,
          COUNT(CASE WHEN status = 'pendente' THEN 1 END) as cotacoes_pendentes,
          COUNT(CASE WHEN status = 'em_analise' THEN 1 END) as cotacoes_em_analise,
          COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as cotacoes_aprovadas,
          COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as cotacoes_rejeitadas,
          SUM(total_produtos) as total_produtos,
          SUM(total_quantidade) as total_quantidade,
          SUM(total_fornecedores) as total_fornecedores
        FROM cotacoes
        WHERE comprador = ?
      `;

      const stats = await executeQuery(query, [req.user.name]);
      res.json(stats[0]);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }


}

module.exports = CotacoesStatsController;
