import React, { useState, useEffect, useRef } from 'react';

/**
 * Componente wrapper para CKEditor 5
 * Carrega o editor dinamicamente para evitar problemas de SSR
 */
const CKEditorWrapper = ({ value, onChange, disabled, placeholder, editorRef: externalEditorRef, isOpen }) => {
  const editorInstanceRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Só inicializar se o componente estiver aberto/visível
    if (isOpen === false || isOpen === undefined) {
        // Destruir editor se o modal fechar
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy().catch(() => {});
        editorInstanceRef.current = null;
        if (externalEditorRef) {
          externalEditorRef.current = null;
        }
      }
      setIsLoading(true);
      setError(null);
      return;
    }

    let mounted = true;
    let editorInstance = null;
    let retryCount = 0;
    const maxRetries = 10;
    const retryDelay = 100;

    const waitForContainer = () => {
      return new Promise((resolve) => {
        const checkContainer = () => {
          if (containerRef.current) {
            resolve(true);
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(checkContainer, retryDelay);
          } else {
            resolve(false);
          }
        };
        checkContainer();
      });
    };

    const loadEditor = async () => {
      try {
        // Aguardar o container estar disponível
        const containerAvailable = await waitForContainer();
        
        if (!mounted || !containerAvailable || !containerRef.current) {
          setError('Erro: Container do editor não encontrado. Verifique se o modal está totalmente aberto.');
          setIsLoading(false);
          return;
        }
        
        // Importar CKEditor dinamicamente (CSS é incluído automaticamente pelo pacote)
        const CKEditorModule = await import('@ckeditor/ckeditor5-build-classic');
        
        // Tentar diferentes formas de acessar o ClassicEditor
        const ClassicEditor = CKEditorModule.default || CKEditorModule.ClassicEditor || CKEditorModule;
        
        if (!ClassicEditor || typeof ClassicEditor.create !== 'function') {
          throw new Error('ClassicEditor não encontrado ou não é uma função válida');
        }
        
        // Aguardar um pouco mais para garantir que o DOM está totalmente pronto
        await new Promise(resolve => setTimeout(resolve, 150));
        
        if (!mounted || !containerRef.current) {
          setIsLoading(false);
          return;
        }
        
        // Destruir editor anterior se existir
        if (editorInstanceRef.current) {
          editorInstanceRef.current.destroy().catch(() => {});
        }

        // Criar instância do editor
        editorInstance = await ClassicEditor.create(containerRef.current, {
          toolbar: {
            items: [
              'heading', '|',
              'bold', 'italic', '|',
              'link', '|',
              'bulletedList', 'numberedList', '|',
              'outdent', 'indent', '|',
              'insertTable', '|',
              'blockQuote', 'insertImage', '|',
              'undo', 'redo'
            ],
            shouldNotGroupWhenFull: true
          },
          table: {
            contentToolbar: [
              'tableColumn',
              'tableRow',
              'mergeTableCells'
            ]
          },
          placeholder: placeholder || 'Digite o HTML do template aqui...',
          language: 'pt-br'
        });

        if (!mounted) {
          editorInstance.destroy();
          return;
        }

        editorInstanceRef.current = editorInstance;
        
        // Expor editor para o componente pai se editorRef foi passado
        if (externalEditorRef) {
          externalEditorRef.current = editorInstance;
        }

        // Definir valor inicial
        if (value) {
          editorInstance.setData(value || '');
        }

        // Listener para mudanças
        editorInstance.model.document.on('change:data', () => {
          if (!mounted) return;
          const data = editorInstance.getData();
          if (onChange) {
            onChange(data);
          }
        });

        setIsLoading(false);
      } catch (err) {
        setError(`Erro ao carregar editor: ${err.message}. Verifique se o pacote @ckeditor/ckeditor5-build-classic está instalado (npm install @ckeditor/ckeditor5-build-classic)`);
        setIsLoading(false);
      }
    };

    // Aguardar um pouco para garantir que o DOM está montado
    // Usar requestAnimationFrame múltiplos para garantir que o DOM está renderizado
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (mounted) {
            loadEditor();
          }
        });
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      mounted = false;
      if (editorInstance || editorInstanceRef.current) {
        const editorToDestroy = editorInstance || editorInstanceRef.current;
        editorToDestroy.destroy().catch(() => {});
        editorInstanceRef.current = null;
        if (externalEditorRef) {
          externalEditorRef.current = null;
        }
      }
    };
  }, [isOpen]);

  // Atualizar valor quando mudar externamente
  useEffect(() => {
    if (editorInstanceRef.current && value !== undefined && isOpen) {
      const currentData = editorInstanceRef.current.getData();
      if (value !== currentData) {
        editorInstanceRef.current.setData(value || '');
      }
    }
  }, [value, isOpen]);

  // Atualizar estado disabled
  useEffect(() => {
    if (editorInstanceRef.current) {
      if (disabled) {
        editorInstanceRef.current.enableReadOnlyMode('disabled');
      } else {
        editorInstanceRef.current.disableReadOnlyMode('disabled');
      }
    }
  }, [disabled]);


  // Sempre renderizar o container, mesmo quando loading ou erro
  // Isso garante que o ref esteja disponível quando o modal abrir
  return (
    <div className="ckeditor-wrapper border border-gray-300 rounded-md overflow-hidden" style={{ minHeight: '500px', maxHeight: '600px' }}>
      <div 
        ref={containerRef} 
        style={{ minHeight: '500px', maxHeight: '600px', display: isLoading || error ? 'none' : 'block' }}
      ></div>
      {(isLoading || error) && (
        <div style={{ minHeight: '500px', maxHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Carregando editor...</span>
            </div>
          )}
          {error && (
            <div className="text-center p-4">
              <p className="text-red-800 text-sm">{error}</p>
              <p className="text-red-600 text-xs mt-2">
                Execute: npm install @ckeditor/ckeditor5-build-classic
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CKEditorWrapper;
