import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import RotasService from '../../services/rotas';
import { MapControls, RoutePolyline, RouteMarkers, RouteInfo, MarkerClusterGroup, calculateRouteDistance } from './mapa';
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

// Cores para diferentes filiais (paleta de cores)
const filialColors = [
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Laranja
  '#ef4444', // Vermelho
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#06b6d4', // Ciano
  '#84cc16', // Lima
  '#f97316', // Laranja escuro
  '#6366f1', // Índigo
];

// Função para obter cor da filial baseada no ID
const getFilialColor = (filialId, filiaisMap) => {
  if (!filialId || !filiaisMap) return '#3b82f6'; // Cor padrão azul
  
  const filialIndex = filiaisMap.get(filialId) || 0;
  return filialColors[filialIndex % filialColors.length];
};

// Ícone customizado com cores por status e filial
const createCustomIcon = (isCurrent, status, filialColor, ordemEntrega) => {
  // Determinar cor base
  let backgroundColor;
  let borderColor = '#ffffff';
  let borderWidth = '3px';
  
  if (isCurrent) {
    // Unidade atual sempre em verde com destaque
    backgroundColor = '#10b981';
    borderColor = '#059669';
    borderWidth = '4px';
  } else if (status === 'ativo' || status === 1) {
    // Unidade ativa usa cor da filial
    backgroundColor = filialColor;
  } else {
    // Unidade inativa em cinza
    backgroundColor = '#9ca3af';
  }
  
  // Tamanho do marcador (maior se for unidade atual)
  const markerSize = isCurrent ? 36 : 32;
  const iconSize = isCurrent ? 36 : 32;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${backgroundColor};
      width: ${markerSize}px;
      height: ${markerSize}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: ${borderWidth} solid ${borderColor};
      box-shadow: 0 3px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        transform: rotate(45deg);
        width: ${isCurrent ? '14px' : '12px'};
        height: ${isCurrent ? '14px' : '12px'};
        background-color: white;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${isCurrent ? '10px' : '9px'};
        color: ${backgroundColor};
      ">${ordemEntrega > 0 ? ordemEntrega : ''}</div>
      ${isCurrent ? `
      <div style="
        position: absolute;
        top: -2px;
        right: -2px;
        width: 12px;
        height: 12px;
        background-color: #fbbf24;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
      ` : ''}
    </div>`,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize],
    popupAnchor: [0, -iconSize],
  });
};

/**
 * Função auxiliar para converter e validar coordenadas
 * Suporta formato brasileiro (vírgula) e internacional (ponto)
 * 
 * @param {any} value - Valor da coordenada (string, number, null)
 * @param {string} type - Tipo: 'lat' (latitude) ou 'lon' (longitude)
 * @returns {number|null} - Coordenada validada ou null se inválida
 */
const parseCoordinate = (value, type = 'lat') => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // Se já for um número, validar diretamente
  if (typeof value === 'number') {
    if (isNaN(value)) {
      return null;
    }
    
    // Validar limites
    if (type === 'lat' && (value < -90 || value > 90)) {
      return null;
    }
    if (type === 'lon' && (value < -180 || value > 180)) {
      return null;
    }
    
    return value;
  }
  
  // Converter para string e remover espaços
  let strValue = String(value).trim();
  
  // Se estiver vazio após trim, retornar null
  if (strValue === '' || strValue === 'null' || strValue === 'undefined') {
    return null;
  }
  
  // Converter vírgula para ponto (formato brasileiro)
  const normalized = strValue.replace(',', '.');
  const parsed = parseFloat(normalized);
  
  // Validar se é um número válido
  if (isNaN(parsed)) {
    return null;
  }
  
  // Validar limites específicos por tipo
  if (type === 'lat') {
    // Latitude: -90 a 90 graus
    if (parsed < -90 || parsed > 90) {
      return null;
    }
  } else if (type === 'lon') {
    // Longitude: -180 a 180 graus
    if (parsed < -180 || parsed > 180) {
    return null;
  }
  }
  
  // Retornar o valor parseado diretamente (sem arredondar)
  // O JavaScript já mantém a precisão suficiente para 10 casas decimais
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
  const [loadingRota, setLoadingRota] = useState(false);
  const [rotaCoordenadasSalvas, setRotaCoordenadasSalvas] = useState(null);
  const [mapCenter, setMapCenter] = useState([-14.235, -51.9253]); // Centro do Brasil
  const [mapZoom, setMapZoom] = useState(5);
  const [filiaisMap, setFiliaisMap] = useState(new Map()); // Mapa de filiais para cores
  const initialCenterRef = useRef([-14.235, -51.9253]);
  const initialZoomRef = useRef(5);

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
        
        if (response.success && response.data && Array.isArray(response.data)) {
          // Filtrar apenas unidades com coordenadas válidas e converter coordenadas
          const unidadesComCoordenadas = (response.data || [])
            .map(unidade => {
              const lat = parseCoordinate(unidade.lat, 'lat');
              const long = parseCoordinate(unidade.long, 'lon');
              
              // Log apenas se houver rota selecionada para verificar vínculo e coordenadas
              if (rotaId) {
                // Verificar se a unidade tem vínculo com a rota
                // rota_id pode vir como string separada por vírgulas (GROUP_CONCAT) ou como número
                let temRota = false;
                if (unidade.rota_id) {
                  const rotasArray = unidade.rota_id.toString().split(',').map(r => r.trim());
                  temRota = rotasArray.includes(rotaId.toString()) || 
                           rotasArray.includes(parseInt(rotaId).toString()) ||
                           unidade.rota_id === parseInt(rotaId);
                }
                
                const temCoordenadas = lat !== null && long !== null;
                
                console.log(`[MapaContent] Escola: ${unidade.nome_escola}`, {
                  id: unidade.id,
                  tem_vinculo_rota: temRota,
                  rota_id_escola: unidade.rota_id,
                  rota_id_filtro: rotaId,
                  tem_lat_long: temCoordenadas,
                  lat: lat,
                  long: long
                });
              }
              
              return {
                ...unidade,
                lat,
                long
              };
            })
            .filter(
              unidade => {
                const isValid = unidade.lat !== null && 
                unidade.long !== null &&
                  !isNaN(unidade.lat) &&
                  !isNaN(unidade.long) &&
                // Rejeitar coordenadas exatamente em 0,0 (Golfo da Guiné - provavelmente erro de cadastro)
                  !(unidade.lat === 0 && unidade.long === 0);
                
                return isValid;
              }
            );
          
          // Log resumo apenas se houver rota selecionada
          if (rotaId) {
            const unidadesNaRotaComCoordenadas = unidadesComCoordenadas.filter(u => {
              if (!u.rota_id) return false;
              const rotasArray = u.rota_id.toString().split(',').map(r => r.trim());
              return rotasArray.includes(rotaId.toString()) || 
                     rotasArray.includes(parseInt(rotaId).toString()) ||
                     u.rota_id === parseInt(rotaId);
            });
            
            console.log('[MapaContent] Resumo da rota:', {
              rota_id: rotaId,
              total_recebidas: response.data?.length || 0,
              total_com_coordenadas: unidadesComCoordenadas.length,
              unidades_na_rota_com_coordenadas: unidadesNaRotaComCoordenadas.length,
              unidades_na_rota_sem_coordenadas: response.data?.filter(u => {
                if (!u.rota_id) return false;
                const rotasArray = u.rota_id.toString().split(',').map(r => r.trim());
                const temRota = rotasArray.includes(rotaId.toString()) || 
                               rotasArray.includes(parseInt(rotaId).toString()) ||
                               u.rota_id === parseInt(rotaId);
                return temRota && (!u.lat || !u.long);
              }).length || 0
            });
          }
          
          // Se houver rota selecionada, ordenar por ordem_entrega
          let unidadesOrdenadas = unidadesComCoordenadas;
          if (rotaId && unidadesComCoordenadas.length > 0) {
            unidadesOrdenadas = [...unidadesComCoordenadas].sort((a, b) => {
              const ordemA = a.ordem_entrega || 0;
              const ordemB = b.ordem_entrega || 0;
              // Ordenar por ordem_entrega, e se for igual, por nome
              if (ordemA !== ordemB) {
                return ordemA - ordemB;
              }
              return (a.nome_escola || '').localeCompare(b.nome_escola || '');
            });
          }
          
          // Criar mapa de filiais para cores
          const filiaisSet = new Set();
          unidadesOrdenadas.forEach(unidade => {
            if (unidade.filial_id) {
              filiaisSet.add(unidade.filial_id);
            }
          });
          
          const filiaisArray = Array.from(filiaisSet);
          const newFiliaisMap = new Map();
          filiaisArray.forEach((filialId, index) => {
            newFiliaisMap.set(filialId, index);
          });
          setFiliaisMap(newFiliaisMap);
          
          setUnidadesEscolares(unidadesOrdenadas);

          // Se houver unidade atual, centralizar o mapa nela
          if (unidadeAtual?.lat && unidadeAtual?.long) {
            const lat = parseCoordinate(unidadeAtual.lat, 'lat');
            const long = parseCoordinate(unidadeAtual.long, 'lon');
            if (lat !== null && long !== null && !(lat === 0 && long === 0)) {
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
            const newCenter = [latMedia, longMedia];
            const newZoom = unidadesComCoordenadas.length === 1 ? 13 : 8;
            setMapCenter(newCenter);
            setMapZoom(newZoom);
            // Salvar como centro inicial
            initialCenterRef.current = newCenter;
            initialZoomRef.current = newZoom;
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

  // Buscar coordenadas salvas da rota quando houver rotaId
  useEffect(() => {
    if (!rotaId) {
      setRotaCoordenadasSalvas(null);
      return;
    }

    const buscarCoordenadasRota = async () => {
      try {
        const response = await RotasService.buscarPorId(rotaId);
        if (response.success && response.data) {
          const rota = response.data;
          // Verificar se há coordenadas salvas e se são válidas
          if (rota.rota_coordenadas) {
            try {
              const coordenadas = typeof rota.rota_coordenadas === 'string' 
                ? JSON.parse(rota.rota_coordenadas) 
                : rota.rota_coordenadas;
              
              if (Array.isArray(coordenadas) && coordenadas.length >= 2) {
                setRotaCoordenadasSalvas(coordenadas);
                return;
              }
            } catch (e) {
              // Erro ao parsear coordenadas salvas - ignorar e continuar
            }
          }
        }
        setRotaCoordenadasSalvas(null);
      } catch (error) {
        setRotaCoordenadasSalvas(null);
      }
    };

    buscarCoordenadasRota();
  }, [rotaId]);

  // Calcular coordenadas da rota quando houver rotaId e unidades ordenadas
  // IMPORTANTE: Este hook deve estar ANTES de qualquer retorno condicional
  const { rotaCoordenadas, unidadesComOrdem, distanciaTotal } = useMemo(() => {
    if (!rotaId || unidadesEscolares.length < 2) {
      return { rotaCoordenadas: [], unidadesComOrdem: [], distanciaTotal: 0 };
    }
    
    // Filtrar apenas unidades com ordem_entrega válida e ordenar
    const unidadesComOrdem = unidadesEscolares
      .filter(u => u.ordem_entrega && u.ordem_entrega > 0)
      .sort((a, b) => a.ordem_entrega - b.ordem_entrega);
    
    if (unidadesComOrdem.length < 2) {
      return { rotaCoordenadas: [], unidadesComOrdem: [], distanciaTotal: 0 };
    }
    
    // Se houver coordenadas salvas, usar elas (prioridade)
    if (rotaCoordenadasSalvas && rotaCoordenadasSalvas.length >= 2) {
      const distancia = calculateRouteDistance(rotaCoordenadasSalvas);
      return {
        rotaCoordenadas: rotaCoordenadasSalvas,
        unidadesComOrdem,
        distanciaTotal: distancia
      };
    }
    
    // Caso contrário, criar array de coordenadas [lat, long] na ordem de entrega
    const coordenadas = unidadesComOrdem.map(u => [u.lat, u.long]);
    
    // Calcular distância total
    const distancia = calculateRouteDistance(coordenadas);
    
    return {
      rotaCoordenadas: coordenadas,
      unidadesComOrdem,
      distanciaTotal: distancia
    };
  }, [rotaId, unidadesEscolares, rotaCoordenadasSalvas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-250px)] min-h-[700px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (unidadesEscolares.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-250px)] min-h-[700px]">
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
    <div className="w-full h-[calc(100vh-250px)] min-h-[700px] relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        {/* TileLayer padrão - será substituído pelo LayersControl se ativo */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />
        
        {/* Controles do mapa */}
        <MapControls
          initialCenter={initialCenterRef.current}
          initialZoom={initialZoomRef.current}
          unidadesEscolares={unidadesEscolares}
          onReset={() => {
            if (unidadesEscolares.length > 0) {
              const latMedia = unidadesEscolares.reduce((sum, u) => sum + u.lat, 0) / unidadesEscolares.length;
              const longMedia = unidadesEscolares.reduce((sum, u) => sum + u.long, 0) / unidadesEscolares.length;
              setMapCenter([latMedia, longMedia]);
              setMapZoom(unidadesEscolares.length === 1 ? 13 : 8);
            } else {
              setMapCenter(initialCenterRef.current);
              setMapZoom(initialZoomRef.current);
            }
          }}
          onLayerChange={(layerName) => {
            console.log('Camada alterada para:', layerName);
          }}
        />
        
        {/* Linha da rota melhorada - apenas quando houver rotaId e coordenadas válidas */}
        {rotaId && rotaCoordenadas.length >= 2 && (
          <>
            <RoutePolyline 
              positions={rotaCoordenadas}
              color="#ef4444"
              weight={5}
              opacity={0.8}
              useRealRoute={!rotaCoordenadasSalvas}
              onLoadingChange={setLoadingRota}
            />
            <RouteMarkers 
              unidadesComOrdem={unidadesComOrdem}
              isCurrent={unidadeAtual}
            />
          </>
        )}
        
        {/* Marcadores normais com clustering - apenas se não for rota ou para unidades sem ordem */}
        <MarkerClusterGroup>
        {unidadesEscolares.map((unidade) => {
            // Se for rota e a unidade estiver na rota, não renderizar aqui (já renderizado em RouteMarkers)
            if (rotaId && unidadesComOrdem.some(u => u.id === unidade.id)) {
              // Verificar se é a unidade atual (deve ser renderizada mesmo na rota)
              const isCurrentUnit = unidadeAtual && unidade.id === unidadeAtual.id;
              if (!isCurrentUnit) {
                return null;
              }
            }
          const lat = unidade.lat; // Já convertido no processamento anterior
          const long = unidade.long; // Já convertido no processamento anterior
          const isCurrent = unidadeAtual && unidade.id === unidadeAtual.id;
            const filialColor = getFilialColor(unidade.filial_id, filiaisMap);
            const status = unidade.status || 'ativo';
            const ordemEntrega = unidade.ordem_entrega || 0;
          
          if (lat === null || long === null || lat === 0 || long === 0) {
            return null;
          }

          return (
            <Marker
              key={unidade.id}
              position={[lat, long]}
                icon={createCustomIcon(isCurrent, status, filialColor, ordemEntrega)}
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
                    {unidade.filial_nome && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Filial:</span> {unidade.filial_nome}
                      </p>
                    )}
                    {unidade.status && (
                      <p className="text-sm mb-1">
                        <span className="font-medium">Status:</span>{' '}
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          unidade.status === 'ativo' || unidade.status === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {unidade.status === 'ativo' || unidade.status === 1 ? 'Ativo' : 'Inativo'}
                        </span>
                      </p>
                    )}
                    {ordemEntrega > 0 && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Ordem de Entrega:</span>{' '}
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                          {ordemEntrega}
                        </span>
                    </p>
                  )}
                  {isCurrent && (
                      <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        Unidade atual
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        </MarkerClusterGroup>
      </MapContainer>
      
      {/* Loading da rota */}
      {loadingRota && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-[1000] border border-gray-200 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
          <span className="text-sm text-gray-700 font-medium">Calculando rota...</span>
        </div>
      )}
      
      {/* Informações da Rota */}
      {rotaId && unidadesComOrdem.length >= 2 && (
        <RouteInfo 
          unidadesComOrdem={unidadesComOrdem}
          distanciaTotal={distanciaTotal}
        />
      )}
      
      {/* Legenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] border border-gray-200 max-w-xs">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Legenda</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600"></div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
            </div>
            <span className="text-xs text-gray-600">Unidade atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
            <span className="text-xs text-gray-600">Unidade ativa (por filial)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white"></div>
            <span className="text-xs text-gray-600">Unidade inativa</span>
          </div>
          {rotaId && rotaCoordenadas.length >= 2 && (
            <>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-200 mt-1">
                <div className="w-4 h-0.5 bg-red-500"></div>
                <span className="text-xs text-gray-600">Rota de entrega</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600 relative">
                  <div className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-green-500 rounded-full border border-white text-[6px] text-white flex items-center justify-center font-bold">S</div>
                </div>
                <span className="text-xs text-gray-600">Início</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-600 relative">
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border border-white text-[6px] text-white flex items-center justify-center font-bold">F</div>
                </div>
                <span className="text-xs text-gray-600">Fim</span>
              </div>
            </>
          )}
          <div className="pt-1 border-t border-gray-200 mt-1">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Total:</span> {unidadesEscolares.length} unidade{unidadesEscolares.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="font-medium">Ativas:</span> {unidadesEscolares.filter(u => u.status === 'ativo' || u.status === 1).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="font-medium">Inativas:</span> {unidadesEscolares.filter(u => u.status !== 'ativo' && u.status !== 1).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaContent;

