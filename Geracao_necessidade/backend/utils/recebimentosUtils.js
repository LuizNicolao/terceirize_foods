/**
 * Utilitários para recebimentos de escolas - Backend
 */

/**
 * Calcula o status de entrega baseado na data e tipo de entrega
 * @param {string} dataRecebimento - Data no formato YYYY-MM-DD
 * @param {string} tipoEntrega - Tipo de entrega (HORTI, PAO, PERECIVEL, BASE SECA, LIMPEZA)
 * @returns {string} - Status da entrega ('No Prazo', 'Atrasado', 'Antecipado')
 */
const calcularStatusEntrega = (dataRecebimento, tipoEntrega) => {
  if (!dataRecebimento || !tipoEntrega) {
    return 'No Prazo';
  }

  // Corrigir parsing de data para evitar problemas de fuso horário
  const [ano, mes, dia] = dataRecebimento.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
  const diaSemana = data.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  
  // Hortifruti e Pão: Segunda (1) e Terça (2) = No Prazo
  if (tipoEntrega === 'HORTI' || tipoEntrega === 'PAO') {
    if (diaSemana === 1 || diaSemana === 2) {
      return 'No Prazo';
    } else {
      return 'Atrasado';
    }
  }
  
  // Perecíveis, Base Seca e Limpeza: Quarta (3) e Quinta (4) = No Prazo
  if (tipoEntrega === 'PERECIVEL' || tipoEntrega === 'BASE SECA' || tipoEntrega === 'LIMPEZA') {
    if (diaSemana === 3 || diaSemana === 4) {
      return 'No Prazo';
    } else if (diaSemana === 1 || diaSemana === 2) {
      return 'Antecipado'; // Segunda e Terça = Antecipado
    } else {
      return 'Atrasado'; // Sexta e outros dias = Atrasado
    }
  }
  
  return 'No Prazo'; // Default
};

/**
 * Obtém estatísticas de status dos recebimentos
 * @param {Array} recebimentos - Lista de recebimentos
 * @returns {Object} - Estatísticas de status
 */
const obterEstatisticasStatus = (recebimentos) => {
  const stats = {
    total: recebimentos.length,
    noPrazo: 0,
    atrasado: 0,
    antecipado: 0
  };

  recebimentos.forEach(recebimento => {
    switch (recebimento.status_entrega) {
      case 'No Prazo':
        stats.noPrazo++;
        break;
      case 'Atrasado':
        stats.atrasado++;
        break;
      case 'Antecipado':
        stats.antecipado++;
        break;
    }
  });

  return stats;
};

/**
 * Valida dados de recebimento
 * @param {Object} dados - Dados do recebimento
 * @returns {Object} - Resultado da validação
 */
const validarDadosRecebimento = (dados) => {
  const erros = [];

  if (!dados.escola_id) {
    erros.push('Escola é obrigatória');
  }

  if (!dados.data_recebimento) {
    erros.push('Data de recebimento é obrigatória');
  }

  if (!dados.tipo_recebimento) {
    erros.push('Tipo de recebimento é obrigatório');
  }

  if (!dados.tipo_entrega) {
    erros.push('Tipo de entrega é obrigatório');
  }

  // Validar data não futura
  if (dados.data_recebimento) {
    const dataRecebimento = new Date(dados.data_recebimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataRecebimento > hoje) {
      erros.push('Data de recebimento não pode ser futura');
    }
  }

  return {
    valido: erros.length === 0,
    erros
  };
};

module.exports = {
  calcularStatusEntrega,
  obterEstatisticasStatus,
  validarDadosRecebimento
};
