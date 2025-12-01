import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

/**
 * Controle de localização GPS
 * Permite ao usuário localizar sua posição atual no mapa
 */
const LocationControl = () => {
  const map = useMap();

  useEffect(() => {
    // Criar botão de localização
    const locationControl = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.cssText = 'background: white; border: 2px solid rgba(0,0,0,0.2); border-radius: 4px;';
        
        const button = L.DomUtil.create('a', 'leaflet-control-button', container);
        button.href = '#';
        button.title = 'Localizar minha posição';
        button.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
          </svg>
        `;
        button.style.cssText = 'width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;';
        
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          handleLocationClick();
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

    const handleLocationClick = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 15);
            toast.success('Localização encontrada');
          },
          (error) => {
            console.error('Erro ao obter localização:', error);
            toast.error('Não foi possível obter sua localização');
          }
        );
      } else {
        toast.error('Geolocalização não suportada pelo navegador');
      }
    };

    const control = new locationControl({ position: 'topleft' });
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map]);

  return null;
};

export default LocationControl;

