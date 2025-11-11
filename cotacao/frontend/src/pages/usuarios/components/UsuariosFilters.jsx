/**
 * Componente de Filtros da página de Usuários
 * Exibe barra de filtros e busca
 */

import React from 'react';
import { CadastroFilterBar } from '../../../components/ui';

const UsuariosFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onClear
}) => (
  <div className="mb-6">
    <CadastroFilterBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      onClear={onClear}
      placeholder="Buscar por nome ou e-mail..."
    />
  </div>
);

export default UsuariosFilters;
