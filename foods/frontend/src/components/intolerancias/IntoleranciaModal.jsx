import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input } from '../ui';

const IntoleranciaModal = ({ 
  show: isOpen, 
  onClose, 
  onSubmit, 
  intolerancia = null, 
  viewMode: isViewMode = false,
  loading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  // Resetar formulário quando modal abrir/fechar
  React.useEffect(() => {
    if (isOpen) {
      if (intolerancia) {
        setValue('nome', intolerancia.nome);
        setValue('status', intolerancia.status);
      } else {
        reset();
      }
    }
  }, [isOpen, intolerancia, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isViewMode ? 'Visualizar Intolerância' : intolerancia ? 'Editar Intolerância' : 'Nova Intolerância'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <Input
            label="Nome"
            {...register('nome', { 
              required: 'Nome é obrigatório',
              minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
              maxLength: { value: 100, message: 'Nome deve ter no máximo 100 caracteres' }
            })}
            error={errors.nome?.message}
            disabled={isViewMode || loading}
            placeholder="Digite o nome da intolerância"
          />
        </div>

        <div>
          <Input
            label="Status"
            type="select"
            {...register('status')}
            error={errors.status?.message}
            disabled={isViewMode || loading}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Input>
        </div>

        {!isViewMode && (
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              {intolerancia ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}

        {isViewMode && (
          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Fechar
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default IntoleranciaModal;
