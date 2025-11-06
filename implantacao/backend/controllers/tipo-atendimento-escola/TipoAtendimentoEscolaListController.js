const { executeQuery } = require('../../config/database');

/**
 * Controller de Listagem para Tipo de Atendimento por Escola
 * Segue padrão de excelência do sistema
 */
class TipoAtendimentoEscolaListController {
  /**
   * Listar vínculos com paginação e filtros
   */
  static async listar(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        search = '',
        escola_id,
        tipo_atendimento,
        ativo
      } = req.query;

      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;

      let whereClause = 'WHERE 1=1';
      let params = [];

      // Filtro de busca (busca em nome da escola, rota, cidade)
      if (search && search.trim()) {
        whereClause += ' AND (e.nome_escola LIKE ? OR e.rota LIKE ? OR e.cidade LIKE ?)';
        const searchTerm = `%${search.trim()}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Filtro por escola
      if (escola_id) {
        whereClause += ' AND tae.escola_id = ?';
        params.push(escola_id);
      }

      // Filtro por tipo de atendimento
      if (tipo_atendimento) {
        whereClause += ' AND tae.tipo_atendimento = ?';
        params.push(tipo_atendimento);
      }

      // Filtro por status ativo
      if (ativo !== undefined) {
        whereClause += ' AND tae.ativo = ?';
        params.push(ativo === 'true' || ativo === '1' ? 1 : 0);
      }

      // Calcular paginação
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;
      const validPageNum = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
      const validLimitNum = isNaN(limitNum) || limitNum < 1 ? 50 : limitNum;
      const offset = (validPageNum - 1) * validLimitNum;

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM tipos_atendimento_escola tae
        LEFT JOIN escolas e ON tae.escola_id = e.id
        ${whereClause}
      `;
      
      const countResult = await executeQuery(countQuery, params);
      const totalItems = countResult && countResult.length > 0 && countResult[0] ? countResult[0].total : 0;
      const totalPages = Math.ceil(totalItems / validLimitNum);

      // Query principal com paginação
      const vinculos = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipo_atendimento,
          tae.ativo,
          tae.criado_por,
          tae.criado_em,
          tae.atualizado_em,
          e.nome_escola,
          e.rota,
          e.cidade
        FROM tipos_atendimento_escola tae
        LEFT JOIN escolas e ON tae.escola_id = e.id
        ${whereClause}
        ORDER BY e.nome_escola ASC, tae.tipo_atendimento ASC
        LIMIT ${validLimitNum} OFFSET ${offset}`,
        params
      );

      res.json({
        success: true,
        data: vinculos,
        pagination: {
          currentPage: validPageNum,
          totalPages,
          totalItems,
          itemsPerPage: validLimitNum,
          hasNextPage: validPageNum < totalPages,
          hasPrevPage: validPageNum > 1
        }
      });
    } catch (error) {
      console.error('Erro ao listar vínculos tipo atendimento-escola:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar vínculos tipo atendimento-escola'
      });
    }
  }

  /**
   * Buscar tipos de atendimento por escola
   */
  static async buscarPorEscola(req, res) {
    try {
      const { escola_id } = req.params;

      if (!escola_id) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetro obrigatório',
          message: 'ID da escola é obrigatório'
        });
      }

      const tipos = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipo_atendimento,
          tae.ativo,
          e.nome_escola
        FROM tipos_atendimento_escola tae
        LEFT JOIN escolas e ON tae.escola_id = e.id
        WHERE tae.escola_id = ? AND tae.ativo = 1
        ORDER BY tae.tipo_atendimento ASC`,
        [escola_id]
      );

      res.json({
        success: true,
        data: tipos
      });
    } catch (error) {
      console.error('Erro ao buscar tipos de atendimento por escola:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar tipos de atendimento por escola'
      });
    }
  }

  /**
   * Buscar escolas por tipo de atendimento
   */
  static async buscarEscolasPorTipo(req, res) {
    try {
      const { tipo_atendimento } = req.params;

      if (!tipo_atendimento) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetro obrigatório',
          message: 'Tipo de atendimento é obrigatório'
        });
      }

      const escolas = await executeQuery(
        `SELECT DISTINCT
          e.id,
          e.nome_escola,
          e.rota,
          e.cidade
        FROM tipos_atendimento_escola tae
        LEFT JOIN escolas e ON tae.escola_id = e.id
        WHERE tae.tipo_atendimento = ? AND tae.ativo = 1
        ORDER BY e.nome_escola ASC`,
        [tipo_atendimento]
      );

      res.json({
        success: true,
        data: escolas
      });
    } catch (error) {
      console.error('Erro ao buscar escolas por tipo de atendimento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar escolas por tipo de atendimento'
      });
    }
  }
}

module.exports = TipoAtendimentoEscolaListController;

