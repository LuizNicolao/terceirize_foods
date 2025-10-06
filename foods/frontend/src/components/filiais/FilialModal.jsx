import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { Modal, Input, Button, MaskedFormInput } from '../ui';
import FiliaisService from '../../services/filiais';
import toast from 'react-hot-toast';

const FilialModal = ({ isOpen, onClose, onSubmit, filial, isViewMode }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const cnpj = watch('cnpj');
  const cep = watch('cep');

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (filial) {
        // Preencher formulário com dados da filial
        Object.keys(filial).forEach(key => {
          setValue(key, filial[key]);
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

  // Função para buscar CNPJ
  const handleBuscarCNPJ = async () => {
    const cnpjValue = cnpj || '';
    
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
      const response = await FiliaisService.consultarCNPJ(cnpjValue);
      
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
        setValue('cidade', dados.municipio || '');
        setValue('estado', dados.uf || '');
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
    const cepValue = cep || '';
    
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
      const response = await FiliaisService.consultarCEP(cepValue);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.success) {
        const dados = response.data;
        // Preencher os campos com os dados retornados
        setValue('logradouro', dados.logradouro || '');
        setValue('bairro', dados.bairro || '');
        setValue('cidade', dados.localidade || '');
        setValue('estado', dados.uf || '');
        
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
      title={isViewMode ? 'Visualizar Filial' : filial ? 'Editar Filial' : 'Nova Filial'}
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
              <Input
                label="Código da Filial"
                {...register('codigo_filial')}
                error={errors.codigo_filial?.message}
                disabled={isViewMode}
                placeholder="Código da filial"
              />
              
              {/* CNPJ com botão de busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('cnpj')}
                    type="text"
                    placeholder="00.000.000/0000-00"
                    disabled={isViewMode}
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
                  {!isViewMode && (
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
                label="Nome da Filial *"
                {...register('filial')}
                error={errors.filial?.message}
                disabled={isViewMode}
              />
              <Input
                label="Razão Social *"
                {...register('razao_social')}
                error={errors.razao_social?.message}
                disabled={isViewMode}
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
              <Input
                label="Bairro"
                {...register('bairro')}
                disabled={isViewMode}
              />
              <Input
                label="Cidade"
                {...register('cidade')}
                disabled={isViewMode}
              />
              <Input
                label="Estado"
                {...register('estado')}
                disabled={isViewMode}
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
                    disabled={isViewMode}
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
                  {!isViewMode && (
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
            </div>
          </div>
        </div>

        {/* Terceira Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 4: Informações Adicionais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Adicionais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Supervisão"
                {...register('supervisao')}
                disabled={isViewMode}
              />
              <Input
                label="Coordenação"
                {...register('coordenacao')}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          {!isViewMode && (
            <Button type="submit">
              {filial ? 'Atualizar' : 'Criar'} Filial
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default FilialModal;