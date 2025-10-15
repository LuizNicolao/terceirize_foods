import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaSchool, FaSearch, FaCheck } from 'react-icons/fa';
import UnidadesEscolaresService from '../../services/unidadesEscolares';

const RotasNutricionistasEscolasSelector = ({ 
  escolasSelecionadas, 
  onEscolasChange, 
  isViewMode = false,
  unidadesEscolaresFiltradas = [],
  watchedUsuarioId
}) => {
  // Estados para interface de escolas
  const [searchEscolas, setSearchEscolas] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  
  // Estados de paginação para escolas
  const [escolasPage, setEscolasPage] = useState(1);
  const [escolasTotalPages, setEscolasTotalPages] = useState(1);
  const [escolasTotalItems, setEscolasTotalItems] = useState(0);
  const [escolasLoading, setEscolasLoading] = useState(false);
  const [todasEscolas, setTodasEscolas] = useState([]);

  // Carregar escolas específicas por IDs (para modo de visualização)
  const carregarEscolasEspecificas = useCallback(async (escolasIds) => {
    if (!escolasIds || escolasIds.length === 0) {
      console.log('🔍 Nenhuma escola para carregar');
      setTodasEscolas([]);
      return;
    }

    console.log('🔍 Carregando escolas específicas:', escolasIds);

    try {
      setEscolasLoading(true);
      const result = await UnidadesEscolaresService.buscarPorIds(escolasIds);
      
      console.log('📦 Resultado buscarPorIds:', result);
      
      if (result.success) {
        console.log('✅ Escolas carregadas:', result.data?.length || 0);
        setTodasEscolas(result.data || []);
        setEscolasTotalPages(1);
        setEscolasTotalItems(result.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar escolas específicas:', error);
      // Fallback: tentar carregar uma por uma se o método buscarPorIds não existir
      console.log('🔄 Tentando fallback: carregar uma por uma');
      try {
        const escolasPromises = escolasIds.map(id => UnidadesEscolaresService.buscarPorId(id));
        const resultados = await Promise.all(escolasPromises);
        const escolasEncontradas = resultados
          .filter(result => result.success)
          .map(result => result.data);
        console.log('✅ Escolas encontradas no fallback:', escolasEncontradas.length);
        setTodasEscolas(escolasEncontradas);
        setEscolasTotalPages(1);
        setEscolasTotalItems(escolasEncontradas.length);
      } catch (fallbackError) {
        console.error('❌ Erro no fallback ao carregar escolas:', fallbackError);
        setTodasEscolas([]);
      }
    } finally {
      setEscolasLoading(false);
    }
  }, []);

  // Carregar escolas com paginação - APENAS quando nutricionista for selecionada
  const carregarEscolas = useCallback(async (page = 1, search = '') => {
    // Só carregar se tiver nutricionista selecionada
    if (!watchedUsuarioId) {
      setTodasEscolas([]);
      setEscolasTotalPages(1);
      setEscolasTotalItems(0);
      return;
    }

    try {
      setEscolasLoading(true);
      const params = {
        page,
        limit: 20, // Reduzir para melhor performance
        search: search || undefined,
        status: 'ativo' // Apenas escolas ativas
      };
      
      const result = await UnidadesEscolaresService.listar(params);
      
      if (result.success) {
        if (page === 1) {
          setTodasEscolas(result.data || []);
        } else {
          setTodasEscolas(prev => [...prev, ...(result.data || [])]);
        }
        
        if (result.pagination) {
          setEscolasTotalPages(result.pagination.totalPages || 1);
          setEscolasTotalItems(result.pagination.totalItems || 0);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
    } finally {
      setEscolasLoading(false);
    }
  }, [watchedUsuarioId]);

  // Carregar escolas quando nutricionista for selecionada
  useEffect(() => {
    if (watchedUsuarioId && !isViewMode) {
      // Resetar para página 1 quando nutricionista mudar
      setEscolasPage(1);
      setTodasEscolas([]);
      carregarEscolas(1);
    } else if (!watchedUsuarioId) {
      // Limpar escolas quando não há nutricionista
      setTodasEscolas([]);
      setEscolasTotalPages(1);
      setEscolasTotalItems(0);
      setEscolasPage(1);
    }
  }, [watchedUsuarioId, carregarEscolas, isViewMode]);

  // Carregar escolas específicas em modo de visualização
  useEffect(() => {
    if (isViewMode && escolasSelecionadas.length > 0 && watchedUsuarioId) {
      carregarEscolasEspecificas(escolasSelecionadas);
    }
  }, [isViewMode, escolasSelecionadas.length, watchedUsuarioId, carregarEscolasEspecificas]);

  // Busca em tempo real para escolas
  useEffect(() => {
    if (!watchedUsuarioId) return; // Só buscar se tiver nutricionista

    if (searchEscolas) {
      setEscolasPage(1);
      setTodasEscolas([]); // Limpar escolas anteriores para nova busca
      carregarEscolas(1, searchEscolas);
    } else if (searchEscolas === '') {
      setEscolasPage(1);
      setTodasEscolas([]); // Limpar para recarregar todas
      carregarEscolas(1);
    }
  }, [searchEscolas, carregarEscolas, watchedUsuarioId]);

  // Gerenciar seleção de escolas
  const handleEscolaChange = (escolaId, checked) => {
    if (checked) {
      onEscolasChange([...escolasSelecionadas, escolaId]);
    } else {
      onEscolasChange(escolasSelecionadas.filter(id => id !== escolaId));
    }
  };

  // Limpar seleção de escolas
  const limparSelecaoEscolas = () => {
    onEscolasChange([]);
  };

  // Carregar mais escolas (próxima página)
  const carregarMaisEscolas = useCallback(() => {
    if (!watchedUsuarioId) return; // Só carregar se tiver nutricionista
    
    if (escolasPage < escolasTotalPages && !escolasLoading) {
      const nextPage = escolasPage + 1;
      setEscolasPage(nextPage);
      carregarEscolas(nextPage, searchEscolas);
    }
  }, [escolasPage, escolasTotalPages, escolasLoading, carregarEscolas, searchEscolas, watchedUsuarioId]);

  // Filtrar escolas baseado na busca e filtros
  const escolasFiltradas = useMemo(() => {
    let escolas = todasEscolas;
    
    // Em modo de visualização, mostrar apenas as escolas vinculadas à rota
    if (isViewMode) {
      // Se não temos as escolas carregadas mas temos IDs selecionados, precisamos buscar essas escolas específicas
      if (escolasSelecionadas.length > 0 && todasEscolas.length === 0) {
        return []; // Retornar vazio temporariamente até carregar as escolas específicas
      }
      // Filtrar apenas as escolas que estão vinculadas à rota
      escolas = escolas.filter(escola => escolasSelecionadas.includes(escola.id));
    } else {
      // Aplicar filtro de busca (já filtrado pelo backend, mas manter para consistência)
      if (searchEscolas) {
        const searchLower = searchEscolas.toLowerCase();
        escolas = escolas.filter(escola => 
          (escola.nome_escola || escola.nome || '').toLowerCase().includes(searchLower) ||
          (escola.codigo_teknisa || escola.codigo || '').toLowerCase().includes(searchLower) ||
          (escola.cidade || '').toLowerCase().includes(searchLower)
        );
      }
      
      // Aplicar filtro de apenas selecionadas
      if (showSelectedOnly) {
        escolas = escolas.filter(escola => escolasSelecionadas.includes(escola.id));
      }
    }
    
    return escolas;
  }, [todasEscolas, searchEscolas, showSelectedOnly, escolasSelecionadas, isViewMode]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500 flex items-center justify-between">
        <div className="flex items-center">
          <FaSchool className="h-4 w-4 text-green-600 mr-2" />
          Escolas Responsáveis
        </div>
        {escolasSelecionadas.length > 0 && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {escolasSelecionadas.length} selecionada{escolasSelecionadas.length !== 1 ? 's' : ''}
          </span>
        )}
      </h3>
        
      <div className="space-y-3">


        {/* Barra de busca - só mostrar se tiver nutricionista e não estiver em modo de visualização */}
        {watchedUsuarioId && !isViewMode && (
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar escolas por nome, código ou cidade..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchEscolas}
              onChange={(e) => setSearchEscolas(e.target.value)}
              disabled={isViewMode}
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        )}

        {/* Contadores e filtros - só mostrar se tiver nutricionista e não estiver em modo de visualização */}
        {watchedUsuarioId && !isViewMode && (
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {escolasFiltradas.length} escolas carregadas
              {escolasTotalItems > 0 && ` de ${escolasTotalItems} total`}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  showSelectedOnly 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
                disabled={isViewMode}
              >
                {showSelectedOnly ? 'Mostrar todas' : 'Apenas selecionadas'}
              </button>
              {escolasSelecionadas.length > 0 && (
                <button
                  type="button"
                  onClick={limparSelecaoEscolas}
                  className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors"
                  disabled={isViewMode}
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contador simples para modo de visualização */}
        {watchedUsuarioId && isViewMode && (
          <div className="text-xs text-gray-600">
            <span>
              {escolasFiltradas.length} escola{escolasFiltradas.length !== 1 ? 's' : ''} vinculada{escolasFiltradas.length !== 1 ? 's' : ''} à rota
            </span>
          </div>
        )}

        {/* Lista de escolas - só mostrar se tiver nutricionista */}
        {!watchedUsuarioId ? (
          <div className="text-sm text-gray-500 text-center py-8 bg-gray-100 rounded border border-gray-300">
            Selecione uma nutricionista para visualizar as escolas disponíveis
          </div>
        ) : escolasLoading && todasEscolas.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">Carregando escolas...</div>
        ) : (
          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md bg-white">
            {escolasFiltradas.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {escolasFiltradas.map((escola) => {
                  const isChecked = escolasSelecionadas.includes(escola.id);
                  return (
                    <label key={escola.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-3 transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleEscolaChange(escola.id, e.target.checked)}
                        disabled={isViewMode}
                        className="mr-3 text-green-600 focus:ring-green-500 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {escola.nome_escola || escola.nome}
                        </div>
                        <div className="text-xs text-gray-500">
                          Código: {escola.codigo_teknisa || escola.codigo}
                          {escola.cidade && ` • ${escola.cidade}`}
                        </div>
                      </div>
                      {isChecked && (
                        <FaCheck className="h-4 w-4 text-green-600 ml-2 flex-shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-8">
                {isViewMode ? 'Nenhuma escola vinculada a esta rota' :
                 searchEscolas ? 'Nenhuma escola encontrada para a busca' : 
                 'Nenhuma escola disponível para a nutricionista selecionada'}
              </div>
            )}
            
            {/* Botão para carregar mais escolas - só mostrar se não estiver em modo de visualização */}
            {!isViewMode && escolasPage < escolasTotalPages && !escolasLoading && (
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <button
                  type="button"
                  onClick={carregarMaisEscolas}
                  disabled={escolasLoading}
                  className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                >
                  {escolasLoading ? 'Carregando...' : `Carregar mais escolas (${escolasPage + 1} de ${escolasTotalPages})`}
                </button>
              </div>
            )}

            {/* Indicador de carregamento - só mostrar se não estiver em modo de visualização */}
            {!isViewMode && escolasLoading && todasEscolas.length > 0 && (
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <div className="text-center text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto mb-2"></div>
                  Carregando mais escolas...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aviso sobre filiais */}
        {watchedUsuarioId && unidadesEscolaresFiltradas.length === 0 && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            ⚠️ O nutricionista selecionado não tem acesso a nenhuma filial ou não há unidades escolares cadastradas.
          </div>
        )}
      </div>
    </div>
  );
};

export default RotasNutricionistasEscolasSelector;
