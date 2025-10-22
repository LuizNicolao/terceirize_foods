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
    console.log('🔍 PAGINATION UPDATE:', {
      paginationData,
      hasData: !!paginationData,
      totalPages: paginationData?.totalPages,
      totalItems: paginationData?.totalItems,
      page: paginationData?.page,
      currentPage: paginationData?.currentPage
    });
    
    if (paginationData) {
      // A API retorna 'page' não 'currentPage'
      const newPage = paginationData.page || paginationData.currentPage || 1;
      
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
      setCurrentPage(newPage);
      
      console.log('🔍 PAGINATION SET:', {
        newPage,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.totalItems || 0
      });
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
