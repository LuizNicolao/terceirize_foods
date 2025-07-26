import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes, FaBuilding } from 'react-icons/fa';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  padding-right: 40px;

  &:focus {
    outline: none;
    border-color: #00723e;
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  cursor: pointer;
  z-index: 2;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const FornecedorInfo = styled.div`
  flex: 1;
`;

const FornecedorName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const FornecedorDetails = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const FornecedorSearch = ({ 
  value, 
  onChange, 
  placeholder = "Buscar fornecedor...",
  onSelect,
  disabled = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState(null);
  const dropdownRef = useRef(null);

  // URL da API do sistema principal
  const API_URL = process.env.REACT_APP_MAIN_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    // Se há um valor inicial, buscar os dados do fornecedor
    if (value && !selectedFornecedor) {
      setSearchTerm(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchFornecedores = async (term) => {
    if (!term || term.length < 2) {
      setFornecedores([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      // Usar o token do sistema de cotação
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token não encontrado');
        setFornecedores([]);
        setShowDropdown(false);
        return;
      }

      console.log('🔍 Buscando fornecedores diretamente no sistema principal...');
      
      // Buscar fornecedores usando rota segura
      const response = await fetch(`${API_URL}/fornecedores/public?search=${encodeURIComponent(term)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'omit' // Não enviar cookies para evitar CSRF
      });

      console.log('🔍 Resposta da API:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fornecedores encontrados:', data.length);
        setFornecedores(data);
        setShowDropdown(data.length > 0);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao buscar fornecedores:', response.status, errorData);
        setFornecedores([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar fornecedores:', error);
      setFornecedores([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onChange(term);
    
    if (term.length >= 2) {
      searchFornecedores(term);
    } else {
      setFornecedores([]);
      setShowDropdown(false);
    }
  };

  const handleSelectFornecedor = (fornecedor) => {
    const nomeCompleto = fornecedor.razao_social || fornecedor.nome_fantasia;
    setSelectedFornecedor(fornecedor);
    setSearchTerm(nomeCompleto);
    setShowDropdown(false);
    setFornecedores([]);
    
    // Chamar onChange com o nome completo do fornecedor
    onChange(nomeCompleto);
    
    if (onSelect) {
      onSelect(fornecedor);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedFornecedor(null);
    setFornecedores([]);
    setShowDropdown(false);
    onChange('');
    
    if (onSelect) {
      onSelect(null);
    }
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return (
    <SearchContainer ref={dropdownRef}>
      <SearchInput
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => {
          if (fornecedores.length > 0) {
            setShowDropdown(true);
          }
        }}
      />
      
      <SearchIcon onClick={handleClear}>
        {searchTerm ? <FaTimes /> : <FaSearch />}
      </SearchIcon>

      {showDropdown && (
        <Dropdown>
          {loading ? (
            <LoadingSpinner>Carregando fornecedores...</LoadingSpinner>
          ) : fornecedores.length > 0 ? (
            fornecedores.map((fornecedor) => (
              <DropdownItem
                key={fornecedor.id}
                onClick={() => handleSelectFornecedor(fornecedor)}
              >
                <FaBuilding style={{ color: '#00723e' }} />
                <FornecedorInfo>
                  <FornecedorName>
                    {fornecedor.razao_social || fornecedor.nome_fantasia}
                  </FornecedorName>
                  <FornecedorDetails>
                    {fornecedor.nome_fantasia && fornecedor.razao_social && (
                      <div>Fantasia: {fornecedor.nome_fantasia}</div>
                    )}
                    <div>CNPJ: {formatCNPJ(fornecedor.cnpj)}</div>
                    {fornecedor.municipio && fornecedor.uf && (
                      <div>{fornecedor.municipio} - {fornecedor.uf}</div>
                    )}
                  </FornecedorDetails>
                </FornecedorInfo>
              </DropdownItem>
            ))
          ) : (
            <NoResults>Nenhum fornecedor encontrado</NoResults>
          )}
        </Dropdown>
      )}
    </SearchContainer>
  );
};

export default FornecedorSearch; 