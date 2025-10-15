const { executeQuery } = require('../../config/database');

/**
 * Controller para Histórico de Registros Diários
 */
class RegistrosDiariosHistoricoController {
  
  /**
   * Buscar histórico de uma escola
   */
  static async buscarPorEscola(req, res) {
    try {
      const { escola_id } = req.params;
      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;
      
      // Filtro por tipo de usuário
      let whereClause = 'WHERE h.escola_id = ?';
      const params = [escola_id];
      
      if (userType === 'nutricionista') {
        whereClause += ' AND h.nutricionista_id = ?';
        params.push(userId);
      }
      
      // Buscar histórico agrupado por data_acao (agrupa os 5 tipos de refeição)
      const query = `
        SELECT 
          MIN(h.id) as id,
          h.escola_id,
          h.escola_nome,
          h.data,
          h.acao,
          h.data_acao,
          h.nutricionista_id,
          MAX(CASE WHEN h.tipo_refeicao = 'lanche_manha' THEN h.valor END) as lanche_manha,
          MAX(CASE WHEN h.tipo_refeicao = 'lanche_manha' THEN h.valor_anterior END) as lanche_manha_anterior,
          MAX(CASE WHEN h.tipo_refeicao = 'almoco' THEN h.valor END) as almoco,
          MAX(CASE WHEN h.tipo_refeicao = 'almoco' THEN h.valor_anterior END) as almoco_anterior,
          MAX(CASE WHEN h.tipo_refeicao = 'lanche_tarde' THEN h.valor END) as lanche_tarde,
          MAX(CASE WHEN h.tipo_refeicao = 'lanche_tarde' THEN h.valor_anterior END) as lanche_tarde_anterior,
          MAX(CASE WHEN h.tipo_refeicao = 'parcial' THEN h.valor END) as parcial,
          MAX(CASE WHEN h.tipo_refeicao = 'parcial' THEN h.valor_anterior END) as parcial_anterior,
          MAX(CASE WHEN h.tipo_refeicao = 'eja' THEN h.valor END) as eja,
          MAX(CASE WHEN h.tipo_refeicao = 'eja' THEN h.valor_anterior END) as eja_anterior
        FROM registros_diarios_historico h
        ${whereClause}
        GROUP BY h.escola_id, h.data_acao, h.acao, h.data
        ORDER BY h.data_acao DESC
        LIMIT 100
      `;
      
      const historico = await executeQuery(query, params);
      
      res.json({
        success: true,
        data: historico
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar histórico'
      });
    }
  }
  
  /**
   * Buscar histórico de uma escola em uma data específica
   */
  static async buscarPorEscolaData(req, res) {
    try {
      const { escola_id, data } = req.params;
      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;
      
      // Filtro por tipo de usuário
      let whereClause = 'WHERE h.escola_id = ? AND h.data = ?';
      const params = [escola_id, data];
      
      if (userType === 'nutricionista') {
        whereClause += ' AND h.nutricionista_id = ?';
        params.push(userId);
      }
      
      // Buscar histórico agrupado por data_acao
      const query = `
        SELECT 
          MIN(h.id) as id,
          h.escola_id,
          h.escola_nome,
          h.data,
          h.acao,
          h.data_acao,
          h.nutricionista_id,
          MAX(CASE WHEN h.tipo_refeicao = 'lanche_manha' THEN h.valor END) as lanche_manha,
          MAX(CASE WHEN h.tipo_refeicao = 'lanche_manha' THEN h.valor_anterior END) as lanche_manha_anterior,
          MAX(CASE WHEN h.tipo_refeicao = 'almoco' THEN h.valor END) as almoco,
          MAX(CASE WHEN h.tipo_refeicao = 'almoco' THEN h.valor_anterior END) as almoco_anterior,
          MAX(CASE WHEN h.tipo_refeicao = 'lanche_tarde' THEN h.valor END) as lanche_tarde,
          MAX(CASE WHEN h.tipo_refeicao = 'lanche_tarde' THEN h.valor_anterior END) as lanche_tarde_anterior,
          MAX(CASE WHEN h.tipo_refeicao = 'parcial' THEN h.valor END) as parcial,
          MAX(CASE WHEN h.tipo_refeicao = 'parcial' THEN h.valor_anterior END) as parcial_anterior,
          MAX(CASE WHEN h.tipo_refeicao = 'eja' THEN h.valor END) as eja,
          MAX(CASE WHEN h.tipo_refeicao = 'eja' THEN h.valor_anterior END) as eja_anterior
        FROM registros_diarios_historico h
        ${whereClause}
        GROUP BY h.escola_id, h.data_acao, h.acao, h.data
        ORDER BY h.data_acao DESC
      `;
      
      const historico = await executeQuery(query, params);
      
      res.json({
        success: true,
        data: historico
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar histórico'
      });
    }
  }
}

module.exports = RegistrosDiariosHistoricoController;

