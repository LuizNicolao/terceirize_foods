import React from 'react';
import { FaEye, FaCalendar, FaExclamationCircle } from 'react-icons/fa';

const DashboardRecent = ({ recent, getStatusLabel, getStatusColor, formatDate, onViewCotacao }) => {
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aguardando_aprovacao':
        return 'bg-yellow-100 text-yellow-800';
      case 'aguardando_aprovacao_supervisor':
        return 'bg-purple-100 text-purple-800';
      case 'aprovada':
        return 'bg-green-100 text-green-800';
      case 'rejeitada':
        return 'bg-red-100 text-red-800';
      case 'renegociacao':
        return 'bg-blue-100 text-blue-800';
      case 'em_analise':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!recent || !recent.recentes || recent.recentes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-800">Cotações Recentes</h3>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">0</span>
        </div>
        <div className="text-center py-10 text-gray-500 text-sm">
          <FaCalendar className="text-3xl mb-3 mx-auto text-gray-300" />
          <div>Nenhuma cotação recente</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-800">Cotações Recentes</h3>
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
          {recent.total}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Comprador
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recent.recentes.map((cotacao) => (
              <tr key={cotacao.id} className="hover:bg-gray-50">
                <td className="py-3 px-3 text-sm text-gray-900">
                  #{cotacao.id}
                </td>
                <td className="py-3 px-3 text-sm text-gray-900">
                  {formatDate(cotacao.data_criacao)}
                </td>
                <td className="py-3 px-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyles(cotacao.status)}`}>
                    {getStatusLabel(cotacao.status)}
                  </span>
                </td>
                <td className="py-3 px-3 text-sm text-gray-900">
                  {cotacao.usuario_nome}
                </td>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                    cotacao.tipo === 'emergencial' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {cotacao.tipo === 'emergencial' ? (
                      <>
                        <FaExclamationCircle className="text-xs" />
                        Emergencial
                      </>
                    ) : (
                      <>
                        <FaCalendar className="text-xs" />
                        Programada
                      </>
                    )}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <button 
                    onClick={() => onViewCotacao(cotacao.id)}
                    className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md transition-colors duration-200"
                  >
                    <FaEye className="text-xs" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardRecent;
