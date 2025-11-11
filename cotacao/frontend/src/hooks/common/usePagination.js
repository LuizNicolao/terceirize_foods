import { useState, useCallback } from 'react';

export const usePagination = (initialItemsPerPage = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const updatePagination = useCallback((paginationData) => {
    if (!paginationData) {
      setTotalItems(0);
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }

    const page = paginationData.page ?? paginationData.currentPage ?? paginationData.current_page ?? 1;
    const limit = paginationData.limit ?? paginationData.perPage ?? paginationData.per_page ?? itemsPerPage;
    const total = paginationData.total ?? paginationData.totalItems ?? paginationData.total_items ?? 0;
    const pages = paginationData.pages ?? paginationData.totalPages ?? paginationData.total_pages ?? Math.max(1, Math.ceil(total / limit));

    setCurrentPage(Math.max(1, page));
    setItemsPerPage(limit);
    setTotalItems(total);
    setTotalPages(Math.max(1, pages));
  }, [itemsPerPage]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const handleItemsPerPageChange = useCallback((limit) => {
    const parsedLimit = parseInt(limit, 10) || initialItemsPerPage;
    setItemsPerPage(parsedLimit);
    setCurrentPage(1);
  }, [initialItemsPerPage]);

  const getPaginationParams = useCallback(() => ({
    page: currentPage,
    limit: itemsPerPage
  }), [currentPage, itemsPerPage]);

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    updatePagination,
    handlePageChange,
    handleItemsPerPageChange,
    getPaginationParams,
    setCurrentPage,
    setItemsPerPage,
    setTotalItems,
    setTotalPages
  };
};

