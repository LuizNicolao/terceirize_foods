/**
 * Controller de Estatísticas de Classes
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ClassesStatsController {
  
  /**
   * Buscar estatísticas gerais de classes
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Estatísticas gerais
    const totalClasses = await executeQuery(
      'SELECT COUNT(*) as total FROM classes'
    );

    const classesAtivas = await executeQuery(
      'SELECT COUNT(*) as total FROM classes WHERE status = "ativo"'
    );

    const classesInativas = await executeQuery(
      'SELECT COUNT(*) as total FROM classes WHERE status = "inativo"'
    );

    // Classes com mais produtos
    const classesComMaisProdutos = await executeQuery(`
      SELECT 
        c.nome as classe,
        s.nome as subgrupo,
        g.nome as grupo,
        COUNT(p.id) as produtos_count
      FROM classes c
      LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
      LEFT JOIN grupos g ON s.grupo_id = g.id
      LEFT JOIN produtos p ON c.id = p.classe_id AND p.status = 1
      WHERE c.status = 'ativo'
      GROUP BY c.id, c.nome, s.nome, g.nome
      ORDER BY produtos_count DESC
      LIMIT 10
    `);

    // Classes sem produtos
    const classesSemProdutos = await executeQuery(`
      SELECT 
        c.id,
        c.nome,
        c.codigo,
        s.nome as subgrupo,
        g.nome as grupo
      FROM classes c
      LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
      LEFT JOIN grupos g ON s.grupo_id = g.id
      LEFT JOIN produtos p ON c.id = p.classe_id AND p.status = 1
      WHERE c.status = 'ativo' AND p.id IS NULL
      ORDER BY c.nome ASC
    `);

    // Classes por subgrupo
    const classesPorSubgrupo = await executeQuery(`
      SELECT 
        s.nome as subgrupo,
        g.nome as grupo,
        COUNT(c.id) as classes_count
      FROM subgrupos s
      LEFT JOIN grupos g ON s.grupo_id = g.id
      LEFT JOIN classes c ON s.id = c.subgrupo_id AND c.status = 'ativo'
      WHERE s.status = 'ativo'
      GROUP BY s.id, s.nome, g.nome
      ORDER BY classes_count DESC
    `);

    // Subgrupos sem classes
    const subgruposSemClasses = await executeQuery(`
      SELECT 
        s.id,
        s.nome,
        s.codigo,
        g.nome as grupo
      FROM subgrupos s
      LEFT JOIN grupos g ON s.grupo_id = g.id
      LEFT JOIN classes c ON s.id = c.subgrupo_id AND c.status = 'ativo'
      WHERE s.status = 'ativo' AND c.id IS NULL
      ORDER BY s.nome ASC
    `);

    // Distribuição por grupos
    const distribuicaoPorGrupos = await executeQuery(`
      SELECT 
        g.nome as grupo,
        COUNT(DISTINCT s.id) as subgrupos_count,
        COUNT(DISTINCT c.id) as classes_count
      FROM grupos g
      LEFT JOIN subgrupos s ON g.id = s.grupo_id AND s.status = 'ativo'
      LEFT JOIN classes c ON s.id = c.subgrupo_id AND c.status = 'ativo'
      WHERE g.status = 'ativo'
      GROUP BY g.id, g.nome
      ORDER BY classes_count DESC
    `);

    const estatisticas = {
      geral: {
        total_classes: totalClasses[0].total,
        classes_ativas: classesAtivas[0].total,
        classes_inativas: classesInativas[0].total
      },
      top_classes_produtos: classesComMaisProdutos,
      classes_sem_produtos: classesSemProdutos,
      classes_por_subgrupo: classesPorSubgrupo,
      subgrupos_sem_classes: subgruposSemClasses,
      distribuicao_por_grupos: distribuicaoPorGrupos
    };

    return successResponse(res, estatisticas, 'Estatísticas de classes obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = ClassesStatsController;
