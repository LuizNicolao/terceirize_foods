import React, { useState, useEffect } from 'react';
import FoodsApiService from '../../../services/FoodsApiService';

/**
 * Seção de Centros de Custo do Cardápio (seleção múltipla)
 */
const CentrosCusto = ({
  formData,
  isViewMode,
  onInputChange
}) => {
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [centrosCustoFiltrados, setCentrosCustoFiltrados] = useState([]);
  const [loadingCentrosCusto, setLoadingCentrosCusto] = useState(false);
  const [searchCentroCusto, setSearchCentroCusto] = useState('');

  // Carregar centros de custo
  useEffect(() => {
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
      
      setCentrosCusto(allCentrosCusto);
      setCentrosCustoFiltrados(allCentrosCusto);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
    } finally {
      setLoadingCentrosCusto(false);
    }
  };

  const handleToggleCentroCusto = (centroCusto) => {
    const centrosCustoAtuais = formData.centros_custo || [];
    const existe = centrosCustoAtuais.find(cc => cc.id === centroCusto.id);
    
    if (existe) {
      onInputChange('centros_custo', centrosCustoAtuais.filter(cc => cc.id !== centroCusto.id));
    } else {
      onInputChange('centros_custo', [...centrosCustoAtuais, { 
        id: centroCusto.id, 
        nome: centroCusto.nome || '',
        filial_id: centroCusto.filial_id 
      }]);
    }
  };

  const centrosCustoFiltradosParaExibicao = centrosCustoFiltrados.filter(cc =>
    (cc.nome || '').toLowerCase().includes(searchCentroCusto.toLowerCase())
  );

  if ((formData.filiais || []).length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800 text-sm">
          Selecione uma filial para ver os centros de custos disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar centro de custo..."
        value={searchCentroCusto}
        onChange={(e) => setSearchCentroCusto(e.target.value)}
        disabled={isViewMode || loadingCentrosCusto}
        className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
      />
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded bg-white">
        {loadingCentrosCusto ? (
          <div className="text-center py-4 text-gray-500">Carregando...</div>
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
  );
};

export default CentrosCusto;






