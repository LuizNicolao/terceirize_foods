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
      'SELECT COUNT(*) as total FROM produtos WHERE status = "ativo"'
    );

    const produtosInativos = await executeQuery(
      'SELECT COUNT(*) as total FROM produtos WHERE status = "inativo"'
    );

    const produtosEstoqueBaixo = await executeQuery(
      'SELECT COUNT(*) as total FROM produtos WHERE estoque_atual <= estoque_minimo AND status = "ativo"'
    );

    const produtosSemEstoque = await executeQuery(
      'SELECT COUNT(*) as total FROM produtos WHERE estoque_atual = 0 AND status = "ativo"'
    );

    // Valor total do estoque
    const valorEstoque = await executeQuery(
      'SELECT SUM(estoque_atual * preco_custo) as valor_total FROM produtos WHERE status = "ativo" AND preco_custo IS NOT NULL'
    );

    // Produtos por grupo
    const produtosPorGrupo = await executeQuery(`
      SELECT 
        g.nome as grupo,
        COUNT(p.id) as quantidade
      FROM grupos g
      LEFT JOIN produtos p ON g.id = p.grupo_id AND p.status = 'ativo'
      WHERE g.status = 'ativo'
      GROUP BY g.id, g.nome
      ORDER BY quantidade DESC
    `);

    // Produtos por fornecedor
    const produtosPorFornecedor = await executeQuery(`
      SELECT 
        f.razao_social as fornecedor,
        COUNT(p.id) as quantidade
      FROM fornecedores f
      LEFT JOIN produtos p ON f.id = p.fornecedor_id AND p.status = 'ativo'
      WHERE f.status = 1
      GROUP BY f.id, f.razao_social
      ORDER BY quantidade DESC
      LIMIT 10
    `);

    // Top produtos com maior estoque
    const topEstoque = await executeQuery(`
      SELECT 
        p.nome,
        p.estoque_atual,
        p.estoque_minimo,
        g.nome as grupo
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      WHERE p.status = 'ativo'
      ORDER BY p.estoque_atual DESC
      LIMIT 10
    `);

    // Produtos mais caros
    const produtosMaisCaros = await executeQuery(`
      SELECT 
        p.nome,
        p.preco_venda,
        p.preco_custo,
        g.nome as grupo
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      WHERE p.status = 'ativo' AND p.preco_venda IS NOT NULL
      ORDER BY p.preco_venda DESC
      LIMIT 10
    `);

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
