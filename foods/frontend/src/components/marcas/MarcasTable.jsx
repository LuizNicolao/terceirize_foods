import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Table } from '../ui';

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
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Nenhuma marca encontrada
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fabricante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {marcas.map((marca) => (
              <tr key={marca.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{marca.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{marca.marca}</td>
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
                  <div className="flex gap-2">
                    {canView('marcas') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onView(marca)}
                        title="Visualizar"
                      >
                        <FaEye className="text-green-600 text-sm" />
                      </Button>
                    )}
                    {canEdit('marcas') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onEdit(marca)}
                        title="Editar"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('marcas') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onDelete(marca.id)}
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
        {marcas.map((marca) => (
          <div key={marca.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{marca.marca}</h3>
                <p className="text-gray-600 text-xs">ID: {marca.id}</p>
              </div>
              <div className="flex gap-2">
                {canView('marcas') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onView(marca)}
                    title="Visualizar"
                    className="p-2"
                  >
                    <FaEye className="text-green-600 text-sm" />
                  </Button>
                )}
                {canEdit('marcas') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onEdit(marca)}
                    title="Editar"
                    className="p-2"
                  >
                    <FaEdit className="text-blue-600 text-sm" />
                  </Button>
                )}
                {canDelete('marcas') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onDelete(marca.id)}
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
