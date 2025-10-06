import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';

/**
 * Componente de filtro para semana de abastecimento com busca
 */
const SemanaAbastecimentoFilter = ({
  value,
  onChange,
  opcoes = [],
  loading = false,
  disabled = false,
  className = "",
  placeholder = "Selecione uma semana..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(opcoes);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Atualizar opções filtradas quando searchTerm ou opcoes mudarem
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(opcoes);
    } else {
      const filtered = opcoes.filter(opcao => 
        opcao.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, opcoes]);

  // Encontrar opção selecionada
  useEffect(() => {
    const selected = opcoes.find(opcao => opcao.value === value);
    setSelectedOption(selected);
  }, [value, opcoes]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled || loading) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleOptionSelect = (opcao) => {
    onChange(opcao.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`
          relative cursor-pointer border border-gray-300 rounded-lg transition-colors duration-200
          ${disabled || loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          ${isOpen ? 'border-green-500 ring-2 ring-green-500 ring-opacity-50' : ''}
        `}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <FaCalendarAlt className="ml-3 text-gray-400 text-sm flex-shrink-0" />
            <div className="flex-1 min-w-0 pl-2">
              {isOpen ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Digite para buscar semana..."
                  className="w-full bg-transparent border-none outline-none text-sm py-2"
                  disabled={disabled || loading}
                />
              ) : (
                <span className={`block truncate py-2 ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center pr-3">
            {selectedOption && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors mr-1"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            )}
            <FaChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden top-full mt-1">
          <div className="overflow-y-auto max-h-60">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto mb-2"></div>
                <span className="text-sm">Carregando...</span>
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((opcao, index) => (
                <div
                  key={opcao.value}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors duration-150
                    ${selectedOption?.value === opcao.value 
                      ? 'bg-green-50 border-l-4 border-l-green-500' 
                      : 'hover:bg-gray-50'
                    }
                    ${index < filteredOptions.length - 1 ? 'border-b border-gray-100' : ''}
                  `}
                  onClick={() => handleOptionSelect(opcao)}
                >
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-400 text-sm mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-900">{opcao.label}</span>
                    {opcao.isCurrent && (
                      <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Atual
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <FaSearch className="w-4 h-4 mx-auto mb-2 text-gray-400" />
                <span className="text-sm">
                  {searchTerm ? 'Nenhuma semana encontrada' : 'Nenhuma semana disponível'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SemanaAbastecimentoFilter;
