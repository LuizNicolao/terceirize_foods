import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaFilter, FaDownload, FaUpload } from 'react-icons/fa';
import { colors } from '../../../design-system';

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
`;

const LeftActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const RightActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.variant === 'primary' ? colors.primary.green : 
                props.variant === 'secondary' ? '#6c757d' : 'white'};
  color: ${props => props.variant === 'primary' || props.variant === 'secondary' ? 'white' : colors.neutral.darkGray};
  border: ${props => props.variant === 'outline' ? `2px solid ${colors.primary.green}` : 'none'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 12px 16px 12px 40px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
  }
  
  @media (max-width: 768px) {
    width: 200px;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: ${colors.neutral.gray};
`;

const FilterButton = styled(ActionButton)`
  background: white;
  border: 2px solid #e0e0e0;
  color: ${colors.neutral.darkGray};
  
  &:hover {
    border-color: ${colors.primary.green};
    color: ${colors.primary.green};
  }
`;

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
  display: ${props => props.show ? 'block' : 'none'};
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:first-child {
    border-radius: 6px 6px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 6px 6px;
  }
`;

const UsuariosActions = ({ 
  onAdd, 
  onSearch, 
  onFilter, 
  onExport, 
  onImport,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleExport = (format) => {
    onExport(format);
    setShowDropdown(false);
  };

  return (
    <ActionsContainer>
      <LeftActions>
        <ActionButton
          variant="primary"
          onClick={onAdd}
          disabled={loading}
        >
          <FaPlus size={16} />
          Novo Usuário
        </ActionButton>
        
        <SearchContainer>
          <SearchIcon>
            <FaSearch size={16} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchContainer>
        
        <FilterButton onClick={onFilter} disabled={loading}>
          <FaFilter size={16} />
          Filtros
        </FilterButton>
      </LeftActions>
      
      <RightActions>
        <Dropdown>
          <ActionButton
            variant="outline"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={loading}
          >
            <FaDownload size={16} />
            Exportar
          </ActionButton>
          
          <DropdownContent show={showDropdown}>
            <DropdownItem onClick={() => handleExport('excel')}>
              <FaDownload size={16} />
              Exportar para Excel
            </DropdownItem>
            <DropdownItem onClick={() => handleExport('csv')}>
              <FaDownload size={16} />
              Exportar para CSV
            </DropdownItem>
            <DropdownItem onClick={() => handleExport('pdf')}>
              <FaDownload size={16} />
              Exportar para PDF
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
        
        <ActionButton
          variant="outline"
          onClick={onImport}
          disabled={loading}
        >
          <FaUpload size={16} />
          Importar
        </ActionButton>
      </RightActions>
    </ActionsContainer>
  );
};

export default UsuariosActions;
