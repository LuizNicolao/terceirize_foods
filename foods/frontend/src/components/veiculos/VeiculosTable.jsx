import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Table, EmptyState , SortableTableHeader } from '../ui';
import VeiculosActions from './VeiculosActions';

const VeiculosTable = ({ 
  veiculos, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getStatusLabel,
  getTipoVeiculoLabel,
  getCategoriaLabel,
  formatCurrency
,
  sortField,
  sortDirection,
  onSort
}) => {
  if (veiculos.length === 0) {
    return (
      <EmptyState
        title="Nenhum veículo encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo veículo"
        icon="veiculos"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {veiculos.map((veiculo) => (
              <tr key={veiculo.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{veiculo.placa}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {veiculo.marca} {veiculo.modelo}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    veiculo.tipo_veiculo === 'caminhao' ? 'bg-blue-100 text-blue-800' :
                    veiculo.tipo_veiculo === 'van' ? 'bg-green-100 text-green-800' :
                    veiculo.tipo_veiculo === 'carro' ? 'bg-purple-100 text-purple-800' :
                    veiculo.tipo_veiculo === 'moto' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getTipoVeiculoLabel(veiculo.tipo_veiculo)}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {getCategoriaLabel(veiculo.categoria)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    veiculo.status === 'ativo' ? 'bg-green-100 text-green-800' :
                    veiculo.status === 'inativo' ? 'bg-red-100 text-red-800' :
                    veiculo.status === 'manutencao' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(veiculo.status)}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <VeiculosActions
                    veiculo={veiculo}
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
        {veiculos.map((veiculo) => (
          <div key={veiculo.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{veiculo.placa}</h3>
                <p className="text-xs text-gray-500">Placa: {veiculo.placa}</p>
              </div>
              <VeiculosActions
                veiculo={veiculo}
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
                <span className="text-gray-500">Marca/Modelo:</span>
                <span className="text-gray-900">{veiculo.marca} {veiculo.modelo}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tipo:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  veiculo.tipo_veiculo === 'caminhao' ? 'bg-blue-100 text-blue-800' :
                  veiculo.tipo_veiculo === 'van' ? 'bg-green-100 text-green-800' :
                  veiculo.tipo_veiculo === 'carro' ? 'bg-purple-100 text-purple-800' :
                  veiculo.tipo_veiculo === 'moto' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getTipoVeiculoLabel(veiculo.tipo_veiculo)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Categoria:</span>
                <span className="text-gray-900">{getCategoriaLabel(veiculo.categoria)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  veiculo.status === 'ativo' ? 'bg-green-100 text-green-800' :
                  veiculo.status === 'inativo' ? 'bg-red-100 text-red-800' :
                  veiculo.status === 'manutencao' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusLabel(veiculo.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default VeiculosTable;
