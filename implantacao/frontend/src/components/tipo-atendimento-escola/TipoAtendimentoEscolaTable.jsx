import React from 'react';
import { EmptyState, ActionButtons } from '../ui';

const TipoAtendimentoEscolaTable = ({ 
  vinculos, 
  loading, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete,
  formatarTipoAtendimento
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!vinculos || vinculos.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <EmptyState
          title="Nenhum vínculo encontrado"
          description="Tente ajustar os filtros de busca ou adicionar um novo vínculo"
          icon="escola"
        />
      </div>
    );
  }

  const getStatusBadge = (ativo) => {
    const statusConfig = {
      1: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      0: { label: 'Inativo', className: 'bg-red-100 text-red-800' },
      true: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      false: { label: 'Inativo', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[ativo] || { label: 'Desconhecido', className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const agregadosPorFilial = Array.from(
    vinculos.reduce((map, vinculo) => {
      const key = vinculo.filial_id ?? `sem-filial-${vinculo.escola_id}`;
      if (!map.has(key)) {
        map.set(key, {
          id: vinculo.id,
          filial_id: vinculo.filial_id,
          filial_nome: vinculo.filial_nome || 'Sem Filial',
          total_escolas: new Set(),
          tipos_atendimento: new Set(),
          ativoSet: new Set(),
          primaryRecord: vinculo
        });
      }
      const entry = map.get(key);
      entry.total_escolas.add(vinculo.escola_id);

      if (Array.isArray(vinculo.tipos_atendimento) && vinculo.tipos_atendimento.length > 0) {
        vinculo.tipos_atendimento.forEach(tipo => entry.tipos_atendimento.add(tipo));
      } else if (vinculo.tipo_atendimento) {
        entry.tipos_atendimento.add(vinculo.tipo_atendimento);
      }

      entry.ativoSet.add(Boolean(vinculo.ativo));
      return map;
    }, new Map()).values()
  ).map(entry => ({
    id: entry.id,
    filial_id: entry.filial_id,
    filial_nome: entry.filial_nome,
    total_escolas: entry.total_escolas.size,
    tipos_atendimento: Array.from(entry.tipos_atendimento),
    ativo: entry.ativoSet.has(true),
    primaryRecord: entry.primaryRecord
  }));

  const formatarListaTipos = (tipos = []) => {
    if (!Array.isArray(tipos) || tipos.length === 0) {
      return '-';
    }
    return tipos
      .map(tipo => formatarTipoAtendimento ? formatarTipoAtendimento(tipo) : tipo)
      .join(', ');
  };

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escolas com atendimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Atendimento
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agregadosPorFilial
                .sort((a, b) => (a.filial_nome || '').localeCompare(b.filial_nome || ''))
                .map((vinculo) => (
                <tr key={`${vinculo.filial_id ?? 'sem'}-${vinculo.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vinculo.filial_nome || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vinculo.total_escolas}
                      {vinculo.total_escolas === 1 ? ' escola' : ' escolas'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatarListaTipos(vinculo.tipos_atendimento)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getStatusBadge(vinculo.ativo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={() => onView(vinculo.primaryRecord)}
                      onEdit={() => onEdit(vinculo.primaryRecord)}
                      onDelete={() => onDelete(vinculo.primaryRecord)}
                      item={vinculo.primaryRecord}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile/Tablet - Cards */}
      <div className="xl:hidden space-y-4">
        {agregadosPorFilial
          .sort((a, b) => (a.filial_nome || '').localeCompare(b.filial_nome || ''))
          .map((vinculo) => (
          <div key={`${vinculo.filial_id ?? 'sem'}-${vinculo.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {vinculo.filial_nome || 'Filial não informada'}
                </p>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {vinculo.total_escolas}
                  {vinculo.total_escolas === 1 ? ' escola com atendimento' : ' escolas com atendimento'}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  {formatarListaTipos(vinculo.tipos_atendimento)}
                </p>
              </div>
              <div className="ml-4">
                {getStatusBadge(vinculo.ativo)}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={() => onView(vinculo.primaryRecord)}
                onEdit={() => onEdit(vinculo.primaryRecord)}
                onDelete={() => onDelete(vinculo.primaryRecord)}
                item={vinculo.primaryRecord}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TipoAtendimentoEscolaTable;

