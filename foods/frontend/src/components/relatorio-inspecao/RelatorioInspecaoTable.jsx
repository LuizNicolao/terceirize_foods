import React from 'react';
import { FaEye, FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import { ActionButtons, EmptyState } from '../ui';

const RelatorioInspecaoTable = ({
  rirs,
  onView,
  onEdit,
  onDelete,
  onPrint,
  canView,
  canEdit,
  canDelete,
  canPrint,
  getStatusBadge
}) => {
  if (!rirs || rirs.length === 0) {
    return (
      <EmptyState
        title="Nenhum relatório encontrado"
        description="Não há relatórios de inspeção cadastrados ou os filtros aplicados não retornaram resultados"
        icon="file"
      />
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº NF
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº Pedido
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produtos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resultado Geral
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rirs.map((rir) => (
                <tr key={rir.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{rir.id.toString().padStart(4, '0')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {rir.numero_nota_fiscal || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {rir.numero_pedido || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="max-w-xs truncate" title={rir.fornecedor}>
                      {rir.fornecedor || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {rir.total_produtos || 0} {rir.total_produtos === 1 ? 'item' : 'itens'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge ? getStatusBadge(rir.resultado_geral) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {rir.resultado_geral || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {rir.status === 'FINALIZADO' ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Finalizado
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Disponível
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {rir.usuario_nome || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      canPrint={canPrint}
                      onView={onView ? (item) => onView(item.id) : null}
                      onEdit={onEdit ? (item) => onEdit(item.id) : null}
                      onDelete={onDelete ? (item) => onDelete(item) : null}
                      onPrint={onPrint ? (item) => onPrint(item.id) : null}
                      item={rir}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden space-y-4">
        {rirs.map((rir) => (
          <div key={rir.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  #{rir.id.toString().padStart(4, '0')}
                </h3>
              </div>
              <div className="flex gap-2">
              {getStatusBadge ? getStatusBadge(rir.resultado_geral) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {rir.resultado_geral || '-'}
                </span>
              )}
                {rir.status === 'FINALIZADO' ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Finalizado
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Disponível
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nº NF:</span>
                <span className="text-gray-900">{rir.numero_nota_fiscal || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nº Pedido:</span>
                <span className="text-gray-900">{rir.numero_pedido || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fornecedor:</span>
                <span className="text-gray-900">{rir.fornecedor || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Produtos:</span>
                <span className="text-gray-900">{rir.total_produtos || 0} {rir.total_produtos === 1 ? 'item' : 'itens'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resultado Geral:</span>
                <span className="text-gray-900">{rir.resultado_geral || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-gray-900">{rir.status === 'FINALIZADO' ? 'Finalizado' : 'Disponível'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Responsável:</span>
                <span className="text-gray-900">{rir.usuario_nome || '-'}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {canView && onView && (
                <button
                  onClick={() => onView(rir.id)}
                  className="text-green-600 hover:text-green-900 p-2 rounded transition-colors"
                  title="Visualizar"
                >
                  <FaEye className="w-4 h-4" />
                </button>
              )}
              {canEdit && onEdit && (
                <button
                  onClick={() => onEdit(rir.id)}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded transition-colors"
                  title="Editar"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
              {canPrint && onPrint && (
                <button
                  onClick={() => onPrint(rir.id)}
                  className="text-purple-600 hover:text-purple-900 p-2 rounded transition-colors"
                  title="Imprimir"
                >
                  <FaPrint className="w-4 h-4" />
                </button>
              )}
              {canDelete && onDelete && (
                <button
                  onClick={() => onDelete(rir)}
                  className="text-red-600 hover:text-red-900 p-2 rounded transition-colors"
                  title="Excluir"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RelatorioInspecaoTable;

