/**
 * Build customizado do CKEditor 5
 * Inclui plugins adicionais para funcionalidades avançadas de tabela
 * 
 * Este arquivo cria um editor customizado com mais funcionalidades que o build classic
 */

export const createCustomEditor = async () => {
  // Importar os módulos necessários dinamicamente
  const [
    editorClassicModule,
    basicStylesModule,
    headingModule,
    linkModule,
    listModule,
    paragraphModule,
    tableModule,
    blockQuoteModule,
    imageModule,
    indentModule,
    undoModule,
    essentialsModule
  ] = await Promise.all([
    import('@ckeditor/ckeditor5-editor-classic'),
    import('@ckeditor/ckeditor5-basic-styles'),
    import('@ckeditor/ckeditor5-heading'),
    import('@ckeditor/ckeditor5-link'),
    import('@ckeditor/ckeditor5-list'),
    import('@ckeditor/ckeditor5-paragraph'),
    import('@ckeditor/ckeditor5-table'),
    import('@ckeditor/ckeditor5-block-quote'),
    import('@ckeditor/ckeditor5-image'),
    import('@ckeditor/ckeditor5-indent'),
    import('@ckeditor/ckeditor5-undo'),
    import('@ckeditor/ckeditor5-essentials')
  ]);

  const { ClassicEditor } = editorClassicModule;
  const { Essentials } = essentialsModule;
  const { Bold, Italic } = basicStylesModule;
  const { Heading } = headingModule;
  const { Link } = linkModule;
  const { List } = listModule;
  const { Paragraph } = paragraphModule;
  const { Table, TableToolbar, TableProperties, TableCellProperties } = tableModule;
  const { BlockQuote } = blockQuoteModule;
  const { Image, ImageToolbar, ImageCaption, ImageStyle } = imageModule;
  const { Indent } = indentModule;
  const { Undo } = undoModule;

  // Retornar a classe do editor customizado
  class CustomEditor extends ClassicEditor {
    static builtinPlugins = [
      Essentials,
      Bold,
      Italic,
      Heading,
      Link,
      List,
      Paragraph,
      Table,
      TableToolbar,
      TableProperties,
      TableCellProperties,
      BlockQuote,
      Image,
      ImageToolbar,
      ImageCaption,
      ImageStyle,
      Indent,
      Undo
    ];

    static defaultConfig = {
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
      image: {
        toolbar: [
          'imageStyle:inline',
          'imageStyle:block',
          'imageStyle:side',
          '|',
          'toggleImageCaption',
          'imageTextAlternative'
        ]
      },
      language: 'pt-br'
    };
  }

  return CustomEditor;
};

