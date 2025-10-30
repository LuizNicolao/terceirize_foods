const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse } = require('../../middleware/responseHandler');

class NecessidadesPadroesListController {
  /**
   * Listar padrões com paginação e filtros
   */
  static async listar(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        escola_id,
        grupo_id,
        produto_id,
        ativo = 1
      } = req.query;

      let whereClause = 'WHERE np.ativo = ?';
      let params = [ativo];

      if (escola_id) {
        whereClause += ' AND np.escola_id = ?';
        params.push(escola_id);
      }

      if (grupo_id) {
        whereClause += ' AND np.grupo_id = ?';
        params.push(grupo_id);
      }

      if (produto_id) {
        whereClause += ' AND np.produto_id = ?';
        params.push(produto_id);
      }

      // Calcular paginação com validação
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;
      
      // Garantir que os valores sejam números válidos e positivos
      const validPageNum = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
      const validLimitNum = isNaN(limitNum) || limitNum < 1 ? 50 : limitNum;
      
      const offset = (validPageNum - 1) * validLimitNum;

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total
        FROM necessidades_padroes np
        ${whereClause}
      `;
      
      const countResult = await executeQuery(countQuery, params);
      const totalItems = countResult && countResult.length > 0 && countResult[0] ? countResult[0].total : 0;
      const totalPages = Math.ceil(totalItems / validLimitNum);

      // Query principal com paginação usando interpolação (como no NecessidadesListController)
      const query = `
        SELECT 
          np.id,
          np.escola_id,
          np.grupo_id,
          np.produto_id,
          np.quantidade,
          np.data_criacao,
          np.data_atualizacao,
          np.usuario_id,
          np.escola_nome,
          np.grupo_nome,
          np.produto_nome,
          np.unidade_medida_sigla as unidade_medida,
          u.nome as usuario_nome
        FROM necessidades_padroes np
        LEFT JOIN usuarios u ON np.usuario_id = u.id
        ${whereClause}
        ORDER BY np.data_atualizacao DESC
        LIMIT ${validLimitNum} OFFSET ${offset}
      `;

      const resultados = await executeQuery(query, params);

      const response = {
        data: resultados,
        pagination: {
          currentPage: validPageNum,
          totalPages,
          totalItems,
          itemsPerPage: validLimitNum,
          hasNextPage: validPageNum < totalPages,
          hasPrevPage: validPageNum > 1
        }
      };

      return successResponse(res, response, 'Padrões listados com sucesso');
    } catch (error) {
      console.error('Erro ao listar padrões:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  /**
   * Buscar padrões por escola e grupo
   */
  static async buscarPorEscolaGrupo(req, res) {
    try {
      const { escola_id, grupo_id } = req.params;

      const query = `
        SELECT 
          np.id,
          np.produto_id,
          np.quantidade,
          po.nome as produto_nome,
          po.codigo as produto_codigo,
          um.sigla as unidade_medida
        FROM necessidades_padroes np
        LEFT JOIN foods_db.produto_origem po ON np.produto_id = po.id
        LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id
        WHERE np.escola_id = ? AND np.grupo_id = ? AND np.ativo = 1
        ORDER BY po.nome
      `;

      const resultados = await executeQuery(query, [escola_id, grupo_id]);

      return successResponse(res, resultados, 'Padrões encontrados com sucesso');
    } catch (error) {
      console.error('Erro ao buscar padrões por escola e grupo:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }
}

module.exports = NecessidadesPadroesListController;
