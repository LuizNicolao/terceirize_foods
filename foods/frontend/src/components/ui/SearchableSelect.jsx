import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';

const SearchableSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Digite para buscar...",
  loading = false,
  disabled = false,
  required = false,
  error,
  className = "",
  size = "md",
  showClearButton = true,
  filterBy = "label", // campo para filtrar (pode ser 'label', 'value', ou função customizada)
  renderOption = null, // função customizada para renderizar opções
  maxHeight = "200px",
  onSearchChange = null // callback para busca no backend
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedOption, setSelectedOption] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Tamanhos do componente
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  // Filtrar opções baseado no termo de busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter(option => {
      if (typeof filterBy === 'function') {
        return filterBy(option, searchTerm);
      }
      
      if (typeof filterBy === 'string') {
        const fieldValue = option[filterBy];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (typeof fieldValue === 'number') {
          return fieldValue.toString().includes(searchTerm);
        }
      }
      
      // Fallback: buscar em label e value
      const labelMatch = option.label?.toLowerCase().includes(searchTerm.toLowerCase());
      const valueMatch = option.value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      return labelMatch || valueMatch;
    });

    setFilteredOptions(filtered);
  }, [searchTerm, options, filterBy]);

  // Atualizar opção selecionada quando value mudar
  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.value === value);
      setSelectedOption(option);
      if (option) {
        setSearchTerm(option.label || option.value);
      }
    } else {
      setSelectedOption(null);
      // Só resetar searchTerm se o dropdown estiver fechado (usuário não está digitando)
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  }, [value, options, isOpen]);

  // Calcular posição do dropdown quando abrir
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const updatePosition = () => {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      };
      
      updatePosition();
      
      // Atualizar posição em scroll ou resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        // Verificar se o clique foi no portal do dropdown
        const dropdownElement = document.querySelector('[data-dropdown-portal]');
        if (dropdownElement && dropdownElement.contains(event.target)) {
          return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setSearchTerm(option.label || option.value);
    onChange(option.value);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedOption(null);
    setSearchTerm('');
    onChange('');
    setIsOpen(false);
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setIsOpen(true);
    
    // Chamar callback para busca no backend se fornecido
    if (onSearchChange && typeof onSearchChange === 'function') {
      onSearchChange(newSearchTerm);
    }
  };

  const renderOptionItem = (option) => {
    if (renderOption) {
      return renderOption(option);
    }
    
    return (
      <div className="flex items-center justify-between">
        <span className="font-medium">{option.label || option.value}</span>
        {option.description && (
          <span className="text-xs text-gray-500 ml-2">{option.description}</span>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={containerRef}>
        {/* Campo de entrada */}
        <div
          className={`
            relative cursor-pointer border border-gray-300 rounded-lg transition-colors duration-200
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
            ${isOpen ? 'border-green-500 ring-2 ring-green-500 ring-opacity-50' : ''}
            ${error ? 'border-red-500' : ''}
            ${sizes[size]}
          `}
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {isOpen ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={placeholder}
                  className="w-full bg-transparent border-none outline-none text-sm"
                  disabled={disabled}
                />
              ) : (
                <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
                  {selectedOption ? (selectedOption.label || selectedOption.value) : placeholder}
                </span>
              )}
            </div>
            
            <div className="flex items-center ml-2">
              {showClearButton && selectedOption && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Dropdown via Portal - renderiza fora da hierarquia para evitar overflow clipping */}
        {isOpen && !disabled && typeof document !== 'undefined' && createPortal(
          <div 
            data-dropdown-portal
            className="fixed z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            {/* Lista de opções */}
            <div className="max-h-60 overflow-y-auto" style={{ maxHeight }}>
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <span className="text-sm">Carregando...</span>
                </div>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value || index}
                    className={`
                      px-4 py-3 cursor-pointer transition-colors duration-150
                      ${selectedOption?.value === option.value 
                        ? 'bg-green-50 border-l-4 border-l-green-500' 
                        : 'hover:bg-gray-50'
                      }
                      ${index < filteredOptions.length - 1 ? 'border-b border-gray-100' : ''}
                    `}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {renderOptionItem(option)}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <FaSearch className="w-4 h-4 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm">
                    {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma opção disponível'}
                  </span>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SearchableSelect;
