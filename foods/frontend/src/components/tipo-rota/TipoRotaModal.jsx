import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../ui';

const TipoRotaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  tipoRota, 
  isViewMode = false,
  filiais = [],
  loadingFiliais = false,
  grupos = [],
  loadingGrupos = false
}) => {
  const { register, handleSubmit, reset, setValue } = useForm();

  React.useEffect(() => {
    if (tipoRota && isOpen) {
      Object.keys(tipoRota).forEach(key => {
        if (tipoRota[key] !== null && tipoRota[key] !== undefined) {
          setValue(key, tipoRota[key]);
        }
      });
    } else if (!tipoRota && isOpen) {
      reset();
      setValue('status', 'ativo');
    }
  }, [tipoRota, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Tipo de Rota' : tipoRota ? 'Editar Tipo de Rota' : 'Adicionar Tipo de Rota'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <div className="space-y-3">
              <Input
                label="Nome da Rota *"
                type="text"
                placeholder="Nome da rota"
                {...register('nome')}
                disabled={isViewMode}
              />

              <Input
                label="Filial *"
                type="select"
                {...register('filial_id')}
                disabled={isViewMode || loadingFiliais}
              >
                <option value="">
                  {loadingFiliais ? 'Carregando filiais...' : 'Selecione uma filial'}
                </option>
                {filiais.map(filial => (
                  <option key={filial.id} value={filial.id}>
                    {filial.filial}
                  </option>
                ))}
              </Input>

              <Input
                label="Grupo *"
                type="select"
                {...register('grupo_id')}
                disabled={isViewMode || loadingGrupos}
              >
                <option value="">
                  {loadingGrupos ? 'Carregando grupos...' : 'Selecione um grupo'}
                </option>
                {grupos.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </Input>
            </div>
          </div>

          {/* Card 2: Configurações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Configurações
            </h3>
            <div className="space-y-3">
              <Input
                label="Status"
                type="select"
                {...register('status')}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Input>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isViewMode}
          >
            Cancelar
          </Button>
          {!isViewMode && (
            <Button type="submit">
              {tipoRota ? 'Atualizar' : 'Criar'} Tipo de Rota
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TipoRotaModal;

