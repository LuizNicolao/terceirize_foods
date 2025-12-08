// Componentes adaptadores para usar Foods em Implantação
export { default as UnidadesEscolaresTable } from './UnidadesEscolaresTable';
export { default as UnidadesEscolaresActions } from './UnidadesEscolaresActions';
export { default as UnidadesEscolaresStats } from './UnidadesEscolaresStats'; // Componente local com textos customizados

// Componentes importados direto do Foods (sem adaptação necessária)
export { 
  UnidadeEscolarModal,
  ImportarUnidadesEscolares,
  AlmoxarifadoContent
} from 'foods-frontend/src/components/unidades-escolares';