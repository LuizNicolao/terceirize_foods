/**
 * Componentes UI - Re-exportação do Foods + Específicos do Cozinha Industrial
 * 
 * Este arquivo centraliza todos os componentes UI:
 * - Componentes genéricos: importados do Foods (fonte única)
 * - Componentes específicos: mantidos localmente
 */

// Re-exportar TODOS os componentes UI do Foods usando alias
export * from 'foods-frontend/src/components/ui';

// Componentes específicos do Cozinha Industrial (manter locais)
export { default as SemanaAbastecimentoFilter } from './SemanaAbastecimentoFilter';
export { default as SearchableSelect } from './SearchableSelect';

// Sobrescrever ActionButtons para suportar funções (chama funções antes de verificar)
export { default as ActionButtons } from './ActionButtons';
