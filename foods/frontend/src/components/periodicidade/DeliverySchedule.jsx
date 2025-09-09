import React from 'react';
import { FaTruck, FaExclamationTriangle, FaCheckCircle, FaClock, FaBuilding, FaBox, FaEye } from 'react-icons/fa';
import { Button } from '../ui';

const DeliverySchedule = ({ deliveries, isViewMode = false }) => {
  // Função para formatar data
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para obter o status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Programada
          </span>
        );
      case 'conflict':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaExclamationTriangle className="mr-1" />
            Conflito
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" />
            Pendente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FaTruck className="mr-1" />
            Entrega
          </span>
        );
    }
  };

  // Função para obter o tipo de entrega formatado
  const getDeliveryType = (type) => {
    switch (type) {
      case 'semanal':
        return 'Semanal';
      case 'quinzenal':
        return 'Quinzenal';
      case 'mensal':
        return 'Mensal';
      default:
        return 'Entrega';
    }
  };

  // Função para obter a cor do tipo
  const getTypeColor = (type) => {
    switch (type) {
      case 'semanal':
        return 'text-blue-600 bg-blue-100';
      case 'quinzenal':
        return 'text-purple-600 bg-purple-100';
      case 'mensal':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Ordenar entregas por data
  const sortedDeliveries = [...deliveries].sort((a, b) => a.date - b.date);

  if (deliveries.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <FaTruck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma entrega programada
          </h3>
          <p className="text-gray-500">
            Configure as regras de periodicidade para gerar o cronograma de entregas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          Cronograma de Entregas
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {deliveries.length} entrega(s) programada(s)
        </p>
      </div>

      {/* Lista de Entregas */}
      <div className="divide-y divide-gray-200">
        {sortedDeliveries.map((delivery, index) => (
          <div key={delivery.id || index} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(delivery.type)}`}>
                    {getDeliveryType(delivery.type)}
                  </div>
                  {getStatusBadge(delivery.status)}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaBuilding className="mr-2" />
                    <span>{delivery.schools} escola(s)</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FaBox className="mr-2" />
                    <span>{delivery.products} produto(s)</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {delivery.date.getDate().toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-500">
                  {delivery.date.toLocaleDateString('pt-BR', { month: 'short' })}
                </div>
              </div>
            </div>
            
            {/* Data completa */}
            <div className="mt-3 text-sm text-gray-600">
              {formatDate(delivery.date)}
            </div>
            
            {/* Conflitos */}
            {delivery.conflicts && delivery.conflicts.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <FaExclamationTriangle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Conflito detectado
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      Múltiplas entregas programadas para a mesma data
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Ações */}
            {!isViewMode && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log('Ver detalhes da entrega:', delivery.id)}
                >
                  <FaEye className="mr-1" />
                  Ver Detalhes
                </Button>
                
                {delivery.status === 'conflict' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => console.log('Resolver conflito:', delivery.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <FaExclamationTriangle className="mr-1" />
                    Resolver Conflito
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumo */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {deliveries.filter(d => d.status === 'scheduled').length}
            </div>
            <div className="text-gray-500">Programadas</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {deliveries.filter(d => d.status === 'conflict').length}
            </div>
            <div className="text-gray-500">Conflitos</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-600">
              {deliveries.filter(d => d.status === 'pending').length}
            </div>
            <div className="text-gray-500">Pendentes</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {deliveries.reduce((sum, d) => sum + d.schools, 0)}
            </div>
            <div className="text-gray-500">Total Escolas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySchedule;
