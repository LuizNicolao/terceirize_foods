import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Controle de tela cheia
 * Permite entrar/sair do modo tela cheia
 */
const FullscreenControl = () => {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', updateFullscreenState);

    // Criar botão de tela cheia
    const fullscreenControl = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.cssText = 'background: white; border: 2px solid rgba(0,0,0,0.2); border-radius: 4px;';
        
        const button = L.DomUtil.create('a', 'leaflet-control-button', container);
        button.href = '#';
        button.title = isFullscreen ? 'Sair de tela cheia' : 'Tela cheia';
        button.innerHTML = isFullscreen
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
             </svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
             </svg>`;
        button.style.cssText = 'width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;';
        
        const handleFullscreen = () => {
          const mapContainer = map.getContainer().closest('.leaflet-container').parentElement;
          
          if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().catch(err => {
              console.error('Erro ao entrar em tela cheia:', err);
            });
          } else {
            document.exitFullscreen().catch(err => {
              console.error('Erro ao sair de tela cheia:', err);
            });
          }
        };
        
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          handleFullscreen();
        });
        
        L.DomEvent.on(button, 'mouseover', () => {
          button.style.backgroundColor = '#f4f4f4';
        });
        
        L.DomEvent.on(button, 'mouseout', () => {
          button.style.backgroundColor = 'transparent';
        });
        
        // Atualizar ícone quando fullscreen mudar
        const updateButton = () => {
          const isFull = !!document.fullscreenElement;
          button.innerHTML = isFull
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
               </svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
               </svg>`;
          button.title = isFull ? 'Sair de tela cheia' : 'Tela cheia';
        };
        
        document.addEventListener('fullscreenchange', updateButton);
        
        return container;
      }
    });

    const control = new fullscreenControl({ position: 'topleft' });
    map.addControl(control);

    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreenState);
      map.removeControl(control);
    };
  }, [map, isFullscreen]);

  return null;
};

export default FullscreenControl;

