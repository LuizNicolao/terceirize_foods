import React from 'react';
import { Modal, Input, Button } from '../ui';

const FornecedorModal = ({
  isOpen,
  onClose,
  onSubmit,
  register,
  handleSubmit,
  errors,
  viewMode,
  editingFornecedor
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={viewMode ? 'Visualizar Fornecedor' : editingFornecedor ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
      size="full"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Principais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Principais
            </h3>
            <div className="space-y-3">
              <Input
                label="CNPJ *"
                {...register('cnpj', { required: 'CNPJ é obrigatório' })}
                error={errors.cnpj?.message}
                disabled={viewMode}
              />
              <Input
                label="Razão Social *"
                {...register('razao_social', { required: 'Razão social é obrigatória' })}
                error={errors.razao_social?.message}
                disabled={viewMode}
              />
              <Input
                label="Nome Fantasia"
                {...register('nome_fantasia')}
                error={errors.nome_fantasia?.message}
                disabled={viewMode}
              />
              <Input
                label="Status *"
                type="select"
                {...register('status', { required: 'Status é obrigatório' })}
                error={errors.status?.message}
                disabled={viewMode}
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
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido'
                  }
                })}
                error={errors.email?.message}
                disabled={viewMode}
              />
              <Input
                label="Telefone"
                {...register('telefone')}
                error={errors.telefone?.message}
                disabled={viewMode}
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
                error={errors.logradouro?.message}
                disabled={viewMode}
              />
              <Input
                label="Número"
                {...register('numero')}
                error={errors.numero?.message}
                disabled={viewMode}
              />
              <Input
                label="CEP"
                {...register('cep')}
                error={errors.cep?.message}
                disabled={viewMode}
              />
              <Input
                label="Bairro"
                {...register('bairro')}
                error={errors.bairro?.message}
                disabled={viewMode}
              />
              <Input
                label="Município"
                {...register('municipio')}
                error={errors.municipio?.message}
                disabled={viewMode}
              />
              <Input
                label="UF"
                {...register('uf')}
                error={errors.uf?.message}
                disabled={viewMode}
              />
            </div>
          </div>
        </div>

        {!viewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
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
