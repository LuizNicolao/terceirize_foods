const { executeQuery } = require('../../config/database');

/**
 * Controller para estatísticas de Produtos Per Capita
 * Segue padrão de excelência do sistema
 */
class ProdutosPerCapitaStatsController {
  static obterEstatisticas = async (req, res) => {
    try {
      const resultado = await executeQuery(`
        SELECT
          COUNT(*) as total_produtos,
          SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as produtos_ativos,
          SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) as produtos_inativos,
          AVG(per_capita_parcial_manha + per_capita_parcial_tarde + per_capita_lanche_manha + per_capita_lanche_tarde + per_capita_almoco + per_capita_eja) as media_geral,
          MAX(data_atualizacao) as ultima_atualizacao
        FROM produtos_per_capita
      `);

      const produtosUnicos = await executeQuery(`
        SELECT COUNT(DISTINCT produto_id) as total FROM produtos_per_capita
      `);


      const estatisticasPeriodos = await executeQuery(`
        SELECT 
          'Parcial Manhã' as periodo,
          COUNT(CASE WHEN per_capita_parcial_manha > 0 THEN 1 END) as produtos_com_per_capita,
          AVG(per_capita_parcial_manha) as media_per_capita,
          SUM(per_capita_parcial_manha) as total_per_capita
        FROM produtos_per_capita
        WHERE ativo = 1
        
        UNION ALL
        
        SELECT 
          'Parcial Tarde' as periodo,
          COUNT(CASE WHEN per_capita_parcial_tarde > 0 THEN 1 END) as produtos_com_per_capita,
          AVG(per_capita_parcial_tarde) as media_per_capita,
          SUM(per_capita_parcial_tarde) as total_per_capita
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
        data: {
          resumo: {
            ...resultado[0],
            produtos_unicos: produtosUnicos[0]?.total || 0
          },
          periodos: estatisticasPeriodos
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de produtos per capita:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível obter as estatísticas'
      });
    }
  };

  static obterResumoPorPeriodo = async (req, res) => {
    try {
      const resumo = await executeQuery(`
        SELECT 
          grupo,
          COUNT(*) as total_produtos,
          SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as produtos_ativos,
          SUM(per_capita_parcial_manha + per_capita_parcial_tarde + per_capita_lanche_manha + per_capita_lanche_tarde + per_capita_almoco + per_capita_eja) as total_per_capita,
          AVG(per_capita_parcial_manha + per_capita_parcial_tarde + per_capita_lanche_manha + per_capita_lanche_tarde + per_capita_almoco + per_capita_eja) as media_per_capita
        FROM produtos_per_capita
        GROUP BY grupo
        ORDER BY grupo ASC
      `);

      res.json({
        success: true,
        data: resumo
      });
    } catch (error) {
      console.error('Erro ao obter resumo por período:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível obter o resumo por período'
      });
    }
  };

  static obterEstatisticasExportacao = async (req, res) => {
    try {
      const estatisticas = await executeQuery(`
        SELECT 
          COUNT(*) as total_produtos,
          COUNT(CASE WHEN ativo = 1 THEN 1 END) as produtos_ativos,
          SUM(per_capita_parcial_manha + per_capita_parcial_tarde + per_capita_lanche_manha + per_capita_lanche_tarde + per_capita_almoco + per_capita_eja) as total_per_capita,
          AVG(per_capita_parcial_manha + per_capita_parcial_tarde + per_capita_lanche_manha + per_capita_lanche_tarde + per_capita_almoco + per_capita_eja) as media_per_capita
        FROM produtos_per_capita
        WHERE ativo = 1
      `);

      res.json({
        success: true,
        data: estatisticas[0]
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas para exportação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível obter estatísticas para exportação'
      });
    }
  };
}

module.exports = ProdutosPerCapitaStatsController;
