const useSubstituicoesCalculos = ({
  quantidadesOrigemEditadas,
  getChaveOrigem
}) => {
  // Função para calcular quantidade consolidada baseada nas quantidades editadas
  const calcularQuantidadeConsolidada = (necessidade) => {
    const chaveOrigem = getChaveOrigem(necessidade);
    let total = 0;
    
    necessidade.escolas.forEach(escola => {
      const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
      const quantidadeEditada = quantidadesOrigemEditadas[chaveEscola];
      if (quantidadeEditada !== undefined && quantidadeEditada !== '') {
        const valor = String(quantidadeEditada).replace(',', '.');
        total += parseFloat(valor) || 0;
      } else {
        total += parseFloat(escola.quantidade_origem) || 0;
      }
    });
    
    return total;
  };

  // Função para recalcular quantidade genérica quando quantidade origem for editada
  const recalcularQuantidadeGenerica = (necessidade, chaveOrigem, selectedProdutosGenericos, setQuantidadesGenericos) => {
    const quantidadeConsolidada = calcularQuantidadeConsolidada(necessidade);
    const produtoGenericoSelecionado = selectedProdutosGenericos[chaveOrigem];
    
    if (produtoGenericoSelecionado) {
      const partes = produtoGenericoSelecionado.split('|');
      const fatorConversao = parseFloat(partes[3]) || 1;
      
      if (quantidadeConsolidada > 0 && fatorConversao > 0) {
        const quantidadeCalculada = Math.ceil(quantidadeConsolidada / fatorConversao);
        setQuantidadesGenericos(prev => ({ ...prev, [chaveOrigem]: quantidadeCalculada }));
      }
    }
  };

  // Obter quantidade origem atual (prioridade: editada > substituição > original)
  const getQuantidadeOrigemAtual = (necessidade, escola, chaveOrigem) => {
    const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
    
    // Prioridade 1: Quantidade editada pelo usuário
    if (quantidadesOrigemEditadas[chaveEscola] !== undefined && quantidadesOrigemEditadas[chaveEscola] !== '') {
      return parseFloat(String(quantidadesOrigemEditadas[chaveEscola]).replace(',', '.'));
    }
    // Prioridade 2: Quantidade da substituição salva no banco (se voltou)
    if (escola.substituicao && escola.substituicao.quantidade_origem !== undefined && escola.substituicao.quantidade_origem !== null) {
      return parseFloat(escola.substituicao.quantidade_origem) || 0;
    }
    // Prioridade 3: Quantidade origem original da necessidade
    return parseFloat(escola.quantidade_origem) || 0;
  };

  // Obter valor formatado para input
  const getQuantidadeOrigemFormatted = (necessidade, escola, chaveOrigem) => {
    const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
    
    // Prioridade 1: Quantidade editada pelo usuário
    if (quantidadesOrigemEditadas[chaveEscola] !== undefined && quantidadesOrigemEditadas[chaveEscola] !== '') {
      return quantidadesOrigemEditadas[chaveEscola];
    }
    // Prioridade 2: Quantidade da substituição salva no banco (se voltou)
    if (escola.substituicao && escola.substituicao.quantidade_origem !== undefined && escola.substituicao.quantidade_origem !== null) {
      return parseFloat(escola.substituicao.quantidade_origem).toFixed(3).replace('.', ',');
    }
    // Prioridade 3: Quantidade origem original da necessidade
    return escola.quantidade_origem ? 
      parseFloat(escola.quantidade_origem).toFixed(3).replace('.', ',') : 
      '';
  };

  return {
    calcularQuantidadeConsolidada,
    recalcularQuantidadeGenerica,
    getQuantidadeOrigemAtual,
    getQuantidadeOrigemFormatted
  };
};

export default useSubstituicoesCalculos;

