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
   * Buscar produtos de um pedido de compra (apenas itens disponíveis - não utilizados em outros RIRs)
   * Endpoint: GET /api/relatorio-inspecao/buscar-produtos-pedido?id={pedido_id}&rir_id={rir_id}
   * 
   * Regra: Mostra apenas itens que ainda não foram utilizados em nenhum RIR
   * Se rir_id for fornecido (edição), também mostra itens já utilizados neste RIR específico
   */
  static buscarProdutosPedido = asyncHandler(async (req, res) => {
    const { id, rir_id } = req.query;

    if (!id) {
      return errorResponse(res, 'ID do pedido é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Buscar produtos do pedido que ainda não foram utilizados em outros RIRs
    // Se rir_id for fornecido, também incluir itens já utilizados neste RIR (para edição)
    let produtos;
    
    if (rir_id) {
      // Modo edição: mostrar itens disponíveis + itens já usados neste RIR
      // Também calcular quantidades já lançadas em notas fiscais
      produtos = await executeQuery(
        `SELECT 
          pi.id,
          pi.produto_generico_id,
          pi.quantidade_pedido,
          pi.codigo_produto,
          pg.nome as nome_produto,
          pg.codigo as codigo_produto,
          pg.grupo_id,
          um.sigla as unidade_medida,
          g.nome as grupo_nome,
          n.id as nqa_id,
          n.codigo as nqa_codigo,
          n.nome as nqa_nome,
          n.nivel_inspecao,
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM relatorio_inspecao_produtos rip 
              WHERE rip.pedido_item_id = pi.id AND rip.relatorio_inspecao_id = ?
            ) THEN 1
            ELSE 0
          END as ja_utilizado_neste_rir,
          -- Calcular quantidade já lançada em notas fiscais
          COALESCE(SUM(
            CASE 
              WHEN nf.status = 'LANCADA' THEN nfi.quantidade 
              ELSE 0 
            END
          ), 0) as quantidade_lancada_notas,
          -- Calcular saldo disponível (quantidade do pedido - quantidade já lançada)
          (pi.quantidade_pedido - COALESCE(SUM(
            CASE 
              WHEN nf.status = 'LANCADA' THEN nfi.quantidade 
              ELSE 0 
            END
          ), 0)) as quantidade_disponivel
        FROM pedido_compras_itens pi
        LEFT JOIN produto_generico pg ON pi.produto_generico_id = pg.id
        LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
        LEFT JOIN grupos g ON pg.grupo_id = g.id
        LEFT JOIN grupos_nqa gn ON g.id = gn.grupo_id AND gn.ativo = 1
        LEFT JOIN nqa n ON gn.nqa_id = n.id AND n.ativo = 1
        LEFT JOIN notas_fiscais nf ON nf.pedido_compra_id = pi.pedido_id
        LEFT JOIN notas_fiscais_itens nfi ON nfi.nota_fiscal_id = nf.id 
          AND (
            nfi.codigo_produto COLLATE utf8mb4_unicode_ci = pi.codigo_produto
            OR nfi.produto_generico_id = pi.produto_generico_id
          )
        WHERE pi.pedido_id = ?
          AND (
            -- Itens que ainda não foram usados em nenhum RIR
            NOT EXISTS (
              SELECT 1 FROM relatorio_inspecao_produtos rip 
              WHERE rip.pedido_item_id IS NOT NULL 
                AND rip.pedido_item_id = pi.id
            )
            -- OU itens já usados neste RIR específico (para edição)
            OR EXISTS (
              SELECT 1 FROM relatorio_inspecao_produtos rip 
              WHERE rip.pedido_item_id IS NOT NULL 
                AND rip.pedido_item_id = pi.id 
                AND rip.relatorio_inspecao_id = ?
            )
          )
        GROUP BY pi.id, pi.produto_generico_id, pi.quantidade_pedido, pi.codigo_produto,
                 pg.nome, pg.codigo, pg.grupo_id, um.sigla, g.nome, n.id, n.codigo, n.nome, n.nivel_inspecao
        ORDER BY pi.id`,
        [rir_id, id, rir_id]
      );
    } else {
      // Modo criação: mostrar apenas itens disponíveis
      // Calcular saldo disponível considerando quantidades já lançadas em notas fiscais
      produtos = await executeQuery(
        `SELECT 
          pi.id,
          pi.produto_generico_id,
          pi.quantidade_pedido,
          pi.codigo_produto,
          pg.nome as nome_produto,
          pg.codigo as codigo_produto,
          pg.grupo_id,
          um.sigla as unidade_medida,
          g.nome as grupo_nome,
          n.id as nqa_id,
          n.codigo as nqa_codigo,
          n.nome as nqa_nome,
          n.nivel_inspecao,
          -- Calcular quantidade já lançada em notas fiscais
          COALESCE(SUM(
            CASE 
              WHEN nf.status = 'LANCADA' THEN nfi.quantidade 
              ELSE 0 
            END
          ), 0) as quantidade_lancada_notas,
          -- Calcular saldo disponível (quantidade do pedido - quantidade já lançada)
          (pi.quantidade_pedido - COALESCE(SUM(
            CASE 
              WHEN nf.status = 'LANCADA' THEN nfi.quantidade 
              ELSE 0 
            END
          ), 0)) as quantidade_disponivel
        FROM pedido_compras_itens pi
        LEFT JOIN produto_generico pg ON pi.produto_generico_id = pg.id
        LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
        LEFT JOIN grupos g ON pg.grupo_id = g.id
        LEFT JOIN grupos_nqa gn ON g.id = gn.grupo_id AND gn.ativo = 1
        LEFT JOIN nqa n ON gn.nqa_id = n.id AND n.ativo = 1
        LEFT JOIN notas_fiscais nf ON nf.pedido_compra_id = pi.pedido_id
        LEFT JOIN notas_fiscais_itens nfi ON nfi.nota_fiscal_id = nf.id 
          AND (
            nfi.codigo_produto COLLATE utf8mb4_unicode_ci = pi.codigo_produto
            OR nfi.produto_generico_id = pi.produto_generico_id
          )
        WHERE pi.pedido_id = ?
        GROUP BY pi.id, pi.produto_generico_id, pi.quantidade_pedido, pi.codigo_produto, 
                 pg.nome, pg.codigo, pg.grupo_id, um.sigla, g.nome, n.id, n.codigo, n.nome, n.nivel_inspecao
        HAVING quantidade_disponivel > 0
        ORDER BY pi.id`,
        [id]
      );
    }

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
   * Exclui pedidos com saldo disponível = 0 (100% utilizado)
   * Endpoint: GET /api/relatorio-inspecao/pedidos-aprovados
   */
  static buscarPedidosAprovados = asyncHandler(async (req, res) => {
    // Buscar pedidos aprovados com cálculo de saldo disponível
    const pedidos = await executeQuery(
      `SELECT 
        pc.id,
        pc.numero_pedido,
        pc.criado_em as data_pedido,
        f.razao_social as fornecedor,
        f.cnpj,
        -- Calcular saldo disponível: quantidade do pedido - quantidade já lançada em notas fiscais
        COALESCE(SUM(pci.quantidade_pedido), 0) as quantidade_total_pedido,
        COALESCE(SUM(
          CASE 
            WHEN nf.status = 'LANCADA' THEN nfi.quantidade 
            ELSE 0 
          END
        ), 0) as quantidade_lancada,
        (COALESCE(SUM(pci.quantidade_pedido), 0) - COALESCE(SUM(
          CASE 
            WHEN nf.status = 'LANCADA' THEN nfi.quantidade 
            ELSE 0 
          END
        ), 0)) as saldo_disponivel
      FROM pedidos_compras pc
      INNER JOIN fornecedores f ON pc.fornecedor_id = f.id
      LEFT JOIN pedido_compras_itens pci ON pci.pedido_id = pc.id
      LEFT JOIN notas_fiscais nf ON nf.pedido_compra_id = pc.id
      LEFT JOIN notas_fiscais_itens nfi ON nfi.nota_fiscal_id = nf.id 
        AND (
          nfi.codigo_produto COLLATE utf8mb4_unicode_ci = pci.codigo_produto
          OR nfi.produto_generico_id = pci.produto_generico_id
        )
      WHERE pc.status IN ('aprovado', 'parcial')
      GROUP BY pc.id, pc.numero_pedido, pc.criado_em, f.razao_social, f.cnpj
      HAVING saldo_disponivel > 0
      ORDER BY pc.criado_em DESC, pc.numero_pedido DESC
      LIMIT 100`
    );

    // Formatar resultado removendo campos de cálculo e mantendo apenas dados essenciais
    const pedidosFormatados = pedidos.map(p => ({
      id: p.id,
      numero_pedido: p.numero_pedido,
      data_pedido: p.data_pedido,
      fornecedor: p.fornecedor,
      cnpj: p.cnpj,
      saldo_disponivel: parseFloat(p.saldo_disponivel) || 0
    }));

    return successResponse(res, pedidosFormatados, 'Pedidos aprovados listados com sucesso', STATUS_CODES.OK);
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

  /**
   * Calcular saldo disponível de um pedido de compra
   * Retorna quantidade total do pedido, quantidade já lançada e saldo disponível
   * Endpoint: GET /api/relatorio-inspecao/saldo-pedido/:pedido_id
   */
  static calcularSaldoPedido = asyncHandler(async (req, res) => {
    const { pedido_id } = req.params;

    if (!pedido_id) {
      return errorResponse(res, 'ID do pedido é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Buscar saldo disponível por item do pedido
    const saldoItens = await executeQuery(
      `SELECT 
        pci.id as item_id,
        pci.produto_generico_id,
        pci.codigo_produto,
        pci.quantidade_pedido,
        COALESCE(SUM(
          CASE 
            WHEN nf.status = 'LANCADA' THEN nfi.quantidade 
            ELSE 0 
          END
        ), 0) as quantidade_lancada,
        (pci.quantidade_pedido - COALESCE(SUM(
          CASE 
            WHEN nf.status = 'LANCADA' THEN nfi.quantidade 
            ELSE 0 
          END
        ), 0)) as saldo_disponivel,
        pg.nome as produto_nome,
        pg.codigo as produto_codigo
      FROM pedido_compras_itens pci
      LEFT JOIN produto_generico pg ON pci.produto_generico_id = pg.id
      LEFT JOIN notas_fiscais nf ON nf.pedido_compra_id = pci.pedido_id
      LEFT JOIN notas_fiscais_itens nfi ON nfi.nota_fiscal_id = nf.id 
        AND (
          nfi.codigo_produto COLLATE utf8mb4_unicode_ci = pci.codigo_produto
          OR nfi.produto_generico_id = pci.produto_generico_id
        )
      WHERE pci.pedido_id = ?
      GROUP BY pci.id, pci.produto_generico_id, pci.codigo_produto, pci.quantidade_pedido, pg.nome, pg.codigo
      ORDER BY pci.id`,
      [pedido_id]
    );

    // Calcular totais
    const totais = saldoItens.reduce((acc, item) => {
      acc.quantidade_total_pedido += parseFloat(item.quantidade_pedido) || 0;
      acc.quantidade_lancada += parseFloat(item.quantidade_lancada) || 0;
      acc.saldo_disponivel += parseFloat(item.saldo_disponivel) || 0;
      return acc;
    }, { quantidade_total_pedido: 0, quantidade_lancada: 0, saldo_disponivel: 0 });

    return successResponse(res, {
      itens: saldoItens.map(item => ({
        item_id: item.item_id,
        produto_generico_id: item.produto_generico_id,
        codigo_produto: item.codigo_produto,
        produto_nome: item.produto_nome,
        produto_codigo: item.produto_codigo,
        quantidade_pedido: parseFloat(item.quantidade_pedido) || 0,
        quantidade_lancada: parseFloat(item.quantidade_lancada) || 0,
        saldo_disponivel: parseFloat(item.saldo_disponivel) || 0
      })),
      totais: {
        quantidade_total_pedido: totais.quantidade_total_pedido,
        quantidade_lancada: totais.quantidade_lancada,
        saldo_disponivel: totais.saldo_disponivel
      }
    }, 'Saldo do pedido calculado com sucesso', STATUS_CODES.OK);
  });
}

module.exports = RIRIntegrationsController;

