import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaPlus } from 'react-icons/fa';
import { Button, Input, Modal, SearchableSelect, CKEditor } from '../ui';

const PdfTemplatesModal = ({
  isOpen,
  onClose,
  onSubmit,
  template,
  viewMode,
  telasDisponiveis,
  loading
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  const [saving, setSaving] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  const telaVinculada = watch('tela_vinculada');

  // Variáveis disponíveis baseadas na tela selecionada
  const getVariaveisDisponiveis = () => {
    if (!telaVinculada) return [];
    
    const variaveis = {
      'solicitacoes-compras': [
        // Identificação
        'id',
        'numero_solicitacao',
        // Descrições
        'descricao',
        'motivo',
        'justificativa',
        'observacoes',
        // Status
        'status',
        // Datas
        'data_criacao',
        'data_criacao_completa',
        'data_atualizacao',
        'data_atualizacao_completa',
        'data_documento',
        'data_entrega_cd',
        'data_necessidade',
        'semana_abastecimento',
        // Filial
        'filial_id',
        'filial_nome',
        'filial_codigo',
        'unidade',
        // Usuário/Solicitante
        'usuario_id',
        'criado_por',
        'solicitante_nome',
        'solicitante',
        'usuario_email',
        // Pedidos
        'pedidos_vinculados',
        'pedidos_vinculados_lista',
        // Estatísticas
        'total_itens',
        'total_quantidade',
        // Itens (loop)
        '{{#itens}}',
        '  id',
        '  solicitacao_id',
        '  produto_id',
        '  produto_codigo',
        '  produto_nome',
        '  codigo_produto',
        '  nome_produto',
        '  quantidade',
        '  quantidade_formatada',
        '  quantidade_utilizada',
        '  quantidade_utilizada_formatada',
        '  saldo_disponivel',
        '  saldo_disponivel_formatado',
        '  status',
        '  unidade_medida_id',
        '  unidade',
        '  unidade_simbolo',
        '  unidade_nome',
        '  observacao',
        '  pedidos_vinculados',
        '  pedidos_vinculados_lista',
        '  item_criado_em',
        '{{/itens}}'
      ],
      'pedidos-compras': [
        'numero_pedido',
        'data_criacao',
        'fornecedor_nome',
        'fornecedor_cnpj',
        'valor_total',
        'status'
      ],
      'relatorio-inspecao': [
        'numero_rir',
        'data_inspecao',
        'fornecedor_nome',
        'pedido_numero',
        'status'
      ]
    };

    return variaveis[telaVinculada] || [];
  };

  const variaveisDisponiveis = getVariaveisDisponiveis();

  useEffect(() => {
    if (template && isOpen) {
      // Preencher formulário com dados do template
      reset();
      Object.keys(template).forEach(key => {
        if (template[key] !== null && template[key] !== undefined && key !== 'html_template' && key !== 'css_styles') {
          setValue(key, template[key], { shouldValidate: false });
        }
      });
      // Aguardar um pouco para o editor carregar antes de definir o conteúdo
      setTimeout(() => {
        setHtmlContent(template.html_template || '');
      }, 300);
      
      // Converter campos booleanos
      setValue('ativo', template.ativo === 1 || template.ativo === true ? '1' : '0', { shouldValidate: false });
      setValue('padrao', template.padrao === 1 || template.padrao === true ? '1' : '0', { shouldValidate: false });
      // Garantir que tela_vinculada seja setado
      if (template.tela_vinculada) {
        setValue('tela_vinculada', template.tela_vinculada, { shouldValidate: false });
      }
    } else if (!template && isOpen) {
      // Resetar formulário para novo template
      reset();
      setHtmlContent('');
      setValue('ativo', '1', { shouldValidate: false }); // Padrão: Ativo
      setValue('padrao', '0', { shouldValidate: false }); // Padrão: Não é padrão
      setValue('tela_vinculada', '', { shouldValidate: false });
    } else if (!isOpen) {
      // Limpar quando modal fechar
      setHtmlContent('');
    }
  }, [template, isOpen, setValue, reset]);

  // Função para inserir variável no editor CKEditor 4
  const inserirVariavel = (variavel) => {
    if (typeof window.CKEDITOR !== 'undefined') {
      const editors = window.CKEDITOR.instances;
      for (const key in editors) {
        const editor = editors[key];
        if (
          editor &&
          editor.element &&
          editor.element.$ &&
          editor.element.$.name === 'html_template'
        ) {
          editor.insertText(`{{${variavel}}}`);
          break;
        }
      }
    }
  };

  const handleFormSubmit = async (data) => {
    // Validar campos obrigatórios
    if (!data.nome || !data.nome.trim()) {
      alert('Nome do template é obrigatório');
      return;
    }

    if (!data.tela_vinculada) {
      alert('Tela vinculada é obrigatória');
      return;
    }

    // Validar HTML template
    if (!htmlContent || !htmlContent.trim()) {
      alert('HTML Template é obrigatório');
      return;
    }

    setSaving(true);
    try {
      const formData = {
        nome: data.nome.trim(),
        descricao: data.descricao?.trim() || null,
        tela_vinculada: data.tela_vinculada,
        html_template: htmlContent.trim(),
        css_styles: null, // CSS agora é editado diretamente no HTML via CKEditor
        ativo: data.ativo === '1' || data.ativo === 1 || data.ativo === true,
        padrao: data.padrao === '1' || data.padrao === 1 || data.padrao === true,
        variaveis_disponiveis: Array.isArray(variaveisDisponiveis) 
          ? variaveisDisponiveis 
          : (typeof variaveisDisponiveis === 'string' ? JSON.parse(variaveisDisponiveis) : [])
      };

      await onSubmit(formData);
      setHtmlContent('');
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar template. Verifique o console para mais detalhes.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = viewMode === true;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {isViewMode ? <FaEye className="w-5 h-5 text-white" /> : template ? <FaEdit className="w-5 h-5 text-white" /> : <FaPlus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isViewMode ? 'Visualizar Template de PDF' : template ? 'Editar Template de PDF' : 'Novo Template de PDF'}
              </h2>
              <p className="text-sm text-gray-600">
                {isViewMode 
                  ? 'Visualizando informações do template' 
                  : template 
                    ? 'Editando informações do template' 
                    : 'Preencha as informações do novo template'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
            disabled={saving}
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Template *"
              type="text"
              {...register('nome', {
                required: 'Nome é obrigatório',
                maxLength: { value: 255, message: 'Nome deve ter no máximo 255 caracteres' }
              })}
              error={errors.nome?.message}
              disabled={isViewMode || saving}
            />

            <SearchableSelect
              label="Tela Vinculada"
              options={telasDisponiveis.map(tela => ({ value: tela.value, label: tela.label }))}
              value={telaVinculada}
              onChange={(selectedValue) => {
                setValue('tela_vinculada', selectedValue || '', { shouldValidate: true });
              }}
              error={errors.tela_vinculada?.message}
              disabled={isViewMode || saving}
              required
            usePortal={false}
            />
          </div>

          <Input
            label="Descrição"
            type="textarea"
            rows={3}
            {...register('descricao')}
            error={errors.descricao?.message}
            disabled={isViewMode || saving}
          />

          {/* Variáveis Disponíveis - Acima do Editor */}
          {telaVinculada && variaveisDisponiveis.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Variáveis Disponíveis</h3>
              <p className="text-xs text-blue-700 mb-3">
                Use estas variáveis no HTML do template usando a sintaxe: {'{{'}<span className="font-mono">nome_variavel</span>{'}}'}
              </p>
              <div className="flex flex-wrap gap-2">
                {variaveisDisponiveis.map(variavel => (
                  <code
                    key={variavel}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono cursor-pointer hover:bg-blue-200"
                    onClick={() => {
                      if (!isViewMode) {
                        inserirVariavel(variavel);
                      }
                    }}
                    title="Clique para inserir no HTML"
                  >
                    {'{{'}{variavel}{'}}'}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Editor HTML/CSS */}
          <div className="min-h-[500px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTML Template *
            </label>
            <CKEditor
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              name="html_template"
              disabled={isViewMode || saving}
              height={500}
              config={{
                toolbar: [
                  { name: 'document', items: [ 'Source', '-', 'Save', 'NewPage', 'Preview' ] },
                  { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
                  { name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll' ] },
                  '/',
                  { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
                  { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
                  { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
                  { name: 'insert', items: [ 'Image', 'Table', 'HorizontalRule', 'SpecialChar', 'PageBreak' ] },
                  '/',
                  { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
                  { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
                  { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] }
                ]
              }}
            />
            {errors.html_template && (
              <p className="mt-1 text-sm text-red-600">{errors.html_template.message}</p>
            )}
          </div>

          {/* Opções */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('ativo')}
                disabled={isViewMode || saving}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.ativo ? 'border-red-500' : 'border-gray-300'
                } ${isViewMode || saving ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Padrão
              </label>
              <select
                {...register('padrao')}
                disabled={isViewMode || saving}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.padrao ? 'border-red-500' : 'border-gray-300'
                } ${isViewMode || saving ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value="0">Não</option>
                <option value="1">Sim</option>
              </select>
            </div>
          </div>

          {!isViewMode && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving} loading={saving}>
                <FaSave className="w-4 h-4 mr-2" />
                {template ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default PdfTemplatesModal;

