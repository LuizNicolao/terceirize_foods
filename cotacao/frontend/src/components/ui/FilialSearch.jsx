import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaBuilding } from 'react-icons/fa';

const FilialSearch = ({ 
  value, 
  onChange, 
  placeholder = "Buscar filial...",
  onSelect,
  disabled = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFilial, setSelectedFilial] = useState(null);
  const dropdownRef = useRef(null);

  // URL da API do sistema principal
  const API_URL = process.env.REACT_APP_MAIN_API_URL || 'https://foods.terceirizemais.com.br/foods/api';

  useEffect(() => {
    // Se há um valor inicial, buscar os dados da filial
    if (value && !selectedFilial) {
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

  const searchFiliais = async (term) => {
    if (!term || term.length < 1) {
      setFiliais([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      // Usar o token do sistema de cotação
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token não encontrado');
        setFiliais([]);
        setShowDropdown(false);
        return;
      }

      // Buscar filiais ativas
      const response = await fetch(`${API_URL}/filiais/ativas/listar`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'omit'
      });

      if (response.ok) {
        const responseData = await response.json();
        const data = responseData.data || responseData;
        
        // Filtrar filiais pelo termo de busca (client-side)
        const filiaisFiltradas = Array.isArray(data) 
          ? data.filter(filial => {
              const searchLower = term.toLowerCase();
              return (
                (filial.filial && filial.filial.toLowerCase().includes(searchLower)) ||
                (filial.razao_social && filial.razao_social.toLowerCase().includes(searchLower)) ||
                (filial.cnpj && filial.cnpj.includes(searchLower)) ||
                (filial.cidade && filial.cidade.toLowerCase().includes(searchLower))
              );
            })
          : [];
        
        setFiliais(filiaisFiltradas);
        setShowDropdown(filiaisFiltradas.length > 0);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao buscar filiais:', response.status, errorData);
        setFiliais([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar filiais:', error);
      setFiliais([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length >= 1) {
      searchFiliais(term);
    } else {
      setFiliais([]);
      setShowDropdown(false);
    }
  };

  const handleSelectFilial = (filial) => {
    // Usar o nome da filial
    const nomeFilial = filial.filial || filial.razao_social;
    
    setSelectedFilial(filial);
    setSearchTerm(nomeFilial);
    setShowDropdown(false);
    setFiliais([]);
    
    // Passar o nome da filial para o onChange
    onChange(nomeFilial);
    
    if (onSelect) {
      onSelect(filial);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedFilial(null);
    setFiliais([]);
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
          if (filiais.length > 0) {
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
              Carregando filiais...
            </div>
          ) : filiais.length > 0 ? (
            filiais.map((filial) => (
              <div
                key={filial.id}
                onClick={() => handleSelectFilial(filial)}
                className="p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <FaBuilding className="text-green-600 mt-1 flex-shrink-0" size={16} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm truncate">
                      {filial.filial || filial.razao_social}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                      {filial.razao_social && filial.filial && (
                        <div>Razão Social: {filial.razao_social}</div>
                      )}
                      {filial.cnpj && (
                        <div>CNPJ: {formatCNPJ(filial.cnpj)}</div>
                      )}
                      {filial.cidade && filial.uf && (
                        <div>{filial.cidade} - {filial.uf}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-5 text-center text-gray-600 text-sm">
              Nenhuma filial encontrada
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilialSearch;

