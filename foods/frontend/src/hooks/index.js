// Hooks de autenticação e permissões
export { useLoginForm } from './useLoginForm';
export { usePermissoes } from './usePermissoes';

// Hooks de entidades principais
export { useUsuarios } from './useUsuarios';
export { useFornecedores } from './useFornecedores';
export { useClientes } from './useClientes';
export { useProdutos } from './useProdutos';
export { usePatrimonios } from './usePatrimonios';
export { usePatrimoniosList } from './usePatrimoniosList';
export { useHistoricoPatrimonio } from './useHistoricoPatrimonio';

// Hooks de categorização
export { useGrupos } from './useGrupos';
export { useSubgrupos } from './useSubgrupos';
export { useClasses } from './useClasses';
export { useMarcas } from './useMarcas';
export { useUnidades } from './useUnidades';
export { useUnidadesEscolares } from './useUnidadesEscolares';

// Hooks de produtos
export { useProdutoGenerico } from './useProdutoGenerico';
export { useProdutoOrigem } from './useProdutoOrigem';

// Hooks de logística
export { useRotas } from './useRotas';
export { useRotasNutricionistas } from './useRotasNutricionistas';
export { useMotoristas } from './useMotoristas';
export { useVeiculos } from './useVeiculos';
export { useAjudantes } from './useAjudantes';
export { useEfetivos } from './useEfetivos';
export { useFiliais } from './useFiliais';

// Hooks de funcionalidades
export { useIntolerancias } from './useIntolerancias';
export { useDashboard } from './useDashboard';

// Hooks base/comuns (inclui utilidades)
export { 
  usePagination, 
  useModal, 
  useFilters, 
  useBaseEntity,
  useValidation,
  useExport,
  useAuditoria,
  useInputMask,
  useMaskedField
} from './common';
