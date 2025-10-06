/**
 * Utilitários para gerenciar semanas de abastecimento
 * Gera automaticamente semanas de segunda a sexta para o ano atual
 */

/**
 * Gera todas as semanas de abastecimento para um ano
 * @param {number} ano - Ano para gerar as semanas (padrão: ano atual)
 * @returns {Array} Array de objetos com informações das semanas
 */
export const gerarSemanasAbastecimento = (ano = new Date().getFullYear()) => {
  const semanas = [];
  
  // Começar na primeira segunda-feira do ano
  const primeiraSegunda = new Date(ano, 0, 1);
  const diaSemana = primeiraSegunda.getDay();
  const diasParaSegunda = diaSemana === 0 ? 1 : 8 - diaSemana;
  primeiraSegunda.setDate(primeiraSegunda.getDate() + diasParaSegunda);
  
  // Gerar semanas até o final do ano
  let dataAtual = new Date(primeiraSegunda);
  
  while (dataAtual.getFullYear() === ano) {
    const inicioSemana = new Date(dataAtual);
    const fimSemana = new Date(dataAtual);
    fimSemana.setDate(fimSemana.getDate() + 4); // Segunda a sexta (5 dias)
    
    // Só adicionar se a semana não ultrapassar o ano
    if (fimSemana.getFullYear() === ano) {
      semanas.push({
        id: semanas.length + 1,
        label: `${formatarData(inicioSemana)} a ${formatarData(fimSemana)}`,
        dataInicio: inicioSemana.toISOString().split('T')[0],
        dataFim: fimSemana.toISOString().split('T')[0],
        ano: ano
      });
    }
    
    // Próxima semana (próxima segunda)
    dataAtual.setDate(dataAtual.getDate() + 7);
  }
  
  return semanas;
};

/**
 * Formata data para DD/MM
 * @param {Date} data - Data para formatar
 * @returns {string} Data formatada
 */
const formatarData = (data) => {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
};

/**
 * Encontra a semana atual baseada na data de hoje
 * @param {Array} semanas - Array de semanas geradas
 * @returns {Object|null} Semana atual ou null se não encontrada
 */
export const encontrarSemanaAtual = (semanas) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // Primeiro, tentar encontrar uma semana que contenha a data de hoje
  let semanaEncontrada = semanas.find(semana => {
    const inicio = new Date(semana.dataInicio);
    const fim = new Date(semana.dataFim);
    return hoje >= inicio && hoje <= fim;
  });
  
  // Se não encontrou uma semana exata, encontrar a semana mais próxima
  if (!semanaEncontrada) {
    // Encontrar a semana mais próxima (anterior ou posterior)
    semanaEncontrada = semanas.reduce((maisProxima, semana) => {
      const inicio = new Date(semana.dataInicio);
      const fim = new Date(semana.dataFim);
      
      // Calcular distância da data de hoje para o início da semana
      const distanciaInicio = Math.abs(hoje - inicio);
      const distanciaFim = Math.abs(hoje - fim);
      const distanciaMinima = Math.min(distanciaInicio, distanciaFim);
      
      if (!maisProxima) return semana;
      
      const inicioMaisProxima = new Date(maisProxima.dataInicio);
      const fimMaisProxima = new Date(maisProxima.dataFim);
      const distanciaInicioMaisProxima = Math.abs(hoje - inicioMaisProxima);
      const distanciaFimMaisProxima = Math.abs(hoje - fimMaisProxima);
      const distanciaMinimaMaisProxima = Math.min(distanciaInicioMaisProxima, distanciaFimMaisProxima);
      
      return distanciaMinima < distanciaMinimaMaisProxima ? semana : maisProxima;
    }, null);
  }
  
  return semanaEncontrada;
};

/**
 * Gera opções para o selectbox de semanas
 * @param {number} ano - Ano para gerar as semanas
 * @returns {Array} Array de opções para o selectbox
 */
export const gerarOpcoesSemanas = (ano = new Date().getFullYear()) => {
  const semanas = gerarSemanasAbastecimento(ano);
  const semanaAtual = encontrarSemanaAtual(semanas);
  
  const opcoes = [
    { value: '', label: 'Selecione uma semana...' },
    { value: 'todas', label: 'Todas as semanas' }
  ];
  
  // Adicionar semanas
  semanas.forEach(semana => {
    opcoes.push({
      value: semana.label,
      label: semana.label,
      dataInicio: semana.dataInicio,
      dataFim: semana.dataFim,
      isCurrent: semanaAtual && semana.id === semanaAtual.id
    });
  });
  
  return {
    opcoes,
    semanaAtual,
    semanas
  };
};

/**
 * Filtra dados por semana de abastecimento
 * @param {Array} dados - Array de dados para filtrar
 * @param {string} semanaSelecionada - Semana selecionada no formato "DD/MM a DD/MM"
 * @param {string} campoData - Nome do campo de data nos dados
 * @returns {Array} Dados filtrados
 */
export const filtrarPorSemana = (dados, semanaSelecionada, campoData = 'data_recebimento') => {
  if (!semanaSelecionada || semanaSelecionada === '' || semanaSelecionada === 'todas') {
    return dados;
  }
  
  // Extrair datas da semana selecionada
  const [inicioStr, fimStr] = semanaSelecionada.split(' a ');
  const [diaInicio, mesInicio] = inicioStr.split('/');
  const [diaFim, mesFim] = fimStr.split('/');
  
  // Usar o ano dos dados ou ano atual
  const anoRef = dados.length > 0 ? 
    new Date(dados[0][campoData]).getFullYear() : 
    new Date().getFullYear();
  
  const dataInicio = new Date(anoRef, parseInt(mesInicio) - 1, parseInt(diaInicio));
  const dataFim = new Date(anoRef, parseInt(mesFim) - 1, parseInt(diaFim));
  
  // Filtrar dados
  return dados.filter(item => {
    const dataItem = new Date(item[campoData]);
    return dataItem >= dataInicio && dataItem <= dataFim;
  });
};

/**
 * Obtém informações de uma semana específica
 * @param {string} semanaLabel - Label da semana no formato "DD/MM a DD/MM"
 * @param {number} ano - Ano da semana
 * @returns {Object|null} Informações da semana
 */
export const obterInfoSemana = (semanaLabel, ano = new Date().getFullYear()) => {
  const semanas = gerarSemanasAbastecimento(ano);
  return semanas.find(semana => semana.label === semanaLabel);
};
