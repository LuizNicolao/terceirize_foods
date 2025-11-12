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

  const normalizePluginsList = (...lists) => {
    const plugins = new Set();
    
    lists.forEach((list) => {
      if (!list) return;

      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item && typeof item === 'string') {
            plugins.add(item.trim());
          }
        });
        return;
      }

      if (typeof list === 'string') {
        list
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => plugins.add(item));
      }
    });

    return Array.from(plugins).join(',');
  };

  const getBasePath = () => {
    if (typeof window === 'undefined') {
      return '/ckeditor/';
    }

    const publicUrlEnv = (process.env.PUBLIC_URL || '').trim();

    if (publicUrlEnv && publicUrlEnv !== '.') {
      const normalized = publicUrlEnv.endsWith('/')
        ? publicUrlEnv.slice(0, -1)
        : publicUrlEnv;
      if (/^https?:\/\//i.test(normalized)) {
        return `${normalized}/ckeditor/`;
      }
      const withLeadingSlash = normalized.startsWith('/')
        ? normalized
        : `/${normalized}`;
      return `${withLeadingSlash}/ckeditor/`;
    }

    const pathname = window.location?.pathname || '';
    if (pathname.startsWith('/foods')) {
      return '/foods/ckeditor/';
    }

    return '/ckeditor/';
  };

  const [basePath] = useState(() => getBasePath());
  const getSkinConfig = () => {
    const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    return `moono-lisa,${normalizedBase}skins/moono-lisa/`;
  };

  // Carregar script do CKEditor dinamicamente
  useEffect(() => {
    // Se já está carregado, marcar como carregado
    if (typeof window.CKEDITOR !== 'undefined') {
      if (!window.CKEDITOR_BASEPATH) {
        window.CKEDITOR_BASEPATH = basePath;
      }
      setScriptLoaded(true);
      return;
    }

    window.CKEDITOR_BASEPATH = basePath;

    const scriptSrc = `${basePath}ckeditor.js`;

    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existingScript) {
      existingScript.onload = () => setScriptLoaded(true);
      existingScript.onerror = () => console.error('Erro ao carregar CKEditor');
      return;
    }

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error(`Erro ao carregar CKEditor a partir de ${scriptSrc}`);
    document.head.appendChild(script);
  }, [basePath]);

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
      const defaultRemovePlugins = [
        'exportpdf',
        'uploadimage',
        'easyimage',
        'cloudservices'
      ];

      const editorConfig = {
        language: 'pt-br',
        height,
        ...config
      };

      editorConfig.removePlugins = normalizePluginsList(
        defaultRemovePlugins,
        config?.removePlugins,
        editorConfig?.removePlugins
      );

      editorConfig.skin = editorConfig.skin || getSkinConfig();
      editorConfig.baseHref = editorConfig.baseHref || window.location.origin;
      editorConfig.contentsCss = editorConfig.contentsCss || [
        `${basePath}contents.css`,
        `${basePath}skins/moono-lisa/editor.css`,
        `${basePath}skins/moono-lisa/editor_gecko.css`,
        `${basePath}skins/moono-lisa/editor_ie.css`,
        `${basePath}skins/moono-lisa/editor_iequirks.css`,
        `${basePath}skins/moono-lisa/editor_ie8.css`
      ];

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
