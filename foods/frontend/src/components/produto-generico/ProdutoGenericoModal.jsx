/**
 * Modal para Produto Genérico
 * Componente para criação e edição de produtos genéricos
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Input, FormattedInput, Modal, ValidationSummary } from '../ui';
import { useValidation } from '../../hooks/useValidation';
import { produtoGenericoValidations } from '../../utils/validations';
import { gerarCodigoProdutoGenerico } from '../../utils/codigoGenerator';

const ProdutoGenericoModal = ({
  isOpen,
  onClose,
  produtoGenerico,
  grupos,
  subgrupos,
  classes,
  produtosOrigem,
  unidadesMedida,
  onSubmit,
  viewMode = false
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm();
  
  const { 
    errors: validationErrors, 
    validateField, 
    validateAll, 
    clearAllErrors,
    markAsTouched 
  } = useValidation();

  // Observar mudanças nos campos para filtros dependentes
  const grupoId = watch('grupo_id');
  const subgrupoId = watch('subgrupo_id');

  // Filtrar subgrupos baseado no grupo selecionado
  const subgruposFiltrados = grupoId && grupoId !== '' 
    ? subgrupos.filter(sg => String(sg.grupo_id) === String(grupoId))
    : produtoGenerico && produtoGenerico.grupo_id 
      ? subgrupos.filter(sg => String(sg.grupo_id) === String(produtoGenerico.grupo_id))
      : [];

  // Filtrar classes baseado no subgrupo selecionado
  const classesFiltradas = subgrupoId && subgrupoId !== '' 
    ? classes.filter(c => String(c.subgrupo_id) === String(subgrupoId))
    : produtoGenerico && produtoGenerico.subgrupo_id 
      ? classes.filter(c => String(c.subgrupo_id) === String(produtoGenerico.subgrupo_id))
      : [];

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (produtoGenerico && isOpen) {
      // Preencher formulário com dados do produto genérico
      Object.keys(produtoGenerico).forEach(key => {
        if (produtoGenerico[key] !== null && produtoGenerico[key] !== undefined) {
          setValue(key, produtoGenerico[key]);
        }
      });
    } else if (!produtoGenerico && isOpen) {
      // Resetar formulário para novo produto genérico
      reset();
      setValue('status', 1);
      setValue('fator_conversao', 1.000);
      setValue('produto_padrao', 'Não');
      // Gerar código automático para novo produto genérico
      const codigoGerado = gerarCodigoProdutoGenerico();
      setValue('codigo', codigoGerado);
    }
    
    // Limpar erros de validação quando o modal é aberto
    if (isOpen) {
      clearAllErrors();
    }
  }, [produtoGenerico, isOpen, setValue, reset, clearAllErrors]);

  // Processar envio do formulário
  const handleFormSubmit = (data) => {
    // Validar todos os campos antes de enviar
    const isValid = validateAll(data, produtoGenericoValidations);
    
    if (!isValid) {
      // Marcar todos os campos como tocados para mostrar erros
      Object.keys(produtoGenericoValidations).forEach(field => {
        markAsTouched(field);
      });
      return;
    }

    // Converter campos numéricos
    const formData = {
      ...data,
      codigo: parseInt(data.codigo) || 0,
      produto_origem_id: data.produto_origem_id ? parseInt(data.produto_origem_id) : null,
      fator_conversao: parseFloat(data.fator_conversao) || 1.000,
      grupo_id: data.grupo_id ? parseInt(data.grupo_id) : null,
      subgrupo_id: data.subgrupo_id ? parseInt(data.subgrupo_id) : null,
      classe_id: data.classe_id ? parseInt(data.classe_id) : null,
      unidade_medida_id: data.unidade_medida_id ? parseInt(data.unidade_medida_id) : null,
      peso_liquido: data.peso_liquido ? parseFloat(data.peso_liquido) : null,
      peso_bruto: data.peso_bruto ? parseFloat(data.peso_bruto) : null,
      regra_palet: data.regra_palet ? parseInt(data.regra_palet) : null,
      prazo_validade_padrao: data.prazo_validade_padrao ? parseInt(data.prazo_validade_padrao) : null,
      status: parseInt(data.status) || 1
    };

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {viewMode ? <FaEye className="w-5 h-5 text-white" /> : produtoGenerico ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode ? 'Visualizar Produto Genérico' : produtoGenerico ? 'Editar Produto Genérico' : 'Novo Produto Genérico'}
              </h2>
              <p className="text-sm text-gray-600">
                                  {viewMode ? 'Visualizando informações do produto genérico' : produtoGenerico ? 'Editando informações do produto genérico' : 'Preencha as informações do novo produto genérico'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <FaTimes className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Resumo de validação */}
          <ValidationSummary errors={validationErrors} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Código */}
            <FormattedInput
              label="Código"
              type="number"
              placeholder="Código gerado automaticamente"
              {...register('codigo')}
              error={validationErrors.codigo || errors.codigo?.message}
              onValidate={(value) => validateField('codigo', value, produtoGenericoValidations.codigo)}
              disabled={true}
              required
            />

            {/* Nome */}
            <div className="md:col-span-2">
              <FormattedInput
                label="Nome"
                formatType="nome"
                placeholder="Digite o nome do produto genérico"
                {...register('nome')}
                error={validationErrors.nome || errors.nome?.message}
                onValidate={(value) => validateField('nome', value, produtoGenericoValidations.nome)}
                disabled={viewMode}
                required
              />
            </div>

            {/* Produto Origem */}
            <FormattedInput
              label="Produto Origem"
              type="select"
              {...register('produto_origem_id')}
              error={validationErrors.produto_origem_id || errors.produto_origem_id?.message}
              onValidate={(value) => validateField('produto_origem_id', value, produtoGenericoValidations.produto_origem_id)}
              disabled={viewMode}
            >
              <option value="">Selecione um produto origem</option>
              {produtosOrigem?.map(produto => (
                <option key={produto.id} value={produto.id}>
                  {produto.codigo} - {produto.nome}
                </option>
              ))}
            </FormattedInput>

            {/* Fator de Conversão */}
            <FormattedInput
              label="Fator de Conversão"
              type="number"
              formatType="decimal"
              step="0.001"
              min="0.001"
              placeholder="1.000"
              {...register('fator_conversao')}
              error={validationErrors.fator_conversao || errors.fator_conversao?.message}
              onValidate={(value) => validateField('fator_conversao', value, produtoGenericoValidations.fator_conversao)}
              disabled={viewMode}
            />

            {/* Status */}
            <FormattedInput
              label="Status"
              type="select"
              {...register('status')}
              error={validationErrors.status || errors.status?.message}
              onValidate={(value) => validateField('status', value, produtoGenericoValidations.status)}
              disabled={viewMode}
            >
              <option value={1}>Ativo</option>
              <option value={0}>Inativo</option>
            </FormattedInput>

            {/* Grupo */}
            <FormattedInput
              label="Grupo"
              type="select"
              {...register('grupo_id')}
              error={validationErrors.grupo_id || errors.grupo_id?.message}
              onValidate={(value) => validateField('grupo_id', value, produtoGenericoValidations.grupo_id)}
              disabled={viewMode}
            >
              <option value="">Selecione um grupo</option>
              {grupos?.map(grupo => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </FormattedInput>

            {/* Subgrupo */}
            <FormattedInput
              label="Subgrupo"
              type="select"
              {...register('subgrupo_id')}
              error={validationErrors.subgrupo_id || errors.subgrupo_id?.message}
              onValidate={(value) => validateField('subgrupo_id', value, produtoGenericoValidations.subgrupo_id)}
              disabled={viewMode || !grupoId}
            >
              <option value="">Selecione um subgrupo</option>
              {subgruposFiltrados.map(subgrupo => (
                <option key={subgrupo.id} value={subgrupo.id}>
                  {subgrupo.nome}
                </option>
              ))}
            </FormattedInput>

            {/* Classe */}
            <FormattedInput
              label="Classe"
              type="select"
              {...register('classe_id')}
              error={validationErrors.classe_id || errors.classe_id?.message}
              onValidate={(value) => validateField('classe_id', value, produtoGenericoValidations.classe_id)}
              disabled={viewMode || !subgrupoId}
            >
              <option value="">Selecione uma classe</option>
              {classesFiltradas.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nome}
                </option>
              ))}
            </FormattedInput>

            {/* Unidade de Medida */}
            <FormattedInput
              label="Unidade de Medida"
              type="select"
              {...register('unidade_medida_id')}
              error={validationErrors.unidade_medida_id || errors.unidade_medida_id?.message}
              onValidate={(value) => validateField('unidade_medida_id', value, produtoGenericoValidations.unidade_medida_id)}
              disabled={viewMode}
            >
              <option value="">Selecione uma unidade</option>
              {unidadesMedida?.map(unidade => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.nome}
                </option>
              ))}
            </FormattedInput>

            {/* Produto Padrão */}
            <FormattedInput
              label="Produto Padrão"
              type="select"
              {...register('produto_padrao')}
              error={validationErrors.produto_padrao || errors.produto_padrao?.message}
              onValidate={(value) => validateField('produto_padrao', value, produtoGenericoValidations.produto_padrao)}
              disabled={viewMode}
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </FormattedInput>

            {/* Referência de Mercado */}
            <FormattedInput
              label="Referência de Mercado"
              formatType="referencia"
              placeholder="Digite a referência de mercado"
              {...register('referencia_mercado')}
              error={validationErrors.referencia_mercado || errors.referencia_mercado?.message}
              onValidate={(value) => validateField('referencia_mercado', value, produtoGenericoValidations.referencia_mercado)}
              disabled={viewMode}
            />

            {/* Peso Líquido */}
            <FormattedInput
              label="Peso Líquido (kg)"
              type="number"
              formatType="decimal"
              step="0.001"
              min="0.001"
              placeholder="0.000"
              {...register('peso_liquido')}
              error={validationErrors.peso_liquido || errors.peso_liquido?.message}
              onValidate={(value) => validateField('peso_liquido', value, produtoGenericoValidations.peso_liquido)}
              disabled={viewMode}
            />

            {/* Peso Bruto */}
            <FormattedInput
              label="Peso Bruto (kg)"
              type="number"
              formatType="decimal"
              step="0.001"
              min="0.001"
              placeholder="0.000"
              {...register('peso_bruto')}
              error={validationErrors.peso_bruto || errors.peso_bruto?.message}
              onValidate={(value) => validateField('peso_bruto', value, produtoGenericoValidations.peso_bruto)}
              disabled={viewMode}
            />

            {/* Regra Palet */}
            <FormattedInput
              label="Regra Palet"
              type="number"
              min="1"
              placeholder="Digite a regra palet"
              {...register('regra_palet')}
              error={validationErrors.regra_palet || errors.regra_palet?.message}
              onValidate={(value) => validateField('regra_palet', value, produtoGenericoValidations.regra_palet)}
              disabled={viewMode}
            />

            {/* Referência Interna */}
            <FormattedInput
              label="Referência Interna"
              placeholder="Digite a referência interna"
              {...register('referencia_interna')}
              error={validationErrors.referencia_interna || errors.referencia_interna?.message}
              onValidate={(value) => validateField('referencia_interna', value, produtoGenericoValidations.referencia_interna)}
              disabled={viewMode}
            />

            {/* Referência Externa */}
            <FormattedInput
              label="Referência Externa"
              placeholder="Digite a referência externa"
              {...register('referencia_externa')}
              error={validationErrors.referencia_externa || errors.referencia_externa?.message}
              onValidate={(value) => validateField('referencia_externa', value, produtoGenericoValidations.referencia_externa)}
              disabled={viewMode}
            />

            {/* Registro Específico */}
            <FormattedInput
              label="Registro Específico"
              placeholder="Digite o registro específico"
              {...register('registro_especifico')}
              error={validationErrors.registro_especifico || errors.registro_especifico?.message}
              onValidate={(value) => validateField('registro_especifico', value, produtoGenericoValidations.registro_especifico)}
              disabled={viewMode}
            />

            {/* Tipo de Registro */}
            <FormattedInput
              label="Tipo de Registro"
              placeholder="Digite o tipo de registro"
              {...register('tipo_registro')}
              error={validationErrors.tipo_registro || errors.tipo_registro?.message}
              onValidate={(value) => validateField('tipo_registro', value, produtoGenericoValidations.tipo_registro)}
              disabled={viewMode}
            />

            {/* Prazo de Validade Padrão */}
            <FormattedInput
              label="Prazo de Validade Padrão"
              type="number"
              min="1"
              placeholder="Digite o prazo de validade"
              {...register('prazo_validade_padrao')}
              error={validationErrors.prazo_validade_padrao || errors.prazo_validade_padrao?.message}
              onValidate={(value) => validateField('prazo_validade_padrao', value, produtoGenericoValidations.prazo_validade_padrao)}
              disabled={viewMode}
            />

            {/* Unidade de Validade */}
            <FormattedInput
              label="Unidade de Validade"
              type="select"
              {...register('unidade_validade')}
              error={validationErrors.unidade_validade || errors.unidade_validade?.message}
              onValidate={(value) => validateField('unidade_validade', value, produtoGenericoValidations.unidade_validade)}
              disabled={viewMode}
            >
              <option value="">Selecione</option>
              <option value="Dias">Dias</option>
              <option value="Semanas">Semanas</option>
              <option value="Meses">Meses</option>
              <option value="Anos">Anos</option>
            </FormattedInput>

            {/* Integração Senior */}
            <FormattedInput
              label="Integração Senior"
              placeholder="Digite a integração Senior"
              {...register('integracao_senior')}
              error={validationErrors.integracao_senior || errors.integracao_senior?.message}
              onValidate={(value) => validateField('integracao_senior', value, produtoGenericoValidations.integracao_senior)}
              disabled={viewMode}
            />

            {/* Informações Adicionais */}
            <div className="lg:col-span-3">
              <FormattedInput
                label="Informações Adicionais"
                type="textarea"
                rows={4}
                placeholder="Digite informações adicionais"
                {...register('informacoes_adicionais')}
                error={validationErrors.informacoes_adicionais || errors.informacoes_adicionais?.message}
                onValidate={(value) => validateField('informacoes_adicionais', value, produtoGenericoValidations.informacoes_adicionais)}
                disabled={viewMode}
              />
            </div>
          </div>

          {/* Footer */}
                      {!viewMode && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex items-center gap-2"
              >
                <FaSave className="w-4 h-4" />
                {produtoGenerico ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default ProdutoGenericoModal;
