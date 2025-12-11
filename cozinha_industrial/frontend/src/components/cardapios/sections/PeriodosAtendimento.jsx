import React, { useState, useEffect } from 'react';
import periodosAtendimentoService from '../../../services/periodosAtendimento';
import contratosService from '../../../services/contratos';

/**
 * Seção de Períodos de Atendimento do Cardápio (seleção múltipla)
 */
const PeriodosAtendimento = ({
  formData,
  isViewMode,
  onInputChange
}) => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Carregar períodos quando contratos estiverem selecionados
  useEffect(() => {
    if ((formData.contratos || []).length > 0) {
      carregarPeriodos();
    } else {
      setPeriodos([]);
      onInputChange('periodos_atendimento', []);
    }
  }, [formData.contratos]);

  const carregarPeriodos = async () => {
    setLoading(true);
    try {
      const contratosIds = (formData.contratos || []).map(c => c.id);
      
      // Buscar unidades vinculadas aos contratos
      const unidadesIds = new Set();
      
      for (const contratoId of contratosIds) {
        try {
          const response = await contratosService.buscarUnidadesVinculadas(contratoId);
          if (response.success && response.data) {
            response.data.forEach(unidade => {
              if (unidade.cozinha_industrial_id) {
                unidadesIds.add(unidade.cozinha_industrial_id);
              }
            });
          }
        } catch (error) {
          console.error(`Erro ao buscar unidades do contrato ${contratoId}:`, error);
        }
      }

      // Buscar períodos vinculados às unidades
      if (unidadesIds.size > 0) {
        const unidadesArray = Array.from(unidadesIds);
        const response = await periodosAtendimentoService.buscarPeriodosPorUnidades(unidadesArray);
        
        if (response.success && response.data && response.data.periodos) {
          setPeriodos(response.data.periodos);
        } else {
          setPeriodos([]);
        }
      } else {
        setPeriodos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar períodos de atendimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePeriodo = (periodo) => {
    const periodosAtuais = formData.periodos_atendimento || [];
    const existe = periodosAtuais.find(p => p.id === periodo.id);
    
    if (existe) {
      onInputChange('periodos_atendimento', periodosAtuais.filter(p => p.id !== periodo.id));
    } else {
      onInputChange('periodos_atendimento', [...periodosAtuais, { 
        id: periodo.id, 
        nome: periodo.nome || ''
      }]);
    }
  };

  const periodosFiltrados = periodos.filter(p =>
    (p.nome || '').toLowerCase().includes(search.toLowerCase())
  );

  if ((formData.contratos || []).length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800 text-sm">
          Selecione contratos na seção anterior para ver os períodos de atendimento disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
        <input
          type="text"
          placeholder="Buscar período..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isViewMode || loading}
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
        />
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded bg-white">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Carregando...</div>
          ) : periodosFiltrados.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Nenhum período encontrado</div>
          ) : (
            <div className="space-y-1">
              {periodosFiltrados.map((periodo) => {
                const isSelected = (formData.periodos_atendimento || []).some(p => p.id === periodo.id);
                return (
                  <label
                    key={periodo.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePeriodo(periodo)}
                      disabled={isViewMode}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {periodo.nome || periodo.codigo || `Período ${periodo.id}`}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        {(formData.periodos_atendimento || []).length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            {formData.periodos_atendimento.length} período(s) selecionado(s)
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodosAtendimento;

