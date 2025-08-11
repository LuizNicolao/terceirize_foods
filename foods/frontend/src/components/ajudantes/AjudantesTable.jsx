import React from 'react';
import LoadingSpinner from '../LoadingSpinner';
import AjudantesActions from './AjudantesActions';

const AjudantesTable = ({
  ajudantes,
  loading,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete
}) => {
  const getStatusLabel = (status) => {
    const statusMap = {
      ativo: { label: 'Ativo', color: 'text-green-600 bg-green-100' },
      inativo: { label: 'Inativo', color: 'text-red-600 bg-red-100' },
      ferias: { label: 'Em Férias', color: 'text-yellow-600 bg-yellow-100' },
      licenca: { label: 'Em Licença', color: 'text-orange-600 bg-orange-100' }
    };
    return statusMap[status] || { label: status, color: 'text-gray-600 bg-gray-100' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (ajudantes.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Nenhum ajudante encontrado
      </div>
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Admissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ajudantes.map((ajudante) => (
                <tr key={ajudante.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ajudante.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ajudante.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {ajudante.cpf || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {ajudante.telefone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {ajudante.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {ajudante.filial_nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const status = getStatusLabel(ajudante.status);
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(ajudante.data_admissao)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <AjudantesActions
                      ajudante={ajudante}
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden space-y-3">
        {ajudantes.map((ajudante) => (
          <div key={ajudante.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{ajudante.nome}</h3>
                <p className="text-xs text-gray-500">ID: {ajudante.id}</p>
              </div>
              <AjudantesActions
                ajudante={ajudante}
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">CPF:</span>
                <span className="ml-1 text-gray-900">{ajudante.cpf || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Telefone:</span>
                <span className="ml-1 text-gray-900">{ajudante.telefone || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-1 text-gray-900">{ajudante.email || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Filial:</span>
                <span className="ml-1 text-gray-900">{ajudante.filial_nome || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-1">
                  {(() => {
                    const status = getStatusLabel(ajudante.status);
                    return (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    );
                  })()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Admissão:</span>
                <span className="ml-1 text-gray-900">{formatDate(ajudante.data_admissao)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AjudantesTable;
