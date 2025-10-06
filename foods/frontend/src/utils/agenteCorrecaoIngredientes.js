/**
 * Agente Híbrido Inteligente de Correção de Ingredientes - CUSTO ZERO
 * 
 * Combina múltiplas estratégias gratuitas:
 * 1. Regras contextuais (baseadas em dados reais)
 * 2. Algoritmo de similaridade (corrige erros de digitação)
 * 3. Base de conhecimento dinâmica (aprende padrões)
 * 4. Análise semântica (entende relacionamentos)
 */

// Base de conhecimento dinâmica
let baseConhecimento = new Map();
let padroesAprendidos = new Map();

// Banco de ingredientes conhecidos
const bancoIngredientes = [
  'arroz', 'feijão', 'frango', 'carne', 'tomate', 'cebola', 'batata', 'cenoura',
  'abobrinha', 'milho', 'banana', 'tangerina', 'pêssego', 'maçã', 'tempero verde',
  'alho', 'limão', 'azeite', 'sal', 'pimenta', 'cebolinha', 'salsinha', 'coentro',
  'ervilha', 'couve', 'repolho', 'alface', 'pepino', 'abóbora', 'batata doce',
  'tilápia', 'peixe', 'salmão', 'bacalhau', 'camarão', 'lula', 'polvo',
  'macarrão', 'macarronada', 'beterraba', 'melancia', 'aveia', 'iogurte', 'mel',
  'biscoito', 'laranja', 'mamão', 'brócolis', 'couve flor', 'agrião', 'canela',
  'café', 'açúcar', 'leite', 'farofa'
];

/**
 * Calcula similaridade entre duas strings usando algoritmo de Levenshtein
 */
const calcularSimilaridade = (str1, str2) => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return 1 - (matrix[str2.length][str1.length] / Math.max(str1.length, str2.length));
};

/**
 * Estratégia 1: Corrige erros de digitação usando similaridade
 */
const corrigirErroDigitação = (ingrediente) => {
  const similaridades = bancoIngredientes.map(item => ({
    item,
    similaridade: calcularSimilaridade(ingrediente.toLowerCase(), item)
  }));
  
  const melhor = similaridades
    .filter(s => s.similaridade > 0.7)
    .sort((a, b) => b.similaridade - a.similaridade)[0];
  
  return melhor ? melhor.item : ingrediente;
};

/**
 * Estratégia 2: Aplica regras contextuais baseadas em dados reais
 */
const aplicarRegrasContextuais = (ingrediente, contexto) => {
  const lower = ingrediente.toLowerCase().trim();
  
  // Regras baseadas nos padrões reais do banco
  const regras = {
    'colorido': contexto.temArroz ? 'arroz colorido' : ingrediente,
    'integral': contexto.temArroz ? 'arroz integral' : ingrediente,
    'desfiado': contexto.temFrango ? 'frango desfiado' : ingrediente,
    'cubos': contexto.temAbobrinha ? 'abobrinha em cubos' : 
             contexto.temCarne ? 'carne em cubos' :
             contexto.temTomate ? 'tomate em cubos' : ingrediente,
    'congelado': contexto.temMilho ? 'milho congelado' :
                 lower.includes('ervilha') ? 'ervilha congelada' : ingrediente,
    'acebolado': contexto.temFrango ? 'frango acebolado' : ingrediente,
    'acebolada': contexto.temCarne ? 'carne acebolada' : ingrediente,
    'refogado': contexto.temFrango ? 'frango refogado' :
                contexto.temCarne ? 'carne refogada' :
                contexto.temBatata ? 'batata refogada' : ingrediente,
    'moída': 'carne moída',
    'moida': 'carne moída',
    'ensopada': 'carne ensopada',
    'ralada': contexto.temCenoura ? 'cenoura ralada' : ingrediente,
    'fatiado': contexto.temCenoura ? 'cenoura fatiada' :
               lower.includes('couve') ? 'couve fatiada' : ingrediente,
    'fatias': 'alface em fatias',
    'fatia': 'alface em fatia',
    'iscas': contexto.temCarne ? 'carne em iscas' : ingrediente,
    'bovina': contexto.temCarne ? 'carne bovina' : ingrediente,
    'maca': 'maçã',
    'pessego': 'pêssego',
    'feijao': 'feijão',
    'doce': contexto.temBatata ? 'batata doce' : ingrediente,
    'salsinha': 'salsinha',
    'massinha': 'pão massinha',
    'suco': 'suco de uva',
    'uva': 'suco de uva',
    'mamão': 'mamão',
    'tilápia': 'tilápia',
    'peixe': 'peixe',
    'salmão': 'salmão',
    'bacalhau': 'bacalhau',
    'camarão': 'camarão',
    'lula': 'lula',
    'polvo': 'polvo',
    'macarronada': 'macarrão',
    'macarrãoada': 'macarrão',
    'picada': contexto.temCouve ? 'couve picada' : ingrediente,
    'aveia': 'aveia',
    'iogurte': 'iogurte',
    'mel': 'mel',
    'biscoito': 'biscoito',
    'laranja': 'laranja',
    'brócolis': 'brócolis',
    'flor': contexto.temCouve ? 'couve flor' : ingrediente,
    'agrião': 'agrião',
    'canela': 'canela',
    'café': 'café',
    'açúcar': 'açúcar',
    'leite': 'leite',
    'farofa': 'farofa'
  };
  
  return regras[lower] || ingrediente;
};

/**
 * Estratégia 3: Base de conhecimento dinâmica
 */
const aplicarConhecimento = (ingrediente, contexto) => {
  // Busca correção conhecida
  const conhecido = baseConhecimento.get(ingrediente.toLowerCase());
  if (conhecido && conhecido.contexto === JSON.stringify(contexto)) {
    conhecido.frequencia++;
    return conhecido.correcao;
  }
  
  // Tenta inferir baseado em padrões aprendidos
  const palavras = ingrediente.toLowerCase().split(' ');
  for (const palavra of palavras) {
    const padroes = padroesAprendidos.get(palavra);
    if (padroes) {
      for (const padrao of padroes) {
        if (padrao.contexto === JSON.stringify(contexto)) {
          return padrao.correcao;
        }
      }
    }
  }
  
  return ingrediente;
};

/**
 * Estratégia 4: Análise semântica (entende relacionamentos)
 */
const analiseSemantica = (ingrediente, contexto) => {
  const lower = ingrediente.toLowerCase();
  
  // Análise de relacionamentos semânticos
  const relacionamentos = {
    // Preparações que indicam ingrediente principal
    'em cubos': () => {
      if (contexto.temCarne) return 'carne em cubos';
      if (contexto.temTomate) return 'tomate em cubos';
      if (contexto.temAbobrinha) return 'abobrinha em cubos';
      return ingrediente;
    },
    'refogado': () => {
      if (contexto.temFrango) return 'frango refogado';
      if (contexto.temCarne) return 'carne refogada';
      if (contexto.temBatata) return 'batata refogada';
      return ingrediente;
    },
    'desfiado': () => contexto.temFrango ? 'frango desfiado' : ingrediente,
    'moída': () => 'carne moída',
    'ralada': () => contexto.temCenoura ? 'cenoura ralada' : ingrediente,
    'fatiada': () => contexto.temCenoura ? 'cenoura fatiada' : ingrediente
  };
  
  for (const [preparacao, funcao] of Object.entries(relacionamentos)) {
    if (lower.includes(preparacao)) {
      return funcao();
    }
  }
  
  return ingrediente;
};

/**
 * Função para aprender novos padrões
 */
const aprenderPadrao = (ingrediente, correcao, contexto) => {
  baseConhecimento.set(ingrediente.toLowerCase(), {
    correcao,
    contexto: JSON.stringify(contexto),
    frequencia: 1
  });
  
  // Aprende padrões de palavras
  const palavras = ingrediente.toLowerCase().split(' ');
  palavras.forEach(palavra => {
    if (!padroesAprendidos.has(palavra)) {
      padroesAprendidos.set(palavra, new Set());
    }
    padroesAprendidos.get(palavra).add({
      correcao,
      contexto: JSON.stringify(contexto)
    });
  });
};

/**
 * Função para filtrar informações nutricionais
 */
const filtrarInformacoesNutricionais = (ingredientes) => {
  const informacoesNutricionais = [
    'sem adição de açúcar',
    'sem adição de acucar',
    'integral sem adição',
    'integral sem adicao',
    'sem adição',
    'sem adicao',
    'integral',
    'sem açúcar',
    'sem acucar',
    'sem gordura',
    'sem gordura trans',
    'gordura trans',
    'servir separadamente',
    'separadamente',
    'caseiro',
    'frutas',
    'trans',
    'servir'
  ];
  
  // Filtrar nomes de receitas que não são ingredientes
  const nomesReceitas = [
    'cuca', 'torta', 'bolo', 'pudim', 'sorvete', 'suco', 'vitamina', 'smoothie',
    'mousse', 'flan', 'pavê', 'brigadeiro', 'beijinho', 'cocada', 'doce', 'sobremesa',
    'salada', 'sopa', 'caldo', 'ensopado', 'refogado', 'grelhado', 'assado', 'cozido',
    'frito', 'gratinado', 'risotto', 'lasanha', 'macarronada', 'espaguete', 'nhoque',
    'ravioli', 'pizza', 'hambúrguer', 'sanduíche', 'wrap', 'taco', 'burrito',
    'quesadilla', 'panqueca', 'waffle', 'crepe', 'omelete', 'frittata', 'quiche',
    'tarte', 'strudel', 'croissant', 'baguette', 'focaccia'
  ];
  
  return ingredientes.filter(ingrediente => {
    const lower = ingrediente.toLowerCase().trim();
    // Filtrar ingredientes muito curtos ou que são apenas pontuação
    if (lower.length < 2 || lower === '.' || lower === '*' || lower === 'trans' || lower === 'servir') {
      return false;
    }
    // Filtrar palavras de preparo soltas
    if (lower === 'cubos' || lower === 'fatias' || lower === 'ralada' || lower === 'picada' || 
        lower === 'refogado' || lower === 'assado' || lower === 'cozido' || lower === 'purê' ||
        lower === 'farinha' || lower === 'adição' || lower === 'açúcar' || lower === 'flor' ||
        lower === 'verde' || lower === 'branco' || lower === 'colorido' || lower === 'integral' ||
        lower === 'congelada' || lower === 'congelado' || lower === 'caseiro' || lower === 'separadamente') {
      return false;
    }
    // Filtrar porcentagens e números soltos
    if (lower.match(/^\d+%$/) || lower.match(/^\d+$/) || lower === '50%' || lower === '100%') {
      return false;
    }
    // Filtrar nomes de receitas
    if (nomesReceitas.includes(lower)) {
      return false;
    }
    return !informacoesNutricionais.some(info => lower.includes(info));
  });
};

/**
 * Agente principal híbrido - CUSTO ZERO
 */
export const agenteCorrecaoIngredientes = (ingredientes) => {
  if (!ingredientes || ingredientes.trim() === '') {
    return '';
  }

  const ingredientesArray = ingredientes.split(',').map(i => i.trim());
  const ingredientesCorrigidos = [];
  
  // Contexto para análise inteligente
  let contexto = {
    temArroz: false, temFrango: false, temAbobrinha: false, temMilho: false,
    temFeijao: false, temMaca: false, temCarne: false, temTomate: false,
    temCebola: false, temBatata: false, temCenoura: false, temTemperoVerde: false,
    temBanana: false, temTangerina: false, temPessego: false, temTilapia: false,
    temMacarrao: false, temCouve: false, temBrocolis: false, temAgriao: false,
    temCanela: false, temCafe: false, temAcucar: false, temLeite: false,
    temFarofa: false, temBiscoito: false, temIogurte: false, temMel: false
  };
  
  // Primeira passada: detectar contexto
  ingredientesArray.forEach(ingrediente => {
    const lower = ingrediente.toLowerCase();
    if (lower.includes('arroz')) contexto.temArroz = true;
    if (lower.includes('frango')) contexto.temFrango = true;
    if (lower.includes('abobrinha')) contexto.temAbobrinha = true;
    if (lower.includes('milho')) contexto.temMilho = true;
    if (lower.includes('feijão') || lower.includes('feijao')) contexto.temFeijao = true;
    if (lower.includes('maçã') || lower.includes('maca')) contexto.temMaca = true;
    if (lower.includes('carne')) contexto.temCarne = true;
    if (lower.includes('tomate')) contexto.temTomate = true;
    if (lower.includes('cebola')) contexto.temCebola = true;
    if (lower.includes('batata')) contexto.temBatata = true;
    if (lower.includes('cenoura')) contexto.temCenoura = true;
    if (lower.includes('tempero verde')) contexto.temTemperoVerde = true;
    if (lower.includes('banana')) contexto.temBanana = true;
    if (lower.includes('tangerina')) contexto.temTangerina = true;
    if (lower.includes('pêssego') || lower.includes('pessego')) contexto.temPessego = true;
    if (lower.includes('tilápia')) contexto.temTilapia = true;
    if (lower.includes('macarrão') || lower.includes('macarronada')) contexto.temMacarrao = true;
    if (lower.includes('couve')) contexto.temCouve = true;
    if (lower.includes('brócolis')) contexto.temBrocolis = true;
    if (lower.includes('agrião')) contexto.temAgriao = true;
    if (lower.includes('canela')) contexto.temCanela = true;
    if (lower.includes('café')) contexto.temCafe = true;
    if (lower.includes('açúcar') || lower.includes('acucar')) contexto.temAcucar = true;
    if (lower.includes('leite')) contexto.temLeite = true;
    if (lower.includes('farofa')) contexto.temFarofa = true;
    if (lower.includes('biscoito')) contexto.temBiscoito = true;
    if (lower.includes('iogurte')) contexto.temIogurte = true;
    if (lower.includes('mel')) contexto.temMel = true;
  });
  
  // Segunda passada: aplicar estratégias híbridas
  ingredientesArray.forEach(ingrediente => {
    let corrigido = ingrediente;
    
    // Estratégia 1: Regras contextuais (mais rápido)
    corrigido = aplicarRegrasContextuais(corrigido, contexto);
    if (corrigido !== ingrediente) {
      ingredientesCorrigidos.push(corrigido);
      return;
    }
    
    // Estratégia 2: Análise semântica
    corrigido = analiseSemantica(corrigido, contexto);
    if (corrigido !== ingrediente) {
      ingredientesCorrigidos.push(corrigido);
      return;
    }
    
    // Estratégia 3: Base de conhecimento
    corrigido = aplicarConhecimento(corrigido, contexto);
    if (corrigido !== ingrediente) {
      ingredientesCorrigidos.push(corrigido);
      return;
    }
    
    // Estratégia 4: Correção de digitação
    corrigido = corrigirErroDigitação(corrigido);
    
    // Só adiciona se não for duplicata
    if (!ingredientesCorrigidos.includes(corrigido)) {
      ingredientesCorrigidos.push(corrigido);
    }
  });
  
  // Remover duplicatas e agrupar ingredientes relacionados
  const unicos = [...new Set(ingredientesCorrigidos)];
  
  // Separar ingredientes que estão juntos e agrupar relacionados
  const ingredientesFinais = [];
  const ingredientesProcessados = new Set();
  
  unicos.forEach(ingrediente => {
    const lower = ingrediente.toLowerCase();
    
    // Pular se já foi processado
    if (ingredientesProcessados.has(lower)) return;
    
    // Agrupar ingredientes compostos para evitar duplicatas
    if (lower.includes('carne') && lower.includes('bovina') && lower.includes('cubos')) {
      ingredientesFinais.push('carne bovina em cubos');
      ingredientesProcessados.add('carne bovina em cubos');
      ingredientesProcessados.add('carne');
      ingredientesProcessados.add('carne bovina');
      ingredientesProcessados.add('carne em cubos');
      return;
    }
    
    if (lower.includes('salada') && lower.includes('frutas')) {
      ingredientesFinais.push('salada de frutas');
      ingredientesProcessados.add('salada de frutas');
      ingredientesProcessados.add('salada');
      ingredientesProcessados.add('frutas');
      return;
    }
    
    if (lower.includes('salada') && lower.includes('agrião')) {
      ingredientesFinais.push('salada de agrião');
      ingredientesProcessados.add('salada de agrião');
      ingredientesProcessados.add('salada');
      ingredientesProcessados.add('agrião');
      return;
    }
    
    if (lower.includes('salada') && lower.includes('couve') && lower.includes('flor')) {
      ingredientesFinais.push('salada de couve flor');
      ingredientesProcessados.add('salada de couve flor');
      ingredientesProcessados.add('salada');
      ingredientesProcessados.add('couve flor');
      return;
    }
    
    if (lower.includes('couve') && lower.includes('flor')) {
      ingredientesFinais.push('couve flor');
      ingredientesProcessados.add('couve flor');
      ingredientesProcessados.add('couve');
      ingredientesProcessados.add('flor');
      return;
    }
    
    if (lower.includes('farofa') && lower.includes('beterraba')) {
      ingredientesFinais.push('farofa de beterraba');
      ingredientesProcessados.add('farofa de beterraba');
      ingredientesProcessados.add('farofa');
      ingredientesProcessados.add('beterraba');
      return;
    }
    
    if (lower.includes('carne') && lower.includes('bovina')) {
      ingredientesFinais.push('carne bovina');
      ingredientesProcessados.add('carne bovina');
      ingredientesProcessados.add('carne');
      return;
    }
    
    if (lower.includes('carne') && lower.includes('moída')) {
      ingredientesFinais.push('carne moída');
      ingredientesProcessados.add('carne moída');
      ingredientesProcessados.add('carne');
      return;
    }
    
    if (lower.includes('carne') && lower.includes('ensopada')) {
      ingredientesFinais.push('carne ensopada');
      ingredientesProcessados.add('carne ensopada');
      ingredientesProcessados.add('carne');
      return;
    }
    
    if (lower.includes('frango') && lower.includes('desfiado')) {
      ingredientesFinais.push('frango desfiado');
      ingredientesProcessados.add('frango desfiado');
      ingredientesProcessados.add('frango');
      ingredientesProcessados.add('peito');
      return;
    }
    
    if (lower.includes('frango') && lower.includes('cubos')) {
      ingredientesFinais.push('frango em cubos');
      ingredientesProcessados.add('frango em cubos');
      ingredientesProcessados.add('frango');
      return;
    }
    
    if (lower.includes('ervilha') && lower.includes('congelada')) {
      ingredientesFinais.push('ervilha congelada');
      ingredientesProcessados.add('ervilha congelada');
      ingredientesProcessados.add('ervilha');
      return;
    }
    
    if (lower === 'ervilha') {
      ingredientesFinais.push('ervilha congelada');
      ingredientesProcessados.add('ervilha congelada');
      ingredientesProcessados.add('ervilha');
      return;
    }
    
    if (lower.includes('pão') && lower.includes('massinha')) {
      ingredientesFinais.push('pão massinha');
      ingredientesProcessados.add('pão massinha');
      ingredientesProcessados.add('pão');
      return;
    }
    
    if (lower.includes('alface') && lower.includes('fatias')) {
      ingredientesFinais.push('alface em fatias');
      ingredientesProcessados.add('alface em fatias');
      ingredientesProcessados.add('alface');
      return;
    }
    
    if (lower.includes('cenoura') && lower.includes('fatiada')) {
      ingredientesFinais.push('cenoura fatiada');
      ingredientesProcessados.add('cenoura fatiada');
      ingredientesProcessados.add('cenoura');
      return;
    }
    
    if (lower.includes('ervilha') && lower.includes('congelada')) {
      ingredientesFinais.push('ervilha congelada');
      ingredientesProcessados.add('ervilha congelada');
      ingredientesProcessados.add('ervilha');
      return;
    }
    
    if (lower.includes('suco') && lower.includes('uva')) {
      ingredientesFinais.push('suco de uva');
      ingredientesProcessados.add('suco de uva');
      ingredientesProcessados.add('suco');
      return;
    }
    
    // Separar ingredientes que estão juntos (ex: "batata cenoura")
    if (lower.includes('batata') && lower.includes('cenoura')) {
      ingredientesFinais.push('batata');
      ingredientesFinais.push('cenoura');
      ingredientesProcessados.add('batata');
      ingredientesProcessados.add('cenoura');
      return;
    }
    
    // Separar ingredientes que estão juntos (ex: "cebola tempero verde")
    if (lower.includes('cebola') && lower.includes('tempero') && lower.includes('verde')) {
      ingredientesFinais.push('cebola');
      ingredientesFinais.push('tempero verde');
      ingredientesProcessados.add('cebola');
      ingredientesProcessados.add('tempero verde');
      return;
    }
    
    // Verificar se é parte de um ingrediente composto
    let ingredienteComposto = null;
    
    if (lower.includes('carne') && lower.includes('bovina')) {
      ingredienteComposto = 'carne bovina';
    } else if (lower.includes('carne') && lower.includes('moída')) {
      ingredienteComposto = 'carne moída';
    } else if (lower.includes('carne') && lower.includes('iscas')) {
      ingredienteComposto = 'carne em iscas';
    } else if (lower.includes('carne') && lower.includes('acebolada')) {
      ingredienteComposto = 'carne acebolada';
    } else if (lower.includes('carne') && lower.includes('ensopada')) {
      ingredienteComposto = 'carne ensopada';
    } else if (lower.includes('pão') && lower.includes('massinha')) {
      ingredienteComposto = 'pão massinha';
    } else if (lower.includes('suco') && lower.includes('uva')) {
      ingredienteComposto = 'suco de uva';
    } else if (lower.includes('sem') && lower.includes('adição') && lower.includes('açúcar')) {
      ingredienteComposto = 'sem adição de açúcar';
    } else if (lower.includes('alface') && lower.includes('fatias')) {
      ingredienteComposto = 'alface em fatias';
    } else if (lower.includes('batata') && lower.includes('doce')) {
      ingredienteComposto = 'batata doce';
    }
    
    if (ingredienteComposto) {
      ingredientesFinais.push(ingredienteComposto);
      ingredientesProcessados.add(ingredienteComposto.toLowerCase());
    } else {
      ingredientesFinais.push(ingrediente);
      ingredientesProcessados.add(lower);
    }
  });
  
  // Filtrar informações nutricionais
  const ingredientesFiltrados = filtrarInformacoesNutricionais(ingredientesFinais);
  
  // Converter para maiúsculas para melhor legibilidade
  const ingredientesMaiusculos = ingredientesFiltrados.map(ingrediente => 
    ingrediente.toUpperCase()
  );
  
  return ingredientesMaiusculos.join(', ');
};

/**
 * Função para aprender novos padrões manualmente
 * @param {string} ingrediente - Ingrediente a ser corrigido
 * @param {string} correcao - Correção a ser aplicada
 * @param {object} contexto - Contexto necessário para a correção
 */
export const adicionarCorrecao = (ingrediente, correcao, contexto) => {
  aprenderPadrao(ingrediente, correcao, contexto);
  // Padrão aprendido
};

/**
 * Função para obter estatísticas do agente
 * @param {string} ingredientes - String de ingredientes para análise
 * @returns {object} - Estatísticas da correção
 */
export const obterEstatisticasAgente = (ingredientes) => {
  const original = ingredientes.split(',').map(i => i.trim()).length;
  const corrigido = agenteCorrecaoIngredientes(ingredientes).split(',').map(i => i.trim()).length;
  
  return {
    ingredientesOriginais: original,
    ingredientesCorrigidos: corrigido,
    diferenca: corrigido - original,
    taxaCorrecao: original > 0 ? ((corrigido - original) / original * 100).toFixed(2) + '%' : '0%',
    padroesAprendidos: baseConhecimento.size,
    bancoIngredientes: bancoIngredientes.length
  };
};

/**
 * Função para obter informações sobre o agente
 * @returns {object} - Informações do agente
 */
export const obterInfoAgente = () => {
  return {
    nome: 'Agente Híbrido Inteligente - Custo Zero',
    estrategias: [
      'Regras contextuais (baseadas em dados reais)',
      'Algoritmo de similaridade (corrige erros de digitação)',
      'Base de conhecimento dinâmica (aprende padrões)',
      'Análise semântica (entende relacionamentos)'
    ],
    custo: 'R$ 0,00',
    padroesAprendidos: baseConhecimento.size,
    bancoIngredientes: bancoIngredientes.length,
    versao: '1.0.0'
  };
};

/**
 * Função para limpar a base de conhecimento
 */
export const limparBaseConhecimento = () => {
  baseConhecimento.clear();
  padroesAprendidos.clear();
  // Base de conhecimento limpa
};

/**
 * Função para exportar a base de conhecimento
 * @returns {object} - Base de conhecimento exportada
 */
export const exportarBaseConhecimento = () => {
  return {
    baseConhecimento: Object.fromEntries(baseConhecimento),
    padroesAprendidos: Object.fromEntries(
      Array.from(padroesAprendidos.entries()).map(([key, value]) => [
        key, 
        Array.from(value)
      ])
    ),
    timestamp: new Date().toISOString()
  };
};

export default agenteCorrecaoIngredientes;
