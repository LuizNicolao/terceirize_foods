import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../ui';

const AjudanteModal = ({
  isOpen,
  onClose,
  onSubmit,
  ajudante,
  isViewMode,
  filiais
}) => {
  const { register, handleSubmit, reset } = useForm();

  // Reset form when ajudante changes
  React.useEffect(() => {
    if (ajudante) {
      reset(ajudante);
    } else {
      reset({});
    }
  }, [ajudante, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isViewMode ? 'Visualizar Ajudante' : ajudante ? 'Editar Ajudante' : 'Adicionar Ajudante'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Pessoais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Informações Pessoais</h3>
            <div className="space-y-3">
              <Input
                label="Nome Completo *"
                {...register('nome')}
                disabled={isViewMode}
              />
              <Input
                label="CPF"
                {...register('cpf')}
                disabled={isViewMode}
              />
              <Input
                label="Email"
                type="email"
                {...register('email')}
                disabled={isViewMode}
              />
              <Input
                label="Telefone"
                {...register('telefone')}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 2: Informações Profissionais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Informações Profissionais</h3>
            <div className="space-y-3">
              <Input
                label="Data de Admissão"
                type="date"
                {...register('data_admissao')}
                disabled={isViewMode}
              />
              <Input
                label="Status *"
                type="select"
                {...register('status')}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="ferias">Em Férias</option>
                <option value="licenca">Em Licença</option>
              </Input>
              <Input
                label="Filial"
                type="select"
                {...register('filial_id')}
                disabled={isViewMode}
              >
                <option value="">Selecione a filial</option>
                {filiais?.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.filial}
                  </option>
                ))}
              </Input>
            </div>
          </div>
        </div>

        {/* Segunda Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 3: Endereço */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Endereço</h3>
            <div className="space-y-3">
              <Input
                label="Endereço"
                type="textarea"
                {...register('endereco')}
                disabled={isViewMode}
                rows={3}
              />
            </div>
          </div>

          {/* Card 4: Observações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Observações</h3>
            <div className="space-y-3">
              <Input
                label="Observações"
                type="textarea"
                {...register('observacoes')}
                disabled={isViewMode}
                rows={3}
              />
            </div>
          </div>
        </div>

        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              {ajudante ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default AjudanteModal;
