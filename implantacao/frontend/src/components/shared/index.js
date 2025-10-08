/**
 * Componentes Compartilhados - Re-exportação do Foods + Específicos do Implantação
 * 
 * Este arquivo centraliza todos os componentes compartilhados:
 * - Componentes genéricos: importados do Foods (fonte única)
 * - Componentes específicos: mantidos localmente
 */

// Re-exportar TODOS os componentes compartilhados do Foods
export * from 'foods-frontend/src/components/shared';

// Componentes específicos do Implantação (manter locais)
export { default as ConsultaActions } from './ConsultaActions';