import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button, MaskedFormInput } from '../ui';

const FornecedorModal = ({
  isOpen,
  onClose,
  onSubmit,
  isViewMode,
  editingFornecedor
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (editingFornecedor) {
        // Preencher formulário com dados do fornecedor
        // Lidar com estrutura de dados do projeto implantação
        const fornecedorData = editingFornecedor.data || editingFornecedor;
        Object.keys(fornecedorData).forEach(key => {
          setValue(key, fornecedorData[key]);
        });
      } else {
        // Limpar formulário para novo fornecedor
        reset();
      }
    }
  }, [isOpen, editingFornecedor, setValue, reset]);

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
      title={isViewMode ? 'Visualizar Fornecedor' : editingFornecedor ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Principais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Principais
            </h3>
            <div className="space-y-3">
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
                label="Razão Social *"
                {...register('razao_social')}
                disabled={isViewMode}
              />
              <Input
                label="Nome Fantasia"
                {...register('nome_fantasia')}
                disabled={isViewMode}
              />
              <Input
                label="Status *"
                type="select"
                {...register('status')}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </Input>
            </div>
          </div>

          {/* Card 2: Contato */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Contato
            </h3>
            <div className="space-y-3">
              <Input
                label="Email"
                type="email"
                {...register('email')}
                disabled={isViewMode}
              />
              <MaskedFormInput
                label="Telefone"
                maskType="telefone"
                register={register}
                fieldName="telefone"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Segunda Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 3: Endereço */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Endereço
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Logradouro"
                {...register('logradouro')}
                disabled={isViewMode}
              />
              <Input
                label="Número"
                {...register('numero')}
                disabled={isViewMode}
              />
              <MaskedFormInput
                label="CEP"
                maskType="cep"
                register={register}
                fieldName="cep"
                disabled={isViewMode}
              />
              <Input
                label="Bairro"
                {...register('bairro')}
                disabled={isViewMode}
              />
              <Input
                label="Município"
                {...register('municipio')}
                disabled={isViewMode}
              />
              <Input
                label="UF"
                {...register('uf')}
                disabled={isViewMode}
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
              {editingFornecedor ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default FornecedorModal;
