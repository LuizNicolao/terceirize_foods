/**
 * Controller de Listagem para Períodos de Refeição
 * Implementa operações de busca e listagem
 */

const { executeQuery } = require('../../config/database');

class PeriodosRefeicaoListController {
  // Listar períodos de refeição com paginação, busca e filtros
  static async listarPeriodosRefeicao(req, res) {
    try {
      const { search, status, filial_id, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Construir query base
      let query = `
        SELECT 
          pr.id,
          pr.nome,
          pr.codigo,
          pr.descricao,
          pr.status,
          pr.observacoes,
          pr.created_at,
          pr.updated_at,
          COUNT(prf.filial_id) as total_filiais
        FROM periodos_refeicao pr
        LEFT JOIN periodos_refeicao_filiais prf ON pr.id = prf.periodo_refeicao_id
        WHERE 1=1`;

      const queryParams = [];

      // Aplicar filtros
      if (search) {
        query += ` AND (pr.nome LIKE ? OR pr.codigo LIKE ? OR pr.descricao LIKE ?)`;
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status) {
        query += ` AND pr.status = ?`;
        queryParams.push(status);
      }

      if (filial_id) {
        query += ` AND pr.id IN (SELECT periodo_refeicao_id FROM periodos_refeicao_filiais WHERE filial_id = ?)`;
        queryParams.push(filial_id);
      }

      // Agrupar por período
      query += ` GROUP BY pr.id`;

      // Ordenação
      query += ` ORDER BY pr.nome ASC`;

      // Aplicar paginação
      query += ` LIMIT ? OFFSET ?`;
      queryParams.push(parseInt(limit), parseInt(offset));

      const periodos = await executeQuery(query, queryParams);

      // Buscar total de registros para paginação
      let countQuery = `
        SELECT COUNT(DISTINCT pr.id) as total
        FROM periodos_refeicao pr
        LEFT JOIN periodos_refeicao_filiais prf ON pr.id = prf.periodo_refeicao_id
        WHERE 1=1`;

      const countParams = [];

      if (search) {
        countQuery += ` AND (pr.nome LIKE ? OR pr.codigo LIKE ? OR pr.descricao LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status) {
        countQuery += ` AND pr.status = ?`;
        countParams.push(status);
      }

      if (filial_id) {
        countQuery += ` AND pr.id IN (SELECT periodo_refeicao_id FROM periodos_refeicao_filiais WHERE filial_id = ?)`;
        countParams.push(filial_id);
      }

      const countResult = await executeQuery(countQuery, countParams);
      const totalItems = countResult[0].total;

      // Calcular informações de paginação
      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        success: true,
        data: {
          periodos,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar períodos de refeição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os períodos de refeição'
      });
    }
  }

  // Buscar período de refeição por ID
  static async buscarPeriodoRefeicaoPorId(req, res) {
    try {
      const { id } = req.params;

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      let whereConditions = ['pr.id = ?'];
      let params = [id];

      if (isNutricionista) {
        // Filtro: Apenas períodos de refeição das filiais que o nutricionista tem acesso
        whereConditions.push(`
          pr.id IN (
            SELECT prf.periodo_refeicao_id 
            FROM periodos_refeicao_filiais prf
            WHERE prf.filial_id IN (
              SELECT uf.filial_id 
              FROM usuarios_filiais uf 
              WHERE uf.usuario_id = ?
            )
          )
        `);
        params.push(req.user.id);
      }

      const query = `
        SELECT 
          pr.id, pr.nome, pr.codigo, pr.descricao, pr.status, pr.observacoes, 
          pr.created_at, pr.updated_at
        FROM periodos_refeicao pr
        WHERE ${whereConditions.join(' AND ')}
      `;

      const periodos = await executeQuery(query, params);

      if (periodos.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Período de refeição não encontrado',
          message: 'O período de refeição especificado não foi encontrado no sistema'
        });
      }

      // Buscar filiais vinculadas
      const filiaisQuery = `
        SELECT 
          f.id,
          f.filial,
          prf.data_vinculacao
        FROM periodos_refeicao_filiais prf
        JOIN filiais f ON prf.filial_id = f.id
        WHERE prf.periodo_refeicao_id = ?
        ORDER BY f.filial ASC
      `;

      const filiais = await executeQuery(filiaisQuery, [id]);

      res.json({
        success: true,
        data: {
          ...periodos[0],
          filiais
        }
      });

    } catch (error) {
      console.error('Erro ao buscar período de refeição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o período de refeição'
      });
    }
  }
}

module.exports = PeriodosRefeicaoListController;
