import React from 'react';
import { SearchableSelect } from '../ui';

const PedidosComprasSolicitacaoSelect = ({
  solicitacoesDisponiveis,
  watch,
  setValue,
  errors,
  isViewMode,
  pedidoCompras
}) => {
  if (pedidoCompras) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Solicitação de Compras <span className="text-red-500">*</span>
      </label>
      <SearchableSelect
        options={solicitacoesDisponiveis.map(s => ({
          value: s.id.toString(),
          label: `${s.numero_solicitacao || 'SC'} - ${s.filial_nome || 'Filial'} - Entrega: ${s.data_entrega_cd || ''}`
        }))}
        value={watch('solicitacao_compras_id')?.toString() || ''}
        onChange={(value) => {
          setValue('solicitacao_compras_id', parseInt(value));
        }}
        disabled={isViewMode}
        placeholder="Selecione uma solicitação"
        error={errors.solicitacao_compras_id?.message}
      />
    </div>
  );
};

export default PedidosComprasSolicitacaoSelect;

