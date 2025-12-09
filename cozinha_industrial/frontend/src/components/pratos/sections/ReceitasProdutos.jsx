import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { SearchableSelect, Button } from '../../ui';
import receitasService from '../../../services/receitas';
import tiposReceitasService from '../../../services/tiposReceitas';

/**
 * Seção de Receitas e Produtos do Prato
 */
const ReceitasProdutos = ({
  formData,
  isViewMode,
  onInputChange
}) => {
  const [receitas, setReceitas] = useState([]);
  const [tiposReceitas, setTiposReceitas] = useState([]);
  const [receitasFiltradas, setReceitasFiltradas] = useState([]);
  const [tipoReceitaFiltro, setTipoReceitaFiltro] = useState(null);
  const [loadingReceitas, setLoadingReceitas] = useState(false);
  const [loadingTiposReceitas, setLoadingTiposReceitas] = useState(false);
  const [searchReceita, setSearchReceita] = useState('');

  // Carregar tipos de receitas e receitas
  useEffect(() => {
    carregarTiposReceitas();
    carregarReceitas();
  }, []);

  // Filtrar receitas quando tipo de receita mudar
  useEffect(() => {
    if (tipoReceitaFiltro) {
      const filtradas = receitas.filter(r => 
        r.tipo_receita_id === tipoReceitaFiltro.id
      );
      setReceitasFiltradas(filtradas);
    } else {
      setReceitasFiltradas(receitas);
    }
  }, [tipoReceitaFiltro, receitas]);

  const carregarTiposReceitas = async () => {
    setLoadingTiposReceitas(true);
    try {
      let allTiposReceitas = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await tiposReceitasService.listar({
          page,
          limit: 100,
          status: 1
        });
        
        if (result.success && result.data && result.data.length > 0) {
          allTiposReceitas = [...allTiposReceitas, ...result.data];
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setTiposReceitas(allTiposReceitas);
    } catch (error) {
      console.error('Erro ao carregar tipos de receitas:', error);
    } finally {
      setLoadingTiposReceitas(false);
    }
  };

  const carregarReceitas = async () => {
    setLoadingReceitas(true);
    try {
      let allReceitas = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await receitasService.listar({
          page,
          limit: 100,
          status: 1
        });
        
        if (result.success && result.data && result.data.length > 0) {
          allReceitas = [...allReceitas, ...result.data];
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setReceitas(allReceitas);
      setReceitasFiltradas(allReceitas);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoadingReceitas(false);
    }
  };

  const handleAdicionarReceita = async (receita) => {
    // Verificar se já está adicionada
    const receitasAtuais = formData.receitas || [];
    if (receitasAtuais.find(r => r.id === receita.id)) {
      return;
    }

    // Buscar receita completa com produtos
    const receitaCompleta = await receitasService.buscarPorId(receita.id);
    if (!receitaCompleta.success || !receitaCompleta.data) {
      return;
    }

    const receitaComProdutos = receitaCompleta.data;
    
    // Adicionar receita
    const novasReceitas = [...receitasAtuais, {
      id: receita.id,
      codigo: receita.codigo || '',
      nome: receita.nome || ''
    }];

    // Adicionar produtos da receita aos produtos do prato
    const produtosAtuais = formData.produtos || [];
    const centrosCustoSelecionados = formData.centros_custo || [];
    
    // Para cada produto da receita, criar uma entrada para cada centro de custo selecionado
    const novosProdutos = [];
    if (receitaComProdutos.produtos && receitaComProdutos.produtos.length > 0) {
      receitaComProdutos.produtos.forEach(produtoReceita => {
        if (centrosCustoSelecionados.length > 0) {
          centrosCustoSelecionados.forEach(centroCusto => {
            novosProdutos.push({
              receita_id: receita.id,
              produto_origem_id: produtoReceita.produto_origem_id,
              produto_origem_nome: produtoReceita.produto_origem || produtoReceita.produto_origem_nome,
              grupo_id: produtoReceita.grupo_id,
              grupo_nome: produtoReceita.grupo_nome,
              subgrupo_id: produtoReceita.subgrupo_id,
              subgrupo_nome: produtoReceita.subgrupo_nome,
              classe_id: produtoReceita.classe_id,
              classe_nome: produtoReceita.classe_nome,
              unidade_medida_id: produtoReceita.unidade_medida_id,
              unidade_medida_sigla: produtoReceita.unidade_medida_sigla,
              centro_custo_id: centroCusto.id,
              centro_custo_nome: centroCusto.nome,
              percapta: produtoReceita.percapta_sugerida || null
            });
          });
        } else {
          // Se não há centros de custo selecionados, adicionar produto sem centro de custo
          novosProdutos.push({
            receita_id: receita.id,
            produto_origem_id: produtoReceita.produto_origem_id,
            produto_origem_nome: produtoReceita.produto_origem || produtoReceita.produto_origem_nome,
            grupo_id: produtoReceita.grupo_id,
            grupo_nome: produtoReceita.grupo_nome,
            subgrupo_id: produtoReceita.subgrupo_id,
            subgrupo_nome: produtoReceita.subgrupo_nome,
            classe_id: produtoReceita.classe_id,
            classe_nome: produtoReceita.classe_nome,
            unidade_medida_id: produtoReceita.unidade_medida_id,
            unidade_medida_sigla: produtoReceita.unidade_medida_sigla,
            centro_custo_id: null,
            centro_custo_nome: null,
            percapta: produtoReceita.percapta_sugerida || null
          });
        }
      });
    }

    onInputChange('receitas', novasReceitas);
    onInputChange('produtos', [...produtosAtuais, ...novosProdutos]);
  };

  const handleRemoverReceita = (receitaId) => {
    // Remover receita
    const novasReceitas = (formData.receitas || []).filter(r => r.id !== receitaId);
    onInputChange('receitas', novasReceitas);

    // Remover produtos dessa receita
    const novosProdutos = (formData.produtos || []).filter(p => p.receita_id !== receitaId);
    onInputChange('produtos', novosProdutos);
  };

  const handleUpdatePercapta = (receitaId, produtoOrigemId, centroCustoId, produtoAgrupado, percapta) => {
    if (!receitaId || !produtoOrigemId || !centroCustoId) {
      return;
    }

    let valor = percapta;
    const produtos = [...(formData.produtos || [])];
    
    // Encontrar o produto específico
    let produtoIndex = produtos.findIndex(p => 
      p.receita_id === receitaId && 
      p.produto_origem_id === produtoOrigemId && 
      p.centro_custo_id === centroCustoId
    );

    // Se não encontrou, criar um novo produto para este centro de custo
    if (produtoIndex === -1) {
      // Buscar um produto existente do mesmo grupo para copiar dados
      const produtoBase = produtos.find(p => 
        p.receita_id === receitaId && 
        p.produto_origem_id === produtoOrigemId
      );

      if (produtoBase) {
        // Buscar nome do centro de custo
        const centroCustoSelecionado = (formData.centros_custo || []).find(cc => cc.id === centroCustoId);
        
        produtos.push({
          receita_id: receitaId,
          produto_origem_id: produtoOrigemId,
          produto_origem_nome: produtoBase.produto_origem_nome,
          grupo_id: produtoBase.grupo_id,
          grupo_nome: produtoBase.grupo_nome,
          subgrupo_id: produtoBase.subgrupo_id,
          subgrupo_nome: produtoBase.subgrupo_nome,
          classe_id: produtoBase.classe_id,
          classe_nome: produtoBase.classe_nome,
          unidade_medida_id: produtoBase.unidade_medida_id,
          unidade_medida_sigla: produtoBase.unidade_medida_sigla,
          centro_custo_id: centroCustoId,
          centro_custo_nome: centroCustoSelecionado?.nome || null,
          percapta: null
        });
        produtoIndex = produtos.length - 1;
      } else {
        return;
      }
    }

    if (valor !== '' && valor !== null && valor !== undefined) {
      // Permitir digitar 0 antes da vírgula
      if (valor === '0' || valor === '0,') {
        produtos[produtoIndex].percapta = 0;
        onInputChange('produtos', produtos);
        return;
      }
      
      if (valor.toString().includes(',')) {
        valor = valor.toString().replace(',', '.');
      }
      if (valor.toString().includes('.')) {
        const partes = valor.toString().split('.');
        if (partes[1] && partes[1].length > 3) {
          valor = `${partes[0]}.${partes[1].substring(0, 3)}`;
        }
      }
      
      const valorNumerico = parseFloat(valor);
      produtos[produtoIndex].percapta = !isNaN(valorNumerico) ? valorNumerico : null;
      onInputChange('produtos', produtos);
    } else {
      produtos[produtoIndex].percapta = null;
      onInputChange('produtos', produtos);
    }
  };

  const receitasParaExibicao = receitasFiltradas.filter(r => {
    if (!searchReceita) return true;
    const nome = (r.nome || '').toLowerCase();
    const codigo = (r.codigo || '').toLowerCase();
    return nome.includes(searchReceita.toLowerCase()) || codigo.includes(searchReceita.toLowerCase());
  });

  // Obter lista de centros de custo únicos para criar colunas dinâmicas
  // Incluir tanto os que já têm produtos quanto os selecionados em formData.centros_custo
  const centrosCustoComProdutos = Array.from(
    new Set((formData.produtos || []).map(p => p.centro_custo_id).filter(id => id))
  ).map(id => {
    const produto = (formData.produtos || []).find(p => p.centro_custo_id === id);
    return {
      id: id,
      nome: produto?.centro_custo_nome || 'Sem nome'
    };
  });

  const centrosCustoSemProdutos = (formData.centros_custo || [])
    .filter(cc => !centrosCustoComProdutos.some(ccp => ccp.id === cc.id))
    .map(cc => ({
      id: cc.id,
      nome: cc.nome || 'Sem nome'
    }));

  const centrosCustoUnicos = [...centrosCustoComProdutos, ...centrosCustoSemProdutos];

  // Agrupar produtos por receita e produto (não por centro de custo)
  const produtosAgrupados = (formData.produtos || []).reduce((acc, produto, index) => {
    const key = `${produto.receita_id || 'sem-receita'}_${produto.produto_origem_id || 'sem-produto'}`;
    if (!acc[key]) {
      acc[key] = {
        receita_id: produto.receita_id,
        receita_nome: formData.receitas?.find(r => r.id === produto.receita_id)?.nome || 'Sem receita',
        produto_origem_id: produto.produto_origem_id,
        produto_origem_nome: produto.produto_origem_nome || 'Sem produto',
        unidade_medida_sigla: produto.unidade_medida_sigla || '-',
        percaptasPorCentroCusto: {}
      };
    }
    // Armazenar percapita por centro de custo
    if (produto.centro_custo_id) {
      acc[key].percaptasPorCentroCusto[produto.centro_custo_id] = {
        produtoIndex: index,
        percapta: produto.percapta,
        centro_custo_id: produto.centro_custo_id,
        centro_custo_nome: produto.centro_custo_nome
      };
    }
    return acc;
  }, {});

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Receitas e Produtos
      </h3>
      <div className="space-y-4">
        {/* Filtro de Tipo de Receita e Seleção de Receitas lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Filtro de Tipo de Receita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Tipo de Receita
            </label>
            <SearchableSelect
              value={tipoReceitaFiltro ? tipoReceitaFiltro.tipo_receita : ''}
              onChange={(value) => {
                const tipo = tiposReceitas.find(t => t.tipo_receita === value);
                setTipoReceitaFiltro(tipo || null);
              }}
              options={[
                { value: '', label: 'Todos os tipos' },
                ...tiposReceitas.map(t => ({
                  value: t.tipo_receita || '',
                  label: t.tipo_receita || ''
                }))
              ]}
              placeholder="Selecione um tipo de receita..."
              disabled={isViewMode}
              loading={loadingTiposReceitas}
            />
          </div>

          {/* Seleção de Receitas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar Receitas
            </label>
            <div className="border border-gray-300 rounded-md p-2 max-h-48 overflow-y-auto bg-white">
              <input
                type="text"
                placeholder="Buscar receita..."
                value={searchReceita}
                onChange={(e) => setSearchReceita(e.target.value)}
                disabled={isViewMode}
                className="w-full px-2 py-1 mb-2 border border-gray-300 rounded text-sm"
              />
              {loadingReceitas ? (
                <div className="text-center py-4 text-gray-500">Carregando...</div>
              ) : receitasParaExibicao.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Nenhuma receita encontrada</div>
              ) : (
                <div className="space-y-1">
                  {receitasParaExibicao.map((receita) => {
                    const isSelected = (formData.receitas || []).some(r => r.id === receita.id);
                    return (
                      <div
                        key={receita.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700">
                            {receita.codigo} - {receita.nome}
                          </div>
                          {receita.tipo_receita && (
                            <div className="text-xs text-gray-500">
                              Tipo: {receita.tipo_receita}
                            </div>
                          )}
                        </div>
                        {!isViewMode && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              isSelected ? handleRemoverReceita(receita.id) : handleAdicionarReceita(receita);
                            }}
                            className={isSelected 
                              ? "text-red-600 hover:text-red-800 hover:bg-red-50" 
                              : "text-green-600 hover:text-green-800 hover:bg-green-50"
                            }
                            title={isSelected ? "Remover receita" : "Adicionar receita"}
                          >
                            {isSelected ? (
                              <FaTrash className="w-3 h-3" />
                            ) : (
                              <FaPlus className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {(formData.receitas || []).length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                {(formData.receitas || []).length} receita(s) selecionada(s)
              </div>
            )}
          </div>
        </div>

        {/* Tabela de Produtos */}
        {(formData.produtos || []).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produtos por Receita e Centro de Custo
            </label>
            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Receita</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Produto</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Unidade</th>
                      {centrosCustoUnicos.map((centroCusto) => (
                        <th key={centroCusto.id} className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          Percapta – {centroCusto.nome}
                        </th>
                      ))}
                      {!isViewMode && (
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Ações</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.values(produtosAgrupados).map((produtoAgrupado, grupoIndex) => (
                      <tr key={grupoIndex} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                          {produtoAgrupado.receita_nome}
                        </td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                          {produtoAgrupado.produto_origem_nome}
                        </td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                          {produtoAgrupado.unidade_medida_sigla}
                        </td>
                        {centrosCustoUnicos.map((centroCusto) => {
                          const percaptaData = produtoAgrupado.percaptasPorCentroCusto[centroCusto.id];
                          const valorAtual = percaptaData && percaptaData.percapta !== null && percaptaData.percapta !== undefined
                            ? parseFloat(percaptaData.percapta).toFixed(3).replace('.', ',')
                            : '';
                          
                          return (
                            <td key={centroCusto.id} className="px-3 py-2">
                              {isViewMode ? (
                                <span className="text-gray-900">
                                  {valorAtual || '-'}
                                </span>
                              ) : (
                                <input
                                  type="text"
                                  value={valorAtual}
                                  onChange={(e) => {
                                    handleUpdatePercapta(
                                      produtoAgrupado.receita_id,
                                      produtoAgrupado.produto_origem_id,
                                      centroCusto.id,
                                      produtoAgrupado,
                                      e.target.value
                                    );
                                  }}
                                  onBlur={(e) => {
                                    const valor = e.target.value.replace(',', '.');
                                    handleUpdatePercapta(
                                      produtoAgrupado.receita_id,
                                      produtoAgrupado.produto_origem_id,
                                      centroCusto.id,
                                      produtoAgrupado,
                                      valor
                                    );
                                  }}
                                  placeholder="0,000"
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              )}
                            </td>
                          );
                        })}
                        {!isViewMode && (
                          <td className="px-3 py-2 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Remover todos os produtos deste grupo (todos os centros de custo)
                                const novosProdutos = (formData.produtos || []).filter(p => 
                                  !(p.receita_id === produtoAgrupado.receita_id && 
                                    p.produto_origem_id === produtoAgrupado.produto_origem_id)
                                );
                                onInputChange('produtos', novosProdutos);
                              }}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Remover produto"
                            >
                              <FaTrash className="w-3 h-3" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceitasProdutos;

