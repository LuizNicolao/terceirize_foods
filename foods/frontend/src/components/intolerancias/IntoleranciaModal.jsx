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
      title={isViewMode ? 'Visualizar Intolerância' : intolerancia ? 'Editar Intolerância' : 'Adicionar Intolerância'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome *"
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
          />
          <Input
            label="Status"
            type="select"
            {...register('status')}
            error={errors.status?.message}
            disabled={isViewMode}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Input>
        </div>



        {/* Botões */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
            >
              {intolerancia ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default IntoleranciaModal;
