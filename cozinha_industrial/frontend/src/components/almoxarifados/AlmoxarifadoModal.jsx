import React from 'react';
import FoodsAlmoxarifadoModal from 'foods-frontend/src/components/almoxarifado/AlmoxarifadoModal';

/**
 * Componente adaptador para AlmoxarifadoModal
 * Re-exporta o componente do Foods
 */
const AlmoxarifadoModal = (props) => {
  return <FoodsAlmoxarifadoModal {...props} />;
};

export default AlmoxarifadoModal;

