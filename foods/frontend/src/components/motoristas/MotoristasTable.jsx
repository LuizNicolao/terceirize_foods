import React from 'react';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCar, FaCalendarAlt, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Table, Button } from '../ui';

// Componente interno para ações da tabela
const TableActions = ({ 
  motorista, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="flex items-center gap-1">
      {canView('motoristas') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(motorista)}
          title="Visualizar"
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <FaEye className="w-3 h-3" />
        </Button>
      )}
      
      {canEdit('motoristas') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(motorista)}
          title="Editar"
          className="text-green-600 hover:text-green-800 hover:bg-green-50"
        >
          <FaEdit className="w-3 h-3" />
        </Button>
      )}
      
      {canDelete('motoristas') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(motorista.id)}
          title="Excluir"
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <FaTrash className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

const MotoristasTable = ({ 
  motoristas, 
  loading, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'ativo': { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      'inativo': { label: 'Inativo', className: 'bg-red-100 text-red-800' },
      'ferias': { label: 'Em Férias', className: 'bg-yellow-100 text-yellow-800' },
      'licenca': { label: 'Em Licença', className: 'bg-orange-100 text-orange-800' }
    };
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const getCategoriaCNHLabel = (categoria) => {
    if (!categoria) return '-';
    return categoria.toUpperCase();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Carregando motoristas...</p>
      </div>
    );
  }

  if (motoristas.length === 0) {
    return (
      <div className="text-center py-8">
        <FaUser className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum motorista encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">Comece criando um novo motorista.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motorista
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documentos
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
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {motoristas.map((motorista) => {
              const statusInfo = getStatusLabel(motorista.status);
              return (
                <tr key={motorista.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FaUser className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {motorista.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {motorista.cpf || 'CPF não informado'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaIdCard className="mr-2 text-gray-400" />
                        <span>CNH: {motorista.cnh || '-'}</span>
                      </div>
                      <div className="text-sm text-gray-500 ml-6">
                        Categoria: {getCategoriaCNHLabel(motorista.categoria_cnh)}
                      </div>
                      {motorista.cnh_validade && (
                        <div className="text-sm text-gray-500 ml-6">
                          Válida até: {formatDate(motorista.cnh_validade)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {motorista.telefone && (
                        <div className="flex items-center">
                          <FaPhone className="mr-2 text-gray-400" />
                          <span>{motorista.telefone}</span>
                        </div>
                      )}
                      {motorista.email && (
                        <div className="flex items-center mt-1">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          <span>{motorista.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {motorista.filial_nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <TableActions
                      motorista={motorista}
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {motoristas.map((motorista) => {
          const statusInfo = getStatusLabel(motorista.status);
          return (
            <div key={motorista.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FaUser className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{motorista.nome}</h3>
                    <p className="text-sm text-gray-500">{motorista.cpf || 'CPF não informado'}</p>
                  </div>
                </div>
                <TableActions
                  motorista={motorista}
                  canView={canView}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <FaIdCard className="mr-2 text-gray-400" />
                  <span>CNH: {motorista.cnh || '-'} ({getCategoriaCNHLabel(motorista.categoria_cnh)})</span>
                </div>
                
                {motorista.cnh_validade && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    <span>Válida até: {formatDate(motorista.cnh_validade)}</span>
                  </div>
                )}
                
                {motorista.telefone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-2 text-gray-400" />
                    <span>{motorista.telefone}</span>
                  </div>
                )}
                
                {motorista.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    <span>{motorista.email}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {motorista.filial_nome || 'Sem filial'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MotoristasTable;
