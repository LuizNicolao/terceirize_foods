import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { Modal, Input, Button, MaskedFormInput } from '../ui';
import FornecedoresService from '../../services/fornecedores';
import toast from 'react-hot-toast';

const FornecedorModal = ({
  isOpen,
  onClose,
  onSubmit,
  viewMode,
  editingFornecedor
}) => {
  const { register, handleSubmit, reset, setValue, watch, getValues } = useForm();
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const cnpj = watch('cnpj');
  const cep = watch('cep');

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
    // Tentar pegar o valor do CNPJ de diferentes formas
    const cnpjValue = cnpj || getValues('cnpj') || '';
    
    if (!cnpjValue || cnpjValue.replace(/\D/g, '').length < 14) {
      toast.error('Digite um CNPJ válido para consultar');
      return;
    }

    if (isLoadingCNPJ) {
      return; // Evitar múltiplas chamadas
    }

    setIsLoadingCNPJ(true);
    const loadingToast = toast.loading('Buscando dados do CNPJ...');

    try {
      const response = await FornecedoresService.buscarCNPJ(cnpjValue);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
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
        toast.error(response.error || 'Erro ao buscar dados do CNPJ');
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      console.error('Erro ao buscar CNPJ:', error);
      toast.error('Erro ao buscar dados do CNPJ. Tente novamente.');
    } finally {
      setIsLoadingCNPJ(false);
    }
  };

  // Função para buscar CEP
  const handleBuscarCEP = async () => {
    const cepValue = cep || getValues('cep') || '';
    
    if (!cepValue || cepValue.replace(/\D/g, '').length < 8) {
      toast.error('Digite um CEP válido para consultar');
      return;
    }

    if (isLoadingCEP) {
      return; // Evitar múltiplas chamadas
    }

    setIsLoadingCEP(true);
    const loadingToast = toast.loading('Buscando dados do CEP...');

    try {
      const response = await FornecedoresService.consultarCEP(cepValue);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.success) {
        const dados = response.data;
        // Preencher os campos com os dados retornados
        setValue('logradouro', dados.logradouro || '');
        setValue('bairro', dados.bairro || '');
        setValue('municipio', dados.localidade || '');
        setValue('uf', dados.uf || '');
        
        toast.success('Dados do CEP carregados com sucesso!');
      } else {
        toast.error(response.error || 'Erro ao buscar dados do CEP');
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar dados do CEP. Tente novamente.');
    } finally {
      setIsLoadingCEP(false);
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
                  <input
                    {...register('cnpj')}
                    type="text"
                    placeholder="00.000.000/0000-00"
                    disabled={viewMode}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={(e) => {
                      // Aplicar máscara CNPJ
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 14) {
                        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                        value = value.replace(/(\d{4})(\d)/, '$1-$2');
                        e.target.value = value;
                      }
                      // Notificar o react-hook-form
                      register('cnpj').onChange(e);
                    }}
                  />
                  {!viewMode && (
                    <button
                      type="button"
                      onClick={handleBuscarCNPJ}
                      disabled={isLoadingCNPJ}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingCNPJ ? (
                        <FaSpinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <FaSearch className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              <Input
                label="Razão Social *"
                {...register('razao_social')}
                disabled={viewMode}
              />
              <Input
                label="Nome Fantasia"
                {...register('nome_fantasia')}
                disabled={viewMode}
              />
              <Input
                label="Status *"
                type="select"
                {...register('status')}
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
                {...register('email')}
                disabled={viewMode}
              />
              <MaskedFormInput
                label="Telefone"
                maskType="telefone"
                register={register}
                fieldName="telefone"
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
                disabled={viewMode}
              />
              <Input
                label="Número"
                {...register('numero')}
                disabled={viewMode}
              />
              {/* CEP com botão de busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('cep')}
                    type="text"
                    placeholder="00000-000"
                    disabled={viewMode}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={(e) => {
                      // Aplicar máscara CEP
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 8) {
                        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
                        e.target.value = value;
                      }
                      // Notificar o react-hook-form
                      register('cep').onChange(e);
                    }}
                  />
                  {!viewMode && (
                    <button
                      type="button"
                      onClick={handleBuscarCEP}
                      disabled={isLoadingCEP}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingCEP ? (
                        <FaSpinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <FaSearch className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <Input
                label="Bairro"
                {...register('bairro')}
                disabled={viewMode}
              />
              <Input
                label="Município"
                {...register('municipio')}
                disabled={viewMode}
              />
              <Input
                label="UF"
                {...register('uf')}
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
