/**
 * Preparador de dados para templates de Solicitações de Compras
 */

class SolicitacoesComprasPreparador {
  /**
   * Preparar dados para template de solicitação de compras
   */
  static preparar(solicitacao, itens, pedidosVinculados) {
    const retorno = {
      // Campos principais da solicitação
      id: solicitacao.id || '',
      numero_solicitacao: solicitacao.numero_solicitacao || '',
      descricao: solicitacao.descricao || solicitacao.justificativa || '',
      motivo: solicitacao.motivo || solicitacao.justificativa || '',
      justificativa: solicitacao.justificativa || '',
      observacoes: solicitacao.observacoes || '',
      status: solicitacao.status || '',
      
      // Datas
      data_criacao: solicitacao.criado_em ? new Date(solicitacao.criado_em).toLocaleDateString('pt-BR') : '',
      data_criacao_completa: solicitacao.criado_em ? new Date(solicitacao.criado_em).toLocaleString('pt-BR') : '',
      data_atualizacao: solicitacao.atualizado_em ? new Date(solicitacao.atualizado_em).toLocaleDateString('pt-BR') : '',
      data_atualizacao_completa: solicitacao.atualizado_em ? new Date(solicitacao.atualizado_em).toLocaleString('pt-BR') : '',
      data_documento: solicitacao.data_documento ? new Date(solicitacao.data_documento).toLocaleDateString('pt-BR') : '',
      data_entrega_cd: solicitacao.data_entrega_cd ? new Date(solicitacao.data_entrega_cd).toLocaleDateString('pt-BR') : '',
      data_necessidade: solicitacao.data_necessidade ? new Date(solicitacao.data_necessidade).toLocaleDateString('pt-BR') : '',
      semana_abastecimento: solicitacao.semana_abastecimento || '',
      
      // Filial
      filial_id: solicitacao.filial_id || '',
      filial_nome: solicitacao.filial_nome || solicitacao.unidade || '',
      filial_codigo: solicitacao.filial_codigo || '',
      unidade: solicitacao.unidade || '',
      
      // Usuário/Solicitante
      usuario_id: solicitacao.usuario_id || solicitacao.criado_por || '',
      criado_por: solicitacao.criado_por ? String(solicitacao.criado_por) : '',
      criado_por_nome: solicitacao.usuario_nome_from_user || solicitacao.usuario_nome || '',
      solicitante_nome: solicitacao.usuario_nome_from_user || solicitacao.usuario_nome || solicitacao.solicitante || '',
      solicitante: solicitacao.solicitante || solicitacao.usuario_nome_from_user || solicitacao.usuario_nome || '',
      // Alias para usuario_nome (compatibilidade)
      usuario_nome: solicitacao.usuario_nome_from_user || solicitacao.usuario_nome || solicitacao.solicitante || '',
      usuario_email: solicitacao.usuario_email || '',
      
      // Pedidos vinculados
      pedidos_vinculados: pedidosVinculados.map(p => p.numero_pedido).join(', '),
      // pedidos_vinculados_lista como string separada por vírgula (mesmo valor de pedidos_vinculados)
      pedidos_vinculados_lista: pedidosVinculados.map(p => p.numero_pedido).join(', '),
      
      // Dados para itens (pode ser usado em loops no template)
      itens: itens.map((item, index) => {
        const quantidade = parseFloat(item.quantidade || 0);
        const quantidadeUtilizada = parseFloat(item.quantidade_utilizada || 0);
        const saldoDisponivel = parseFloat(item.saldo_disponivel || 0);
        const pedidosVinculadosItem = item.pedidos_vinculados || [];
        
        // Extrair números dos pedidos vinculados
        let pedidosNumeros = '';
        if (Array.isArray(pedidosVinculadosItem) && pedidosVinculadosItem.length > 0) {
          // Se for array de objetos com propriedade 'numero'
          const numeros = pedidosVinculadosItem
            .map(p => {
              if (typeof p === 'object' && p !== null) {
                return p.numero || p.numero_pedido || '';
              }
              return String(p || '');
            })
            .filter(p => p && p.trim() !== '');
          pedidosNumeros = numeros.join(', ');
        } else if (typeof pedidosVinculadosItem === 'string') {
          pedidosNumeros = pedidosVinculadosItem;
        }
        
        return {
          id: item.id || '',
          solicitacao_id: item.solicitacao_id || '',
          produto_id: item.produto_id || '',
          produto_codigo: item.produto_codigo || item.codigo_produto || '',
          produto_nome: item.produto_nome || item.nome_produto || '',
          codigo_produto: item.produto_codigo || item.codigo_produto || '',
          nome_produto: item.produto_nome || item.nome_produto || '',
          quantidade: quantidade,
          quantidade_formatada: quantidade.toFixed(3).replace('.', ','),
          // quantidade_utilizada e saldo_disponivel - formatados por padrão (compatibilidade com template)
          quantidade_utilizada: quantidadeUtilizada.toFixed(3).replace('.', ','),
          quantidade_utilizada_formatada: quantidadeUtilizada.toFixed(3).replace('.', ','),
          // saldo_disponivel também formatado por padrão (compatibilidade com template)
          saldo_disponivel: saldoDisponivel.toFixed(3).replace('.', ','),
          saldo_disponivel_formatado: saldoDisponivel.toFixed(3).replace('.', ','),
          status: item.status_item || item.status || 'ABERTO',
          unidade_medida_id: item.unidade_medida_id || '',
          unidade: item.unidade_simbolo || item.unidade_medida || item.unidade_nome || '',
          unidade_simbolo: item.unidade_simbolo || item.unidade_medida || '',
          unidade_nome: item.unidade_nome || '',
          observacao: item.observacao || item.observacao_item || '',
          pedidos_vinculados: pedidosNumeros,
          // pedidos_vinculados_lista como string separada por vírgula (mesmo valor de pedidos_vinculados)
          pedidos_vinculados_lista: pedidosNumeros,
          item_criado_em: item.item_criado_em ? new Date(item.item_criado_em).toLocaleDateString('pt-BR') : ''
        };
      }),
      
      // Estatísticas dos itens
      total_itens: itens.length,
      total_quantidade: itens.reduce((sum, item) => sum + parseFloat(item.quantidade || 0), 0).toFixed(3).replace('.', ','),
      valor_total: '0,00' // Campo não existe na tabela solicitacoes_compras, mas mantido para compatibilidade
    };
    
    return retorno;
  }
}

module.exports = SolicitacoesComprasPreparador;

