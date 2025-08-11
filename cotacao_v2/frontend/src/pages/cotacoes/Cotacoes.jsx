import React from 'react';
import Layout from '../../components/Layout';
import { useCotacoes } from '../../hooks/useCotacoes';
import { 
  CotacoesStats, 
  CotacoesFilters, 
  CotacoesTable, 
  CotacoesActions 
} from './components';

const Cotacoes = () => {
  const {
    cotacoes,
    loading,
    error,
    filters,
    statusCounts,
    handleStatusFilter,
    updateFilters,
    clearFilters,
    handleEnviarParaSupervisor,
    handleDeleteCotacao,
    handleViewCotacao,
    handleEditCotacao,
    handleNovaCotacao,
    formatDate,
    getStatusColor,
    getStatusLabel
  } = useCotacoes();

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <strong>Erro:</strong> {error}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header e Ações */}
        <CotacoesActions handleNovaCotacao={handleNovaCotacao} />

        {/* Cards de Estatísticas */}
        <CotacoesStats 
          statusCounts={statusCounts}
          handleStatusFilter={handleStatusFilter}
          getStatusColor={getStatusColor}
        />

        {/* Filtros */}
        <CotacoesFilters 
          filters={filters}
          updateFilters={updateFilters}
          clearFilters={clearFilters}
        />

        {/* Tabela de Cotações */}
        <CotacoesTable 
          cotacoes={cotacoes}
          loading={loading}
          handleViewCotacao={handleViewCotacao}
          handleEditCotacao={handleEditCotacao}
          handleEnviarParaSupervisor={handleEnviarParaSupervisor}
          handleDeleteCotacao={handleDeleteCotacao}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
        />
      </div>
    </Layout>
  );
};

export default Cotacoes;
