import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Controle de zoom customizado
 * Substitui o controle padrão com estilo personalizado
 */
const CustomZoomControl = ({ position = 'topleft' }) => {
  const map = useMap();

  useEffect(() => {
    // Remover controle padrão se existir
    map.removeControl(map.zoomControl);

    // Criar controle customizado
    const zoomControl = L.control.zoom({
      position,
      zoomInTitle: 'Aumentar zoom',
      zoomOutTitle: 'Diminuir zoom'
    });

    map.addControl(zoomControl);

    // Estilizar os botões
    const styleControl = () => {
      const zoomIn = document.querySelector('.leaflet-control-zoom-in');
      const zoomOut = document.querySelector('.leaflet-control-zoom-out');
      
      if (zoomIn) {
        zoomIn.style.cssText = 'width: 34px; height: 34px; line-height: 34px; font-size: 18px; font-weight: bold;';
      }
      
      if (zoomOut) {
        zoomOut.style.cssText = 'width: 34px; height: 34px; line-height: 34px; font-size: 18px; font-weight: bold;';
      }
    };

    // Aplicar estilo após o controle ser adicionado
    setTimeout(styleControl, 100);

    return () => {
      map.removeControl(zoomControl);
    };
  }, [map, position]);

  return null;
};

export default CustomZoomControl;

