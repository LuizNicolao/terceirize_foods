/**
 * Preparador de dados para templates de Relatório de Inspeção
 */

class RelatorioInspecaoPreparador {
  /**
   * Preparar dados para template de relatório de inspeção
   * @param {Object} relatorio - Dados do relatório de inspeção
   * @param {Array} itens - Array de itens/produtos inspecionados
   * @param {Array} dadosAdicionais - Dados adicionais
   */
  static preparar(relatorio, itens = [], dadosAdicionais = []) {
    console.log('[DEBUG prepararDados] ========================================');
    console.log('[DEBUG prepararDados] Preparando dados para template - Relatório de Inspeção');
    console.log('[DEBUG prepararDados] Relatório recebido:', {
      id: relatorio?.id,
      numero_rir: relatorio?.numero_rir || relatorio?.numero || '',
      pedido_id: relatorio?.pedido_id
    });
    console.log('[DEBUG prepararDados] Número de itens recebidos:', itens?.length || 0);
    
    const retorno = {
      // Campos principais do relatório
      id: relatorio.id || '',
      numero_rir: relatorio.numero_rir || relatorio.numero || '',
      pedido_id: relatorio.pedido_id || '',
      numero_pedido: relatorio.numero_pedido || '',
      
      // Datas
      data_inspecao: relatorio.data_inspecao ? new Date(relatorio.data_inspecao).toLocaleDateString('pt-BR') : '',
      data_inspecao_completa: relatorio.data_inspecao ? new Date(relatorio.data_inspecao).toLocaleString('pt-BR') : '',
      data_recebimento: relatorio.data_recebimento ? new Date(relatorio.data_recebimento).toLocaleDateString('pt-BR') : '',
      data_recebimento_completa: relatorio.data_recebimento ? new Date(relatorio.data_recebimento).toLocaleString('pt-BR') : '',
      data_criacao: relatorio.criado_em ? new Date(relatorio.criado_em).toLocaleDateString('pt-BR') : '',
      data_criacao_completa: relatorio.criado_em ? new Date(relatorio.criado_em).toLocaleString('pt-BR') : '',
      data_atualizacao: relatorio.atualizado_em ? new Date(relatorio.atualizado_em).toLocaleDateString('pt-BR') : '',
      data_atualizacao_completa: relatorio.atualizado_em ? new Date(relatorio.atualizado_em).toLocaleString('pt-BR') : '',
      
      // Status e observações
      status: relatorio.status || '',
      observacoes: relatorio.observacoes || '',
      conclusao: relatorio.conclusao || '',
      
      // Usuário
      criado_por: relatorio.criado_por ? String(relatorio.criado_por) : '',
      criado_por_nome: relatorio.criado_por_nome || '',
      
      // Fornecedor (se disponível)
      fornecedor_nome: relatorio.fornecedor_nome || '',
      fornecedor_cnpj: relatorio.fornecedor_cnpj || '',
      
      // Filial (se disponível)
      filial_nome: relatorio.filial_nome || '',
      
      // Dados para itens (pode ser usado em loops no template)
      itens: itens.map((item) => {
        return {
          id: item.id || '',
          produto_id: item.produto_id || '',
          produto_codigo: item.produto_codigo || item.codigo_produto || '',
          produto_nome: item.produto_nome || item.nome_produto || '',
          quantidade: item.quantidade ? parseFloat(item.quantidade).toFixed(3).replace('.', ',') : '',
          quantidade_formatada: item.quantidade ? parseFloat(item.quantidade).toFixed(3).replace('.', ',') : '',
          unidade: item.unidade || item.unidade_medida || '',
          lote: item.lote || '',
          validade: item.validade ? new Date(item.validade).toLocaleDateString('pt-BR') : '',
          observacao: item.observacao || '',
          resultado: item.resultado || '',
          item_criado_em: item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : ''
        };
      }),
      
      // Estatísticas dos itens
      total_itens: itens.length
    };
    
    console.log('[DEBUG prepararDados] Dados preparados. Chaves principais:', Object.keys(retorno).slice(0, 30));
    console.log('[DEBUG prepararDados] Valores principais:', {
      numero_rir: retorno.numero_rir,
      numero_pedido: retorno.numero_pedido,
      data_inspecao: retorno.data_inspecao,
      total_itens: retorno.total_itens
    });
    console.log('[DEBUG prepararDados] ========================================');
    
    return retorno;
  }
}

module.exports = RelatorioInspecaoPreparador;

