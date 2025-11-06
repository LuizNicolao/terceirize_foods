/**
 * Hooks relacionados à tela de Ajuste de Necessidades
 * Organizados em uma pasta dedicada para melhor estruturação do código
 */

// Hook principal (orchestrator)
export { useAjusteNecessidadesOrchestrator } from './useAjusteNecessidadesOrchestrator';

// Hooks específicos por aba
export { useNecessidadesAjuste } from './useNecessidadesAjuste';
export { default as useNecessidadesCoordenacao } from './useNecessidadesCoordenacao';
export { useNecessidadesLogistica } from './useNecessidadesLogistica';

// Hooks auxiliares (internos - podem ser exportados se necessário)
export { useAjustesLocais } from './useAjustesLocais';
export { useProdutoExtra } from './useProdutoExtra';
export { useFiltrosDinamicos } from './useFiltrosDinamicos';
export { useExclusaoNecessidade } from './useExclusaoNecessidade';
export { useGerenciamentoFiltros } from './useGerenciamentoFiltros';
export { useAcoesNecessidades } from './useAcoesNecessidades';
export { useModalProdutoExtra } from './useModalProdutoExtra';

