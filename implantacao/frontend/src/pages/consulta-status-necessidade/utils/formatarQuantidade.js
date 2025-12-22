/**
 * Função utilitária para formatar quantidades no padrão brasileiro
 * Formata milhares com vírgula e decimais com vírgula
 */

export const formatarQuantidade = (valor) => {
  if (valor === null || valor === undefined || valor === '') {
    return '0';
  }
  const num = typeof valor === 'number' ? valor : parseFloat(valor);
  if (isNaN(num)) {
    return '0';
  }
  
  // Separar parte inteira e decimal
  const parteInteira = Math.floor(Math.abs(num));
  const parteDecimal = Math.abs(num) - parteInteira;
  const sinal = num < 0 ? '-' : '';
  
  // Formatar parte inteira com separador de milhar (vírgula)
  const parteInteiraFormatada = parteInteira.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Se for um número inteiro, exibir sem decimais
  if (parteDecimal === 0) {
    return sinal + parteInteiraFormatada;
  }
  
  // Caso contrário, formatar com até 3 casas decimais, removendo zeros à direita
  const decimais = parteDecimal.toFixed(3).replace(/\.?0+$/, '');
  return sinal + parteInteiraFormatada + decimais.replace('.', ',');
};

