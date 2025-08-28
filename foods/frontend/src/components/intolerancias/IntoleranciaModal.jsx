import React from 'react';
import { Modal, Button, Input } from '../ui';
import { useForm } from 'react-hook-form';

const IntoleranciaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  intolerancia, 
  isViewMode = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm({
    defaultValues: {
      nome: intolerancia?.nome || '',
      status: intolerancia?.status || 'ativo'
    }
  });

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' }
  ];

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  React.useEffect(() => {
    if (intolerancia) {
      reset({
        nome: intolerancia.nome || '',
        status: intolerancia.status || 'ativo'
      });
    } else {
      reset({
        nome: '',
        status: 'ativo'
      });
    }
  }, [intolerancia, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isViewMode ? 'Visualizar Intolerância' : intolerancia ? 'Editar Intolerância' : 'Nova Intolerância'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome *
          </label>
          <Input
            id="nome"
            type="text"
            placeholder="Digite o nome da intolerância"
            {...register('nome', {
              required: 'Nome é obrigatório',
              minLength: {
                value: 2,
                message: 'Nome deve ter pelo menos 2 caracteres'
              },
              maxLength: {
                value: 100,
                message: 'Nome deve ter no máximo 100 caracteres'
              },
              pattern: {
                value: /^[a-zA-ZÀ-ÿ\s]+$/,
                message: 'Nome deve conter apenas letras e espaços'
              }
            })}
            error={errors.nome?.message}
            disabled={isViewMode}
            className="w-full"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Informações de Auditoria (apenas visualização) */}
        {isViewMode && intolerancia && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID
              </label>
              <p className="text-sm text-gray-900">{intolerancia.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Criado em
              </label>
              <p className="text-sm text-gray-900">
                {new Date(intolerancia.criado_em).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Atualizado em
              </label>
              <p className="text-sm text-gray-900">
                {new Date(intolerancia.atualizado_em).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {isViewMode ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isViewMode && (
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {intolerancia ? 'Atualizar' : 'Criar'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default IntoleranciaModal;
