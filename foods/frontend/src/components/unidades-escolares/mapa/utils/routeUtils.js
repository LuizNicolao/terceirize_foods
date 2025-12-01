/**
 * Utilitários para cálculos de rota
 */

/**
 * Calcula a distância entre dois pontos em coordenadas (Haversine)
 * @param {number} lat1 - Latitude do primeiro ponto
 * @param {number} lon1 - Longitude do primeiro ponto
 * @param {number} lat2 - Latitude do segundo ponto
 * @param {number} lon2 - Longitude do segundo ponto
 * @returns {number} Distância em quilômetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calcula a distância total de uma rota
 * @param {Array} positions - Array de coordenadas [[lat, lon], ...]
 * @returns {number} Distância total em quilômetros
 */
export const calculateRouteDistance = (positions) => {
  if (!positions || positions.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < positions.length - 1; i++) {
    const [lat1, lon1] = positions[i];
    const [lat2, lon2] = positions[i + 1];
    totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
  }
  
  return totalDistance;
};

/**
 * Calcula distâncias entre pontos consecutivos
 * @param {Array} positions - Array de coordenadas [[lat, lon], ...]
 * @returns {Array} Array de distâncias em km
 */
export const calculateSegmentDistances = (positions) => {
  if (!positions || positions.length < 2) return [];
  
  const distances = [];
  for (let i = 0; i < positions.length - 1; i++) {
    const [lat1, lon1] = positions[i];
    const [lat2, lon2] = positions[i + 1];
    distances.push(calculateDistance(lat1, lon1, lat2, lon2));
  }
  
  return distances;
};

/**
 * Cria marcadores especiais para início e fim da rota
 * @param {boolean} isStart - Se é o ponto de início
 * @param {boolean} isEnd - Se é o ponto de fim
 * @param {number} ordem - Ordem de entrega
 * @returns {L.DivIcon} Ícone customizado
 */
export const createRouteMarkerIcon = (isStart, isEnd, ordem) => {
  let backgroundColor = '#ef4444'; // Vermelho padrão
  let borderColor = '#dc2626';
  let size = 40;
  
  if (isStart) {
    backgroundColor = '#10b981'; // Verde para início
    borderColor = '#059669';
    size = 44;
  } else if (isEnd) {
    backgroundColor = '#f59e0b'; // Laranja para fim
    borderColor = '#d97706';
    size = 44;
  }
  
  return L.divIcon({
    className: 'route-marker',
    html: `
      <div style="
        background-color: ${backgroundColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 4px solid ${borderColor};
        box-shadow: 0 4px 8px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          transform: rotate(45deg);
          width: 18px;
          height: 18px;
          background-color: white;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          color: ${backgroundColor};
        ">${ordem}</div>
        ${isStart ? `
        <div style="
          position: absolute;
          top: -4px;
          left: -4px;
          width: 16px;
          height: 16px;
          background-color: #10b981;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
          font-weight: bold;
        ">S</div>
        ` : ''}
        ${isEnd ? `
        <div style="
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background-color: #f59e0b;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
          font-weight: bold;
        ">F</div>
        ` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

