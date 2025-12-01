import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

/**
 * Componente wrapper para agrupar marcadores em clusters
 * Melhora performance quando há muitos marcadores no mapa
 * 
 * Usa uma abordagem que monitora os marcadores adicionados ao mapa
 * e os move para o cluster group
 */
const MarkerClusterGroup = ({ children }) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);
  const interceptingRef = useRef(false);
  const markersRef = useRef(new Set());

  // Opções padrão otimizadas para performance
  const defaultOptions = {
    chunkedLoading: true,
    chunkInterval: 200,
    chunkDelay: 50,
    maxClusterRadius: 80,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    removeOutsideVisibleBounds: true,
    animate: true,
    animateAddingMarkers: false,
    disableClusteringAtZoom: 18,
    // Customização visual dos clusters
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      let className = 'marker-cluster-small';
      let iconSize = 40;
      
      if (count > 100) {
        className = 'marker-cluster-large';
        iconSize = 60;
      } else if (count > 50) {
        className = 'marker-cluster-medium';
        iconSize = 50;
      }
      
      return L.divIcon({
        html: `<div><span>${count}</span></div>`,
        className: `marker-cluster ${className}`,
        iconSize: L.point(iconSize, iconSize)
      });
    }
  };

  useEffect(() => {
    // Criar grupo de cluster
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup(defaultOptions);
      // Adicionar diretamente sem interceptação
      interceptingRef.current = true;
      map.addLayer(clusterGroupRef.current);
      interceptingRef.current = false;
    }

    // Interceptar marcadores adicionados ao mapa e movê-los para o cluster
    const originalAddLayer = map.addLayer.bind(map);
    const originalRemoveLayer = map.removeLayer.bind(map);
    
    map.addLayer = function(layer) {
      // Evitar recursão infinita - se já estamos interceptando, usar método original
      if (interceptingRef.current) {
        return originalAddLayer.call(this, layer);
      }

      // Verificar se é um marcador e não é o cluster group
      if (layer instanceof L.Marker && clusterGroupRef.current && layer !== clusterGroupRef.current) {
        // Verificar se já está no cluster
        if (!markersRef.current.has(layer)) {
          interceptingRef.current = true;
          
          // Remover do mapa se estiver lá (usando método original para evitar loop)
          if (map.hasLayer(layer)) {
            originalRemoveLayer.call(map, layer);
          }
          
          // Adicionar ao cluster diretamente (sem passar pelo map.addLayer)
          try {
            clusterGroupRef.current.addLayer(layer);
            markersRef.current.add(layer);
          } catch (e) {
            console.warn('Erro ao adicionar marcador ao cluster:', e);
          }
          
          interceptingRef.current = false;
          return this;
        }
      }
      
      // Para outras camadas, usar comportamento padrão
      return originalAddLayer.call(this, layer);
    };

    map.removeLayer = function(layer) {
      // Se for um marcador do cluster, remover do cluster também
      if (layer instanceof L.Marker && clusterGroupRef.current && markersRef.current.has(layer)) {
        interceptingRef.current = true;
        try {
          clusterGroupRef.current.removeLayer(layer);
          markersRef.current.delete(layer);
        } catch (e) {
          console.warn('Erro ao remover marcador do cluster:', e);
        }
        interceptingRef.current = false;
      }
      return originalRemoveLayer.call(this, layer);
    };

    return () => {
      // Restaurar métodos originais
      map.addLayer = originalAddLayer;
      map.removeLayer = originalRemoveLayer;
      
      // Limpar referências
      markersRef.current.clear();
      
      // Remover cluster group
      if (clusterGroupRef.current) {
        interceptingRef.current = true;
        originalRemoveLayer.call(map, clusterGroupRef.current);
        interceptingRef.current = false;
        clusterGroupRef.current = null;
      }
    };
  }, [map]);

  // Renderizar children normalmente - os marcadores serão interceptados
  return <>{children}</>;
};

export default MarkerClusterGroup;
