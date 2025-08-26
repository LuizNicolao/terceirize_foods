import React from 'react';
import { FaEye, FaEdit, FaTrash, FaUser, FaMapMarkerAlt, FaCalendar, FaSearch, FaDollarSign, FaExclamationTriangle, FaBox } from 'react-icons/fa';
import { Button } from '../ui';
import StatusBadge from './StatusBadge';
import TipoBadge from './TipoBadge';

const CotacaoCard = ({ 
  cotacao, 
  onView, 
  onEdit, 
  onDelete, 
  onAnalisar,
  showActions = true,
  showStats = true,
  variant = 'default' // default, compact, detailed, supervisor
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const renderSupervisorView = () => (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Header com ID e badges */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            #{cotacao.id}
          </div>
          <StatusBadge status={cotacao.status} />
          <TipoBadge tipo={cotacao.tipo_compra} />
        </div>
        {showActions && onAnalisar && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAnalisar(cotacao)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            title="Analisar Cotação"
          >
            <FaSearch size={14} className="mr-2" />
            Analisar
          </Button>
        )}
      </div>
      
      {/* Informações principais */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <FaUser size={14} className="text-gray-500" />
          <span className="font-medium text-gray-700">Comprador:</span>
          <span className="text-gray-900">{cotacao.comprador}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FaMapMarkerAlt size={14} className="text-gray-500" />
          <span className="font-medium text-gray-700">Local:</span>
          <span className="text-gray-900">{cotacao.local_entrega}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FaCalendar size={14} className="text-gray-500" />
          <span className="font-medium text-gray-700">Criada em:</span>
          <span className="text-gray-900">{formatDate(cotacao.data_criacao)}</span>
        </div>
      </div>
      
      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{cotacao.total_produtos || 0}</div>
            <div className="text-xs text-gray-500">Produtos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{cotacao.total_fornecedores || 0}</div>
            <div className="text-xs text-gray-500">Fornecedores</div>
          </div>
        </div>
      )}

      {/* Informações adicionais */}
      {cotacao.total_produtos > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
          <FaBox size={16} className="text-blue-600" />
          <span className="font-semibold text-blue-800">
            {cotacao.total_produtos} produtos
          </span>
        </div>
      )}

      {/* Status específico para supervisor */}
      <div className="border-t border-gray-100 pt-3">
        {cotacao.status === 'aguardando_aprovacao' && (
          <div className="flex items-center gap-2 text-sm">
            <FaExclamationTriangle size={14} className="text-yellow-500" />
            <span className="text-yellow-700 font-medium">Aguardando análise do supervisor</span>
          </div>
        )}
        {cotacao.status === 'renegociacao' && (
          <div className="flex items-center gap-2 text-sm">
            <FaExclamationTriangle size={14} className="text-orange-500" />
            <span className="text-orange-700 font-medium">Em renegociação</span>
          </div>
        )}
        {cotacao.tipo_compra === 'emergencial' && (
          <div className="flex items-center gap-2 text-sm mt-2">
            <FaExclamationTriangle size={14} className="text-red-500" />
            <span className="text-red-700 font-medium">Compra Emergencial</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompactView = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Cotação #{cotacao.id}
          </h3>
          <StatusBadge status={cotacao.status} size="sm" />
          <TipoBadge tipo={cotacao.tipo_compra} size="sm" />
        </div>
        {showActions && (
          <div className="flex gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(cotacao)}
                className="text-gray-600 hover:text-blue-600"
              >
                <FaEye size={14} />
              </Button>
            )}
            {onAnalisar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAnalisar(cotacao)}
                className="text-gray-600 hover:text-green-600"
              >
                <FaUser size={14} />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FaUser size={12} />
          <span>{cotacao.comprador}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt size={12} />
          <span>{cotacao.local_entrega}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendar size={12} />
          <span>{formatDate(cotacao.data_criacao)}</span>
        </div>
      </div>
    </div>
  );

  const renderDetailedView = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-900">
            Cotação #{cotacao.id}
          </h3>
          <StatusBadge status={cotacao.status} size="md" />
          <TipoBadge tipo={cotacao.tipo_compra} size="md" />
        </div>
        {showActions && (
          <div className="flex gap-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(cotacao)}
              >
                <FaEye size={14} className="mr-2" />
                Visualizar
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(cotacao)}
              >
                <FaEdit size={14} className="mr-2" />
                Editar
              </Button>
            )}
            {onAnalisar && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAnalisar(cotacao)}
              >
                <FaUser size={14} className="mr-2" />
                Analisar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(cotacao)}
              >
                <FaTrash size={14} className="mr-2" />
                Excluir
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaUser size={14} />
            <span className="font-medium">Comprador:</span>
            <span>{cotacao.comprador}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaMapMarkerAlt size={14} />
            <span className="font-medium">Local de Entrega:</span>
            <span>{cotacao.local_entrega}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaCalendar size={14} />
            <span className="font-medium">Data de Criação:</span>
            <span>{formatDate(cotacao.data_criacao)}</span>
          </div>
        </div>
        
        {showStats && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total de Produtos:</span>
              <span className="ml-2">{cotacao.total_produtos || 0}</span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total de Fornecedores:</span>
              <span className="ml-2">{cotacao.total_fornecedores || 0}</span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Quantidade Total:</span>
              <span className="ml-2">{cotacao.total_quantidade || 0}</span>
            </div>
          </div>
        )}
      </div>
      
      {cotacao.justificativa && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Justificativa:</h4>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            {cotacao.justificativa}
          </div>
        </div>
      )}
      
      {cotacao.motivo_emergencial && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-700 mb-2">Motivo Emergencial:</h4>
          <div className="text-sm text-red-700">{cotacao.motivo_emergencial}</div>
        </div>
      )}
    </div>
  );

  const renderDefaultView = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Cotação #{cotacao.id}
          </h3>
          <StatusBadge status={cotacao.status} />
          <TipoBadge tipo={cotacao.tipo_compra} />
        </div>
        {showActions && (
          <div className="flex gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(cotacao)}
                className="text-gray-600 hover:text-blue-600"
              >
                <FaEye size={14} />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(cotacao)}
                className="text-gray-600 hover:text-green-600"
              >
                <FaEdit size={14} />
              </Button>
            )}
            {onAnalisar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAnalisar(cotacao)}
                className="text-gray-600 hover:text-purple-600"
              >
                <FaUser size={14} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(cotacao)}
                className="text-gray-600 hover:text-red-600"
              >
                <FaTrash size={14} />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FaUser size={12} />
          <span>{cotacao.comprador}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt size={12} />
          <span>{cotacao.local_entrega}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendar size={12} />
          <span>{formatDate(cotacao.data_criacao)}</span>
        </div>
      </div>
      
      {showStats && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{cotacao.total_produtos || 0} produtos</span>
            <span>{cotacao.total_fornecedores || 0} fornecedores</span>
          </div>
        </div>
      )}
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompactView();
    case 'detailed':
      return renderDetailedView();
    case 'supervisor':
      return renderSupervisorView();
    default:
      return renderDefaultView();
  }
};

export default CotacaoCard;
