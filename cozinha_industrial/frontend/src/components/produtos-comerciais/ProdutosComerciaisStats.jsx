import React from 'react';
import FoodsProdutosComerciaisStats from 'foods-frontend/src/components/produto-comercial/ProdutoComercialStats';

/**
 * Componente adaptador para ProdutosComerciaisStats
 * Re-exporta o componente do Foods
 */
const ProdutosComerciaisStats = (props) => {
  return <FoodsProdutosComerciaisStats estatisticas={props.stats || props.estatisticas} />;
};

export default ProdutosComerciaisStats;

