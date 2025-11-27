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

      // Alertas de estoque removidos - tabela almoxarifado_itens foi removida

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
