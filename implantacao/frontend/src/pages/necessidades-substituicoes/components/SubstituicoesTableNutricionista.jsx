import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaSave, FaUndo } from 'react-icons/fa';
import { Button, Input, SearchableSelect } from '../../../components/ui';
import toast from 'react-hot-toast';

const SubstituicoesTableNutricionista = ({
  necessidades,
  produtosGenericos,
  loadingGenericos,
  onBuscarProdutosGenericos,
  ajustesAtivados = false,
  onExpand,
  onSaveConsolidated,
  onSaveIndividual,
  onTrocarProdutoOrigem,
  onDesfazerTroca
}) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedProdutosGenericos, setSelectedProdutosGenericos] = useState({});
  const [quantidadesGenericos, setQuantidadesGenericos] = useState({});
  const [undGenericos, setUndGenericos] = useState({});
  const [produtosPadraoSelecionados, setProdutosPadraoSelecionados] = useState({});
  const [selectedProdutosPorEscola, setSelectedProdutosPorEscola] = useState({});
  const [selectedProdutosOrigem, setSelectedProdutosOrigem] = useState({});
  const [selectedProdutosOrigemPorEscola, setSelectedProdutosOrigemPorEscola] = useState({});
  const [trocaLoading, setTrocaLoading] = useState({});
  const [origemInicialPorEscola, setOrigemInicialPorEscola] = useState({});
  const getChaveOrigem = (necessidade) => `${necessidade.codigo_origem}_${necessidade.semana_abastecimento}_${necessidade.semana_consumo}`;

  const getProdutoOrigemSelecionadoInfo = (necessidade) => {
    const chave = getChaveOrigem(necessidade);
    const selecionado = selectedProdutosOrigem[chave];

    if (selecionado) {
      const [id, nome, unidade] = selecionado.split('|');
      return {
        id: id || necessidade.codigo_origem,
        nome: nome || necessidade.produto_origem_nome,
        unidade: unidade || necessidade.produto_origem_unidade || ''
      };
    }

    return {
      id: necessidade.codigo_origem,
      nome: necessidade.produto_origem_nome,
      unidade: necessidade.produto_origem_unidade || ''
    };
  };

  const getLoadingKey = (produtoId, grupo, search = '') => `${produtoId}_${grupo || ''}_${search}`;

  useEffect(() => {
    const valoresIniciais = {};
    const genericosIniciais = {};
    const unidadesIniciais = {};
    const quantidadesIniciais = {};
    const mapaProdutosPadrao = {};
    const origemEscolasIniciais = {};

    necessidades.forEach((necessidade) => {
      const chaveOrigem = getChaveOrigem(necessidade);
      const unidade = necessidade.produto_origem_unidade || '';
      valoresIniciais[chaveOrigem] = `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${unidade}`;
      mapaProdutosPadrao[chaveOrigem] = false;
      const valorOrigem = `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${unidade}`;
      
      necessidade.escolas.forEach(escola => {
        const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
        const origemEscola = escola.produto_trocado_id
          ? `${escola.produto_trocado_id}|${escola.produto_trocado_nome || ''}|${escola.produto_trocado_unidade || ''}`
          : valorOrigem;
        origemEscolasIniciais[chaveEscola] = origemEscola;
      });

      if (necessidade.produto_generico_id) {
        const valorGenerico = `${necessidade.produto_generico_id}|${necessidade.produto_generico_nome}|${necessidade.produto_generico_unidade || ''}|1`;
        genericosIniciais[chaveOrigem] = valorGenerico;
        unidadesIniciais[chaveOrigem] = necessidade.produto_generico_unidade || '';
        quantidadesIniciais[chaveOrigem] = necessidade.quantidade_total_origem || '';
      }
    });

    setSelectedProdutosOrigem(valoresIniciais);
    setSelectedProdutosGenericos(genericosIniciais);
    setUndGenericos(unidadesIniciais);
    setQuantidadesGenericos(quantidadesIniciais);
    setProdutosPadraoSelecionados(mapaProdutosPadrao);
    setSelectedProdutosOrigemPorEscola(origemEscolasIniciais);
    setOrigemInicialPorEscola(origemEscolasIniciais);
  }, [necessidades]);
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

    if (!padrao) {
      return;
    }

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

    if (!ids || ids.length === 0) {
      return;
    }

    await onTrocarProdutoOrigem({
      necessidade_ids: ids,
      novo_produto_id: novoProdutoId
    });
  };

  const handleProdutoGenericoChange = (codigo, valor, quantidadeOrigem) => {
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
      
      if (quantidadeOrigem && fatorConversao > 0) {
        const quantidadeCalculada = Math.ceil(parseFloat(quantidadeOrigem) / fatorConversao);
        setQuantidadesGenericos(prev => ({ ...prev, [codigo]: quantidadeCalculada }));
      }
    }
  };

  const handleProdutoOrigemIndividualChange = (necessidade, escola, valor) => {
    const chaveOrigem = getChaveOrigem(necessidade);
    const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;

    // Atualizar produto origem primeiro
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
    if (!produtoId) {
      return;
    }

    // Buscar produtos genéricos se necessário
    if (onBuscarProdutosGenericos && !produtosGenericos[produtoId]) {
      onBuscarProdutosGenericos(produtoId, necessidade.grupo);
    }

    // Buscar produto genérico padrão do novo produto origem
    const produtosGrupo = necessidade.produtos_grupo || [];
    const produtoSelecionado = produtosGrupo.find(
      prod => String(prod.produto_id || prod.id || prod.codigo) === String(produtoId)
    );

    const padrao = produtoSelecionado?.produto_generico_padrao || null;

    if (!padrao) {
      return;
    }

    const unidade = padrao.unidade_medida_sigla || padrao.unidade_medida || padrao.unidade || '';
    const valorGenerico = `${padrao.id || padrao.codigo}|${padrao.nome}|${unidade}|${padrao.fator_conversao || 1}`;

    // Atualizar estado React - isso força o re-render e o select mostra o novo valor
    setSelectedProdutosPorEscola(prev => ({
      ...prev,
      [chaveEscola]: valorGenerico
    }));
    
    // Atualizar também a propriedade do objeto para manter consistência
    escola.selectedProdutoGenerico = valorGenerico;
  };

  // Pré-selecionar produto padrão ou produto já salvo quando produtos genéricos forem carregados
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

  const handleToggleExpand = (chaveOrigem) => {
    setExpandedRows(prev => ({
      ...prev,
      [chaveOrigem]: !prev[chaveOrigem]
    }));
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
      escola_ids: necessidade.escolas.map(escola => ({
        necessidade_id: escola.necessidade_id,
        escola_id: escola.escola_id,
        escola_nome: escola.escola_nome,
        quantidade_origem: escola.quantidade_origem,
      quantidade_generico: quantidadesGenericos[chaveOrigem] || escola.quantidade_origem
      }))
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
    if (!escola.selectedProdutoGenerico) {
      toast.error('Selecione um produto genérico antes de salvar!');
      return;
    }

    const chaveOrigem = getChaveOrigem(necessidade);
    const produtoOrigemAtualId = getProdutoOrigemSelecionadoInfo(necessidade).id;
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
      quantidade_origem: escola.quantidade_origem,
      quantidade_generico: escola.selectedQuantidade || escola.quantidade_origem
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

  if (necessidades.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-600">Nenhuma necessidade encontrada para os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th style={{ width: '50px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th style={{ width: '100px' }} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th style={{ minWidth: '200px' }} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto Origem</th>
              <th style={{ width: '100px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Unid.</th>
              <th style={{ width: '120px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd Origem</th>
              <th style={{ width: '130px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Semana Abast.</th>
              <th style={{ width: '130px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Semana Consumo</th>
              <th style={{ width: '100px' }} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th style={{ minWidth: '250px' }} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto Genérico</th>
              <th style={{ width: '120px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Unid. Medida</th>
              <th style={{ width: '120px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd Genérico</th>
              <th style={{ width: '120px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {necessidades.map((necessidade) => {
              const chaveOrigem = getChaveOrigem(necessidade);
              const produtoOrigemAtual = getProdutoOrigemSelecionadoInfo(necessidade);
              const produtoOrigemAtualId = produtoOrigemAtual.id;
              const loadingKey = getLoadingKey(produtoOrigemAtualId, necessidade.grupo);
              return (
              <React.Fragment key={chaveOrigem}>
                {/* Linha Consolidada */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleExpand(chaveOrigem)}
                      className="text-green-600 hover:text-green-700 focus:outline-none transition-colors"
                    >
                      {expandedRows[chaveOrigem] ? (
                        <FaChevronUp className="w-4 h-4" />
                      ) : (
                        <FaChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="text-xs font-semibold text-cyan-600">{necessidade.codigo_origem}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <SearchableSelect
                            value={selectedProdutosOrigem[chaveOrigem] || ''}
                            onChange={(value) => handleProdutoOrigemChange(chaveOrigem, value)}
                            options={(() => {
                              const produtosGrupo = necessidade.produtos_grupo || [];
                              const options = produtosGrupo.map(produto => {
                                const id = produto.produto_id || produto.id || produto.codigo;
                                const nome = produto.produto_nome || produto.nome;
                                const unidade = produto.unidade_medida || produto.unidade || '';
                                return {
                                  value: `${id}|${nome}|${unidade}`,
                                  label: `${nome}`,
                                  description: unidade
                                };
                              });
                              const valorAtual = `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${necessidade.produto_origem_unidade || ''}`;
                              const jaExiste = options.some(opt => opt.value === valorAtual);
                              if (!jaExiste) {
                                options.unshift({
                                  value: valorAtual,
                                  label: necessidade.produto_origem_nome,
                                  description: necessidade.produto_origem_unidade || ''
                                });
                              }
                              return options;
                            })()}
                            placeholder="Selecione um produto..."
                            disabled={
                              !necessidade.substituicoes_existentes ||
                              Boolean(necessidade.produto_trocado_id) ||
                              !ajustesAtivados
                            }
                            filterBy={(option, searchTerm) =>
                              option.label.toLowerCase().includes(searchTerm.toLowerCase())
                            }
                            className="text-xs"
                            usePortal={false}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          {necessidade.produto_trocado_id && (
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleDesfazerOrigem(necessidade)}
                              disabled={trocaLoading[getChaveOrigem(necessidade)]}
                              className="p-2"
                              title="Desfazer troca"
                            >
                              {trocaLoading[getChaveOrigem(necessidade)] ? (
                                <span className="text-[10px] text-gray-500">...</span>
                              ) : (
                                <FaUndo className="w-3.5 h-3.5 text-amber-700" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      {necessidade.produto_trocado_nome && (
                        <p className="text-[11px] text-amber-700">
                          Original: {necessidade.produto_trocado_nome}
                          {necessidade.produto_trocado_unidade && ` (${necessidade.produto_trocado_unidade})`}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <span className="text-xs text-gray-700">{necessidade.produto_origem_unidade}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <span className="text-xs text-gray-900">
                      {necessidade.quantidade_total_origem ? 
                        parseFloat(necessidade.quantidade_total_origem).toFixed(3).replace('.', ',') : 
                        '0,000'
                      }
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <span className="text-xs text-blue-600 font-medium">
                      {necessidade.semana_abastecimento || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <span className="text-xs text-green-600 font-medium">
                      {necessidade.semana_consumo || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="text-xs text-purple-600">
                      {selectedProdutosGenericos[chaveOrigem]?.split('|')[0] || necessidade.produto_generico_codigo || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap relative z-10">
                    <div className="relative z-10">
                      <SearchableSelect
                        value={selectedProdutosGenericos[chaveOrigem] || ''}
                        onChange={(value) => handleProdutoGenericoChange(chaveOrigem, value, necessidade.quantidade_total_origem)}
                        options={produtosGenericos[produtoOrigemAtualId]?.map(produto => ({
                          value: `${produto.id || produto.codigo}|${produto.nome}|${produto.unidade_medida_sigla || produto.unidade || produto.unidade_medida || ''}|${produto.fator_conversao || 1}`,
                          label: produto.nome
                        })) || []}
                        placeholder="Selecione..."
                        disabled={!ajustesAtivados || loadingGenericos[loadingKey]}
                        className="text-xs"
                        filterBy={(option, searchTerm) => {
                          return option.label.toLowerCase().includes(searchTerm.toLowerCase());
                        }}
                        usePortal={false}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <span className="text-xs text-gray-700">
                      {undGenericos[chaveOrigem] || necessidade.produto_generico_unidade || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <span className="text-xs text-cyan-600 font-semibold">
                      {quantidadesGenericos[chaveOrigem] !== undefined ? 
                        quantidadesGenericos[chaveOrigem] : 
                        '0,000'
                      }
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {ajustesAtivados && (
                      <Button
                        size="xs"
                        variant="success"
                        onClick={() => handleSaveConsolidated(necessidade)}
                        className="flex items-center gap-1"
                      >
                        <FaSave className="w-3 h-3" />
                        Salvar
                      </Button>
                    )}
                  </td>
                </tr>

                {/* Linha Expandida (Detalhes) */}
                {expandedRows[chaveOrigem] && (
                  <tr className="bg-gray-50">
                    <td colSpan="12" className="px-6 py-4">
                      <div className="bg-gray-50 border-l-4 border-green-600 p-4">
                        <h4 className="text-md font-semibold text-green-700 mb-4 flex items-center gap-2">
                          <span className="text-xl">🏢</span>
                          Unidades Solicitantes {necessidade.produto_generico_nome && `(${necessidade.produto_generico_nome})`}
                        </h4>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-100">
                              <th style={{ width: '100px' }} className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Cód. Escola</th>
                              <th style={{ minWidth: '250px' }} className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Unidade Escolar</th>
                              <th style={{ width: '100px' }} className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Código</th>
                              <th style={{ minWidth: '220px' }} className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produto Origem</th>
                              <th style={{ minWidth: '250px' }} className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produto Genérico</th>
                              <th style={{ width: '100px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Unid. Med.</th>
                              <th style={{ width: '100px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quantidade</th>
                              <th style={{ width: '120px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {necessidade.escolas.map((escola, idx) => {
                              const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
                              const valorOrigemAtual =
                                (selectedProdutosOrigemPorEscola[chaveEscola] ??
                                  origemInicialPorEscola[chaveEscola] ??
                                  selectedProdutosOrigem[chaveOrigem]) ??
                                `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${necessidade.produto_origem_unidade || ''}`;

                              const produtoOrigemEscolaId = valorOrigemAtual?.split('|')[0];
                              
                              // Buscar produto genérico padrão do novo produto origem se ainda não foi carregado
                              let produtoGenericoPadrao = null;
                              if (produtoOrigemEscolaId && produtoOrigemEscolaId !== produtoOrigemAtualId) {
                                const produtosGrupo = necessidade.produtos_grupo || [];
                                const produtoOrigemEscola = produtosGrupo.find(
                                  prod => String(prod.produto_id || prod.id || prod.codigo) === String(produtoOrigemEscolaId)
                                );
                                produtoGenericoPadrao = produtoOrigemEscola?.produto_generico_padrao;
                              }
                              
                              const opcoesGenericosBase = produtosGenericos[produtoOrigemEscolaId] || produtosGenericos[produtoOrigemAtualId] || [];
                              const opcoesGenericos = [...opcoesGenericosBase];
                              
                              // Adicionar produto genérico padrão se ainda não foi carregado mas existe
                              if (produtoGenericoPadrao && !opcoesGenericos.some(opt => `${opt.id || opt.codigo}` === String(produtoGenericoPadrao.id || produtoGenericoPadrao.codigo))) {
                                opcoesGenericos.unshift({
                                  id: produtoGenericoPadrao.id || produtoGenericoPadrao.codigo,
                                  codigo: produtoGenericoPadrao.id || produtoGenericoPadrao.codigo,
                                  nome: produtoGenericoPadrao.nome,
                                  unidade: produtoGenericoPadrao.unidade_medida_sigla || produtoGenericoPadrao.unidade_medida || produtoGenericoPadrao.unidade || '',
                                  unidade_medida: produtoGenericoPadrao.unidade_medida_sigla || produtoGenericoPadrao.unidade_medida || produtoGenericoPadrao.unidade || '',
                                  unidade_medida_sigla: produtoGenericoPadrao.unidade_medida_sigla || produtoGenericoPadrao.unidade_medida || produtoGenericoPadrao.unidade || '',
                                  fator_conversao: produtoGenericoPadrao.fator_conversao || 1
                                });
                              }
                              
                              // Priorizar estado React sobre propriedade mutável do objeto
                              const produtoSelecionado = selectedProdutosPorEscola[chaveEscola] || escola.selectedProdutoGenerico || (escola.substituicao ? 
                                `${escola.substituicao.produto_generico_id}|${escola.substituicao.produto_generico_nome}|${escola.substituicao.produto_generico_unidade || ''}` 
                                : '');
                              const partes = produtoSelecionado ? produtoSelecionado.split('|') : [];
                              const codigoProduto = partes[0] || '';
                              const nomeProduto = partes[1] || '';
                              const unidadeProduto = partes[2] || '';
                              const fatorConversao = partes.length >= 4 ? parseFloat(partes[3]) : 0;
                              
                              // Se produtoSelecionado existe mas não está nas opções, adicionar
                              if (
                                produtoSelecionado &&
                                !opcoesGenericos.some(opt => {
                                  const optValue = `${opt.id || opt.codigo}|${opt.nome}|${opt.unidade_medida_sigla || opt.unidade || opt.unidade_medida || ''}|${opt.fator_conversao || 1}`;
                                  return optValue === produtoSelecionado;
                                })
                              ) {
                                opcoesGenericos.unshift({
                                  id: codigoProduto,
                                  codigo: codigoProduto,
                                  nome: nomeProduto || 'Produto selecionado',
                                  unidade: unidadeProduto,
                                  unidade_medida: unidadeProduto,
                                  unidade_medida_sigla: unidadeProduto,
                                  fator_conversao: fatorConversao || 1
                                });
                              }
                              
                              const quantidadeGenerica = produtoSelecionado && fatorConversao > 0 && escola.quantidade_origem 
                                ? Math.ceil(parseFloat(escola.quantidade_origem) / fatorConversao)
                                : '';

                              return (
                                <tr key={`${escola.escola_id}-${idx}`}>
                                  <td className="px-4 py-2 whitespace-nowrap text-xs font-semibold text-gray-600">
                                    {escola.escola_id}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                                    {escola.escola_nome}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-xs font-semibold text-purple-600">
                                    {codigoProduto}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    <SearchableSelect
                                      value={valorOrigemAtual || ''}
                                      onChange={(value) => handleProdutoOrigemIndividualChange(necessidade, escola, value)}
                                      options={(() => {
                                        const baseOptions = (necessidade.produtos_grupo || []).map(produto => {
                                          const id = produto.produto_id || produto.id || produto.codigo;
                                          const nome = produto.produto_nome || produto.nome;
                                          const unidade = produto.unidade_medida || produto.unidade || '';
                                          return {
                                            value: `${id}|${nome}|${unidade}`,
                                            label: nome,
                                            description: unidade
                                          };
                                        });

                                        if (valorOrigemAtual && !baseOptions.some(opt => opt.value === valorOrigemAtual)) {
                                          const [, nomeAtual, unidadeAtual] = valorOrigemAtual.split('|');
                                          baseOptions.unshift({
                                            value: valorOrigemAtual,
                                            label: nomeAtual || 'Produto atual',
                                            description: unidadeAtual || ''
                                          });
                                        }

                                        return baseOptions;
                                      })()}
                                      placeholder="Produto origem..."
                                      disabled={!ajustesAtivados}
                                      className="text-xs"
                                      filterBy={(option, searchTerm) =>
                                        option.label.toLowerCase().includes(searchTerm.toLowerCase())
                                      }
                                      usePortal={false}
                                    />
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap relative z-10">
                                    <div className="relative z-10">
                                      <SearchableSelect
                                        value={produtoSelecionado}
                                        onChange={(value) => {
                                          setSelectedProdutosPorEscola(prev => ({ ...prev, [chaveEscola]: value }));
                                          escola.selectedProdutoGenerico = value;
                                        }}
                                        options={opcoesGenericos.map(produto => {
                                          const unidade = produto.unidade_medida_sigla || produto.unidade || produto.unidade_medida || '';
                                          return {
                                            value: `${produto.id || produto.codigo}|${produto.nome}|${unidade}|${produto.fator_conversao || 1}`,
                                            label: produto.nome
                                          };
                                        })}
                                        placeholder="Selecione..."
                                        disabled={!ajustesAtivados}
                                        filterBy={(option, searchTerm) => {
                                          return option.label.toLowerCase().includes(searchTerm.toLowerCase());
                                        }}
                                        usePortal={false}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-center">
                                    <span className="text-xs text-gray-700">
                                      {unidadeProduto || '-'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-center text-xs font-semibold text-cyan-600">
                                    {quantidadeGenerica || '0,000'}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-center">
                                    {ajustesAtivados && (
                                      <Button
                                        size="xs"
                                        variant="success"
                                        onClick={() => handleSaveIndividual(escola, necessidade)}
                                        className="flex items-center gap-1"
                                      >
                                        <FaSave className="w-3 h-3" />
                                        Salvar
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubstituicoesTableNutricionista;
