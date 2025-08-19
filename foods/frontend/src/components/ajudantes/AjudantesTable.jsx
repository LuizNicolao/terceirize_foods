import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const AjudantesTable = ({
  ajudantes,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  getStatusLabel,
  formatDate
}) => {
  if (ajudantes.length === 0) {
    return (
      <EmptyState
        title="Nenhum ajudante encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo ajudante"
        icon="ajudantes"
      />
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
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admissão
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ajudante.cpf || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ajudante.telefone || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{ajudante.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      ajudante.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : ajudante.status === 'ferias'
                        ? 'bg-yellow-100 text-yellow-800'
                        : ajudante.status === 'licenca'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(ajudante.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ajudante.filial_nome || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ajudante.data_admissao ? formatDate(ajudante.data_admissao) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView('ajudantes')}
                      canEdit={canEdit('ajudantes')}
                      canDelete={canDelete('ajudantes')}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={ajudante}
                      size="xs"
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
          <div key={ajudante.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{ajudante.nome}</h3>
                <p className="text-gray-600 text-xs">CPF: {ajudante.cpf || 'N/A'}</p>
              </div>
              <ActionButtons
                canView={canView('ajudantes')}
                canEdit={canEdit('ajudantes')}
                canDelete={canDelete('ajudantes')}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={ajudante}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">CPF:</span>
                <p className="font-medium">{ajudante.cpf || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Telefone:</span>
                <p className="font-medium">{ajudante.telefone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{ajudante.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Filial:</span>
                <p className="font-medium">{ajudante.filial_nome || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Admissão:</span>
                <p className="font-medium">{ajudante.data_admissao ? formatDate(ajudante.data_admissao) : 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  ajudante.status === 'ativo' 
                    ? 'bg-green-100 text-green-800' 
                    : ajudante.status === 'ferias'
                    ? 'bg-yellow-100 text-yellow-800'
                    : ajudante.status === 'licenca'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(ajudante.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AjudantesTable;
