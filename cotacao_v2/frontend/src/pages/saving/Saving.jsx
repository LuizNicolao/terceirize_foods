import React from 'react';
import Layout from '../../components/Layout';
import { useSaving } from '../../hooks/useSaving';
import { formatDate, formatCurrency, getStatusBadge } from '../../utils/formatters';
import { 
  SavingStats, 
  SavingFilters, 
  SavingTable, 
  SavingActions,
  SavingPagination 
} from './components';

const Saving = () => {
  const {
    dados,
    loading,
    pagina,
    limite,
    total,
    resumo,
    filtros,
    compradores,
    aplicarFiltros,
    limparFiltros,
    updateFiltros,
    verDetalhes,
    handlePageChange,
    exportarDados
  } = useSaving();

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Saving - Análise de Economia
          </h1>
          <p className="text-gray-600">
            Monitore o impacto financeiro das negociações e economias obtidas
          </p>
        </div>

        {/* Estatísticas */}
        <SavingStats resumo={resumo} />

        {/* Ações */}
        <SavingActions exportarDados={exportarDados} />

        {/* Filtros */}
        <SavingFilters
          filtros={filtros}
          compradores={compradores}
          updateFiltros={updateFiltros}
          aplicarFiltros={aplicarFiltros}
          limparFiltros={limparFiltros}
        />

        {/* Tabela de dados */}
        <SavingTable
          dados={dados}
          loading={loading}
          verDetalhes={verDetalhes}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          getStatusBadge={getStatusBadge}
        />

        {/* Paginação */}
        <div className="mt-6">
          <SavingPagination
            pagina={pagina}
            total={total}
            limite={limite}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Saving;
