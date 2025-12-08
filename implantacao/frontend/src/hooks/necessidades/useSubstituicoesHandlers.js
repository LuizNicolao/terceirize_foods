import { useEffect } from 'react';
import toast from 'react-hot-toast';

const useSubstituicoesHandlers = ({
  necessidades,
  produtosGenericos,
  onBuscarProdutosGenericos,
  onTrocarProdutoOrigem,
  onDesfazerTroca,
  onSaveConsolidated,
  onSaveIndividual,
  onDeletarSubstituicao,
  getChaveOrigem,
  getProdutoOrigemSelecionadoInfo,
  calcularQuantidadeConsolidada,
  recalcularQuantidadeGenerica,
  // Estados
  selectedProdutosOrigem,
  setSelectedProdutosOrigem,
  selectedProdutosGenericos,
  setSelectedProdutosGenericos,
  setUndGenericos,
  setQuantidadesGenericos,
  setProdutosPadraoSelecionados,
  selectedProdutosPorEscola,
  setSelectedProdutosPorEscola,
  selectedProdutosOrigemPorEscola,
  setSelectedProdutosOrigemPorEscola,
  setTrocaLoading,
  origemInicialPorEscola,
  setOrigemInicialPorEscola,
  quantidadesOrigemEditadas,
  setQuantidadesOrigemEditadas,
  produtosPadraoSelecionados
}) => {
  const handleProdutoOrigemChange = (chaveOrigem, valor) => {
    setSelectedProdutosOrigem(prev => ({ ...prev, [chaveOrigem]: valor }));
    setProdutosPadraoSelecionados(prev => ({ ...prev, [chaveOrigem]: false }));

    const necessidade = necessidades.find(item => getChaveOrigem(item) === chaveOrigem);
    if (!necessidade || !valor || !necessidade.produtos_grupo) return;

    const [produtoId] = valor.split('|');
    if (!produtoId) return;

    if (onBuscarProdutosGenericos && !produtosGenericos[produtoId]) {
      onBuscarProdutosGenericos(produtoId, necessidade.grupo);
    }

    const produtosGrupo = necessidade.produtos_grupo || [];
    const produtoSelecionado = produtosGrupo.find(prod => String(prod.produto_id || prod.id || prod.codigo) === String(produtoId));
    const padrao = produtoSelecionado?.produto_generico_padrao || null;

    if (!padrao) return;

    const unidadePadrao = padrao.unidade_medida_sigla || padrao.unidade_medida || padrao.unidade || '';
    const valorGenerico = `${padrao.id || padrao.codigo}|${padrao.nome}|${unidadePadrao}|${padrao.fator_conversao || 1}`;

    setSelectedProdutosGenericos(prev => ({ ...prev, [chaveOrigem]: valorGenerico }));
    setUndGenericos(prev => ({ ...prev, [chaveOrigem]: unidadePadrao }));

    const fator = padrao.fator_conversao || 1;
    if (necessidade.quantidade_total_origem && fator > 0) {
      const quantidadeCalculada = Math.ceil(parseFloat(necessidade.quantidade_total_origem) / fator);
      setQuantidadesGenericos(prev => ({ ...prev, [chaveOrigem]: quantidadeCalculada }));
    }

    necessidade.escolas.forEach(escola => {
      const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
      setSelectedProdutosPorEscola(prev => ({ ...prev, [chaveEscola]: valorGenerico }));
      escola.selectedProdutoGenerico = valorGenerico;
    });

    setSelectedProdutosOrigemPorEscola(prev => {
      const atualizado = { ...prev };
      necessidade.escolas.forEach(escola => {
        const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
        atualizado[chaveEscola] = valor;
      });
      return atualizado;
    });
  };

  const handleDesfazerOrigem = async (necessidade) => {
    if (!onDesfazerTroca) return;
    const chaveOrigem = getChaveOrigem(necessidade);
    setTrocaLoading(prev => ({ ...prev, [chaveOrigem]: true }));
    
    await onDesfazerTroca({
      necessidade_ids: necessidade.escolas.map(escola => escola.necessidade_id)
    });
    
    necessidade.escolas.forEach(escola => {
      const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
      setSelectedProdutosOrigemPorEscola(prev => {
        const novo = { ...prev };
        delete novo[chaveEscola];
        return novo;
      });
      setOrigemInicialPorEscola(prev => {
        const novo = { ...prev };
        delete novo[chaveEscola];
        return novo;
      });
      setSelectedProdutosPorEscola(prev => {
        const novo = { ...prev };
        delete novo[chaveEscola];
        return novo;
      });
      delete escola.selectedProdutoGenerico;
    });
    
    setTrocaLoading(prev => ({ ...prev, [chaveOrigem]: false }));
  };

  const processarTrocaProdutoOrigem = async (necessidade, necessidadeIdsOverride = null, produtoOrigemOverride = null) => {
    if (!onTrocarProdutoOrigem) return;
    const chaveOrigem = getChaveOrigem(necessidade);
    const selecionado = produtoOrigemOverride || selectedProdutosOrigem[chaveOrigem];
    if (!selecionado) return;

    const [novoProdutoId] = selecionado.split('|');
    if (!novoProdutoId || String(novoProdutoId) === String(necessidade.codigo_origem)) {
      return;
    }

    const ids = necessidadeIdsOverride && necessidadeIdsOverride.length
      ? necessidadeIdsOverride
      : necessidade.escolas.map(escola => escola.necessidade_id);

    if (!ids || ids.length === 0) return;

    await onTrocarProdutoOrigem({
      necessidade_ids: ids,
      novo_produto_id: novoProdutoId
    });
  };

  const handleProdutoGenericoChange = (codigo, valor, necessidade) => {
    if (!valor) {
      setSelectedProdutosGenericos(prev => ({ ...prev, [codigo]: '' }));
      setUndGenericos(prev => ({ ...prev, [codigo]: '' }));
      setQuantidadesGenericos(prev => ({ ...prev, [codigo]: '' }));
      return;
    }

    const partes = valor.split('|');
    if (partes.length >= 3) {
      const [produto_id, nome, unidade, fatorConversaoStr] = partes;
      const fatorConversao = parseFloat(fatorConversaoStr) || 1;
      
      setSelectedProdutosGenericos(prev => ({ ...prev, [codigo]: valor }));
      setUndGenericos(prev => ({ ...prev, [codigo]: unidade }));
      
      const quantidadeConsolidada = necessidade ? calcularQuantidadeConsolidada(necessidade) : 0;
      const quantidadeOrigem = quantidadeConsolidada > 0 ? quantidadeConsolidada : (necessidade?.quantidade_total_origem || 0);
      
      if (quantidadeOrigem && fatorConversao > 0) {
        const quantidadeCalculada = Math.ceil(parseFloat(quantidadeOrigem) / fatorConversao);
        setQuantidadesGenericos(prev => ({ ...prev, [codigo]: quantidadeCalculada }));
      }
    }
  };

  const handleQuantidadeOrigemChange = (necessidade, escola, valor) => {
    const chaveOrigem = getChaveOrigem(necessidade);
    const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
    
    if (valor === '' || /^[0-9]*[.,]?[0-9]*$/.test(valor)) {
      setQuantidadesOrigemEditadas(prev => ({
        ...prev,
        [chaveEscola]: valor
      }));
      recalcularQuantidadeGenerica(necessidade, chaveOrigem);
    }
  };

  const handleProdutoOrigemIndividualChange = (necessidade, escola, valor) => {
    const chaveOrigem = getChaveOrigem(necessidade);
    const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;

    setSelectedProdutosOrigemPorEscola(prev => ({
      ...prev,
      [chaveEscola]: valor ?? ''
    }));

    if (!valor) {
      const fallbackValor = selectedProdutosGenericos[chaveOrigem] || '';
      setSelectedProdutosPorEscola(prev => ({
        ...prev,
        [chaveEscola]: fallbackValor
      }));
      escola.selectedProdutoGenerico = fallbackValor;
      return;
    }

    const [produtoId] = valor.split('|');
    if (!produtoId) return;

    if (onBuscarProdutosGenericos && !produtosGenericos[produtoId]) {
      onBuscarProdutosGenericos(produtoId, necessidade.grupo);
    }

    const produtosGrupo = necessidade.produtos_grupo || [];
    const produtoSelecionado = produtosGrupo.find(
      prod => String(prod.produto_id || prod.id || prod.codigo) === String(produtoId)
    );

    const padrao = produtoSelecionado?.produto_generico_padrao || null;
    if (!padrao) return;

    const unidade = padrao.unidade_medida_sigla || padrao.unidade_medida || padrao.unidade || '';
    const valorGenerico = `${padrao.id || padrao.codigo}|${padrao.nome}|${unidade}|${padrao.fator_conversao || 1}`;

    setSelectedProdutosPorEscola(prev => ({
      ...prev,
      [chaveEscola]: valorGenerico
    }));
    escola.selectedProdutoGenerico = valorGenerico;
  };

  const handleProdutoGenericoIndividualChange = (chaveEscola, valor) => {
    setSelectedProdutosPorEscola(prev => ({ ...prev, [chaveEscola]: valor }));
    // Atualizar também a propriedade do objeto escola se necessário
    const [chaveOrigem, escolaId] = chaveEscola.split('-');
    const necessidade = necessidades.find(n => {
      const chave = getChaveOrigem(n);
      return chave === chaveOrigem;
    });
    if (necessidade) {
      const escola = necessidade.escolas.find(e => String(e.escola_id) === escolaId);
      if (escola) {
        escola.selectedProdutoGenerico = valor;
      }
    }
  };

  const handleSaveConsolidated = async (necessidade) => {
    const chaveOrigem = getChaveOrigem(necessidade);
    const produtoOrigemAtualId = getProdutoOrigemSelecionadoInfo(necessidade).id;
    
    if (!selectedProdutosGenericos[chaveOrigem]) {
      toast.error('Selecione um produto genérico antes de salvar!');
      return;
    }

    const produtoSelecionado = selectedProdutosGenericos[chaveOrigem];
    const partes = produtoSelecionado.split('|');
    const [produto_generico_id, produto_generico_nome, produto_generico_unidade] = partes;

    const dados = {
      produto_origem_id: necessidade.codigo_origem,
      produto_origem_nome: necessidade.produto_origem_nome,
      produto_origem_unidade: necessidade.produto_origem_unidade,
      produto_generico_id,
      produto_generico_codigo: produto_generico_id,
      produto_generico_nome,
      produto_generico_unidade,
      necessidade_id_grupo: necessidade.necessidade_id_grupo,
      semana_abastecimento: necessidade.semana_abastecimento,
      semana_consumo: necessidade.semana_consumo,
      escola_ids: necessidade.escolas.map(escola => {
        const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
        const quantidadeOrigemAtual = quantidadesOrigemEditadas[chaveEscola] !== undefined && quantidadesOrigemEditadas[chaveEscola] !== ''
          ? parseFloat(String(quantidadesOrigemEditadas[chaveEscola]).replace(',', '.'))
          : parseFloat(escola.quantidade_origem) || 0;
        const fatorConversao = partes.length >= 4 ? parseFloat(partes[3]) : 1;
        const quantidadeGenericaCalculada = fatorConversao > 0 ? Math.ceil(quantidadeOrigemAtual / fatorConversao) : quantidadeOrigemAtual;
        
        return {
          necessidade_id: escola.necessidade_id,
          escola_id: escola.escola_id,
          escola_nome: escola.escola_nome,
          quantidade_origem: quantidadeOrigemAtual,
          quantidade_generico: quantidadeGenericaCalculada
        };
      })
    };

    const response = await onSaveConsolidated(dados, chaveOrigem);
    
    if (response && response.success) {
      if (produtosGenericos[produtoOrigemAtualId]) {
        produtosGenericos[produtoOrigemAtualId].forEach(produto => {
          produto.produto_padrao = (produto.id || produto.codigo) == produto_generico_id ? 'Sim' : 'Não';
        });
      }
      await processarTrocaProdutoOrigem(necessidade);
    }
  };

  const handleSaveIndividual = async (escola, necessidade) => {
    const chaveOrigem = getChaveOrigem(necessidade);
    const produtoOrigemAtualId = getProdutoOrigemSelecionadoInfo(necessidade).id;
    
    if (!escola.selectedProdutoGenerico) {
      toast.error('Selecione um produto genérico antes de salvar!');
      return;
    }

    const partes = escola.selectedProdutoGenerico.split('|');
    const [produto_generico_id, produto_generico_nome, produto_generico_unidade] = partes;
    const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
    const origemSelecionada =
      (selectedProdutosOrigemPorEscola[chaveEscola] ??
        origemInicialPorEscola[chaveEscola] ??
        selectedProdutosOrigem[chaveOrigem]) ??
      `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${necessidade.produto_origem_unidade || ''}`;
    const [produto_origem_id, produto_origem_nome, produto_origem_unidade] = origemSelecionada
      ? origemSelecionada.split('|')
      : [necessidade.codigo_origem, necessidade.produto_origem_nome, necessidade.produto_origem_unidade];

    const dados = {
      produto_origem_id: produto_origem_id || necessidade.codigo_origem,
      produto_origem_nome: produto_origem_nome || necessidade.produto_origem_nome,
      produto_origem_unidade: produto_origem_unidade || necessidade.produto_origem_unidade,
      produto_generico_id,
      produto_generico_codigo: produto_generico_id,
      produto_generico_nome,
      produto_generico_unidade,
      necessidade_id_grupo: necessidade.necessidade_id_grupo,
      semana_abastecimento: necessidade.semana_abastecimento,
      semana_consumo: necessidade.semana_consumo,
      necessidade_id: escola.necessidade_id,
      escola_id: escola.escola_id,
      escola_nome: escola.escola_nome,
      quantidade_origem: (() => {
        const quantidadeEditada = quantidadesOrigemEditadas[chaveEscola];
        if (quantidadeEditada !== undefined && quantidadeEditada !== '') {
          return parseFloat(String(quantidadeEditada).replace(',', '.'));
        }
        return parseFloat(escola.quantidade_origem) || 0;
      })(),
      quantidade_generico: (() => {
        const quantidadeOrigemAtual = quantidadesOrigemEditadas[chaveEscola] !== undefined && quantidadesOrigemEditadas[chaveEscola] !== ''
          ? parseFloat(String(quantidadesOrigemEditadas[chaveEscola]).replace(',', '.'))
          : parseFloat(escola.quantidade_origem) || 0;
        const fatorConversao = partes.length >= 4 ? parseFloat(partes[3]) : 1;
        return fatorConversao > 0 ? Math.ceil(quantidadeOrigemAtual / fatorConversao) : quantidadeOrigemAtual;
      })()
    };

    const response = await onSaveIndividual(dados, escola.escola_id);
    
    if (response && response.success) {
      if (produtosGenericos[produtoOrigemAtualId]) {
        produtosGenericos[produtoOrigemAtualId].forEach(produto => {
          produto.produto_padrao = (produto.id || produto.codigo) == produto_generico_id ? 'Sim' : 'Não';
        });
      }
      
      setSelectedProdutosGenericos(prev => ({ 
        ...prev, 
        [chaveOrigem]: escola.selectedProdutoGenerico 
      }));
      
      const fatorConversao = parseFloat(partes[3]) || 1;
      setUndGenericos(prev => ({ 
        ...prev, 
        [chaveOrigem]: produto_generico_unidade 
      }));
      
      if (necessidade.quantidade_total_origem && fatorConversao > 0) {
        const quantidadeCalculada = Math.ceil(parseFloat(necessidade.quantidade_total_origem) / fatorConversao);
        setQuantidadesGenericos(prev => ({ 
          ...prev, 
          [chaveOrigem]: quantidadeCalculada 
        }));
      }

      await processarTrocaProdutoOrigem(necessidade, [dados.necessidade_id], origemSelecionada);

      if (origemSelecionada) {
        setOrigemInicialPorEscola(prev => ({ ...prev, [chaveEscola]: origemSelecionada }));
      }
    }
  };

  const handleDeleteConsolidated = (necessidade) => {
    const substituicoesIds = necessidade.escolas
      .filter(escola => escola.substituicao && escola.substituicao.id)
      .map(escola => escola.substituicao.id);

    if (substituicoesIds.length === 0) {
      toast.error('Não há substituições salvas para excluir');
      return null;
    }

    return { necessidade, substituicoesIds };
  };

  const handleDeleteIndividual = (escola) => {
    if (!escola.substituicao || !escola.substituicao.id) return null;
    return escola.substituicao.id;
  };

  // Pré-selecionar produto padrão quando produtos genéricos forem carregados
  useEffect(() => {
    necessidades.forEach(necessidade => {
      const chaveOrigem = getChaveOrigem(necessidade);
      const { id: produtoOrigemAtualId } = getProdutoOrigemSelecionadoInfo(necessidade);
      
      if (!produtosGenericos[produtoOrigemAtualId] || produtosPadraoSelecionados[chaveOrigem]) {
        return;
      }

      const lista = produtosGenericos[produtoOrigemAtualId];
      let produtoSelecionado = null;

      if (necessidade.produto_generico_id) {
        produtoSelecionado = lista.find(
          p => (p.id || p.codigo) == necessidade.produto_generico_id
        );
      }

      if (!produtoSelecionado) {
        produtoSelecionado = lista.find(p => p.produto_padrao === 'Sim') || lista[0];
      }

      if (produtoSelecionado) {
        const unidade = produtoSelecionado.unidade_medida_sigla || produtoSelecionado.unidade || produtoSelecionado.unidade_medida || '';
        const fator = produtoSelecionado.fator_conversao || 1;
        const valor = `${produtoSelecionado.id || produtoSelecionado.codigo}|${produtoSelecionado.nome}|${unidade}|${fator}`;
            
        setSelectedProdutosGenericos(prev => ({ ...prev, [chaveOrigem]: valor }));
        setUndGenericos(prev => ({ ...prev, [chaveOrigem]: unidade }));
            
        if (necessidade.quantidade_total_origem && fator > 0) {
          const quantidadeCalculada = Math.ceil(parseFloat(necessidade.quantidade_total_origem) / fator);
          setQuantidadesGenericos(prev => ({ ...prev, [chaveOrigem]: quantidadeCalculada }));
        }
            
        necessidade.escolas.forEach(escola => {
          const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
          setSelectedProdutosPorEscola(prev => ({ ...prev, [chaveEscola]: valor }));
          escola.selectedProdutoGenerico = valor;
        });
        
        setProdutosPadraoSelecionados(prev => ({ ...prev, [chaveOrigem]: true }));
        necessidade.escolas.forEach(escola => {
          const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
          if (!escola.substituicao?.produto_generico_id) {
            setSelectedProdutosPorEscola(prev => ({ ...prev, [chaveEscola]: valor }));
            escola.selectedProdutoGenerico = valor;
          }
        });
      }
    });
  }, [produtosGenericos, necessidades, produtosPadraoSelecionados, selectedProdutosOrigem]);

  return {
    handleProdutoOrigemChange,
    handleDesfazerOrigem,
    processarTrocaProdutoOrigem,
    handleProdutoGenericoChange,
    handleQuantidadeOrigemChange,
    handleProdutoOrigemIndividualChange,
    handleProdutoGenericoIndividualChange,
    handleSaveConsolidated,
    handleSaveIndividual,
    handleDeleteConsolidated,
    handleDeleteIndividual
  };
};

export default useSubstituicoesHandlers;

