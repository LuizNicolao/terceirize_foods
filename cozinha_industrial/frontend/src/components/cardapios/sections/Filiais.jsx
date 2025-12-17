import React, { useState, useEffect } from 'react';
import FoodsApiService from '../../../services/FoodsApiService';

/**
 * Seção de Filiais do Cardápio (seleção múltipla)
 */
const Filiais = ({
  formData,
  isViewMode,
  onInputChange
}) => {
  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [searchFilial, setSearchFilial] = useState('');

  // Carregar filiais
  useEffect(() => {
    carregarFiliais();
  }, []);

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
      
      setFiliais(allFiliaisData);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoadingFiliais(false);
    }
  };

  const handleToggleFilial = (filial) => {
    const filiaisAtuais = formData.filiais || [];
    const existe = filiaisAtuais.find(f => f.id === filial.id);
    
    if (existe) {
      const novasFiliais = filiaisAtuais.filter(f => f.id !== filial.id);
      onInputChange('filiais', novasFiliais);
      
      // Remover centros de custo vinculados à filial removida
      const novosCentrosCusto = (formData.centros_custo || []).filter(cc => 
        cc.filial_id !== filial.id
      );
      onInputChange('centros_custo', novosCentrosCusto);
    } else {
      onInputChange('filiais', [...filiaisAtuais, { 
        id: filial.id, 
        nome: filial.filial || filial.nome || filial.razao_social || '' 
      }]);
    }
  };

  const filiaisFiltradas = filiais.filter(f => 
    (f.filial || f.nome || f.razao_social || '').toLowerCase().includes(searchFilial.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar filial..."
        value={searchFilial}
        onChange={(e) => setSearchFilial(e.target.value)}
        disabled={isViewMode}
        className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
      />
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded bg-white">
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
                    {filial.filial || filial.nome || filial.razao_social || `Filial ${filial.id}`}
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
  );
};

export default Filiais;







