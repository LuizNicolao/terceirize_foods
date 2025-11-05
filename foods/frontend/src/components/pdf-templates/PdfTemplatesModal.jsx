import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaPlus } from 'react-icons/fa';
import { Button, Input, Modal, SearchableSelect } from '../ui';
import CKEditorWrapper from './CKEditorWrapper';

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
  const [cssContent, setCssContent] = useState('');
  const editorRef = useRef(null);

  const telaVinculada = watch('tela_vinculada');

  useEffect(() => {
    if (template && isOpen) {
      // Preencher formulário com dados do template
      Object.keys(template).forEach(key => {
        if (template[key] !== null && template[key] !== undefined && key !== 'html_template' && key !== 'css_styles') {
          setValue(key, template[key]);
        }
      });
      // Aguardar um pouco para o editor carregar antes de definir o conteúdo
      setTimeout(() => {
        setHtmlContent(template.html_template || '');
        setCssContent(template.css_styles || '');
      }, 300);
      
      // Converter campos booleanos
      setValue('ativo', template.ativo === 1 || template.ativo === true ? '1' : '0');
      setValue('padrao', template.padrao === 1 || template.padrao === true ? '1' : '0');
    } else if (!template && isOpen) {
      // Resetar formulário para novo template
      reset();
      setHtmlContent('');
      setCssContent('');
      setValue('ativo', '1'); // Padrão: Ativo
      setValue('padrao', '0'); // Padrão: Não é padrão
    } else if (!isOpen) {
      // Limpar quando modal fechar
      setHtmlContent('');
      setCssContent('');
      editorRef.current = null;
    }
  }, [template, isOpen, setValue, reset]);

  const handleFormSubmit = async (data) => {
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
        css_styles: cssContent.trim() || null,
        ativo: data.ativo === '1' || data.ativo === 1 || data.ativo === true,
        padrao: data.padrao === '1' || data.padrao === 1 || data.padrao === true,
        variaveis_disponiveis: data.variaveis_disponiveis || []
      };

      await onSubmit(formData);
      setHtmlContent('');
      setCssContent('');
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = viewMode === true;

  // Variáveis disponíveis baseadas na tela selecionada
  const getVariaveisDisponiveis = () => {
    if (!telaVinculada) return [];
    
    const variaveis = {
      'solicitacoes-compras': [
        'numero_solicitacao',
        'data_criacao',
        'data_entrega_cd',
        'semana_abastecimento',
        'justificativa',
        'status',
        'filial_nome',
        'filial_codigo',
        'solicitante_nome'
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
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
              label="Tela Vinculada *"
              options={telasDisponiveis.map(tela => ({ value: tela.value, label: tela.label }))}
              {...register('tela_vinculada', {
                required: 'Tela vinculada é obrigatória'
              })}
              error={errors.tela_vinculada?.message}
              disabled={isViewMode || saving}
              onChange={(selected) => setValue('tela_vinculada', selected?.value || '')}
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

          {/* Variáveis Disponíveis */}
          {telaVinculada && variaveisDisponiveis.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                      if (!isViewMode && editorRef.current) {
                        const editor = editorRef.current;
                        const model = editor.model;
                        const selection = model.document.selection;
                        
                        // Inserir variável no editor
                        model.change(writer => {
                          const insertPosition = selection.getFirstPosition();
                          writer.insertText(`{{${variavel}}}`, insertPosition);
                        });
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

          {/* HTML Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTML Template * <span className="text-xs text-gray-500">(Use variáveis com {'{{variavel}}'})</span>
            </label>
            <CKEditorWrapper
              value={htmlContent}
              onChange={setHtmlContent}
              disabled={isViewMode || saving}
              placeholder="Digite o HTML do template aqui..."
              editorRef={editorRef}
              isOpen={isOpen}
            />
            {errors.html_template && (
              <p className="mt-1 text-sm text-red-600">{errors.html_template.message}</p>
            )}
          </div>

          {/* CSS Styles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSS Styles <span className="text-xs text-gray-500">(Opcional - Estilos adicionais para o template)</span>
            </label>
            <textarea
              name="css_styles"
              value={cssContent}
              onChange={(e) => setCssContent(e.target.value)}
              disabled={isViewMode || saving}
              rows={10}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.css_styles ? 'border-red-500' : 'border-gray-300'
              } ${isViewMode || saving ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="Digite o CSS aqui..."
            />
            {errors.css_styles && (
              <p className="mt-1 text-sm text-red-600">{errors.css_styles.message}</p>
            )}
          </div>

          {/* Opções */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="mt-1 text-xs text-gray-500">
                Se marcado como padrão, será usado automaticamente quando nenhum template específico for selecionado
              </p>
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

