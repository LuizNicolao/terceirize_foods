import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSearch, FaWarehouse } from 'react-icons/fa';
import { Modal, Input, Button } from '../ui';
import FiliaisService from '../../services/filiais';
import AlmoxarifadoContent from '../AlmoxarifadoContent';
import toast from 'react-hot-toast';

const FilialModal = ({ isOpen, onClose, onSubmit, filial, isViewMode }) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [activeTab, setActiveTab] = useState('info'); // 'info' ou 'almoxarifados'

  const cnpj = watch('cnpj');

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
      // Resetar para aba de informações
      setActiveTab('info');
    }
  }, [isOpen, filial, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    setActiveTab('info');
    onClose();
  };

  // Função para buscar CNPJ
  const handleBuscarCNPJ = async () => {
    if (!cnpj) {
      toast.error('Digite um CNPJ para consultar');
      return;
    }

    try {
      const response = await FiliaisService.consultarCNPJ(cnpj);
      if (response.success) {
        const dados = response.data;
        // Preencher os campos com os dados retornados
        setValue('razao_social', dados.razao_social || '');
        setValue('filial', dados.nome_fantasia || dados.razao_social || '');
        setValue('logradouro', dados.logradouro || '');
        setValue('numero', dados.numero || '');
        setValue('bairro', dados.bairro || '');
        setValue('cidade', dados.municipio || '');
        setValue('estado', dados.uf || '');
        setValue('cep', dados.cep || '');
        
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
      title={isViewMode ? 'Visualizar Filial' : filial ? 'Editar Filial' : 'Nova Filial'}
      size="full"
    >
      {/* Abas */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informações
          </button>
          {filial && (
            <button
              onClick={() => setActiveTab('almoxarifados')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'almoxarifados'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaWarehouse className="text-sm" />
              Almoxarifados
            </button>
          )}
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'info' && (
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
                  disabled={isViewMode}
                  placeholder="Código da filial"
                />
                
                {/* CNPJ com botão de busca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <div className="flex gap-2">
                    <Input
                      {...register('cnpj')}
                      disabled={isViewMode}
                      placeholder="00.000.000/0000-00"
                    />
                    {!isViewMode && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleBuscarCNPJ}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        <FaSearch className="text-sm" />
                        Buscar
                      </Button>
                    )}
                  </div>
                </div>

                <Input
                  label="Nome da Filial"
                  {...register('filial')}
                  disabled={isViewMode}
                  placeholder="Nome da filial"
                />
                <Input
                  label="Razão Social"
                  {...register('razao_social')}
                  disabled={isViewMode}
                  placeholder="Razão social"
                />
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
                  disabled={isViewMode}
                  placeholder="Logradouro"
                />
                <Input
                  label="Número"
                  {...register('numero')}
                  disabled={isViewMode}
                  placeholder="Número"
                />
                <Input
                  label="Bairro"
                  {...register('bairro')}
                  disabled={isViewMode}
                  placeholder="Bairro"
                />
                <Input
                  label="CEP"
                  {...register('cep')}
                  disabled={isViewMode}
                  placeholder="00000-000"
                />
                <Input
                  label="Cidade"
                  {...register('cidade')}
                  disabled={isViewMode}
                  placeholder="Cidade"
                />
                <Input
                  label="Estado"
                  {...register('estado')}
                  disabled={isViewMode}
                  placeholder="UF"
                />
              </div>
            </div>
          </div>

          {/* Segunda Linha - 1 Card */}
          <div className="grid grid-cols-1 gap-4">
            {/* Card 3: Gestão */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Gestão
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Supervisão"
                  {...register('supervisao')}
                  disabled={isViewMode}
                  placeholder="Supervisão"
                />
                <Input
                  label="Coordenação"
                  {...register('coordenacao')}
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
      )}

      {/* Aba de Almoxarifados */}
      {activeTab === 'almoxarifados' && filial && (
        <div className="max-h-[75vh] overflow-y-auto">
          <AlmoxarifadoContent
            filialId={filial.id}
            viewMode={isViewMode}
          />
        </div>
      )}
    </Modal>
  );
};

export default FilialModal;
