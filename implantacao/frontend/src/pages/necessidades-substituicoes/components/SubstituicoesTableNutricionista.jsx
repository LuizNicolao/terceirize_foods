import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaSave } from 'react-icons/fa';
import { Button, Input, SearchableSelect } from '../../../components/ui';
import toast from 'react-hot-toast';

const SubstituicoesTableNutricionista = ({
  necessidades,
  produtosGenericos,
  loadingGenericos,
  ajustesAtivados = false,
  onExpand,
  onSaveConsolidated,
  onSaveIndividual
}) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedProdutosGenericos, setSelectedProdutosGenericos] = useState({});
  const [quantidadesGenericos, setQuantidadesGenericos] = useState({});
  const [undGenericos, setUndGenericos] = useState({});
  const [produtosPadraoSelecionados, setProdutosPadraoSelecionados] = useState({});
  const [selectedProdutosPorEscola, setSelectedProdutosPorEscola] = useState({});

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

  // Pré-selecionar produto padrão ou produto já salvo quando produtos genéricos forem carregados
  useEffect(() => {
    necessidades.forEach(necessidade => {
      const chaveUnica = `${necessidade.codigo_origem}_${necessidade.produto_generico_id || 'novo'}`;
      
      if (produtosGenericos[necessidade.codigo_origem] && !produtosPadraoSelecionados[chaveUnica]) {
        if (necessidade.produto_generico_id) {
          const produtoEspecifico = produtosGenericos[necessidade.codigo_origem].find(
            p => (p.id || p.codigo) == necessidade.produto_generico_id
          );
          
          if (produtoEspecifico) {
            const unidade = produtoEspecifico.unidade_medida_sigla || produtoEspecifico.unidade || produtoEspecifico.unidade_medida || '';
            const valor = `${produtoEspecifico.id || produtoEspecifico.codigo}|${produtoEspecifico.nome}|${unidade}|${produtoEspecifico.fator_conversao || 1}`;
            
            setSelectedProdutosGenericos(prev => ({ ...prev, [chaveUnica]: valor }));
            setUndGenericos(prev => ({ ...prev, [chaveUnica]: unidade }));
            
            const fatorConversao = produtoEspecifico.fator_conversao || 1;
            if (necessidade.quantidade_total_origem && fatorConversao > 0) {
              const quantidadeCalculada = Math.ceil(parseFloat(necessidade.quantidade_total_origem) / fatorConversao);
              setQuantidadesGenericos(prev => ({ ...prev, [chaveUnica]: quantidadeCalculada }));
            }
            
            necessidade.escolas.forEach(escola => {
              const chaveEscola = `${chaveUnica}-${escola.escola_id}`;
              setSelectedProdutosPorEscola(prev => ({ ...prev, [chaveEscola]: valor }));
            });
          }
        } else {
          const produtoPadrao = produtosGenericos[necessidade.codigo_origem].find(
            p => p.produto_padrao === 'Sim'
          );
          
          if (produtoPadrao) {
            const unidade = produtoPadrao.unidade_medida_sigla || produtoPadrao.unidade || produtoPadrao.unidade_medida || '';
            const valor = `${produtoPadrao.id || produtoPadrao.codigo}|${produtoPadrao.nome}|${unidade}|${produtoPadrao.fator_conversao || 1}`;
            
            setSelectedProdutosGenericos(prev => ({ ...prev, [chaveUnica]: valor }));
            setUndGenericos(prev => ({ ...prev, [chaveUnica]: unidade }));
            
            const fatorConversao = produtoPadrao.fator_conversao || 1;
            if (necessidade.quantidade_total_origem && fatorConversao > 0) {
              const quantidadeCalculada = Math.ceil(parseFloat(necessidade.quantidade_total_origem) / fatorConversao);
              setQuantidadesGenericos(prev => ({ ...prev, [chaveUnica]: quantidadeCalculada }));
            }
            
            necessidade.escolas.forEach(escola => {
              const chaveEscola = `${chaveUnica}-${escola.escola_id}`;
              setSelectedProdutosPorEscola(prev => ({ ...prev, [chaveEscola]: valor }));
            });
          }
        }
        
        setProdutosPadraoSelecionados(prev => ({ ...prev, [chaveUnica]: true }));
      }
    });
  }, [produtosGenericos, necessidades, produtosPadraoSelecionados]);

  const handleToggleExpand = (chaveUnica) => {
    setExpandedRows(prev => ({
      ...prev,
      [chaveUnica]: !prev[chaveUnica]
    }));
  };

  const handleSaveConsolidated = async (necessidade) => {
    const chaveUnica = `${necessidade.codigo_origem}_${necessidade.produto_generico_id || 'novo'}`;
    
    if (!selectedProdutosGenericos[chaveUnica]) {
      toast.error('Selecione um produto genérico antes de salvar!');
      return;
    }

    const produtoSelecionado = selectedProdutosGenericos[chaveUnica];
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
        quantidade_generico: quantidadesGenericos[chaveUnica] || escola.quantidade_origem
      }))
    };

    const response = await onSaveConsolidated(dados, chaveUnica);
    
    if (response && response.success) {
      if (produtosGenericos[necessidade.codigo_origem]) {
        produtosGenericos[necessidade.codigo_origem].forEach(produto => {
          produto.produto_padrao = (produto.id || produto.codigo) == produto_generico_id ? 'Sim' : 'Não';
        });
      }
    }
  };

  const handleSaveIndividual = async (escola, necessidade) => {
    if (!escola.selectedProdutoGenerico) {
      toast.error('Selecione um produto genérico antes de salvar!');
      return;
    }

    const chaveUnica = `${necessidade.codigo_origem}_${necessidade.produto_generico_id || 'novo'}`;
    const partes = escola.selectedProdutoGenerico.split('|');
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
      necessidade_id: escola.necessidade_id,
      escola_id: escola.escola_id,
      escola_nome: escola.escola_nome,
      quantidade_origem: escola.quantidade_origem,
      quantidade_generico: escola.selectedQuantidade || escola.quantidade_origem
    };

    const response = await onSaveIndividual(dados, escola.escola_id);
    
    if (response && response.success) {
      if (produtosGenericos[necessidade.codigo_origem]) {
        produtosGenericos[necessidade.codigo_origem].forEach(produto => {
          produto.produto_padrao = (produto.id || produto.codigo) == produto_generico_id ? 'Sim' : 'Não';
        });
      }
      
      setSelectedProdutosGenericos(prev => ({ 
        ...prev, 
        [chaveUnica]: escola.selectedProdutoGenerico 
      }));
      
      const fatorConversao = parseFloat(partes[3]) || 1;
      setUndGenericos(prev => ({ 
        ...prev, 
        [chaveUnica]: produto_generico_unidade 
      }));
      
      if (necessidade.quantidade_total_origem && fatorConversao > 0) {
        const quantidadeCalculada = Math.ceil(parseFloat(necessidade.quantidade_total_origem) / fatorConversao);
        setQuantidadesGenericos(prev => ({ 
          ...prev, 
          [chaveUnica]: quantidadeCalculada 
        }));
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
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
            {necessidades.map((necessidade, index) => {
              const chaveUnica = `${necessidade.codigo_origem}_${necessidade.produto_generico_id || 'novo'}`;
              return (
              <React.Fragment key={chaveUnica}>
                {/* Linha Consolidada */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleExpand(chaveUnica)}
                      className="text-green-600 hover:text-green-700 focus:outline-none transition-colors"
                    >
                      {expandedRows[chaveUnica] ? (
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
                    <span className="text-xs font-medium text-gray-900">{necessidade.produto_origem_nome}</span>
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
                      {selectedProdutosGenericos[chaveUnica]?.split('|')[0] || necessidade.produto_generico_codigo || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap relative z-10">
                    <div className="relative z-10">
                      <SearchableSelect
                        value={selectedProdutosGenericos[chaveUnica] || ''}
                        onChange={(value) => handleProdutoGenericoChange(chaveUnica, value, necessidade.quantidade_total_origem)}
                        options={produtosGenericos[necessidade.codigo_origem]?.map(produto => ({
                          value: `${produto.id || produto.codigo}|${produto.nome}|${produto.unidade_medida_sigla || produto.unidade || produto.unidade_medida || ''}|${produto.fator_conversao || 1}`,
                          label: produto.nome
                        })) || []}
                        placeholder="Selecione..."
                        disabled={!ajustesAtivados || loadingGenericos[necessidade.codigo_origem]}
                        className="text-xs"
                        filterBy={(option, searchTerm) => {
                          return option.label.toLowerCase().includes(searchTerm.toLowerCase());
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <span className="text-xs text-gray-700">
                      {undGenericos[chaveUnica] || necessidade.produto_generico_unidade || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <span className="text-xs text-cyan-600 font-semibold">
                      {quantidadesGenericos[chaveUnica] !== undefined ? 
                        quantidadesGenericos[chaveUnica] : 
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
                {expandedRows[chaveUnica] && (
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
                              <th style={{ minWidth: '250px' }} className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produto Genérico</th>
                              <th style={{ width: '100px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Unid. Med.</th>
                              <th style={{ width: '100px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quantidade</th>
                              <th style={{ width: '120px' }} className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {necessidade.escolas.map((escola, idx) => {
                              const chaveEscola = `${chaveUnica}-${escola.escola_id}`;
                              const produtoSelecionado = selectedProdutosPorEscola[chaveEscola] || (escola.substituicao ? 
                                `${escola.substituicao.produto_generico_id}|${escola.substituicao.produto_generico_nome}|${escola.substituicao.produto_generico_unidade}` 
                                : '');
                              const partes = produtoSelecionado ? produtoSelecionado.split('|') : [];
                              const codigoProduto = partes[0] || '';
                              const nomeProduto = partes[1] || '';
                              const unidadeProduto = partes[2] || '';
                              const fatorConversao = partes.length >= 4 ? parseFloat(partes[3]) : 0;
                              
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
                                  <td className="px-4 py-2 whitespace-nowrap relative z-10">
                                    <div className="relative z-10">
                                      <SearchableSelect
                                        value={produtoSelecionado}
                                        onChange={(value) => {
                                          setSelectedProdutosPorEscola(prev => ({ ...prev, [chaveEscola]: value }));
                                          escola.selectedProdutoGenerico = value;
                                        }}
                                        options={produtosGenericos[necessidade.codigo_origem]?.map(produto => {
                                          const unidade = produto.unidade_medida_sigla || produto.unidade || produto.unidade_medida || '';
                                          return {
                                            value: `${produto.id || produto.codigo}|${produto.nome}|${unidade}|${produto.fator_conversao || 1}`,
                                            label: produto.nome
                                          };
                                        }) || []}
                                        placeholder="Selecione..."
                                        disabled={!ajustesAtivados}
                                        filterBy={(option, searchTerm) => {
                                          return option.label.toLowerCase().includes(searchTerm.toLowerCase());
                                        }}
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
