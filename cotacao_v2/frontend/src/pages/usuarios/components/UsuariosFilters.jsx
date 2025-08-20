import React from 'react';
import { FaSearch } from 'react-icons/fa';

const UsuariosFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter 
}) => {
  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Buscar por nome ou email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          flex: 1,
          padding: '8px 16px',
          border: '2px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '16px',
          transition: 'all 0.3s ease'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#10b981';
          e.target.style.outline = 'none';
          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.boxShadow = 'none';
        }}
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{
          padding: '8px 16px',
          border: '2px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '16px',
          backgroundColor: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          minWidth: '200px'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#10b981';
          e.target.style.outline = 'none';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db';
        }}
      >
        <option value="todos">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
    </div>
  );
};

export default UsuariosFilters;
