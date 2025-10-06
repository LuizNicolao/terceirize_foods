/**
 * Componente de Filtros da página de Permissões
 * Exibe barra de filtros e busca
 */

import React from 'react';
import { CadastroFilterBar } from '../../../components/ui';

const PermissoesFilters = ({ 
  searchTerm, 
  onSearchChange, 
  loading 
}) => {
  return (
    <div className="mb-6">
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Buscar usuários por nome ou email..."
        loading={loading}
        showFilters={false} // Permissões não tem filtros adicionais por enquanto
      />
    </div>
  );
};

export default PermissoesFilters;
