import React, { useMemo, useRef, useEffect } from 'react';
import { CKEditor as CKEditorReact } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const DEFAULT_TOOLBAR = [
  'heading',
  '|',
  'bold',
  'italic',
  'link',
  'bulletedList',
  'numberedList',
  '|',
  'blockQuote',
  'insertTable',
  'undo',
  'redo'
];

const DEFAULT_CONFIG = {
  toolbar: DEFAULT_TOOLBAR,
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells'
    ]
  },
  link: {
    decorators: {
      openInNewTab: {
        mode: 'manual',
        label: 'Abrir em nova aba',
        attributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }
    }
  }
};

const CKEditor5 = ({
  value = '',
  onChange,
  name = 'ckeditor5',
  disabled = false,
  className = '',
  height = 500,
  config = {},
  onEditorReady
}) => {
  const editorRef = useRef(null);

  const mergedConfig = useMemo(() => {
    const toolbar = config.toolbar || DEFAULT_CONFIG.toolbar;
    return {
      ...DEFAULT_CONFIG,
      ...config,
      toolbar
    };
  }, [config]);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Erro ao destruir instância do CKEditor 5:', error);
        } finally {
          editorRef.current = null;
        }
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const currentData = editorRef.current.getData();
      if (value !== currentData) {
        editorRef.current.setData(value || '');
      }
    }
  }, [value]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    if (disabled) {
      editorRef.current.enableReadOnlyMode('foods-ckeditor5-readonly');
    } else {
      editorRef.current.disableReadOnlyMode('foods-ckeditor5-readonly');
    }
  }, [disabled]);

  const handleReady = (editor) => {
    editorRef.current = editor;

    editor.editing.view.change((writer) => {
      writer.setStyle(
        'min-height',
        `${height}px`,
        editor.editing.view.document.getRoot()
      );
    });

    if (typeof onEditorReady === 'function') {
      onEditorReady(editor);
    }
  };

  const handleChange = (_event, editor) => {
    if (typeof onChange === 'function') {
      const data = editor.getData();
      onChange({
        target: {
          name,
          value: data
        }
      });
    }
  };

  return (
    <div
      className={`ckeditor5-wrapper ${className}`}
      style={{ minHeight: `${height}px` }}
    >
      <CKEditorReact
        editor={ClassicEditor}
        data={value || ''}
        disabled={disabled}
        config={mergedConfig}
        onReady={handleReady}
        onChange={handleChange}
      />
    </div>
  );
};

export default CKEditor5;

