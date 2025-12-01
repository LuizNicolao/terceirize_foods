import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import toast from 'react-hot-toast';

// Importar CSS do Leaflet
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Ícone customizado para a escola atual (verde)
const createCustomIcon = (isCurrent) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${isCurrent ? '#10b981' : '#3b82f6'};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 2px;
      "></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Função auxiliar para converter coordenadas com vírgula para ponto
const parseCoordinate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  
  // Converter para string e remover espaços
  let strValue = String(value).trim();
  
  // Se estiver vazio após trim, retornar null
  if (strValue === '' || strValue === 'null' || strValue === 'undefined') return null;
  
  // Converter vírgula para ponto (formato brasileiro)
  const normalized = strValue.replace(',', '.');
  const parsed = parseFloat(normalized);
  
  // Validar se é um número válido e está dentro de limites razoáveis
  if (isNaN(parsed)) {
    return null;
  }
  
  // Validar limites geográficos (latitude: -90 a 90, longitude: -180 a 180)
  if (Math.abs(parsed) > 180) {
    return null;
  }
  
  return parsed;
};

// Componente para ajustar o zoom quando a unidade atual mudar
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const MapaContent = ({ unidadeAtual = null, filialId = null, rotaId = null, searchTerm = '' }) => {
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([-14.235, -51.9253]); // Centro do Brasil
  const [mapZoom, setMapZoom] = useState(5);

  useEffect(() => {
    const carregarUnidadesEscolares = async () => {
      setLoading(true);
      try {
        // Buscar todas as unidades escolares com coordenadas
        // Não filtrar por status para pegar todas, depois filtraremos apenas as que têm coordenadas
        const params = {
          limit: 10000, // Buscar todas
          // Removido status: 1 para buscar todas as unidades e verificar quais têm coordenadas
          ...(filialId && { filial_id: filialId }),
          ...(rotaId && { rota_id: rotaId }),
          ...(searchTerm && { search: searchTerm })
        };

        const response = await UnidadesEscolaresService.listar(params);
        
        if (response.success) {
          // Filtrar apenas unidades com coordenadas válidas e converter coordenadas
          const unidadesComCoordenadas = (response.data || [])
            .map(unidade => {
              const lat = parseCoordinate(unidade.lat);
              const long = parseCoordinate(unidade.long);
              return {
                ...unidade,
                lat,
                long
              };
            })
            .filter(
              unidade => 
                unidade.lat !== null && 
                unidade.long !== null &&
                unidade.lat !== 0 &&
                unidade.long !== 0
            );
          
          setUnidadesEscolares(unidadesComCoordenadas);

          // Se houver unidade atual, centralizar o mapa nela
          if (unidadeAtual?.lat && unidadeAtual?.long) {
            const lat = parseCoordinate(unidadeAtual.lat);
            const long = parseCoordinate(unidadeAtual.long);
            if (lat !== null && long !== null && lat !== 0 && long !== 0) {
              setMapCenter([lat, long]);
              setMapZoom(13);
            } else if (unidadesComCoordenadas.length > 0) {
              // Se não houver unidade atual válida, centralizar na primeira unidade
              const primeira = unidadesComCoordenadas[0];
              setMapCenter([primeira.lat, primeira.long]);
              setMapZoom(10);
            }
          } else if (unidadesComCoordenadas.length > 0) {
            // Calcular centro médio de todas as unidades
            const latMedia = unidadesComCoordenadas.reduce((sum, u) => sum + u.lat, 0) / unidadesComCoordenadas.length;
            const longMedia = unidadesComCoordenadas.reduce((sum, u) => sum + u.long, 0) / unidadesComCoordenadas.length;
            setMapCenter([latMedia, longMedia]);
            setMapZoom(unidadesComCoordenadas.length === 1 ? 13 : 8);
          }
        } else {
          toast.error('Erro ao carregar unidades escolares para o mapa');
        }
      } catch (error) {
        console.error('Erro ao carregar unidades escolares:', error);
        toast.error('Erro ao carregar mapa');
      } finally {
        setLoading(false);
      }
    };

    carregarUnidadesEscolares();
  }, [unidadeAtual?.id, filialId, rotaId, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-400px)] min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (unidadesEscolares.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-400px)] min-h-[600px]">
        <div className="text-center">
          <FaMapMarkerAlt className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-2">Nenhuma unidade escolar com coordenadas encontrada</p>
          <p className="text-gray-500 text-sm">
            {filialId || rotaId || searchTerm
              ? 'Não há unidades escolares com coordenadas cadastradas para os filtros aplicados.'
              : 'Cadastre latitude e longitude nas unidades escolares para visualizá-las no mapa.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-400px)] min-h-[600px] relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />
        
        {unidadesEscolares.map((unidade) => {
          const lat = unidade.lat; // Já convertido no processamento anterior
          const long = unidade.long; // Já convertido no processamento anterior
          const isCurrent = unidadeAtual && unidade.id === unidadeAtual.id;
          
          if (lat === null || long === null || lat === 0 || long === 0) {
            return null;
          }

          return (
            <Marker
              key={unidade.id}
              position={[lat, long]}
              icon={createCustomIcon(isCurrent)}
            >
              <Popup>
                <div className="p-2">
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
                  {unidade.endereco && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Endereço:</span> {unidade.endereco}
                      {unidade.numero && `, ${unidade.numero}`}
                    </p>
                  )}
                  {isCurrent && (
                    <p className="text-xs text-green-600 font-medium mt-2">
                      ✓ Unidade atual
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Legenda</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
            <span className="text-xs text-gray-600">Unidade atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
            <span className="text-xs text-gray-600">Outras unidades</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Total: {unidadesEscolares.length} unidade{unidadesEscolares.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default MapaContent;

