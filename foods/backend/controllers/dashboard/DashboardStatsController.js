/**
 * Controller de Estatísticas do Dashboard
 * Responsável por buscar estatísticas gerais do sistema
 */

const { executeQuery } = require('../../config/database');

class DashboardStatsController {
  // Obter estatísticas gerais da dashboard
  static async obterEstatisticas(req, res) {
    try {
      // Buscar estatísticas gerais
      const stats = await executeQuery(`
        SELECT 
          (SELECT COUNT(*) FROM usuarios WHERE status = 'ativo') as total_usuarios,
          (SELECT COUNT(*) FROM fornecedores WHERE status = 'ativo') as total_fornecedores,
          (SELECT COUNT(*) FROM clientes WHERE status = 'ativo') as total_clientes,
          (SELECT COUNT(*) FROM produtos WHERE status = 1) as total_produtos,
          (SELECT COUNT(*) FROM filiais WHERE status = 'ativo') as total_filiais,
          (SELECT COUNT(*) FROM veiculos WHERE status = 'ativo') as total_veiculos
      `);

      res.json({
        success: true,
        data: stats[0]
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas da dashboard:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível carregar as estatísticas da dashboard'
      });
    }
  }

  /**
   * Obter alertas do sistema
   */
  static async obterAlertas(req, res) {
    try {
      const alertas = [];

      // Verificar produtos com estoque baixo
      try {
        const produtosEstoqueBaixo = await executeQuery(`
          SELECT COUNT(DISTINCT ai.produto_id) as total
          FROM almoxarifado_itens ai
          INNER JOIN produtos p ON ai.produto_id = p.id
          WHERE p.status = 1 
          AND ai.quantidade <= 10 
          AND ai.quantidade > 0
        `);
        
        if (produtosEstoqueBaixo[0].total > 0) {
          alertas.push({
            id: 'estoque_baixo',
            titulo: 'Produtos com Estoque Baixo',
            descricao: `${produtosEstoqueBaixo[0].total} produtos estão com estoque baixo`,
            nivel: 'medio',
            data_hora: new Date().toISOString(),
            tipo: 'estoque'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar produtos com estoque baixo:', error.message);
      }

      // Verificar produtos sem estoque
      try {
        const produtosSemEstoque = await executeQuery(`
          SELECT COUNT(DISTINCT p.id) as total
          FROM produtos p
          LEFT JOIN almoxarifado_itens ai ON p.id = ai.produto_id
          WHERE p.status = 1 
          AND (ai.produto_id IS NULL OR ai.quantidade = 0)
        `);
        
        if (produtosSemEstoque[0].total > 0) {
          alertas.push({
            id: 'sem_estoque',
            titulo: 'Produtos Sem Estoque',
            descricao: `${produtosSemEstoque[0].total} produtos estão sem estoque`,
            nivel: 'alto',
            data_hora: new Date().toISOString(),
            tipo: 'estoque'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar produtos sem estoque:', error.message);
      }

      // Verificar veículos com documentação vencendo
      try {
        const veiculosDocVencendo = await executeQuery(`
          SELECT COUNT(*) as total
          FROM veiculos 
          WHERE status = 'ativo' 
          AND (vencimento_licenciamento IS NOT NULL
               AND vencimento_licenciamento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))
        `);
        
        if (veiculosDocVencendo[0].total > 0) {
          alertas.push({
            id: 'veiculos_doc_vencendo',
            titulo: 'Veículos com Documentação Vencendo',
            descricao: `${veiculosDocVencendo[0].total} veículos têm documentação vencendo`,
            nivel: 'medio',
            data_hora: new Date().toISOString(),
            tipo: 'documentacao'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar veículos com documentação vencendo:', error.message);
      }

      // Verificar motoristas com CNH vencendo
      try {
        const motoristasCnhVencendo = await executeQuery(`
          SELECT COUNT(*) as total
          FROM motoristas 
          WHERE status = 'ativo' 
          AND (cnh_validade IS NOT NULL
               AND cnh_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))
        `);
        
        if (motoristasCnhVencendo[0].total > 0) {
          alertas.push({
            id: 'motoristas_cnh_vencendo',
            titulo: 'Motoristas com CNH Vencendo',
            descricao: `${motoristasCnhVencendo[0].total} motoristas têm CNH vencendo`,
            nivel: 'alto',
            data_hora: new Date().toISOString(),
            tipo: 'documentacao'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar motoristas com CNH vencendo:', error.message);
      }

      res.json({
        success: true,
        data: {
          items: alertas,
          total: alertas.length
        }
      });

    } catch (error) {
      console.error('Erro ao obter alertas da dashboard:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível carregar os alertas da dashboard'
      });
    }
  }
}

module.exports = DashboardStatsController;
