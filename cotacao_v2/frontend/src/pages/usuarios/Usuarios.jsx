import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import Layout from '../../components/Layout';
import { useUsuarios } from '../../hooks/useUsuarios';
import UsuariosFilters from './components/UsuariosFilters';
import UsuariosTable from './components/UsuariosTable';

const Usuarios = () => {
  const {
    // Estados
    usuarios,
    loading,
    error,
    searchTerm,
    statusFilter,
    deletingUserId,
    
    // Ações
    fetchUsuarios,
    handleView,
    handleEdit,
    handleCreate,
    handleDelete,
    
    // Setters
    setSearchTerm,
    setStatusFilter,
    
    // Utilitários
    getRoleLabel,
    getStatusLabel
  } = useUsuarios();

  // Handler para auditoria (placeholder)
  const handleAudit = () => {
    alert('Funcionalidade de auditoria será implementada em breve!');
  };

  // Estados de loading e erro
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao carregar usuários: {error}</p>
            <button 
              onClick={fetchUsuarios}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-3 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Usuários</h1>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleAudit}
              className="bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaQuestionCircle />
              <span className="hidden sm:inline">Auditoria</span>
            </button>
            <button
              onClick={handleCreate}
              className="bg-green-600 text-white px-3 py-2 rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaPlus />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </button>
          </div>
        </div>

        <UsuariosFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <UsuariosTable
          usuarios={usuarios}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getRoleLabel={getRoleLabel}
          getStatusLabel={getStatusLabel}
          deletingUserId={deletingUserId}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
      </div>
    </Layout>
  );
};

export default Usuarios;
