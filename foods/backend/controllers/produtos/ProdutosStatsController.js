/**
 * Controller de Estatísticas de Produtos
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutosStatsController {
  
  /**
   * Buscar estatísticas gerais de produtos
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Estatísticas gerais
    const totalProdutos = await executeQuery(
      'SELECT COUNT(*) as total FROM produtos'
    );

    const produtosAtivos = await executeQuery(
      'SELECT COUNT(*) as total FROM produtos WHERE status = 1'
    );

    const produtosInativos = await executeQuery(
      'SELECT COUNT(*) as total FROM produtos WHERE status = 0'
    );

    // Estatísticas de estoque removidas pois a tabela não possui colunas de estoque
    const produtosEstoqueBaixo = [{ total: 0 }];
    const produtosSemEstoque = [{ total: 0 }];
    const valorEstoque = [{ valor_total: 0 }];

    // Produtos por grupo
    const produtosPorGrupo = await executeQuery(`
      SELECT 
        g.nome as grupo,
        COUNT(p.id) as quantidade
      FROM grupos g
      LEFT JOIN produtos p ON g.id = p.grupo_id AND p.status = 1
      WHERE g.status = 1
      GROUP BY g.id, g.nome
      ORDER BY quantidade DESC
    `);

    // Produtos por fornecedor - Removido pois a tabela não possui fornecedor_id
    const produtosPorFornecedor = [];

    // Top produtos com maior estoque - Removido pois a tabela não possui colunas de estoque
    const topEstoque = [];

    // Produtos mais caros - Removido pois a tabela não possui colunas de preço
    const produtosMaisCaros = [];

    const estatisticas = {
      geral: {
        total: totalProdutos[0].total,
        ativos: produtosAtivos[0].total,
        inativos: produtosInativos[0].total,
        estoque_baixo: produtosEstoqueBaixo[0].total,
        sem_estoque: produtosSemEstoque[0].total,
        valor_total_estoque: valorEstoque[0].valor_total || 0
      },
      por_grupo: produtosPorGrupo,
      por_fornecedor: produtosPorFornecedor,
      top_estoque: topEstoque,
      produtos_mais_caros: produtosMaisCaros
    };

    return successResponse(res, estatisticas, 'Estatísticas de produtos obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = ProdutosStatsController;
