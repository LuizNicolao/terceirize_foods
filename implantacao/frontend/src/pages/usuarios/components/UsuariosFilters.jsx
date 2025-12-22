/**
 * Componente de Filtros da página de Usuários
 * Exibe barra de filtros e busca
 */

import React from 'react';
import { CadastroFilterBar } from '../../../components/ui';

const UsuariosFilters = ({ 
  searchTerm, 
  onSearchChange,
  onKeyPress,
  loading 
}) => {
  return (
    <div className="mb-6">
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onKeyPress={onKeyPress}
        placeholder="Buscar por nome, email ou tipo de acesso..."
        loading={loading}
        showFilters={false} // Usuários não tem filtros adicionais por enquanto
      />
    </div>
  );
};

export default UsuariosFilters;
