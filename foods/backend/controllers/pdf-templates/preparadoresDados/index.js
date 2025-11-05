/**
 * Índice dos preparadores de dados por tela
 * Centraliza o registro de todos os preparadores disponíveis
 */

const SolicitacoesComprasPreparador = require('./solicitacoesComprasPreparador');
const PedidosComprasPreparador = require('./pedidosComprasPreparador');
const RelatorioInspecaoPreparador = require('./relatorioInspecaoPreparador');

// Mapeamento de tela -> preparador
const PREPARADORES = {
  'solicitacoes-compras': SolicitacoesComprasPreparador,
  'pedidos-compras': PedidosComprasPreparador,
  'relatorio-inspecao': RelatorioInspecaoPreparador,
  // Adicionar novos preparadores aqui:
  // 'outra-tela': OutraTelaPreparador,
};

/**
 * Obter preparador de dados para uma tela específica
 * @param {string} tela - Nome da tela (ex: 'solicitacoes-compras')
 * @returns {Object|null} - Preparador ou null se não encontrado
 */
function obterPreparador(tela) {
  return PREPARADORES[tela] || null;
}

/**
 * Verificar se existe preparador para uma tela
 * @param {string} tela - Nome da tela
 * @returns {boolean}
 */
function existePreparador(tela) {
  return PREPARADORES.hasOwnProperty(tela) && PREPARADORES[tela] !== null;
}

/**
 * Listar todas as telas com preparadores disponíveis
 * @returns {string[]} - Array com nomes das telas
 */
function listarTelasComPreparador() {
  return Object.keys(PREPARADORES);
}

module.exports = {
  obterPreparador,
  existePreparador,
  listarTelasComPreparador,
  PREPARADORES
};

