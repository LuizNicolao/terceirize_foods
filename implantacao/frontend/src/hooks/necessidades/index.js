/**
 * Hooks relacionados à tela de Necessidades
 * Organizados em uma pasta dedicada para melhor estruturação do código
 */

// Hook principal para gerenciar necessidades (orchestrator)
export { useNecessidades } from './useNecessidades';

// Hook para filtros de necessidades
export { useNecessidadesFilters } from './useNecessidadesFilters';

// Hook para padrões de necessidades
export { useNecessidadesPadroes } from './useNecessidadesPadroes';

// Hook para consulta de status de necessidades
export { useConsultaStatusNecessidade } from './useConsultaStatusNecessidade';

// Hooks auxiliares (internos - podem ser exportados se necessário)
export { useNecessidadesData } from './useNecessidadesData';
export { useNecessidadesCalculos } from './useNecessidadesCalculos';
export { useNecessidadesTabela } from './useNecessidadesTabela';
export { useNecessidadesExport } from './useNecessidadesExport';
export { useNecessidadesCRUD } from './useNecessidadesCRUD';

