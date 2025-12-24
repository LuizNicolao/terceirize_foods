import React from 'react';
import { Input } from '../../ui';

const DescricaoForm = ({ register, errors, isViewMode }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Descrição
      </h3>
      <div>
        <Input
          label="Descrição *"
          type="textarea"
          {...register('descricao', {
            required: 'Descrição é obrigatória',
            minLength: {
              value: 10,
              message: 'Descrição deve ter no mínimo 10 caracteres'
            },
            validate: (value) => {
              if (value && value.trim().length < 10) {
                return 'Descrição deve ter no mínimo 10 caracteres';
              }
              return true;
            }
          })}
          disabled={isViewMode}
          rows={4}
          placeholder="Descreva o problema ou solicitação em detalhes (mínimo 10 caracteres)"
          error={errors.descricao?.message}
        />
        {!errors.descricao && (
          <p className="mt-1 text-xs text-gray-500">
            Mínimo de 10 caracteres. Seja descritivo para facilitar o entendimento do problema.
          </p>
        )}
      </div>
    </div>
  );
};

export default DescricaoForm;

