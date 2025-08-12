import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSearch } from 'react-icons/fa';
import { Modal, Input, Button } from '../ui';
import ClientesService from '../../services/clientes';
import toast from 'react-hot-toast';

const ClienteModal = ({ isOpen, onClose, onSubmit, cliente, isViewMode }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const cnpj = watch('cnpj');

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (cliente) {
        // Preencher formulário com dados do cliente
        Object.keys(cliente).forEach(key => {
          setValue(key, cliente[key]);
        });
      } else {
        // Limpar formulário para novo cliente
        reset();
      }
    }
  }, [isOpen, cliente, setValue, reset]);

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
      const response = await ClientesService.buscarCNPJ(cnpj);
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
      title={isViewMode ? 'Visualizar Cliente' : cliente ? 'Editar Cliente' : 'Novo Cliente'}
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
                    {...register('cnpj', { 
                      required: 'CNPJ é obrigatório',
                      pattern: {
                        value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                        message: 'CNPJ deve estar no formato 00.000.000/0000-00'
                      }
                    })}
                    error={errors.cnpj?.message}
                    disabled={isViewMode}
                    placeholder="00.000.000/0000-00"
                    className="flex-1"
                  />
                  {!isViewMode && (
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
                {...register('razao_social', { 
                  required: 'Razão social é obrigatória',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                })}
                error={errors.razao_social?.message}
                disabled={isViewMode}
              />
              <Input
                label="Nome Fantasia"
                {...register('nome_fantasia')}
                error={errors.nome_fantasia?.message}
                disabled={isViewMode}
              />
              <Input
                label="Status *"
                type="select"
                {...register('status', { required: 'Status é obrigatório' })}
                error={errors.status?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
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
                disabled={isViewMode}
              />
              <Input
                label="Telefone"
                {...register('telefone')}
                error={errors.telefone?.message}
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
                label="Logradouro *"
                {...register('logradouro', { required: 'Logradouro é obrigatório' })}
                error={errors.logradouro?.message}
                disabled={isViewMode}
              />
              <Input
                label="Número"
                {...register('numero')}
                error={errors.numero?.message}
                disabled={isViewMode}
              />
              <Input
                label="CEP"
                {...register('cep', {
                  pattern: {
                    value: /^\d{5}-\d{3}$/,
                    message: 'CEP deve estar no formato 00000-000'
                  }
                })}
                error={errors.cep?.message}
                disabled={isViewMode}
              />
              <Input
                label="Bairro"
                {...register('bairro')}
                error={errors.bairro?.message}
                disabled={isViewMode}
              />
              <Input
                label="Município *"
                {...register('municipio', { required: 'Município é obrigatório' })}
                error={errors.municipio?.message}
                disabled={isViewMode}
              />
              <Input
                label="UF *"
                {...register('uf', { 
                  required: 'UF é obrigatória',
                  maxLength: { value: 2, message: 'Máximo 2 caracteres' }
                })}
                error={errors.uf?.message}
                disabled={isViewMode}
              />
              <Input
                label="País"
                {...register('pais')}
                error={errors.pais?.message}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Terceira Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 4: Observações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Observações
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Adicionais
              </label>
              <textarea
                {...register('observacoes')}
                disabled={isViewMode}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.observacoes ? 'border-red-300' : 'border-gray-300'
                } ${isViewMode ? 'bg-gray-100' : 'bg-white'}`}
                placeholder="Observações adicionais..."
              />
              {errors.observacoes && (
                <p className="mt-1 text-sm text-red-600">{errors.observacoes.message}</p>
              )}
            </div>
          </div>
        </div>

        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              {cliente ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ClienteModal;
