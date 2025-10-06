const { executeQuery } = require('../../config/database');

/**
 * Controller para estatísticas de Produtos Per Capita
 * Segue padrão de excelência do sistema
 */
class ProdutosPerCapitaStatsController {
  /**
   * Obter estatísticas gerais
   */
  static async obterEstatisticas(req, res) {
    try {
      const stats = await executeQuery(`
        SELECT 
          COUNT(*) as total_produtos,
          SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as produtos_ativos,
          SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) as produtos_inativos,
          COUNT(DISTINCT produto_id) as produtos_unicos,
          AVG(per_capita_parcial) as media_parcial,
          AVG(per_capita_lanche_manha) as media_lanche_manha,
          AVG(per_capita_lanche_tarde) as media_lanche_tarde,
          AVG(per_capita_almoco) as media_almoco,
          AVG(per_capita_eja) as media_eja
        FROM produtos_per_capita
      `);

      const estatisticas = stats[0];

      res.json({
        success: true,
        data: {
          total_produtos: parseInt(estatisticas.total_produtos),
          produtos_ativos: parseInt(estatisticas.produtos_ativos),
          produtos_inativos: parseInt(estatisticas.produtos_inativos),
          produtos_unicos: parseInt(estatisticas.produtos_unicos),
          medias_per_capita: {
            lanche_manha: parseFloat(estatisticas.media_lanche_manha || 0).toFixed(3),
            almoco: parseFloat(estatisticas.media_almoco || 0).toFixed(3),
            lanche_tarde: parseFloat(estatisticas.media_lanche_tarde || 0).toFixed(3),
            parcial: parseFloat(estatisticas.media_parcial || 0).toFixed(3),
            eja: parseFloat(estatisticas.media_eja || 0).toFixed(3)
          }
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao obter estatísticas'
      });
    }
  }

  /**
   * Obter resumo por período
   */
  static async obterResumoPorPeriodo(req, res) {
    try {
      const resumo = await executeQuery(`
        SELECT 
          'Parcial' as periodo,
          COUNT(CASE WHEN per_capita_parcial > 0 THEN 1 END) as produtos_com_per_capita,
          AVG(per_capita_parcial) as media_per_capita,
          SUM(per_capita_parcial) as total_per_capita
        FROM produtos_per_capita
        WHERE ativo = 1
        
        UNION ALL
        
        SELECT 
          'Lanche Manhã' as periodo,
          COUNT(CASE WHEN per_capita_lanche_manha > 0 THEN 1 END) as produtos_com_per_capita,
          AVG(per_capita_lanche_manha) as media_per_capita,
          SUM(per_capita_lanche_manha) as total_per_capita
        FROM produtos_per_capita
        WHERE ativo = 1
        
        UNION ALL
        
        SELECT 
          'Lanche Tarde' as periodo,
          COUNT(CASE WHEN per_capita_lanche_tarde > 0 THEN 1 END) as produtos_com_per_capita,
          AVG(per_capita_lanche_tarde) as media_per_capita,
          SUM(per_capita_lanche_tarde) as total_per_capita
        FROM produtos_per_capita
        WHERE ativo = 1
        
        UNION ALL
        
        SELECT 
          'Almoço' as periodo,
          COUNT(CASE WHEN per_capita_almoco > 0 THEN 1 END) as produtos_com_per_capita,
          AVG(per_capita_almoco) as media_per_capita,
          SUM(per_capita_almoco) as total_per_capita
        FROM produtos_per_capita
        WHERE ativo = 1
        
        UNION ALL
        
        SELECT 
          'EJA' as periodo,
          COUNT(CASE WHEN per_capita_eja > 0 THEN 1 END) as produtos_com_per_capita,
          AVG(per_capita_eja) as media_per_capita,
          SUM(per_capita_eja) as total_per_capita
        FROM produtos_per_capita
        WHERE ativo = 1
      `);

      res.json({
        success: true,
        data: resumo.map(item => ({
          periodo: item.periodo,
          produtos_com_per_capita: parseInt(item.produtos_com_per_capita),
          media_per_capita: parseFloat(item.media_per_capita || 0).toFixed(3),
          total_per_capita: parseFloat(item.total_per_capita || 0).toFixed(3)
        }))
      });

    } catch (error) {
      console.error('Erro ao obter resumo por período:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao obter resumo por período'
      });
    }
  }

  /**
   * Obter estatísticas de exportação
   */
  static async obterEstatisticasExportacao(req, res) {
    try {
      const { format = 'xlsx' } = req.query;

      const produtos = await executeQuery(`
        SELECT 
          ppc.id,
          ppc.produto_id,
          ppc.produto_origem_id,
          ppc.produto_nome,
          ppc.produto_codigo,
          ppc.unidade_medida,
          ppc.grupo,
          ppc.subgrupo,
          ppc.classe,
          ppc.per_capita_parcial,
          ppc.per_capita_lanche_manha,
          ppc.per_capita_lanche_tarde,
          ppc.per_capita_almoco,
          ppc.per_capita_eja,
          ppc.descricao,
          ppc.ativo,
          ppc.data_cadastro,
          ppc.data_atualizacao
        FROM produtos_per_capita ppc
        ORDER BY ppc.data_cadastro DESC
      `);

      res.json({
        success: true,
        data: {
          produtos,
          total: produtos.length,
          format,
          generated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas de exportação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao obter estatísticas de exportação'
      });
    }
  }
}

module.exports = ProdutosPerCapitaStatsController;
