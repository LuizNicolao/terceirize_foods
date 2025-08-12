import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSearch } from 'react-icons/fa';
import { Modal, Input, Button } from '../ui';
import FornecedoresService from '../../services/fornecedores';
import toast from 'react-hot-toast';

const FornecedorModal = ({
  isOpen,
  onClose,
  onSubmit,
  viewMode,
  editingFornecedor
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const cnpj = watch('cnpj');

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (editingFornecedor) {
        // Preencher formulário com dados do fornecedor
        Object.keys(editingFornecedor).forEach(key => {
          setValue(key, editingFornecedor[key]);
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

  // Função para buscar CNPJ
  const handleBuscarCNPJ = async () => {
    if (!cnpj) {
      toast.error('Digite um CNPJ para consultar');
      return;
    }

    try {
      const response = await FornecedoresService.buscarCNPJ(cnpj);
      if (response.success) {
        const dados = response.data;
        // Preencher os campos com os dados retornados
        setValue('razao_social', dados.razao_social || '');
        setValue('nome_fantasia', dados.nome_fantasia || '');
        setValue('logradouro', dados.logradouro || '');
        setValue('numero', dados.numero || '');
        setValue('bairro', dados.bairro || '');
        setValue('municipio', dados.municipio || '');
        setValue('uf', dados.uf || '');
        setValue('cep', dados.cep || '');
        setValue('telefone', dados.telefone || '');
        setValue('email', dados.email || '');
        
        toast.success('Dados do CNPJ carregados com sucesso!');
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      toast.error('Erro ao buscar dados do CNPJ');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={viewMode ? 'Visualizar Fornecedor' : editingFornecedor ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
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
              {/* CNPJ com botão de busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ *
                </label>
                <div className="flex gap-2">
                  <Input
                    {...register('cnpj', { required: 'CNPJ é obrigatório' })}
                    error={errors.cnpj?.message}
                    disabled={viewMode}
                    placeholder="00.000.000/0000-00"
                    className="flex-1"
                  />
                  {!viewMode && (
                    <Button
                      type="button"
                      onClick={handleBuscarCNPJ}
                      variant="outline"
                      size="sm"
                      disabled={!cnpj}
                      className="mt-0"
                    >
                      <FaSearch className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
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
