/**
 * Controller de Estatísticas de Nomes Genéricos
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class NomeGenericoStatsController {
  
  /**
   * Buscar estatísticas gerais de nomes genéricos
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Estatísticas gerais
    const estatisticasGerais = await executeQuery(`
      SELECT 
        COUNT(*) as total_nomes_genericos,
        COUNT(CASE WHEN status = 1 THEN 1 END) as nomes_genericos_ativos,
        COUNT(CASE WHEN status = 0 THEN 1 END) as nomes_genericos_inativos,
        COUNT(CASE WHEN grupo_id IS NOT NULL THEN 1 END) as com_grupo,
        COUNT(CASE WHEN subgrupo_id IS NOT NULL THEN 1 END) as com_subgrupo,
        COUNT(CASE WHEN classe_id IS NOT NULL THEN 1 END) as com_classe,
        (SELECT COUNT(*) FROM produtos WHERE nome_generico_id IS NOT NULL AND status = 1) as total_produtos_vinculados
      FROM nome_generico_produto
    `);

    // Nomes genéricos com mais produtos
    const nomesGenericosComMaisProdutos = await executeQuery(`
      SELECT 
        ngp.nome as nome_generico,
        g.nome as grupo,
        sg.nome as subgrupo,
        c.nome as classe,
        COUNT(p.id) as produtos_count
      FROM nome_generico_produto ngp
      LEFT JOIN grupos g ON ngp.grupo_id = g.id
      LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
      LEFT JOIN classes c ON ngp.classe_id = c.id
      LEFT JOIN produtos p ON ngp.id = p.nome_generico_id AND p.status = 1
      WHERE ngp.status = 1
      GROUP BY ngp.id, ngp.nome, g.nome, sg.nome, c.nome
      ORDER BY produtos_count DESC
      LIMIT 10
    `);

    // Nomes genéricos sem produtos
    const nomesGenericosSemProdutos = await executeQuery(`
      SELECT 
        ngp.id,
        ngp.nome,
        g.nome as grupo,
        sg.nome as subgrupo,
        c.nome as classe
      FROM nome_generico_produto ngp
      LEFT JOIN grupos g ON ngp.grupo_id = g.id
      LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
      LEFT JOIN classes c ON ngp.classe_id = c.id
      LEFT JOIN produtos p ON ngp.id = p.nome_generico_id AND p.status = 1
      WHERE ngp.status = 1 AND p.id IS NULL
      ORDER BY ngp.nome ASC
    `);

    // Distribuição por grupos
    const distribuicaoPorGrupos = await executeQuery(`
      SELECT 
        g.nome as grupo,
        COUNT(ngp.id) as nomes_genericos_count
      FROM grupos g
      LEFT JOIN nome_generico_produto ngp ON g.id = ngp.grupo_id AND ngp.status = 1
      WHERE g.status = 1
      GROUP BY g.id, g.nome
      ORDER BY nomes_genericos_count DESC
    `);

    // Distribuição por subgrupos
    const distribuicaoPorSubgrupos = await executeQuery(`
      SELECT 
        sg.nome as subgrupo,
        g.nome as grupo,
        COUNT(ngp.id) as nomes_genericos_count
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN nome_generico_produto ngp ON sg.id = ngp.subgrupo_id AND ngp.status = 1
      WHERE sg.status = 1
      GROUP BY sg.id, sg.nome, g.nome
      ORDER BY nomes_genericos_count DESC
      LIMIT 10
    `);

    // Distribuição por classes
    const distribuicaoPorClasses = await executeQuery(`
      SELECT 
        c.nome as classe,
        sg.nome as subgrupo,
        g.nome as grupo,
        COUNT(ngp.id) as nomes_genericos_count
      FROM classes c
      LEFT JOIN subgrupos sg ON c.subgrupo_id = sg.id
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN nome_generico_produto ngp ON c.id = ngp.classe_id AND ngp.status = 1
      WHERE c.status = 1
      GROUP BY c.id, c.nome, sg.nome, g.nome
      ORDER BY nomes_genericos_count DESC
      LIMIT 10
    `);

    // Grupos sem nomes genéricos
    const gruposSemNomesGenericos = await executeQuery(`
      SELECT 
        g.id,
        g.nome,
        g.codigo
      FROM grupos g
      LEFT JOIN nome_generico_produto ngp ON g.id = ngp.grupo_id AND ngp.status = 1
      WHERE g.status = 1 AND ngp.id IS NULL
      ORDER BY g.nome ASC
    `);

    // Subgrupos sem nomes genéricos
    const subgruposSemNomesGenericos = await executeQuery(`
      SELECT 
        sg.id,
        sg.nome,
        sg.codigo,
        g.nome as grupo
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN nome_generico_produto ngp ON sg.id = ngp.subgrupo_id AND ngp.status = 1
      WHERE sg.status = 1 AND ngp.id IS NULL
      ORDER BY sg.nome ASC
    `);

    // Classes sem nomes genéricos
    const classesSemNomesGenericos = await executeQuery(`
      SELECT 
        c.id,
        c.nome,
        c.codigo,
        sg.nome as subgrupo,
        g.nome as grupo
      FROM classes c
      LEFT JOIN subgrupos sg ON c.subgrupo_id = sg.id
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN nome_generico_produto ngp ON c.id = ngp.classe_id AND ngp.status = 1
      WHERE c.status = 1 AND ngp.id IS NULL
      ORDER BY c.nome ASC
    `);

    const estatisticas = {
      geral: estatisticasGerais[0],
      top_nomes_genericos_produtos: nomesGenericosComMaisProdutos,
      nomes_genericos_sem_produtos: nomesGenericosSemProdutos,
      distribuicao_por_grupos: distribuicaoPorGrupos,
      distribuicao_por_subgrupos: distribuicaoPorSubgrupos,
      distribuicao_por_classes: distribuicaoPorClasses,
      grupos_sem_nomes_genericos: gruposSemNomesGenericos,
      subgrupos_sem_nomes_genericos: subgruposSemNomesGenericos,
      classes_sem_nomes_genericos: classesSemNomesGenericos
    };

    return successResponse(res, estatisticas, 'Estatísticas de nomes genéricos obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = NomeGenericoStatsController;
