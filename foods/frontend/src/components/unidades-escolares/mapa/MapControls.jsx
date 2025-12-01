import React from 'react';
import LocationControl from './controls/LocationControl';
import FullscreenControl from './controls/FullscreenControl';
import ResetViewControl from './controls/ResetViewControl';
import LayersControl from './controls/LayersControl';
import ScaleControl from './controls/ScaleControl';
import CustomZoomControl from './controls/CustomZoomControl';

/**
 * Componente principal de controles do mapa
 * Agrupa todos os controles customizados
 */
const MapControls = ({ 
  initialCenter, 
  initialZoom, 
  unidadesEscolares, 
  onReset,
  onLayerChange,
  showLocation = true,
  showFullscreen = true,
  showReset = true,
  showLayers = true,
  showScale = true,
  showCustomZoom = true
}) => {
  return (
    <>
      {showLocation && <LocationControl />}
      {showFullscreen && <FullscreenControl />}
      {showReset && (
        <ResetViewControl 
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          unidadesEscolares={unidadesEscolares}
          onReset={onReset}
        />
      )}
      {showLayers && <LayersControl onLayerChange={onLayerChange} />}
      {showScale && <ScaleControl />}
      {showCustomZoom && <CustomZoomControl />}
    </>
  );
};

export default MapControls;

