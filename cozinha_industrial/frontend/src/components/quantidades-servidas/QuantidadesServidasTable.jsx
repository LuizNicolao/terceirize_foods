import React from 'react';
import { ActionButtons, EmptyState } from '../ui';
import { formatarDataParaExibicao } from '../../utils/recebimentos/recebimentosUtils';

const QuantidadesServidasTable = ({
  registros,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  loading
}) => {
  // Extrair períodos disponíveis do primeiro registro (todos os registros devem ter os mesmos períodos)
  const periodosDisponiveis = registros && registros.length > 0 && registros[0].periodos_disponiveis
    ? registros[0].periodos_disponiveis
    : [];
  const formatQuantidade = (valor) => {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0) {
      return '-';
    }
    return numero;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Carregando registros...</span>
      </div>
    );
  }

  if (!registros || registros.length === 0) {
    return (
      <EmptyState
        title="Nenhum registro encontrado"
        description="Adicione um novo registro diário para começar"
        icon="calendar"
      />
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipo de Cardápio</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Data</th>
                {periodosDisponiveis.map(periodo => (
                  <th key={periodo.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {periodo.nome || periodo.codigo || `Período ${periodo.id}`}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registros.map((registro) => {
                const quantidades = registro.quantidades || {};
                return (
                  <tr key={`${registro.unidade_id}-${registro.tipo_cardapio_id || 0}-${registro.data}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{registro.unidade_nome || `Unidade ID ${registro.unidade_id}`}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {registro.tipo_cardapio_info || 'Sem Tipo de Cardápio'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {formatarDataParaExibicao(registro.data)}
                    </td>
                    {periodosDisponiveis.map(periodo => {
                      const quantidadePeriodo = quantidades[periodo.id];
                      const valor = quantidadePeriodo?.valor || quantidadePeriodo || 0;
                      // Cores alternadas para melhor visualização
                      const cores = [
                        'bg-blue-100 text-blue-800',
                        'bg-green-100 text-green-800',
                        'bg-purple-100 text-purple-800',
                        'bg-orange-100 text-orange-800',
                        'bg-rose-100 text-rose-800',
                        'bg-yellow-100 text-yellow-800',
                        'bg-indigo-100 text-indigo-800',
                        'bg-pink-100 text-pink-800'
                      ];
                      const corIndex = periodo.id % cores.length;
                      return (
                        <td key={periodo.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                          <span className={`px-2 py-1 ${cores[corIndex]} rounded-full text-xs font-medium`}>
                            {formatQuantidade(valor)}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right">
                      <ActionButtons
                        canView={canView}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onView={() => onView(registro)}
                        onEdit={() => onEdit(registro)}
                        onDelete={() => onDelete(registro.unidade_id, registro.data, registro.unidade_nome, registro.tipo_cardapio_id)}
                        item={registro}
                        size="xs"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="xl:hidden space-y-3">
        {registros.map((registro) => {
          const quantidades = registro.quantidades || {};
          return (
            <div key={`${registro.unidade_id}-${registro.tipo_cardapio_id || 0}-${registro.data}`} className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{registro.unidade_nome || `Unidade ID ${registro.unidade_id}`}</h3>
                  <p className="text-gray-600 text-xs">
                    {formatarDataParaExibicao(registro.data)}
                    {registro.tipo_cardapio_info && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {registro.tipo_cardapio_info}
                      </span>
                    )}
                  </p>
                </div>
                <ActionButtons
                  canView={canView}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onView={() => onView(registro)}
                  onEdit={() => onEdit(registro)}
                  onDelete={() => onDelete(registro.unidade_id, registro.data, registro.unidade_nome, registro.tipo_cardapio_id)}
                  item={registro}
                  size="xs"
                  className="p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {periodosDisponiveis.map(periodo => {
                  const quantidadePeriodo = quantidades[periodo.id];
                  const valor = quantidadePeriodo?.valor || quantidadePeriodo || 0;
                  return (
                    <div key={periodo.id} className="flex justify-between items-center">
                      <span className="text-gray-500">{periodo.nome || periodo.codigo || `Período ${periodo.id}`}:</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">{formatQuantidade(valor)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default QuantidadesServidasTable;

