import React from 'react';
import Layout from '../../components/Layout';
import PermissionGuard from '../../components/PermissionGuard';
import { useAprovacoes } from '../../hooks/useAprovacoes';
import { AprovacoesStats, AprovacoesFilters, AprovacoesTable } from './components';

const Aprovacoes = () => {
  const {
    cotacoes,
    loading,
    error,
    filtros,
    statusStats,
    handleAnalisarCotacao,
    updateFiltros,
    clearFiltros,
    refreshData
  } = useAprovacoes();

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
      'aguardando_aprovacao': {
        label: 'Aguardando Aprovação',
        className: 'bg-yellow-100 text-yellow-800'
      },
      'aguardando_aprovacao_supervisor': {
        label: 'Aguardando Supervisor',
        className: 'bg-blue-100 text-blue-800'
      },
      'aprovado': {
        label: 'Aprovado',
        className: 'bg-green-100 text-green-800'
      },
      'rejeitado': {
        label: 'Rejeitado',
        className: 'bg-red-100 text-red-800'
      },
      'renegociacao': {
        label: 'Em Renegociação',
        className: 'bg-orange-100 text-orange-800'
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

  const handleStatusFilter = (status) => {
    updateFiltros({ status });
  };

  return (
    <PermissionGuard requiredPermissions={['comprador', 'supervisor', 'gestor', 'administrador']}>
      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Aprovações de Cotações
            </h1>
            <p className="text-gray-600">
              Gerencie e analise cotações para aprovação
            </p>
          </div>

          {/* Estatísticas */}
          <AprovacoesStats 
            statusStats={statusStats}
            handleStatusFilter={handleStatusFilter}
          />

          {/* Filtros */}
          <AprovacoesFilters
            filtros={filtros}
            updateFiltros={updateFiltros}
            clearFiltros={clearFiltros}
          />

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Erro ao carregar dados
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={refreshData}
                      className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de cotações */}
          <AprovacoesTable
            cotacoes={cotacoes}
            loading={loading}
            handleAnalisarCotacao={handleAnalisarCotacao}
            formatDate={formatDate}
            formatValue={formatValue}
            getStatusBadge={getStatusBadge}
          />
        </div>
      </Layout>
    </PermissionGuard>
  );
};

export default Aprovacoes;
