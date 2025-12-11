import React, { useState, useEffect } from 'react';
import contratosService from '../../../services/contratos';

/**
 * Seção de Contratos do Cardápio (seleção múltipla)
 */
const Contratos = ({
  formData,
  isViewMode,
  onInputChange
}) => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Carregar contratos quando centros de custo estiverem selecionados
  useEffect(() => {
    if ((formData.centros_custo || []).length > 0) {
      carregarContratos();
    } else {
      setContratos([]);
      onInputChange('contratos', []);
    }
  }, [formData.centros_custo]);

  const carregarContratos = async () => {
    setLoading(true);
    try {
      const centrosCustoIds = (formData.centros_custo || []).map(cc => cc.id);
      
      // Buscar todos os contratos ativos usando paginação
      let allContratos = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const response = await contratosService.listar({
          page,
          limit: 100,
          status: 'ativo'
        });

        if (response.success && response.data && response.data.length > 0) {
          allContratos = [...allContratos, ...response.data];
          hasMore = response.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }

      // Filtrar contratos que têm centro de custo nos selecionados
      const contratosFiltrados = allContratos.filter(contrato => 
        centrosCustoIds.includes(contrato.centro_custo_id)
      );
      
      setContratos(contratosFiltrados);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleContrato = (contrato) => {
    const contratosAtuais = formData.contratos || [];
    const existe = contratosAtuais.find(c => c.id === contrato.id);
    
    if (existe) {
      onInputChange('contratos', contratosAtuais.filter(c => c.id !== contrato.id));
    } else {
      onInputChange('contratos', [...contratosAtuais, { 
        id: contrato.id, 
        nome: contrato.nome || ''
      }]);
    }
  };

  const contratosFiltrados = contratos.filter(c =>
    (c.nome || '').toLowerCase().includes(search.toLowerCase())
  );

  if ((formData.centros_custo || []).length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800 text-sm">
          Selecione centros de custo na seção anterior para ver os contratos disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
        <input
          type="text"
          placeholder="Buscar contrato..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isViewMode || loading}
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
        />
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded bg-white">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Carregando...</div>
          ) : contratosFiltrados.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Nenhum contrato encontrado</div>
          ) : (
            <div className="space-y-1">
              {contratosFiltrados.map((contrato) => {
                const isSelected = (formData.contratos || []).some(c => c.id === contrato.id);
                return (
                  <label
                    key={contrato.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleContrato(contrato)}
                      disabled={isViewMode}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {contrato.nome || contrato.codigo || `Contrato ${contrato.id}`}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        {(formData.contratos || []).length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            {formData.contratos.length} contrato(s) selecionado(s)
          </div>
        )}
      </div>
    </div>
  );
};

export default Contratos;

