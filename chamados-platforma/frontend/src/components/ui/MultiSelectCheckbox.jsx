import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';

/**
 * Componente de seleção múltipla com checkboxes
 */
const MultiSelectCheckbox = ({
  label,
  value = [], // Array de valores selecionados
  onChange,
  options = [],
  placeholder = "Selecione...",
  disabled = false,
  className = "",
  maxHeight = "200px"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filtrar opções baseado no termo de busca
  const filteredOptions = options.filter(option => {
    if (!searchTerm.trim()) return true;
    const label = option.label?.toLowerCase() || '';
    return label.includes(searchTerm.toLowerCase());
  });

  // Verificar se um valor está selecionado
  const isSelected = (optionValue) => {
    return Array.isArray(value) && value.includes(optionValue);
  };

  // Toggle de seleção
  const handleToggle = (optionValue) => {
    if (disabled) return;
    
    const currentValue = Array.isArray(value) ? value : [];
    let newValue;
    
    if (isSelected(optionValue)) {
      // Remover se já está selecionado
      newValue = currentValue.filter(v => v !== optionValue);
    } else {
      // Adicionar se não está selecionado
      newValue = [...currentValue, optionValue];
    }
    
    onChange(newValue);
  };

  // Selecionar todos
  const handleSelectAll = () => {
    if (disabled) return;
    const allValues = filteredOptions
      .filter(opt => opt.value && opt.value !== 'todos')
      .map(opt => opt.value);
    onChange(allValues);
  };

  // Limpar seleção
  const handleClear = () => {
    if (disabled) return;
    onChange([]);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Texto exibido no botão
  const getDisplayText = () => {
    if (!Array.isArray(value) || value.length === 0) {
      return placeholder;
    }
    if (value.length === 1) {
      const selected = options.find(opt => opt.value === value[0]);
      return selected?.label || `${value.length} selecionado`;
    }
    return `${value.length} selecionados`;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-sm border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-green-500 focus:border-green-500 
          transition-colors bg-white text-left
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${isOpen ? 'border-green-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={value.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
            {getDisplayText()}
          </span>
          <div className="flex items-center gap-2">
            {value.length > 0 && !disabled && (
              <FaTimes
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
            <FaChevronDown
              className={`text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ maxHeight, overflow: 'hidden' }}
        >
          {/* Campo de busca */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Botões de ação */}
          <div className="p-2 border-b border-gray-200 flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-green-600 hover:text-green-700 px-2 py-1"
            >
              Selecionar Todos
            </button>
            {value.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-600 hover:text-red-700 px-2 py-1"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Lista de opções */}
          <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 100px)` }}>
            {filteredOptions.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                Nenhuma opção encontrada
              </div>
            ) : (
              <div className="p-2">
                {filteredOptions
                  .filter(opt => opt.value !== 'todos') // Filtrar opção "todos" se existir
                  .map(option => {
                    const selected = isSelected(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`
                          flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50
                          ${selected ? 'bg-green-50' : ''}
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleToggle(option.value)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded flex-shrink-0"
                        />
                        <span className="text-sm text-gray-700 flex-1">{option.label}</span>
                      </label>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectCheckbox;

