import React from 'react';
import { CadastroFilterBar } from '../../../components/ui';

const UsuariosFilters = ({
  searchTerm,
  onSearchChange,
  loading
}) => {
  return (
    <div className="mb-6">
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Buscar por nome, email ou tipo de acesso..."
        loading={loading}
        showFilters={false}
      />
    </div>
  );
};

export default UsuariosFilters;
