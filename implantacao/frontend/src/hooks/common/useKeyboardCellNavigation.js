import { useCallback } from 'react';

/**
 * Hook para navegação por teclado entre células de uma tabela
 * 
 * @param {Object} config - Configuração da navegação
 * @param {number} config.totalRows - Número total de linhas
 * @param {number} config.totalCols - Número total de colunas editáveis por linha
 * @param {string} config.dataAttributePrefix - Prefixo para data attributes (ex: 'produto', 'tipo')
 * @param {Function} config.getNextCellSelector - Função que retorna o seletor do próximo input
 * 
 * @returns {Object} - Handlers e funções de navegação
 */
export const useKeyboardCellNavigation = ({
  totalRows,
  totalCols,
  dataAttributePrefix = 'cell',
  getNextCellSelector
}) => {
  /**
   * Navega para a próxima célula baseado na direção
   */
  const navigateCell = useCallback((direction, currentRowIndex, currentColIndex) => {
    let nextRowIndex = currentRowIndex;
    let nextColIndex = currentColIndex;
    
    switch (direction) {
      case 'ArrowRight':
        // Próxima célula à direita (mesma linha)
        if (currentColIndex < totalCols - 1) {
          nextColIndex = currentColIndex + 1;
        } else {
          return; // Já está na última coluna
        }
        break;
        
      case 'ArrowLeft':
        // Célula anterior à esquerda (mesma linha)
        if (currentColIndex > 0) {
          nextColIndex = currentColIndex - 1;
        } else {
          return; // Já está na primeira coluna
        }
        break;
        
      case 'ArrowDown':
        // Próxima célula abaixo (mesma coluna)
        if (currentRowIndex < totalRows - 1) {
          nextRowIndex = currentRowIndex + 1;
        } else {
          return; // Já está na última linha
        }
        break;
        
      case 'ArrowUp':
        // Célula acima (mesma coluna)
        if (currentRowIndex > 0) {
          nextRowIndex = currentRowIndex - 1;
        } else {
          return; // Já está na primeira linha
        }
        break;
    }
    
    // Encontrar o input correspondente
    setTimeout(() => {
      let selector = '';
      
      if (getNextCellSelector) {
        // Usar função customizada se fornecida
        selector = getNextCellSelector(nextRowIndex, nextColIndex);
      } else {
        // Usar padrão baseado em data attributes
        selector = `input[data-${dataAttributePrefix}-row="${nextRowIndex}"][data-${dataAttributePrefix}-col="${nextColIndex}"]`;
      }
      
      const targetInput = document.querySelector(selector);
      if (targetInput) {
        targetInput.focus();
        targetInput.select();
      }
    }, 0);
  }, [totalRows, totalCols, dataAttributePrefix, getNextCellSelector]);
  
  /**
   * Handler para eventos de teclado
   */
  const handleKeyNavigation = useCallback((e, rowIndex, colIndex) => {
    const key = e.key;
    
    // Se for Tab ou Enter, deixar comportamento padrão
    if (key === 'Tab' || key === 'Enter') {
      return;
    }
    
    // Se for seta, navegar
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
      e.stopPropagation();
      navigateCell(key, rowIndex, colIndex);
      return false;
    }
  }, [navigateCell]);
  
  /**
   * Handler para bloquear scroll do mouse
   */
  const handleWheelBlock = useCallback((e) => {
    // Bloquear scroll quando o input está focado
    if (e.target === document.activeElement) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, []);
  
  return {
    handleKeyNavigation,
    handleWheelBlock,
    navigateCell
  };
};

/**
 * Hook específico para navegação em tabelas com tipos e ajuste separados
 * (como NecessidadeProdutosTable)
 */
export const useKeyboardCellNavigationWithAjuste = ({
  totalRows,
  totalTipos,
  dataAttributePrefix = 'produto'
}) => {
  const navigateCell = useCallback((direction, produtoIndex, tipoIndex, isAjuste) => {
    let nextProdutoIndex = produtoIndex;
    let nextTipoIndex = tipoIndex;
    let nextIsAjuste = isAjuste;
    
    switch (direction) {
      case 'ArrowRight':
        // Próxima célula à direita (mesma linha)
        if (isAjuste) {
          return; // Já está na última coluna
        }
        if (tipoIndex < totalTipos - 1) {
          nextTipoIndex = tipoIndex + 1;
        } else {
          nextIsAjuste = true;
          nextTipoIndex = -1;
        }
        break;
        
      case 'ArrowLeft':
        // Célula anterior à esquerda (mesma linha)
        if (isAjuste) {
          nextIsAjuste = false;
          nextTipoIndex = totalTipos - 1;
        } else if (tipoIndex > 0) {
          nextTipoIndex = tipoIndex - 1;
        } else {
          return; // Já está na primeira coluna
        }
        break;
        
      case 'ArrowDown':
        // Próxima célula abaixo (mesma coluna)
        if (produtoIndex < totalRows - 1) {
          nextProdutoIndex = produtoIndex + 1;
        } else {
          return; // Já está na última linha
        }
        break;
        
      case 'ArrowUp':
        // Célula acima (mesma coluna)
        if (produtoIndex > 0) {
          nextProdutoIndex = produtoIndex - 1;
        } else {
          return; // Já está na primeira linha
        }
        break;
    }
    
    // Encontrar o input correspondente usando data attributes
    setTimeout(() => {
      let selector = '';
      if (nextIsAjuste) {
        selector = `input[data-${dataAttributePrefix}-index="${nextProdutoIndex}"][data-is-ajuste="true"]`;
      } else {
        selector = `input[data-${dataAttributePrefix}-index="${nextProdutoIndex}"][data-tipo-index="${nextTipoIndex}"]`;
      }
      
      const targetInput = document.querySelector(selector);
      if (targetInput) {
        targetInput.focus();
        targetInput.select();
      }
    }, 0);
  }, [totalRows, totalTipos, dataAttributePrefix]);
  
  const handleKeyNavigation = useCallback((e, produtoIndex, tipoIndex, isAjuste = false) => {
    const key = e.key;
    
    // Se for Tab ou Enter, deixar comportamento padrão
    if (key === 'Tab' || key === 'Enter') {
      return;
    }
    
    // Se for seta, navegar
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
      e.stopPropagation();
      navigateCell(key, produtoIndex, tipoIndex, isAjuste);
      return false;
    }
  }, [navigateCell]);
  
  const handleWheelBlock = useCallback((e) => {
    // Bloquear scroll quando o input está focado
    if (e.target === document.activeElement) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, []);
  
  return {
    handleKeyNavigation,
    handleWheelBlock,
    navigateCell
  };
};

