import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Componente para desenhar a linha da rota com setas de direção
 * Usa método nativo do Leaflet para adicionar setas
 */
/**
 * Adiciona setas de direção ao longo da rota
 */
const addDirectionArrows = (positions, map, color, arrowsRef) => {
    const arrowMarkers = [];
    const arrowSpacing = Math.max(3, Math.floor(positions.length / 10)); // Espaçamento adaptativo
    
    for (let i = 0; i < positions.length - 1; i++) {
      // Adicionar seta a cada N pontos
      if (i % arrowSpacing === 0 || i === positions.length - 2) {
        const [lat1, lon1] = positions[i];
        const [lat2, lon2] = positions[i + 1];
        
        // Calcular ponto médio
        const midLat = (lat1 + lat2) / 2;
        const midLon = (lon1 + lon2) / 2;
        
        // Calcular ângulo de rotação (em graus)
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
        const angle = Math.atan2(dLat, dLon) * 180 / Math.PI;
        
        // Criar ícone de seta
        const arrowIcon = L.divIcon({
          className: 'route-arrow-marker',
          html: `
            <div style="
              transform: rotate(${angle}deg);
              width: 0;
              height: 0;
              border-left: 10px solid transparent;
              border-right: 10px solid transparent;
              border-bottom: 16px solid ${color};
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 8]
        });
        
        const marker = L.marker([midLat, midLon], { 
          icon: arrowIcon,
          interactive: false,
          keyboard: false
        }).addTo(map);
        
        arrowMarkers.push(marker);
      }
    }
    
    arrowsRef.current = arrowMarkers;
};

const RoutePolyline = ({ positions, color = '#ef4444', weight = 5, opacity = 0.8 }) => {
  const map = useMap();
  const polylineRef = useRef(null);
  const arrowsRef = useRef([]);

  useEffect(() => {
    if (!positions || positions.length < 2) return;

    // Remover polyline anterior se existir
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }
    
    // Remover setas anteriores
    arrowsRef.current.forEach(marker => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    arrowsRef.current = [];

    // Criar polyline principal
    const polyline = L.polyline(positions, {
      color,
      weight,
      opacity,
      lineJoin: 'round',
      lineCap: 'round',
      smoothFactor: 1
    }).addTo(map);

    polylineRef.current = polyline;

    // Adicionar setas de direção ao longo da rota
    addDirectionArrows(positions, map, color, arrowsRef);

    return () => {
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
      }
      arrowsRef.current.forEach(marker => {
        if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      });
      arrowsRef.current = [];
    };
  }, [map, positions, color, weight, opacity]);

  return null;
};

export default RoutePolyline;

