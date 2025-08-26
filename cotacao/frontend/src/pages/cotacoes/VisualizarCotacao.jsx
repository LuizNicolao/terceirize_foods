import React, { useState } from 'react';
import { FaArrowLeft, FaEdit, FaUser, FaMapMarkerAlt, FaShoppingCart, FaCalendar, FaChartLine, FaList, FaEye } from 'react-icons/fa';
import { useVisualizarCotacao } from '../../hooks/useVisualizarCotacao';
import { Button, LoadingSpinner } from '../../components/ui';
import { FornecedoresList } from './components/visualizar';
import MelhorPrecoAnalysis from '../../components/cotacoes/MelhorPrecoAnalysis';
import TabNavigation from '../../components/ui/TabNavigation';
import ScrollToBottomButton from '../../components/ui/ScrollToBottomButton';

const VisualizarCotacao = () => {
  const [activeTab, setActiveTab] = useState('geral');
  
  const {
    cotacao,
    loading,
    error,
    handleVoltar,
    handleEditar,
    fetchCotacao
  } = useVisualizarCotacao();

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Carregando cotação..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-6xl mb-4">✗</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar cotação</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchCotacao} variant="primary">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!cotacao) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Cotação não encontrada</h3>
          <p className="text-gray-600 mb-4">A cotação solicitada não foi encontrada</p>
          <Button onClick={handleVoltar} variant="primary">
            Voltar para Cotações
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadgeClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprovada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reprovada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'renegociacao':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'Pendente';
      case 'aprovada':
        return 'Aprovada';
      case 'reprovada':
        return 'Reprovada';
      case 'renegociacao':
        return 'Renegociação';
      default:
        return status || 'Desconhecido';
    }
  };

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                onClick={handleVoltar}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <FaArrowLeft />
                Voltar
              </Button>
              {cotacao.status === 'pendente' && (
                <Button
                  onClick={handleEditar}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FaEdit />
                  Editar
                </Button>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Cotação #{cotacao.numero || cotacao.id}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClasses(cotacao.status)}`}>
                {getStatusText(cotacao.status)}
              </span>
              <span className="text-sm text-gray-500">
                Criada em {new Date(cotacao.created_at || cotacao.data_criacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaUser className="text-green-500" />
          Informações Básicas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
              Comprador
            </label>
            <p className="text-gray-800 text-base font-medium mt-1">
              {cotacao.comprador || 'Não informado'}
            </p>
          </div>
          
          <div>
            <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400" />
              Local de Entrega
            </label>
            <p className="text-gray-800 text-base font-medium mt-1">
              {cotacao.local_entrega || 'Não informado'}
            </p>
          </div>
          
          <div>
            <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
              <FaShoppingCart className="text-gray-400" />
              Tipo de Compra
            </label>
            <p className="text-gray-800 text-base font-medium mt-1">
              {cotacao.tipo_compra === 'emergencial' ? 'Emergencial' : 'Programada'}
            </p>
          </div>
          
          {cotacao.tipo_compra === 'emergencial' && (
            <div className="md:col-span-2">
              <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                Motivo Emergencial
              </label>
              <p className="text-gray-800 text-base font-medium mt-1">
                {cotacao.motivo_emergencial || 'Não informado'}
              </p>
            </div>
          )}
          
          {cotacao.justificativa && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                Justificativa
              </label>
              <p className="text-gray-800 text-base font-medium mt-1">
                {cotacao.justificativa}
              </p>
            </div>
          )}
        </div>
      </div>
        
        {/* Navegação por Abas */}
        {cotacao.fornecedores && cotacao.fornecedores.length > 0 && cotacao.produtos && cotacao.produtos.length > 0 && (
          <TabNavigation
            tabs={[
              {
                id: 'geral',
                label: 'Geral',
                icon: <FaEye className="text-lg" />
              },
              {
                id: 'melhor-preco',
                label: 'Melhor Preço',
                icon: <FaChartLine className="text-lg" />
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {/* Conteúdo das Abas */}
        {activeTab === 'geral' && (
          <FornecedoresList fornecedores={cotacao.fornecedores || []} produtos={cotacao.produtos || []} />
        )}

        {activeTab === 'melhor-preco' && (
          <MelhorPrecoAnalysis 
            fornecedores={cotacao.fornecedores}
            produtos={cotacao.produtos}
          />
        )}
      
      {/* Botão Ir ao Final */}
      <ScrollToBottomButton 
        containerRef={null}
        threshold={100}
      />
    </div>
  );
};

export default VisualizarCotacao;