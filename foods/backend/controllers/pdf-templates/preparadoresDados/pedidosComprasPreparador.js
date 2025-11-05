/**
 * Preparador de dados para templates de Pedidos de Compras
 */

class PedidosComprasPreparador {
  /**
   * Preparar dados para template de pedido de compras
   * @param {Object} pedido - Dados do pedido
   * @param {Array} itens - Array de itens do pedido
   * @param {Array} dadosAdicionais - Dados adicionais (ex: solicitação vinculada)
   */
  static preparar(pedido, itens, dadosAdicionais = []) {
    console.log('[DEBUG prepararDados] ========================================');
    console.log('[DEBUG prepararDados] Preparando dados para template - Pedidos de Compras');
    console.log('[DEBUG prepararDados] Pedido recebido:', {
      id: pedido?.id,
      numero_pedido: pedido?.numero_pedido,
      fornecedor_nome: pedido?.fornecedor_nome,
      filial_nome: pedido?.filial_nome
    });
    console.log('[DEBUG prepararDados] Número de itens recebidos:', itens?.length || 0);
    
    const solicitacao = dadosAdicionais.solicitacao || null;
    
    const retorno = {
      // Campos principais do pedido
      id: pedido.id || '',
      numero_pedido: pedido.numero_pedido || '',
      solicitacao_compras_id: pedido.solicitacao_compras_id || '',
      numero_solicitacao: pedido.numero_solicitacao || pedido.solicitacao_numero || '',
      
      // Fornecedor
      fornecedor_id: pedido.fornecedor_id || '',
      fornecedor_nome: pedido.fornecedor_nome || '',
      fornecedor_cnpj: pedido.fornecedor_cnpj || '',
      
      // Filial
      filial_id: pedido.filial_id || '',
      filial_nome: pedido.filial_nome || '',
      filial_faturamento_id: pedido.filial_faturamento_id || '',
      filial_cobranca_id: pedido.filial_cobranca_id || '',
      filial_entrega_id: pedido.filial_entrega_id || '',
      
      // Endereços
      endereco_faturamento: pedido.endereco_faturamento || '',
      endereco_cobranca: pedido.endereco_cobranca || '',
      endereco_entrega: pedido.endereco_entrega || '',
      
      // CNPJs
      cnpj_faturamento: pedido.cnpj_faturamento || '',
      cnpj_cobranca: pedido.cnpj_cobranca || '',
      cnpj_entrega: pedido.cnpj_entrega || '',
      
      // Pagamento
      forma_pagamento: pedido.forma_pagamento || '',
      prazo_pagamento: pedido.prazo_pagamento || '',
      
      // Datas
      data_entrega_cd: pedido.data_entrega_cd ? new Date(pedido.data_entrega_cd).toLocaleDateString('pt-BR') : '',
      data_entrega_cd_completa: pedido.data_entrega_cd ? new Date(pedido.data_entrega_cd).toLocaleString('pt-BR') : '',
      semana_abastecimento: pedido.semana_abastecimento || '',
      data_criacao: pedido.criado_em ? new Date(pedido.criado_em).toLocaleDateString('pt-BR') : '',
      data_criacao_completa: pedido.criado_em ? new Date(pedido.criado_em).toLocaleString('pt-BR') : '',
      data_atualizacao: pedido.atualizado_em ? new Date(pedido.atualizado_em).toLocaleDateString('pt-BR') : '',
      data_atualizacao_completa: pedido.atualizado_em ? new Date(pedido.atualizado_em).toLocaleString('pt-BR') : '',
      
      // Status e observações
      status: pedido.status || '',
      observacoes: pedido.observacoes || '',
      justificativa: pedido.justificativa || '',
      
      // Usuário
      criado_por: pedido.criado_por ? String(pedido.criado_por) : '',
      criado_por_nome: pedido.criado_por_nome || '',
      
      // Dados para itens (pode ser usado em loops no template)
      itens: itens.map((item) => {
        const quantidadeSolicitada = parseFloat(item.quantidade_solicitada || 0);
        const quantidadePedido = parseFloat(item.quantidade_pedido || 0);
        const valorUnitario = parseFloat(item.valor_unitario || 0);
        const valorTotal = parseFloat(item.valor_total || 0);
        
        return {
          id: item.id || '',
          pedido_id: item.pedido_id || '',
          solicitacao_item_id: item.solicitacao_item_id || '',
          produto_id: item.produto_generico_id || '',
          produto_codigo: item.codigo_produto || item.produto_generico_codigo || '',
          produto_nome: item.nome_produto || item.produto_generico_nome || '',
          codigo_produto: item.codigo_produto || item.produto_generico_codigo || '',
          nome_produto: item.nome_produto || item.produto_generico_nome || '',
          quantidade_solicitada: quantidadeSolicitada,
          quantidade_solicitada_formatada: quantidadeSolicitada.toFixed(3).replace('.', ','),
          quantidade_pedido: quantidadePedido,
          quantidade_pedido_formatada: quantidadePedido.toFixed(3).replace('.', ','),
          valor_unitario: valorUnitario,
          valor_unitario_formatado: valorUnitario.toFixed(2).replace('.', ','),
          valor_total: valorTotal,
          valor_total_formatado: valorTotal.toFixed(2).replace('.', ','),
          unidade_medida_id: item.unidade_medida_id || '',
          unidade: item.unidade_medida || item.unidade_sigla || '',
          unidade_simbolo: item.unidade_medida || item.unidade_sigla || '',
          unidade_nome: item.unidade_nome || '',
          observacao: item.observacao || '',
          item_criado_em: item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : ''
        };
      }),
      
      // Estatísticas dos itens
      total_itens: itens.length,
      total_quantidade: itens.reduce((sum, item) => sum + parseFloat(item.quantidade_pedido || 0), 0).toFixed(3).replace('.', ','),
      valor_total: pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2).replace('.', ',') : '0,00'
    };
    
    console.log('[DEBUG prepararDados] Dados preparados. Chaves principais:', Object.keys(retorno).slice(0, 30));
    console.log('[DEBUG prepararDados] Valores principais:', {
      numero_pedido: retorno.numero_pedido,
      fornecedor_nome: retorno.fornecedor_nome,
      valor_total: retorno.valor_total,
      total_itens: retorno.total_itens
    });
    console.log('[DEBUG prepararDados] Número de itens preparados:', retorno.itens?.length || 0);
    if (retorno.itens && retorno.itens.length > 0) {
      console.log('[DEBUG prepararDados] Primeiro item preparado:', {
        produto_nome: retorno.itens[0].produto_nome,
        quantidade_pedido_formatada: retorno.itens[0].quantidade_pedido_formatada,
        valor_total_formatado: retorno.itens[0].valor_total_formatado
      });
    }
    console.log('[DEBUG prepararDados] ========================================');
    
    return retorno;
  }
}

module.exports = PedidosComprasPreparador;

