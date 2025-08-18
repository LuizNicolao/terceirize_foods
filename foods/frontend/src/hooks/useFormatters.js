import { useCallback } from 'react';

export const useFormatters = () => {
  // Formatar CPF (000.000.000-00)
  const formatCPF = useCallback((value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara
    return limited.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }, []);

  // Formatar CNPJ (00.000.000/0000-00)
  const formatCNPJ = useCallback((value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 14 dígitos
    const limited = numbers.slice(0, 14);
    
    // Aplica a máscara
    return limited.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }, []);

  // Formatar CEP (00000-000)
  const formatCEP = useCallback((value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 8 dígitos
    const limited = numbers.slice(0, 8);
    
    // Aplica a máscara
    return limited.replace(/(\d{5})(\d{3})/, '$1-$2');
  }, []);

  // Formatar telefone ((00) 00000-0000 ou (00) 0000-0000)
  const formatPhone = useCallback((value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara baseada no número de dígitos
    if (limited.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      return limited.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      // Celular: (00) 00000-0000
      return limited.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  }, []);

  // Função genérica para formatar baseado no tipo
  const formatField = useCallback((value, type) => {
    switch (type) {
      case 'cpf':
        return formatCPF(value);
      case 'cnpj':
        return formatCNPJ(value);
      case 'cep':
        return formatCEP(value);
      case 'phone':
        return formatPhone(value);
      default:
        return value;
    }
  }, [formatCPF, formatCNPJ, formatCEP, formatPhone]);

  // Handler para onChange que aplica formatação automaticamente
  const handleFormatChange = useCallback((e, type, setValue) => {
    const rawValue = e.target.value;
    const formattedValue = formatField(rawValue, type);
    
    // Atualiza o valor formatado
    setValue(formattedValue);
    
    // Retorna o evento modificado
    return {
      ...e,
      target: {
        ...e.target,
        value: formattedValue
      }
    };
  }, [formatField]);

  return {
    formatCPF,
    formatCNPJ,
    formatCEP,
    formatPhone,
    formatField,
    handleFormatChange
  };
};
