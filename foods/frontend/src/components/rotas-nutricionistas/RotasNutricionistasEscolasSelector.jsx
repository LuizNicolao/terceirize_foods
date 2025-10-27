import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaSchool, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import { Button } from '../ui';
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
  const [escolasLoading, setEscolasLoading] = useState(false);
  const [todasEscolas, setTodasEscolas] = useState([]);

  // Carregar escolas disponíveis - APENAS quando nutricionista for selecionada
  const carregarEscolasDisponiveis = useCallback(async () => {
    if (!watchedUsuarioId) {
      setTodasEscolas([]);
      return;
    }

    try {
      setEscolasLoading(true);
      const params = {
        page: 1,
        limit: 1000, // Carregar muitas escolas de uma vez
        search: searchEscolas || undefined,
        status: 'ativo' // Apenas escolas ativas
      };
      
      const result = await UnidadesEscolaresService.listar(params);
      
      if (result.success) {
        setTodasEscolas(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
    } finally {
      setEscolasLoading(false);
    }
  }, [watchedUsuarioId, searchEscolas]);

  // Carregar escolas quando nutricionista for selecionada
  useEffect(() => {
    if (watchedUsuarioId && !isViewMode) {
      carregarEscolasDisponiveis();
    } else if (!watchedUsuarioId) {
      setTodasEscolas([]);
    }
  }, [watchedUsuarioId, carregarEscolasDisponiveis, isViewMode]);

  // Gerenciar seleção de escolas
  const handleSelecionarEscola = (escola, checked) => {
    if (checked) {
      onEscolasChange([...escolasSelecionadas, escola.id]);
    } else {
      onEscolasChange(escolasSelecionadas.filter(id => id !== escola.id));
    }
  };

  // Selecionar todas as escolas
  const handleSelecionarTodas = () => {
    const todasIds = escolasFiltradas.map(escola => escola.id);
    onEscolasChange([...new Set([...escolasSelecionadas, ...todasIds])]);
  };

  // Desselecionar todas as escolas
  const handleDesselecionarTodas = () => {
    onEscolasChange([]);
  };

  // Filtrar escolas baseado na busca
  const escolasFiltradas = useMemo(() => {
    if (!watchedUsuarioId) return [];
    
    let escolas = todasEscolas;
    
    // Em modo de visualização, mostrar apenas as escolas vinculadas à rota
    if (isViewMode) {
      escolas = escolas.filter(escola => escolasSelecionadas.includes(escola.id));
    }
    
    return escolas;
  }, [todasEscolas, escolasSelecionadas, isViewMode, watchedUsuarioId]);

  // Obter dados das escolas selecionadas
  const escolasSelecionadasData = useMemo(() => {
    return escolasFiltradas.filter(escola => escolasSelecionadas.includes(escola.id));
  }, [escolasFiltradas, escolasSelecionadas]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-green-500">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <FaSchool className="h-4 w-4 text-green-600 mr-2" />
          {isViewMode ? 'Escolas da Rota Nutricionista' : 'Selecionar Escolas'}
        </h3>
        {!isViewMode && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelecionarTodas}
              className="text-xs"
              disabled={escolasLoading || escolasFiltradas.length === 0}
            >
              Selecionar Todas
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDesselecionarTodas}
              className="text-xs"
              disabled={escolasSelecionadas.length === 0}
            >
              Desselecionar Todas
            </Button>
          </div>
        )}
      </div>
      
      {/* Campo de busca */}
      {watchedUsuarioId && !isViewMode && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Buscar por nome, código, cidade ou endereço..."
            value={searchEscolas}
            onChange={(e) => setSearchEscolas(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        </div>
      )}
      
      {!watchedUsuarioId ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Selecione uma nutricionista para visualizar as escolas disponíveis</div>
        </div>
      ) : escolasLoading ? (
        <div className="text-center py-4">
          <div className="text-gray-500">Carregando escolas disponíveis...</div>
        </div>
      ) : escolasFiltradas.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-500">
            {searchEscolas.trim() 
              ? `Nenhuma escola encontrada para "${searchEscolas}"`
              : 'Nenhuma escola escolar disponível'
            }
          </div>
          {searchEscolas.trim() && (
            <button
              type="button"
              onClick={() => setSearchEscolas('')}
              className="text-green-600 hover:text-green-700 text-sm mt-2"
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Lado Esquerdo: Escolas disponíveis */}
          <div className="flex-1">
            <div className="text-xs font-medium text-gray-600 mb-2">
              Escolas Disponíveis ({escolasFiltradas.length})
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-1">
              {escolasFiltradas.map((escola) => {
                const isSelected = escolasSelecionadas.includes(escola.id);
                return (
                  <div
                    key={escola.id}
                    className={`flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelecionarEscola(escola, !isSelected)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelecionarEscola(escola, !isSelected)}
                      className="mt-0.5 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-xs truncate" title={escola.nome_escola || escola.nome}>
                        {escola.nome_escola || escola.nome}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {escola.codigo_teknisa || escola.codigo}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {escola.cidade}, {escola.estado}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lado Direito: Escolas selecionadas */}
          <div className="w-80 flex-shrink-0">
            <div className="text-xs font-medium text-gray-600 mb-2">
              Escolas Selecionadas ({escolasSelecionadasData.length})
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto p-1 bg-gray-50 rounded-lg border-2 border-green-200">
              {escolasSelecionadasData.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Selecione escolas ao lado<br/>para vincular à rota
                </div>
              ) : (
                escolasSelecionadasData.map((escola) => (
                  <div
                    key={escola.id}
                    className="flex items-center gap-2 p-2 bg-white rounded border border-green-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-xs truncate" title={escola.nome_escola || escola.nome}>
                        {escola.nome_escola || escola.nome}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {escola.codigo_teknisa || escola.codigo}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {escola.cidade}, {escola.estado}
                      </div>
                    </div>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleSelecionarEscola(escola, false)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 p-1"
                        title="Remover"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RotasNutricionistasEscolasSelector;
