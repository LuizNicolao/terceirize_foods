import React from 'react';
import FoodsProdutosGenericosStats from 'foods-frontend/src/components/produto-generico/ProdutosGenericosStats';

/**
 * Componente adaptador para ProdutosGenericosStats
 * Re-exporta o componente do Foods
 */
const ProdutosGenericosStats = (props) => {
  return <FoodsProdutosGenericosStats {...props} />;
};

export default ProdutosGenericosStats;

