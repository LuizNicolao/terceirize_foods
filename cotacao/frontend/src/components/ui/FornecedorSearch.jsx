import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaBuilding } from 'react-icons/fa';

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
  const API_URL = process.env.REACT_APP_MAIN_API_URL || 'https://foods.terceirizemais.com.br/foods/api';

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

      if (response.ok) {
        const responseData = await response.json();
        const data = responseData.data || responseData;
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
    
    // Não chamar onChange aqui para evitar sobrescrever o nome completo
    // onChange será chamado apenas quando um fornecedor for selecionado
    
    if (term.length >= 2) {
      searchFornecedores(term);
    } else {
      setFornecedores([]);
      setShowDropdown(false);
    }
  };

  const handleSelectFornecedor = (fornecedor) => {
    // Sempre usar a razão social quando disponível, senão usar nome fantasia
    const nomeCompleto = fornecedor.razao_social || fornecedor.nome_fantasia;
    
    setSelectedFornecedor(fornecedor);
    setSearchTerm(nomeCompleto);
    setShowDropdown(false);
    setFornecedores([]);
    
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
    <div className="relative w-full" ref={dropdownRef}>
      <input
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
        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      
      <button
        type="button"
        onClick={handleClear}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {searchTerm ? <FaTimes size={16} /> : <FaSearch size={16} />}
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-300 border-t-0 rounded-b-lg max-h-80 overflow-y-auto z-50 shadow-lg">
          {loading ? (
            <div className="p-5 text-center text-gray-600 text-sm">
              Carregando fornecedores...
            </div>
          ) : fornecedores.length > 0 ? (
            fornecedores.map((fornecedor) => (
              <div
                key={fornecedor.id}
                onClick={() => handleSelectFornecedor(fornecedor)}
                className="p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <FaBuilding className="text-green-600 mt-1 flex-shrink-0" size={16} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm truncate">
                      {fornecedor.razao_social || fornecedor.nome_fantasia}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                      {fornecedor.nome_fantasia && fornecedor.razao_social && (
                        <div>Fantasia: {fornecedor.nome_fantasia}</div>
                      )}
                      <div>CNPJ: {formatCNPJ(fornecedor.cnpj)}</div>
                      {fornecedor.municipio && fornecedor.uf && (
                        <div>{fornecedor.municipio} - {fornecedor.uf}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-5 text-center text-gray-600 text-sm">
              Nenhum fornecedor encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FornecedorSearch;
