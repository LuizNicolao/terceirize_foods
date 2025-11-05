/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	// Idioma português brasileiro
	config.language = 'pt-br';
	
	// Toolbar personalizada
	config.toolbar = [
		{ name: 'document', items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', '-', 'Templates' ] },
		{ name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
		{ name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
		{ name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
		'/',
		{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
		{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },
		{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
		{ name: 'insert', items: [ 'Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
		'/',
		{ name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
		{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
		{ name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
		{ name: 'others', items: [ '-' ] }
	];
	
	// Altura padrão
	config.height = 400;
	
	// Remover barra de status
	config.removePlugins = 'elementspath';
	
	// Desabilitar plugins que geram avisos ou estão incompletos (não são necessários)
	// tablesorter: plugin incompleto (falta arquivos JS e lang)
	// qrc: plugin incompleto (só tem imagens, sem arquivos JS)
	config.removePlugins = config.removePlugins ? config.removePlugins + ',exportpdf,uploadimage,tablesorter,qrc' : 'elementspath,exportpdf,uploadimage,tablesorter,qrc';
	
	// Permitir upload de imagens (se necessário no futuro)
	config.filebrowserUploadUrl = '/api/upload';
	config.filebrowserImageUploadUrl = '/api/upload/image';
	
	// Desabilitar avisos de segurança (a versão é funcional)
	config.ignoreEmptyParagraph = true;
};
