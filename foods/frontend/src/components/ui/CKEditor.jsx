import React, { useEffect, useRef } from 'react';

/**
 * Componente wrapper para CKEditor 4
 * 
 * @param {Object} props
 * @param {string} props.value - Valor inicial do editor
 * @param {Function} props.onChange - Callback quando o conteúdo muda
 * @param {string} props.name - Nome do campo (para formulários)
 * @param {boolean} props.disabled - Desabilita o editor
 * @param {string} props.className - Classes CSS adicionais
 * @param {number} props.height - Altura do editor em pixels
 * @param {Object} props.config - Configurações adicionais do CKEditor
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
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Verificar se CKEditor está disponível
    if (typeof window.CKEDITOR === 'undefined') {
      console.error('CKEditor não está carregado. Verifique se o script está incluído no index.html');
      return;
    }

    // Criar elemento textarea para o editor
    if (!editorRef.current) {
      const textarea = document.createElement('textarea');
      textarea.name = name || 'ckeditor';
      textarea.id = `ckeditor-${Date.now()}`;
      containerRef.current.appendChild(textarea);
      editorRef.current = textarea;
    }

    // Inicializar CKEditor
    const editorConfig = {
      language: 'pt-br',
      height,
      ...config
    };

    editorInstanceRef.current = window.CKEDITOR.replace(editorRef.current, editorConfig);

    // Configurar evento de mudança
    if (onChange) {
      editorInstanceRef.current.on('change', () => {
        const data = editorInstanceRef.current.getData();
        onChange({
          target: {
            name: name || 'ckeditor',
            value: data
          }
        });
      });

      editorInstanceRef.current.on('instanceReady', () => {
        // Definir valor inicial
        if (value) {
          editorInstanceRef.current.setData(value);
        }
        // Expor instância globalmente para acesso externo usando o name como identificador
        if (name && editorInstanceRef.current) {
          editorInstanceRef.current.name = name;
        }
      });
    }

    // Limpar ao desmontar
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, []); // Executar apenas uma vez na montagem

  // Atualizar valor quando prop value mudar
  useEffect(() => {
    if (editorInstanceRef.current && value !== editorInstanceRef.current.getData()) {
      editorInstanceRef.current.setData(value || '');
    }
  }, [value]);

  // Atualizar estado disabled
  useEffect(() => {
    if (editorInstanceRef.current) {
      if (disabled) {
        editorInstanceRef.current.setReadOnly(true);
      } else {
        editorInstanceRef.current.setReadOnly(false);
      }
    }
  }, [disabled]);

  return (
    <div 
      ref={containerRef} 
      className={`ckeditor-wrapper ${className}`}
      style={{ minHeight: `${height}px` }}
    />
  );
};

export default CKEditor;

