import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Table, EmptyState } from '../ui';
import UnidadesEscolaresActions from './UnidadesEscolaresActions';

const UnidadesEscolaresTable = ({ 
  unidades, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getRotaName,
  loadingRotas
}) => {
  if (unidades.length === 0) {
    return (
      <EmptyState
        title="Nenhuma unidade escolar encontrada"
        description="Tente ajustar os filtros de busca ou adicionar uma nova unidade escolar"
        icon="unidades-escolares"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Escola</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filial</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rota</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {unidades.map((unidade) => (
              <tr key={unidade.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{unidade.codigo_teknisa}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unidade.nome_escola}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unidade.cidade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unidade.estado}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unidade.filial_nome || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {loadingRotas ? 'Carregando...' : getRotaName(unidade.rota_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {unidade.ordem_entrega > 0 ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold">
                      {unidade.ordem_entrega}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    unidade.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <UnidadesEscolaresActions
                    unidade={unidade}
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
        {unidades.map((unidade) => (
          <div key={unidade.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{unidade.nome_escola}</h3>
                <p className="text-xs text-gray-500">Código: {unidade.codigo_teknisa}</p>
              </div>
              <UnidadesEscolaresActions
                unidade={unidade}
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
                <span className="text-gray-500">Cidade:</span>
                <span className="text-gray-900">{unidade.cidade}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estado:</span>
                <span className="text-gray-900">{unidade.estado}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rota:</span>
                <span className="text-gray-900">
                  {loadingRotas ? 'Carregando...' : getRotaName(unidade.rota_id)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ordem de Entrega:</span>
                <span className="text-gray-900">
                  {unidade.ordem_entrega > 0 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                      {unidade.ordem_entrega}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  unidade.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UnidadesEscolaresTable;
