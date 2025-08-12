import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../ui';

const MarcaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  marca, 
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  React.useEffect(() => {
    if (marca && isOpen) {
      // Preencher formulário com dados da marca
      Object.keys(marca).forEach(key => {
        if (marca[key] !== null && marca[key] !== undefined) {
          setValue(key, marca[key]);
        }
      });
    } else if (!marca && isOpen) {
      // Resetar formulário para nova marca
      reset();
      setValue('status', 1);
    }
  }, [marca, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Marca' : marca ? 'Editar Marca' : 'Adicionar Marca'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Marca *"
            type="text"
            {...register('marca', { required: 'Marca é obrigatória' })}
            error={errors.marca?.message}
            disabled={isViewMode}
          />
          <Input
            label="Fabricante *"
            type="text"
            {...register('fabricante', { required: 'Fabricante é obrigatório' })}
            error={errors.fabricante?.message}
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
              {marca ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default MarcaModal;
