import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaSchool, FaSearch } from 'react-icons/fa';
import FoodsApiService from '../../services/FoodsApiService';

const RotasNutricionistasEscolasSelector = ({ 
  escolasSelecionadas, 
  onEscolasChange, 
  isViewMode = false,
  unidadesEscolaresFiltradas = [],
  watchedUsuarioId,
  rotaData = {}
}) => {
  // Estados para interface de escolas
  const [searchEscolas, setSearchEscolas] = useState('');
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [todasEscolas, setTodasEscolas] = useState([]);
  const [nomesEscolas, setNomesEscolas] = useState([]);
  const [loadingNomesEscolas, setLoadingNomesEscolas] = useState(false);

  // Função para buscar nomes das escolas pelos IDs
  const buscarNomesEscolas = useCallback(async (escolasIds) => {
    if (!escolasIds || escolasIds.length === 0) {
      setNomesEscolas([]);
      return;
    }

    setLoadingNomesEscolas(true);
    try {
      const promises = escolasIds.map(id => FoodsApiService.getUnidadeEscolarById(id));
      const resultados = await Promise.all(promises);
      
      const escolasEncontradas = resultados
        .filter(result => result.success && result.data)
        .map(result => ({
          id: result.data.id,
          nome: result.data.nome_escola || result.data.nome || `Escola ${result.data.id}`,
          codigo: result.data.codigo_teknisa || result.data.codigo,
          cidade: result.data.cidade || '',
          estado: result.data.estado || ''
        }));
      
      setNomesEscolas(escolasEncontradas);
    } catch (error) {
      console.error('Erro ao buscar nomes das escolas:', error);
      setNomesEscolas([]);
    } finally {
      setLoadingNomesEscolas(false);
    }
  }, []);

  // Buscar nomes das escolas quando estiver em modo de visualização
  useEffect(() => {
    if (isViewMode && rotaData?.escolas_responsaveis) {
      const escolasIds = rotaData.escolas_responsaveis
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      
      if (escolasIds.length > 0) {
        buscarNomesEscolas(escolasIds);
      }
    }
  }, [isViewMode, rotaData?.escolas_responsaveis, buscarNomesEscolas]);

  // Simular carregamento de escolas disponíveis (para o projeto implantação)
  const carregarEscolasDisponiveis = useCallback(async () => {
    if (!watchedUsuarioId || isViewMode) {
      setTodasEscolas([]);
      return;
    }

    setLoadingEscolas(true);
    try {
      // Para o projeto implantação, simular algumas escolas de exemplo
      // Em um projeto real, aqui seria feita a chamada para a API
      const escolasExemplo = [
        { id: 1, nome_escola: 'Escola Municipal Central', codigo_teknisa: 'EMC001', cidade: 'São Paulo', estado: 'SP' },
        { id: 2, nome_escola: 'Escola Estadual Norte', codigo_teknisa: 'EEN002', cidade: 'São Paulo', estado: 'SP' },
        { id: 3, nome_escola: 'Escola Municipal Sul', codigo_teknisa: 'EMS003', cidade: 'São Paulo', estado: 'SP' },
        { id: 4, nome_escola: 'Escola Estadual Leste', codigo_teknisa: 'EEL004', cidade: 'São Paulo', estado: 'SP' },
        { id: 5, nome_escola: 'Escola Municipal Oeste', codigo_teknisa: 'EMO005', cidade: 'São Paulo', estado: 'SP' },
        { id: 6, nome_escola: 'Escola Estadual Centro', codigo_teknisa: 'EEC006', cidade: 'São Paulo', estado: 'SP' }
      ];

      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTodasEscolas(escolasExemplo);
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      setTodasEscolas([]);
    } finally {
      setLoadingEscolas(false);
    }
  }, [watchedUsuarioId, isViewMode]);

  // Carregar escolas quando nutricionista for selecionada
  useEffect(() => {
    if (watchedUsuarioId && !isViewMode) {
      carregarEscolasDisponiveis();
    } else {
      setTodasEscolas([]);
    }
  }, [watchedUsuarioId, carregarEscolasDisponiveis, isViewMode]);

  // Gerenciar seleção de escolas
  const handleSelecionarEscola = (escola, selecionar) => {
    if (selecionar) {
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
    let escolas = todasEscolas;
    
    if (searchEscolas) {
      const searchLower = searchEscolas.toLowerCase();
      escolas = escolas.filter(escola => 
        (escola.nome_escola || '').toLowerCase().includes(searchLower) ||
        (escola.codigo_teknisa || '').toLowerCase().includes(searchLower) ||
        (escola.cidade || '').toLowerCase().includes(searchLower)
      );
    }
    
    return escolas;
  }, [todasEscolas, searchEscolas]);

  // Obter escolas selecionadas com dados completos
  const escolasSelecionadasComDados = useMemo(() => {
    return escolasSelecionadas.map(id => {
      const escola = todasEscolas.find(e => e.id === id);
      return escola || { id, nome_escola: `Escola ${id}`, codigo_teknisa: '', cidade: '', estado: '' };
    });
  }, [escolasSelecionadas, todasEscolas]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-green-500">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <FaSchool className="h-4 w-4 text-green-600 mr-2" />
          Selecionar Escolas Responsáveis
        </h3>
        <div className="flex gap-2">
          {!isViewMode && watchedUsuarioId && (
            <>
              <button
                type="button"
                onClick={handleSelecionarTodas}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                disabled={loadingEscolas || escolasFiltradas.length === 0}
              >
                Selecionar Todas
              </button>
              <button
                type="button"
                onClick={handleDesselecionarTodas}
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                disabled={escolasSelecionadas.length === 0}
              >
                Desselecionar Todas
              </button>
            </>
          )}
        </div>
      </div>
        
      {/* Campo de busca - só mostrar se tiver nutricionista e não estiver em modo de visualização */}
      {watchedUsuarioId && !isViewMode && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Buscar por nome, código, cidade..."
            value={searchEscolas}
            onChange={(e) => setSearchEscolas(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        </div>
      )}

      {!watchedUsuarioId ? (
        <div className="text-center py-8 text-gray-500 bg-gray-100 rounded border border-gray-300">
          Selecione uma nutricionista para visualizar as escolas disponíveis
        </div>
      ) : loadingEscolas ? (
        <div className="text-center py-8 text-gray-500">
          <div>Carregando escolas disponíveis...</div>
        </div>
      ) : escolasFiltradas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div>
            {searchEscolas.trim() 
              ? `Nenhuma escola encontrada para "${searchEscolas}"`
              : 'Nenhuma escola disponível para esta nutricionista'
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
          {/* Lado Esquerdo: 3 colunas de escolas disponíveis */}
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
                      <div className="font-medium text-gray-900 text-xs truncate" title={escola.nome_escola}>
                        {escola.nome_escola}
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
              Escolas Selecionadas ({escolasSelecionadas.length})
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto p-1 bg-gray-50 rounded-lg border-2 border-green-200">
              {escolasSelecionadas.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Selecione escolas ao lado<br/>para vinculá-las à rota
                </div>
              ) : (
                escolasSelecionadasComDados.map((escola) => (
                  <div
                    key={escola.id}
                    className="flex items-center gap-2 p-2 bg-white rounded border border-green-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-xs truncate" title={escola.nome_escola}>
                        {escola.nome_escola}
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
                        ✕
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