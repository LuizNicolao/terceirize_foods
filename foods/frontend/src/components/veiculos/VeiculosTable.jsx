import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Table } from '../ui';

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
}) => {
  if (veiculos.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Nenhum veículo encontrado
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{veiculo.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{veiculo.placa}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {veiculo.marca} {veiculo.modelo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getCategoriaLabel(veiculo.categoria)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    veiculo.status === 'ativo' ? 'bg-green-100 text-green-800' :
                    veiculo.status === 'inativo' ? 'bg-red-100 text-red-800' :
                    veiculo.status === 'manutencao' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(veiculo.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onView(veiculo)}
                      title="Visualizar"
                    >
                      <FaEye className="text-green-600 text-sm" />
                    </Button>
                    {canEdit('veiculos') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onEdit(veiculo)}
                        title="Editar"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('veiculos') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onDelete(veiculo.id)}
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
        {veiculos.map((veiculo) => (
          <div key={veiculo.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{veiculo.placa}</h3>
                <p className="text-gray-600 text-xs">ID: {veiculo.id} | {veiculo.marca} {veiculo.modelo}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onView(veiculo)}
                  title="Visualizar"
                  className="p-2"
                >
                  <FaEye className="text-green-600 text-sm" />
                </Button>
                {canEdit('veiculos') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onEdit(veiculo)}
                    title="Editar"
                    className="p-2"
                  >
                    <FaEdit className="text-blue-600 text-sm" />
                  </Button>
                )}
                {canDelete('veiculos') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onDelete(veiculo.id)}
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
                <span className="text-gray-500">Tipo:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-1 ${
                  veiculo.tipo_veiculo === 'caminhao' ? 'bg-blue-100 text-blue-800' :
                  veiculo.tipo_veiculo === 'van' ? 'bg-green-100 text-green-800' :
                  veiculo.tipo_veiculo === 'carro' ? 'bg-purple-100 text-purple-800' :
                  veiculo.tipo_veiculo === 'moto' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getTipoVeiculoLabel(veiculo.tipo_veiculo)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Categoria:</span>
                <p className="font-medium">{getCategoriaLabel(veiculo.categoria)}</p>
              </div>
              <div>
                <span className="text-gray-500">Chassi:</span>
                <p className="font-medium">{veiculo.chassi || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Ano:</span>
                <p className="font-medium">{veiculo.ano_fabricacao || '-'}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                veiculo.status === 'ativo' ? 'bg-green-100 text-green-800' :
                veiculo.status === 'inativo' ? 'bg-red-100 text-red-800' :
                veiculo.status === 'manutencao' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getStatusLabel(veiculo.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default VeiculosTable;
