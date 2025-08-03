import React from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: var(--white);
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const ClearButton = styled.button`
  background: var(--gray);
  color: var(--white);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--dark-gray);
    transform: translateY(-1px);
  }
`;

/**
 * Componente de filtro para telas de cadastro
 * Props:
 * - searchTerm: valor do campo de busca
 * - onSearchChange: função para atualizar o campo de busca
 * - statusFilter: valor do filtro de status (opcional)
 * - onStatusChange: função para atualizar o filtro de status (opcional)
 * - statusOptions: array de opções para o filtro de status (opcional)
 * - onClear: função para limpar filtros (opcional)
 * - placeholder: placeholder do campo de busca (opcional)
 */
const CadastroFilterBar = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions = [
    { value: 'todos', label: 'Todos os status' },
    { value: '1', label: 'Ativo' },
    { value: '0', label: 'Inativo' },
  ],
  onClear,
  placeholder = 'Buscar...'
}) => {
  return (
    <SearchContainer>
      <FaSearch style={{ color: '#bdbdbd', fontSize: 18 }} />
      <SearchInput
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
      />
      {typeof statusFilter !== 'undefined' && onStatusChange && (
        <FilterSelect value={statusFilter} onChange={e => onStatusChange(e.target.value)}>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </FilterSelect>
      )}
      {onClear && (
        <ClearButton onClick={onClear} title="Limpar filtros">
          <FaTimes />
        </ClearButton>
      )}
    </SearchContainer>
  );
};

export default CadastroFilterBar; 