/**
 * Hook compartilhado para gerenciar paginação
 * Centraliza lógica de paginação reutilizável
 */

import { useState, useEffect } from 'react';

export const usePagination = (initialPage = 1, initialItemsPerPage = 20) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calcular informações de paginação
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Função para mudar página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Função para mudar itens por página
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset para primeira página
  };

  // Função para ir para próxima página
  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Função para ir para página anterior
  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Função para ir para primeira página
  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  // Função para ir para última página
  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  // Função para atualizar dados de paginação
  const updatePagination = (paginationData) => {
    if (paginationData) {
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
      setCurrentPage(paginationData.currentPage || 1);
    }
  };

  // Função para resetar paginação
  const resetPagination = () => {
    setCurrentPage(1);
    setTotalPages(1);
    setTotalItems(0);
  };

  // Função para obter parâmetros de paginação para API
  const getPaginationParams = () => ({
    page: currentPage,
    limit: itemsPerPage,
    offset: startIndex
  });

  // Função para obter informações de exibição
  const getDisplayInfo = () => {
    if (totalItems === 0) {
      return 'Nenhum item encontrado';
    }
    
    return `Mostrando ${startIndex + 1} a ${endIndex} de ${totalItems} itens`;
  };

  return {
    // Estados
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,

    // Funções de navegação
    handlePageChange,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,

    // Funções de configuração
    handleItemsPerPageChange,
    updatePagination,
    resetPagination,

    // Funções utilitárias
    getPaginationParams,
    getDisplayInfo,

    // Setters diretos
    setCurrentPage,
    setTotalPages,
    setTotalItems,
    setItemsPerPage
  };
};