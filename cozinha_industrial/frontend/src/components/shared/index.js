/**
 * Componentes Compartilhados - Re-exportação do Foods + Específicos do Cozinha Industrial
 * 
 * Este arquivo centraliza todos os componentes compartilhados:
 * - Componentes genéricos: importados do Foods (fonte única)
 * - Componentes específicos: mantidos localmente
 */

// Re-exportar TODOS os componentes compartilhados do Foods usando alias
export * from 'foods-frontend/src/components/shared';

// Componentes específicos do Cozinha Industrial (manter locais)
export { default as AlmoxarifadoContent } from './AlmoxarifadoContent';
export { default as AlmoxarifadoModal } from './AlmoxarifadoModal';
export { default as AuditModal } from './AuditModal.jsx';
export { default as ConsultaActions } from './ConsultaActions';
