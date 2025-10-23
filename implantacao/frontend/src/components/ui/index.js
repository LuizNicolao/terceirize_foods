/**
 * Componentes UI - Re-exportação do Foods + Específicos do Implantação
 * 
 * Este arquivo centraliza todos os componentes UI:
 * - Componentes genéricos: importados do Foods (fonte única)
 * - Componentes específicos: mantidos localmente
 */

// Re-exportar TODOS os componentes UI do Foods
export * from 'foods-frontend/src/components/ui';

// Componentes específicos do Implantação (manter locais)
export { default as SemanaAbastecimentoFilter } from './SemanaAbastecimentoFilter';
export { default as CadastroFilterBar } from './CadastroFilterBar';
export { SortableHeader, useSorting } from './SortableTable';