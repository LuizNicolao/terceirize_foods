import React from 'react';
import { FaBuilding, FaUser, FaUserTie, FaUserGraduate } from 'react-icons/fa';
import { ActionButtons, Table, EmptyState } from '../ui';

const RotasNutricionistasTable = ({ 
  rotasNutricionistas, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete,
  getUsuarioName,
  getSupervisorName,
  getCoordenadorName,
  loadingUsuarios
}) => {
  if (rotasNutricionistas.length === 0) {
    return (
      <EmptyState
        title="Nenhuma rota nutricionista encontrada"
        description="Tente ajustar os filtros de busca ou adicionar uma nova rota nutricionista"
        icon="rotas"
      />
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      ativo: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      inativo: { color: 'bg-red-100 text-red-800', label: 'Inativo' }
    };

    const config = statusConfig[status] || statusConfig.inativo;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordenador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rotasNutricionistas.map((rota) => (
              <tr key={rota.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaBuilding className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{rota.codigo}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <FaUser className="h-4 w-4 text-green-600 mr-2" />
                    <span>
                      {loadingUsuarios ? 'Carregando...' : getUsuarioName(rota.usuario_id)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <FaUserTie className="h-4 w-4 text-blue-600 mr-2" />
                    <span>
                      {loadingUsuarios ? 'Carregando...' : getSupervisorName(rota.supervisor_id)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <FaUserGraduate className="h-4 w-4 text-purple-600 mr-2" />
                    <span>
                      {loadingUsuarios ? 'Carregando...' : getCoordenadorName(rota.coordenador_id)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getStatusBadge(rota.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <ActionButtons
                    canView={canView}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    item={rota}
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
        {rotasNutricionistas.map((rota) => (
          <div key={rota.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            {/* Header do card */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center flex-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaBuilding className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">{rota.codigo}</h3>
                </div>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={rota}
                size="xs"
                className="p-2"
              />
            </div>
            
            {/* Status Badge */}
            <div className="mb-3">
              {getStatusBadge(rota.status)}
            </div>
            
            {/* Informações do usuário */}
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <FaUser className="h-4 w-4 text-green-600 mr-2" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {loadingUsuarios ? 'Carregando...' : getUsuarioName(rota.usuario_id)}
                  </div>
                  <div className="text-xs text-gray-500">Usuário</div>
                </div>
              </div>
            </div>

            {/* Informações do supervisor */}
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <FaUserTie className="h-4 w-4 text-blue-600 mr-2" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {loadingUsuarios ? 'Carregando...' : getSupervisorName(rota.supervisor_id)}
                  </div>
                  <div className="text-xs text-gray-500">Supervisor</div>
                </div>
              </div>
            </div>

            {/* Informações do coordenador */}
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <FaUserGraduate className="h-4 w-4 text-purple-600 mr-2" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {loadingUsuarios ? 'Carregando...' : getCoordenadorName(rota.coordenador_id)}
                  </div>
                  <div className="text-xs text-gray-500">Coordenador</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RotasNutricionistasTable;
