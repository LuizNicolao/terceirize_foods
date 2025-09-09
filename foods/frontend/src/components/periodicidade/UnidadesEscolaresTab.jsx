import React, { useEffect, useState } from 'react';
import { FaBuilding, FaSearch, FaCheckSquare, FaSquare } from 'react-icons/fa';
import { Button } from '../ui';
import UsuariosService from '../../services/usuarios';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import { useAuth } from '../../contexts/AuthContext';

const UnidadesEscolaresTab = ({
  unidadesSelecionadas,
  onUnidadesChange,
  isViewMode = false
}) => {
  const { user } = useAuth();
  
  // Estados para Filiais
  const [filiais, setFiliais] = useState([]);
  const [filiaisSelecionadas, setFiliaisSelecionadas] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  
  // Estados para Unidades Escolares
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [buscaUnidades, setBuscaUnidades] = useState('');
  const [unidadesFiltradas, setUnidadesFiltradas] = useState([]);

  // Carregar filiais do usuário
  const carregarFiliais = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingFiliais(true);
      
      // Buscar filiais do usuário
      const userResult = await UsuariosService.buscarPorId(user.id);
      if (userResult.success && userResult.data?.filiais) {
        setFiliais(userResult.data.filiais);
      } else {
        setFiliais([]);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      setFiliais([]);
    } finally {
      setLoadingFiliais(false);
    }
  };

  // Carregar unidades escolares baseado nas filiais selecionadas
  const carregarUnidadesEscolares = async (filiaisIds = filiaisSelecionadas) => {
    if (filiaisIds.length === 0) {
      setUnidadesEscolares([]);
      return;
    }

    try {
      setLoadingUnidades(true);
      
      // Buscar unidades escolares das filiais selecionadas
      const unidadesResult = await UnidadesEscolaresService.buscarAtivas();
      if (unidadesResult.success) {
        const unidadesFiltradas = unidadesResult.data.filter(ue => 
          filiaisIds.includes(parseInt(ue.filial_id))
        );
        setUnidadesEscolares(unidadesFiltradas);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      setUnidadesEscolares([]);
    } finally {
      setLoadingUnidades(false);
    }
  };

  // Filtrar unidades escolares baseado na busca
  useEffect(() => {
    if (!buscaUnidades.trim()) {
      setUnidadesFiltradas(unidadesEscolares);
      return;
    }

    const filtradas = unidadesEscolares.filter(unidade => {
      const termoBusca = buscaUnidades.toLowerCase();
      return (
        (unidade.nome_escola && unidade.nome_escola.toLowerCase().includes(termoBusca)) ||
        (unidade.cidade && unidade.cidade.toLowerCase().includes(termoBusca)) ||
        (unidade.estado && unidade.estado.toLowerCase().includes(termoBusca)) ||
        (unidade.endereco && unidade.endereco.toLowerCase().includes(termoBusca))
      );
    });
    setUnidadesFiltradas(filtradas);
  }, [buscaUnidades, unidadesEscolares]);

  // Carregar dados quando o componente montar
  useEffect(() => {
    carregarFiliais();
  }, []);

  // Efeito para marcar filiais automaticamente quando unidades são carregadas
  useEffect(() => {
    if (unidadesSelecionadas.length > 0 && filiais.length > 0) {
      // Buscar filiais das unidades selecionadas
      const filiaisDasUnidades = unidadesSelecionadas.map(unidadeId => {
        // Como não temos as unidades carregadas ainda, vamos buscar via API
        // ou usar os dados que já temos
        return null; // Será preenchido quando carregarmos as unidades
      }).filter(Boolean);
      
      // Se ainda não temos as unidades carregadas, vamos carregar todas as unidades
      // para identificar as filiais das unidades selecionadas
      if (unidadesSelecionadas.length > 0 && unidadesEscolares.length === 0) {
        carregarUnidadesEscolares(filiais.map(f => f.id));
      }
    }
  }, [unidadesSelecionadas, filiais]);

  // Efeito para marcar filiais quando unidades escolares são carregadas
  useEffect(() => {
    if (unidadesSelecionadas.length > 0 && unidadesEscolares.length > 0) {
      // Encontrar filiais das unidades selecionadas
      const filiaisDasUnidades = unidadesSelecionadas.map(unidadeId => {
        const unidade = unidadesEscolares.find(u => u.id === unidadeId);
        return unidade ? unidade.filial_id : null;
      }).filter(Boolean);
      
      // Remover duplicatas
      const filiaisUnicas = [...new Set(filiaisDasUnidades)];
      
      // Marcar as filiais se ainda não estiverem marcadas
      if (filiaisUnicas.length > 0 && filiaisSelecionadas.length === 0) {
        setFiliaisSelecionadas(filiaisUnicas);
      }
    }
  }, [unidadesEscolares, unidadesSelecionadas, filiaisSelecionadas]);

  // Funções para manipular seleções de filiais
  const handleFilialChange = async (filialId, checked) => {
    if (checked) {
      const novasFiliais = [...filiaisSelecionadas, filialId];
      setFiliaisSelecionadas(novasFiliais);
      // Recarregar unidades escolares com as novas filiais
      await carregarUnidadesEscolares(novasFiliais);
    } else {
      const novasFiliais = filiaisSelecionadas.filter(id => id !== filialId);
      setFiliaisSelecionadas(novasFiliais);
      // Remover unidades escolares da filial desmarcada
      onUnidadesChange(prev => {
        const filial = filiais.find(f => f.id === filialId);
        if (filial) {
          return prev.filter(unidadeId => {
            const unidade = unidadesEscolares.find(u => u.id === unidadeId);
            return unidade && unidade.filial_id !== filialId;
          });
        }
        return prev;
      });
      // Recarregar unidades escolares com as filiais restantes
      await carregarUnidadesEscolares(novasFiliais);
    }
  };

  // Funções para manipular seleções de unidades escolares
  const handleUnidadeChange = (unidadeId, checked) => {
    if (checked) {
      onUnidadesChange(prev => [...prev, unidadeId]);
    } else {
      onUnidadesChange(prev => prev.filter(id => id !== unidadeId));
    }
  };

  // Funções para seleção em lote
  const handleSelecionarTodasUnidades = () => {
    const todasUnidades = unidadesFiltradas.map(u => u.id);
    onUnidadesChange(prev => {
      const novas = [...prev];
      todasUnidades.forEach(id => {
        if (!novas.includes(id)) {
          novas.push(id);
        }
      });
      return novas;
    });
  };

  const handleDesselecionarTodasUnidades = () => {
    const unidadesFiltradasIds = unidadesFiltradas.map(u => u.id);
    onUnidadesChange(prev => 
      prev.filter(id => !unidadesFiltradasIds.includes(id))
    );
  };

  const handleSelecionarTodasFiliais = () => {
    setFiliaisSelecionadas(filiais.map(f => f.id));
    carregarUnidadesEscolares(filiais.map(f => f.id));
  };

  const handleDesselecionarTodasFiliais = () => {
    setFiliaisSelecionadas([]);
    setUnidadesEscolares([]);
    onUnidadesChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Resumo da Seleção */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-700 mb-2">
          📊 Resumo da Seleção
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-gray-700">
              <strong>{filiaisSelecionadas.length}</strong> filiais selecionadas
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-gray-700">
              <strong>{unidadesSelecionadas.length}</strong> unidades escolares
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            <span className="text-gray-700">
              <strong>{unidadesFiltradas.length}</strong> unidades disponíveis
            </span>
          </div>
        </div>
      </div>

      {/* Seleção de Filiais */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b-2 border-green-500">
            <FaBuilding className="inline mr-2" />
            Filiais ({filiaisSelecionadas.length} selecionadas)
          </h3>
          {filiais.length > 0 && !isViewMode && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelecionarTodasFiliais}
                disabled={filiaisSelecionadas.length === filiais.length}
              >
                <FaCheckSquare className="mr-1" />
                Todas
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDesselecionarTodasFiliais}
                disabled={filiaisSelecionadas.length === 0}
              >
                <FaSquare className="mr-1" />
                Nenhuma
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Primeiro, selecione as filiais para filtrar as unidades escolares disponíveis.
        </p>
        
        {loadingFiliais ? (
          <div className="text-center py-4">
            <div className="text-gray-500">Carregando filiais...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filiais.length === 0 ? (
              <div className="col-span-2 text-center py-4 text-gray-500">
                Nenhuma filial disponível para seu usuário
              </div>
            ) : (
              filiais.map((filial) => {
                const isChecked = filiaisSelecionadas.includes(filial.id);
                return (
                  <label key={filial.id} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded border">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleFilialChange(filial.id, e.target.checked)}
                      disabled={isViewMode}
                      className="mr-3 text-green-600 focus:ring-green-500 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 block truncate">
                        {filial.filial || 'Filial não informada'}
                      </span>
                      <div className="text-xs text-gray-500 truncate">
                        {filial.cidade || 'Cidade não informada'}/{filial.estado || 'Estado não informado'} - {filial.codigo_filial || 'Código não informado'}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Seleção de Unidades Escolares */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b-2 border-green-500">
            <FaBuilding className="inline mr-2" />
            Unidades Escolares ({unidadesSelecionadas.length} selecionadas)
          </h3>
          {unidadesFiltradas.length > 0 && !isViewMode && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelecionarTodasUnidades}
              >
                <FaCheckSquare className="mr-1" />
                Todas
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDesselecionarTodasUnidades}
              >
                <FaSquare className="mr-1" />
                Nenhuma
              </Button>
            </div>
          )}
        </div>
        
        {filiaisSelecionadas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaBuilding className="text-4xl mx-auto mb-4 text-gray-300" />
            <p>Selecione pelo menos uma filial para ver as unidades escolares disponíveis.</p>
          </div>
        ) : (
          <>
            {/* Campo de Busca */}
            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Buscar por nome, cidade, estado ou endereço..."
                  value={buscaUnidades}
                  onChange={(e) => setBuscaUnidades(e.target.value)}
                  disabled={isViewMode || loadingUnidades}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
            </div>

            {loadingUnidades ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Carregando unidades escolares...</div>
              </div>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {unidadesFiltradas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {buscaUnidades ? 'Nenhuma unidade encontrada com o termo de busca.' : 'Nenhuma unidade escolar encontrada nas filiais selecionadas.'}
                  </div>
                ) : (
                  unidadesFiltradas.map((unidade) => {
                    const isChecked = unidadesSelecionadas.includes(unidade.id);
                    const filial = filiais.find(f => f.id === unidade.filial_id);
                    return (
                      <label key={unidade.id} className={`flex items-center cursor-pointer hover:bg-gray-100 p-3 rounded border transition-all duration-200 ${isChecked ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleUnidadeChange(unidade.id, e.target.checked)}
                          disabled={isViewMode}
                          className="mr-3 text-green-600 focus:ring-green-500 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 block truncate">
                              {unidade.nome_escola || 'Nome não informado'}
                            </span>
                            {isChecked && (
                              <span className="ml-2 text-green-600 text-xs font-medium bg-green-100 px-2 py-1 rounded-full">
                                ✓ Selecionada
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-1">
                            <span className="flex items-center">
                              <FaBuilding className="mr-1 text-gray-400" />
                              {unidade.endereco || 'Endereço não informado'} - {unidade.cidade || 'Cidade não informada'}/{unidade.estado || 'Estado não informado'}
                            </span>
                            {filial && (
                              <span className="ml-4 text-blue-600 font-medium">
                                📍 {filial.filial || 'Filial não informada'}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UnidadesEscolaresTab;
