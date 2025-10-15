const { executeQuery } = require('../../config/database');

/**
 * Controller de Listagem de Registros Diários
 */
class RegistrosDiariosListController {
  
  /**
   * Listar registros diários agrupados por data
   */
  static async listar(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;
      const { 
        escola_id,
        data_inicio,
        data_fim,
        page = 1,
        limit = 20
      } = req.query;
      
      let whereClause = 'WHERE rd.ativo = 1';
      let params = [];
      
      // Filtro por tipo de usuário (nutricionista vê apenas suas escolas)
      if (userType === 'nutricionista') {
        whereClause += ' AND rd.nutricionista_id = ?';
        params.push(userId);
      }
      
      // Filtro por escola
      if (escola_id) {
        whereClause += ' AND rd.escola_id = ?';
        params.push(escola_id);
      }
      
      // Filtro por período
      if (data_inicio) {
        whereClause += ' AND rd.data >= ?';
        params.push(data_inicio);
      }
      
      if (data_fim) {
        whereClause += ' AND rd.data <= ?';
        params.push(data_fim);
      }
      
      // Buscar registros agrupados por escola e data
      // Pivotear os tipos de refeição em colunas
      const query = `
        SELECT 
          rd.escola_id,
          rd.data,
          rd.nutricionista_id,
          MAX(CASE WHEN rd.tipo_refeicao = 'lanche_manha' THEN rd.valor ELSE 0 END) as lanche_manha,
          MAX(CASE WHEN rd.tipo_refeicao = 'almoco' THEN rd.valor ELSE 0 END) as almoco,
          MAX(CASE WHEN rd.tipo_refeicao = 'lanche_tarde' THEN rd.valor ELSE 0 END) as lanche_tarde,
          MAX(CASE WHEN rd.tipo_refeicao = 'parcial' THEN rd.valor ELSE 0 END) as parcial,
          MAX(CASE WHEN rd.tipo_refeicao = 'eja' THEN rd.valor ELSE 0 END) as eja,
          MIN(rd.data_cadastro) as data_cadastro,
          MAX(rd.data_atualizacao) as data_atualizacao
        FROM registros_diarios rd
        ${whereClause}
        GROUP BY rd.escola_id, rd.data, rd.nutricionista_id
        ORDER BY rd.data DESC, rd.escola_id ASC
        LIMIT ? OFFSET ?
      `;
      
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // Debug: verificar tipos
      const limitInt = parseInt(limit);
      const offsetInt = parseInt(offset);
      console.log('🔍 DEBUG PARAMS:', {
        page, limit, offset,
        limitInt, offsetInt,
        limitType: typeof limitInt,
        offsetType: typeof offsetInt,
        allParams: [...params, limitInt, offsetInt]
      });
      
      const registros = await executeQuery(query, [...params, limitInt, offsetInt]);
      
      // Contar total
      const countQuery = `
        SELECT COUNT(DISTINCT CONCAT(rd.escola_id, '-', rd.data)) as total
        FROM registros_diarios rd
        ${whereClause}
      `;
      const countResult = await executeQuery(countQuery, params);
      const totalItems = countResult[0].total;
      
      res.json({
        success: true,
        data: registros,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / parseInt(limit)),
          totalItems: totalItems,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar registros diários:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar registros diários'
      });
    }
  }
  
  /**
   * Listar médias por escola
   */
  static async listarMedias(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;
      const { escola_id } = req.query;
      
      let whereClause = 'WHERE me.ativo = 1';
      let params = [];
      
      // Filtro por tipo de usuário
      if (userType === 'nutricionista') {
        whereClause += ' AND me.nutricionista_id = ?';
        params.push(userId);
      }
      
      // Filtro por escola
      if (escola_id) {
        whereClause += ' AND me.escola_id = ?';
        params.push(escola_id);
      }
      
      const medias = await executeQuery(
        `SELECT me.* FROM media_escolas me ${whereClause} ORDER BY me.escola_id ASC`,
        params
      );
      
      res.json({
        success: true,
        data: medias
      });
    } catch (error) {
      console.error('Erro ao listar médias:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar médias'
      });
    }
  }
}

module.exports = RegistrosDiariosListController;

