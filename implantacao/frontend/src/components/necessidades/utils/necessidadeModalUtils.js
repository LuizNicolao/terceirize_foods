/**
 * Utilitários para o modal de necessidades
 */

/**
 * Formata um número para exibição com 3 casas decimais
 * @param {number} numero - Número a ser formatado
 * @returns {string} - Número formatado (ex: "1,234")
 */
export const formatarNumero = (numero) => {
  if (typeof numero !== 'number' || isNaN(numero)) {
    return '0,000';
  }
  return numero.toFixed(3).replace('.', ',');
};

/**
 * Calcula o percentual de diferença entre total e pedido
 * @param {number} total - Valor total calculado
 * @param {number} pedido - Valor do pedido
 * @returns {string} - Percentual formatado com diferença (ex: "10,50% (1,234)")
 */
export const calcularPercentual = (total, pedido) => {
  // Se pedido for 0 ou vazio, retornar vazio
  if (!pedido || pedido === 0 || pedido === '' || isNaN(pedido)) {
    return '-';
  }
  
  // Se total for 0 ou vazio, retornar 100% (falta tudo)
  if (!total || total === 0 || total === '' || isNaN(total)) {
    const diferenca = pedido;
    return `100,00% (${formatarNumero(diferenca)})`;
  }
  
  // Calcular: 1 - (TOTAL / PEDIDO)
  const percentual = (1 - (total / pedido)) * 100;
  
  // Calcular diferença absoluta: PEDIDO - TOTAL
  const diferenca = pedido - total;
  
  // Formatar com 2 casas decimais para percentual e 3 para diferença
  return `${percentual.toFixed(2).replace('.', ',')}% (${formatarNumero(diferenca)})`;
};

/**
 * Gera lista de anos para seleção (ano atual ± 2 anos)
 * @returns {Array} - Array de objetos {value, label}
 */
export const gerarAnos = () => {
  const anos = [];
  const anoAtual = new Date().getFullYear();
  for (let i = anoAtual - 2; i <= anoAtual + 2; i++) {
    anos.push({ value: i, label: i.toString() });
  }
  return anos;
};

/**
 * Gera lista de meses para seleção
 * @returns {Array} - Array de objetos {value, label}
 */
export const gerarMeses = () => {
  return [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];
};

/**
 * Configuração dos tipos de atendimento
 */
export const tiposConfig = [
  { 
    key: 'lanche_manha', 
    label: '🌅 LANCHE DA MANHA', 
    bgColor: 'bg-green-600', 
    bgCellColor: 'bg-green-50',
    icon: '🌅'
  },
  { 
    key: 'almoco', 
    label: '🍽️ ALMOÇO', 
    bgColor: 'bg-blue-600', 
    bgCellColor: 'bg-blue-50',
    icon: '🍽️'
  },
  { 
    key: 'lanche_tarde', 
    label: '🌆 LANCHE DA TARDE', 
    bgColor: 'bg-orange-600', 
    bgCellColor: 'bg-orange-50',
    icon: '🌆'
  },
  { 
    key: 'parcial_manha', 
    label: '🥗 PARCIAL MANHÃ', 
    bgColor: 'bg-purple-600', 
    bgCellColor: 'bg-purple-50',
    icon: '🥗'
  },
  { 
    key: 'parcial_tarde', 
    label: '🥗 PARCIAL TARDE', 
    bgColor: 'bg-purple-700', 
    bgCellColor: 'bg-purple-100',
    icon: '🥗'
  },
  { 
    key: 'eja', 
    label: '🌙 EJA', 
    bgColor: 'bg-indigo-600', 
    bgCellColor: 'bg-indigo-50',
    icon: '🌙'
  }
];

/**
 * Verifica se um tipo de atendimento está disponível para uma escola
 * @param {string} tipo - Tipo de atendimento
 * @param {Array} tiposAtendimentoEscola - Lista de tipos vinculados à escola
 * @returns {boolean} - True se o tipo está disponível
 */
export const tipoDisponivel = (tipo, tiposAtendimentoEscola = []) => {
  // Se não há tipos vinculados (escola não selecionada ou sem vínculos), mostrar todos
  if (!tiposAtendimentoEscola || tiposAtendimentoEscola.length === 0) {
    return true;
  }
  
  // Mapear tipos para os valores do banco
  const mapeamentoTipos = {
    'lanche_manha': 'lanche_manha',
    'almoco': 'almoco',
    'lanche_tarde': 'lanche_tarde',
    'parcial_manha': 'parcial_manha',
    'parcial_tarde': 'parcial_tarde',
    'eja': 'eja'
  };
  
  const tipoMapeado = mapeamentoTipos[tipo];
  if (!tipoMapeado) {
    return false;
  }
  
  return tiposAtendimentoEscola.includes(tipoMapeado);
};

/**
 * Filtra tipos disponíveis baseado nos tipos de atendimento da escola
 * @param {Array} tiposConfig - Configuração de tipos
 * @param {Array} tiposAtendimentoEscola - Lista de tipos vinculados à escola
 * @returns {Array} - Lista de tipos disponíveis
 */
export const filtrarTiposDisponiveis = (tiposConfig, tiposAtendimentoEscola = []) => {
  return tiposConfig.filter(tipo => {
    // Tipos especiais com checkFunction
    if (tipo.checkFunction) {
      return tipo.checkFunction();
    }
    return tipoDisponivel(tipo.key, tiposAtendimentoEscola);
  });
};
