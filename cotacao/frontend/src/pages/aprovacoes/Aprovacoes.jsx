/**
 * Página de Aprovações
 * Painel principal para análise e aprovação de cotações
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuestionCircle } from 'react-icons/fa';
import { useAprovacoes } from '../../hooks/useAprovacoes';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button, CadastroFilterBar, LoadingSpinner } from '../../components/ui';
import { AuditModal } from '../../components/shared';
import AprovacoesStats from './components/AprovacoesStats';
import AprovacoesTable from './components/AprovacoesTable';

const Aprovacoes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canView } = usePermissions();
  
  const {
    aprovacoes,
    stats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchCotacoesPendentes,
    fetchStats,
    // Auditoria
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  } = useAprovacoes();

  useEffect(() => {
    fetchCotacoesPendentes();
    fetchStats();
  }, [fetchCotacoesPendentes, fetchStats]);

  const handleView = (cotacao) => {
    navigate(`/aprovacoes/visualizar/${cotacao.numero || cotacao.id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">Erro ao carregar aprovações</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={fetchCotacoesPendentes}
            className="bg-gray-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Aprovações da Gerência</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <AprovacoesStats stats={stats} />

      {/* Filters */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar cotações aguardando aprovação..."
      />

      {/* Table */}
      <AprovacoesTable
        aprovacoes={aprovacoes}
        searchTerm={searchTerm}
        onView={handleView}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        logs={auditLogs}
        loading={auditLoading}
        filters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        setFilters={setAuditFilters}
      />
    </div>
  );
};

export default Aprovacoes;
