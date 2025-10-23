import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import FoodsApiService from '../../../services/FoodsApiService';

/**
 * Componente de filtros avançados para Produtos Per Capita
 * Inclui pesquisa, status, grupo, subgrupo e classe
 */
const ProdutosPerCapitaFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  grupoFilter,
  onGrupoFilterChange,
  onClear,
  onSearchSubmit,
  placeholder = 'Buscar por nome do produto...'
}) => {
  // Estados para dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);

  /**
   * Carregar grupos
   */
  const carregarGrupos = useCallback(async () => {
    setLoadingGrupos(true);
    try {
      const response = await FoodsApiService.getGruposAtivos();
      if (response.success) {
        setGrupos(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoadingGrupos(false);
    }
  }, []);


  /**
   * Lidar com mudança de grupo
   */
  const handleGrupoChange = (grupoId) => {
    onGrupoFilterChange(grupoId);
  };

  /**
   * Lidar com pesquisa por Enter
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  /**
   * Limpar todos os filtros
   */
  const handleClear = () => {
    onClear();
  };

  // Carregar grupos na montagem
  useEffect(() => {
    carregarGrupos();
  }, [carregarGrupos]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Campo de busca */}
        <div className="lg:col-span-2 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
          />
        </div>

        {/* Filtro de status */}
        <div>
          <select 
            value={statusFilter} 
            onChange={e => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors bg-white"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        {/* Filtro de grupo */}
        <div>
          <select 
            value={grupoFilter} 
            onChange={e => handleGrupoChange(e.target.value)}
            disabled={loadingGrupos}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors bg-white disabled:bg-gray-100"
          >
            <option value="">Todos os grupos</option>
            {grupos.map(grupo => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nome}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Botão limpar */}
      <div className="mt-4 flex justify-end">
        <button 
          onClick={handleClear} 
          title="Limpar filtros"
          className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <FaTimes className="text-xs" />
          <span>Limpar Filtros</span>
        </button>
      </div>
    </div>
  );
};

export default ProdutosPerCapitaFilters;