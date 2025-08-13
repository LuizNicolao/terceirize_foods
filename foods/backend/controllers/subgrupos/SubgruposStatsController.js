/**
 * Controller de Estatísticas de Subgrupos
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class SubgruposStatsController {
  
  /**
   * Buscar estatísticas gerais de subgrupos
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Estatísticas gerais
    const totalSubgrupos = await executeQuery(
      'SELECT COUNT(*) as total FROM subgrupos'
    );

    const subgruposAtivos = await executeQuery(
      'SELECT COUNT(*) as total FROM subgrupos WHERE status = "ativo"'
    );

    const subgruposInativos = await executeQuery(
      'SELECT COUNT(*) as total FROM subgrupos WHERE status = "inativo"'
    );

    // Subgrupos com mais produtos
    const subgruposComMaisProdutos = await executeQuery(`
      SELECT 
        sg.nome as subgrupo,
        g.nome as grupo,
        COUNT(p.id) as produtos_count
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produtos p ON sg.id = p.subgrupo_id AND p.status = 1
      WHERE sg.status = 'ativo'
      GROUP BY sg.id, sg.nome, g.nome
      ORDER BY produtos_count DESC
      LIMIT 10
    `);

    // Subgrupos sem produtos
    const subgruposSemProdutos = await executeQuery(`
      SELECT 
        sg.id,
        sg.nome,
        sg.codigo,
        g.nome as grupo
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produtos p ON sg.id = p.subgrupo_id AND p.status = 1
      WHERE sg.status = 'ativo' AND p.id IS NULL
      ORDER BY sg.nome ASC
    `);

    // Subgrupos por grupo
    const subgruposPorGrupo = await executeQuery(`
      SELECT 
        g.nome as grupo,
        COUNT(sg.id) as subgrupos_count
      FROM grupos g
      LEFT JOIN subgrupos sg ON g.id = sg.grupo_id AND sg.status = 'ativo'
      WHERE g.status = 'ativo'
      GROUP BY g.id, g.nome
      ORDER BY subgrupos_count DESC
    `);

    // Grupos sem subgrupos
    const gruposSemSubgrupos = await executeQuery(`
      SELECT 
        g.id,
        g.nome,
        g.codigo
      FROM grupos g
      LEFT JOIN subgrupos sg ON g.id = sg.grupo_id AND sg.status = 'ativo'
      WHERE g.status = 'ativo' AND sg.id IS NULL
      ORDER BY g.nome ASC
    `);

    const estatisticas = {
      geral: {
        total_subgrupos: totalSubgrupos[0].total,
        subgrupos_ativos: subgruposAtivos[0].total,
        subgrupos_inativos: subgruposInativos[0].total
      },
      top_subgrupos_produtos: subgruposComMaisProdutos,
      subgrupos_sem_produtos: subgruposSemProdutos,
      subgrupos_por_grupo: subgruposPorGrupo,
      grupos_sem_subgrupos: gruposSemSubgrupos
    };

    return successResponse(res, estatisticas, 'Estatísticas de subgrupos obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = SubgruposStatsController;
