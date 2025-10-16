import React, { useRef } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { useNovaCotacao } from '../../hooks/useNovaCotacao';
import { Button, LoadingSpinner } from '../../components/ui';
import { 
  UploadPlanilha, 
  ProdutosImportados, 
  InformacoesBasicas, 
  FornecedoresList 
} from './components/nova';
import ScrollToBottomButton from '../../components/ui/ScrollToBottomButton';

const NovaCotacao = () => {
  const containerRef = useRef(null);
  
  const {
    // Estados
    formData,
    errors,
    produtos,
    fornecedores,
    planilhaCarregada,
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
    handleFileUpload
  } = useNovaCotacao();

  if (saving) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Criando cotação..." />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-3 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Nova Cotação
        </h1>
        <p className="text-gray-600">
          Crie uma nova cotação preenchendo as informações necessárias
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

        {/* Seção: Upload de Planilha */}
        <UploadPlanilha
          onFileUpload={handleFileUpload}
          planilhaCarregada={planilhaCarregada}
          produtos={produtos}
          errors={errors}
        />

        {/* Seção: Produtos Importados */}
        <ProdutosImportados
          produtos={produtos}
          planilhaCarregada={planilhaCarregada}
        />

        {/* Seção: Lista de Fornecedores */}
        {planilhaCarregada && produtos.length > 0 && (
          <FornecedoresList
            fornecedores={fornecedores}
            produtos={produtos}
            errors={errors}
            tiposFrete={tiposFrete}
            updateFornecedor={updateFornecedor}
            updateProdutoFornecedor={updateProdutoFornecedor}
            removeFornecedor={removeFornecedor}
            removeProduto={removeProduto}
            addFornecedor={addFornecedor}
          />
        )}

        {/* Ações do Formulário */}
        <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            size="md"
          >
            <FaTimes /> Voltar para Lista
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={saving || !planilhaCarregada || produtos.length === 0}
          >
            <FaSave /> {saving ? 'Criando...' : 'Criar Cotação'}
          </Button>
        </div>
      </form>
      
      {/* Botão Ir ao Final */}
      <ScrollToBottomButton 
        containerRef={containerRef}
        threshold={300}
        showText={true}
      />
    </div>
  );
};

export default NovaCotacao;
