/**
 * Componentes de Rotas Nutricionistas
 * Centraliza a exportação de todos os componentes relacionados a rotas nutricionistas
 */

// Componentes importados direto do Foods (sem adaptação necessária)
export { 
  RotasNutricionistasStats,
  RotasNutricionistasModal,
  RotasNutricionistasInfoBasicas,
  RotasNutricionistasUsuarios,
  RotasNutricionistasEscolasSelector,
  RotasNutricionistasObservacoes
} from 'foods-frontend/src/components/rotas-nutricionistas';

// Export local adaptors
export { default as RotasNutricionistasTable } from './RotasNutricionistasTable';
export { default as RotasNutricionistasActions } from './RotasNutricionistasActions';
