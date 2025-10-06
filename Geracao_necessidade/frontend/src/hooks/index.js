/**
 * Índice dos hooks
 */

// Hooks específicos
export { default as useEscolas } from './useEscolas';
export { default as useMediasEscolas } from './useMediasEscolas';
export { default as useModal } from './useModal';
export { default as useNecessidades } from './useNecessidades';
export { default as usePermissoes } from './usePermissoes';
export { default as useProdutos } from './useProdutos';
export { default as useProdutosPerCapita } from './useProdutosPerCapita';
export { default as useRecebimentosEscolas } from './useRecebimentosEscolas';
export { default as useRecebimentosRelatorios } from './useRecebimentosRelatorios';
export { useRegistrosDiarios } from './useRegistrosDiarios';
export { default as useUsuarios } from './useUsuarios';

// Hooks comuns
export { 
  useBaseEntity, 
  useFilters, 
  useExport, 
  useAuditoria 
} from './common';
