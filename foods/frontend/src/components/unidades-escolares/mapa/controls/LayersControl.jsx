import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Controle de camadas do mapa
 * Permite alternar entre diferentes estilos de mapa
 */
const LayersControl = ({ onLayerChange }) => {
  const map = useMap();
  const layersRef = useRef({});
  const currentLayerRef = useRef(null);
  const controlRef = useRef(null);

  useEffect(() => {
    // Aguardar um pouco para garantir que o TileLayer padrão já foi adicionado
    const timeoutId = setTimeout(() => {
      // Definir camadas disponíveis
      const baseLayers = {
        'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }),
        'OpenStreetMap Hot': L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a>',
          maxZoom: 19
        }),
        'CartoDB Positron': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }),
        'CartoDB Dark Matter': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        })
      };

      layersRef.current = baseLayers;

      // Encontrar e remover TileLayer existente (o padrão do React-Leaflet)
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          const url = layer._url || '';
          // Remover apenas o TileLayer padrão do OpenStreetMap
          if (url.includes('openstreetmap.org') && !url.includes('hot') && !url.includes('cartocdn')) {
            map.removeLayer(layer);
          }
        }
      });

      // Adicionar camada padrão
      currentLayerRef.current = baseLayers['OpenStreetMap'];
      baseLayers['OpenStreetMap'].addTo(map);

      // Criar controle de camadas
      const layersControl = L.control.layers(baseLayers, null, {
        position: 'topright',
        collapsed: true
      });

      controlRef.current = layersControl;
      map.addControl(layersControl);

      // Listener para mudança de camada
      const handleLayerChange = (e) => {
        if (currentLayerRef.current) {
          map.removeLayer(currentLayerRef.current);
        }
        currentLayerRef.current = e.layer;
        if (onLayerChange) {
          onLayerChange(e.name);
        }
      };

      map.on('baselayerchange', handleLayerChange);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (controlRef.current) {
        map.removeControl(controlRef.current);
      }
      map.off('baselayerchange');
      // Remover todas as camadas gerenciadas
      if (layersRef.current) {
        Object.values(layersRef.current).forEach(layer => {
          if (map.hasLayer(layer)) {
            map.removeLayer(layer);
          }
        });
      }
    };
  }, [map, onLayerChange]);

  return null;
};

export default LayersControl;
