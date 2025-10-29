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

      const offset = (page - 1) * limit;
      const queryParams = [];

      // Query principal
      let whereClause = 'WHERE np.ativo = ?';
      queryParams.push(ativo);

      if (escola_id) {
        whereClause += ' AND np.escola_id = ?';
        queryParams.push(escola_id);
      }

      if (grupo_id) {
        whereClause += ' AND np.grupo_id = ?';
        queryParams.push(grupo_id);
      }

      if (produto_id) {
        whereClause += ' AND np.produto_id = ?';
        queryParams.push(produto_id);
      }

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
          e.nome as escola_nome,
          g.nome as grupo_nome,
          po.nome as produto_nome,
          po.codigo as produto_codigo,
          um.sigla as unidade_medida,
          u.nome as usuario_nome
        FROM necessidades_padroes np
        LEFT JOIN foods_db.unidades_escolares e ON np.escola_id = e.id
        LEFT JOIN foods_db.grupos g ON np.grupo_id = g.id
        LEFT JOIN foods_db.produto_origem po ON np.produto_id = po.id
        LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id
        LEFT JOIN usuarios u ON np.usuario_id = u.id
        ${whereClause}
        ORDER BY np.data_atualizacao DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(parseInt(limit), offset);

      const resultados = await executeQuery(query, queryParams);

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM necessidades_padroes np
        ${whereClause}
      `;

      const countParams = queryParams.slice(0, -2); // Remove limit e offset
      const countResult = await executeQuery(countQuery, countParams);
      const total = countResult[0]?.total || 0;

      const totalPages = Math.ceil(total / limit);

      const response = {
        data: resultados,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
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
