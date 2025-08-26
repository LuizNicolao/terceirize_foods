/**
 * Página do Supervisor
 * Painel principal para análise de cotações pendentes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar } from 'react-icons/fa';
import { useSupervisor } from '../../hooks/useSupervisor';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { Button, CadastroFilterBar, LoadingSpinner } from '../../components/ui';
import SupervisorStats from './components/SupervisorStats.js';
import SupervisorTable from './components/SupervisorTable.js';

const Supervisor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canView } = usePermissions();
  const { 
    cotacoes, 
    stats, 
    loading, 
    error,
    fetchCotacoesPendentes,
    fetchStats 
  } = useSupervisor();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    fetchCotacoesPendentes();
    fetchStats();
  }, [fetchCotacoesPendentes, fetchStats]);

  const handleAnalisarCotacao = (cotacao) => {
    navigate(`/supervisor/analisar/${cotacao.id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">Erro ao carregar dados</div>
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Supervisor</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={() => navigate('/aprovacoes')}
            variant="outline"
            size="sm"
          >
            <FaChartBar className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Ver Aprovações</span>
            <span className="sm:hidden">Aprovações</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <SupervisorStats stats={stats} />

      {/* Filters */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar cotações..."
        additionalFilters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'todos', label: 'Todos os status' },
              { value: 'em_analise', label: 'Aguardando Análise do Supervisor' },
              { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação da Gestão' },
              { value: 'renegociacao', label: 'Em Renegociação' }
            ]
          }
        ]}
      />

      {/* Table */}
      <SupervisorTable
        cotacoes={cotacoes}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onAnalisar={handleAnalisarCotacao}
      />
    </div>
  );
};

export default Supervisor;
