import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Input, FormattedInput, Modal, ValidationSummary } from '../ui';
import { useValidation } from '../../hooks/useValidation';
import { produtoOrigemValidations } from '../../utils/validations';
import { gerarCodigoProdutoOrigem } from '../../utils/codigoGenerator';

const ProdutoOrigemModal = ({
  isOpen,
  onClose,
  onSubmit,
  produtoOrigem,
  viewMode,
  grupos,
  subgrupos,
  classes,
  unidadesMedida,
  produtosGenericosPadrao,
  loading
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
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
    : produtoOrigem && produtoOrigem.grupo_id 
      ? subgrupos.filter(sg => String(sg.grupo_id) === String(produtoOrigem.grupo_id))
      : [];

  // Filtrar classes baseado no subgrupo selecionado
  const classesFiltradas = subgrupoId && subgrupoId !== '' 
    ? classes.filter(c => String(c.subgrupo_id) === String(subgrupoId))
    : produtoOrigem && produtoOrigem.subgrupo_id 
      ? classes.filter(c => String(c.subgrupo_id) === String(produtoOrigem.subgrupo_id))
      : [];

  useEffect(() => {
    if (produtoOrigem && isOpen) {
      // Preencher formulário com dados do produto origem
      Object.keys(produtoOrigem).forEach(key => {
        if (produtoOrigem[key] !== null && produtoOrigem[key] !== undefined) {
          setValue(key, produtoOrigem[key]);
        }
      });
    } else if (!produtoOrigem && isOpen) {
      // Resetar formulário para novo produto origem
      reset();
      setValue('status', 1);
      setValue('fator_conversao', 1.000);
      // Gerar código automático para novo produto origem
      const codigoGerado = gerarCodigoProdutoOrigem();
      setValue('codigo', codigoGerado);
    }
    
    // Limpar erros de validação quando o modal é aberto
    if (isOpen) {
      clearAllErrors();
    }
  }, [produtoOrigem, isOpen, setValue, reset, clearAllErrors]);

  const handleFormSubmit = (data) => {
    // Validar todos os campos antes de enviar
    const isValid = validateAll(data, produtoOrigemValidations);
    
    if (!isValid) {
      // Marcar todos os campos como tocados para mostrar erros
      Object.keys(produtoOrigemValidations).forEach(field => {
        markAsTouched(field);
      });
      return;
    }

    // Converter campos numéricos e enviar apenas os campos editáveis
    const formData = {
      codigo: data.codigo,
      nome: data.nome,
      unidade_medida_id: data.unidade_medida_id ? parseInt(data.unidade_medida_id) : null,
      fator_conversao: data.fator_conversao ? parseFloat(data.fator_conversao) : 1.000,
      grupo_id: data.grupo_id ? parseInt(data.grupo_id) : null,
      subgrupo_id: data.subgrupo_id ? parseInt(data.subgrupo_id) : null,
      classe_id: data.classe_id ? parseInt(data.classe_id) : null,
      peso_liquido: data.peso_liquido ? parseFloat(data.peso_liquido) : null,
      produto_generico_padrao_id: data.produto_generico_padrao_id && data.produto_generico_padrao_id !== '' ? parseInt(data.produto_generico_padrao_id) : null,
      referencia_mercado: data.referencia_mercado,
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
              {viewMode ? <FaEye className="w-5 h-5 text-white" /> : produtoOrigem ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode ? 'Visualizar Produto Origem' : produtoOrigem ? 'Editar Produto Origem' : 'Novo Produto Origem'}
              </h2>
              <p className="text-sm text-gray-600">
                {viewMode ? 'Visualizando informações do produto origem' : produtoOrigem ? 'Editando informações do produto origem' : 'Preencha as informações do novo produto origem'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Resumo de validação */}
          <ValidationSummary errors={validationErrors} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Código */}
            <FormattedInput
              label="Código"
              formatType="codigo"
              placeholder="Código gerado automaticamente"
              {...register('codigo')}
              error={validationErrors.codigo || errors.codigo?.message}
              onValidate={(value) => validateField('codigo', value, produtoOrigemValidations.codigo)}
              disabled={true}
              required
            />

            {/* Nome */}
            <FormattedInput
              label="Nome"
              formatType="nome"
              placeholder="Nome do produto origem"
              {...register('nome')}
              error={validationErrors.nome || errors.nome?.message}
              onValidate={(value) => validateField('nome', value, produtoOrigemValidations.nome)}
              disabled={viewMode}
              required
            />

            {/* Unidade de Medida */}
            <FormattedInput
              label="Unidade de Medida"
              type="select"
              {...register('unidade_medida_id')}
              error={validationErrors.unidade_medida_id || errors.unidade_medida_id?.message}
              onValidate={(value) => validateField('unidade_medida_id', value, produtoOrigemValidations.unidade_medida_id)}
              disabled={viewMode}
              required
            >
              <option value="">Selecione uma unidade</option>
              {unidadesMedida.map(unidade => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.nome}
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
              onValidate={(value) => validateField('fator_conversao', value, produtoOrigemValidations.fator_conversao)}
              disabled={viewMode}
            />

            {/* Grupo */}
            <FormattedInput
              label="Grupo"
              type="select"
              {...register('grupo_id')}
              error={validationErrors.grupo_id || errors.grupo_id?.message}
              onValidate={(value) => validateField('grupo_id', value, produtoOrigemValidations.grupo_id)}
              disabled={viewMode}
            >
              <option value="">Selecione um grupo</option>
              {grupos.map(grupo => (
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
              onValidate={(value) => validateField('subgrupo_id', value, produtoOrigemValidations.subgrupo_id)}
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
              onValidate={(value) => validateField('classe_id', value, produtoOrigemValidations.classe_id)}
              disabled={viewMode || !subgrupoId}
            >
              <option value="">Selecione uma classe</option>
              {classesFiltradas.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nome}
                </option>
              ))}
            </FormattedInput>

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
              onValidate={(value) => validateField('peso_liquido', value, produtoOrigemValidations.peso_liquido)}
              disabled={viewMode}
            />

            {/* Produto Genérico Padrão */}
            <FormattedInput
              label="Produto Genérico Padrão"
              type="select"
              {...register('produto_generico_padrao_id')}
              error={validationErrors.produto_generico_padrao_id || errors.produto_generico_padrao_id?.message}
              onValidate={(value) => validateField('produto_generico_padrao_id', value, produtoOrigemValidations.produto_generico_padrao_id)}
              disabled={viewMode}
            >
              <option value="">Selecione um produto genérico</option>
              {produtosGenericosPadrao.map(produto => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome}
                </option>
              ))}
            </FormattedInput>
          </div>

          {/* Referência de Mercado */}
          <FormattedInput
            label="Referência de Mercado"
            formatType="referencia"
            placeholder="Referência de mercado do produto"
            {...register('referencia_mercado')}
            error={validationErrors.referencia_mercado || errors.referencia_mercado?.message}
            onValidate={(value) => validateField('referencia_mercado', value, produtoOrigemValidations.referencia_mercado)}
            disabled={viewMode}
          />

          {/* Status */}
          <FormattedInput
            label="Status"
            type="select"
            {...register('status')}
            error={validationErrors.status || errors.status?.message}
            onValidate={(value) => validateField('status', value, produtoOrigemValidations.status)}
            disabled={viewMode}
          >
            <option value={1}>Ativo</option>
            <option value={0}>Inativo</option>
          </FormattedInput>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            {!viewMode && (
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'Salvando...' : produtoOrigem ? 'Atualizar' : 'Criar'}
              </Button>
            )}
            <Button type="button" variant="outline" size="lg" onClick={onClose}>
              {viewMode ? 'Fechar' : 'Cancelar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProdutoOrigemModal;
