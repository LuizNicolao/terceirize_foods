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

    // Função para verificar se um arquivo existe via fetch
    const checkFileExists = async (url) => {
      try {
        // Tentar HEAD primeiro
        const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          // Aceitar javascript ou text/javascript ou application/javascript
          return contentType?.includes('javascript') || contentType?.includes('text/plain');
        }
        // Se HEAD falhar, tentar GET (alguns servidores não suportam HEAD)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const getResponse = await fetch(url, { method: 'GET', cache: 'no-cache', signal: controller.signal });
        clearTimeout(timeout);
        if (getResponse.ok) {
          const contentType = getResponse.headers.get('content-type');
          // Verificar se é JavaScript (mesmo que venha como text/plain)
          const text = await getResponse.text();
          // Verificar se começa com código JavaScript válido (não HTML)
          return !text.trim().startsWith('<') && (contentType?.includes('javascript') || text.includes('CKEDITOR') || text.includes('function'));
        }
        return false;
      } catch (error) {
        // Se falhar, assumir que não existe (mas não é crítico)
        console.warn(`Verificação de ${url} falhou:`, error.message);
        return false;
      }
    };
    
    // Função para carregar o script quando encontrar o caminho correto
    const loadCKEditorScript = async (basePath) => {
      // Baseado no padrão usado no sistema (logo usa /foods/logo-small.png)
      const possiblePaths = [
        `${basePath}/ckeditor/ckeditor.js`,  // /foods/ckeditor/ckeditor.js
        `/foods/ckeditor/ckeditor.js`,      // Forçar /foods mesmo se basePath estiver vazio
        `/ckeditor/ckeditor.js`,            // Raiz
        `${window.location.origin}${basePath}/ckeditor/ckeditor.js`,
        `${window.location.origin}/foods/ckeditor/ckeditor.js`,
        `${window.location.origin}/ckeditor/ckeditor.js`
      ];
      
      // Verificar cada caminho até encontrar um válido
      for (let i = 0; i < possiblePaths.length; i++) {
        const path = possiblePaths[i];
        console.log(`🔍 Verificando: ${path}`);
        
        const exists = await checkFileExists(path);
        if (exists) {
          console.log(`✅ Arquivo encontrado em: ${path}`);
          
          // Definir CKEDITOR_BASEPATH antes de carregar
          const detectedBasePath = path.includes('/foods') ? '/foods' : '';
          window.CKEDITOR_BASEPATH = `${detectedBasePath}/ckeditor/`;
          
          // Carregar o script
          const script = document.createElement('script');
          script.src = path;
          script.async = true;
          
          script.onload = () => {
            setTimeout(() => {
              if (typeof window.CKEDITOR !== 'undefined') {
                window.CKEDITOR.basePath = window.CKEDITOR_BASEPATH;
                const configScript = document.createElement('script');
                configScript.src = `${detectedBasePath}/ckeditor/config.js`;
                configScript.onerror = () => {
                  console.warn('config.js não encontrado, usando padrão');
                };
                document.head.appendChild(configScript);
                setScriptLoaded(true);
              } else {
                console.error('CKEditor não inicializado após carregar');
              }
            }, 100);
          };
          
          script.onerror = () => {
            console.error(`❌ Erro ao executar script de: ${path}`);
            if (i < possiblePaths.length - 1) {
              loadCKEditorScript(basePath); // Tentar próximo
            }
          };
          
          document.head.appendChild(script);
          return; // Sair quando encontrar
        }
      }
      
      // Se nenhum caminho funcionou, tentar carregar mesmo assim (pode ser problema de CORS na verificação)
      console.warn('⚠️ Verificação falhou, tentando carregar mesmo assim...');
      const fallbackPath = `/foods/ckeditor/ckeditor.js`;
      console.log(`🔄 Tentando carregar direto de: ${fallbackPath}`);
      
      window.CKEDITOR_BASEPATH = `/foods/ckeditor/`;
      const script = document.createElement('script');
      script.src = fallbackPath;
      script.async = true;
      
      script.onload = () => {
        setTimeout(() => {
          if (typeof window.CKEDITOR !== 'undefined') {
            window.CKEDITOR.basePath = window.CKEDITOR_BASEPATH;
            const configScript = document.createElement('script');
            configScript.src = `/foods/ckeditor/config.js`;
            configScript.onerror = () => {
              console.warn('config.js não encontrado, usando padrão');
            };
            document.head.appendChild(configScript);
            setScriptLoaded(true);
            console.log('✅ CKEditor carregado com sucesso!');
          } else {
            console.error('❌ CKEditor não encontrado em nenhum dos caminhos:', possiblePaths);
            console.error('💡 SOLUÇÃO: Faça rebuild do frontend no servidor:');
            console.error('   1. cd foods/frontend');
            console.error('   2. npm run build');
            console.error('   3. Reinicie o container/servidor');
          }
        }, 100);
      };
      
      script.onerror = () => {
        console.error('❌ CKEditor não encontrado em nenhum dos caminhos:', possiblePaths);
        console.error('💡 SOLUÇÃO: Os arquivos do CKEditor precisam estar no build.');
        console.error('   Execute no servidor:');
        console.error('   1. cd ~/terceirize_foods/foods/frontend');
        console.error('   2. git pull origin main');
        console.error('   3. npm run build');
        console.error('   4. Reinicie o container Docker (ou servidor)');
      };
      
      document.head.appendChild(script);
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

