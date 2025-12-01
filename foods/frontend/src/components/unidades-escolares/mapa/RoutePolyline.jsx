import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Busca rota real usando OSRM (Open Source Routing Machine)
 * Retorna os pontos da rota que seguem as ruas
 */
const fetchRouteFromOSRM = async (start, end) => {
  try {
    // Formato: longitude,latitude (OSRM usa lon,lat)
    const startCoords = `${start[1]},${start[0]}`;
    const endCoords = `${end[1]},${end[0]}`;
    
    // Usar servidor público do OSRM (pode ser substituído por servidor próprio)
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoords};${endCoords}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro ao buscar rota do OSRM');
    }
    
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      // Converter GeoJSON coordinates [lon, lat] para [lat, lon]
      const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      return coordinates;
    }
    
    // Se falhar, retornar linha reta como fallback
    return [start, end];
  } catch (error) {
    console.warn('Erro ao buscar rota do OSRM, usando linha reta:', error);
    // Fallback: retornar linha reta
    return [start, end];
  }
};

/**
 * Busca rota completa conectando todos os pontos
 */
const fetchCompleteRoute = async (positions) => {
  if (positions.length < 2) return positions;
  
  const routePoints = [positions[0]]; // Começar com o primeiro ponto
  
  // Buscar rota entre cada par de pontos consecutivos
  for (let i = 0; i < positions.length - 1; i++) {
    const start = positions[i];
    const end = positions[i + 1];
    
    try {
      const segmentRoute = await fetchRouteFromOSRM(start, end);
      
      // Adicionar pontos do segmento (pulando o primeiro para evitar duplicação)
      if (segmentRoute.length > 1) {
        routePoints.push(...segmentRoute.slice(1));
      } else {
        routePoints.push(end);
      }
    } catch (error) {
      console.warn(`Erro ao buscar rota entre pontos ${i} e ${i + 1}:`, error);
      // Fallback: adicionar ponto final diretamente
      routePoints.push(end);
    }
  }
  
  return routePoints;
};

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

const RoutePolyline = ({ positions, color = '#ef4444', weight = 5, opacity = 0.8, useRealRoute = true }) => {
  const map = useMap();
  const polylineRef = useRef(null);
  const arrowsRef = useRef([]);
  const [routePoints, setRoutePoints] = useState(null);
  const [loading, setLoading] = useState(false);

  // Buscar rota real quando positions mudar
  useEffect(() => {
    if (!positions || positions.length < 2) {
      setRoutePoints(null);
      return;
    }

    if (useRealRoute) {
      setLoading(true);
      fetchCompleteRoute(positions)
        .then(points => {
          setRoutePoints(points);
          setLoading(false);
        })
        .catch(error => {
          console.error('Erro ao buscar rota completa:', error);
          // Fallback: usar posições originais (linha reta)
          setRoutePoints(positions);
          setLoading(false);
        });
    } else {
      // Se não usar rota real, usar posições originais
      setRoutePoints(positions);
    }
  }, [positions, useRealRoute]);

  // Desenhar polyline quando routePoints estiver pronto
  useEffect(() => {
    if (!routePoints || routePoints.length < 2) return;

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

    // Criar polyline principal com os pontos da rota real
    const polyline = L.polyline(routePoints, {
      color,
      weight,
      opacity,
      lineJoin: 'round',
      lineCap: 'round',
      smoothFactor: 1
    }).addTo(map);

    polylineRef.current = polyline;

    // Adicionar setas de direção ao longo da rota
    addDirectionArrows(routePoints, map, color, arrowsRef);

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
  }, [map, routePoints, color, weight, opacity]);

  return null;
};

export default RoutePolyline;

