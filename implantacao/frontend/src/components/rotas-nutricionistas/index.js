/**
 * Componentes de Rotas Nutricionistas
 * Importa componentes do Foods e mantém adaptadores locais
 */

// Componentes importados direto do Foods (sem adaptação necessária)
export { 
  RotasNutricionistasModal,
  RotasNutricionistasStats,
  RotasNutricionistasInfoBasicas,
  RotasNutricionistasUsuarios,
  RotasNutricionistasEscolasSelector,
  RotasNutricionistasObservacoes
} from 'foods-frontend/src/components/rotas-nutricionistas';

// Export local adaptors
export { default as RotasNutricionistasTable } from './RotasNutricionistasTable';
export { default as RotasNutricionistasActions } from './RotasNutricionistasActions';
