import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const PdfTemplatesTable = ({
  templates,
  onView,
  onEdit,
  onDelete,
  canView,
  canEdit,
  canDelete,
  getTelaLabel
}) => {
  if (!templates || templates.length === 0) {
    return (
      <EmptyState
        title="Nenhum template encontrado"
        description="Não há templates de PDF cadastrados ou os filtros aplicados não retornaram resultados"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tela Vinculada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Padrão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => {
                return (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {template.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTelaLabel(template.tela_vinculada)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {template.descricao || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.padrao ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Sim
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Não
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.ativo ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {template.criado_em ? new Date(template.criado_em).toLocaleDateString('pt-BR') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <ActionButtons
                          canView={canView}
                          canEdit={canEdit}
                          canDelete={canDelete}
                          onView={onView ? () => onView(template.id) : null}
                          onEdit={onEdit ? () => onEdit(template.id) : null}
                          onDelete={onDelete ? () => onDelete(template) : null}
                          item={template}
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
        {templates.map((template) => {
          return (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.nome}
                  </h3>
                  <p className="text-sm text-gray-600">{getTelaLabel(template.tela_vinculada)}</p>
                </div>
                <div className="flex gap-2">
                  {template.padrao && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Padrão
                    </span>
                  )}
                  {template.ativo ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Inativo
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                {template.descricao && (
                  <div>
                    <span className="text-gray-600">Descrição: </span>
                    <span className="text-gray-900">{template.descricao}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Criado em: </span>
                  <span className="text-gray-900">
                    {template.criado_em ? new Date(template.criado_em).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <ActionButtons
                  canView={canView}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onView={onView ? () => onView(template.id) : null}
                  onEdit={onEdit ? () => onEdit(template.id) : null}
                  onDelete={onDelete ? () => onDelete(template) : null}
                  item={template}
                  size="sm"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PdfTemplatesTable;

