import React from 'react';
import { ActionButtons, Table, EmptyState } from '../ui';

const MarcasTable = ({ 
  marcas, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getStatusLabel
}) => {
  if (marcas.length === 0) {
    return (
      <EmptyState
        title="Nenhuma marca encontrada"
        description="Tente ajustar os filtros de busca ou adicionar uma nova marca"
        icon="marcas"
      />
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fabricante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {marcas.map((marca) => (
              <tr key={marca.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{marca.marca}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{marca.fabricante}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    marca.status === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusLabel(marca.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <ActionButtons
                    canView={canView('marcas')}
                    canEdit={canEdit('marcas')}
                    canDelete={canDelete('marcas')}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    item={marca}
                    size="xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {marcas.map((marca) => (
          <div key={marca.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{marca.marca}</h3>
                <p className="text-gray-600 text-xs">Fabricante: {marca.fabricante || '-'}</p>
              </div>
              <ActionButtons
                canView={canView('marcas')}
                canEdit={canEdit('marcas')}
                canDelete={canDelete('marcas')}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={marca}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Fabricante:</span>
                <p className="font-medium">{marca.fabricante}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  marca.status === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(marca.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MarcasTable;
