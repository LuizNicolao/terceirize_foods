import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { usePatrimonios } from '../../hooks/usePatrimonios';
import PatrimoniosTable from './PatrimoniosTable';
import { Pagination } from '../ui';

const PatrimoniosList = ({ 
  tipoLocal, 
  localId, 
  localNome, 
  canView, 
  canEdit, 
  canDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { 
    patrimonios, 
    loading, 
    totalItems, 
    totalPages,
    loadPatrimonios 
  } = usePatrimonios();

  useEffect(() => {
    if (localId) {
      loadPatrimonios({
        search: searchTerm,
        status: statusFilter,
        page: currentPage,
        limit: itemsPerPage,
        localId,
        tipoLocal
      });
    }
  }, [localId, tipoLocal, searchTerm, statusFilter, currentPage, itemsPerPage, loadPatrimonios]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  if (!localId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Selecione um local para visualizar os patrimônios
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Patrimônios - {localNome}
          </h3>
          <p className="text-sm text-gray-500">
            {tipoLocal === 'filial' ? 'Filial' : 'Unidade Escolar'}
          </p>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Busca */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar patrimônios..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de Status */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="manutencao">Manutenção</option>
            <option value="baixado">Baixado</option>
          </select>

          {/* Limpar Filtros */}
          {(searchTerm || statusFilter) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <FaTimes />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Patrimônios */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          <PatrimoniosTable
            patrimonios={patrimonios}
            canView={canView}
            canEdit={canEdit}
            canDelete={canDelete}
            onView={() => {}} // Será implementado quando necessário
            onEdit={() => {}} // Será implementado quando necessário
            onDelete={() => {}} // Será implementado quando necessário
          />

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}

        </>
      )}
    </div>
  );
};

export default PatrimoniosList;
