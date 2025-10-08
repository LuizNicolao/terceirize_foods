// Componentes adaptadores para usar Foods em Implantação
export { default as UnidadesEscolaresTable } from './UnidadesEscolaresTable';
export { default as UnidadesEscolaresActions } from './UnidadesEscolaresActions';

// Componentes importados direto do Foods (sem adaptação necessária)
export { 
  UnidadesEscolaresStats,
  UnidadeEscolarModal,
  ImportarUnidadesEscolares,
  AlmoxarifadoContent
} from 'foods-frontend/src/components/unidades-escolares';