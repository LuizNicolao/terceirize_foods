/**
 * Índice centralizado para todas as funções de formatação
 */

// Formatações básicas
export { formatCodigo, formatNome, formatDecimal, formatReferenciaMercado } from './basicFormatters';

// Formatações específicas por tipo de documento
export { formatCPF, formatCNPJ, formatTelefone, formatCEP } from './documentFormatters';

// Formatações de data e hora
export { formatDate, formatDateTime, formatTime } from './dateFormatters';

// Formatações de moeda e números
export { formatCurrency, formatNumber, formatPercentage } from './numberFormatters';

// Formatações customizadas
export { formatPlaca, formatCNH, formatMatricula } from './customFormatters';
