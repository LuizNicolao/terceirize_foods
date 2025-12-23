/**
 * Função utilitária para formatar quantidades no padrão brasileiro
 * Formata milhares com vírgula e decimais com vírgula
 * CORREÇÃO: Valores no banco estão armazenados como inteiros multiplicados por 1000
 * Exemplo: 7200 no banco representa 7,2 (deve dividir por 1000)
 * 
 * Comportamento:
 * - 7,200 KG → mantém 3 casas decimais (decimais significativos)
 * - 74 KG → sem decimais (decimais são zeros ou inteiro)
 * - 0,500 KG → mantém 3 casas decimais (decimais significativos)
 * - 1 KG → sem decimais (inteiro)
 */

export const formatarQuantidade = (valor) => {
  if (valor === null || valor === undefined || valor === '') {
    return '0';
  }
  
  // Guardar valor original ANTES de qualquer processamento
  const valorOriginalString = String(valor);
  
  // Detectar se o valor original tinha 3 casas decimais
  let tinhaTresCasasDecimais = false;
  if (typeof valor === 'string') {
    // Verificar se tem 3 dígitos após o ponto
    const match = valorOriginalString.match(/\.(\d+)$/);
    if (match && match[1] && match[1].length === 3) {
      tinhaTresCasasDecimais = true;
    }
    // Também verificar formato "0.250" sem zeros à esquerda
    if (valorOriginalString.match(/^0\.\d{3}$/)) {
      tinhaTresCasasDecimais = true;
    }
  } else if (typeof valor === 'number') {
    // Para números, verificar se tem exatamente 3 casas decimais
    // Usar toFixed para preservar zeros à direita
    const valorComZeros = valor.toFixed(3);
    const parteDecimal = parseFloat(valorComZeros) - Math.floor(Math.abs(parseFloat(valorComZeros)));
    const casasDecimais = parteDecimal.toString().split('.')[1];
    if (casasDecimais && casasDecimais.length === 3) {
      // Verificar se o último dígito não é zero (ou se é, mas o valor original tinha 3 casas)
      const ultimoDigito = casasDecimais[2];
      if (ultimoDigito !== '0' || valorComZeros.endsWith('0')) {
        tinhaTresCasasDecimais = true;
      }
    }
    // Caso especial: valores pequenos (< 1) que podem ter 3 casas decimais
    if (Math.abs(valor) < 1 && valor !== 0) {
      const valorStr = valor.toString();
      const match = valorStr.match(/\.(\d+)$/);
      if (match && match[1] && match[1].length >= 3) {
        tinhaTresCasasDecimais = true;
      }
    }
  }
  
  // CORREÇÃO CRÍTICA: Se o valor original veio como STRING com ponto decimal (ex: "160.000"),
  // isso significa que é um DECIMAL do banco, NÃO um inteiro multiplicado por 1000
  // Portanto, NÃO devemos dividir por 1000 neste caso
  let num;
  let veioComoDecimalString = false;
  
  if (typeof valor === 'string') {
    // Se a string contém ponto seguido de dígitos, é um decimal formatado
    // Exemplo: "160.000" é um decimal, não um inteiro 160000
    if (valor.includes('.') && !valor.includes(',')) {
      // Verificar se tem formato decimal (ex: "160.000", "7.200", "0.250")
      const temFormatoDecimal = /^\d+\.\d+$/.test(valor);
      
      if (temFormatoDecimal) {
        // É um decimal formatado do banco (ex: "160.000" = 160.0)
        veioComoDecimalString = true;
        num = parseFloat(valor);
      } else {
        // Pode ser separador de milhar (ex: "7.200" como 7200)
        const semPontos = valor.replace(/\./g, '');
        const numSemPontos = parseFloat(semPontos);
        // Se ao remover os pontos o número fica >= 100, provavelmente é inteiro multiplicado por 1000
        if (!isNaN(numSemPontos) && numSemPontos >= 100 && numSemPontos % 1 === 0) {
          num = numSemPontos / 1000;
        } else {
          num = parseFloat(valor);
        }
      }
    } else {
      num = parseFloat(valor.replace(',', '.'));
    }
  } else {
    // Valor veio como NUMBER
    num = valor;
  }
  
  if (isNaN(num)) {
    return '0';
  }
  
  // Verificar se o valor precisa ser convertido (valores inteiros >= 100 sem parte decimal)
  // IMPORTANTE: Só dividir por 1000 se:
  // 1. NÃO veio como string decimal (ex: "160.000")
  // 2. É um número inteiro >= 100
  // 3. Não tem parte decimal
  const parteInteiraOriginal = Math.floor(Math.abs(num));
  const parteDecimalOriginal = Math.abs(num) - parteInteiraOriginal;
  const ehInteiro = parteDecimalOriginal === 0;
  const ehGrande = parteInteiraOriginal >= 100;
  
  // Se for um inteiro grande (>= 100) sem parte decimal E NÃO veio como string decimal, dividir por 1000
  if (!veioComoDecimalString && ehInteiro && ehGrande) {
    num = num / 1000;
  }
  
  // Formatar o número completo usando toLocaleString para garantir formatação correta
  const sinal = num < 0 ? '-' : '';
  const numAbsoluto = Math.abs(num);
  
  // Verificar se tem parte decimal (qualquer valor decimal, não zero)
  const parteDecimal = numAbsoluto - Math.floor(numAbsoluto);
  const temParteDecimal = parteDecimal > 0.0001; // Tolerância para erros de ponto flutuante
  
  // Verificar se as casas decimais são apenas zeros
  // Usar toFixed(3) para garantir 3 casas e verificar se são zeros
  const valorCom3Casas = numAbsoluto.toFixed(3);
  const casasDecimais = valorCom3Casas.split('.')[1];
  const saoApenasZeros = casasDecimais && casasDecimais === '000';
  
  // Se tem qualquer parte decimal (não zero), sempre mostrar 3 casas
  // Se são apenas zeros (ex: 74.000), mostrar sem decimais (74)
  // Se é inteiro puro, mostrar sem decimais
  const deveMostrar3Casas = temParteDecimal && !saoApenasZeros;
  
  const opcoesFormatacao = deveMostrar3Casas
    ? { minimumFractionDigits: 3, maximumFractionDigits: 3 }
    : { minimumFractionDigits: 0, maximumFractionDigits: 0 };
  
  // Usar toLocaleString para formatar corretamente
  let formatado = numAbsoluto.toLocaleString('pt-BR', opcoesFormatacao);
  
  // Remover zeros à esquerda desnecessários (ex: "00,25" -> "0,25" ou "00,250" -> "0,250")
  // O toLocaleString pode adicionar zeros à esquerda em alguns casos
  // Remover múltiplos zeros no início, mas manter pelo menos um zero antes da vírgula se necessário
  if (formatado.startsWith('00')) {
    // Se começa com "00", remover um zero: "00,250" -> "0,250"
    formatado = formatado.replace(/^00+/, '0');
  } else if (formatado.startsWith('0') && formatado[1] !== ',' && formatado[1] !== '.') {
    // Se começa com "0" mas não é "0," ou "0.", pode ter zeros extras
    // Ex: "01,25" -> "1,25" (mas isso não deveria acontecer com toLocaleString)
    formatado = formatado.replace(/^0+/, '');
    if (formatado.startsWith(',')) {
      formatado = '0' + formatado;
    }
  }
  
  return sinal + formatado;
};

// Função auxiliar para formatar quantidade com unidade
export const formatarQuantidadeComUnidade = (valor, unidade = '') => {
  const quantidadeFormatada = formatarQuantidade(valor);
  return unidade ? `${quantidadeFormatada} ${unidade}` : quantidadeFormatada;
};

