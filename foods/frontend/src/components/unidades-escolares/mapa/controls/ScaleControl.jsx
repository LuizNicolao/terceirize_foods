import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Controle de escala
 * Mostra a escala do mapa em metros/quilômetros
 */
const ScaleControl = ({ position = 'bottomleft', metric = true, imperial = false }) => {
  const map = useMap();

  useEffect(() => {
    const scaleControl = L.control.scale({
      position,
      metric,
      imperial,
      maxWidth: 200
    });

    map.addControl(scaleControl);

    return () => {
      map.removeControl(scaleControl);
    };
  }, [map, position, metric, imperial]);

  return null;
};

export default ScaleControl;

