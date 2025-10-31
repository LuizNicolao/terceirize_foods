import React from 'react';
import { Table, EmptyState, SortableTableHeader } from '../ui';
import TipoRotaActions from './TipoRotaActions';

const TipoRotaTable = ({ 
  tipoRotas, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getFilialName,
  getGrupoName,
  loadingFiliais,
  loadingGrupos,
  sortField,
  sortDirection,
  onSort
}) => {
  if (tipoRotas.length === 0) {
    return (
      <EmptyState
        title="Nenhum tipo de rota encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo tipo de rota"
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
              <SortableTableHeader label="Nome" field="nome" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
              <SortableTableHeader label="Filial" field="filial_id" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
              <SortableTableHeader label="Grupo" field="grupo_id" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
              <SortableTableHeader label="Status" field="status" currentSort={sortField} currentDirection={sortDirection} onSort={onSort} />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tipoRotas.map((tipoRota) => (
              <tr key={tipoRota.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{tipoRota.nome}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {loadingFiliais ? 'Carregando...' : getFilialName(tipoRota.filial_id)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {loadingGrupos ? 'Carregando...' : getGrupoName(tipoRota.grupo_id)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    tipoRota.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tipoRota.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <TipoRotaActions
                    tipoRota={tipoRota}
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
        {tipoRotas.map((tipoRota) => (
          <div key={tipoRota.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{tipoRota.nome}</h3>
              </div>
              <TipoRotaActions
                tipoRota={tipoRota}
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
                  {loadingFiliais ? 'Carregando...' : getFilialName(tipoRota.filial_id)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Grupo:</span>
                <span className="text-gray-900">
                  {loadingGrupos ? 'Carregando...' : getGrupoName(tipoRota.grupo_id)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  tipoRota.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {tipoRota.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TipoRotaTable;

