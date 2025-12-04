import React, { useEffect, useRef, useState } from 'react';
import { CKEditor as CKEditorComponent } from '@ckeditor/ckeditor5-react';
// Importar CSS do CKEditor 5 usando caminho relativo do node_modules
// Isso funciona tanto no desenvolvimento quanto na produção
import '../../../node_modules/ckeditor5/dist/ckeditor5.css';
import api from '../../services/api';
import {
  ClassicEditor as ClassicEditorBase,
  Essentials,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  Paragraph,
  Heading,
  BlockQuote,
  Link,
  List,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  MediaEmbed,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  SimpleUploadAdapter,
  Alignment,
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
  Indent,
  IndentBlock,
  SourceEditing,
  GeneralHtmlSupport,
  HtmlEmbed,
  HorizontalLine,
  PageBreak,
  RemoveFormat,
  SelectAll,
  SpecialCharacters,
  WordCount,
  Undo,
  Clipboard,
  PasteFromOffice
} from 'ckeditor5';

// Importar traduções em português brasileiro usando caminho relativo
import ptBrTranslations from '../../../node_modules/ckeditor5/dist/translations/pt-br.js';

// Criar classe de editor customizada
class ClassicEditor extends ClassicEditorBase {
  static builtinPlugins = [
    Essentials,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Subscript,
    Superscript,
    Paragraph,
    Heading,
    BlockQuote,
    Link,
    List,
    // Plugins de tabela - ordem importante: Table primeiro, depois TableToolbar, depois TableProperties e TableCellProperties
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    MediaEmbed,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    SimpleUploadAdapter,
    Alignment,
    FontSize,
    FontFamily,
    FontColor,
    FontBackgroundColor,
    Indent,
    IndentBlock,
    SourceEditing,
    GeneralHtmlSupport,
    HtmlEmbed,
    HorizontalLine,
    PageBreak,
    RemoveFormat,
    SelectAll,
    SpecialCharacters,
    WordCount,
    Undo,
    Clipboard,
    PasteFromOffice
  ];

  static defaultConfig = {
    licenseKey: 'GPL',
    language: 'pt-br',
    ...(ptBrTranslations && { translations: [ptBrTranslations] }),
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'code',
        'subscript',
        'superscript',
        '|',
        'fontSize',
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'alignment',
        '|',
        'numberedList',
        'bulletedList',
        '|',
        'outdent',
        'indent',
        '|',
        'link',
        'blockQuote',
        'insertTable',
        'uploadImage',
        'mediaEmbed',
        'horizontalLine',
        'pageBreak',
        'htmlEmbed',
        'specialCharacters',
        '|',
        'sourceEditing',
        'removeFormat',
        '|',
        'undo',
        'redo'
      ],
      shouldNotGroupWhenFull: true
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Parágrafo', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Título 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Título 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Título 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Título 4', class: 'ck-heading_heading4' }
      ]
    },
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Lucida Sans Unicode, Lucida Grande, sans-serif',
        'Tahoma, Geneva, sans-serif',
        'Times New Roman, Times, serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif'
      ]
    },
    fontSize: {
      options: [9, 11, 13, 'default', 17, 19, 21, 24, 32, 48, 60, 72]
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        '|',
        'tableProperties',
        'tableCellProperties'
      ],
      tableToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        '|',
        'tableProperties',
        'tableCellProperties'
      ],
      tableProperties: {
        borderColors: [
          { color: 'hsl(0, 0%, 90%)', label: 'Cinza Claro' },
          { color: 'hsl(0, 0%, 50%)', label: 'Cinza' },
          { color: 'hsl(0, 0%, 0%)', label: 'Preto' },
          { color: 'hsl(0, 0%, 100%)', label: 'Branco', hasBorder: true }
        ],
        backgroundColors: [
          { color: 'hsl(0, 0%, 100%)', label: 'Branco', hasBorder: true },
          { color: 'hsl(0, 0%, 90%)', label: 'Cinza Claro' },
          { color: 'hsl(210, 100%, 50%)', label: 'Azul' },
          { color: 'hsl(120, 75%, 60%)', label: 'Verde' },
          { color: 'hsl(60, 100%, 50%)', label: 'Amarelo' },
          { color: 'hsl(0, 100%, 50%)', label: 'Vermelho' }
        ]
      },
      tableCellProperties: {
        borderColors: [
          { color: 'hsl(0, 0%, 90%)', label: 'Cinza Claro' },
          { color: 'hsl(0, 0%, 50%)', label: 'Cinza' },
          { color: 'hsl(0, 0%, 0%)', label: 'Preto' },
          { color: 'hsl(0, 0%, 100%)', label: 'Branco', hasBorder: true }
        ],
        backgroundColors: [
          { color: 'hsl(0, 0%, 100%)', label: 'Branco', hasBorder: true },
          { color: 'hsl(0, 0%, 90%)', label: 'Cinza Claro' },
          { color: 'hsl(210, 100%, 50%)', label: 'Azul' },
          { color: 'hsl(120, 75%, 60%)', label: 'Verde' },
          { color: 'hsl(60, 100%, 50%)', label: 'Amarelo' },
          { color: 'hsl(0, 100%, 50%)', label: 'Vermelho' }
        ]
      }
    },
    image: {
      toolbar: ['imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative', 'toggleImageCaption'],
      upload: {
        types: ['jpeg', 'jpg', 'png', 'gif', 'webp']
      }
    },
    htmlSupport: {
      allow: [
        {
          name: /.*/,
          attributes: true,
          classes: true,
          styles: true
        }
      ]
    }
  };
}

/**
 * Componente wrapper para CKEditor 5
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
  const [editorReady, setEditorReady] = useState(false);

  // Obter URL base da API
  const getBaseURL = () => {
    return api.defaults.baseURL || 'http://localhost:3001/api';
  };

  // Mesclar configuração padrão com config customizado
  const editorConfig = {
    ...ClassicEditor.defaultConfig,
    ...config,
    // Configurar upload de imagens se não foi sobrescrito
    simpleUpload: config.simpleUpload !== undefined ? config.simpleUpload : {
      uploadUrl: `${getBaseURL()}/pdf-templates/upload-image`,
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    }
  };

  const handleReady = (editor) => {
    editorRef.current = editor;
    setEditorReady(true);
    
    // Definir valor inicial se fornecido
    if (value && value !== editor.getData()) {
      editor.setData(value || '');
    }

    // Configurar modo somente leitura se disabled
    if (disabled) {
      editor.enableReadOnlyMode('disabled');
    } else {
      editor.disableReadOnlyMode('disabled');
    }
  };

  const handleChange = (event, editor) => {
    const data = editor.getData();
    if (onChange) {
      onChange({
        target: {
          name: name || 'ckeditor',
          value: data
        }
      });
    }
  };

  // Atualizar valor quando prop mudar
  useEffect(() => {
    if (editorRef.current && editorReady) {
      const currentData = editorRef.current.getData();
      // Comparar valores normalizados (remover espaços em branco no início/fim)
      const normalizedValue = (value || '').trim();
      const normalizedCurrent = (currentData || '').trim();
      
      if (normalizedValue !== normalizedCurrent) {
        try {
        editorRef.current.setData(value || '');
        } catch (error) {
          console.error('Erro ao atualizar conteúdo do editor:', error);
        }
      }
    }
  }, [value, editorReady]);

  // Atualizar estado disabled
  useEffect(() => {
    if (editorRef.current && editorReady) {
      if (disabled) {
        editorRef.current.enableReadOnlyMode('disabled');
      } else {
        editorRef.current.disableReadOnlyMode('disabled');
      }
    }
  }, [disabled, editorReady]);

  // Método para inserir texto (usado pelo PdfTemplatesModal)
  useEffect(() => {
    if (editorRef.current && name) {
      // Expor método para inserir texto via window
      if (!window.ckeditor5Instances) {
        window.ckeditor5Instances = {};
      }
      window.ckeditor5Instances[name] = {
        insertText: (text) => {
          if (editorRef.current) {
            editorRef.current.model.change((writer) => {
              const insertPosition = editorRef.current.model.document.selection.getFirstPosition();
              writer.insertText(text, insertPosition);
            });
          }
        }
      };
    }

    return () => {
      if (window.ckeditor5Instances && name) {
        delete window.ckeditor5Instances[name];
      }
    };
  }, [name, editorReady]);

  // Limpar editor quando componente desmontar
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
          .catch((error) => {
            console.error('Erro ao destruir editor:', error);
          });
        editorRef.current = null;
        setEditorReady(false);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        /* Garantir que a barra flutuante do CKEditor apareça acima de modais */
        .ck.ck-balloon-panel {
          z-index: 10000 !important;
        }
        .ck.ck-toolbar-container {
          z-index: 10000 !important;
        }
        /* Garantir que o wrapper não corte a barra flutuante */
        .ckeditor-wrapper {
          position: relative;
        }
      `}</style>
      <div 
        className={`ckeditor-wrapper ${className}`}
        style={{ minHeight: `${height}px` }}
      >
        <CKEditorComponent
          editor={ClassicEditor}
          config={editorConfig}
          data={value || ''}
          onReady={handleReady}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    </>
  );
};

export default CKEditor;
