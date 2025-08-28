const { executeQuery } = require('../../config/database');

class IntoleranciasStatsController {
  static async buscarEstatisticas(req, res) {
    try {
      // Buscar estatísticas gerais
      const statsQuery = `
        SELECT 
          COUNT(*) as total_intolerancias,
          SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as intolerancias_ativas,
          SUM(CASE WHEN status = 'inativo' THEN 1 ELSE 0 END) as intolerancias_inativas,
          COUNT(DISTINCT nome) as nomes_unicos
        FROM intolerancias
      `;

      const [stats] = await executeQuery(statsQuery);

      // Buscar intolerâncias mais recentes
      const recentesQuery = `
        SELECT 
          id,
          nome,
          status,
          criado_em,
          atualizado_em
        FROM intolerancias 
        ORDER BY criado_em DESC 
        LIMIT 5
      `;

      const recentes = await executeQuery(recentesQuery);

      // Buscar intolerâncias mais atualizadas
      const atualizadasQuery = `
        SELECT 
          id,
          nome,
          status,
          criado_em,
          atualizado_em
        FROM intolerancias 
        ORDER BY atualizado_em DESC 
        LIMIT 5
      `;

      const atualizadas = await executeQuery(atualizadasQuery);

      // Calcular distribuição por status
      const statusQuery = `
        SELECT 
          status,
          COUNT(*) as quantidade
        FROM intolerancias 
        GROUP BY status
        ORDER BY quantidade DESC
      `;

      const statusDistribuicao = await executeQuery(statusQuery);

      res.json({
        success: true,
        data: {
          geral: {
            total_intolerancias: stats.total_intolerancias,
            intolerancias_ativas: stats.intolerancias_ativas,
            intolerancias_inativas: stats.intolerancias_inativas,
            nomes_unicos: stats.nomes_unicos
          },
          recentes: recentes,
          atualizadas: atualizadas,
          status_distribuicao: statusDistribuicao
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de intolerâncias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = IntoleranciasStatsController;
