import React, { useMemo } from 'react';
import Layout from '../../components/Layout';
import { useSupervisor } from '../../hooks/useSupervisor';
import { SupervisorStats, SupervisorFilters, SupervisorTable } from './components';

const Supervisor = () => {
  const {
    cotacoes,
    loading,
    error,
    searchTerm,
    selectedFornecedor,
    sortBy,
    sortOrder,
    statusStats,
    handleAnalysisClick,
    updateFilters,
    clearFilters,
    refreshData
  } = useSupervisor();

  // Lista de fornecedores únicos das cotações
  const fornecedores = useMemo(() => {
    const fornecedoresSet = new Set();
    cotacoes.forEach(cotacao => {
      if (cotacao.produtos) {
        cotacao.produtos.forEach(produto => {
          if (produto.fornecedor) {
            fornecedoresSet.add(produto.fornecedor);
          }
        });
      }
    });
    return Array.from(fornecedoresSet).sort();
  }, [cotacoes]);

  // Funções utilitárias
  const formatDate = (data) => {
    if (!data) return 'Data não informada';
    
    try {
      // Se a data já está no formato brasileiro (dd/mm/yyyy)
      if (typeof data === 'string' && data.includes('/')) {
        const partes = data.split('/');
        if (partes.length === 3) {
          const dia = parseInt(partes[0]);
          const mes = parseInt(partes[1]) - 1;
          const ano = parseInt(partes[2]);
          return new Date(ano, mes, dia).toLocaleDateString('pt-BR');
        }
      }
      
      // Para outros formatos, tentar criar Date normalmente
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
      'aguardando_aprovacao_supervisor': {
        label: 'Aguardando Análise',
        className: 'bg-blue-100 text-blue-800'
      },
      'renegociacao': {
        label: 'Em Renegociação',
        className: 'bg-orange-100 text-orange-800'
      },
      'pendente': {
        label: 'Pendente',
        className: 'bg-yellow-100 text-yellow-800'
      },
      'aprovada': {
        label: 'Aprovada',
        className: 'bg-green-100 text-green-800'
      },
      'rejeitada': {
        label: 'Rejeitada',
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

  const handleStatusFilter = (status) => {
    // Implementar filtro por status se necessário
    console.log('Filtrar por status:', status);
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supervisão de Cotações
          </h1>
          <p className="text-gray-600">
            Gerencie e analise cotações pendentes de aprovação
          </p>
        </div>

        {/* Estatísticas */}
        <SupervisorStats 
          statusStats={statusStats}
          handleStatusFilter={handleStatusFilter}
        />

        {/* Filtros */}
        <SupervisorFilters
          searchTerm={searchTerm}
          selectedFornecedor={selectedFornecedor}
          sortBy={sortBy}
          sortOrder={sortOrder}
          updateFilters={updateFilters}
          clearFilters={clearFilters}
          fornecedores={fornecedores}
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
        <SupervisorTable
          cotacoes={cotacoes}
          loading={loading}
          handleAnalysisClick={handleAnalysisClick}
          formatDate={formatDate}
          formatValue={formatValue}
          getStatusBadge={getStatusBadge}
        />
      </div>
    </Layout>
  );
};

export default Supervisor;
