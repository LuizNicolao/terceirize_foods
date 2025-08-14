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

    // Produtos por subgrupo
    const produtosPorSubgrupo = await executeQuery(`
      SELECT 
        sg.nome as subgrupo,
        COUNT(p.id) as quantidade
      FROM subgrupos sg
      LEFT JOIN produtos p ON sg.id = p.subgrupo_id AND p.status = 1
      WHERE sg.status = 1
      GROUP BY sg.id, sg.nome
      ORDER BY quantidade DESC
    `);

    // Produtos por classe
    const produtosPorClasse = await executeQuery(`
      SELECT 
        c.nome as classe,
        COUNT(p.id) as quantidade
      FROM classes c
      LEFT JOIN produtos p ON c.id = p.classe_id AND p.status = 1
      WHERE c.status = 1
      GROUP BY c.id, c.nome
      ORDER BY quantidade DESC
    `);

    // Produtos por marca
    const produtosPorMarca = await executeQuery(`
      SELECT 
        m.marca as marca,
        COUNT(p.id) as quantidade
      FROM marcas m
      LEFT JOIN produtos p ON m.id = p.marca_id AND p.status = 1
      WHERE m.status = 1
      GROUP BY m.id, m.marca
      ORDER BY quantidade DESC
    `);

    // Produtos por tipo de registro
    const produtosPorTipoRegistro = await executeQuery(`
      SELECT 
        tipo_registro,
        COUNT(*) as quantidade
      FROM produtos
      WHERE status = 1 AND tipo_registro IS NOT NULL
      GROUP BY tipo_registro
      ORDER BY quantidade DESC
    `);

    const estatisticas = {
      geral: {
        total: totalProdutos[0].total,
        ativos: produtosAtivos[0].total,
        inativos: produtosInativos[0].total
      },
      por_grupo: produtosPorGrupo,
      por_subgrupo: produtosPorSubgrupo,
      por_classe: produtosPorClasse,
      por_marca: produtosPorMarca,
      por_tipo_registro: produtosPorTipoRegistro
    };

    return successResponse(res, estatisticas, 'Estatísticas de produtos obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = ProdutosStatsController;
