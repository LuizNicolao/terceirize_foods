import React, { useState } from 'react';
import { FaSave, FaTimes, FaChartLine, FaList, FaEdit } from 'react-icons/fa';
import { useEditarCotacao } from '../../hooks/useEditarCotacao';
import { Button, LoadingSpinner } from '../../components/ui';
import { InformacoesBasicas, FornecedoresList } from './components/editar';
import ScrollToBottomButton from '../../components/ui/ScrollToBottomButton';
import MelhorPrecoAnalysis from '../../components/cotacoes/MelhorPrecoAnalysis';
import TabNavigation from '../../components/ui/TabNavigation';

const EditarCotacao = () => {
  const [activeTab, setActiveTab] = useState('geral');
  
  const {
    // Estados
    formData,
    errors,
    produtos,
    fornecedores,
    loading,
    error,
    saving,
    
    // Constantes
    tiposFrete,
    motivosEmergenciais,
    
    // Funções
    handleInputChange,
    updateFornecedor,
    updateProdutoFornecedor,
    removeFornecedor,
    removeProduto,
    addFornecedor,
    handleSubmit,
    handleCancel,
    fetchCotacao
  } = useEditarCotacao();

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Carregando cotação..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-6xl mb-4">✗</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar cotação</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchCotacao} variant="primary">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Editar Cotação
        </h1>
        <p className="text-gray-600">
          Modifique os dados da cotação conforme necessário
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção: Informações Básicas */}
        <InformacoesBasicas
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
          motivosEmergenciais={motivosEmergenciais}
        />

        {/* Navegação por Abas */}
        {fornecedores.length > 0 && produtos.length > 0 && (
          <TabNavigation
            tabs={[
              {
                id: 'geral',
                label: 'Geral',
                icon: <FaEdit className="text-lg" />
              },
              {
                id: 'melhor-preco',
                label: 'Melhor Preço',
                icon: <FaChartLine className="text-lg" />
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {/* Conteúdo das Abas */}
        {activeTab === 'geral' && (
          <FornecedoresList
            fornecedores={fornecedores}
            produtos={produtos}
            updateFornecedor={updateFornecedor}
            updateProdutoFornecedor={updateProdutoFornecedor}
            removeFornecedor={removeFornecedor}
            removeProduto={removeProduto}
            addFornecedor={addFornecedor}
            tiposFrete={tiposFrete}
            cotacaoId={formData.id}
          />
        )}

        {activeTab === 'melhor-preco' && (
          <MelhorPrecoAnalysis 
            fornecedores={fornecedores}
            produtos={produtos}
          />
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleCancel}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            <FaTimes className="mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            className="w-full sm:w-auto"
          >
            <FaSave className="mr-2" />
            {saving ? 'Salvando...' : 'Salvar Cotação'}
          </Button>
        </div>
      </form>
      
      {/* Botão Ir ao Final */}
      <ScrollToBottomButton 
        containerRef={null}
        threshold={100}
      />
    </div>
  );
};

export default EditarCotacao;
