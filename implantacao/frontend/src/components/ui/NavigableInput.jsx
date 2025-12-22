import React from 'react';
import { useKeyboardCellNavigation } from '../../hooks/common/useKeyboardCellNavigation';

/**
 * Componente Input com navegação por teclado entre células
 * 
 * @param {Object} props
 * @param {number} props.rowIndex - Índice da linha (0-based)
 * @param {number} props.colIndex - Índice da coluna (0-based)
 * @param {number} props.totalRows - Número total de linhas na tabela
 * @param {number} props.totalCols - Número total de colunas editáveis por linha
 * @param {string} props.dataAttributePrefix - Prefixo para data attributes (opcional)
 * @param {Function} props.getNextCellSelector - Função customizada para encontrar próximo input (opcional)
 * @param {string} props.type - Tipo do input (padrão: 'number')
 * @param {Object} props.inputProps - Props adicionais para o input
 * 
 * @example
 * <NavigableInput
 *   rowIndex={0}
 *   colIndex={0}
 *   totalRows={10}
 *   totalCols={3}
 *   value={value}
 *   onChange={onChange}
 *   {...otherProps}
 * />
 */
const NavigableInput = ({
  rowIndex,
  colIndex,
  totalRows,
  totalCols,
  dataAttributePrefix = 'cell',
  getNextCellSelector,
  type = 'number',
  className = '',
  onKeyDown: customOnKeyDown,
  onWheel: customOnWheel,
  ...inputProps
}) => {
  const { handleKeyNavigation, handleWheelBlock } = useKeyboardCellNavigation({
    totalRows,
    totalCols,
    dataAttributePrefix,
    getNextCellSelector
  });
  
  const handleKeyDown = (e) => {
    // Chamar handler customizado primeiro, se existir
    if (customOnKeyDown) {
      customOnKeyDown(e);
    }
    
    // Se não foi prevenido, usar navegação padrão
    if (!e.defaultPrevented) {
      handleKeyNavigation(e, rowIndex, colIndex);
    }
  };
  
  const handleWheel = (e) => {
    // Chamar handler customizado primeiro, se existir
    if (customOnWheel) {
      customOnWheel(e);
    }
    
    // Se não foi prevenido, usar bloqueio padrão
    if (!e.defaultPrevented) {
      handleWheelBlock(e);
    }
  };
  
  // Classes padrão para remover spinners
  const defaultClasses = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
  const finalClassName = `${defaultClasses} ${className}`.trim();
  
  // Criar data attributes dinamicamente
  const dataAttributes = {
    [`data-${dataAttributePrefix}-row`]: rowIndex,
    [`data-${dataAttributePrefix}-col`]: colIndex
  };
  
  return (
    <input
      type={type}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      {...dataAttributes}
      className={finalClassName}
      {...inputProps}
    />
  );
};

export default NavigableInput;

