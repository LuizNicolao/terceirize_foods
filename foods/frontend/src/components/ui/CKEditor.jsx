import React, { useEffect, useRef, useState } from 'react';

/**
 * Componente wrapper para CKEditor 4 - Abordagem simplificada
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
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Carregar script do CKEditor dinamicamente
  useEffect(() => {
    // Se já está carregado, marcar como carregado
    if (typeof window.CKEDITOR !== 'undefined') {
      setScriptLoaded(true);
      return;
    }

    // Verificar se o script já está sendo carregado
    const existingScript = document.querySelector('script[src*="ckeditor.js"]');
    if (existingScript) {
      existingScript.onload = () => setScriptLoaded(true);
      existingScript.onerror = () => console.error('Erro ao carregar CKEditor');
      return;
    }

    // Função para verificar se um arquivo existe via fetch
    const checkFileExists = async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          return contentType?.includes('javascript') || contentType?.includes('text/plain');
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const getResponse = await fetch(url, { method: 'GET', cache: 'no-cache', signal: controller.signal });
        clearTimeout(timeout);
        if (getResponse.ok) {
          const text = await getResponse.text();
          return !text.trim().startsWith('<') && (text.includes('CKEDITOR') || text.includes('function'));
        }
        return false;
      } catch (error) {
        return false;
      }
    };
    
    // Função para carregar o script quando encontrar o caminho correto
    const loadCKEditorScript = async (basePath) => {
      const possiblePaths = [
        `${basePath}/ckeditor/ckeditor.js`,
        `/foods/ckeditor/ckeditor.js`,
        `/ckeditor/ckeditor.js`,
        `${window.location.origin}${basePath}/ckeditor/ckeditor.js`,
        `${window.location.origin}/foods/ckeditor/ckeditor.js`,
        `${window.location.origin}/ckeditor/ckeditor.js`
      ];
      
      for (let i = 0; i < possiblePaths.length; i++) {
        const path = possiblePaths[i];
        const exists = await checkFileExists(path);
        if (exists) {
          const detectedBasePath = path.includes('/foods') ? '/foods' : '';
          window.CKEDITOR_BASEPATH = `${detectedBasePath}/ckeditor/`;
          
          const script = document.createElement('script');
          script.src = path;
          script.async = true;
          script.onload = () => setScriptLoaded(true);
          script.onerror = () => console.error('Erro ao carregar CKEditor');
          document.head.appendChild(script);
          return;
        }
      }
      console.error('CKEditor não encontrado em nenhum dos caminhos testados');
    };
    
    // Detectar caminho base
    const getBasePath = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/foods')) {
        return '/foods';
      }
      return '';
    };
    
    const basePath = getBasePath();
    loadCKEditorScript(basePath);
  }, []);

  // Inicializar editor quando script estiver carregado
  useEffect(() => {
    if (!scriptLoaded || typeof window.CKEDITOR === 'undefined') {
      return;
    }

    // Se já existe uma instância, não recriar
    if (editorInstanceRef.current) {
      return;
    }

    // Aguardar DOM estar pronto
    const initTimeout = setTimeout(() => {
      if (!containerRef.current || !document.contains(containerRef.current)) {
        return;
      }

      // Criar textarea se não existir
      if (!editorRef.current) {
        const textarea = document.createElement('textarea');
        textarea.name = name || 'ckeditor';
        textarea.id = `ckeditor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        textarea.setAttribute('data-ckeditor', 'true');
        containerRef.current.appendChild(textarea);
        editorRef.current = textarea;
      }

      // Verificar se elemento está no DOM
      if (!editorRef.current || !document.contains(editorRef.current)) {
        return;
      }

      // Destruir instância existente se houver (por ID)
      if (editorRef.current.id && window.CKEDITOR.instances[editorRef.current.id]) {
        try {
          const existing = window.CKEDITOR.instances[editorRef.current.id];
          if (existing && existing.status !== 'destroyed') {
            existing.destroy(true);
          }
          delete window.CKEDITOR.instances[editorRef.current.id];
        } catch (e) {
          // Ignorar erro
        }
      }

      // Configuração do editor
      const editorConfig = {
        language: 'pt-br',
        height,
        ...config
      };

      // Inicializar editor
      try {
        editorInstanceRef.current = window.CKEDITOR.replace(editorRef.current, editorConfig);
        
        // Configurar eventos
        if (onChange && editorInstanceRef.current) {
          editorInstanceRef.current.on('change', () => {
            if (editorInstanceRef.current && editorInstanceRef.current.status !== 'destroyed') {
              const data = editorInstanceRef.current.getData();
              onChange({
                target: {
                  name: name || 'ckeditor',
                  value: data
                }
              });
            }
          });
        }

        // Quando editor estiver pronto, definir valor inicial
        editorInstanceRef.current.on('instanceReady', () => {
          setTimeout(() => {
            if (editorInstanceRef.current && editorInstanceRef.current.status !== 'destroyed') {
              try {
                const valueToSet = value || '';
                const currentData = editorInstanceRef.current.getData() || '';
                if (valueToSet !== currentData) {
                  editorInstanceRef.current.setData(valueToSet);
                }
                if (name && editorInstanceRef.current) {
                  editorInstanceRef.current.name = name;
                }
              } catch (e) {
                console.warn('Erro ao definir valor inicial:', e);
              }
            }
          }, 100);
        });
      } catch (error) {
        console.error('Erro ao inicializar CKEditor:', error);
        editorInstanceRef.current = null;
      }
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(initTimeout);
      
      if (editorInstanceRef.current) {
        try {
          if (editorInstanceRef.current.status !== 'destroyed') {
            editorInstanceRef.current.destroy(true);
          }
        } catch (e) {
          // Ignorar erro
        }
        editorInstanceRef.current = null;
      }

      if (editorRef.current && editorRef.current.id && window.CKEDITOR && window.CKEDITOR.instances) {
        try {
          delete window.CKEDITOR.instances[editorRef.current.id];
        } catch (e) {
          // Ignorar
        }
      }

      if (editorRef.current && editorRef.current.parentNode) {
        try {
          editorRef.current.parentNode.removeChild(editorRef.current);
        } catch (e) {
          // Ignorar
        }
        editorRef.current = null;
      }
    };
  }, [scriptLoaded, name, height, config, onChange]);

  // Atualizar valor quando prop mudar
  useEffect(() => {
    if (editorInstanceRef.current && editorInstanceRef.current.status !== 'destroyed') {
      try {
        const currentData = editorInstanceRef.current.getData();
        if (value !== currentData) {
          editorInstanceRef.current.setData(value || '');
        }
      } catch (e) {
        // Ignorar erro
      }
    }
  }, [value]);

  // Atualizar estado disabled
  useEffect(() => {
    if (editorInstanceRef.current && editorInstanceRef.current.status !== 'destroyed') {
      if (disabled) {
        editorInstanceRef.current.setReadOnly(true);
      } else {
        editorInstanceRef.current.setReadOnly(false);
      }
    }
  }, [disabled]);

  if (!scriptLoaded) {
    return (
      <div 
        ref={containerRef} 
        className={`ckeditor-wrapper ${className} flex items-center justify-center bg-gray-50 border border-gray-200 rounded`}
        style={{ minHeight: `${height}px` }}
      >
        <div className="text-gray-500 text-sm">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`ckeditor-wrapper ${className}`}
      style={{ minHeight: `${height}px` }}
    />
  );
};

export default CKEditor;
