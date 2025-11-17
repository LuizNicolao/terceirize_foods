import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import necessidadesService from '../../services/necessidadesService';

/**
 * Hook para gerenciar exclusão de necessidades/produtos
 */
export const useExclusaoNecessidade = (handleCarregarNecessidades) => {
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState(null);

  const handleExcluirNecessidade = useCallback((necessidade) => {
    setProdutoToDelete(necessidade);
    setShowDeleteConfirmModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!produtoToDelete) return;

    try {
      const response = await necessidadesService.deletarProdutoAjuste(produtoToDelete.id);
      
      if (response.success) {
        toast.success('Produto excluído com sucesso!');
        setShowDeleteConfirmModal(false);
        setProdutoToDelete(null);
        handleCarregarNecessidades();
      } else {
        toast.error(response.message || 'Erro ao excluir produto');
      }
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  }, [produtoToDelete, handleCarregarNecessidades]);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setProdutoToDelete(null);
  }, []);

  return {
    showDeleteConfirmModal,
    produtoToDelete,
    handleExcluirNecessidade,
    handleConfirmDelete,
    handleCloseDeleteModal
  };
};

