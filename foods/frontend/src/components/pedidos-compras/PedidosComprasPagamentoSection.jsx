import React from 'react';
import { SearchableSelect } from '../ui';

const PedidosComprasPagamentoSection = ({
  watch,
  setValue,
  formasPagamento,
  prazosPagamento,
  isViewMode
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Forma de Pagamento
        </label>
        <SearchableSelect
          options={formasPagamento.map(fp => ({
            value: fp.id.toString(),
            label: fp.nome
          }))}
          value={watch('forma_pagamento_id')?.toString() || ''}
          onChange={(value) => {
            setValue('forma_pagamento_id', value ? parseInt(value) : null);
          }}
          disabled={isViewMode}
          placeholder="Selecione uma forma de pagamento"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prazo de Pagamento
        </label>
        <SearchableSelect
          options={prazosPagamento.map(pp => ({
            value: pp.id.toString(),
            label: pp.nome
          }))}
          value={watch('prazo_pagamento_id')?.toString() || ''}
          onChange={(value) => {
            setValue('prazo_pagamento_id', value ? parseInt(value) : null);
          }}
          disabled={isViewMode}
          placeholder="Selecione um prazo de pagamento"
        />
      </div>
    </div>
  );
};

export default PedidosComprasPagamentoSection;

