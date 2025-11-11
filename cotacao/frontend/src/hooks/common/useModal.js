import { useState, useCallback } from 'react';

/**
 * Hook reutilizável para controlar modais (visualização, edição, criação)
 */
export const useModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setViewMode(false);
    setShowModal(true);
  }, []);

  const handleView = useCallback((item) => {
    setEditingItem(item);
    setViewMode(true);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setViewMode(false);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setViewMode(false);
    setEditingItem(null);
  }, []);

  return {
    showModal,
    viewMode,
    editingItem,
    handleAdd,
    handleView,
    handleEdit,
    handleCloseModal,
    setShowModal,
    setViewMode,
    setEditingItem
  };
};

