import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaPlus, FaSave, FaFilter } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useNecessidadesPadroes } from '../../hooks/useNecessidadesPadroes';
import {
  PedidoMensalTable,
  AdicionarProdutoModal
} from '../../components/necessidades-padroes';
import { Button, Modal, Input } from '../../components/ui';
import FoodsApiService from '../../services/FoodsApiService';
import NecessidadesPadroesService from '../../services/necessidadesPadroes';
import toast from 'react-hot-toast';

const PedidoMensal = () => {
  const { canView, canCreate, loading: permissionsLoading } = usePermissions();
  
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
    salvarPadrao
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
    if (filtros.filial) {
      carregarEscolasPorFilial(filtros.filial);
    } else {
      setEscolas([]);
      setFiltros(prev => ({ ...prev, escola: '' }));
    }
  }, [filtros.filial]);

  // Carregar produtos quando escola e grupo mudarem
  useEffect(() => {
    if (filtros.escola && filtros.grupo) {
      carregarProdutosExistentes();
    } else {
      setProdutos([]);
    }
  }, [filtros.escola, filtros.grupo]);

  const carregarDadosIniciais = async () => {
    setLoadingFiltros(true);
    try {
      // Carregar filiais
      const filiaisResponse = await FoodsApiService.getFiliais();
      if (filiaisResponse.success) {
        setFiliais(filiaisResponse.data || []);
      }

      // Carregar grupos
      const gruposResponse = await FoodsApiService.getGruposProdutos();
      if (gruposResponse.success) {
        setGrupos(gruposResponse.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setLoadingFiltros(false);
    }
  };

  const carregarEscolasPorFilial = async (filialId) => {
    try {
      const response = await FoodsApiService.getUnidadesEscolares({ 
        filial_id: filialId,
        limit: 1000 
      });
      if (response.success) {
        setEscolas(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      toast.error('Erro ao carregar escolas');
    }
  };

  const carregarProdutosExistentes = async () => {
    if (!filtros.escola || !filtros.grupo) return;

    setLoading(true);
    try {
      const response = await NecessidadesPadroesService.buscarPorEscolaGrupo(filtros.escola, filtros.grupo);
      if (response.success) {
        setProdutos(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos existentes:', error);
      toast.error('Erro ao carregar produtos existentes');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => {
      const novosFiltros = { ...prev, [campo]: valor };
      
      // Limpar dependências quando necessário
      if (campo === 'filial') {
        novosFiltros.escola = '';
        novosFiltros.grupo = '';
      } else if (campo === 'escola') {
        novosFiltros.grupo = '';
      }
      
      return novosFiltros;
    });
  };

  const handleAdicionarProdutos = (novosProdutos) => {
    setProdutos(prev => [...prev, ...novosProdutos]);
    toast.success(`${novosProdutos.length} produto(s) adicionado(s)`);
  };

  const handleEditarProduto = (produtoId, campo, valor) => {
    setProdutos(prev => prev.map(produto => 
      produto.id === produtoId 
        ? { ...produto, [campo]: valor }
        : produto
    ));
  };

  const handleRemoverProduto = (produtoId) => {
    setProdutos(prev => prev.filter(produto => produto.id !== produtoId));
    toast.success('Produto removido');
  };

  const handleSalvarPadrao = async () => {
    if (!filtros.escola || !filtros.grupo) {
      toast.error('Selecione uma escola e um grupo');
      return;
    }

    if (produtos.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }

    setLoading(true);
    try {
      const dadosPadrao = {
        escola_id: filtros.escola,
        grupo_id: filtros.grupo,
        produtos: produtos.map(produto => ({
          produto_id: produto.produto_id,
          quantidade: produto.quantidade || 0
        }))
      };

      const response = await NecessidadesPadroesService.salvarPadrao(dadosPadrao);
      
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

  const handleLimparFiltros = () => {
    setFiltros({ filial: '', escola: '', grupo: '' });
    setProdutos([]);
  };

  const podeIncluirProdutos = filtros.escola && filtros.grupo;

  if (permissionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!canViewPedidoMensal) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FaShoppingCart className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p>Você não tem permissão para visualizar o pedido mensal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-2">
          <FaShoppingCart className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Pedido Mensal</h1>
        </div>
        <p className="text-gray-600">Defina padrões de produtos para pedidos mensais por escola e grupo</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaFilter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filial *
            </label>
            <select
              value={filtros.filial}
              onChange={(e) => handleFiltroChange('filial', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingFiltros}
            >
              <option value="">Digite para buscar a filial...</option>
              {filiais.map(filial => (
                <option key={filial.id} value={filial.id}>
                  {filial.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Escola */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escola
            </label>
            <select
              value={filtros.escola}
              onChange={(e) => handleFiltroChange('escola', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!filtros.filial || loadingFiltros}
            >
              <option value="">Digite para buscar uma escola...</option>
              {escolas.map(escola => (
                <option key={escola.id} value={escola.id}>
                  {escola.nome_escola}
                </option>
              ))}
            </select>
          </div>

          {/* Grupo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grupo de Produtos *
            </label>
            <select
              value={filtros.grupo}
              onChange={(e) => handleFiltroChange('grupo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingFiltros}
            >
              <option value="">Digite para buscar um grupo...</option>
              {grupos.map(grupo => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <Button
            variant="outline"
            onClick={handleLimparFiltros}
            disabled={loadingFiltros}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Botão Incluir Produto */}
      {podeIncluirProdutos && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAdicionarModal(true)}
            disabled={!canCreatePedidoMensal}
            className="flex items-center space-x-2"
          >
            <FaPlus className="h-4 w-4" />
            <span>Incluir Produto</span>
          </Button>
        </div>
      )}

      {/* Tabela de Produtos */}
      {podeIncluirProdutos && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Produtos do Padrão
            </h3>
            
            {produtos.length > 0 ? (
              <PedidoMensalTable
                produtos={produtos}
                onEditar={handleEditarProduto}
                onRemover={handleRemoverProduto}
                loading={loading}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum produto adicionado ainda</p>
                <p className="text-sm">Clique em "Incluir Produto" para começar</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botão Salvar */}
      {podeIncluirProdutos && (
        <div className="flex justify-end">
          <Button
            onClick={handleSalvarPadrao}
            disabled={!canCreatePedidoMensal || produtos.length === 0 || loading}
            className="flex items-center space-x-2"
          >
            <FaSave className="h-4 w-4" />
            <span>Salvar Padrão</span>
          </Button>
        </div>
      )}

      {/* Modal Adicionar Produto */}
      <AdicionarProdutoModal
        isOpen={showAdicionarModal}
        onClose={() => setShowAdicionarModal(false)}
        onAdicionarProdutos={handleAdicionarProdutos}
        grupoId={filtros.grupo}
        produtosJaAdicionados={produtos}
      />
    </div>
  );
};

export default PedidoMensal;