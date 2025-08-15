/**
 * Controller de Estatísticas de Produtos Genéricos
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutoGenericoStatsController {
  
  /**
   * Buscar estatísticas gerais de produtos genéricos
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Estatísticas gerais
    const estatisticasGerais = await executeQuery(`
      SELECT 
        COUNT(*) as total_produtos_genericos,
        COUNT(CASE WHEN status = 1 THEN 1 END) as produtos_genericos_ativos,
        COUNT(CASE WHEN status = 0 THEN 1 END) as produtos_genericos_inativos,
        COUNT(CASE WHEN grupo_id IS NOT NULL THEN 1 END) as com_grupo,
        COUNT(CASE WHEN subgrupo_id IS NOT NULL THEN 1 END) as com_subgrupo,
        COUNT(CASE WHEN classe_id IS NOT NULL THEN 1 END) as com_classe,
        COUNT(CASE WHEN produto_padrao = 'Sim' THEN 1 END) as produtos_padrao,
        COUNT(CASE WHEN produto_origem_id IS NOT NULL THEN 1 END) as com_produto_origem,
        (SELECT COUNT(*) FROM produtos WHERE nome_generico_id IS NOT NULL AND status = 1) as total_produtos_vinculados
      FROM produto_generico
    `);

    // Produtos genéricos com mais produtos
    const produtosGenericosComMaisProdutos = await executeQuery(`
      SELECT 
        pg.nome as produto_generico,
        g.nome as grupo,
        sg.nome as subgrupo,
        c.nome as classe,
        COUNT(p.id) as produtos_count
      FROM produto_generico pg
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.status = 1
      GROUP BY pg.id, pg.nome, g.nome, sg.nome, c.nome
      ORDER BY produtos_count DESC
      LIMIT 10
    `);

    // Produtos genéricos sem produtos
    const produtosGenericosSemProdutos = await executeQuery(`
      SELECT 
        pg.id,
        pg.nome,
        g.nome as grupo,
        sg.nome as subgrupo,
        c.nome as classe
      FROM produto_generico pg
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.status = 1 AND p.id IS NULL
      ORDER BY pg.nome ASC
    `);

    // Distribuição por grupos
    const distribuicaoPorGrupos = await executeQuery(`
      SELECT 
        g.nome as grupo,
        COUNT(pg.id) as produtos_genericos_count
      FROM grupos g
      LEFT JOIN produto_generico pg ON g.id = pg.grupo_id AND pg.status = 1
      WHERE g.status = 1
      GROUP BY g.id, g.nome
      ORDER BY produtos_genericos_count DESC
    `);

    // Distribuição por subgrupos
    const distribuicaoPorSubgrupos = await executeQuery(`
      SELECT 
        sg.nome as subgrupo,
        g.nome as grupo,
        COUNT(pg.id) as produtos_genericos_count
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produto_generico pg ON sg.id = pg.subgrupo_id AND pg.status = 1
      WHERE sg.status = 1
      GROUP BY sg.id, sg.nome, g.nome
      ORDER BY produtos_genericos_count DESC
      LIMIT 10
    `);

    // Distribuição por classes
    const distribuicaoPorClasses = await executeQuery(`
      SELECT 
        c.nome as classe,
        sg.nome as subgrupo,
        g.nome as grupo,
        COUNT(pg.id) as produtos_genericos_count
      FROM classes c
      LEFT JOIN subgrupos sg ON c.subgrupo_id = sg.id
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produto_generico pg ON c.id = pg.classe_id AND pg.status = 1
      WHERE c.status = 1
      GROUP BY c.id, c.nome, sg.nome, g.nome
      ORDER BY produtos_genericos_count DESC
      LIMIT 10
    `);

    // Produtos padrão
    const produtosPadrao = await executeQuery(`
      SELECT 
        pg.id,
        pg.nome,
        g.nome as grupo,
        sg.nome as subgrupo,
        c.nome as classe
      FROM produto_generico pg
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      WHERE pg.status = 1 AND pg.produto_padrao = 'Sim'
      ORDER BY pg.nome ASC
    `);

    // Produtos com origem
    const produtosComOrigem = await executeQuery(`
      SELECT 
        pg.id,
        pg.nome,
        po.nome as produto_origem,
        pg.fator_conversao,
        g.nome as grupo
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      WHERE pg.status = 1 AND pg.produto_origem_id IS NOT NULL
      ORDER BY pg.nome ASC
    `);

    // Grupos sem produtos genéricos
    const gruposSemProdutosGenericos = await executeQuery(`
      SELECT 
        g.id,
        g.nome,
        g.codigo
      FROM grupos g
      LEFT JOIN produto_generico pg ON g.id = pg.grupo_id AND pg.status = 1
      WHERE g.status = 1 AND pg.id IS NULL
      ORDER BY g.nome ASC
    `);

    // Subgrupos sem produtos genéricos
    const subgruposSemProdutosGenericos = await executeQuery(`
      SELECT 
        sg.id,
        sg.nome,
        sg.codigo,
        g.nome as grupo
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produto_generico pg ON sg.id = pg.subgrupo_id AND pg.status = 1
      WHERE sg.status = 1 AND pg.id IS NULL
      ORDER BY sg.nome ASC
    `);

    // Classes sem produtos genéricos
    const classesSemProdutosGenericos = await executeQuery(`
      SELECT 
        c.id,
        c.nome,
        c.codigo,
        sg.nome as subgrupo,
        g.nome as grupo
      FROM classes c
      LEFT JOIN subgrupos sg ON c.subgrupo_id = sg.id
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produto_generico pg ON c.id = pg.classe_id AND pg.status = 1
      WHERE c.status = 1 AND pg.id IS NULL
      ORDER BY c.nome ASC
    `);

    const estatisticas = {
      geral: estatisticasGerais[0],
      top_produtos_genericos_produtos: produtosGenericosComMaisProdutos,
      produtos_genericos_sem_produtos: produtosGenericosSemProdutos,
      distribuicao_por_grupos: distribuicaoPorGrupos,
      distribuicao_por_subgrupos: distribuicaoPorSubgrupos,
      distribuicao_por_classes: distribuicaoPorClasses,
      produtos_padrao: produtosPadrao,
      produtos_com_origem: produtosComOrigem,
      grupos_sem_produtos_genericos: gruposSemProdutosGenericos,
      subgrupos_sem_produtos_genericos: subgruposSemProdutosGenericos,
      classes_sem_produtos_genericos: classesSemProdutosGenericos
    };

    return successResponse(res, estatisticas, 'Estatísticas de produtos genéricos obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = ProdutoGenericoStatsController;
