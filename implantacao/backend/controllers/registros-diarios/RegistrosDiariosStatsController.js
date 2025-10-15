const { executeQuery } = require('../../config/database');

/**
 * Controller de Estatísticas de Registros Diários
 */
class RegistrosDiariosStatsController {
  
  /**
   * Obter estatísticas gerais
   */
  static async obterEstatisticas(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;
      
      let whereClause = 'WHERE rd.ativo = 1';
      let params = [];
      
      // Filtro por tipo de usuário
      if (userType === 'nutricionista') {
        whereClause += ' AND rd.nutricionista_id = ?';
        params.push(userId);
      }
      
      // Total de registros (dias únicos)
      const totalQuery = `
        SELECT COUNT(DISTINCT CONCAT(rd.escola_id, '-', rd.data)) as total
        FROM registros_diarios rd
        ${whereClause}
      `;
      const totalResult = await executeQuery(totalQuery, params);
      const total_registros = totalResult[0].total;
      
      // Total de escolas com registros
      const escolasQuery = `
        SELECT COUNT(DISTINCT rd.escola_id) as total
        FROM registros_diarios rd
        ${whereClause}
      `;
      const escolasResult = await executeQuery(escolasQuery, params);
      const total_escolas = escolasResult[0].total;
      
      // Registros do mês atual
      const mesAtualQuery = `
        SELECT COUNT(DISTINCT CONCAT(rd.escola_id, '-', rd.data)) as total
        FROM registros_diarios rd
        ${whereClause} AND MONTH(rd.data) = MONTH(NOW()) AND YEAR(rd.data) = YEAR(NOW())
      `;
      const mesAtualResult = await executeQuery(mesAtualQuery, params);
      const registros_mes_atual = mesAtualResult[0].total;
      
      // Total de médias calculadas
      let mediasWhereClause = 'WHERE me.ativo = 1';
      let mediasParams = [];
      
      if (userType === 'nutricionista') {
        mediasWhereClause += ' AND me.nutricionista_id = ?';
        mediasParams.push(userId);
      }
      
      const mediasQuery = `
        SELECT COUNT(*) as total
        FROM media_escolas me
        ${mediasWhereClause}
      `;
      const mediasResult = await executeQuery(mediasQuery, mediasParams);
      const total_medias = mediasResult[0].total;
      
      res.json({
        success: true,
        data: {
          total_registros,
          total_escolas,
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

module.exports = RegistrosDiariosStatsController;

