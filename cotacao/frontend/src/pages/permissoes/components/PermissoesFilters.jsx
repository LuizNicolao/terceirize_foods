/**
 * Componente de Filtros da página de Permissões
 * Exibe barra de filtros e busca
 */

import React from 'react';
import { CadastroFilterBar } from '../../../components/ui';

const PermissoesFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  onClearFilters,
  loading
}) => (
  <div className="mb-6">
    <CadastroFilterBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      placeholder="Buscar usuários por nome ou e-mail..."
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      additionalFilters={[
        {
          value: roleFilter,
          onChange: onRoleFilterChange,
          options: [
            { value: 'todos', label: 'Todos os perfis' },
            { value: 'administrador', label: 'Administrador' },
            { value: 'gestor', label: 'Gestor' },
            { value: 'supervisor', label: 'Supervisor' },
            { value: 'comprador', label: 'Comprador' }
          ]
        }
      ]}
      onClear={onClearFilters}
      loading={loading}
    />
  </div>
);

export default PermissoesFilters;
