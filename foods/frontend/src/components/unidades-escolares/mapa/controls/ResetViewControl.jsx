import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Controle para resetar visualização
 * Retorna o mapa para a visualização inicial ou centro das unidades
 */
const ResetViewControl = ({ initialCenter, initialZoom, unidadesEscolares, onReset }) => {
  const map = useMap();

  useEffect(() => {
    const resetControl = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.cssText = 'background: white; border: 2px solid rgba(0,0,0,0.2); border-radius: 4px;';
        
        const button = L.DomUtil.create('a', 'leaflet-control-button', container);
        button.href = '#';
        button.title = 'Resetar visualização';
        button.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        `;
        button.style.cssText = 'width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;';
        
        const handleReset = () => {
          if (onReset) {
            onReset();
          } else {
            // Resetar para visualização inicial ou centro das unidades
            if (unidadesEscolares && unidadesEscolares.length > 0) {
              const latMedia = unidadesEscolares.reduce((sum, u) => sum + u.lat, 0) / unidadesEscolares.length;
              const longMedia = unidadesEscolares.reduce((sum, u) => sum + u.long, 0) / unidadesEscolares.length;
              map.setView([latMedia, longMedia], unidadesEscolares.length === 1 ? 13 : 8);
            } else if (initialCenter) {
              map.setView(initialCenter, initialZoom || 5);
            }
          }
        };
        
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          handleReset();
        });
        
        L.DomEvent.on(button, 'mouseover', () => {
          button.style.backgroundColor = '#f4f4f4';
        });
        
        L.DomEvent.on(button, 'mouseout', () => {
          button.style.backgroundColor = 'transparent';
        });
        
        return container;
      }
    });

    const control = new resetControl({ position: 'topleft' });
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map, initialCenter, initialZoom, unidadesEscolares, onReset]);

  return null;
};

export default ResetViewControl;

