/**
 * Utilitários para cálculo de dias úteis
 */

/**
 * Verifica se uma data é fim de semana (sábado ou domingo)
 * @param {Date} data - Data para verificar
 * @returns {boolean} - true se for fim de semana
 */
const isFimDeSemana = (data) => {
  const diaSemana = data.getDay();
  return diaSemana === 0 || diaSemana === 6; // 0 = domingo, 6 = sábado
};

/**
 * Calcula uma data que está N dias úteis atrás
 * @param {Date} dataInicial - Data inicial
 * @param {number} diasUteis - Quantidade de dias úteis para retroceder
 * @returns {Date} - Data N dias úteis atrás
 */
const calcularDataNDiasUteisAtras = (dataInicial, diasUteis) => {
  const data = new Date(dataInicial);
  let diasContados = 0;
  
  while (diasContados < diasUteis) {
    data.setDate(data.getDate() - 1);
    
    // Se não for fim de semana, conta como dia útil
    if (!isFimDeSemana(data)) {
      diasContados++;
    }
  }
  
  return data;
};

/**
 * Calcula a data de início considerando os últimos N dias úteis
 * @param {Date} dataReferencia - Data de referência (geralmente hoje)
 * @param {number} diasUteis - Quantidade de dias úteis (padrão: 20)
 * @returns {Object} - Objeto com dataInicio e dataFim
 */
const calcularPeriodoDiasUteis = (dataReferencia = new Date(), diasUteis = 20) => {
  const dataFim = new Date(dataReferencia);
  const dataInicio = calcularDataNDiasUteisAtras(dataFim, diasUteis);
  
  return {
    dataInicio: dataInicio.toISOString().split('T')[0], // YYYY-MM-DD
    dataFim: dataFim.toISOString().split('T')[0] // YYYY-MM-DD
  };
};

/**
 * Conta quantos dias úteis existem entre duas datas
 * @param {Date} dataInicio - Data de início
 * @param {Date} dataFim - Data de fim
 * @returns {number} - Quantidade de dias úteis
 */
const contarDiasUteis = (dataInicio, dataFim) => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  let diasUteis = 0;
  
  while (inicio <= fim) {
    if (!isFimDeSemana(inicio)) {
      diasUteis++;
    }
    inicio.setDate(inicio.getDate() + 1);
  }
  
  return diasUteis;
};

module.exports = {
  isFimDeSemana,
  calcularDataNDiasUteisAtras,
  calcularPeriodoDiasUteis,
  contarDiasUteis
};
