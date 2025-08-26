/**
 * Controller de Supervisor
 * Gerencia as funcionalidades específicas do supervisor
 */

const { executeQuery } = require('../../config/database');
const { createPaginatedResponse } = require('../../middleware/pagination');
const { createCollectionLinks } = require('../../middleware/hateoas');

class SupervisorController {
  // GET /api/supervisor/pendentes - Buscar cotações pendentes para análise
  static async getCotacoesPendentes(req, res) {
    try {
      const { page = 1, limit = 10 } = req.pagination || {};
      const limitInt = parseInt(limit, 10) || 10;
      const pageInt = parseInt(page, 10) || 1;
      const offset = (pageInt - 1) * limitInt;

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM cotacoes c
        WHERE c.status IN ('em_analise', 'aguardando_aprovacao', 'renegociacao')
      `;

      // Query principal com paginação
      const query = `
        SELECT 
          c.id,
          c.comprador,
          c.local_entrega,
          c.tipo_compra,
          c.motivo_emergencial,
          c.justificativa,
          c.status,
          c.data_criacao,
          c.data_atualizacao,
          c.total_produtos,
          c.total_fornecedores,
          c.total_quantidade
        FROM cotacoes c
        WHERE c.status IN ('em_analise', 'aguardando_aprovacao', 'renegociacao')
        ORDER BY c.data_criacao DESC
        LIMIT ${limitInt} OFFSET ${offset}
      `;

      const [countResult] = await executeQuery(countQuery);
      const total = countResult.total;
      
      // Verificar se os parâmetros são válidos
      if (isNaN(limitInt) || isNaN(offset)) {
        throw new Error('Parâmetros de paginação inválidos');
      }
      
      const cotacoes = await executeQuery(query);

      // Criar resposta paginada com HATEOAS
      const response = createPaginatedResponse(cotacoes, total, req, {
        links: createCollectionLinks(req, 'supervisor', Math.ceil(total / limitInt))
      });

      res.json(response);
    } catch (error) {
      console.error('Erro ao buscar cotações pendentes:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }

  // GET /api/supervisor/stats - Estatísticas do supervisor
  static async getStats(req, res) {
    try {
      const statsQuery = `
        SELECT 
          SUM(CASE WHEN status = 'em_analise' THEN 1 ELSE 0 END) as em_analise,
          SUM(CASE WHEN status = 'aguardando_aprovacao' THEN 1 ELSE 0 END) as aguardando_aprovacao,
          SUM(CASE WHEN status = 'renegociacao' THEN 1 ELSE 0 END) as renegociacao,
          COUNT(*) as total_pendentes,
          (
            SELECT COUNT(*) 
            FROM cotacoes 
            WHERE status IN ('em_analise', 'aguardando_aprovacao', 'aprovada', 'rejeitada')
            AND DATE(data_atualizacao) = CURDATE()
          ) as total_analisadas
        FROM cotacoes 
        WHERE status IN ('em_analise', 'aguardando_aprovacao', 'renegociacao')
      `;

      const [stats] = await executeQuery(statsQuery);

      // Adicionar links HATEOAS
      const response = {
        success: true,
        data: stats,
        links: {
          self: `${req.protocol}://${req.get('host')}/api/supervisor/stats`,
          pendentes: `${req.protocol}://${req.get('host')}/api/supervisor/pendentes`
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do supervisor:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }
}

module.exports = SupervisorController;
