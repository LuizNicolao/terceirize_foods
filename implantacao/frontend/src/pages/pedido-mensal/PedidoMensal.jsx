import React, { useState, useEffect, useCallback } from 'react';
import { FaShoppingCart, FaPlus, FaSave, FaFilter, FaCog } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useNecessidadesPadroes } from '../../hooks/useNecessidadesPadroes';
import {
  PedidoMensalTable,
  AdicionarProdutoModal,
  PedidoMensalTabs
} from '../../components/necessidades-padroes';
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
        if (response.success) {
          setEscolas(response.data.data.map(e => ({ 
            value: e.id, 
            label: e.nome_escola 
          })));
        } else {
          toast.error('Erro ao carregar escolas');
        }
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        toast.error('Erro ao carregar escolas');
      } finally {
        setLoadingFiltros(false);
      }
    };
    loadEscolas();
  }, [filtros.filial]);

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      // Carregar filiais
      const filiaisResponse = await FoodsApiService.getFiliais({ limit: 1000 });
      if (filiaisResponse.success) {
        setFiliais(filiaisResponse.data.data.map(f => ({ 
          value: f.id, 
          label: f.nome 
        })));
      }

      // Carregar grupos
      const gruposResponse = await FoodsApiService.getGruposProdutos({ limit: 1000 });
      if (gruposResponse.success) {
        setGrupos(gruposResponse.data.data.map(g => ({ 
          value: g.id, 
          label: g.nome 
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais');
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
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <FaShoppingCart className="mr-3" /> Pedido Mensal
        </h1>
        <p className="text-gray-600">
          Defina padrões de produtos para pedidos mensais por escola e grupo.
        </p>
      </div>

      {/* Tabs */}
      <PedidoMensalTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Conteúdo das Abas */}
      {activeTab === 'criar' && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
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
              >
                Incluir Produto
              </Button>
            </div>
          </div>

          {/* Tabela de Produtos */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Produtos do Padrão</h2>
            {loading ? (
              <div className="text-center py-4">Carregando produtos...</div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {podeIncluirProduto 
                  ? 'Nenhum produto adicionado. Clique em "Incluir Produto" para começar.' 
                  : 'Selecione a Filial, Escola e Grupo para adicionar produtos.'
                }
              </div>
            ) : (
              <PedidoMensalTable
                produtos={produtos}
                onRemove={handleRemoverProduto}
                onEditQuantity={handleEditarQuantidade}
              />
            )}
            {produtos.length > 0 && (
              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleSalvarPadrao}
                  color="blue"
                  icon={<FaSave />}
                  disabled={loading || !canCreatePedidoMensal}
                >
                  Salvar Padrão
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gerenciar' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Gerenciar Padrões Existentes
          </h2>
          <div className="text-center py-8 text-gray-500">
            <FaCog className="text-4xl mx-auto mb-4" />
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        </div>
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