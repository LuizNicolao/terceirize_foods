import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Table } from '../ui';

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filial</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distância</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rotas.map((rota) => (
              <tr key={rota.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {loadingFiliais ? (
                    <span className="text-gray-400">Carregando...</span>
                  ) : (
                    getFilialName(rota.filial_id)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.codigo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.distancia_km}</td>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(rota.custo_diario)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    rota.status === 'ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rota.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onView(rota)}
                      title="Visualizar"
                    >
                      <FaEye className="text-green-600 text-sm" />
                    </Button>
                    {canEdit('rotas') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onEdit(rota)}
                        title="Editar"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('rotas') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onDelete(rota.id)}
                        title="Excluir"
                      >
                        <FaTrash className="text-red-600 text-sm" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden space-y-3">
        {rotas.map((rota) => (
          <div key={rota.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{rota.nome}</h3>
                <p className="text-gray-600 text-xs">ID: {rota.id} | Código: {rota.codigo}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onView(rota)}
                  title="Visualizar"
                  className="p-2"
                >
                  <FaEye className="text-green-600 text-sm" />
                </Button>
                {canEdit('rotas') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onEdit(rota)}
                    title="Editar"
                    className="p-2"
                  >
                    <FaEdit className="text-blue-600 text-sm" />
                  </Button>
                )}
                {canDelete('rotas') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onDelete(rota.id)}
                    title="Excluir"
                    className="p-2"
                  >
                    <FaTrash className="text-red-600 text-sm" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Filial:</span>
                <p className="font-medium">
                  {loadingFiliais ? 'Carregando...' : getFilialName(rota.filial_id)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Distância:</span>
                <p className="font-medium">{rota.distancia_km} km</p>
              </div>
              <div>
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
              <div>
                <span className="text-gray-500">Custo:</span>
                <p className="font-medium">{formatCurrency(rota.custo_diario)}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                rota.status === 'ativo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {rota.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RotasTable;
