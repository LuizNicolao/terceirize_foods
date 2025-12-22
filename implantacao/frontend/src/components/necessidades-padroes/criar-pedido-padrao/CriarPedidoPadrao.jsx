import React, { useState, useEffect, useCallback } from 'react';
import { ConfirmModal, Pagination } from '../../ui';
import { useCriarPedidoPadrao } from './hooks/useCriarPedidoPadrao';
import CriarPedidoPadraoTable from './components/CriarPedidoPadraoTable';
import CriarPedidoPadraoModal from './components/CriarPedidoPadraoModal';
import CriarPedidoPadraoStats from './components/CriarPedidoPadraoStats';
import CriarPedidoPadraoFilters from './components/CriarPedidoPadraoFilters';
import NecessidadesPadroesService from '../../../services/necessidadesPadroes';
import toast from 'react-hot-toast';

/**
 * Componente principal da tela Criar Pedido Padrão
 * Exibe necessidades padrão agrupadas por escola
 */
const CriarPedidoPadrao = ({ onCriarClick }) => {
  const {
    necessidadesAgrupadas,
    necessidadesPadroes,
    loading,
    loadingFiltros,
    loadingEscolas,
    filtros,
    filiais,
    grupos,
    escolas,
    pagination,
    handleFiltroChange,
    handlePageChange,
    handleItemsPerPageChange,
    handleRecarregar
  } = useCriarPedidoPadrao();

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCriar = useCallback(() => {
    setEditingItem(null);
    setViewMode(false);
    setShowModal(true);
  }, []);

  // Expor função para o componente pai (via callback)
  useEffect(() => {
    if (onCriarClick) {
      onCriarClick.current = handleCriar;
    }
  }, [onCriarClick, handleCriar]);

  const handleView = (grupo) => {
    // Pegar o primeiro produto do grupo para obter escola_id e grupo_id
    if (grupo.produtos && grupo.produtos.length > 0) {
      const primeiroProduto = grupo.produtos[0];
      setEditingItem({
        escola_id: grupo.escola_id,
        grupo_id: grupo.grupo_id,
        escola_nome: grupo.escola_nome,
        grupo_nome: grupo.grupo_nome
      });
      setViewMode(true);
      setShowModal(true);
    }
  };

  const handleEdit = (grupo) => {
    // Pegar o primeiro produto do grupo para obter escola_id e grupo_id
    if (grupo.produtos && grupo.produtos.length > 0) {
      const primeiroProduto = grupo.produtos[0];
      setEditingItem({
        escola_id: grupo.escola_id,
        grupo_id: grupo.grupo_id,
        escola_nome: grupo.escola_nome,
        grupo_nome: grupo.grupo_nome
      });
      setViewMode(false);
      setShowModal(true);
    }
  };

  const handleDelete = (grupo) => {
    setDeletingItem(grupo);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      // Excluir todos os produtos do padrão (marcar como inativo)
      // Como não temos endpoint para excluir em lote, vamos excluir um por um
      const produtosIds = deletingItem.produtos.map(p => p.id);
      
      let sucesso = 0;
      let erros = 0;

      for (const id of produtosIds) {
        try {
          const response = await NecessidadesPadroesService.excluir(id);
          if (response.success) {
            sucesso++;
          } else {
            erros++;
          }
        } catch (error) {
          erros++;
        }
      }

      if (sucesso > 0) {
        toast.success(`${sucesso} produto(s) excluído(s) com sucesso`);
        if (erros > 0) {
          toast.error(`${erros} produto(s) não puderam ser excluídos`);
        }
        handleRecarregar();
      } else {
        toast.error('Erro ao excluir padrão');
      }
    } catch (error) {
      console.error('Erro ao excluir padrão:', error);
      toast.error('Erro ao excluir padrão');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingItem(null);
    }
  };

  const handleModalSuccess = () => {
    handleRecarregar();
  };

  const handleLimparFiltros = () => {
    handleFiltroChange('filial_id', '');
    handleFiltroChange('escola_id', '');
    handleFiltroChange('grupo_id', '');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cards de Estatísticas */}
      <CriarPedidoPadraoStats
        necessidadesAgrupadas={necessidadesAgrupadas}
        necessidadesPadroes={necessidadesPadroes}
      />

      {/* Filtros */}
      <CriarPedidoPadraoFilters
        filtros={filtros}
        filiais={filiais}
        grupos={grupos}
        escolas={escolas}
        loading={loadingFiltros}
        loadingEscolas={loadingEscolas}
        onFiltroChange={handleFiltroChange}
        onLimparFiltros={handleLimparFiltros}
      />

      {/* Tabela */}
      <CriarPedidoPadraoTable
        necessidadesAgrupadas={necessidadesAgrupadas}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        canView={true}
        canEdit={true}
        canDelete={true}
      />

      {/* Paginação */}
      {pagination.totalPages > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}

      {/* Modal de criar/editar/visualizar */}
      <CriarPedidoPadraoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
          setViewMode(false);
        }}
        onSuccess={handleModalSuccess}
        editingItem={editingItem}
        viewMode={viewMode}
        filialId={editingItem ? undefined : filtros.filial_id}
        grupoId={editingItem ? undefined : filtros.grupo_id}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingItem(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Necessidade Padrão"
        message={
          deletingItem
            ? `Tem certeza que deseja excluir o padrão da escola "${deletingItem.escola_nome}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default CriarPedidoPadrao;

