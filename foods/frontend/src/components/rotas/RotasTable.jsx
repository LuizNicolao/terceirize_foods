import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Table } from '../ui';
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
  loadingFiliais
}) => {
  if (rotas.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Nenhuma rota encontrada
      </div>
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filial</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distância</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rotas.map((rota) => (
              <tr key={rota.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{rota.codigo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {loadingFiliais ? 'Carregando...' : getFilialName(rota.filial_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    rota.tipo_rota === 'semanal' ? 'bg-blue-100 text-blue-800' :
                    rota.tipo_rota === 'quinzenal' ? 'bg-purple-100 text-purple-800' :
                    rota.tipo_rota === 'mensal' ? 'bg-green-100 text-green-800' :
                    rota.tipo_rota === 'transferencia' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formatTipoRota(rota.tipo_rota)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.distancia_km} km</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(rota.custo_diario)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    rota.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {rota.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden space-y-3">
        {rotas.map((rota) => (
          <div key={rota.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{rota.nome}</h3>
                <p className="text-xs text-gray-500">ID: {rota.id} | Código: {rota.codigo}</p>
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
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Distância:</span>
                <span className="text-gray-900">{rota.distancia_km} km</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tipo:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  rota.tipo_rota === 'semanal' ? 'bg-blue-100 text-blue-800' :
                  rota.tipo_rota === 'quinzenal' ? 'bg-purple-100 text-purple-800' :
                  rota.tipo_rota === 'mensal' ? 'bg-green-100 text-green-800' :
                  rota.tipo_rota === 'transferencia' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {formatTipoRota(rota.tipo_rota)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Custo:</span>
                <span className="text-gray-900">{formatCurrency(rota.custo_diario)}</span>
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
