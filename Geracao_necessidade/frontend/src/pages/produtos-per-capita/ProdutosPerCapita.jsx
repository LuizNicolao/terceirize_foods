import React, { useState, useEffect } from 'react';
import { FaChartLine } from 'react-icons/fa';
import { useProdutosPerCapita } from '../../hooks/useProdutosPerCapita';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useModal } from '../../hooks/useModal';
import { useExportPDF } from '../../hooks/useExportPDF';
import { useProdutosPerCapitaFilters } from '../../hooks/useProdutosPerCapitaFilters';
import {
  ProdutoModal,
  ProdutosPerCapitaLayout,
  ProdutosPerCapitaStats,
  ProdutosPerCapitaFilters,
  ProdutosPerCapitaTable,
  ProdutosPerCapitaActions,
  ProdutosPerCapitaLoading
} from '../../components/produtos-per-capita';
import toast from 'react-hot-toast';

/**
 * Página principal de Produtos Per Capita
 * Refatorada seguindo o padrão de excelência do Dashboard
 */
const ProdutosPerCapita = () => {
  const { canView, canCreate, canEdit, canDelete, loading: permissionsLoading } = usePermissions();
  
  // Hook principal para produtos
  const {
    produtos,
    loading,
    error,
    pagination,
    produtosDisponiveis,
    loadingProdutosDisponiveis,
    carregarProdutos,
    criarProduto,
    atualizarProduto,
    deletarProduto,
    carregarProdutosDisponiveis,
    carregarTodosProdutos,
    exportarXLSX
  } = useProdutosPerCapita();

  // Hook para filtros
  const {
    filtros,
    updateFiltros,
    clearFiltros,
    setPage,
    setLimit
  } = useProdutosPerCapitaFilters();

  // Hook para exportação PDF
  const { exportarProdutosPDF } = useExportPDF();

  // Hook para gerenciamento do modal
  const {
    showModal: isProdutoModalOpen,
    viewMode: isViewMode,
    editingItem: selectedProduto,
    handleAdd: handleAddProduto,
    handleView: handleViewProduto,
    handleEdit: handleEditProduto,
    handleCloseModal: handleCloseProdutoModal
  } = useModal();


  // Verificar permissões
  const canViewProdutos = canView('produtos-per-capita');
  const canCreateProdutos = canCreate('produtos-per-capita');
  const canEditProdutos = canEdit('produtos-per-capita');
  const canDeleteProdutos = canDelete('produtos-per-capita');

  useEffect(() => {
    if (!permissionsLoading && canViewProdutos) {
      carregarProdutos(filtros);
    }
  }, [permissionsLoading, canViewProdutos, carregarProdutos, filtros]);

  /**
   * Handler para adicionar produto
   */
  const handleAddProdutoWrapper = async () => {
    if (!canCreateProdutos) {
      toast.error('Você não tem permissão para criar produtos');
      return;
    }
    
    try {
      // Para criar novo, carregar todos os produtos (permitir duplicação se necessário)
      await carregarTodosProdutos();
      handleAddProduto();
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  /**
   * Handler para visualizar produto
   */
  const handleViewProdutoWrapper = async (produto) => {
    try {
      // Para visualizar, carregar todos os produtos (incluindo o atual)
      await carregarTodosProdutos();
      handleViewProduto(produto);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  /**
   * Handler para editar produto
   */
  const handleEditProdutoWrapper = async (produto) => {
    if (!canEditProdutos) {
      toast.error('Você não tem permissão para editar produtos');
      return;
    }
    
    try {
      // Para editar, carregar todos os produtos (incluindo o atual)
      await carregarTodosProdutos();
      handleEditProduto(produto);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  /**
   * Handler para deletar produto
   */
  const handleDeleteProduto = async (produto) => {
    if (!canDeleteProdutos) {
      toast.error('Você não tem permissão para excluir produtos');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o produto "${produto.nome_produto}"?`)) {
      const result = await deletarProduto(produto.id);
      if (!result.success) {
        toast.error(result.error || 'Erro ao excluir produto');
      }
    }
  };

  /**
   * Handler para salvar produto (criar ou atualizar)
   */
  const handleSaveProduto = async (dados) => {
    try {
      let result;
      if (selectedProduto) {
        result = await atualizarProduto(selectedProduto.id, dados);
      } else {
        result = await criarProduto(dados);
      }

      if (result.success) {
        handleCloseProdutoModal();
      } else {
        toast.error(result.error || 'Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  /**
   * Handler para exportar produtos em PDF
   */
  const handleExportPDF = () => {
    try {
      const result = exportarProdutosPDF(produtos, filtros);
      if (!result.success) {
        toast.error(result.error || 'Erro ao gerar PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  /**
   * Handler para exportar produtos em XLSX
   */
  const handleExportXLSX = () => {
    try {
      exportarXLSX();
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar XLSX');
    }
  };

  /**
   * Handler para fechar modal com cleanup
   */
  const handleCloseModalWithCleanup = () => {
    handleCloseProdutoModal();
  };

  // Verificar se pode visualizar
  if (permissionsLoading) {
    return <ProdutosPerCapitaLoading />;
  }

  if (!canViewProdutos) {
    return (
      <ProdutosPerCapitaLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaChartLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para visualizar os produtos per capita.
          </p>
        </div>
      </ProdutosPerCapitaLayout>
    );
  }

  return (
    <ProdutosPerCapitaLayout
      actions={
        <ProdutosPerCapitaActions
          canCreate={canCreateProdutos}
          onAdd={handleAddProdutoWrapper}
          onExportPDF={handleExportPDF}
          onExportXLSX={handleExportXLSX}
          loading={loading}
        />
      }
    >
      {/* Estatísticas */}
      <ProdutosPerCapitaStats pagination={pagination} />

      {/* Filtros */}
      <ProdutosPerCapitaFilters
        filtros={filtros}
        onFilterChange={updateFiltros}
        onClearFilters={clearFiltros}
        loading={loading}
      />

      {/* Tabela */}
      <ProdutosPerCapitaTable
        produtos={produtos}
        loading={loading}
        pagination={pagination}
        canView={canViewProdutos}
        canEdit={canEditProdutos}
        canDelete={canDeleteProdutos}
        onView={handleViewProdutoWrapper}
        onEdit={handleEditProdutoWrapper}
        onDelete={handleDeleteProduto}
        onAdd={handleAddProdutoWrapper}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Modal de Produto */}
      <ProdutoModal
        isOpen={isProdutoModalOpen}
        onClose={handleCloseModalWithCleanup}
        produto={selectedProduto}
        onSave={handleSaveProduto}
        loading={loadingProdutosDisponiveis}
        isViewMode={isViewMode}
        produtosDisponiveis={produtosDisponiveis}
      />
    </ProdutosPerCapitaLayout>
  );
};

export default ProdutosPerCapita;
