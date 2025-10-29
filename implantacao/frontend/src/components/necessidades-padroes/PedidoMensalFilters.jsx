import React, { useState, useEffect } from 'react';
import { Button } from '../ui';
import { FaSearch, FaTimes } from 'react-icons/fa';
import FoodsApiService from '../../services/FoodsApiService';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';

const PedidoMensalFilters = ({ 
  filtros, 
  onFilterChange, 
  onClearFilters,
  loading = false 
}) => {
  const [escolas, setEscolas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);

  const { opcoes: opcoesSemanasAbastecimento } = useSemanasAbastecimento();

  // Carregar escolas
  useEffect(() => {
    const carregarEscolas = async () => {
      setLoadingEscolas(true);
      try {
        const response = await FoodsApiService.getUnidadesEscolares({ limit: 1000 });
        if (response.success) {
          setEscolas(response.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
      } finally {
        setLoadingEscolas(false);
      }
    };

    carregarEscolas();
  }, []);

  // Carregar grupos
  useEffect(() => {
    const carregarGrupos = async () => {
      setLoadingGrupos(true);
      try {
        const response = await FoodsApiService.getGrupos();
        if (response.success) {
          setGrupos(response.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
      } finally {
        setLoadingGrupos(false);
      }
    };

    carregarGrupos();
  }, []);

  const handleFilterChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Escola */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Escola
          </label>
          <select
            value={filtros.escola_id || ''}
            onChange={(e) => handleFilterChange('escola_id', e.target.value)}
            disabled={loading || loadingEscolas}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          >
            <option value="">Selecione uma escola</option>
            {escolas.map((escola) => (
              <option key={escola.id} value={escola.id}>
                {escola.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Grupo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grupo de Produtos
          </label>
          <select
            value={filtros.grupo_id || ''}
            onChange={(e) => handleFilterChange('grupo_id', e.target.value)}
            disabled={loading || loadingGrupos}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          >
            <option value="">Selecione um grupo</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Semana de Consumo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semana de Consumo
          </label>
          <select
            value={filtros.semana_consumo || ''}
            onChange={(e) => handleFilterChange('semana_consumo', e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          >
            <option value="">Selecione uma semana</option>
            {opcoesSemanasAbastecimento.map((semana) => (
              <option key={semana.value} value={semana.value}>
                {semana.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botões */}
        <div className="flex items-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={loading}
            className="flex items-center"
          >
            <FaTimes className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PedidoMensalFilters;
