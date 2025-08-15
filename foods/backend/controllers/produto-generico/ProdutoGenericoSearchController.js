/**
 * Controller de Busca para Produto Genérico
 * Responsável por operações de busca avançada
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutoGenericoSearchController {
  
  /**
   * Buscar produtos genéricos por similaridade
   */
  static buscarProdutosGenericosSimilares = asyncHandler(async (req, res) => {
    const { search, limit = 10 } = req.query;

    if (!search || search.trim().length < 2) {
      return errorResponse(res, 'Termo de busca deve ter pelo menos 2 caracteres', STATUS_CODES.BAD_REQUEST);
    }

    const searchTerm = `%${search.trim()}%`;
    
    const produtosGenericos = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        po.codigo as produto_origem_codigo,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.status = 1 
        AND (
          pg.codigo LIKE ? 
          OR pg.nome LIKE ? 
          OR pg.referencia_mercado LIKE ? 
          OR pg.referencia_interna LIKE ? 
          OR pg.referencia_externa LIKE ?
          OR pg.registro_especifico LIKE ?
          OR pg.integracao_senior LIKE ?
        )
      GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, po.codigo, g.nome, sg.nome, c.nome, um.nome
      ORDER BY 
        CASE 
          WHEN pg.codigo = ? THEN 1
          WHEN pg.nome LIKE ? THEN 2
          ELSE 3
        END,
        pg.nome ASC
      LIMIT ?`,
      [
        searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
        search.trim(), `${search.trim()}%`, parseInt(limit)
      ]
    );

    successResponse(res, produtosGenericos, 'Produtos genéricos encontrados por similaridade');
  });

  /**
   * Buscar produtos genéricos por código
   */
  static buscarProdutosGenericosPorCodigo = asyncHandler(async (req, res) => {
    const { codigo } = req.params;

    if (!codigo || codigo.trim().length === 0) {
      return errorResponse(res, 'Código é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    const searchTerm = `%${codigo.trim()}%`;
    
    const produtosGenericos = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        po.codigo as produto_origem_codigo,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        COUNT(p.id) as total_produtos
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
      WHERE pg.codigo LIKE ?
      GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.status, pg.criado_em, pg.atualizado_em, pg.usuario_criador_id, pg.usuario_atualizador_id, po.nome, po.codigo, g.nome, sg.nome, c.nome, um.nome
      ORDER BY pg.nome ASC`,
      [searchTerm]
    );

    successResponse(res, produtosGenericos, 'Produtos genéricos encontrados por código');
  });
}

module.exports = ProdutoGenericoSearchController;
