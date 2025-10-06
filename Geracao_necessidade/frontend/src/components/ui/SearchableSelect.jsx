import React, { useState, useEffect, useRef } from 'react';
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
  maxHeight = "200px"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const [mobileMaxHeight, setMobileMaxHeight] = useState('200px');
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
      setSearchTerm('');
    }
  }, [value, options]);

  // Detectar dispositivos móveis e ajustar posição do dropdown
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ajustar posição do dropdown em dispositivos móveis
  useEffect(() => {
    if (isOpen && isMobile && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calcular altura máxima disponível (mais conservadora)
      const availableHeight = viewportHeight - rect.bottom - 10; // 10px de margem
      const maxHeight = Math.min(Math.max(availableHeight, 150), 200); // Mínimo 150px, máximo 200px
      setMobileMaxHeight(`${maxHeight}px`);
      
      // Só mudar para 'top' se realmente não couber
      if (rect.bottom + 200 > viewportHeight - 50) { // 50px de margem de segurança
        setDropdownPosition('top');
        const topAvailableHeight = rect.top - 10;
        const topMaxHeight = Math.min(Math.max(topAvailableHeight, 150), 200);
        setMobileMaxHeight(`${topMaxHeight}px`);
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen, isMobile]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ajustar posição quando teclado virtual aparecer em dispositivos móveis
  useEffect(() => {
    if (isMobile) {
      const handleResize = () => {
        // Recalcular posição quando a viewport mudar (teclado virtual)
        if (isOpen && containerRef.current) {
          const container = containerRef.current;
          const rect = container.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const dropdownHeight = 200;
          
          // Calcular altura máxima disponível
          const availableHeight = viewportHeight - rect.bottom - 20;
          const maxHeight = Math.min(availableHeight, 200);
          setMobileMaxHeight(`${maxHeight}px`);
          
          // Ajustar posição se necessário
          if (rect.bottom + dropdownHeight > viewportHeight) {
            setDropdownPosition('top');
            const topAvailableHeight = rect.top - 20;
            const topMaxHeight = Math.min(topAvailableHeight, 200);
            setMobileMaxHeight(`${topMaxHeight}px`);
          } else {
            setDropdownPosition('bottom');
          }
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMobile, isOpen]);

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
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleTouchStart = (e) => {
    // Permitir touch dentro do dropdown
    e.stopPropagation();
  };

  const handleTouchMove = (e) => {
    // Permitir scroll dentro do dropdown
    e.stopPropagation();
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
    <div className={`w-full ${className}`}>
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

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div 
            ref={dropdownRef}
            className={`absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden ${
              dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
          >
            {/* Lista de opções */}
            <div 
              className="overflow-y-auto" 
              style={{ 
                maxHeight: isMobile ? mobileMaxHeight : maxHeight,
                WebkitOverflowScrolling: 'touch', // Scroll suave no iOS
                overscrollBehavior: 'contain' // Evita scroll da página
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
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
          </div>
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