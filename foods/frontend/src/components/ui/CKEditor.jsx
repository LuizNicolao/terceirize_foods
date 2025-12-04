import React from 'react';

/**
 * Componente simples de textarea para substituir CKEditor
 * 
 * @param {Object} props
 * @param {string} props.value - Valor inicial do editor
 * @param {Function} props.onChange - Callback quando o conteúdo muda
 * @param {string} props.name - Nome do campo (para formulários)
 * @param {boolean} props.disabled - Desabilita o editor
 * @param {string} props.className - Classes CSS adicionais
 * @param {number} props.height - Altura do editor em pixels
 * @param {Object} props.config - Configurações adicionais (ignorado, mantido para compatibilidade)
 */
const CKEditor = ({ 
  value = '', 
  onChange, 
  name,
  disabled = false,
  className = '',
  height = 400,
  config = {}
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange({
        target: {
          name: name || 'ckeditor',
          value: e.target.value
        }
      });
    }
  };

  return (
    <div 
      className={`ckeditor-wrapper ${className}`}
      style={{ minHeight: `${height}px` }}
    >
      <textarea
        name={name || 'ckeditor'}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{ minHeight: `${height}px` }}
        placeholder="Digite o conteúdo HTML aqui..."
      />
    </div>
  );
};

export default CKEditor;
