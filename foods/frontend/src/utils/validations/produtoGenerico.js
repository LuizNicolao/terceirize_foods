/**
 * Validações específicas para Produto Genérico
 */

import { commonValidations } from './common';

export const produtoGenericoValidations = {
  codigo: {
    required: 'Código é obrigatório',
    validate: (value) => {
      if (!value || value === '') {
        return 'Código é obrigatório';
      }
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return 'Código deve ser um número válido maior que 0';
      }
      return true;
    }
  },
  
  nome: {
    required: 'Nome é obrigatório',
    minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
    maxLength: { value: 200, message: 'Nome deve ter no máximo 200 caracteres' },
    pattern: { 
      value: /^[a-zA-ZÀ-ÿ0-9\s\-_.,()]+$/, 
      message: 'Nome deve conter apenas letras, números e caracteres especiais básicos' 
    }
  },
  
  produto_origem_id: {
    validate: (value) => {
      if (!value || value === '' || value === 'null') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return 'Produto origem deve ser selecionado';
      }
      return true;
    }
  },
  
  fator_conversao: {
    min: { value: 0.001, message: 'Fator de conversão deve ser maior que 0' },
    max: { value: 999999.999, message: 'Fator de conversão deve ser menor que 999999.999' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return 'Fator de conversão deve ser um número válido';
      }
      if (numValue < 0.001 || numValue > 999999.999) {
        return 'Fator de conversão deve estar entre 0.001 e 999999.999';
      }
      return true;
    }
  },
  
  grupo_id: {
    validate: (value) => {
      if (!value || value === '' || value === 'null') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return 'Grupo deve ser selecionado';
      }
      return true;
    }
  },
  
  subgrupo_id: {
    validate: (value) => {
      if (!value || value === '' || value === 'null') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return 'Subgrupo deve ser selecionado';
      }
      return true;
    }
  },
  
  classe_id: {
    validate: (value) => {
      if (!value || value === '' || value === 'null') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return 'Classe deve ser selecionada';
      }
      return true;
    }
  },
  
  unidade_medida_id: {
    validate: (value) => {
      if (!value || value === '' || value === 'null') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        return 'Unidade de medida deve ser selecionada';
      }
      return true;
    }
  },
  
  referencia_mercado: {
    maxLength: { value: 200, message: 'Referência de mercado deve ter no máximo 200 caracteres' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      if (value.length > 200) {
        return 'Referência de mercado deve ter no máximo 200 caracteres';
      }
      return true;
    }
  },
  
  produto_padrao: {
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      if (!['Sim', 'Não'].includes(value)) {
        return 'Produto padrão deve ser "Sim" ou "Não"';
      }
      return true;
    }
  },
  
  peso_liquido: {
    min: { value: 0.001, message: 'Peso líquido deve ser maior que 0' },
    max: { value: 999999.999, message: 'Peso líquido deve ser menor que 999999.999' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return 'Peso líquido deve ser um número válido';
      }
      if (numValue < 0.001 || numValue > 999999.999) {
        return 'Peso líquido deve estar entre 0.001 e 999999.999';
      }
      return true;
    }
  },
  
  peso_bruto: {
    min: { value: 0.001, message: 'Peso bruto deve ser maior que 0' },
    max: { value: 999999.999, message: 'Peso bruto deve ser menor que 999999.999' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return 'Peso bruto deve ser um número válido';
      }
      if (numValue < 0.001 || numValue > 999999.999) {
        return 'Peso bruto deve estar entre 0.001 e 999999.999';
      }
      return true;
    }
  },
  
  regra_palet: {
    min: { value: 1, message: 'Regra palet deve ser maior que 0' },
    max: { value: 999999, message: 'Regra palet deve ser menor que 999999' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue)) {
        return 'Regra palet deve ser um número inteiro válido';
      }
      if (numValue < 1 || numValue > 999999) {
        return 'Regra palet deve estar entre 1 e 999999';
      }
      return true;
    }
  },
  
  informacoes_adicionais: {
    maxLength: { value: 65535, message: 'Informações adicionais deve ter no máximo 65535 caracteres' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      if (value.length > 65535) {
        return 'Informações adicionais deve ter no máximo 65535 caracteres';
      }
      return true;
    }
  },
  
  referencia_interna: {
    maxLength: { value: 200, message: 'Referência interna deve ter no máximo 200 caracteres' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      if (value.length > 200) {
        return 'Referência interna deve ter no máximo 200 caracteres';
      }
      return true;
    }
  },
  
  referencia_externa: {
    maxLength: { value: 200, message: 'Referência externa deve ter no máximo 200 caracteres' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      if (value.length > 200) {
        return 'Referência externa deve ter no máximo 200 caracteres';
      }
      return true;
    }
  },
  
  registro_especifico: {
    maxLength: { value: 200, message: 'Registro específico deve ter no máximo 200 caracteres' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      if (value.length > 200) {
        return 'Registro específico deve ter no máximo 200 caracteres';
      }
      return true;
    }
  },
  
  tipo_registro: {
    maxLength: { value: 100, message: 'Tipo de registro deve ter no máximo 100 caracteres' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      if (value.length > 100) {
        return 'Tipo de registro deve ter no máximo 100 caracteres';
      }
      return true;
    }
  },
  
  prazo_validade_padrao: {
    min: { value: 1, message: 'Prazo de validade deve ser maior que 0' },
    max: { value: 999999, message: 'Prazo de validade deve ser menor que 999999' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue)) {
        return 'Prazo de validade deve ser um número inteiro válido';
      }
      if (numValue < 1 || numValue > 999999) {
        return 'Prazo de validade deve estar entre 1 e 999999';
      }
      return true;
    }
  },
  
  unidade_validade: {
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      if (!['Dias', 'Semanas', 'Meses', 'Anos'].includes(value)) {
        return 'Unidade de validade deve ser Dias, Semanas, Meses ou Anos';
      }
      return true;
    }
  },
  
  integracao_senior: {
    maxLength: { value: 50, message: 'Integração Senior deve ter no máximo 50 caracteres' },
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      if (value.length > 50) {
        return 'Integração Senior deve ter no máximo 50 caracteres';
      }
      return true;
    }
  },
  
  status: {
    validate: (value) => {
      if (!value || value === '') return true; // Campo opcional
      const numValue = parseInt(value);
      if (isNaN(numValue) || (numValue !== 0 && numValue !== 1)) {
        return 'Status deve ser 0 (inativo) ou 1 (ativo)';
      }
      return true;
    }
  }
};
