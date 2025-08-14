/**
 * Controller de Estatísticas de Produto Origem
 * Responsável por relatórios e métricas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutoOrigemStatsController {
  
  /**
   * Estatísticas gerais
   */
  static estatisticasGerais = asyncHandler(async (req, res) => {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inativos,
        SUM(CASE WHEN grupo_id IS NOT NULL THEN 1 ELSE 0 END) as com_grupo,
        SUM(CASE WHEN grupo_id IS NULL THEN 1 ELSE 0 END) as sem_grupo,
        SUM(CASE WHEN subgrupo_id IS NOT NULL THEN 1 ELSE 0 END) as com_subgrupo,
        SUM(CASE WHEN subgrupo_id IS NULL THEN 1 ELSE 0 END) as sem_subgrupo,
        SUM(CASE WHEN classe_id IS NOT NULL THEN 1 ELSE 0 END) as com_classe,
        SUM(CASE WHEN classe_id IS NULL THEN 1 ELSE 0 END) as sem_classe,
        SUM(CASE WHEN produto_generico_padrao_id IS NOT NULL THEN 1 ELSE 0 END) as com_produto_generico,
        SUM(CASE WHEN produto_generico_padrao_id IS NULL THEN 1 ELSE 0 END) as sem_produto_generico,
        AVG(fator_conversao) as media_fator_conversao,
        AVG(peso_liquido) as media_peso_liquido,
        MIN(data_criacao) as primeiro_cadastro,
        MAX(data_atualizacao) as ultima_atualizacao
      FROM produto_origem
    `);

    successResponse(res, 'Estatísticas gerais obtidas', stats[0]);
  });

  /**
   * Estatísticas por grupo
   */
  static estatisticasPorGrupo = asyncHandler(async (req, res) => {
    const stats = await executeQuery(`
      SELECT 
        g.id,
        g.nome as grupo_nome,
        COUNT(po.id) as total_produtos,
        SUM(CASE WHEN po.status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN po.status = 0 THEN 1 ELSE 0 END) as inativos,
        AVG(po.fator_conversao) as media_fator_conversao,
        AVG(po.peso_liquido) as media_peso_liquido
      FROM grupos g
      LEFT JOIN produto_origem po ON g.id = po.grupo_id
      WHERE g.status = 1
      GROUP BY g.id, g.nome
      ORDER BY total_produtos DESC
    `);

    successResponse(res, 'Estatísticas por grupo obtidas', stats);
  });

  /**
   * Estatísticas por subgrupo
   */
  static estatisticasPorSubgrupo = asyncHandler(async (req, res) => {
    const stats = await executeQuery(`
      SELECT 
        sg.id,
        sg.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(po.id) as total_produtos,
        SUM(CASE WHEN po.status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN po.status = 0 THEN 1 ELSE 0 END) as inativos,
        AVG(po.fator_conversao) as media_fator_conversao,
        AVG(po.peso_liquido) as media_peso_liquido
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produto_origem po ON sg.id = po.subgrupo_id
      WHERE sg.status = 1
      GROUP BY sg.id, sg.nome, g.nome
      ORDER BY total_produtos DESC
    `);

    successResponse(res, 'Estatísticas por subgrupo obtidas', stats);
  });

  /**
   * Estatísticas por classe
   */
  static estatisticasPorClasse = asyncHandler(async (req, res) => {
    const stats = await executeQuery(`
      SELECT 
        c.id,
        c.nome as classe_nome,
        sg.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(po.id) as total_produtos,
        SUM(CASE WHEN po.status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN po.status = 0 THEN 1 ELSE 0 END) as inativos,
        AVG(po.fator_conversao) as media_fator_conversao,
        AVG(po.peso_liquido) as media_peso_liquido
      FROM classes c
      LEFT JOIN subgrupos sg ON c.subgrupo_id = sg.id
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produto_origem po ON c.id = po.classe_id
      WHERE c.status = 1
      GROUP BY c.id, c.nome, sg.nome, g.nome
      ORDER BY total_produtos DESC
    `);

    successResponse(res, 'Estatísticas por classe obtidas', stats);
  });

  /**
   * Estatísticas por unidade de medida
   */
  static estatisticasPorUnidadeMedida = asyncHandler(async (req, res) => {
    const stats = await executeQuery(`
      SELECT 
        um.id,
        um.nome as unidade_medida_nome,
        COUNT(po.id) as total_produtos,
        SUM(CASE WHEN po.status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN po.status = 0 THEN 1 ELSE 0 END) as inativos,
        AVG(po.fator_conversao) as media_fator_conversao,
        AVG(po.peso_liquido) as media_peso_liquido
      FROM unidades_medida um
      LEFT JOIN produto_origem po ON um.id = po.unidade_medida_id
      WHERE um.status = 1
      GROUP BY um.id, um.nome
      ORDER BY total_produtos DESC
    `);

    successResponse(res, 'Estatísticas por unidade de medida obtidas', stats);
  });

  /**
   * Produtos mais recentes
   */
  static produtosRecentes = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const produtos = await executeQuery(`
      SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        ngp.nome as produto_generico_padrao_nome,
        uc.nome as usuario_criador_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN nome_generico_produto ngp ON po.produto_generico_padrao_id = ngp.id
      LEFT JOIN usuarios uc ON po.usuario_criador_id = uc.id
      ORDER BY po.data_criacao DESC
      LIMIT ?
    `, [parseInt(limit)]);

    successResponse(res, 'Produtos mais recentes obtidos', produtos);
  });

  /**
   * Produtos mais atualizados
   */
  static produtosMaisAtualizados = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const produtos = await executeQuery(`
      SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        ngp.nome as produto_generico_padrao_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN nome_generico_produto ngp ON po.produto_generico_padrao_id = ngp.id
      LEFT JOIN usuarios ua ON po.usuario_atualizador_id = ua.id
      WHERE po.data_atualizacao IS NOT NULL
      ORDER BY po.data_atualizacao DESC
      LIMIT ?
    `, [parseInt(limit)]);

    successResponse(res, 'Produtos mais atualizados obtidos', produtos);
  });

  /**
   * Relatório de produtos sem classificação completa
   */
  static relatorioSemClassificacao = asyncHandler(async (req, res) => {
    const relatorio = await executeQuery(`
      SELECT 
        'Sem Grupo' as tipo,
        COUNT(*) as quantidade
      FROM produto_origem 
      WHERE grupo_id IS NULL AND status = 1
      
      UNION ALL
      
      SELECT 
        'Sem Subgrupo' as tipo,
        COUNT(*) as quantidade
      FROM produto_origem 
      WHERE subgrupo_id IS NULL AND status = 1
      
      UNION ALL
      
      SELECT 
        'Sem Classe' as tipo,
        COUNT(*) as quantidade
      FROM produto_origem 
      WHERE classe_id IS NULL AND status = 1
      
      UNION ALL
      
      SELECT 
        'Sem Produto Genérico' as tipo,
        COUNT(*) as quantidade
      FROM produto_origem 
      WHERE produto_generico_padrao_id IS NULL AND status = 1
      
      ORDER BY quantidade DESC
    `);

    successResponse(res, 'Relatório de produtos sem classificação obtido', relatorio);
  });

  /**
   * Distribuição por fator de conversão
   */
  static distribuicaoFatorConversao = asyncHandler(async (req, res) => {
    const distribuicao = await executeQuery(`
      SELECT 
        CASE 
          WHEN fator_conversao = 1.000 THEN 'Padrão (1.000)'
          WHEN fator_conversao < 1.000 THEN 'Menor que 1.000'
          WHEN fator_conversao <= 10.000 THEN '1.000 - 10.000'
          WHEN fator_conversao <= 100.000 THEN '10.000 - 100.000'
          ELSE 'Maior que 100.000'
        END as faixa,
        COUNT(*) as quantidade,
        AVG(fator_conversao) as media_fator
      FROM produto_origem
      WHERE status = 1
      GROUP BY 
        CASE 
          WHEN fator_conversao = 1.000 THEN 'Padrão (1.000)'
          WHEN fator_conversao < 1.000 THEN 'Menor que 1.000'
          WHEN fator_conversao <= 10.000 THEN '1.000 - 10.000'
          WHEN fator_conversao <= 100.000 THEN '10.000 - 100.000'
          ELSE 'Maior que 100.000'
        END
      ORDER BY media_fator
    `);

    successResponse(res, 'Distribuição por fator de conversão obtida', distribuicao);
  });

  /**
   * Distribuição por peso líquido
   */
  static distribuicaoPesoLiquido = asyncHandler(async (req, res) => {
    const distribuicao = await executeQuery(`
      SELECT 
        CASE 
          WHEN peso_liquido IS NULL THEN 'Não informado'
          WHEN peso_liquido = 0 THEN 'Zero'
          WHEN peso_liquido <= 0.100 THEN 'Até 100g'
          WHEN peso_liquido <= 1.000 THEN '100g - 1kg'
          WHEN peso_liquido <= 10.000 THEN '1kg - 10kg'
          WHEN peso_liquido <= 100.000 THEN '10kg - 100kg'
          ELSE 'Mais de 100kg'
        END as faixa,
        COUNT(*) as quantidade,
        AVG(peso_liquido) as media_peso
      FROM produto_origem
      WHERE status = 1
      GROUP BY 
        CASE 
          WHEN peso_liquido IS NULL THEN 'Não informado'
          WHEN peso_liquido = 0 THEN 'Zero'
          WHEN peso_liquido <= 0.100 THEN 'Até 100g'
          WHEN peso_liquido <= 1.000 THEN '100g - 1kg'
          WHEN peso_liquido <= 10.000 THEN '1kg - 10kg'
          WHEN peso_liquido <= 100.000 THEN '10kg - 100kg'
          ELSE 'Mais de 100kg'
        END
      ORDER BY media_peso
    `);

    successResponse(res, 'Distribuição por peso líquido obtida', distribuicao);
  });
}

module.exports = ProdutoOrigemStatsController;
