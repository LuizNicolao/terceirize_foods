/**
 * Controller de Integrações do RIR
 * APIs auxiliares para buscar dados relacionados (produtos do pedido, NQA, plano de amostragem)
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class RIRIntegrationsController {
  
  /**
   * Buscar produtos de um pedido de compra
   * Endpoint: GET /api/relatorio-inspecao/buscar-produtos-pedido?id={pedido_id}
   */
  static buscarProdutosPedido = asyncHandler(async (req, res) => {
    const { id } = req.query;

    if (!id) {
      return errorResponse(res, 'ID do pedido é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Buscar produtos do pedido com informações do grupo e NQA
    const produtos = await executeQuery(
      `SELECT 
        pi.id,
        pi.produto_generico_id,
        pi.quantidade_pedido,
        pg.nome as nome_produto,
        pg.codigo as codigo_produto,
        pg.grupo_id,
        um.simbolo as unidade_medida,
        g.nome as grupo_nome,
        n.id as nqa_id,
        n.codigo as nqa_codigo,
        n.nome as nqa_nome,
        n.nivel_inspecao
      FROM pedido_compras_itens pi
      LEFT JOIN produto_generico pg ON pi.produto_generico_id = pg.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN grupos_nqa gn ON g.id = gn.grupo_id AND gn.ativo = 1
      LEFT JOIN nqa n ON gn.nqa_id = n.id AND n.ativo = 1
      WHERE pi.pedido_id = ?
      ORDER BY pi.id`,
      [id]
    );

    // Buscar informações do pedido (fornecedor, CNPJ)
    const pedidoInfo = await executeQuery(
      `SELECT 
        pc.id,
        pc.numero_pedido,
        f.razao_social as fornecedor,
        f.cnpj as cnpj_fornecedor
      FROM pedidos_compras pc
      LEFT JOIN fornecedores f ON pc.fornecedor_id = f.id
      WHERE pc.id = ?`,
      [id]
    );

    return successResponse(res, {
      pedido: pedidoInfo[0] || null,
      produtos: produtos
    }, 'Produtos do pedido listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar NQA vinculado a um grupo de produtos
   * Endpoint: GET /api/relatorio-inspecao/buscar-nqa-grupo?grupo_id={grupo_id}
   */
  static buscarNQAGrupo = asyncHandler(async (req, res) => {
    const { grupo_id } = req.query;

    if (!grupo_id) {
      return errorResponse(res, 'grupo_id é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Buscar NQA vinculado ao grupo
    let nqa = await executeQuery(
      `SELECT n.id, n.codigo, n.nome, n.nivel_inspecao
       FROM nqa n
       INNER JOIN grupos_nqa gn ON n.id = gn.nqa_id
       WHERE gn.grupo_id = ? AND gn.ativo = 1 AND n.ativo = 1
       LIMIT 1`,
      [grupo_id]
    );

    // Se não encontrou, retornar NQA padrão (2,5)
    if (nqa.length === 0) {
      nqa = await executeQuery(
        `SELECT id, codigo, nome, nivel_inspecao 
         FROM nqa 
         WHERE codigo = '2,5' AND ativo = 1
         LIMIT 1`
      );

      if (nqa.length === 0) {
        return notFoundResponse(res, 'NQA padrão (2,5) não encontrado no sistema');
      }
    }

    return successResponse(res, nqa[0], 'NQA encontrado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar plano de amostragem por NQA e tamanho de lote
   * Endpoint: GET /api/relatorio-inspecao/buscar-plano-lote?nqa_id={nqa_id}&tamanho_lote={tamanho}
   * 
   * Nota: Esta funcionalidade já existe em plano-amostragem, mas vamos criar aqui também
   * para manter a compatibilidade com o fluxo do RIR
   */
  static buscarPlanoPorLote = asyncHandler(async (req, res) => {
    const { nqa_id, tamanho_lote } = req.query;

    if (!nqa_id || !tamanho_lote) {
      return errorResponse(res, 'nqa_id e tamanho_lote são obrigatórios', STATUS_CODES.BAD_REQUEST);
    }

    const tamanhoLote = parseInt(tamanho_lote);

    if (isNaN(tamanhoLote) || tamanhoLote < 1) {
      return errorResponse(res, 'tamanho_lote deve ser um número positivo', STATUS_CODES.BAD_REQUEST);
    }

    // Buscar faixa que engloba o tamanho do lote
    let plano = await executeQuery(
      `SELECT id, faixa_inicial, faixa_final, tamanho_amostra, ac, re
       FROM tabela_amostragem
       WHERE nqa_id = ?
         AND faixa_inicial <= ?
         AND faixa_final >= ?
         AND ativo = 1
       ORDER BY faixa_inicial ASC
       LIMIT 1`,
      [nqa_id, tamanhoLote, tamanhoLote]
    );

    // Se não encontrou, buscar próximo maior
    if (plano.length === 0) {
      plano = await executeQuery(
        `SELECT id, faixa_inicial, faixa_final, tamanho_amostra, ac, re
         FROM tabela_amostragem
         WHERE nqa_id = ?
           AND faixa_inicial > ?
           AND ativo = 1
         ORDER BY faixa_inicial ASC
         LIMIT 1`,
        [nqa_id, tamanhoLote]
      );
    }

    if (plano.length === 0) {
      return notFoundResponse(res, 'Nenhum plano de amostragem encontrado para o tamanho de lote informado');
    }

    const planoEncontrado = plano[0];
    const inspecao_100 = planoEncontrado.tamanho_amostra >= tamanhoLote;
    const recomendacao = inspecao_100 
      ? `Inspecionar 100% das ${tamanhoLote} unidades.`
      : `Inspecionar ${planoEncontrado.tamanho_amostra} unidades de ${tamanhoLote} (AC: ${planoEncontrado.ac}, RE: ${planoEncontrado.re}).`;

    return successResponse(res, {
      ...planoEncontrado,
      tamanho_lote_informado: tamanhoLote,
      inspecao_100,
      recomendacao
    }, 'Plano de amostragem encontrado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar pedidos de compra aprovados (para dropdown)
   * Endpoint: GET /api/relatorio-inspecao/pedidos-aprovados
   */
  static buscarPedidosAprovados = asyncHandler(async (req, res) => {
    const pedidos = await executeQuery(
      `SELECT 
        pc.id,
        pc.numero_pedido,
        pc.data_pedido,
        f.razao_social as fornecedor,
        f.cnpj
      FROM pedidos_compras pc
      INNER JOIN fornecedores f ON pc.fornecedor_id = f.id
      WHERE pc.status = 'aprovado'
      ORDER BY pc.data_pedido DESC, pc.numero_pedido DESC
      LIMIT 100`
    );

    return successResponse(res, pedidos, 'Pedidos aprovados listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar grupos de produtos (para dropdown)
   * Endpoint: GET /api/relatorio-inspecao/grupos
   */
  static buscarGrupos = asyncHandler(async (req, res) => {
    const grupos = await executeQuery(
      `SELECT id, codigo, nome
       FROM grupos
       WHERE status = 'ativo'
       ORDER BY nome ASC`
    );

    return successResponse(res, grupos, 'Grupos listados com sucesso', STATUS_CODES.OK);
  });
}

module.exports = RIRIntegrationsController;

