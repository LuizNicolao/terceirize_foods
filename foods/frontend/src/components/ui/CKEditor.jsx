import React, { useEffect, useRef, useState } from 'react';

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

    // Carregar o script dinamicamente
    const script = document.createElement('script');
    
    // Detectar caminho base dinamicamente
    const getBasePath = () => {
      // Primeiro, tentar detectar do caminho atual
      const pathname = window.location.pathname;
      
      // Se estiver em /foods/..., usar /foods como base
      if (pathname.startsWith('/foods')) {
        return '/foods';
      }
      
      // Se não, tentar usar o caminho até a primeira barra (após a raiz)
      const parts = pathname.split('/').filter(p => p);
      if (parts.length > 0 && parts[0] !== 'foods') {
        // Pode estar em outro contexto, usar o primeiro segmento
        return '/' + parts[0];
      }
      
      // Default: raiz
      return '';
    };
    
    const basePath = getBasePath();
    
    // Construir caminho do CKEditor usando caminho absoluto
    // Tentar diferentes caminhos possíveis
    const possiblePaths = [
      `${basePath}/ckeditor/ckeditor.js`,
      `${window.location.origin}${basePath}/ckeditor/ckeditor.js`,
      `/ckeditor/ckeditor.js`,
      `${window.location.origin}/ckeditor/ckeditor.js`
    ];
    
    // Usar o primeiro caminho, mas adicionar fallback
    const ckeditorPath = possiblePaths[0];
    
    // Definir CKEDITOR_BASEPATH antes de carregar o script
    window.CKEDITOR_BASEPATH = `${basePath}/ckeditor/`;
    
    script.src = ckeditorPath;
    script.async = true;
    script.onload = () => {
      // Aguardar um pouco para garantir que CKEDITOR foi inicializado
      setTimeout(() => {
        // Verificar se CKEDITOR foi carregado corretamente
        if (typeof window.CKEDITOR !== 'undefined') {
          // Garantir que o basePath está configurado
          if (!window.CKEDITOR.basePath || window.CKEDITOR.basePath !== window.CKEDITOR_BASEPATH) {
            window.CKEDITOR.basePath = window.CKEDITOR_BASEPATH;
          }
          // Carregar config.js se existir
          const configScript = document.createElement('script');
          configScript.src = `${basePath}/ckeditor/config.js`;
          configScript.onerror = () => {
            // Não é crítico se config.js não existir
            console.warn('config.js do CKEditor não encontrado, usando configuração padrão');
          };
          document.head.appendChild(configScript);
          
          setScriptLoaded(true);
        } else {
          console.error('CKEditor não foi inicializado após carregar o script');
          // Tentar próximo caminho
          const tryNextScript = () => {
            const nextScript = document.createElement('script');
            if (possiblePaths.length > 1) {
              nextScript.src = possiblePaths[1];
              nextScript.async = true;
              nextScript.onload = () => {
                setTimeout(() => {
                  if (typeof window.CKEDITOR !== 'undefined') {
                    setScriptLoaded(true);
                  }
                }, 100);
              };
              nextScript.onerror = () => {
                console.error('Todas as tentativas de carregar CKEditor falharam');
              };
              document.head.appendChild(nextScript);
            }
          };
          setTimeout(tryNextScript, 500);
        }
      }, 100);
    };
    let attemptIndex = 0;
    const tryLoadScript = (pathIndex = 0) => {
      if (pathIndex >= possiblePaths.length) {
        console.error('❌ Todos os caminhos falharam. Verifique se o arquivo está em /public/ckeditor/ckeditor.js');
        console.error('📋 Caminhos tentados:', possiblePaths);
        console.error('📍 Caminho atual da página:', window.location.pathname);
        console.error('🌐 Origem:', window.location.origin);
        return;
      }
      
      const currentPath = possiblePaths[pathIndex];
      console.log(`🔄 Tentando carregar CKEditor de: ${currentPath} (tentativa ${pathIndex + 1}/${possiblePaths.length})`);
      
      const newScript = document.createElement('script');
      newScript.src = currentPath;
      newScript.async = true;
      
      newScript.onload = () => {
        setTimeout(() => {
          if (typeof window.CKEDITOR !== 'undefined') {
            const usedBasePath = pathIndex === 0 ? basePath : (currentPath.includes('/foods') ? '/foods' : '');
            window.CKEDITOR_BASEPATH = `${usedBasePath}/ckeditor/`;
            if (!window.CKEDITOR.basePath || window.CKEDITOR.basePath !== window.CKEDITOR_BASEPATH) {
              window.CKEDITOR.basePath = window.CKEDITOR_BASEPATH;
            }
            const configScript = document.createElement('script');
            configScript.src = `${usedBasePath}/ckeditor/config.js`;
            configScript.onerror = () => {
              console.warn('config.js do CKEditor não encontrado, usando configuração padrão');
            };
            document.head.appendChild(configScript);
            setScriptLoaded(true);
          } else {
            console.error('CKEditor não foi inicializado após carregar o script');
            tryLoadScript(pathIndex + 1);
          }
        }, 100);
      };
      
      newScript.onerror = () => {
        console.error(`❌ Falha ao carregar de: ${currentPath}`);
        tryLoadScript(pathIndex + 1);
      };
      
      document.head.appendChild(newScript);
    };
    
    script.onerror = () => {
      tryLoadScript(1); // Começar do segundo caminho
    };
    document.head.appendChild(script);

    return () => {
      // Limpar script se necessário
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Aguardar o script carregar
    if (!scriptLoaded || typeof window.CKEDITOR === 'undefined') {
      return;
    }

    // Se o editor já existe, não recriar
    if (editorInstanceRef.current) {
      return;
    }

    // Criar elemento textarea para o editor
    if (!editorRef.current && containerRef.current) {
      const textarea = document.createElement('textarea');
      textarea.name = name || 'ckeditor';
      textarea.id = `ckeditor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      containerRef.current.appendChild(textarea);
      editorRef.current = textarea;
    }

    if (!editorRef.current || !containerRef.current) {
      return;
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
        try {
          editorInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Erro ao destruir editor:', e);
        }
        editorInstanceRef.current = null;
      }
    };
  }, [scriptLoaded]); // Recriar quando o script carregar

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

