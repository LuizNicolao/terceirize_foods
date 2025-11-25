import React from 'react';
import { FaEye, FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActionButtons, EmptyState, Button } from '../ui';

const SolicitacoesComprasTable = ({
  solicitacoes,
  onView,
  onEdit,
  onDelete,
  onPrint,
  canView,
  canEdit,
  canDelete,
  canPrint,
  getFilialName,
  getStatusLabel,
  selectedIds = [],
  onSelectAll,
  onSelectItem,
  onImprimirLote,
  loadingPrint = false
}) => {
  if (!solicitacoes || solicitacoes.length === 0) {
    return (
      <EmptyState
        title="Nenhuma solicitação encontrada"
        description="Não há solicitações de compras cadastradas ou os filtros aplicados não retornaram resultados"
        icon="file"
      />
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const allSelected = solicitacoes.length > 0 && selectedIds.length === solicitacoes.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < solicitacoes.length;

  return (
    <>
      {/* Barra de Ações em Lote */}
      {selectedIds.length > 0 && (
        <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedIds.length} solicitação(ões) selecionada(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onImprimirLote}
                disabled={loadingPrint}
                loading={loadingPrint}
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
              >
                <FaPrint className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir Solicitações</span>
                <span className="sm:hidden">Imprimir</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Versão Desktop - Tabela completa */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Entrega CD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semana Abastecimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Justificativa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Criação
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {solicitacoes.map((solicitacao) => {
                const statusInfo = getStatusLabel(solicitacao.status);
                const isSelected = selectedIds.includes(solicitacao.id);
                return (
                  <tr key={solicitacao.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-green-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectItem(solicitacao.id, e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {solicitacao.numero_solicitacao}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getFilialName(solicitacao.filial_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {solicitacao.solicitante || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(solicitacao.data_entrega_cd)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {solicitacao.semana_abastecimento || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {solicitacao.justificativa || solicitacao.motivo || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(solicitacao.criado_em)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <ActionButtons
                          canView={canView}
                          canEdit={canEdit && solicitacao.status === 'aberto'}
                          canDelete={canDelete && solicitacao.status === 'aberto'}
                          canPrint={canPrint}
                          onView={onView ? () => onView(solicitacao.id) : null}
                          onEdit={onEdit && solicitacao.status === 'aberto' ? () => onEdit(solicitacao.id) : null}
                          onDelete={onDelete && solicitacao.status === 'aberto' ? () => onDelete(solicitacao) : null}
                          onPrint={onPrint ? () => onPrint(solicitacao.id) : null}
                          item={solicitacao}
                          size="xs"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden space-y-4">
        {solicitacoes.map((solicitacao) => {
          const statusInfo = getStatusLabel(solicitacao.status);
          const isSelected = selectedIds.includes(solicitacao.id);
          return (
            <div key={solicitacao.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${isSelected ? 'ring-2 ring-green-500' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectItem(solicitacao.id, e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {solicitacao.numero_solicitacao}
                    </h3>
                    <p className="text-sm text-gray-600">{getFilialName(solicitacao.filial_id)}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Solicitante:</span>
                  <span className="text-gray-900">{solicitacao.solicitante || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Entrega CD:</span>
                  <span className="text-gray-900">{formatDate(solicitacao.data_entrega_cd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Justificativa:</span>
                  <span className="text-gray-900">{solicitacao.justificativa || solicitacao.motivo || '-'}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                {canView && onView && (
                  <button
                    onClick={() => onView(solicitacao.id)}
                    className="text-green-600 hover:text-green-900 p-2 rounded transition-colors"
                    title="Visualizar"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                )}
                {canEdit && solicitacao.status === 'aberto' && onEdit && (
                  <button
                    onClick={() => onEdit(solicitacao.id)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded transition-colors"
                    title="Editar"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                )}
                {canPrint && onPrint && (
                  <button
                    onClick={() => onPrint(solicitacao.id)}
                    className="text-purple-600 hover:text-purple-900 p-2 rounded transition-colors"
                    title="Imprimir"
                  >
                    <FaPrint className="w-4 h-4" />
                  </button>
                )}
                {canDelete && solicitacao.status === 'aberto' && onDelete && (
                  <button
                    onClick={() => onDelete(solicitacao)}
                    className="text-red-600 hover:text-red-900 p-2 rounded transition-colors"
                    title="Excluir"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SolicitacoesComprasTable;

