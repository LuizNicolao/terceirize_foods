import React from 'react';
import { Input } from '../../ui';

const InformacoesBasicasForm = ({ register, setValue, watch, errors, isViewMode, handleSistemaChange, handleTelaChange }) => {
  const sistemaRegister = register('sistema', {
    required: 'Sistema é obrigatório',
    minLength: {
      value: 1,
      message: 'Sistema deve ter no mínimo 1 caractere'
    },
    maxLength: {
      value: 100,
      message: 'Sistema deve ter no máximo 100 caracteres'
    },
    validate: (value) => {
      if (value && value.trim().length < 1) {
        return 'Sistema é obrigatório';
      }
      return true;
    }
  });

  const telaRegister = register('tela', {
    maxLength: {
      value: 255,
      message: 'Tela deve ter no máximo 255 caracteres'
    }
  });

  const handleSistemaChangeWithValidation = (e) => {
    handleSistemaChange(e);
    sistemaRegister.onChange(e);
  };

  const handleTelaChangeWithValidation = (e) => {
    handleTelaChange(e);
    telaRegister.onChange(e);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Informações do Chamado
      </h3>
      <div className="space-y-3">
        <Input
          label="Título *"
          {...register('titulo', {
            required: 'Título é obrigatório',
            minLength: {
              value: 3,
              message: 'Título deve ter no mínimo 3 caracteres'
            },
            maxLength: {
              value: 255,
              message: 'Título deve ter no máximo 255 caracteres'
            },
            validate: (value) => {
              if (value && value.trim().length < 3) {
                return 'Título deve ter no mínimo 3 caracteres';
              }
              return true;
            }
          })}
          disabled={isViewMode}
          error={errors.titulo?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Sistema *"
            {...sistemaRegister}
            onChange={handleSistemaChangeWithValidation}
            disabled={isViewMode}
            style={{ textTransform: 'uppercase' }}
            placeholder="Ex: IMPLANTACAO"
            error={errors.sistema?.message}
          />
          <Input
            label="Tela"
            {...telaRegister}
            onChange={handleTelaChangeWithValidation}
            disabled={isViewMode}
            placeholder="Rota/tela onde ocorreu (opcional)"
            style={{ textTransform: 'uppercase' }}
            error={errors.tela?.message}
          />
        </div>
        <Input
          label="Tipo *"
          type="select"
          {...register('tipo', {
            required: 'Tipo é obrigatório',
            validate: (value) => {
              const validTypes = ['bug', 'erro', 'melhoria', 'feature'];
              if (!validTypes.includes(value)) {
                return 'Tipo deve ser bug, erro, melhoria ou feature';
              }
              return true;
            }
          })}
          disabled={isViewMode}
          error={errors.tipo?.message}
        >
          <option value="">Selecione...</option>
          <option value="bug">Bug</option>
          <option value="erro">Erro</option>
          <option value="melhoria">Melhoria</option>
          <option value="feature">Feature</option>
        </Input>
      </div>
    </div>
  );
};

export default InformacoesBasicasForm;

