import React from 'react';
import FoodsProdutoComercialModal from 'foods-frontend/src/components/produto-comercial/ProdutoComercialModal';

/**
 * Componente adaptador para ProdutoComercialModal
 * Re-exporta o componente do Foods
 */
const ProdutoComercialModal = (props) => {
  return <FoodsProdutoComercialModal {...props} />;
};

export default ProdutoComercialModal;

