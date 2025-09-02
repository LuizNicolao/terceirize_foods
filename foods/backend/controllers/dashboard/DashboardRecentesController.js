/**
 * Controller de Dados Recentes do Dashboard
 * Responsável por buscar dados recentes para exibição no dashboard
 */

const { executeQuery } = require('../../config/database');

class DashboardRecentesController {
  // Obter dados recentes para o dashboard
  static async obterDadosRecentes(req, res) {
    try {
      // Buscar dados recentes
      const dadosRecentes = await executeQuery(`
        SELECT 
          'usuarios' as tipo,
          nome as titulo,
          criado_em as data,
          id as referencia
        FROM usuarios 
        WHERE status = 'ativo' 
        ORDER BY criado_em DESC 
        LIMIT 5
        
        UNION ALL
        
        SELECT 
          'fornecedores' as tipo,
          razao_social as titulo,
          criado_em as data,
          id as referencia
        FROM fornecedores 
        WHERE status = 1 
        ORDER BY criado_em DESC 
        LIMIT 5
        
        UNION ALL
        
        SELECT 
          'produtos' as tipo,
          nome as titulo,
          criado_em as data,
          id as referencia
        FROM produtos 
        WHERE status = 1 
        ORDER BY criado_em DESC 
        LIMIT 5
        
        ORDER BY data DESC 
        LIMIT 10
      `);

      res.json({
        success: true,
        data: dadosRecentes
      });

    } catch (error) {
      console.error('Erro ao buscar dados recentes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = DashboardRecentesController;
