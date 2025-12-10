const { executeQuery } = require('../../config/database');

/**
 * Controller de Estatísticas de Quantidades Servidas
 */
class QuantidadesServidasStatsController {
  
  /**
   * Obter estatísticas gerais
   */
  static async obterEstatisticas(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;
      
      let whereClause = 'WHERE qs.ativo = 1';
      let params = [];
      
      // Filtro por tipo de usuário
      if (userType === 'nutricionista') {
        whereClause += ' AND qs.nutricionista_id = ?';
        params.push(userId);
      }
      
      // Total de registros (dias únicos por unidade)
      const totalQuery = `
        SELECT COUNT(DISTINCT CONCAT(qs.unidade_id, '-', qs.data)) as total
        FROM quantidades_servidas qs
        ${whereClause}
      `;
      const totalResult = await executeQuery(totalQuery, params);
      const total_registros = totalResult[0].total;
      
      // Total de unidades com registros
      const unidadesQuery = `
        SELECT COUNT(DISTINCT qs.unidade_id) as total
        FROM quantidades_servidas qs
        ${whereClause}
      `;
      const unidadesResult = await executeQuery(unidadesQuery, params);
      const total_unidades = unidadesResult[0].total;
      
      // Registros do mês atual
      const mesAtualQuery = `
        SELECT COUNT(DISTINCT CONCAT(qs.unidade_id, '-', qs.data)) as total
        FROM quantidades_servidas qs
        ${whereClause} AND MONTH(qs.data) = MONTH(NOW()) AND YEAR(qs.data) = YEAR(NOW())
      `;
      const mesAtualResult = await executeQuery(mesAtualQuery, params);
      const registros_mes_atual = mesAtualResult[0].total;
      
      // Total de médias calculadas (contando por unidade e período)
      let mediasWhereClause = 'WHERE mqs.calculada_automaticamente = 1';
      let mediasParams = [];
      
      if (userType === 'nutricionista') {
        mediasWhereClause += ' AND mqs.nutricionista_id = ?';
        mediasParams.push(userId);
      }
      
      const mediasQuery = `
        SELECT COUNT(DISTINCT CONCAT(mqs.unidade_id, '-', mqs.periodo_atendimento_id)) as total
        FROM medias_quantidades_servidas mqs
        ${mediasWhereClause}
      `;
      const mediasResult = await executeQuery(mediasQuery, mediasParams);
      const total_medias = mediasResult[0].total;
      
      res.json({
        success: true,
        data: {
          total_registros,
          total_unidades,
          registros_mes_atual,
          total_medias
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao obter estatísticas'
      });
    }
  }
}

module.exports = QuantidadesServidasStatsController;

