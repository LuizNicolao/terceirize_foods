import React from 'react';
import { FaCalculator } from 'react-icons/fa';
import { Input } from '../../ui';
import FormSection from './FormSection';

const CalculoImposto = ({ formData, onChange, valorTotalProdutos, valorTotalNota, isViewMode = false }) => {
  // Função para formatar valor monetário
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : parseFloat(value);
    if (isNaN(numValue)) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  // Função para converter valor formatado de volta para número
  const parseCurrency = (value) => {
    if (!value) return '';
    // Remove todos os caracteres não numéricos exceto vírgula e ponto
    let cleaned = value.replace(/[^\d,.-]/g, '');
    
    // Se tiver vírgula e ponto, mantém apenas a vírgula como separador decimal
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Remove pontos que são separadores de milhar
      cleaned = cleaned.replace(/\./g, '');
    } else if (cleaned.includes('.')) {
      // Se só tem ponto, verifica se é separador decimal ou de milhar
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        // Múltiplos pontos = separadores de milhar, remove todos
        cleaned = cleaned.replace(/\./g, '');
      } else if (parts[1] && parts[1].length <= 2) {
        // Ponto com até 2 dígitos depois = separador decimal, converte para vírgula
        cleaned = cleaned.replace('.', ',');
      } else {
        // Ponto com mais de 2 dígitos = separador de milhar, remove
        cleaned = cleaned.replace(/\./g, '');
      }
    }
    
    // Substitui vírgula por ponto para parseFloat
    cleaned = cleaned.replace(',', '.');
    const numValue = parseFloat(cleaned);
    return isNaN(numValue) ? '' : numValue.toString();
  };

  // Handler para mudanças em campos monetários
  const handleCurrencyChange = (field, value) => {
    const numericValue = parseCurrency(value);
    onChange(field, numericValue);
  };
  return (
    <FormSection
      icon={FaCalculator}
      title="Cálculo do Imposto"
      description="Informe os valores de impostos, frete e despesas acessórias da nota fiscal."
    >
      {/* Linha 1 - Grid 5 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Input
          label="Base Cálculo ICMS"
          name="base_calculo_icms"
          type="text"
          value={formatCurrency(formData.base_calculo_icms)}
          onChange={(e) => handleCurrencyChange('base_calculo_icms', e.target.value)}
          disabled={isViewMode}
          placeholder="R$ 0,00"
        />
        <Input
          label="Valor ICMS"
          name="valor_icms"
          type="text"
          value={formatCurrency(formData.valor_icms)}
          onChange={(e) => handleCurrencyChange('valor_icms', e.target.value)}
          disabled={isViewMode}
          placeholder="R$ 0,00"
        />
        <Input
          label="Base Cálc ICMS ST"
          name="base_calculo_icms_st"
          type="text"
          value={formatCurrency(formData.base_calculo_icms_st)}
          onChange={(e) => handleCurrencyChange('base_calculo_icms_st', e.target.value)}
          disabled={isViewMode}
          placeholder="R$ 0,00"
        />
        <Input
          label="Valor ICMS ST"
          name="valor_icms_st"
          type="text"
          value={formatCurrency(formData.valor_icms_st)}
          onChange={(e) => handleCurrencyChange('valor_icms_st', e.target.value)}
          disabled={isViewMode}
          placeholder="R$ 0,00"
        />
        <Input
          label="Valor Total Prod."
          name="valor_produtos"
          type="text"
          value={formatCurrency(valorTotalProdutos || formData.valor_produtos)}
          disabled={true}
          className="bg-gray-100"
        />
      </div>

      {/* Linha 2 - Grid 6 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Input
          label="Valor Frete"
          name="valor_frete"
          type="text"
          value={formatCurrency(formData.valor_frete)}
          onChange={(e) => handleCurrencyChange('valor_frete', e.target.value)}
          disabled={isViewMode}
          placeholder="R$ 0,00"
        />
        <Input
          label="Valor Seguro"
          name="valor_seguro"
          type="text"
          value={formatCurrency(formData.valor_seguro)}
          onChange={(e) => handleCurrencyChange('valor_seguro', e.target.value)}
          disabled={isViewMode}
          placeholder="R$ 0,00"
        />
        <Input
          label="Desconto"
          name="valor_desconto"
          type="text"
          value={formatCurrency(formData.valor_desconto)}
          onChange={(e) => handleCurrencyChange('valor_desconto', e.target.value)}
          disabled={isViewMode}
          placeholder="R$ 0,00"
        />
        <Input
          label="Outras Despesas"
          name="valor_outras_despesas"
          type="text"
          value={formatCurrency(formData.valor_outras_despesas)}
          onChange={(e) => handleCurrencyChange('valor_outras_despesas', e.target.value)}
          disabled={isViewMode}
          placeholder="R$ 0,00"
        />
        <Input
          label="Valor IPI"
          name="valor_ipi"
          type="text"
          value={formatCurrency(formData.valor_ipi)}
          onChange={(e) => handleCurrencyChange('valor_ipi', e.target.value)}
          disabled={isViewMode}
          placeholder="R$ 0,00"
        />
        <Input
          label="Valor Total Nota"
          name="valor_total"
          type="text"
          value={formatCurrency(valorTotalNota)}
          disabled={true}
          className="bg-gray-100 font-bold"
        />
      </div>
    </FormSection>
  );
};

export default CalculoImposto;

