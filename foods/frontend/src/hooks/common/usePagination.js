/**
 * Hook base para paginação
 * Gerencia estado e lógica de paginação de forma reutilizável
 */

import { useState, useCallback } from 'react';

export const usePagination = (initialItemsPerPage = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  /**
   * Atualiza informações de paginação
   */
  const updatePagination = useCallback((paginationData) => {
    
    if (paginationData) {
      // A API retorna 'page' não 'currentPage'
      const newPage = paginationData.page || paginationData.currentPage || 1;
      
      setTotalPages(paginationData.pages || paginationData.totalPages || 1);
      setTotalItems(paginationData.total || paginationData.totalItems || 0);
      setCurrentPage(newPage);
      
    }
  }, []);

  /**
   * Muda para uma página específica
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  /**
   * Muda a quantidade de itens por página
   */
  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset para primeira página
  }, []);

  /**
   * Reseta paginação para primeira página
   */
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  /**
   * Calcula parâmetros de paginação para API
   */
  const getPaginationParams = useCallback(() => {
    return {
      page: currentPage,
      limit: itemsPerPage
    };
  }, [currentPage, itemsPerPage]);

  return {
    // Estados
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    
    // Ações
    updatePagination,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
    getPaginationParams,
    
    // Setters diretos (para casos específicos)
    setCurrentPage,
    setTotalPages,
    setTotalItems,
    setItemsPerPage
  };
};
