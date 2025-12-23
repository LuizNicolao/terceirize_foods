/**
 * Função utilitária para formatar quantidades no padrão brasileiro
 * Formata milhares com vírgula e decimais com vírgula
 * CORREÇÃO: Valores no banco estão armazenados como inteiros multiplicados por 1000
 * Exemplo: 7200 no banco representa 7,2 (deve dividir por 1000)
 */

export const formatarQuantidade = (valor) => {
  if (valor === null || valor === undefined || valor === '') {
    return '0';
  }
  
  // Se o valor vier como string "7.200", pode ser que o banco retornou como decimal formatado
  // Precisamos verificar se é uma string que representa um número inteiro grande
  let num;
  if (typeof valor === 'string') {
    // Se a string contém ponto, pode ser formato decimal ou separador de milhar
    // Exemplo: "7.200" pode ser 7.2 ou 7200
    // Se não tem vírgula e tem ponto, tentar interpretar como número inteiro
    if (valor.includes('.') && !valor.includes(',')) {
      // Remover pontos e tentar parseFloat
      const semPontos = valor.replace(/\./g, '');
      const numSemPontos = parseFloat(semPontos);
      // Se ao remover os pontos o número fica >= 100, provavelmente é inteiro multiplicado por 1000
      if (!isNaN(numSemPontos) && numSemPontos >= 100 && numSemPontos % 1 === 0) {
        num = numSemPontos / 1000;
      } else {
        num = parseFloat(valor);
      }
    } else {
      num = parseFloat(valor.replace(',', '.'));
    }
  } else {
    num = valor;
  }
  
  if (isNaN(num)) {
    return '0';
  }
  
  // Verificar se o valor precisa ser convertido (valores inteiros >= 100 sem parte decimal)
  // Isso indica que está armazenado como inteiro multiplicado por 1000
  const parteInteiraOriginal = Math.floor(Math.abs(num));
  const parteDecimalOriginal = Math.abs(num) - parteInteiraOriginal;
  
  // Se for um inteiro grande (>= 100) sem parte decimal, dividir por 1000
  if (parteDecimalOriginal === 0 && parteInteiraOriginal >= 100) {
    num = num / 1000;
  }
  
  // Formatar o número completo usando toLocaleString para garantir formatação correta
  const sinal = num < 0 ? '-' : '';
  const numAbsoluto = Math.abs(num);
  
  // Usar toLocaleString para formatar corretamente
  const formatado = numAbsoluto.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  });
  
  return sinal + formatado;
};

