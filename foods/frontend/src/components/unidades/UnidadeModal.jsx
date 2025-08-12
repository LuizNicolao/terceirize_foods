import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../ui';

const UnidadeModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  unidade, 
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  React.useEffect(() => {
    if (unidade && isOpen) {
      // Preencher formulário com dados da unidade
      Object.keys(unidade).forEach(key => {
        if (unidade[key] !== null && unidade[key] !== undefined) {
          setValue(key, unidade[key]);
        }
      });
    } else if (!unidade && isOpen) {
      // Resetar formulário para nova unidade
      reset();
      setValue('status', 1);
    }
  }, [unidade, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Unidade' : unidade ? 'Editar Unidade' : 'Adicionar Unidade'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome *"
            type="text"
            {...register('nome', { required: 'Nome é obrigatório' })}
            error={errors.nome?.message}
            disabled={isViewMode}
          />
          <Input
            label="Sigla *"
            type="text"
            {...register('sigla', { required: 'Sigla é obrigatória' })}
            error={errors.sigla?.message}
            disabled={isViewMode}
          />
          {!isViewMode && (
            <Input
              label="Status"
              type="select"
              {...register('status')}
              error={errors.status?.message}
            >
              <option value={1}>Ativo</option>
              <option value={0}>Inativo</option>
            </Input>
          )}
        </div>

        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              {unidade ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UnidadeModal;
