import React from 'react';
import FoodsCentrosCustoStats from 'foods-frontend/src/components/centro-custo/CentrosCustoStats';

/**
 * Adapter para CentrosCustoStats do Foods
 */
const CentrosCustoStats = ({ estatisticas }) => {
  return <FoodsCentrosCustoStats estatisticas={estatisticas} />;
};

export default CentrosCustoStats;

