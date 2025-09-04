import React from 'react';
import { FaEdit, FaTrash, FaExchangeAlt, FaEye, FaBuilding, FaBox } from 'react-icons/fa';
import { Button } from '../ui';
import { EmptyState } from '../ui';

const PatrimoniosTable = ({ 
  patrimonios, 
  loading, 
  selectedPatrimonio, 
  onPatrimonioSelect,
  pagination,
  onPageChange,
  onLimitChange,
  canView,
  canEdit,
  canDelete,
  canMovimentar,
  onEdit,
  onDelete,
  onMovimentar,
  onViewMovimentacoes
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Carregando patrimônios...</span>
      </div>
    );
  }

  if (patrimonios.length === 0) {
    return (
      <EmptyState
        title="Nenhum patrimônio encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo patrimônio"
        icon="patrimonios"
      />
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      ativo: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      manutencao: { color: 'bg-yellow-100 text-yellow-800', label: 'Manutenção' },
      obsoleto: { color: 'bg-red-100 text-red-800', label: 'Obsoleto' },
      inativo: { color: 'bg-gray-100 text-gray-800', label: 'Inativo' }
    };

    const config = statusConfig[status] || statusConfig.inativo;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabela Desktop */}
      <div className="hidden xl:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patrimônio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localização Atual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Aquisição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patrimonios.map((patrimonio) => (
              <tr 
                key={patrimonio.id}
                className={`hover:bg-gray-50 ${
                  selectedPatrimonio?.id === patrimonio.id ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaBuilding className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {patrimonio.numero_patrimonio}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {patrimonio.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <FaBox className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {patrimonio.nome_produto}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patrimonio.codigo_produto} • {patrimonio.grupo}
                      </div>
                      {(patrimonio.marca || patrimonio.fabricante) && (
                        <div className="text-xs text-gray-400 mt-1">
                          {patrimonio.marca && `Marca: ${patrimonio.marca}`}
                          {patrimonio.marca && patrimonio.fabricante && ' • '}
                          {patrimonio.fabricante && `Fabricante: ${patrimonio.fabricante}`}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {patrimonio.local_atual_nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(patrimonio.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {patrimonio.data_aquisicao ? new Date(patrimonio.data_aquisicao).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {canView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPatrimonioSelect(patrimonio);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visualizar"
                      >
                        <FaEye className="h-4 w-4" />
                      </Button>
                    )}
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(patrimonio);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <FaEdit className="h-4 w-4" />
                      </Button>
                    )}
                    {canMovimentar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovimentar(patrimonio);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                        title="Movimentar"
                      >
                        <FaExchangeAlt className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(patrimonio);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <FaTrash className="h-4 w-4" />
                    </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {patrimonios.map((patrimonio) => (
          <div 
            key={patrimonio.id}
            className={`bg-white rounded-lg shadow-sm p-4 border ${
              selectedPatrimonio?.id === patrimonio.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {/* Header do card */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaBuilding className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {patrimonio.numero_patrimonio}
                  </h3>
                  <p className="text-gray-600 text-xs">ID: {patrimonio.id}</p>
                </div>
              </div>
              {getStatusBadge(patrimonio.status)}
            </div>
            
            {/* Informações do produto */}
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <FaBox className="h-4 w-4 text-green-600 mr-2" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {patrimonio.nome_produto}
                  </div>
                  <div className="text-xs text-gray-500">
                    {patrimonio.codigo_produto} • {patrimonio.grupo}
                  </div>
                </div>
              </div>
              {(patrimonio.marca || patrimonio.fabricante) && (
                <div className="text-xs text-gray-400 ml-6">
                  {patrimonio.marca && `Marca: ${patrimonio.marca}`}
                  {patrimonio.marca && patrimonio.fabricante && ' • '}
                  {patrimonio.fabricante && `Fabricante: ${patrimonio.fabricante}`}
                </div>
              )}
            </div>
            
            {/* Grid de informações */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <span className="text-gray-500">Localização:</span>
                <p className="font-medium text-gray-900">{patrimonio.local_atual_nome}</p>
                <p className="text-gray-500">{patrimonio.local_atual_endereco}</p>
              </div>
              <div>
                <span className="text-gray-500">Data Aquisição:</span>
                <p className="font-medium text-gray-900">
                  {patrimonio.data_aquisicao ? new Date(patrimonio.data_aquisicao).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
              {canView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPatrimonioSelect(patrimonio);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                  title="Visualizar"
                >
                  <FaEye className="h-4 w-4" />
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(patrimonio);
                  }}
                  className="text-green-600 hover:text-green-900"
                  title="Editar"
                >
                  <FaEdit className="h-4 w-4" />
                </Button>
              )}
              {canMovimentar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMovimentar(patrimonio);
                  }}
                  className="text-orange-600 hover:text-orange-900"
                  title="Movimentar"
                >
                  <FaExchangeAlt className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(patrimonio);
                  }}
                  className="text-red-600 hover:text-red-900"
                  title="Excluir"
                >
                  <FaTrash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Próxima
            </Button>
          </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">
                      {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}
                    </span>
                    {' '}a{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{pagination.totalItems}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="rounded-l-md"
                    >
                      Anterior
                    </Button>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.currentPage ? "primary" : "outline"}
                          size="sm"
                          onClick={() => onPageChange(page)}
                          className="rounded-none"
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="rounded-r-md"
                    >
                      Próxima
                    </Button>
                  </nav>
                </div>
              </div>
        </div>
      )}
    </div>
  );
};

export default PatrimoniosTable;
