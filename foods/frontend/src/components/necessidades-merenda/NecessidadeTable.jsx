import React from 'react';
import { FaEye, FaEdit, FaTrash, FaPlay, FaPause, FaFileAlt, FaShoppingCart } from 'react-icons/fa';
import { ActionButtons, EmptyState } from '../ui';

const NecessidadeTable = ({
  necessidades,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  onPreview,
  loading
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pendente: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      aprovado: { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      rejeitado: { color: 'bg-red-100 text-red-800', label: 'Rejeitado' },
      ativo: { color: 'bg-green-100 text-green-800', label: 'Ativo' }
    };

    const config = statusConfig[status] || statusConfig.pendente;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Carregando necessidades...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!necessidades || necessidades.length === 0) {
    return (
      <EmptyState
        icon={FaShoppingCart}
        title="Nenhuma necessidade encontrada"
        description="Não há necessidades cadastradas ou que correspondam aos filtros aplicados."
        actionText="Criar Nova Necessidade"
        onAction={() => {}} // Será passado pelo componente pai
      />
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade Escolar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {necessidades.map((necessidade) => (
                <tr key={necessidade.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {necessidade.unidade_escola_nome || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {necessidade.filial_nome || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {necessidade.produto_nome || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {necessidade.receita_nome || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(necessidade.data)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <span className="font-medium">{necessidade.quantidade_total || 0}</span>
                      <span className="text-gray-500 ml-1">{necessidade.unidade_medida || ''}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {necessidade.quantidade_per_capita || 0} per capita
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(necessidade.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(necessidade.valor_total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={() => onView(necessidade)}
                      onEdit={() => onEdit(necessidade)}
                      onDelete={() => onDelete(necessidade)}
                      customActions={[
                        {
                          icon: FaFileAlt,
                          label: 'Preview',
                          onClick: () => onPreview(necessidade),
                          className: 'text-green-600 hover:text-green-900'
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {necessidades.map((necessidade) => (
          <div key={necessidade.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {necessidade.unidade_escola_nome || 'N/A'}
                </h3>
                <p className="text-sm text-gray-500">
                  {necessidade.produto_nome || 'N/A'}
                </p>
              </div>
              <div className="ml-4">
                {getStatusBadge(necessidade.status)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500">Data</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(necessidade.data)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantidade</p>
                <p className="text-sm font-medium text-gray-900">
                  {necessidade.quantidade_total || 0} {necessidade.unidade_medida || ''}
                </p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-gray-500">Valor Total</p>
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(necessidade.valor_total)}
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-2">
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={() => onView(necessidade)}
                onEdit={() => onEdit(necessidade)}
                onDelete={() => onDelete(necessidade)}
                customActions={[
                  {
                    icon: FaFileAlt,
                    label: 'Preview',
                    onClick: () => onPreview(necessidade),
                    className: 'text-blue-600 hover:text-blue-900'
                  }
                ]}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NecessidadeTable;
