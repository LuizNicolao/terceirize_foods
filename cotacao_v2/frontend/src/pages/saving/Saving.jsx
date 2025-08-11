import React from 'react';
import Layout from '../../components/Layout';
import { useSaving } from '../../hooks/useSaving';
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

  // Funções utilitárias
  const formatDate = (data) => {
    if (!data) return 'Data não informada';
    
    try {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) {
        return 'Data inválida';
      }
      
      return dataObj.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatValue = (valor) => {
    if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico === 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valorNumerico);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'aprovado': {
        label: 'Aprovado',
        className: 'bg-green-100 text-green-800'
      },
      'pendente': {
        label: 'Pendente',
        className: 'bg-yellow-100 text-yellow-800'
      },
      'rejeitado': {
        label: 'Rejeitado',
        className: 'bg-red-100 text-red-800'
      }
    };

    const config = statusConfig[status] || {
      label: status || 'Desconhecido',
      className: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

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
          formatValue={formatValue}
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
