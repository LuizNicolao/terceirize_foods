import { useCallback } from 'react';
import * as formatters from '../utils/formatters';

/**
 * Hook para formatação de campos durante a digitação
 */
export const useFormatters = () => {
  
  // Formatações básicas
  const formatCodigo = useCallback(formatters.formatCodigo, []);
  const formatNome = useCallback(formatters.formatNome, []);
  const formatDecimal = useCallback(formatters.formatDecimal, []);
  const formatReferenciaMercado = useCallback(formatters.formatReferenciaMercado, []);

  // Formatações de documentos
  const formatCPF = useCallback(formatters.formatCPF, []);
  const formatCNPJ = useCallback(formatters.formatCNPJ, []);
  const formatTelefone = useCallback(formatters.formatTelefone, []);
  const formatCEP = useCallback(formatters.formatCEP, []);

  // Formatações customizadas
  const formatPlaca = useCallback(formatters.formatPlaca, []);
  const formatCNH = useCallback(formatters.formatCNH, []);
  const formatMatricula = useCallback(formatters.formatMatricula, []);

  /**
   * Função genérica para formatação baseada no tipo
   */
  const formatByType = useCallback((value, type, options = {}) => {
    switch (type) {
      case 'codigo':
        return formatCodigo(value);
      case 'nome':
        return formatNome(value);
      case 'decimal':
        return formatDecimal(value, options.maxDecimals);
      case 'referencia':
        return formatReferenciaMercado(value);
      case 'cpf':
        return formatCPF(value);
      case 'cnpj':
        return formatCNPJ(value);
      case 'telefone':
        return formatTelefone(value);
      case 'cep':
        return formatCEP(value);
      case 'placa':
        return formatPlaca(value);
      case 'cnh':
        return formatCNH(value);
      case 'matricula':
        return formatMatricula(value);
      default:
        return value;
    }
  }, [formatCodigo, formatNome, formatDecimal, formatReferenciaMercado, formatCPF, formatCNPJ, formatTelefone, formatCEP, formatPlaca, formatCNH, formatMatricula]);

  return {
    // Formatações básicas
    formatCodigo,
    formatNome,
    formatDecimal,
    formatReferenciaMercado,
    
    // Formatações de documentos
    formatCPF,
    formatCNPJ,
    formatTelefone,
    formatCEP,
    
    // Formatações customizadas
    formatPlaca,
    formatCNH,
    formatMatricula,
    
    // Função genérica
    formatByType
  };
};
