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
    console.log('📊 updatePagination chamado');
    console.log('📋 Dados recebidos:', paginationData);
    console.log('📄 Página atual antes da atualização:', currentPage);
    
    if (paginationData) {
      const newPage = paginationData.currentPage || 1;
      console.log('📄 Nova página a ser definida:', newPage);
      
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
      setCurrentPage(newPage);
      
      console.log('✅ Paginação atualizada');
    }
  }, [currentPage]);

  /**
   * Muda para uma página específica
   */
  const handlePageChange = useCallback((page) => {
    console.log('🔄 handlePageChange chamado');
    console.log('📄 Página atual:', currentPage);
    console.log('📄 Nova página:', page);
    setCurrentPage(page);
  }, [currentPage]);

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
    console.log('⚠️ resetPagination chamado - RESETANDO PARA PÁGINA 1!');
    console.log('📄 Página atual antes do reset:', currentPage);
    setCurrentPage(1);
  }, [currentPage]);

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
