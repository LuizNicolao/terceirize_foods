import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onLimitChange,
  loading = false
}) => {
  const startItem = ((currentPage || 1) - 1) * (itemsPerPage || 10) + 1;
  const endItem = Math.min((currentPage || 1) * (itemsPerPage || 10), totalItems || 0);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && !loading && page !== currentPage) {
      onPageChange(page);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Aumentado para mostrar mais páginas
    
    if (totalPages <= maxVisiblePages) {
      // Se temos poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica melhorada para mostrar páginas relevantes
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Ajustar se estamos no final
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // Sempre mostrar primeira página
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Páginas do meio
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Sempre mostrar última página
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      {/* Mobile - Informações simplificadas */}
      <div className="flex-1 flex justify-between sm:hidden">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
        </div>
        {totalPages > 1 && (
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage || loading}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage || loading}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
              <FaChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>
      
      {/* Desktop - Layout completo */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {/* Informações dos itens */}
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startItem}</span> até{' '}
            <span className="font-medium">{endItem}</span> de{' '}
            <span className="font-medium">{totalItems}</span> itens
          </p>
          
          {/* Seletor de itens por página */}
          <div className="flex items-center space-x-2">
            <label htmlFor="items-per-page" className="text-sm text-gray-700">
              Itens por página:
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => onLimitChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              disabled={loading}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">Todos</option>
            </select>
          </div>
        </div>

        {/* Navegação de páginas - só aparece se houver mais de 1 página */}
        {totalPages > 1 && (
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Primeira página */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Primeira página"
            >
              <FaAngleDoubleLeft className="h-4 w-4" />
            </button>

            {/* Página anterior */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage || loading}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Página anterior"
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>

            {/* Números das páginas */}
            {generatePageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...' || loading}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-green-50 border-green-500 text-green-600 font-semibold'
                    : page === '...'
                    ? 'border-gray-300 bg-white text-gray-700 cursor-default'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={typeof page === 'number' ? `Ir para página ${page}` : ''}
              >
                {page}
              </button>
            ))}

            {/* Próxima página */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage || loading}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Próxima página"
            >
              <FaChevronRight className="h-4 w-4" />
            </button>

            {/* Última página */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Última página"
            >
              <FaAngleDoubleRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Pagination;
