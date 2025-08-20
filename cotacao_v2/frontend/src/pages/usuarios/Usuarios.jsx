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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              border: '2px solid #e5e7eb', 
              borderTop: '2px solid #10b981', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6b7280' }}>Carregando usuários...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#dc2626', marginBottom: '16px' }}>Erro ao carregar usuários: {error}</p>
            <button 
              onClick={fetchUsuarios}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
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
      <div style={{ padding: '12px 24px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '24px',
          gap: '16px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Usuários</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAudit}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <FaQuestionCircle />
              <span>Auditoria</span>
            </button>
            <button
              onClick={handleCreate}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              <FaPlus />
              <span>Adicionar</span>
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
