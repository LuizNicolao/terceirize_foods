import React from 'react';
import FoodsProdutoGenericoModal from 'foods-frontend/src/components/produto-generico/ProdutoGenericoModal';

/**
 * Componente adaptador para ProdutoGenericoModal
 * Re-exporta o componente do Foods
 */
const ProdutoGenericoModal = (props) => {
  return <FoodsProdutoGenericoModal {...props} />;
};

export default ProdutoGenericoModal;

