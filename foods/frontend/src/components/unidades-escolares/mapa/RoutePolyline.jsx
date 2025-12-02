import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Configuração do OSRM
 * 
 * Para DESABILITAR OSRM e usar sempre linha reta:
 * - Altere OSRM_ENABLED para false
 * 
 * Para usar servidor OSRM próprio:
 * - Altere OSRM_SERVER_URL para a URL do seu servidor
 * - Se rodar localmente: 'http://localhost:5000'
 * - Se rodar no Docker: 'http://osrm:5000' (nome do container)
 * - Se rodar em servidor remoto: 'http://seu-servidor:5000'
 */
const OSRM_ENABLED = true; // false = desabilita OSRM, usa sempre linha reta

// Prioridade: servidor local > servidor público
// Se o servidor local estiver rodando, use ele. Caso contrário, tenta o público.
const OSRM_SERVER_URL = process.env.REACT_APP_OSRM_URL || 'http://localhost:5000';
const OSRM_FALLBACK_URL = 'https://router.project-osrm.org'; // Fallback se local falhar

/**
 * Busca rota real usando OSRM (Open Source Routing Machine)
 * Retorna os pontos da rota que seguem as ruas
 */
const fetchRouteFromOSRM = async (start, end) => {
  // Se OSRM estiver desabilitado, retornar linha reta imediatamente
  if (!OSRM_ENABLED) {
    return [start, end];
  }
  try {
    // Formato: longitude,latitude (OSRM usa lon,lat)
    const startCoords = `${start[1]},${start[0]}`;
    const endCoords = `${end[1]},${end[0]}`;
    
    // Tentar primeiro o servidor local, depois fallback
    const tryFetch = async (serverUrl) => {
      const url = `${serverUrl}/route/v1/driving/${startCoords};${endCoords}?overview=full&geometries=geojson`;
      
      // Criar AbortController para timeout manual (compatibilidade com navegadores mais antigos)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    };
    
    let response;
    try {
      // Tentar servidor local primeiro
      response = await tryFetch(OSRM_SERVER_URL);
    } catch (fetchError) {
      // Se servidor local falhar, tentar fallback (servidor público)
      if (OSRM_SERVER_URL !== OSRM_FALLBACK_URL && (
          fetchError.name === 'AbortError' ||
          (fetchError.message && (
            fetchError.message.includes('Failed to fetch') || 
            fetchError.message.includes('ERR_CONNECTION_REFUSED') ||
            fetchError.message.includes('NetworkError') ||
            fetchError.message.includes('Network request failed')
          ))
        )) {
        try {
          response = await tryFetch(OSRM_FALLBACK_URL);
        } catch (fallbackError) {
          // Se fallback também falhar, propagar erro
          if (fallbackError.name === 'AbortError') {
            throw new Error('TIMEOUT');
          }
          if (fallbackError.message && (
              fallbackError.message.includes('Failed to fetch') || 
              fallbackError.message.includes('ERR_CONNECTION_REFUSED') ||
              fallbackError.message.includes('NetworkError') ||
              fallbackError.message.includes('Network request failed')
            )) {
            throw new Error('CONNECTION_REFUSED');
          }
          throw fallbackError;
        }
      } else {
        // Se não for erro de conexão, propagar
        if (fetchError.name === 'AbortError') {
          throw new Error('TIMEOUT');
        }
        if (fetchError.message && (
            fetchError.message.includes('Failed to fetch') || 
            fetchError.message.includes('ERR_CONNECTION_REFUSED') ||
            fetchError.message.includes('NetworkError') ||
            fetchError.message.includes('Network request failed')
          )) {
          throw new Error('CONNECTION_REFUSED');
        }
        throw fetchError;
      }
    }
    
    // Verificar se foi bloqueado por limite de requisições
    if (response.status === 429) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    
    // Verificar se foi bloqueado por política
    if (response.status === 403) {
      throw new Error('FORBIDDEN');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP_${response.status}`);
    }
    
    const data = await response.json();
    
    // Verificar códigos de erro específicos do OSRM
    if (data.code && data.code !== 'Ok') {
      // Códigos comuns do OSRM:
      // - "InvalidQuery" (400): Query inválida
      // - "NoRoute" (404): Não há rota possível
      // - "TooBig" (413): Query muito grande
      if (data.code === 'TooBig') {
        throw new Error('QUERY_TOO_BIG');
      }
      
      // Se falhar, retornar linha reta como fallback
      return [start, end];
    }
    
    if (data.routes && data.routes.length > 0) {
      // Converter GeoJSON coordinates [lon, lat] para [lat, lon]
      const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      return coordinates;
    }
    
    // Se falhar, retornar linha reta como fallback
    return [start, end];
  } catch (error) {
    // Se for erro de bloqueio ou conexão, propagar para tratamento especial
    if (error.message === 'RATE_LIMIT_EXCEEDED' || 
        error.message === 'FORBIDDEN' || 
        error.message === 'CONNECTION_REFUSED' ||
        error.message === 'TIMEOUT') {
      throw error;
    }
    
    // Fallback: retornar linha reta
    return [start, end];
  }
};

/**
 * Busca rota completa conectando todos os pontos
 * Retorna objeto com routePoints e informações sobre bloqueios
 */
const fetchCompleteRoute = async (positions) => {
  if (positions.length < 2) return { routePoints: positions, blocked: false };
  
  const routePoints = [positions[0]]; // Começar com o primeiro ponto
  let blocked = false;
  let blockedReason = null;
  
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
      
      // Pequeno delay para evitar muitas requisições simultâneas
      if (i < positions.length - 2) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      // Se for bloqueio ou erro de conexão, marcar e parar
      if (error.message === 'RATE_LIMIT_EXCEEDED' || 
          error.message === 'FORBIDDEN' || 
          error.message === 'CONNECTION_REFUSED' ||
          error.message === 'TIMEOUT') {
        blocked = true;
        
        if (error.message === 'RATE_LIMIT_EXCEEDED') {
          blockedReason = 'Limite de requisições excedido. Use coordenadas salvas no banco.';
        } else if (error.message === 'FORBIDDEN') {
          blockedReason = 'Acesso negado pelo servidor OSRM. Use coordenadas salvas no banco.';
        } else if (error.message === 'CONNECTION_REFUSED') {
          blockedReason = 'Servidor OSRM indisponível ou conexão recusada. Use coordenadas salvas no banco.';
        } else if (error.message === 'TIMEOUT') {
          blockedReason = 'Timeout ao buscar rota. Servidor não respondeu. Use coordenadas salvas no banco.';
        }
        
        // Adicionar pontos restantes como linha reta
        for (let j = i + 1; j < positions.length; j++) {
          routePoints.push(positions[j]);
        }
        break;
      }
      
      // Fallback: adicionar ponto final diretamente
      routePoints.push(end);
    }
  }
  
  return { routePoints, blocked, blockedReason };
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

const RoutePolyline = ({ positions, color = '#ef4444', weight = 5, opacity = 0.8, useRealRoute = true, onLoadingChange }) => {
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
      if (onLoadingChange) onLoadingChange(true);
      fetchCompleteRoute(positions)
        .then(result => {
          setRoutePoints(result.routePoints);
          setLoading(false);
          if (onLoadingChange) onLoadingChange(false);
        })
        .catch(error => {
          // Fallback: usar posições originais (linha reta)
          setRoutePoints(positions);
          setLoading(false);
          if (onLoadingChange) onLoadingChange(false);
        });
    } else {
      // Se não usar rota real (coordenadas já salvas), usar posições originais diretamente
      setRoutePoints(positions);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [positions, useRealRoute, onLoadingChange]);

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

