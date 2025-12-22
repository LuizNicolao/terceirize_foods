/**
 * Índice dos hooks comuns/base
 * Centraliza a exportação dos hooks reutilizáveis
 */

// Hooks base para CRUD
export { usePagination } from './usePagination';
export { useModal } from './useModal';
export { useFilters } from './useFilters';
export { useBaseEntity } from './useBaseEntity';

// Hooks de utilidades
export { useValidation } from './useValidation';
export { useExport } from './useExport';
export { useAuditoria } from './useAuditoria';
export { useInputMask } from './useInputMask';
export { useMaskedField } from './useMaskedField';
export { useKeyboardCellNavigation, useKeyboardCellNavigationWithAjuste } from './useKeyboardCellNavigation';
