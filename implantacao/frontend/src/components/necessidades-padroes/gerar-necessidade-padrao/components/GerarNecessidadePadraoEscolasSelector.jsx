import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaSchool, FaSearch } from 'react-icons/fa';
import FoodsApiService from '../../../../services/FoodsApiService';

/**
 * Componente de seleção de escolas com checkboxes
 * Similar ao componente usado no modal Adicionar Rota Nutricionista
 */
const GerarNecessidadePadraoEscolasSelector = ({ 
  escolasSelecionadas, 
  onEscolasChange, 
  filialId,
  loading: parentLoading = false
}) => {
  const [searchEscolas, setSearchEscolas] = useState('');
  const [escolasLoading, setEscolasLoading] = useState(false);
  const [todasEscolas, setTodasEscolas] = useState([]);

  // Carregar escolas quando filial mudar
  const carregarEscolas = useCallback(async () => {
    if (!filialId) {
      setTodasEscolas([]);
      return;
    }

    setEscolasLoading(true);
    try {
      const response = await FoodsApiService.getUnidadesEscolares({ 
        filial_id: filialId, 
        limit: 1000 
      });
      
      if (response.success && response.data) {
        const escolasData = Array.isArray(response.data) 
          ? response.data 
          : response.data.data;
        
        if (Array.isArray(escolasData)) {
          setTodasEscolas(escolasData.map(e => ({
            id: e.id,
            nome_escola: e.nome_escola || e.nome || `Escola ${e.id}`,
            codigo: e.codigo_teknisa || e.codigo || '',
            cidade: e.cidade || '',
            estado: e.estado || ''
          })));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      setTodasEscolas([]);
    } finally {
      setEscolasLoading(false);
    }
  }, [filialId]);

  useEffect(() => {
    carregarEscolas();
  }, [carregarEscolas]);

  // Gerenciar seleção de escolas
  const handleEscolaChange = (escolaId, checked) => {
    if (checked) {
      onEscolasChange([...escolasSelecionadas, escolaId]);
    } else {
      onEscolasChange(escolasSelecionadas.filter(id => id !== escolaId));
    }
  };

  // Selecionar todas as escolas
  const handleSelecionarTodas = () => {
    const todasIds = escolasFiltradas.map(e => e.id);
    onEscolasChange([...new Set([...escolasSelecionadas, ...todasIds])]);
  };

  // Desselecionar todas as escolas
  const handleDesselecionarTodas = () => {
    const todasIds = escolasFiltradas.map(e => e.id);
    onEscolasChange(escolasSelecionadas.filter(id => !todasIds.includes(id)));
  };

  // Filtrar escolas baseado na busca
  const escolasFiltradas = useMemo(() => {
    let escolas = todasEscolas;
    
    if (searchEscolas) {
      const searchLower = searchEscolas.toLowerCase();
      escolas = escolas.filter(escola => 
        (escola.nome_escola || '').toLowerCase().includes(searchLower) ||
        (escola.codigo || '').toLowerCase().includes(searchLower) ||
        (escola.cidade || '').toLowerCase().includes(searchLower)
      );
    }
    
    return escolas;
  }, [todasEscolas, searchEscolas]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-green-500">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <FaSchool className="h-4 w-4 text-green-600 mr-2" />
          Selecionar Escolas
        </h3>
        {escolasSelecionadas.length > 0 && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {escolasSelecionadas.length} selecionada{escolasSelecionadas.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Barra de busca */}
        {filialId && (
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar escolas por nome, código ou cidade..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchEscolas}
              onChange={(e) => setSearchEscolas(e.target.value)}
              disabled={escolasLoading || parentLoading}
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        )}

        {/* Contadores e botões de ação */}
        {filialId && (
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {escolasFiltradas.length} escola{escolasFiltradas.length !== 1 ? 's' : ''} disponível{escolasFiltradas.length !== 1 ? 'is' : ''}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelecionarTodas}
                className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={escolasLoading || parentLoading || escolasFiltradas.length === 0}
              >
                Selecionar Todas
              </button>
              <button
                type="button"
                onClick={handleDesselecionarTodas}
                className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={escolasSelecionadas.length === 0}
              >
                Desselecionar Todas
              </button>
            </div>
          </div>
        )}

        {/* Lista de escolas */}
        {!filialId ? (
          <div className="text-sm text-gray-500 text-center py-8 bg-gray-100 rounded border border-gray-300">
            Selecione uma filial para visualizar as escolas disponíveis
          </div>
        ) : escolasLoading || parentLoading ? (
          <div className="text-sm text-gray-500 text-center py-8 bg-gray-100 rounded border border-gray-300">
            Carregando escolas...
          </div>
        ) : escolasFiltradas.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8 bg-gray-100 rounded border border-gray-300">
            {searchEscolas ? 'Nenhuma escola encontrada com o termo buscado' : 'Nenhuma escola disponível para esta filial'}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md bg-white p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
                    onClick={() => handleEscolaChange(escola.id, !isSelected)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleEscolaChange(escola.id, !isSelected)}
                      className="mt-0.5 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-xs truncate" title={escola.nome_escola}>
                        {escola.nome_escola}
                      </div>
                      {escola.codigo && (
                        <div className="text-xs text-gray-500 truncate">
                          Código: {escola.codigo}
                        </div>
                      )}
                      {(escola.cidade || escola.estado) && (
                        <div className="text-xs text-gray-500 truncate">
                          {escola.cidade}{escola.cidade && escola.estado ? ', ' : ''}{escola.estado}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GerarNecessidadePadraoEscolasSelector;

