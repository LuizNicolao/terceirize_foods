import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../ui';

const VeiculoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  veiculo, 
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  React.useEffect(() => {
    if (veiculo && isOpen) {
      // Preencher formulário com dados do veículo
      Object.keys(veiculo).forEach(key => {
        if (veiculo[key] !== null && veiculo[key] !== undefined) {
          setValue(key, veiculo[key]);
        }
      });
    } else if (!veiculo && isOpen) {
      // Resetar formulário para novo veículo
      reset();
      setValue('status', 'ativo');
      setValue('tipo_veiculo', 'caminhao');
      setValue('categoria', 'medio');
    }
  }, [veiculo, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Veículo' : veiculo ? 'Editar Veículo' : 'Adicionar Veículo'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Primeira linha - Informações básicas */}
          <Input
            label="Placa *"
            type="text"
            placeholder="ABC-1234"
            {...register('placa', { required: 'Placa é obrigatória' })}
            error={errors.placa?.message}
            disabled={isViewMode}
          />

          <Input
            label="Marca *"
            type="text"
            placeholder="Marca do veículo"
            {...register('marca', { required: 'Marca é obrigatória' })}
            error={errors.marca?.message}
            disabled={isViewMode}
          />

          <Input
            label="Modelo *"
            type="text"
            placeholder="Modelo do veículo"
            {...register('modelo', { required: 'Modelo é obrigatório' })}
            error={errors.modelo?.message}
            disabled={isViewMode}
          />

          {/* Segunda linha - Identificação */}
          <Input
            label="Chassi"
            type="text"
            placeholder="Número do chassi"
            {...register('chassi')}
            disabled={isViewMode}
          />

          <Input
            label="Ano de Fabricação"
            type="number"
            placeholder="2020"
            {...register('ano_fabricacao')}
            disabled={isViewMode}
          />

          <Input
            label="Ano do Modelo"
            type="number"
            placeholder="2020"
            {...register('ano_modelo')}
            disabled={isViewMode}
          />

          {/* Terceira linha - Configurações */}
          <Input
            label="Tipo de Veículo"
            type="select"
            {...register('tipo_veiculo')}
            disabled={isViewMode}
          >
            <option value="caminhao">Caminhão</option>
            <option value="van">Van</option>
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
            <option value="utilitario">Utilitário</option>
          </Input>

          <Input
            label="Categoria"
            type="select"
            {...register('categoria')}
            disabled={isViewMode}
          >
            <option value="leve">Leve</option>
            <option value="medio">Médio</option>
            <option value="pesado">Pesado</option>
          </Input>

          <Input
            label="Status"
            type="select"
            {...register('status')}
            disabled={isViewMode}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="manutencao">Em Manutenção</option>
            <option value="aposentado">Aposentado</option>
          </Input>

          {/* Quarta linha - Capacidades */}
          <Input
            label="Capacidade (kg)"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('capacidade_kg')}
            disabled={isViewMode}
          />

          <Input
            label="Capacidade (m³)"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('capacidade_m3')}
            disabled={isViewMode}
          />

          <Input
            label="Consumo Médio (km/l)"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('consumo_medio')}
            disabled={isViewMode}
          />

          {/* Quinta linha - Informações adicionais */}
          <Input
            label="Cor"
            type="text"
            placeholder="Cor do veículo"
            {...register('cor')}
            disabled={isViewMode}
          />

          <Input
            label="Renavam"
            type="text"
            placeholder="Número do Renavam"
            {...register('renavam')}
            disabled={isViewMode}
          />

          <Input
            label="Valor de Aquisição"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('valor_aquisicao')}
            disabled={isViewMode}
          />

          {/* Sexta linha - Observações */}
          <Input
            label="Observações"
            type="textarea"
            placeholder="Observações sobre o veículo..."
            {...register('observacoes')}
            disabled={isViewMode}
            className="md:col-span-2 lg:col-span-3"
            rows={3}
          />
        </div>

        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              {veiculo ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default VeiculoModal;
