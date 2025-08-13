/**
 * Controller de Estatísticas de Grupos
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class GruposStatsController {
  
  /**
   * Buscar estatísticas gerais de grupos
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Estatísticas gerais
    const totalGrupos = await executeQuery(
      'SELECT COUNT(*) as total FROM grupos'
    );

    const gruposAtivos = await executeQuery(
      'SELECT COUNT(*) as total FROM grupos WHERE status = "ativo"'
    );

    const gruposInativos = await executeQuery(
      'SELECT COUNT(*) as total FROM grupos WHERE status = "inativo"'
    );

    const totalSubgrupos = await executeQuery(
      'SELECT COUNT(*) as total FROM subgrupos'
    );

    const subgruposAtivos = await executeQuery(
      'SELECT COUNT(*) as total FROM subgrupos WHERE status = 1'
    );

    // Grupos com mais subgrupos
    const gruposComMaisSubgrupos = await executeQuery(`
      SELECT 
        g.nome as grupo,
        COUNT(sg.id) as subgrupos_count
      FROM grupos g
      LEFT JOIN subgrupos sg ON g.id = sg.grupo_id AND sg.status = 1
      WHERE g.status = 'ativo'
      GROUP BY g.id, g.nome
      ORDER BY subgrupos_count DESC
      LIMIT 10
    `);

    // Grupos com mais produtos
    const gruposComMaisProdutos = await executeQuery(`
      SELECT 
        g.nome as grupo,
        COUNT(p.id) as produtos_count
      FROM grupos g
      LEFT JOIN produtos p ON g.id = p.grupo_id AND p.status = 1
      WHERE g.status = 'ativo'
      GROUP BY g.id, g.nome
      ORDER BY produtos_count DESC
      LIMIT 10
    `);

    // Grupos sem subgrupos
    const gruposSemSubgrupos = await executeQuery(`
      SELECT 
        g.id,
        g.nome,
        g.codigo
      FROM grupos g
      LEFT JOIN subgrupos sg ON g.id = sg.grupo_id AND sg.status = 1
      WHERE g.status = 'ativo' AND sg.id IS NULL
      ORDER BY g.nome ASC
    `);

    // Grupos sem produtos
    const gruposSemProdutos = await executeQuery(`
      SELECT 
        g.id,
        g.nome,
        g.codigo
      FROM grupos g
      LEFT JOIN produtos p ON g.id = p.grupo_id AND p.status = 1
      WHERE g.status = 'ativo' AND p.id IS NULL
      ORDER BY g.nome ASC
    `);

    const estatisticas = {
      geral: {
        total_grupos: totalGrupos[0].total,
        grupos_ativos: gruposAtivos[0].total,
        grupos_inativos: gruposInativos[0].total,
        total_subgrupos: totalSubgrupos[0].total,
        subgrupos_ativos: subgruposAtivos[0].total
      },
      top_grupos_subgrupos: gruposComMaisSubgrupos,
      top_grupos_produtos: gruposComMaisProdutos,
      grupos_sem_subgrupos: gruposSemSubgrupos,
      grupos_sem_produtos: gruposSemProdutos
    };

    return successResponse(res, estatisticas, 'Estatísticas de grupos obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = GruposStatsController;
