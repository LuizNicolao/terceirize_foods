// Função para calcular a semana de abastecimento (semana anterior à data de consumo)
export const calcularSemanaAbastecimento = (dataConsumo) => {
  if (!dataConsumo) return '';
  
  try {
    const data = new Date(dataConsumo);
    
    // Verificar se a data é válida
    if (isNaN(data.getTime())) {
      console.error('Data inválida:', dataConsumo);
      return '';
    }
    
    // Calcular o início da semana anterior (segunda-feira)
    const inicioSemanaAnterior = new Date(data);
    inicioSemanaAnterior.setDate(data.getDate() - 7 - data.getDay() + 1); // -7 dias + ajuste para segunda-feira
    
    // Calcular o fim da semana anterior (domingo)
    const fimSemanaAnterior = new Date(inicioSemanaAnterior);
    fimSemanaAnterior.setDate(inicioSemanaAnterior.getDate() + 6);
    
    // Formatar as datas
    const formatarData = (data) => {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      return `${dia}/${mes}`;
    };
    
    const resultado = `${formatarData(inicioSemanaAnterior)} a ${formatarData(fimSemanaAnterior)}`;
    return resultado;
  } catch (error) {
    console.error('Erro ao calcular semana de abastecimento:', error);
    return '';
  }
};

// Função para gerar opções de semanas (para compatibilidade com o sistema existente)
export const gerarOpcoesSemanas = () => {
  const opcoes = [];
  const hoje = new Date();
  
  // Gerar 8 semanas (4 anteriores + 4 futuras)
  for (let i = -4; i <= 4; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + (i * 7));
    
    const semana = calcularSemanaAbastecimento(data.toISOString().split('T')[0]);
    if (semana && !opcoes.find(op => op.value === semana)) {
      opcoes.push({
        value: semana,
        label: semana
      });
    }
  }
  
  return opcoes.sort((a, b) => a.value.localeCompare(b.value));
};

// Função para obter a semana atual
export const obterSemanaAtual = () => {
  const hoje = new Date();
  return calcularSemanaAbastecimento(hoje.toISOString().split('T')[0]);
};
