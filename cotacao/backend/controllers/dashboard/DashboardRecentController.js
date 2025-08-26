const { executeQuery } = require('../../config/database');

class DashboardRecentController {
  // Buscar cotações recentes
  static async getRecent(limit = 5) {
    try {
      const limitNumber = Math.max(1, Math.min(20, parseInt(limit) || 5));

      // Buscar cotações recentes
      const recentQuery = `
        SELECT 
          c.id,
          c.comprador as usuario_nome,
          c.local_entrega,
          c.tipo_compra as tipo,
          c.status,
          c.data_criacao,
          c.total_produtos,
          c.total_quantidade,
          c.total_fornecedores
        FROM cotacoes c 
        ORDER BY c.data_criacao DESC 
        LIMIT ${limitNumber}
      `;
      
      const recentes = await executeQuery(recentQuery, []);

      // Formatar dados
      const formattedRecentes = recentes.map(cotacao => ({
        id: cotacao.id,
        usuario_nome: cotacao.usuario_nome,
        local_entrega: cotacao.local_entrega,
        tipo: cotacao.tipo,
        status: cotacao.status,
        data_criacao: cotacao.data_criacao,
        total_produtos: cotacao.total_produtos || 0,
        total_quantidade: cotacao.total_quantidade || 0,
        total_fornecedores: cotacao.total_fornecedores || 0
      }));

      return {
        recentes: formattedRecentes,
        total: formattedRecentes.length
      };
    } catch (error) {
      console.error('Erro ao buscar cotações recentes:', error);
      return {
        recentes: [],
        total: 0
      };
    }
  }
}

module.exports = DashboardRecentController;
