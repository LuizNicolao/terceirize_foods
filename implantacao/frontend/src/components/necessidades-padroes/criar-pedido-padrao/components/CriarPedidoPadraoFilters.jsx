import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { SearchableSelect, Button } from '../../../ui';

/**
 * Componente de filtros para Criar Pedido Padrão
 * Segue o padrão das outras telas do sistema
 */
const CriarPedidoPadraoFilters = ({
  filtros,
  filiais,
  grupos,
  escolas,
  loading,
  loadingEscolas,
  onFiltroChange,
  onLimparFiltros
}) => {
  const hasActiveFilters = filtros.filial_id || filtros.grupo_id || filtros.escola_id;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaFilter className="mr-2" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onLimparFiltros}
            className="flex items-center gap-2"
          >
            <FaTimes className="text-xs" />
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableSelect
          label="Filial"
          name="filial_id"
          options={[{ value: '', label: 'Todas as filiais' }, ...filiais]}
          value={filtros.filial_id || ''}
          onChange={(value) => onFiltroChange('filial_id', value)}
          placeholder="Digite para buscar a filial..."
          loading={loading}
          usePortal={false}
        />
        
        <SearchableSelect
          label="Escola"
          name="escola_id"
          options={[{ value: '', label: 'Todas as escolas' }, ...escolas]}
          value={filtros.escola_id || ''}
          onChange={(value) => onFiltroChange('escola_id', value)}
          placeholder="Digite para buscar uma escola..."
          loading={loadingEscolas}
          disabled={!filtros.filial_id}
          usePortal={false}
        />
        
        <SearchableSelect
          label="Grupo de Produtos"
          name="grupo_id"
          options={[{ value: '', label: 'Todos os grupos' }, ...grupos]}
          value={filtros.grupo_id || ''}
          onChange={(value) => onFiltroChange('grupo_id', value)}
          placeholder="Digite para buscar um grupo..."
          loading={loading}
          usePortal={false}
        />
      </div>
    </div>
  );
};

export default CriarPedidoPadraoFilters;

