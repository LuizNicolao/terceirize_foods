import React, { useState, useEffect } from 'react';
import { Button, Input, SearchableSelect } from '../ui';
import { FaSearch, FaTimes } from 'react-icons/fa';
import FoodsApiService from '../../services/FoodsApiService';

const QuantidadesServidasFilters = ({ onFilter, onClear }) => {
  const [filters, setFilters] = useState({
    escola_id: '',
    data_inicio: '',
    data_fim: ''
  });
  
  const [escolas, setEscolas] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  
  // Carregar escolas
  useEffect(() => {
    const carregarEscolas = async () => {
      setLoadingEscolas(true);
      try {
        let todasEscolas = [];
        let page = 1;
        let hasMore = true;
        const limit = 100;
        
        while (hasMore) {
          const result = await FoodsApiService.getUnidadesEscolares({
            page,
            limit,
            status: 'ativo'
          });
          
          if (result.success && result.data && result.data.length > 0) {
            todasEscolas = [...todasEscolas, ...result.data];
            
            if (result.data.length < limit) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
          
          if (page > 50) {
            hasMore = false;
          }
        }
        
        setEscolas(todasEscolas);
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
      } finally {
        setLoadingEscolas(false);
      }
    };
    
    carregarEscolas();
  }, []);
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };
  
  const handleApplyFilters = () => {
    onFilter(filters);
  };
  
  const handleClearFilters = () => {
    const emptyFilters = {
      escola_id: '',
      data_inicio: '',
      data_fim: ''
    };
    setFilters(emptyFilters);
    onClear();
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Cozinha Industrial */}
        <div>
          <SearchableSelect
            label="Cozinha Industrial"
            value={filters.escola_id}
            onChange={(value) => handleFilterChange('escola_id', value)}
            options={[
              { value: '', label: 'Todas as cozinhas industriais' },
              ...escolas.map(escola => ({
                value: escola.id,
                label: escola.nome_escola,
                description: `${escola.cidade} - ${escola.rota_nome || 'Sem rota'}`
              }))
            ]}
            placeholder="Selecione uma cozinha industrial..."
            disabled={loadingEscolas}
            usePortal={false}
            renderOption={(option) => (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                )}
              </div>
            )}
          />
        </div>
        
        {/* Data Início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Início
          </label>
          <Input
            type="date"
            value={filters.data_inicio}
            onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        
        {/* Data Fim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Fim
          </label>
          <Input
            type="date"
            value={filters.data_fim}
            onChange={(e) => handleFilterChange('data_fim', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        
        {/* Botões */}
        <div className="flex items-end gap-2">
          <Button
            onClick={handleClearFilters}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <FaTimes className="mr-2" />
            Limpar
          </Button>
          <Button
            onClick={handleApplyFilters}
            size="sm"
            className="flex-1"
          >
            <FaSearch className="mr-2" />
            Filtrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuantidadesServidasFilters;

