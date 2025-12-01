import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createRouteMarkerIcon } from './utils/routeUtils';

/**
 * Componente para renderizar marcadores especiais da rota
 * Diferencia início, meio e fim da rota
 */
const RouteMarkers = ({ unidadesComOrdem, isCurrent }) => {
  if (!unidadesComOrdem || unidadesComOrdem.length === 0) return null;

  return (
    <>
      {unidadesComOrdem.map((unidade, index) => {
        const lat = unidade.lat;
        const long = unidade.long;
        const isStart = index === 0;
        const isEnd = index === unidadesComOrdem.length - 1;
        const ordemEntrega = unidade.ordem_entrega || index + 1;
        const isCurrentUnit = isCurrent && unidade.id === isCurrent.id;

        if (lat === null || long === null || lat === 0 || long === 0) {
          return null;
        }

        // Se for unidade atual, usar ícone especial
        if (isCurrentUnit) {
          return null; // Será renderizado pelo marcador normal
        }

        return (
          <Marker
            key={`route-${unidade.id}`}
            position={[lat, long]}
            icon={createRouteMarkerIcon(isStart, isEnd, ordemEntrega)}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  {isStart && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Início
                    </span>
                  )}
                  {isEnd && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                      Fim
                    </span>
                  )}
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800 font-semibold text-xs">
                    {ordemEntrega}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {unidade.nome_escola || 'Unidade Escolar'}
                </h3>
                {unidade.codigo_teknisa && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Código:</span> {unidade.codigo_teknisa}
                  </p>
                )}
                {unidade.cidade && unidade.estado && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Localização:</span> {unidade.cidade}/{unidade.estado}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Ordem de entrega: {ordemEntrega}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default RouteMarkers;

