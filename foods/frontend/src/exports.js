/**
 * EXPORTS CENTRAIS DO FOODS
 * 
 * Este arquivo exporta componentes para serem compartilhados
 * com outros sistemas (cozinha_industrial, implantacao)
 * 
 * Para adicionar novos componentes compartilhados:
 * 1. Adicione o export aqui
 * 2. Outros sistemas podem importar: import { Component } from 'foods-shared'
 */

// ==================== UNIDADES ESCOLARES ====================
export { default as UnidadesEscolaresTable } from './components/unidades-escolares/UnidadesEscolaresTable';
export { default as UnidadesEscolaresStats } from './components/unidades-escolares/UnidadesEscolaresStats';
export { default as UnidadesEscolaresActions } from './components/unidades-escolares/UnidadesEscolaresActions';
export { default as UnidadeEscolarModal } from './components/unidades-escolares/UnidadeEscolarModal';
export { default as AlmoxarifadoContent } from './components/unidades-escolares/AlmoxarifadoContent';
export { default as ImportarUnidadesEscolares } from './components/unidades-escolares/ImportarUnidadesEscolares';

// ==================== COMPONENTES UI ====================
export { default as ActionButtons } from './components/ui/ActionButtons';
export { default as EmptyState } from './components/ui/EmptyState';
export { default as LoadingSpinner } from './components/ui/LoadingSpinner';
export { default as Pagination } from './components/ui/Pagination';
export { default as Modal } from './components/ui/Modal';
export { default as Button } from './components/ui/Button';
export { default as Table } from './components/ui/Table';
export { default as Input } from './components/ui/Input';

// ==================== CONTEXTOS ====================
export { AuthContext, AuthProvider, useAuth } from './contexts/AuthContext';
export { PermissionsContext, PermissionsProvider, usePermissions } from './contexts/PermissionsContext';

// ==================== UTILS ====================
export * from './utils/apiResponseHandler';
export * from './utils/index';
