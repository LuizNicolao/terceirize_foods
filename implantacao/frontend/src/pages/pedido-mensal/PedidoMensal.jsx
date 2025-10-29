import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaPlus, FaSave, FaEye } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useNecessidadesPadroes } from '../../hooks/useNecessidadesPadroes';
import {
  PedidoMensalTable,
  AdicionarProdutoModal,
  PedidoMensalFilters
} from '../../components/necessidades-padroes';
import { Button, Modal } from '../../components/ui';
import toast from 'react-hot-toast';

const PedidoMensal = () => {
  const { canView, canCreate, loading: permissionsLoading } = usePermissions();
  const [showAdicionarModal, setShowAdicionarModal] = useState(false);
  const [showVisualizarModal, setShowVisualizarModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hook para gerenciar padrões
  const {
    padroes,
    loading: loadingPadroes,
    error,
    filtros,
    atualizarFiltros,
    limparFiltros,
    buscarPorEscolaGrupo,
    salvarPadrao
  } = useNecessidadesPadroes();

  // Verificar permissões específicas
  const canViewPedidoMensal = canView('necessidades_padroes');
  const canCreatePedidoMensal = canCreate('necessidades_padroes');

  // Carregar padrões existentes quando filtros mudarem
  useEffect(() => {
    if (filtros.escola_id && filtros.grupo_id) {
      carregarPadroesExistentes();
    } else {
      setProdutos([]);
    }
  }, [filtros.escola_id, filtros.grupo_id]);

  const carregarPadroesExistentes = async () => {
    if (!filtros.escola_id || !filtros.grupo_id) return;

    setLoading(true);
    try {
      const padroesExistentes = await buscarPorEscolaGrupo(filtros.escola_id, filtros.grupo_id);
      
      // Converter padrões para formato da tabela
      const produtosFormatados = padroesExistentes.map(padrao => ({
        id: padrao.id,
        produto_id: padrao.produto_id,
        produto_nome: padrao.produto_nome,
        produto_codigo: padrao.produto_codigo,
        unidade_medida: padrao.unidade_medida,
        quantidade: padrao.quantidade
      }));

      setProdutos(produtosFormatados);
    } catch (error) {
      console.error('Erro ao carregar padrões existentes:', error);
      toast.error('Erro ao carregar padrões existentes');
    } finally {
      setLoading(false);
    }
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

  const handleVisualizarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setShowVisualizarModal(true);
  };

  const handleSalvarPadrao = async () => {
    if (!filtros.escola_id || !filtros.grupo_id) {
      toast.error('Selecione uma escola e um grupo');
      return;
    }

    if (produtos.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }

    // Validar se todas as quantidades foram preenchidas
    const produtosSemQuantidade = produtos.filter(produto => !produto.quantidade || produto.quantidade <= 0);
    if (produtosSemQuantidade.length > 0) {
      toast.error('Preencha a quantidade de todos os produtos');
      return;
    }

    const dados = {
      escola_id: parseInt(filtros.escola_id),
      grupo_id: parseInt(filtros.grupo_id),
      produtos: produtos.map(produto => ({
        produto_id: produto.produto_id,
        quantidade: parseFloat(produto.quantidade)
      }))
    };

    const resultado = await salvarPadrao(dados);
    
    if (resultado.success) {
      toast.success('Padrão salvo com sucesso!');
    }
  };

  // Verificar se pode visualizar
  if (permissionsLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!canViewPedidoMensal) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para visualizar o pedido mensal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <FaShoppingCart className="mr-2 sm:mr-3 text-green-600" />
            Pedido Mensal
          </h1>
          <p className="text-gray-600 mt-1">
            Defina padrões de produtos para pedidos mensais por escola e grupo
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowAdicionarModal(true)}
            disabled={!filtros.escola_id || !filtros.grupo_id || !canCreatePedidoMensal}
            className="flex items-center"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Adicionar Produtos
          </Button>
          <Button
            onClick={handleSalvarPadrao}
            disabled={produtos.length === 0 || loading}
            variant="primary"
            className="flex items-center"
          >
            <FaSave className="w-4 h-4 mr-2" />
            Salvar Padrão
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <PedidoMensalFilters
          filtros={filtros}
          onFilterChange={atualizarFiltros}
          onClearFilters={limparFiltros}
          loading={loading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabela de Produtos */}
      <div className="mb-6">
        <PedidoMensalTable
          produtos={produtos}
          onEdit={handleEditarProduto}
          onDelete={handleRemoverProduto}
          onView={handleVisualizarProduto}
          loading={loading}
        />
      </div>

      {/* Modal de Adicionar Produtos */}
      <AdicionarProdutoModal
        isOpen={showAdicionarModal}
        onClose={() => setShowAdicionarModal(false)}
        onAdicionarProdutos={handleAdicionarProdutos}
        grupoId={filtros.grupo_id}
        produtosJaAdicionados={produtos}
      />

      {/* Modal de Visualizar Produto */}
      <Modal
        isOpen={showVisualizarModal}
        onClose={() => setShowVisualizarModal(false)}
        title="Detalhes do Produto"
        size="md"
      >
        {produtoSelecionado && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <p className="mt-1 text-sm text-gray-900">{produtoSelecionado.produto_nome}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Código</label>
              <p className="mt-1 text-sm text-gray-900">{produtoSelecionado.produto_codigo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unidade</label>
              <p className="mt-1 text-sm text-gray-900">{produtoSelecionado.unidade_medida}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantidade</label>
              <p className="mt-1 text-sm text-gray-900">{produtoSelecionado.quantidade || '0'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PedidoMensal;
