import React, { useState, useEffect, useCallback } from 'react';
import { FaSchool, FaChartLine, FaSearch, FaTimes } from 'react-icons/fa';
import { EmptyState, SearchableSelect, Button, Input, Pagination } from '../ui';
import FoodsApiService from '../../services/FoodsApiService';
import RegistrosDiariosService from '../../services/registrosDiarios';

const MediasCalculadasTab = () => {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [escolaFilter, setEscolaFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [escolas, setEscolas] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Carregar escolas para o filtro
  useEffect(() => {
    const carregarEscolas = async () => {
      setLoadingEscolas(true);
      try {
        let todasEscolas = [];
        let page = 1;
        let hasMore = true;
        const limit = 100;
        
        while (hasMore) {
          const result = await FoodsApiService.getUnidadesEscolares({
            page,
            limit,
            status: 'ativo'
          });
          
          if (result.success && result.data && result.data.length > 0) {
            todasEscolas = [...todasEscolas, ...result.data];
            
            if (result.data.length < limit) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
          
          if (page > 50) {
            hasMore = false;
          }
        }
        
        setEscolas(todasEscolas);
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
      } finally {
        setLoadingEscolas(false);
      }
    };
    
    carregarEscolas();
  }, []);

  // Carregar médias
  const carregarMedias = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await RegistrosDiariosService.listarMedias({
        escola_id: escolaFilter || null,
        page,
        limit: itemsPerPage,
        search: search.trim() || ''
      });

      if (response.success) {
        setMedias(response.data || []);
        if (response.pagination) {
          setCurrentPage(response.pagination.page);
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar médias:', error);
    } finally {
      setLoading(false);
    }
  }, [escolaFilter, itemsPerPage, search]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Carregar médias quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
    carregarMedias(1);
  }, [carregarMedias]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    carregarMedias(page);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };  

  const handleClearFilters = () => {
    setEscolaFilter('');
    setSearch('');
    setSearchInput('');
    setCurrentPage(1);
  };
  return (
    <>
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Escola */}
          <div>
            <SearchableSelect
              label="Escola"
              value={escolaFilter}
              onChange={(value) => {
                setEscolaFilter(value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: 'Todas as escolas' },
                ...escolas.map(escola => ({
                  value: escola.id,
                  label: escola.nome_escola,
                  description: `${escola.cidade} - ${escola.rota_nome || 'Sem rota'}`
                }))
              ]}
              placeholder="Selecione uma escola..."
              disabled={loadingEscolas}
              usePortal={false}
              renderOption={(option) => (
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                  )}
                </div>
              )}
            />
          </div>
          
          {/* Busca por nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por nome
            </label>
            <div className="relative">
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                placeholder="Digite o nome da escola..."
                className="pl-10"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          {/* Botões */}
          <div className="flex items-end gap-2">
            <Button
              onClick={handleClearFilters}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              <FaTimes className="mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando médias...</span>
        </div>
      ) : !medias || medias.length === 0 ? (
        <EmptyState
          title="Nenhuma média calculada"
          description="As médias são calculadas automaticamente quando você registra quantidades servidas"
          icon="chart"
        />
      ) : (
        <>
      {/* Desktop */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Escola</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lanche Manhã</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Parcial Manhã</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Almoço</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lanche Tarde</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Parcial Tarde</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">EJA</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Dias</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Última Atualização</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medias.map((media) => (
                <tr key={media.escola_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FaSchool className="text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {media.escola_nome || `Escola ID ${media.escola_id}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {parseFloat(media.media_lanche_manha ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {parseFloat(media.media_parcial_manha ?? media.media_parcial ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {parseFloat(media.media_almoco ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {parseFloat(media.media_lanche_tarde ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {parseFloat(media.media_parcial_tarde ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {parseFloat(media.media_eja ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      <FaChartLine className="mr-1" />
                      {media.quantidade_lancamentos} dias
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center">
                    {media.data_calculo ? new Date(media.data_calculo).toLocaleDateString('pt-BR') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile */}
      <div className="xl:hidden space-y-3">
        {medias.map((media) => (
          <div key={media.escola_id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center mb-3">
              <FaSchool className="text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-900 text-sm">{media.escola_nome || `Escola ID ${media.escola_id}`}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Lanche Manhã:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {parseFloat(media.media_lanche_manha ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Parcial Manhã:</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                  {parseFloat(media.media_parcial_manha ?? media.media_parcial ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Almoço:</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                  {parseFloat(media.media_almoco ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Lanche Tarde:</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                  {parseFloat(media.media_lanche_tarde ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Parcial Tarde:</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                  {parseFloat(media.media_parcial_tarde ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center col-span-2">
                <span className="text-gray-500">EJA:</span>
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                  {parseFloat(media.media_eja ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
              <span>
                <FaChartLine className="inline mr-1" />
                {media.quantidade_lancamentos} dias registrados
              </span>
              <span>
                {media.data_calculo ? new Date(media.data_calculo).toLocaleDateString('pt-BR') : '-'}
              </span>
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      {/* Paginação */}
      {!loading && medias.length > 0 && totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </>
  );
};

export default MediasCalculadasTab;

