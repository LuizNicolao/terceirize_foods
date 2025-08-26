import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { ActionButtons } from '../../../components/ui';

const CotacoesTable = ({
  cotacoes,
  searchTerm,
  statusFilter,
  compradorFilter,
  onView,
  onEdit,
  onDelete,
  onSendToSupervisor,
  canView,
  canEdit,
  canDelete
}) => {
  // Filtrar cotações
  const filteredCotacoes = cotacoes.filter(cotacao => {
    // Filtro por busca
    const matchesSearch = !searchTerm || 
      cotacao.solicitante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotacao.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotacao.justificativa?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por status
    const matchesStatus = statusFilter === 'todos' || cotacao.status === statusFilter;

    // Filtro por comprador
    const matchesComprador = compradorFilter === 'todos' || cotacao.solicitante === compradorFilter;

    return matchesSearch && matchesStatus && matchesComprador;
  });

  const getStatusLabel = (status) => {
    const statuses = {
      'pendente': 'Pendente',
      'em_analise': 'Em Análise',
      'aguardando_aprovacao': 'Aguardando Aprovação',
      'aprovada': 'Aprovada',
      'rejeitada': 'Rejeitada',
      'renegociacao': 'Em Renegociação',
      'liberado_gerencia': 'Liberado Gerência'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'em_analise': 'bg-orange-100 text-orange-800',
      'aguardando_aprovacao': 'bg-blue-100 text-blue-800',
      'aprovada': 'bg-green-100 text-green-800',
      'rejeitada': 'bg-red-100 text-red-800',
      'renegociacao': 'bg-purple-100 text-purple-800',
      'liberado_gerencia': 'bg-indigo-100 text-indigo-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Título
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Solicitante
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Data Criação
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCotacoes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {searchTerm || statusFilter !== 'todos' 
                      ? 'Nenhuma cotação encontrada com os filtros aplicados'
                      : 'Nenhuma cotação cadastrada'
                    }
                  </div>
                </td>
              </tr>
            ) : (
              filteredCotacoes.map((cotacao) => (
                <tr key={cotacao.numero || cotacao.id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{cotacao.numero}</div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">{cotacao.titulo}</div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {cotacao.solicitante}
                      {/* Mostrar título no mobile */}
                      <div className="md:hidden text-xs text-gray-500 truncate mt-1" title={cotacao.titulo}>
                        {cotacao.titulo}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-sm text-gray-900">{formatDate(cotacao.data_criacao)}</div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cotacao.status)}`}>
                      {getStatusLabel(cotacao.status)}
                    </span>
                    {/* Mostrar data no mobile/tablet */}
                    <div className="lg:hidden text-xs text-gray-400 mt-1">
                      {formatDate(cotacao.data_criacao)}
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-1">
                      <ActionButtons
                        canView={canView}
                        canEdit={canEdit && (cotacao.status === 'pendente' || cotacao.status === 'renegociacao')}
                        canDelete={canDelete && (cotacao.status === 'pendente' || cotacao.status === 'renegociacao')}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        item={cotacao}
                      />
                      {cotacao.status === 'pendente' && (
                        <button
                          onClick={() => onSendToSupervisor(cotacao)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Enviar para Supervisor"
                        >
                          <FaPaperPlane className="w-3 h-3" />
                        </button>
                      )}
                      {/* Indicador visual para cotações que não podem ser editadas */}
                      {cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao' && (
                        <div className="text-xs text-gray-500 ml-2" title={`Cotação ${getStatusLabel(cotacao.status).toLowerCase()} - apenas visualização disponível`}>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CotacoesTable;
