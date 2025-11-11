import React from 'react';
import { CadastroFilterBar } from '../../../components/ui';

const PermissoesFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  nivelFilter,
  onNivelFilterChange,
  tipoFilter,
  onTipoFilterChange,
  onClearFilters,
  loading
}) => {
  return (
    <div className="mb-6">
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Buscar usuários por nome ou email..."
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        additionalFilters={[
          {
            value: nivelFilter,
            onChange: onNivelFilterChange,
            options: [
              { value: 'todos', label: 'Todos os níveis' },
              { value: 'I', label: 'Nível I' },
              { value: 'II', label: 'Nível II' },
              { value: 'III', label: 'Nível III' }
            ]
          },
          {
            value: tipoFilter,
            onChange: onTipoFilterChange,
            options: [
              { value: 'todos', label: 'Todos os tipos' },
              { value: 'administrador', label: 'Administrador' },
              { value: 'coordenador', label: 'Coordenador' },
              { value: 'administrativo', label: 'Administrativo' },
              { value: 'gerente', label: 'Gerente' },
              { value: 'supervisor', label: 'Supervisor' }
            ]
          }
        ]}
        onClear={onClearFilters}
        loading={loading}
      />
    </div>
  );
};

export default PermissoesFilters;
