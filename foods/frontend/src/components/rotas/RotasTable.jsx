import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Table, EmptyState, SortableTableHeader } from '../ui';
import RotasActions from './RotasActions';

const RotasTable = ({ 
  rotas, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getFilialName,
  formatCurrency,
  formatTipoRota,
  loadingFiliais,
  sortField,
  sortDirection,
  onSort
}) => {
  if (rotas.length === 0) {
    return (
      <EmptyState
        title="Nenhuma rota encontrada"
        description="Tente ajustar os filtros de busca ou adicionar uma nova rota"
        icon="rotas"
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
              <SortableTableHeader label="Código" field="codigo" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
              <SortableTableHeader label="Nome" field="nome" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
              <SortableTableHeader label="Filial" field="filial_id" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
              <SortableTableHeader label="Tipo de Rota" field="tipo_rota_nome" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
              <SortableTableHeader label="Frequência" field="frequencia_entrega" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
              <SortableTableHeader label="Status" field="status" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rotas.map((rota) => (
              <tr key={rota.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{rota.codigo}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{rota.nome}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {loadingFiliais ? 'Carregando...' : getFilialName(rota.filial_id)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {rota.tipo_rota_nome || <span className="text-gray-400 italic">Não informado</span>}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    rota.frequencia_entrega === 'semanal' ? 'bg-blue-100 text-blue-800' :
                    rota.frequencia_entrega === 'quinzenal' ? 'bg-purple-100 text-purple-800' :
                    rota.frequencia_entrega === 'mensal' ? 'bg-green-100 text-green-800' :
                    rota.frequencia_entrega === 'transferencia' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formatTipoRota(rota.frequencia_entrega)}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    rota.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {rota.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <RotasActions
                    rota={rota}
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
        </Table>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {rotas.map((rota) => (
          <div key={rota.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{rota.nome}</h3>
                <p className="text-xs text-gray-500">Código: {rota.codigo}</p>
                {rota.tipo_rota_nome && (
                  <p className="text-xs text-gray-600 mt-1">Tipo: {rota.tipo_rota_nome}</p>
                )}
              </div>
              <RotasActions
                rota={rota}
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Filial:</span>
                <span className="text-gray-900">
                  {loadingFiliais ? 'Carregando...' : getFilialName(rota.filial_id)}
                </span>
              </div>
              
              {rota.tipo_rota_nome && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo de Rota:</span>
                  <span className="text-gray-900">{rota.tipo_rota_nome}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Frequência:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  rota.frequencia_entrega === 'semanal' ? 'bg-blue-100 text-blue-800' :
                  rota.frequencia_entrega === 'quinzenal' ? 'bg-purple-100 text-purple-800' :
                  rota.frequencia_entrega === 'mensal' ? 'bg-green-100 text-green-800' :
                  rota.frequencia_entrega === 'transferencia' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {formatTipoRota(rota.frequencia_entrega)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  rota.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {rota.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RotasTable;
