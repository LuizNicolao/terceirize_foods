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
  onInputChange,
  errors = {},
  showOnlyFilters = false,
  showOnlyTable = false
}) => {
  const [receitas, setReceitas] = useState([]);
  const [tiposReceitas, setTiposReceitas] = useState([]);
  const [receitasFiltradas, setReceitasFiltradas] = useState([]);
  const [tipoReceitaFiltro, setTipoReceitaFiltro] = useState(null);
  const [loadingReceitas, setLoadingReceitas] = useState(false);
  const [loadingTiposReceitas, setLoadingTiposReceitas] = useState(false);
  const [searchReceita, setSearchReceita] = useState('');
  // Estado para controlar valores dos inputs de percapta enquanto o usuário digita
  const [percaptaInputs, setPercaptaInputs] = useState({});
  // Estados para paginação de receitas
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 receitas por página
  // Estados para paginação da tabela de produtos
  const [currentPageTable, setCurrentPageTable] = useState(1);
  const [itemsPerPageTable] = useState(20); // 20 produtos por página

  // Carregar tipos de receitas e receitas
  useEffect(() => {
    carregarTiposReceitas();
    carregarReceitas();
  }, []);

  // Remover produtos quando um centro de custo for desmarcado
  useEffect(() => {
    const centrosCustoSelecionados = formData.centros_custo || [];
    const centrosCustoIds = centrosCustoSelecionados.map(cc => cc.id);
    const produtosAtuais = formData.produtos || [];
    
    // Verificar se há produtos com centros de custo que não estão mais selecionados
    const produtosParaManter = produtosAtuais.filter(produto => {
      // Se o produto tem um centro_custo_id, verificar se esse centro de custo ainda está selecionado
      if (produto.centro_custo_id) {
        return centrosCustoIds.includes(produto.centro_custo_id);
      }
      // Produtos sem centro_custo_id são mantidos (caso existam)
      return true;
    });

    // Verificar quais receitas ficaram sem produtos após a remoção
    const receitasAtuais = formData.receitas || [];
    const receitasIdsComProdutos = new Set(produtosParaManter.map(p => p.receita_id).filter(id => id));
    const receitasParaManter = receitasAtuais.filter(receita => 
      receitasIdsComProdutos.has(receita.id)
    );

    // Se houver produtos ou receitas removidos, atualizar
    if (produtosParaManter.length !== produtosAtuais.length || receitasParaManter.length !== receitasAtuais.length) {
      onInputChange('produtos', produtosParaManter);
      if (receitasParaManter.length !== receitasAtuais.length) {
        onInputChange('receitas', receitasParaManter);
      }
    }
  }, [formData.centros_custo, formData.produtos, formData.receitas, onInputChange]);

  // Filtrar receitas quando tipo de receita ou centros de custo mudarem
  useEffect(() => {
    let receitasFiltradasPorTipo = receitas;

    // Filtrar por tipo de receita
    if (tipoReceitaFiltro) {
      receitasFiltradasPorTipo = receitas.filter(r => 
        r.tipo_receita_id === tipoReceitaFiltro.id
      );
    }

    // Filtrar por centros de custo selecionados
    const centrosCustoSelecionados = formData.centros_custo || [];
    
    if (centrosCustoSelecionados.length > 0) {
      const centrosCustoIds = centrosCustoSelecionados.map(cc => cc.id);
      
      // Filtrar receitas que estão vinculadas a pelo menos um dos centros de custo selecionados
      receitasFiltradasPorTipo = receitasFiltradasPorTipo.filter(receita => {
        // Verificar se a receita tem centro de custo (array ou valor único para compatibilidade)
        const receitaCentrosCusto = receita.centros_custo || (receita.centro_custo_id ? [{ id: receita.centro_custo_id }] : []);
        return receitaCentrosCusto.some(cc => centrosCustoIds.includes(cc.id));
      });
    } else {
      // Se não há centros de custo selecionados, não mostrar receitas
      receitasFiltradasPorTipo = [];
    }

    setReceitasFiltradas(receitasFiltradasPorTipo);
  }, [tipoReceitaFiltro, receitas, formData.centros_custo]);

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
    
    // Obter centros de custo vinculados à receita
    const receitaCentrosCusto = receitaComProdutos.centros_custo || [];
    const receitaCentrosCustoIds = receitaCentrosCusto.map(cc => cc.id);
    
    // Filtrar apenas os centros de custo selecionados que estão vinculados à receita
    const centrosCustoVinculados = centrosCustoSelecionados.filter(cc => 
      receitaCentrosCustoIds.includes(cc.id)
    );
    
    // Para cada produto da receita, criar uma entrada apenas para os centros de custo vinculados
    const novosProdutos = [];
    if (receitaComProdutos.produtos && receitaComProdutos.produtos.length > 0) {
      receitaComProdutos.produtos.forEach(produtoReceita => {
        if (centrosCustoVinculados.length > 0) {
          centrosCustoVinculados.forEach(centroCusto => {
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
          // Se não há centros de custo vinculados, adicionar produto sem centro de custo
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

  const handleUpdatePercapta = (receitaId, produtoOrigemId, centroCustoId, produtoAgrupado, percapta, isBlur = false) => {
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
        // Limpar input local quando salvar
        const inputKey = `${receitaId}_${produtoOrigemId}_${centroCustoId}`;
        setPercaptaInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[inputKey];
          return newInputs;
        });
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
      
      // Se for blur, limpar o input local para que use o valor formatado do formData
      if (isBlur) {
        const inputKey = `${receitaId}_${produtoOrigemId}_${centroCustoId}`;
        setPercaptaInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[inputKey];
          return newInputs;
        });
      }
    } else {
      produtos[produtoIndex].percapta = null;
      onInputChange('produtos', produtos);
      // Limpar input local quando salvar
      const inputKey = `${receitaId}_${produtoOrigemId}_${centroCustoId}`;
      setPercaptaInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[inputKey];
        return newInputs;
      });
    }
  };

  const receitasParaExibicao = receitasFiltradas.filter(r => {
    if (!searchReceita) return true;
    const nome = (r.nome || '').toLowerCase();
    const codigo = (r.codigo || '').toLowerCase();
    return nome.includes(searchReceita.toLowerCase()) || codigo.includes(searchReceita.toLowerCase());
  });

  // Calcular paginação
  const totalReceitas = receitasParaExibicao.length;
  const totalPages = Math.ceil(totalReceitas / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const receitasPaginadas = receitasParaExibicao.slice(startIndex, endIndex);

  // Resetar página quando filtro ou busca mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [tipoReceitaFiltro, searchReceita, formData.centros_custo]);

  // Obter lista de centros de custo únicos para criar colunas dinâmicas
  // Apenas os centros de custo selecionados devem aparecer como colunas
  const centrosCustoUnicos = (formData.centros_custo || []).map(cc => ({
    id: cc.id,
    nome: cc.nome || 'Sem nome'
  }));

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

  // Converter produtosAgrupados em array para paginação
  const produtosAgrupadosArray = Object.values(produtosAgrupados);
  
  // Calcular paginação da tabela
  const totalProdutos = produtosAgrupadosArray.length;
  const totalPagesTable = Math.ceil(totalProdutos / itemsPerPageTable);
  const startIndexTable = (currentPageTable - 1) * itemsPerPageTable;
  const endIndexTable = startIndexTable + itemsPerPageTable;
  const produtosPaginados = produtosAgrupadosArray.slice(startIndexTable, endIndexTable);

  // Resetar página da tabela quando produtos mudarem
  useEffect(() => {
    setCurrentPageTable(1);
  }, [formData.produtos]);

  // Se mostrar apenas filtros, retornar apenas essa parte
  if (showOnlyFilters) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full flex flex-col">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
          Receitas
        </h3>
        <div className="space-y-4 flex-1 flex flex-col">
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
          <div className="flex-1 flex flex-col min-h-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar Receitas
            </label>
            <div className="border border-gray-300 rounded-md p-2 flex-1 flex flex-col bg-white min-h-0">
              {!isViewMode && (formData.centros_custo || []).length === 0 && (
                <div className="text-center py-3 text-amber-600 bg-amber-50 rounded border border-amber-200 mb-2 flex-shrink-0">
                  <p className="text-xs font-medium">Selecione pelo menos um Centro de Custo para visualizar receitas disponíveis</p>
                </div>
              )}
              <input
                type="text"
                placeholder="Buscar receita..."
                value={searchReceita}
                onChange={(e) => setSearchReceita(e.target.value)}
                disabled={isViewMode || (formData.centros_custo || []).length === 0}
                className="w-full px-2 py-1 mb-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:cursor-not-allowed flex-shrink-0"
              />
              {loadingReceitas ? (
                <div className="text-center py-4 text-gray-500">Carregando...</div>
              ) : (formData.centros_custo || []).length === 0 ? (
                <div className="text-center py-4 text-gray-500">Selecione um Centro de Custo para visualizar receitas</div>
              ) : receitasParaExibicao.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhuma receita encontrada para os centros de custo selecionados
                </div>
              ) : (
                <>
                  <div className="space-y-1 flex-1 min-h-0 overflow-y-auto">
                    {receitasPaginadas.map((receita) => {
                      const isSelected = (formData.receitas || []).some(r => r.id === receita.id);
                      return (
                        <div
                          key={receita.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-700">
                                {receita.codigo} - {receita.nome}
                              </span>
                              {receita.tipo_receita && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  Tipo: {receita.tipo_receita}
                                </span>
                              )}
                            </div>
                            {receita.descricao && (
                              <div className="text-xs text-gray-400 mt-1 break-words">
                                {receita.descricao}
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
                  
                  {/* Controles de Paginação */}
                  {totalPages > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          Mostrando {startIndex + 1} a {Math.min(endIndex, totalReceitas)} de {totalReceitas} receita(s)
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="text-xs"
                          >
                            Anterior
                          </Button>
                          <span className="text-xs text-gray-600">
                            Página {currentPage} de {totalPages}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="text-xs"
                          >
                            Próxima
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {(formData.receitas || []).length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                {(formData.receitas || []).length} receita(s) selecionada(s)
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Se mostrar apenas tabela, retornar apenas essa parte
  if (showOnlyTable) {
    // Se não há produtos, não mostrar nada
    if ((formData.produtos || []).length === 0) {
      return null;
    }
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
          Produtos por Receita e Centro de Custo
        </h3>
        <div>
          <div className="flex items-center justify-between mb-2">
            {errors.percapta && (
              <span className="text-xs text-red-600 font-medium">
                * Campos de Percapta são obrigatórios
              </span>
            )}
          </div>
          <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Receita</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Produto</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Unidade</th>
                      {centrosCustoUnicos.map((centroCusto) => (
                        <th key={centroCusto.id} className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          Percapta – {centroCusto.nome} <span className="text-red-500">*</span>
                        </th>
                      ))}
                      {!isViewMode && (
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Ações</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {produtosPaginados.map((produtoAgrupado, grupoIndex) => (
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
                          const inputKey = `${produtoAgrupado.receita_id}_${produtoAgrupado.produto_origem_id}_${centroCusto.id}`;
                          
                          // Se há valor no input local (usuário está digitando), usar ele
                          // Caso contrário, usar o valor formatado do formData
                          let valorAtual = '';
                          if (percaptaInputs[inputKey] !== undefined) {
                            valorAtual = percaptaInputs[inputKey];
                          } else if (percaptaData && percaptaData.percapta !== null && percaptaData.percapta !== undefined) {
                            // Apenas formatar com 3 casas decimais quando não está digitando
                            valorAtual = parseFloat(percaptaData.percapta).toFixed(3).replace('.', ',');
                          }
                          
                          // Verificar se este campo tem erro (está vazio e é obrigatório)
                          const temErro = errors.produtosSemPercapta && errors.produtosSemPercapta.some(
                            p => p.receita_id === produtoAgrupado.receita_id &&
                                 p.produto_origem_id === produtoAgrupado.produto_origem_id &&
                                 p.centro_custo_id === centroCusto.id
                          );
                          
                          return (
                            <td key={centroCusto.id} className="px-3 py-2">
                              {isViewMode ? (
                                <span className="text-gray-900">
                                  {percaptaData && percaptaData.percapta !== null && percaptaData.percapta !== undefined
                                    ? parseFloat(percaptaData.percapta).toFixed(3).replace('.', ',')
                                    : '-'}
                                </span>
                              ) : (
                                <input
                                  type="text"
                                  value={valorAtual}
                                  onChange={(e) => {
                                    const novoValor = e.target.value;
                                    // Salvar no estado local para não formatar enquanto digita
                                    setPercaptaInputs(prev => ({
                                      ...prev,
                                      [inputKey]: novoValor
                                    }));
                                    // Atualizar formData sem formatar
                                    handleUpdatePercapta(
                                      produtoAgrupado.receita_id,
                                      produtoAgrupado.produto_origem_id,
                                      centroCusto.id,
                                      produtoAgrupado,
                                      novoValor,
                                      false
                                    );
                                  }}
                                  onBlur={(e) => {
                                    const valor = e.target.value.replace(',', '.');
                                    handleUpdatePercapta(
                                      produtoAgrupado.receita_id,
                                      produtoAgrupado.produto_origem_id,
                                      centroCusto.id,
                                      produtoAgrupado,
                                      valor,
                                      true
                                    );
                                  }}
                                  placeholder="0,000"
                                  required
                                  className={`w-20 px-2 py-1 border rounded text-sm ${
                                    temErro 
                                      ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                                  }`}
                                  title={temErro ? 'Este campo é obrigatório' : ''}
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
              
              {/* Controles de Paginação da Tabela */}
              {totalPagesTable > 1 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Mostrando {startIndexTable + 1} a {Math.min(endIndexTable, totalProdutos)} de {totalProdutos} produto(s)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPageTable(prev => Math.max(1, prev - 1))}
                        disabled={currentPageTable === 1}
                        className="text-xs"
                      >
                        Anterior
                      </Button>
                      <span className="text-xs text-gray-600">
                        Página {currentPageTable} de {totalPagesTable}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPageTable(prev => Math.min(totalPagesTable, prev + 1))}
                        disabled={currentPageTable === totalPagesTable}
                        className="text-xs"
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    );
  }

  // Comportamento padrão (mostrar tudo) - mantido para compatibilidade
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
              {!isViewMode && (formData.centros_custo || []).length === 0 && (
                <div className="text-center py-3 text-amber-600 bg-amber-50 rounded border border-amber-200 mb-2">
                  <p className="text-xs font-medium">Selecione pelo menos um Centro de Custo para visualizar receitas disponíveis</p>
                </div>
              )}
              <input
                type="text"
                placeholder="Buscar receita..."
                value={searchReceita}
                onChange={(e) => setSearchReceita(e.target.value)}
                disabled={isViewMode || (formData.centros_custo || []).length === 0}
                className="w-full px-2 py-1 mb-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {loadingReceitas ? (
                <div className="text-center py-4 text-gray-500">Carregando...</div>
              ) : (formData.centros_custo || []).length === 0 ? (
                <div className="text-center py-4 text-gray-500">Selecione um Centro de Custo para visualizar receitas</div>
              ) : receitasParaExibicao.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhuma receita encontrada para os centros de custo selecionados
                </div>
              ) : (
                <>
                <div className="space-y-1">
                    {receitasPaginadas.map((receita) => {
                    const isSelected = (formData.receitas || []).some(r => r.id === receita.id);
                    return (
                      <div
                        key={receita.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-700">
                            {receita.codigo} - {receita.nome}
                              </span>
                          {receita.tipo_receita && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                              Tipo: {receita.tipo_receita}
                                </span>
                              )}
                            </div>
                            {receita.descricao && (
                              <div className="text-xs text-gray-400 mt-1 break-words">
                                {receita.descricao}
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
                  
                  {/* Controles de Paginação */}
                  {totalPages > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          Mostrando {startIndex + 1} a {Math.min(endIndex, totalReceitas)} de {totalReceitas} receita(s)
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="text-xs"
                          >
                            Anterior
                          </Button>
                          <span className="text-xs text-gray-600">
                            Página {currentPage} de {totalPages}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="text-xs"
                          >
                            Próxima
                          </Button>
                        </div>
                      </div>
                </div>
                  )}
                </>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
              Produtos por Receita e Centro de Custo
            </label>
              {errors.percapta && (
                <span className="text-xs text-red-600 font-medium">
                  * Campos de Percapta são obrigatórios
                </span>
              )}
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Receita</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Produto</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Unidade</th>
                      {centrosCustoUnicos.map((centroCusto) => (
                        <th key={centroCusto.id} className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          Percapta – {centroCusto.nome} <span className="text-red-500">*</span>
                        </th>
                      ))}
                      {!isViewMode && (
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Ações</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {produtosPaginados.map((produtoAgrupado, grupoIndex) => (
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
                          const inputKey = `${produtoAgrupado.receita_id}_${produtoAgrupado.produto_origem_id}_${centroCusto.id}`;
                          
                          // Se há valor no input local (usuário está digitando), usar ele
                          // Caso contrário, usar o valor formatado do formData
                          let valorAtual = '';
                          if (percaptaInputs[inputKey] !== undefined) {
                            valorAtual = percaptaInputs[inputKey];
                          } else if (percaptaData && percaptaData.percapta !== null && percaptaData.percapta !== undefined) {
                            // Apenas formatar com 3 casas decimais quando não está digitando
                            valorAtual = parseFloat(percaptaData.percapta).toFixed(3).replace('.', ',');
                          }
                          
                          // Verificar se este campo tem erro (está vazio e é obrigatório)
                          const temErro = errors.produtosSemPercapta && errors.produtosSemPercapta.some(
                            p => p.receita_id === produtoAgrupado.receita_id &&
                                 p.produto_origem_id === produtoAgrupado.produto_origem_id &&
                                 p.centro_custo_id === centroCusto.id
                          );
                          
                          return (
                            <td key={centroCusto.id} className="px-3 py-2">
                              {isViewMode ? (
                                <span className="text-gray-900">
                                  {percaptaData && percaptaData.percapta !== null && percaptaData.percapta !== undefined
                                    ? parseFloat(percaptaData.percapta).toFixed(3).replace('.', ',')
                                    : '-'}
                                </span>
                              ) : (
                                <input
                                  type="text"
                                  value={valorAtual}
                                  onChange={(e) => {
                                    const novoValor = e.target.value;
                                    // Salvar no estado local para não formatar enquanto digita
                                    setPercaptaInputs(prev => ({
                                      ...prev,
                                      [inputKey]: novoValor
                                    }));
                                    // Atualizar formData sem formatar
                                    handleUpdatePercapta(
                                      produtoAgrupado.receita_id,
                                      produtoAgrupado.produto_origem_id,
                                      centroCusto.id,
                                      produtoAgrupado,
                                      novoValor,
                                      false
                                    );
                                  }}
                                  onBlur={(e) => {
                                    const valor = e.target.value.replace(',', '.');
                                    handleUpdatePercapta(
                                      produtoAgrupado.receita_id,
                                      produtoAgrupado.produto_origem_id,
                                      centroCusto.id,
                                      produtoAgrupado,
                                      valor,
                                      true
                                    );
                                  }}
                                  placeholder="0,000"
                                  required
                                  className={`w-20 px-2 py-1 border rounded text-sm ${
                                    temErro 
                                      ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                                  }`}
                                  title={temErro ? 'Este campo é obrigatório' : ''}
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
              
              {/* Controles de Paginação da Tabela */}
              {totalPagesTable > 1 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Mostrando {startIndexTable + 1} a {Math.min(endIndexTable, totalProdutos)} de {totalProdutos} produto(s)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPageTable(prev => Math.max(1, prev - 1))}
                        disabled={currentPageTable === 1}
                        className="text-xs"
                      >
                        Anterior
                      </Button>
                      <span className="text-xs text-gray-600">
                        Página {currentPageTable} de {totalPagesTable}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPageTable(prev => Math.min(totalPagesTable, prev + 1))}
                        disabled={currentPageTable === totalPagesTable}
                        className="text-xs"
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceitasProdutos;

