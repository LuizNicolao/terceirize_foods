import React, { useState, useEffect } from 'react';
import FoodsApiService from '../../../services/FoodsApiService';

/**
 * Seção de Filiais e Centros de Custo da Receita (seleção múltipla)
 */
const FiliaisCentrosCusto = ({
  formData,
  isViewMode,
  onInputChange
}) => {
  const [filiais, setFiliais] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [centrosCustoFiltrados, setCentrosCustoFiltrados] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingCentrosCusto, setLoadingCentrosCusto] = useState(false);
  const [searchFilial, setSearchFilial] = useState('');
  const [searchCentroCusto, setSearchCentroCusto] = useState('');

  // Carregar filiais e centros de custo
  useEffect(() => {
    carregarFiliais();
    carregarCentrosCusto();
  }, []);

  // Filtrar centros de custo quando filiais selecionadas mudarem
  useEffect(() => {
    if (formData.filiais && formData.filiais.length > 0) {
      const filiaisIds = formData.filiais.map(f => f.id);
      const filtrados = centrosCusto.filter(cc => 
        filiaisIds.includes(cc.filial_id)
      );
      setCentrosCustoFiltrados(filtrados);
    } else {
      setCentrosCustoFiltrados(centrosCusto);
    }
  }, [formData.filiais, centrosCusto]);

  const carregarFiliais = async () => {
    setLoadingFiliais(true);
    try {
      let allFiliaisData = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getFiliais({ page, limit });
        
        if (result.success && result.data) {
          let items = [];
          if (result.data.items) {
            items = result.data.items;
          } else if (Array.isArray(result.data)) {
            items = result.data;
          } else if (result.data.data) {
            items = result.data.data;
          }
          
          allFiliaisData = [...allFiliaisData, ...items];
          hasMore = items.length === limit;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      // Filtrar apenas a filial "CD TOLEDO"
      allFiliaisData = allFiliaisData.filter(filial => {
        if (filial.filial) {
          const filialNome = filial.filial.toLowerCase().trim();
          return filialNome.includes('cd toledo') || 
                 filialNome === 'toledo' ||
                 filialNome.includes('toledo');
        }
        return false;
      });
      
      setFiliais(allFiliaisData);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoadingFiliais(false);
    }
  };

  const carregarCentrosCusto = async () => {
    setLoadingCentrosCusto(true);
    try {
      let allCentrosCusto = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getCentrosCusto({
          page,
          limit: 100
        });
        
        if (result.success && result.data && result.data.length > 0) {
          allCentrosCusto = [...allCentrosCusto, ...result.data];
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      // Aplicar filtro para "CD TOLEDO"
      allCentrosCusto = allCentrosCusto.filter(centroCusto => 
        centroCusto.filial_nome && 
        (centroCusto.filial_nome.toLowerCase().includes('cd toledo') || 
        centroCusto.filial_nome.toLowerCase().includes('toledo'))
      );
      
      setCentrosCusto(allCentrosCusto);
      setCentrosCustoFiltrados(allCentrosCusto);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
    } finally {
      setLoadingCentrosCusto(false);
    }
  };

  const handleToggleFilial = (filial) => {
    const filiaisAtuais = formData.filiais || [];
    const existe = filiaisAtuais.find(f => f.id === filial.id);
    
    if (existe) {
      // Remover
      const novasFiliais = filiaisAtuais.filter(f => f.id !== filial.id);
      onInputChange('filiais', novasFiliais);
      
      // Remover centros de custo dessa filial
      const novosCentrosCusto = (formData.centros_custo || []).filter(cc => 
        cc.filial_id !== filial.id
      );
      onInputChange('centros_custo', novosCentrosCusto);
    } else {
      // Adicionar
      onInputChange('filiais', [...filiaisAtuais, { id: filial.id, nome: filial.filial || filial.nome || filial.razao_social || '' }]);
    }
  };

  const handleToggleCentroCusto = (centroCusto) => {
    const centrosCustoAtuais = formData.centros_custo || [];
    const existe = centrosCustoAtuais.find(cc => cc.id === centroCusto.id);
    
    if (existe) {
      // Remover
      onInputChange('centros_custo', centrosCustoAtuais.filter(cc => cc.id !== centroCusto.id));
    } else {
      // Adicionar
      onInputChange('centros_custo', [...centrosCustoAtuais, {
        id: centroCusto.id,
        nome: centroCusto.nome || '',
        filial_id: centroCusto.filial_id || null,
        filial_nome: centroCusto.filial_nome || null
      }]);
    }
  };

  const filiaisFiltradas = filiais.filter(f => {
    if (!searchFilial) return true;
    const nome = (f.filial || f.nome || f.razao_social || '').toLowerCase();
    return nome.includes(searchFilial.toLowerCase());
  });

  const centrosCustoFiltradosParaExibicao = centrosCustoFiltrados.filter(cc => {
    if (!searchCentroCusto) return true;
    const nome = (cc.nome || '').toLowerCase();
    return nome.includes(searchCentroCusto.toLowerCase());
  });

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Filiais e Centros de Custo
      </h3>
      <div className="space-y-4">
        {/* Filiais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filiais <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-md p-2 max-h-48 overflow-y-auto bg-white">
            <input
              type="text"
              placeholder="Buscar filial..."
              value={searchFilial}
              onChange={(e) => setSearchFilial(e.target.value)}
              disabled={isViewMode}
              className="w-full px-2 py-1 mb-2 border border-gray-300 rounded text-sm"
            />
            {loadingFiliais ? (
              <div className="text-center py-4 text-gray-500">Carregando...</div>
            ) : filiaisFiltradas.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nenhuma filial encontrada</div>
            ) : (
              <div className="space-y-1">
                {filiaisFiltradas.map((filial) => {
                  const isSelected = (formData.filiais || []).some(f => f.id === filial.id);
                  return (
                    <label
                      key={filial.id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleFilial(filial)}
                        disabled={isViewMode}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        {filial.filial || filial.nome || filial.razao_social || ''}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {(formData.filiais || []).length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              {formData.filiais.length} filial(is) selecionada(s)
            </div>
          )}
        </div>

        {/* Centros de Custo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Centros de Custo <span className="text-red-500">*</span>
            {(formData.filiais || []).length === 0 && (
              <span className="text-xs text-gray-500 ml-2">(Selecione uma filial primeiro)</span>
            )}
          </label>
          <div className="border border-gray-300 rounded-md p-2 max-h-48 overflow-y-auto bg-white">
            <input
              type="text"
              placeholder="Buscar centro de custo..."
              value={searchCentroCusto}
              onChange={(e) => setSearchCentroCusto(e.target.value)}
              disabled={isViewMode || (formData.filiais || []).length === 0}
              className="w-full px-2 py-1 mb-2 border border-gray-300 rounded text-sm disabled:bg-gray-100"
            />
            {loadingCentrosCusto ? (
              <div className="text-center py-4 text-gray-500">Carregando...</div>
            ) : (formData.filiais || []).length === 0 ? (
              <div className="text-center py-4 text-gray-500">Selecione uma filial primeiro</div>
            ) : centrosCustoFiltradosParaExibicao.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nenhum centro de custo encontrado</div>
            ) : (
              <div className="space-y-1">
                {centrosCustoFiltradosParaExibicao.map((centroCusto) => {
                  const isSelected = (formData.centros_custo || []).some(cc => cc.id === centroCusto.id);
                  return (
                    <label
                      key={centroCusto.id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCentroCusto(centroCusto)}
                        disabled={isViewMode}
                        className="mr-2"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 font-medium">
                          {centroCusto.nome || ''}
                        </span>
                        {centroCusto.filial_nome && (
                          <span className="text-xs text-gray-500">
                            Filial: {centroCusto.filial_nome}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {(formData.centros_custo || []).length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              {formData.centros_custo.length} centro(s) de custo selecionado(s)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiliaisCentrosCusto;

