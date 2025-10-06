import React from 'react';
import { FaEdit, FaEye, FaTrash, FaTools, FaCalendarAlt, FaSchool, FaDollarSign } from 'react-icons/fa';
import { ActionButtons } from '../ui';

const SolicitacoesTable = ({ 
  solicitacoes, 
  onEdit, 
  onView, 
  onDelete, 
  canEdit = false, 
  canDelete = false,
  loading = false 
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Aprovado': 'bg-blue-100 text-blue-800',
      'Reprovado': 'bg-red-100 text-red-800',
      'Pendente manutenção': 'bg-orange-100 text-orange-800',
      'Concluído': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    // Tratar datas no formato YYYY-MM-DD ou ISO string
    let date;
    if (dateString.includes('T')) {
      // Data ISO com timezone - extrair apenas a parte da data
      const dateOnly = dateString.split('T')[0];
      date = new Date(dateOnly + 'T12:00:00'); // Meio-dia para evitar problemas de timezone
    } else {
      // Data simples YYYY-MM-DD
      date = new Date(dateString + 'T12:00:00');
    }
    
    const formatted = date.toLocaleDateString('pt-BR');
    return formatted;
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando solicitações...</p>
      </div>
    );
  }

  if (solicitacoes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FaTools className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma solicitação encontrada
        </h3>
        <p className="text-gray-600">
          Não há solicitações de manutenção cadastradas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Escola
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {solicitacoes.map((solicitacao) => (
              <tr key={solicitacao.id} className="hover:bg-gray-50">
                {/* Data */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaCalendarAlt className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {formatDate(solicitacao.data_solicitacao)}
                    </span>
                  </div>
                </td>

                {/* Escola */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FaSchool className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {solicitacao.nome_escola}
                      </div>
                      <div className="text-sm text-gray-500">
                        {solicitacao.rota}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Cidade */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {solicitacao.cidade}
                  </span>
                </td>

                {/* Descrição */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {solicitacao.manutencao_descricao}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(solicitacao.status)}
                </td>

                {/* Valor */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <FaDollarSign className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">
                      {formatCurrency(solicitacao.valor)}
                    </span>
                  </div>
                </td>

                {/* Ações */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <ActionButtons
                    canView={true}
                    canEdit={canEdit && ['Pendente'].includes(solicitacao.status)}
                    canDelete={canDelete && ['Pendente'].includes(solicitacao.status)}
                    onView={() => onView(solicitacao)}
                    onEdit={canEdit && ['Pendente'].includes(solicitacao.status) ? () => onEdit(solicitacao) : null}
                    onDelete={canDelete && ['Pendente'].includes(solicitacao.status) ? () => onDelete(solicitacao) : null}
                    item={solicitacao}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SolicitacoesTable;
