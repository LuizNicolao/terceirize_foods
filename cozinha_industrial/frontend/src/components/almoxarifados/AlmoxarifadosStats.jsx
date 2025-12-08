import React from 'react';
import FoodsAlmoxarifadosStats from 'foods-frontend/src/components/almoxarifado/AlmoxarifadosStats';

/**
 * Componente adaptador para AlmoxarifadosStats
 * Re-exporta o componente do Foods
 */
const AlmoxarifadosStats = (props) => {
  return <FoodsAlmoxarifadosStats estatisticas={props.stats || props.estatisticas} />;
};

export default AlmoxarifadosStats;

