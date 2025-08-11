import React from 'react';
import AjudantesActions from './AjudantesActions';

const AjudantesTable = ({
  ajudantes,
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusLabel(ajudante.status).color}`}>
                      {getStatusLabel(ajudante.status).label}
                    </span>
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
                <p className="text-xs text-gray-500">CPF: {ajudante.cpf || '-'}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(ajudante.status).color}`}>
                {getStatusLabel(ajudante.status).label}
              </span>
            </div>
            
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-medium">Telefone:</span> {ajudante.telefone || '-'}</p>
              <p><span className="font-medium">Email:</span> {ajudante.email || '-'}</p>
              <p><span className="font-medium">Filial:</span> {ajudante.filial_nome || '-'}</p>
              <p><span className="font-medium">Admissão:</span> {formatDate(ajudante.data_admissao)}</p>
            </div>
            
            <div className="mt-3 flex gap-2">
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
          </div>
        ))}
      </div>
    </>
  );
};

export default AjudantesTable;
