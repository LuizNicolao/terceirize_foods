import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button, MaskedFormInput } from '../ui';

const FilialModal = ({ isOpen, onClose, onSubmit, filial, isViewMode }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const cnpj = watch('cnpj');

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (filial) {
        // Preencher formulário com dados da filial
        // Lidar com estrutura de dados do projeto implantação
        const filialData = filial.data || filial;
        Object.keys(filialData).forEach(key => {
          setValue(key, filialData[key]);
        });
      } else {
        // Limpar formulário para nova filial
        reset();
      }
    }
  }, [isOpen, filial, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Função para buscar CNPJ - removida para simplificar no projeto implantação

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isViewMode ? 'Visualizar Filial' : filial ? 'Editar Filial' : 'Nova Filial'}
      size="full"
    >
      {/* Conteúdo do modal - apenas informações básicas para o projeto implantação */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Primeira Linha - 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Informações Principais */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Informações Principais
              </h3>
              <div className="space-y-3">
                <Input
                  label="Código da Filial"
                  {...register('codigo_filial')}
                  error={errors.codigo_filial?.message}
                  disabled={isViewMode}
                  placeholder="Código da filial"
                />
                
              <MaskedFormInput
                label="CNPJ"
                maskType="cnpj"
                register={register}
                fieldName="cnpj"
                error={errors.cnpj?.message}
                disabled={isViewMode}
                placeholder="00.000.000/0000-00"
              />

                <Input
                  label="Nome da Filial"
                  {...register('filial')}
                  error={errors.filial?.message}
                  disabled={isViewMode}
                  placeholder="Nome da filial"
                />
                <Input
                  label="Razão Social"
                  {...register('razao_social')}
                  error={errors.razao_social?.message}
                  disabled={isViewMode}
                  placeholder="Razão social"
                />
                <Input
                  label="Status *"
                  type="select"
                  {...register('status')}
                  error={errors.status?.message}
                  disabled={isViewMode}
                >
                  <option value="">Selecione o status</option>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </Input>
              </div>
            </div>

            {/* Card 2: Endereço */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Endereço
              </h3>
              <div className="space-y-3">
                <Input
                  label="Logradouro"
                  {...register('logradouro')}
                  error={errors.logradouro?.message}
                  disabled={isViewMode}
                  placeholder="Logradouro"
                />
                <Input
                  label="Número"
                  {...register('numero')}
                  error={errors.numero?.message}
                  disabled={isViewMode}
                  placeholder="Número"
                />
                <Input
                  label="Bairro"
                  {...register('bairro')}
                  error={errors.bairro?.message}
                  disabled={isViewMode}
                  placeholder="Bairro"
                />
                <MaskedFormInput
                  label="CEP"
                  maskType="cep"
                  register={register}
                  fieldName="cep"
                  error={errors.cep?.message}
                  disabled={isViewMode}
                  placeholder="00000-000"
                />
                <Input
                  label="Cidade"
                  {...register('cidade')}
                  error={errors.cidade?.message}
                  disabled={isViewMode}
                  placeholder="Cidade"
                />
                <Input
                  label="Estado"
                  type="select"
                  {...register('estado')}
                  error={errors.estado?.message}
                  disabled={isViewMode}
                >
                  <option value="">Selecione...</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </Input>
              </div>
            </div>
          </div>

          {/* Segunda Linha - 1 Card */}
          <div className="grid grid-cols-1 gap-4">
            {/* Card 3: Informações Adicionais */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Informações Adicionais
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Supervisão"
                  {...register('supervisao')}
                  error={errors.supervisao?.message}
                  disabled={isViewMode}
                  placeholder="Supervisão"
                />
                <Input
                  label="Coordenação"
                  {...register('coordenacao')}
                  error={errors.coordenacao?.message}
                  disabled={isViewMode}
                  placeholder="Coordenação"
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
                {filial ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          )}
        </form>
    </Modal>
  );
};

export default FilialModal;
