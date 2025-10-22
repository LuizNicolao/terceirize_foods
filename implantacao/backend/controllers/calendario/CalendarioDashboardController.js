const { executeQuery } = require('../../config/database');

/**
 * Controller para dashboard do calendário
 */
class CalendarioDashboardController {
  
  /**
   * Obter estatísticas gerais do calendário
   */
  static async obterEstatisticas(req, res) {
    try {
      const { ano = new Date().getFullYear() } = req.query;
      
      // Estatísticas gerais do ano
      const [stats] = await executeQuery(`
        SELECT 
          COUNT(*) as total_dias,
          SUM(dia_util) as dias_uteis,
          SUM(dia_abastecimento) as dias_abastecimento,
          SUM(dia_consumo) as dias_consumo,
          SUM(feriado) as feriados,
          COUNT(DISTINCT semana_numero) as total_semanas
        FROM calendario 
        WHERE ano = ?
      `, [ano]);

      // Estatísticas por mês
      const statsMensais = await executeQuery(`
        SELECT 
          mes,
          COUNT(*) as total_dias,
          SUM(dia_util) as dias_uteis,
          SUM(dia_abastecimento) as dias_abastecimento,
          SUM(dia_consumo) as dias_consumo,
          SUM(feriado) as feriados
        FROM calendario 
        WHERE ano = ?
        GROUP BY mes
        ORDER BY mes
      `, [ano]);

      // Estatísticas por dia da semana
      const statsDiasSemana = await executeQuery(`
        SELECT 
          dia_semana_nome,
          dia_semana_numero,
          COUNT(*) as total_dias,
          SUM(dia_util) as dias_uteis,
          SUM(dia_abastecimento) as dias_abastecimento,
          SUM(dia_consumo) as dias_consumo
        FROM calendario 
        WHERE ano = ?
        GROUP BY dia_semana_nome, dia_semana_numero
        ORDER BY dia_semana_numero
      `, [ano]);

      res.json({
        success: true,
        data: {
          estatisticas: stats,
          mensais: statsMensais,
          diasSemana: statsDiasSemana
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas do calendário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter resumo do calendário
   */
  static async obterResumo(req, res) {
    try {
      const { ano = new Date().getFullYear(), mes } = req.query;
      
      let whereClause = 'WHERE ano = ?';
      let params = [ano];
      
      if (mes) {
        whereClause += ' AND mes = ?';
        params.push(mes);
      }

      const resumo = await executeQuery(`
        SELECT 
          COUNT(*) as total_dias,
          SUM(dia_util) as dias_uteis,
          SUM(dia_abastecimento) as dias_abastecimento,
          SUM(dia_consumo) as dias_consumo,
          SUM(feriado) as feriados
        FROM calendario 
        ${whereClause}
      `, params);

      res.json({
        success: true,
        data: resumo[0] || {}
      });

    } catch (error) {
      console.error('Erro ao obter resumo do calendário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CalendarioDashboardController;
