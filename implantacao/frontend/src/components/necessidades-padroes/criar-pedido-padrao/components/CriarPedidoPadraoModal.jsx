import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button, SearchableSelect, Input, Pagination } from '../../../ui';
import { FaPlus, FaSave, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import FoodsApiService from '../../../../services/FoodsApiService';
import NecessidadesPadroesService from '../../../../services/necessidadesPadroes';
import toast from 'react-hot-toast';
import useUnsavedChangesPrompt from '../../../../hooks/useUnsavedChangesPrompt';
import { ConfirmModal } from '../../../ui';

/**
 * Modal para criar ou editar necessidade padrão
 */
const CriarPedidoPadraoModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingItem = null, // Se fornecido, está editando
  viewMode = false, // Se true, apenas visualização (sem edição)
  filialId: filialIdProp,
  grupoId: grupoIdProp
}) => {
  const [filialId, setFilialId] = useState(filialIdProp || '');
  const [grupoId, setGrupoId] = useState(grupoIdProp || '');
  const [escolaId, setEscolaId] = useState('');
  const [escolas, setEscolas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  
  // Estado para controlar quais grupos estão expandidos
  const [gruposExpandidos, setGruposExpandidos] = useState(new Set());
  
  // Estados para paginação da tabela de produtos
  const [paginationProdutos, setPaginationProdutos] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  });
  
  
  const {
    markDirty,
    resetDirty,
    requestClose,
    showConfirm,
    confirmClose,
    cancelClose,
    confirmTitle,
    confirmMessage
  } = useUnsavedChangesPrompt();

  // Carregar filiais e grupos quando modal abrir (se não estiver editando)
  useEffect(() => {
    if (isOpen && !editingItem) {
      carregarFiliaisEGrupos();
    }
  }, [isOpen, editingItem]);

  // Carregar escolas quando filial mudar
  useEffect(() => {
    if (filialId) {
      carregarEscolas();
    } else {
      setEscolas([]);
      setEscolaId('');
    }
  }, [filialId]);

  // Estado para informações da escola (filial) quando em modo edição/visualização
  const [escolaInfo, setEscolaInfo] = useState(null);

  // Carregar dados quando estiver editando ou visualizando
  useEffect(() => {
    if (isOpen && editingItem) {
      setGrupoId(editingItem.grupo_id || grupoIdProp || '');
      setEscolaId(editingItem.escola_id);
      
      // Buscar informações da escola para obter filial_id
      if (editingItem.escola_id) {
        buscarInfoEscola(editingItem.escola_id);
      }
      
      // Carregar produtos existentes do padrão (tanto para edição quanto visualização)
      carregarProdutosPadrao();
    } else if (isOpen) {
      // Reset para criação
      setFilialId(filialIdProp || '');
      setGrupoId(grupoIdProp || '');
      setEscolaId('');
      setEscolaInfo(null);
      setProdutosSelecionados([]);
      resetDirty();
    }
  }, [isOpen, editingItem, filialIdProp, grupoIdProp, viewMode]);

  const buscarInfoEscola = async (escolaId) => {
    try {
      const response = await FoodsApiService.getUnidadeEscolarById(escolaId);
      if (response.success && response.data) {
        const escola = response.data;
        setEscolaInfo({
          filial_id: escola.filial_id,
          filial_nome: escola.filial_nome || escola.filial || 'N/A'
        });
        setFilialId(escola.filial_id || '');
      }
    } catch (error) {
      console.error('Erro ao buscar informações da escola:', error);
      setEscolaInfo({ filial_id: null, filial_nome: 'N/A' });
    }
  };

  // Carregar produtos do grupo quando grupo estiver definido (não precisa esperar escola)
  useEffect(() => {
    if (isOpen && grupoId && !editingItem) {
      carregarProdutos();
    }
  }, [isOpen, grupoId, editingItem]);

  const carregarFiliaisEGrupos = async () => {
    setLoadingFiltros(true);
    try {
      // Carregar filiais
      const filiaisResponse = await FoodsApiService.getFiliais({ limit: 1000 });
      if (filiaisResponse.success && filiaisResponse.data) {
        const filiaisData = Array.isArray(filiaisResponse.data) 
          ? filiaisResponse.data 
          : filiaisResponse.data.data;
        
        if (Array.isArray(filiaisData)) {
          setFiliais(filiaisData.map(f => ({ 
            value: f.id, 
            label: f.filial || f.nome || f.razao_social || `Filial ${f.id}`
          })));
        }
      }

      // Carregar grupos
      const gruposResponse = await FoodsApiService.getGrupos({ limit: 1000 });
      if (gruposResponse.success && gruposResponse.data) {
        const gruposData = Array.isArray(gruposResponse.data) 
          ? gruposResponse.data 
          : gruposResponse.data.data;
        
        if (Array.isArray(gruposData)) {
          setGrupos(gruposData.map(g => ({ 
            value: g.id, 
            label: g.nome || g.descricao || `Grupo ${g.id}`
          })));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar filiais e grupos:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoadingFiltros(false);
    }
  };

  const carregarEscolas = async () => {
    if (!filialId) return;
    
    setLoadingEscolas(true);
    try {
      const response = await FoodsApiService.getUnidadesEscolares({ 
        filial_id: filialId, 
        limit: 1000 
      });
      
      if (response.success && response.data) {
        const escolasData = Array.isArray(response.data) 
          ? response.data 
          : response.data.data;
        
        if (Array.isArray(escolasData)) {
          setEscolas(escolasData.map(e => ({ 
            value: e.id, 
            label: e.nome_escola 
          })));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      toast.error('Erro ao carregar escolas');
    } finally {
      setLoadingEscolas(false);
    }
  };

  const carregarProdutos = async () => {
    if (!grupoId) return;
    
    setLoadingProdutos(true);
    try {
      const response = await FoodsApiService.getProdutosOrigem({ grupo_id: grupoId, limit: 1000 });
      
      if (response.success && response.data) {
        const produtosData = Array.isArray(response.data) 
          ? response.data 
          : response.data.data;
        
        if (Array.isArray(produtosData)) {
          setProdutos(produtosData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoadingProdutos(false);
    }
  };

  const carregarProdutosPadrao = async () => {
    if (!editingItem || !editingItem.escola_id || !editingItem.grupo_id) return;
    
    setLoadingProdutos(true);
    try {
      const response = await NecessidadesPadroesService.buscarPorEscolaGrupo(
        editingItem.escola_id,
        editingItem.grupo_id
      );
      
      if (response.success && response.data) {
        const produtosFormatados = response.data.map(p => ({
          produto_id: p.produto_id,
          produto_nome: p.produto_nome,
          produto_codigo: p.produto_codigo,
          // Usar unidade_medida_sigla da tabela necessidades_padroes (não do produto origem)
          unidade_medida: p.unidade_medida_sigla || p.unidade_medida || '-',
          quantidade: p.quantidade,
          grupo_id: p.grupo_id || editingItem.grupo_id,
          grupo_nome: p.grupo_nome || editingItem.grupo_nome || 'Sem Grupo'
        }));
        setProdutosSelecionados(produtosFormatados);
        
        // Expandir todos os grupos por padrão
        const gruposUnicos = [...new Set(produtosFormatados.map(p => p.grupo_id || 'sem_grupo'))];
        setGruposExpandidos(new Set(gruposUnicos));
      }
    } catch (error) {
      console.error('Erro ao carregar produtos do padrão:', error);
      toast.error('Erro ao carregar produtos do padrão');
    } finally {
      setLoadingProdutos(false);
    }
  };

  const handleAdicionarProduto = async () => {
    if (!grupoId) {
      toast.error('Selecione um grupo de produtos primeiro');
      return;
    }

    // Se produtos não foram carregados ainda, carregar primeiro
    if (!produtos || produtos.length === 0) {
      setLoadingProdutos(true);
      try {
        const response = await FoodsApiService.getProdutosOrigem({ grupo_id: grupoId, limit: 1000 });
        
        if (response.success && response.data) {
          const produtosData = Array.isArray(response.data) 
            ? response.data 
            : response.data.data;
          
          if (Array.isArray(produtosData) && produtosData.length > 0) {
            setProdutos(produtosData);
            // Agora adicionar os produtos
            adicionarProdutos(produtosData);
          } else {
            toast.error('Nenhum produto encontrado para este grupo');
          }
        } else {
          toast.error('Erro ao carregar produtos');
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        toast.error('Erro ao carregar produtos');
      } finally {
        setLoadingProdutos(false);
      }
    } else {
      // Produtos já carregados, apenas adicionar
      adicionarProdutos(produtos);
    }
  };

  const adicionarProdutos = (produtosParaProcessar) => {
    if (!produtosParaProcessar || produtosParaProcessar.length === 0) {
      toast.error('Nenhum produto disponível para este grupo');
      return;
    }

    // Adicionar todos os produtos disponíveis que ainda não foram adicionados
    const produtosIdsSelecionados = produtosSelecionados.map(p => p.produto_id);
    const produtosParaAdicionar = produtosParaProcessar
      .filter(p => {
        const produtoId = p.id || p.produto_id;
        return produtoId && !produtosIdsSelecionados.includes(produtoId);
      })
      .map(p => ({
        produto_id: p.id || p.produto_id,
        produto_nome: p.nome || p.nome_produto || p.descricao || `Produto ${p.id || p.produto_id}`,
        produto_codigo: p.codigo || p.codigo_produto || '',
        unidade_medida: p.unidade_medida_sigla || p.unidade_medida || p.sigla || '',
        quantidade: 0,
        grupo_id: p.grupo_id || grupoId,
        grupo_nome: p.grupo_nome || grupos.find(g => g.id === grupoId)?.nome || 'Sem Grupo'
      }));
    
    if (produtosParaAdicionar.length === 0) {
      toast.info('Todos os produtos deste grupo já foram adicionados');
      return;
    }
    
    setProdutosSelecionados(prev => [...prev, ...produtosParaAdicionar]);
    
    // Expandir o grupo dos novos produtos
    const gruposNovosProdutos = [...new Set(produtosParaAdicionar.map(p => p.grupo_id || 'sem_grupo'))];
    setGruposExpandidos(prev => {
      const novoSet = new Set(prev);
      gruposNovosProdutos.forEach(grupoId => novoSet.add(grupoId));
      return novoSet;
    });
    
    toast.success(`${produtosParaAdicionar.length} produto(s) adicionado(s) com sucesso`);
    markDirty();
  };

  const handleRemoverProduto = (produtoId) => {
    setProdutosSelecionados(prev => prev.filter(p => p.produto_id !== produtoId));
    markDirty();
  };

  const handleQuantidadeChange = (produtoId, quantidade) => {
    setProdutosSelecionados(prev => 
      prev.map(p => 
        p.produto_id === produtoId 
          ? { ...p, quantidade: parseFloat(quantidade) || 0 }
          : p
      )
    );
    markDirty();
  };

  const handleSalvar = async () => {
    if (!escolaId) {
      toast.error('Selecione uma escola');
      return;
    }

    if (!grupoId) {
      toast.error('Selecione um grupo de produtos');
      return;
    }

    if (produtosSelecionados.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }

    // Validar se todos os produtos têm quantidade
    const produtosSemQuantidade = produtosSelecionados.filter(p => !p.quantidade || p.quantidade <= 0);
    if (produtosSemQuantidade.length > 0) {
      toast.error('Todos os produtos devem ter uma quantidade maior que zero');
      return;
    }

    setSaving(true);
    try {
      const dadosParaSalvar = produtosSelecionados.map(p => ({
        produto_id: p.produto_id,
        quantidade: p.quantidade
      }));

      const payload = {
        escola_id: escolaId,
        grupo_id: grupoId,
        produtos: dadosParaSalvar
      };

      let response;
      if (editingItem) {
        // Para edição, primeiro excluir os padrões antigos e criar novos
        // (o backend não tem endpoint de atualização em lote, então usamos salvarPadrao que substitui)
        response = await NecessidadesPadroesService.salvarPadrao(payload);
      } else {
        response = await NecessidadesPadroesService.salvarPadrao(payload);
      }

      if (response.success) {
        toast.success(editingItem ? 'Padrão atualizado com sucesso!' : 'Padrão criado com sucesso!');
        resetDirty();
        onSuccess();
        handleClose();
      } else {
        toast.error(response.message || 'Erro ao salvar padrão');
      }
    } catch (error) {
      console.error('Erro ao salvar padrão:', error);
      toast.error('Erro ao salvar padrão');
    } finally {
      setSaving(false);
    }
  };

  // Agrupar produtos por grupo
  const produtosAgrupados = useMemo(() => {
    const grupos = {};
    produtosSelecionados.forEach(produto => {
      const grupoKey = produto.grupo_id || 'sem_grupo';
      const grupoNome = produto.grupo_nome || 'Sem Grupo';
      
      if (!grupos[grupoKey]) {
        grupos[grupoKey] = {
          grupo_id: grupoKey,
          grupo_nome: grupoNome,
          produtos: []
        };
      }
      grupos[grupoKey].produtos.push(produto);
    });
    
    return Object.values(grupos).sort((a, b) => a.grupo_nome.localeCompare(b.grupo_nome));
  }, [produtosSelecionados]);

  // Calcular produtos visíveis (apenas dos grupos expandidos) com índice para paginação
  const produtosVisiveisComIndice = useMemo(() => {
    let indiceGlobal = 0;
    return produtosAgrupados
      .filter(grupo => gruposExpandidos.has(grupo.grupo_id))
      .flatMap(grupo => 
        grupo.produtos.map(produto => ({
          ...produto,
          indiceGlobal: indiceGlobal++
        }))
      );
  }, [produtosAgrupados, gruposExpandidos]);

  // Calcular produtos paginados (apenas dos grupos expandidos)
  const produtosPaginados = useMemo(() => {
    const startIndex = (paginationProdutos.currentPage - 1) * paginationProdutos.itemsPerPage;
    const endIndex = startIndex + paginationProdutos.itemsPerPage;
    return produtosVisiveisComIndice.slice(startIndex, endIndex);
  }, [produtosVisiveisComIndice, paginationProdutos.currentPage, paginationProdutos.itemsPerPage]);

  // Função para expandir/recolher grupo
  const toggleGrupo = (grupoId) => {
    setGruposExpandidos(prev => {
      const novoSet = new Set(prev);
      if (novoSet.has(grupoId)) {
        novoSet.delete(grupoId);
      } else {
        novoSet.add(grupoId);
      }
      return novoSet;
    });
  };

  // Expandir/recolher todos os grupos
  const expandirRecolherTodos = () => {
    if (gruposExpandidos.size === produtosAgrupados.length) {
      // Todos expandidos, recolher todos
      setGruposExpandidos(new Set());
    } else {
      // Expandir todos
      const todosGrupos = produtosAgrupados.map(g => g.grupo_id);
      setGruposExpandidos(new Set(todosGrupos));
    }
  };


  // Expandir todos os grupos quando produtos forem carregados pela primeira vez
  useEffect(() => {
    if (produtosAgrupados.length > 0 && gruposExpandidos.size === 0) {
      const todosGrupos = produtosAgrupados.map(g => g.grupo_id);
      setGruposExpandidos(new Set(todosGrupos));
    }
  }, [produtosAgrupados.length]);

  // Atualizar paginação quando produtos visíveis mudarem
  useEffect(() => {
    const totalItems = produtosVisiveisComIndice.length;
    const totalPages = Math.ceil(totalItems / paginationProdutos.itemsPerPage) || 1;
    
    setPaginationProdutos(prev => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage
    }));
  }, [produtosVisiveisComIndice, paginationProdutos.itemsPerPage]);

  const handlePageChange = (page) => {
    setPaginationProdutos(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setPaginationProdutos(prev => ({ 
      ...prev, 
      itemsPerPage, 
      currentPage: 1 
    }));
  };


  const handleClose = useCallback(() => {
    setFilialId(filialIdProp || '');
    setGrupoId(grupoIdProp || '');
    setEscolaId('');
    setProdutosSelecionados([]);
    setGruposExpandidos(new Set());
    setPaginationProdutos({
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 0
    });
    resetDirty();
    onClose();
  }, [onClose, resetDirty, filialIdProp, grupoIdProp]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => requestClose(handleClose)}
        title={
          viewMode 
            ? 'Visualizar Necessidade Padrão' 
            : editingItem 
            ? 'Editar Necessidade Padrão' 
            : 'Criar Necessidade Padrão'
        }
        size="full"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSalvar(); }} className="space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Primeira Linha - 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Informações Principais */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Informações Principais
              </h3>
              <div className="space-y-3">
                {/* Seleção de Filial (apenas ao criar, não em visualização) */}
                {!editingItem && !viewMode ? (
                  <SearchableSelect
                    label="Filial"
                    value={filialId}
                    onChange={(value) => {
                      setFilialId(value);
                      setEscolaId('');
                      setProdutosSelecionados([]);
                      markDirty();
                    }}
                    options={filiais}
                    placeholder="Selecione uma filial..."
                    loading={loadingFiltros}
                    required
                    usePortal={false}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filial
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                      {escolaInfo?.filial_nome || editingItem?.filial_nome || 'Carregando...'}
                    </div>
                  </div>
                )}

                {/* Seleção de Grupo (apenas ao criar, não em visualização) */}
                {!editingItem && !viewMode ? (
                  <SearchableSelect
                    label="Grupo de Produtos"
                    value={grupoId}
                    onChange={(value) => {
                      setGrupoId(value);
                      setProdutosSelecionados([]);
                      markDirty();
                    }}
                    options={grupos}
                    placeholder="Selecione um grupo..."
                    loading={loadingFiltros}
                    required
                    usePortal={false}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grupo de Produtos
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                      {editingItem?.grupo_nome || 'N/A'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Escola */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Escola
              </h3>
              <div className="space-y-3">
                <SearchableSelect
                  label="Escola"
                  value={escolaId}
                  onChange={(value) => {
                    setEscolaId(value);
                    if (!editingItem) {
                      setProdutosSelecionados([]);
                    }
                    markDirty();
                  }}
                  options={escolas}
                  placeholder={filialId ? "Selecione uma escola..." : "Selecione uma filial primeiro"}
                  loading={loadingEscolas}
                  disabled={!filialId || !!editingItem || viewMode}
                  required
                  usePortal={false}
                />
              </div>
            </div>
          </div>

          {/* Segunda Linha - 1 Card */}
          <div className="grid grid-cols-1 gap-4">
            {/* Card 3: Produtos */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-green-500">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Produtos
                  </h3>
                  {produtosAgrupados.length > 0 && (
                    <button
                      type="button"
                      onClick={expandirRecolherTodos}
                      className="text-xs text-green-600 hover:text-green-800 font-medium"
                    >
                      {gruposExpandidos.size === produtosAgrupados.length ? 'Recolher Todos' : 'Expandir Todos'}
                    </button>
                  )}
                </div>
                {/* Botão para adicionar produtos (apenas ao criar, não em visualização) */}
                {!editingItem && !viewMode && (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAdicionarProduto();
                    }}
                    color="green"
                    icon={<FaPlus />}
                    disabled={!escolaId || !grupoId || loadingProdutos}
                    size="sm"
                  >
                    Adicionar Produtos do Grupo
                  </Button>
                )}
              </div>

              {/* Tabela de produtos */}
          {loadingProdutos ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando produtos...</p>
            </div>
          ) : produtosSelecionados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum produto adicionado. Clique em "Adicionar Produtos do Grupo" para começar.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unidade</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                      {!viewMode && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {produtosAgrupados.map((grupo) => {
                      const isExpanded = gruposExpandidos.has(grupo.grupo_id);
                      return (
                        <React.Fragment key={grupo.grupo_id}>
                          {/* Linha do grupo */}
                          <tr className="bg-green-50 hover:bg-green-100 border-t-2 border-green-300">
                            <td colSpan={viewMode ? 4 : 5} className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => toggleGrupo(grupo.grupo_id)}
                                className="flex items-center gap-2 w-full text-left font-semibold text-gray-900 hover:text-green-700"
                              >
                                {isExpanded ? (
                                  <FaChevronDown className="w-4 h-4 text-green-600" />
                                ) : (
                                  <FaChevronRight className="w-4 h-4 text-green-600" />
                                )}
                                <span>{grupo.grupo_nome}</span>
                                <span className="text-xs font-normal text-gray-600 ml-2">
                                  ({grupo.produtos.length} {grupo.produtos.length === 1 ? 'produto' : 'produtos'})
                                </span>
                              </button>
                            </td>
                          </tr>
                          {/* Produtos do grupo (apenas se expandido e na página atual) */}
                          {isExpanded && grupo.produtos.map((produto) => {
                            // Verificar se o produto está na página atual usando o índice global
                            const produtoComIndice = produtosVisiveisComIndice.find(p => p.produto_id === produto.produto_id);
                            if (!produtoComIndice) return null;
                            
                            const startIndex = (paginationProdutos.currentPage - 1) * paginationProdutos.itemsPerPage;
                            const endIndex = startIndex + paginationProdutos.itemsPerPage;
                            const estaNaPagina = produtoComIndice.indiceGlobal >= startIndex && produtoComIndice.indiceGlobal < endIndex;
                            
                            if (!estaNaPagina) return null;
                            
                            return (
                              <tr key={produto.produto_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 pl-8 text-sm font-medium text-gray-900">
                                  {produto.produto_nome}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {produto.produto_codigo}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-gray-500">
                                  {produto.unidade_medida || '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {viewMode ? (
                                    <div className="text-sm font-medium text-gray-900">
                                      {produto.quantidade ? parseFloat(produto.quantidade).toFixed(3).replace('.', ',') : '0,000'}
                                    </div>
                                  ) : (
                                    <Input
                                      type="number"
                                      step="0.001"
                                      min="0"
                                      value={produto.quantidade || 0}
                                      onChange={(e) => handleQuantidadeChange(produto.produto_id, e.target.value)}
                                      className="w-24 text-center"
                                      disabled={viewMode}
                                    />
                                  )}
                                </td>
                                {!viewMode && (
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => handleRemoverProduto(produto.produto_id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <FaTrash />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginação da tabela de produtos */}
              {paginationProdutos.totalPages > 0 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={paginationProdutos.currentPage}
                    totalPages={paginationProdutos.totalPages}
                    onPageChange={handlePageChange}
                    totalItems={paginationProdutos.totalItems}
                    itemsPerPage={paginationProdutos.itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </>
          )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {viewMode ? (
              <Button
                variant="primary"
                onClick={handleClose}
              >
                Fechar
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => requestClose(handleClose)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving || produtosSelecionados.length === 0 || !escolaId}
                  icon={<FaSave />}
                >
                  {saving ? 'Salvando...' : editingItem ? 'Atualizar' : 'Criar'}
                </Button>
              </>
            )}
          </div>
        </form>
      </Modal>
      <ConfirmModal
        isOpen={showConfirm}
        onClose={cancelClose}
        onConfirm={confirmClose}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Descartar"
        cancelText="Continuar editando"
        variant="danger"
      />
    </>
  );
};

export default CriarPedidoPadraoModal;

