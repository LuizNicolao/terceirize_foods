import React, { useState, useMemo } from 'react';
import { FaUsers, FaExclamationTriangle, FaPlus, FaSearch, FaFilter, FaDownload, FaUpload } from 'react-icons/fa';
import Layout from '../../components/Layout';
import { useUsuarios } from '../../hooks';
import UsuariosTable from './components/UsuariosTable';
import UsuariosStats from './components/UsuariosStats';
import UsuariosActions from './components/UsuariosActions';
import UsuariosFilters from './components/UsuariosFilters';
import Pagination from '../../components/shared/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorModal from '../../components/ui/ErrorModal';

const Usuarios = () => {
  const {
    usuarios,
    loading,
    error,
    pagination,
    filters,
    openModal,
    closeModal,
    clearError,
    deleteUsuario,
    updateFilters,
    changePage,
    changeLimit
  } = useUsuarios();

  const [showFilters, setShowFilters] = useState(false);

  // Filtered usuarios based on search and filters
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(usuario => {
      const matchesSearch = !filters.search || 
        usuario.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        usuario.email.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesRole = !filters.role || usuario.role === filters.role;
      const matchesStatus = !filters.status || usuario.status === filters.status;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usuarios, filters]);

  // Handle actions
  const handleAdd = () => {
    openModal('create');
  };

  const handleEdit = (usuario) => {
    openModal('edit', usuario);
  };

  const handleView = (usuario) => {
    openModal('view', usuario);
  };

  const handleDelete = async (usuario) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${usuario.name}"?`)) {
      try {
        await deleteUsuario(usuario.id);
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
      }
    }
  };

  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
  };

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handleExport = async (format) => {
    try {
      // Implement export functionality
      console.log('Exporting usuarios in format:', format);
    } catch (error) {
      console.error('Erro ao exportar usuários:', error);
    }
  };

  const handleImport = () => {
    // Implement import functionality
    console.log('Importing usuarios');
  };

  const handlePageChange = (page) => {
    changePage(page);
  };

  const handleLimitChange = (limit) => {
    changeLimit(limit);
  };

  if (loading && usuarios.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
              <p className="text-gray-600 mt-1">
                Gerencie os usuários do sistema
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaFilter className="mr-2 h-4 w-4" />
                Filtros
              </button>
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <UsuariosStats usuarios={usuarios} />

        {/* Actions Bar */}
        <UsuariosActions
          onSearch={handleSearch}
          onExport={handleExport}
          onImport={handleImport}
          loading={loading}
          searchValue={filters.search}
        />

        {/* Filters */}
        {showFilters && (
          <UsuariosFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Erro ao carregar usuários
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <UsuariosTable
            usuarios={filteredUsuarios}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum usuário encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.role || filters.status
                ? 'Tente ajustar os filtros aplicados'
                : 'Comece criando um novo usuário'}
            </p>
            {!filters.search && !filters.role && !filters.status && (
              <div className="mt-6">
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Adicionar Usuário
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Usuarios;
