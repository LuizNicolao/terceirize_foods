import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useCotacoes } from '../../hooks';
import { filterByStatus, getStatusConfig } from '../../utils';
import {
  CotacoesFilters,
  CotacoesStats,
  CotacoesActions,
  CotacoesTable
} from './components';

const Cotacoes = () => {
  const [selectedStatus, setSelectedStatus] = useState('todas');
  
  const { 
    cotacoes, 
    loading, 
    error, 
    statusCounts, 
    fetchCotacoes, 
    enviarParaSupervisor 
  } = useCotacoes();

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  const handleStatusSelect = (statusId) => {
    setSelectedStatus(statusId);
  };

  const handleEnviarParaSupervisor = async (cotacaoId) => {
    await enviarParaSupervisor(cotacaoId);
  };

  const cotacaoStatusConfig = getStatusConfig('cotacao');
  const filteredCotacoes = filterByStatus(cotacoes, selectedStatus);

  // Dados para os cards de status
  const statusCards = [
    {
      id: 'pendentes',
      title: 'Cotações Pendentes',
      count: statusCounts.pendentes || 0,
      color: 'warning',
      icon: 'FaClock',
      bgColor: 'bg-warning-500'
    },
    {
      id: 'aguardando-aprovacao',
      title: 'Aguardando Aprovação',
      count: statusCounts['aguardando-aprovacao'] || 0,
      color: 'info',
      icon: 'FaUserCheck',
      bgColor: 'bg-info-500'
    },
    {
      id: 'analise-supervisor',
      title: 'Análise do Supervisor',
      count: statusCounts['analise-supervisor'] || 0,
      color: 'secondary',
      icon: 'FaSearch',
      bgColor: 'bg-secondary-500'
    },
    {
      id: 'aprovadas',
      title: 'Cotações Aprovadas',
      count: statusCounts.aprovadas || 0,
      color: 'success',
      icon: 'FaThumbsUp',
      bgColor: 'bg-success-500'
    },
    {
      id: 'rejeitadas',
      title: 'Cotações Rejeitadas',
      count: statusCounts.rejeitadas || 0,
      color: 'danger',
      icon: 'FaThumbsDown',
      bgColor: 'bg-danger-500'
    },
    {
      id: 'renegociacao',
      title: 'Em Renegociação',
      count: statusCounts.renegociacao || 0,
      color: 'warning',
      icon: 'FaExchangeAlt',
      bgColor: 'bg-warning-600'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Cotações</h1>
            <p className="mt-2 text-gray-600">Gerencie todas as cotações do sistema</p>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <CotacoesFilters 
              selectedStatus={selectedStatus}
              onStatusFilter={handleStatusFilter}
            />
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <CotacoesStats 
              statusCounts={statusCounts}
              selectedStatus={selectedStatus}
              onStatusSelect={handleStatusSelect}
            />
          </div>

          {/* Main Content */}
          <div className="bg-white overflow-hidden shadow-soft rounded-xl border border-gray-200">
            <CotacoesActions 
              selectedStatus={selectedStatus}
              statusCards={statusCards}
            />

            <CotacoesTable 
              cotacoes={filteredCotacoes}
              loading={loading}
              error={error}
              onRetry={fetchCotacoes}
              onEnviarParaSupervisor={handleEnviarParaSupervisor}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cotacoes;
