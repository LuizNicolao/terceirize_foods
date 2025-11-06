import React, { useState, useEffect, useCallback } from 'react';
import { FaShoppingCart, FaPlus, FaSave, FaFilter, FaCog } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useNecessidadesPadroes } from '../../hooks/necessidades';
import {
  PedidoMensalTable,
  AdicionarProdutoModal,
  PedidoMensalTabs
} from '../../components/necessidades-padroes';
import GerarNecessidadePadrao from '../../components/necessidades-padroes/GerarNecessidadePadrao';
import { Button, SearchableSelect } from '../../components/ui';
import FoodsApiService from '../../services/FoodsApiService';
import NecessidadesPadroesService from '../../services/necessidadesPadroes';
import toast from 'react-hot-toast';

const PedidoMensal = () => {
  const { canView, canCreate, loading: permissionsLoading } = usePermissions();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('criar');
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    filial: '',
    escola: '',
    grupo: ''
  });
  
  // Estados para dados
  const [filiais, setFiliais] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  
  // Estados para UI
  const [showAdicionarModal, setShowAdicionarModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFiltros, setLoadingFiltros] = useState(false);

  // Hook para gerenciar padrões
  const {
    salvarPadrao,
    buscarPorEscolaGrupo
  } = useNecessidadesPadroes();

  // Verificar permissões específicas
  const canViewPedidoMensal = canView('necessidades_padroes');
  const canCreatePedidoMensal = canCreate('necessidades_padroes');

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Carregar escolas quando filial mudar
  useEffect(() => {
    const loadEscolas = async () => {
      if (!filtros.filial) {
        setEscolas([]);
        setFiltros(prev => ({ ...prev, escola: '' }));
        return;
      }
      setLoadingFiltros(true);
      try {
        const response = await FoodsApiService.getUnidadesEscolares({ 
          filial_id: filtros.filial, 
          limit: 1000 
        });
        if (response.success && response.data) {
          // A resposta pode ter data direto ou data.data
          const escolasData = Array.isArray(response.data) 
            ? response.data 
            : response.data.data;
          
          if (Array.isArray(escolasData)) {
            setEscolas(escolasData.map(e => ({ 
              value: e.id, 
              label: e.nome_escola 
            })));
          } else {
            console.warn('Dados de escolas não são um array:', escolasData);
            setEscolas([]);
            toast.error('Erro ao carregar escolas');
          }
        } else {
          console.warn('Resposta de escolas inválida:', response);
          setEscolas([]);
          toast.error('Erro ao carregar escolas');
        }
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        toast.error('Erro ao carregar escolas');
        setEscolas([]);
      } finally {
        setLoadingFiltros(false);
      }
    };
    loadEscolas();
  }, [filtros.filial]);

  // Carregar produtos padrão existentes quando escola e grupo forem selecionados
  useEffect(() => {
    const carregarProdutosPadrao = async () => {
      if (filtros.escola && filtros.grupo) {
        setLoading(true);
        try {
          const produtosExistentes = await buscarPorEscolaGrupo(filtros.escola, filtros.grupo);
          if (produtosExistentes && produtosExistentes.length > 0) {
            setProdutos(produtosExistentes);
          } else {
            setProdutos([]);
          }
        } catch (error) {
          console.error('Erro ao carregar produtos padrão:', error);
          setProdutos([]);
        } finally {
          setLoading(false);
        }
      } else {
        setProdutos([]);
      }
    };
    
    carregarProdutosPadrao();
  }, [filtros.escola, filtros.grupo, buscarPorEscolaGrupo]);

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      // Carregar filiais
      const filiaisResponse = await FoodsApiService.getFiliais({ limit: 1000 });
      if (filiaisResponse.success && filiaisResponse.data) {
        // A resposta pode ter data direto ou data.data
        const filiaisData = Array.isArray(filiaisResponse.data) 
          ? filiaisResponse.data 
          : filiaisResponse.data.data;
        
        if (Array.isArray(filiaisData)) {
          setFiliais(filiaisData.map(f => ({ 
            value: f.id, 
            label: f.filial || f.nome || f.razao_social || `Filial ${f.id}`
          })));
        } else {
          console.warn('Dados de filiais não são um array:', filiaisData);
          setFiliais([]);
        }
      } else {
        console.warn('Resposta de filiais inválida:', filiaisResponse);
        setFiliais([]);
      }

      // Carregar grupos
      const gruposResponse = await FoodsApiService.getGrupos({ limit: 1000 });
      if (gruposResponse.success && gruposResponse.data) {
        // A resposta pode ter data direto ou data.data
        const gruposData = Array.isArray(gruposResponse.data) 
          ? gruposResponse.data 
          : gruposResponse.data.data;
        
        if (Array.isArray(gruposData)) {
          setGrupos(gruposData.map(g => ({ 
            value: g.id, 
            label: g.nome || g.descricao || `Grupo ${g.id}`
          })));
        } else {
          console.warn('Dados de grupos não são um array:', gruposData);
          setGrupos([]);
        }
      } else {
        console.warn('Resposta de grupos inválida:', gruposResponse);
        setGrupos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais');
      setFiliais([]);
      setGrupos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    
    // Limpar escola quando filial mudar
    if (name === 'filial') {
      setFiltros(prev => ({ ...prev, escola: '', grupo: '' }));
      setProdutos([]);
    }
    
    // Limpar grupo quando escola mudar
    if (name === 'escola') {
      setFiltros(prev => ({ ...prev, grupo: '' }));
      setProdutos([]);
    }
  };

  const handleAdicionarProdutos = (novosProdutos) => {
    const produtosExistentesIds = new Set(produtos.map(p => p.produto_id));
    const produtosParaAdicionar = novosProdutos.filter(np => 
      !produtosExistentesIds.has(np.produto_id)
    );
    
    if (produtosParaAdicionar.length > 0) {
      setProdutos(prev => [...prev, ...produtosParaAdicionar]);
      toast.success(`${produtosParaAdicionar.length} produto(s) adicionado(s)`);
    } else {
      toast.info('Nenhum produto novo para adicionar.');
    }
  };

  const handleRemoverProduto = (produtoId) => {
    setProdutos(prev => prev.filter(produto => produto.produto_id !== produtoId));
    toast.success('Produto removido');
  };

  const handleEditarQuantidade = (produtoId, quantidade) => {
    setProdutos(prev => prev.map(produto => 
      produto.produto_id === produtoId 
        ? { ...produto, quantidade: parseFloat(quantidade) }
        : produto
    ));
  };

  const handleSalvarPadrao = async () => {
    if (!filtros.filial || !filtros.escola || !filtros.grupo) {
      toast.error('Por favor, selecione a Filial, Escola e Grupo de Produtos.');
      return;
    }
    if (produtos.length === 0) {
      toast.error('Adicione pelo menos um produto para salvar o padrão.');
      return;
    }

    setLoading(true);
    try {
      const dadosParaSalvar = produtos.map(p => ({
        produto_id: p.produto_id,
        quantidade: p.quantidade
      }));

      const payload = {
        escola_id: filtros.escola,
        grupo_id: filtros.grupo,
        produtos: dadosParaSalvar
      };

      const response = await salvarPadrao(payload);
      if (response.success) {
        toast.success('Padrão salvo com sucesso!');
        setProdutos([]);
        setFiltros({ filial: '', escola: '', grupo: '' });
      } else {
        toast.error(response.message || 'Erro ao salvar padrão');
      }
    } catch (error) {
      console.error('Erro ao salvar padrão:', error);
      toast.error('Erro ao salvar padrão');
    } finally {
      setLoading(false);
    }
  };

  const podeIncluirProduto = filtros.escola && filtros.grupo;

  if (permissionsLoading) {
    return <div className="text-center py-8">Carregando permissões...</div>;
  }

  if (!canViewPedidoMensal) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FaShoppingCart className="text-5xl mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Acesso Restrito</h2>
        <p>Você não tem permissão para visualizar o pedido mensal.</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <FaShoppingCart className="mr-2 sm:mr-3 text-green-600" />
            Pedido Mensal
          </h1>
          <p className="text-gray-600 mt-1">
            Defina padrões de produtos para pedidos mensais por escola e grupo.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <PedidoMensalTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Conteúdo das Abas */}
      {activeTab === 'criar' && (
        <div className="space-y-4 md:space-y-6">
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaFilter className="mr-2" /> Filtros
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <SearchableSelect
                label="Filial"
                name="filial"
                options={filiais}
                value={filtros.filial}
                onChange={(value) => handleFilterChange('filial', value)}
                placeholder="Digite para buscar a filial..."
                loading={loadingFiltros}
                required
              />
              <SearchableSelect
                label="Escola"
                name="escola"
                options={escolas}
                value={filtros.escola}
                onChange={(value) => handleFilterChange('escola', value)}
                placeholder="Digite para buscar uma escola..."
                loading={loadingFiltros}
                disabled={!filtros.filial}
              />
              <SearchableSelect
                label="Grupo de Produtos"
                name="grupo"
                options={grupos}
                value={filtros.grupo}
                onChange={(value) => handleFilterChange('grupo', value)}
                placeholder="Digite para buscar um grupo..."
                loading={loadingFiltros}
                disabled={!filtros.escola}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowAdicionarModal(true)}
                color="green"
                icon={<FaPlus />}
                disabled={!podeIncluirProduto || loading}
                size="sm"
              >
                Incluir Produto
              </Button>
            </div>
          </div>

          {/* Tabela de Produtos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Produtos do Padrão</h2>
            {loading ? (
              <div className="text-center py-4">Carregando produtos...</div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaPlus className="text-4xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  {podeIncluirProduto 
                    ? 'Nenhum produto adicionado' 
                    : 'Selecione os filtros para começar'
                  }
                </p>
                <p className="text-sm">
                  {podeIncluirProduto 
                    ? 'Clique em "Incluir Produto" para adicionar produtos ao padrão.' 
                    : 'Selecione a Filial, Escola e Grupo para adicionar produtos.'
                  }
                </p>
              </div>
            ) : (
              <PedidoMensalTable
                produtos={produtos}
                onRemove={handleRemoverProduto}
                onEditQuantity={handleEditarQuantidade}
              />
            )}
            {produtos.length > 0 && (
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSalvarPadrao}
                  color="blue"
                  icon={<FaSave />}
                  disabled={loading || !canCreatePedidoMensal}
                  size="sm"
                >
                  Salvar Padrão
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gerenciar' && (
        <GerarNecessidadePadrao />
      )}

      {/* Modal de Adicionar Produto */}
      <AdicionarProdutoModal
        isOpen={showAdicionarModal}
        onClose={() => setShowAdicionarModal(false)}
        onAdicionarProdutos={handleAdicionarProdutos}
        grupoId={filtros.grupo}
        produtosJaAdicionados={produtos.map(p => p.produto_id)}
      />
    </div>
  );
};

export default PedidoMensal;