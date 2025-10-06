/**
 * Hook base para gerenciamento de modais
 * Gerencia estado e lógica de modais de forma reutilizável
 */

import { useState, useCallback } from 'react';

export const useModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  /**
   * Abre modal para adicionar novo item
   */
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setViewMode(false);
    setShowModal(true);
  }, []);

  /**
   * Abre modal para visualizar item
   */
  const handleView = useCallback((item) => {
    setEditingItem(item);
    setViewMode(true);
    setShowModal(true);
  }, []);

  /**
   * Abre modal para editar item
   */
  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setViewMode(false);
    setShowModal(true);
  }, []);

  /**
   * Fecha modal e limpa estado
   */
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setViewMode(false);
    setEditingItem(null);
  }, []);

  /**
   * Fecha modal sem limpar item (útil para validações)
   */
  const handleCloseModalOnly = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    // Estados
    showModal,
    viewMode,
    editingItem,
    
    // Ações
    handleAdd,
    handleView,
    handleEdit,
    handleCloseModal,
    handleCloseModalOnly,
    
    // Setters diretos (para casos específicos)
    setShowModal,
    setViewMode,
    setEditingItem
  };
};
