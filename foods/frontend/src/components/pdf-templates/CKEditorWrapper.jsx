import React, { useState, useEffect, useRef } from 'react';
// Importar CSS do CKEditor - necessário para o editor funcionar
import '@ckeditor/ckeditor5-build-classic/build/ckeditor.css';

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
    if (isOpen === false) {
      // Destruir editor se o modal fechar
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
          .catch(err => console.error('Erro ao destruir editor:', err));
        editorInstanceRef.current = null;
        if (externalEditorRef) {
          externalEditorRef.current = null;
        }
      }
      setIsLoading(true);
      return;
    }

    let mounted = true;
    let editorInstance = null;

    const loadEditor = async () => {
      try {
        // Verificar se o container existe
        if (!containerRef.current) {
          console.error('Container ref não está disponível');
          setError('Erro: Container do editor não encontrado');
          setIsLoading(false);
          return;
        }
        
        // Importar CKEditor dinamicamente
        console.log('Importando ClassicEditor...');
        const { ClassicEditor } = await import('@ckeditor/ckeditor5-build-classic');
        console.log('ClassicEditor importado com sucesso');
        
        // Aguardar um pouco para garantir que o DOM está pronto
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted || !containerRef.current) {
          console.warn('Componente desmontado após importação');
          setIsLoading(false);
          return;
        }
        
        console.log('Criando instância do editor...', { 
          containerExists: !!containerRef.current,
          containerElement: containerRef.current
        });
        
        // Destruir editor anterior se existir
        if (editorInstanceRef.current) {
          editorInstanceRef.current.destroy()
            .catch(err => console.error('Erro ao destruir editor anterior:', err));
        }

        // Criar instância do editor
        editorInstance = await ClassicEditor.create(containerRef.current, {
          toolbar: {
            items: [
              'heading', '|',
              'bold', 'italic', 'underline', 'strikethrough', '|',
              'fontSize', 'fontColor', 'fontBackgroundColor', '|',
              'alignment', '|',
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
              'mergeTableCells',
              'tableProperties',
              'tableCellProperties'
            ],
            tableProperties: {
              borderColors: [],
              backgroundColors: []
            },
            tableCellProperties: {
              borderColors: [],
              backgroundColors: []
            }
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
        console.error('Erro ao carregar CKEditor:', err);
        console.error('Detalhes:', {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
        setError(`Erro ao carregar editor: ${err.message}. Verifique se o pacote @ckeditor/ckeditor5-build-classic está instalado (npm install @ckeditor/ckeditor5-build-classic)`);
        setIsLoading(false);
      }
    };

    // Aguardar um pouco para garantir que o DOM está montado
    // Usar requestAnimationFrame para garantir que o DOM está renderizado
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        if (containerRef.current && mounted) {
          loadEditor();
        } else {
          console.error('Container não encontrado após timeout', { 
            containerExists: !!containerRef.current,
            mounted 
          });
          setError('Erro: Container do editor não encontrado. Verifique se o modal está aberto.');
          setIsLoading(false);
        }
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      mounted = false;
      if (editorInstance || editorInstanceRef.current) {
        const editorToDestroy = editorInstance || editorInstanceRef.current;
        editorToDestroy.destroy()
          .catch(err => console.error('Erro ao destruir editor:', err));
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

  if (error) {
    return (
      <div className="border border-red-300 rounded-md p-4 bg-red-50">
        <p className="text-red-800 text-sm">{error}</p>
        <p className="text-red-600 text-xs mt-2">
          Execute: npm install @ckeditor/ckeditor5-build-classic
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Carregando editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ckeditor-wrapper border border-gray-300 rounded-md overflow-hidden" style={{ minHeight: '400px' }}>
      <div ref={containerRef} style={{ minHeight: '400px' }}></div>
    </div>
  );
};

export default CKEditorWrapper;
