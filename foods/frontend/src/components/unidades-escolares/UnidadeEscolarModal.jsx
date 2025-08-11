import React from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

const UnidadeEscolarModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  unidade, 
  isViewMode = false,
  rotas = [],
  loadingRotas = false
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  React.useEffect(() => {
    if (unidade && isOpen) {
      // Preencher formulário com dados da unidade escolar
      Object.keys(unidade).forEach(key => {
        if (unidade[key] !== null && unidade[key] !== undefined) {
          setValue(key, unidade[key]);
        }
      });
    } else if (!unidade && isOpen) {
      // Resetar formulário para nova unidade escolar
      reset();
      setValue('status', 'ativo');
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
      title={isViewMode ? 'Visualizar Unidade Escolar' : unidade ? 'Editar Unidade Escolar' : 'Adicionar Unidade Escolar'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Primeira linha - Informações básicas */}
          <Input
            label="Código Teknisa *"
            type="text"
            placeholder="Código da unidade"
            {...register('codigo_teknisa', { required: 'Código Teknisa é obrigatório' })}
            error={errors.codigo_teknisa?.message}
            disabled={isViewMode}
          />

          <Input
            label="Nome da Escola *"
            type="text"
            placeholder="Nome da escola"
            {...register('nome_escola', { required: 'Nome da escola é obrigatório' })}
            error={errors.nome_escola?.message}
            disabled={isViewMode}
          />

          <Input
            label="Cidade *"
            type="text"
            placeholder="Cidade"
            {...register('cidade', { required: 'Cidade é obrigatória' })}
            error={errors.cidade?.message}
            disabled={isViewMode}
          />

          {/* Segunda linha - Localização */}
          <Input
            label="Estado *"
            type="text"
            placeholder="Estado"
            {...register('estado', { required: 'Estado é obrigatório' })}
            error={errors.estado?.message}
            disabled={isViewMode}
          />

          <Input
            label="CEP"
            type="text"
            placeholder="00000-000"
            {...register('cep')}
            disabled={isViewMode}
          />

          <Input
            label="Endereço"
            type="text"
            placeholder="Endereço completo"
            {...register('endereco')}
            disabled={isViewMode}
          />

          {/* Terceira linha - Configurações */}
          <Input
            label="Rota"
            type="select"
            {...register('rota_id')}
            disabled={isViewMode || loadingRotas}
          >
            <option value="">
              {loadingRotas ? 'Carregando rotas...' : 'Selecione uma rota'}
            </option>
            {rotas.map(rota => (
              <option key={rota.id} value={rota.id}>
                {rota.nome} ({rota.codigo})
              </option>
            ))}
          </Input>

          <Input
            label="Centro de Distribuição"
            type="text"
            placeholder="Centro de distribuição"
            {...register('centro_distribuicao')}
            disabled={isViewMode}
          />

          <Input
            label="Status"
            type="select"
            {...register('status')}
            disabled={isViewMode}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Input>

          {/* Quarta linha - Informações adicionais */}
          <Input
            label="Telefone"
            type="text"
            placeholder="(00) 00000-0000"
            {...register('telefone')}
            disabled={isViewMode}
          />

          <Input
            label="Email"
            type="email"
            placeholder="email@escola.com"
            {...register('email')}
            disabled={isViewMode}
          />

          <Input
            label="Diretor"
            type="text"
            placeholder="Nome do diretor"
            {...register('diretor')}
            disabled={isViewMode}
          />

          {/* Quinta linha - Observações */}
          <Input
            label="Observações"
            type="textarea"
            placeholder="Observações sobre a unidade escolar..."
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
              {unidade ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UnidadeEscolarModal;
