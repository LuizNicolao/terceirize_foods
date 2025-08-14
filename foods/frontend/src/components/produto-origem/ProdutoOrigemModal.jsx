import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

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

  // Observar mudanças nos campos para filtros dependentes
  const grupoId = watch('grupo_id');
  const subgrupoId = watch('subgrupo_id');

  // Filtrar subgrupos baseado no grupo selecionado
  const subgruposFiltrados = grupoId && grupoId !== '' 
    ? subgrupos.filter(sg => String(sg.grupo_id) === String(grupoId))
    : [];

  // Filtrar classes baseado no subgrupo selecionado
  const classesFiltradas = subgrupoId && subgrupoId !== '' 
    ? classes.filter(c => String(c.subgrupo_id) === String(subgrupoId))
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
    }
  }, [produtoOrigem, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    // Converter campos numéricos
    const formData = {
      ...data,
      unidade_medida_id: data.unidade_medida_id ? parseInt(data.unidade_medida_id) : null,
      fator_conversao: data.fator_conversao ? parseFloat(data.fator_conversao) : 1.000,
      grupo_id: data.grupo_id ? parseInt(data.grupo_id) : null,
      subgrupo_id: data.subgrupo_id ? parseInt(data.subgrupo_id) : null,
      classe_id: data.classe_id ? parseInt(data.classe_id) : null,
      peso_liquido: data.peso_liquido ? parseFloat(data.peso_liquido) : null,
      produto_generico_padrao_id: data.produto_generico_padrao_id ? parseInt(data.produto_generico_padrao_id) : null,
      status: data.status ? 1 : 0
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Código */}
            <Input
              label="Código *"
              {...register('codigo', {
                required: 'Código é obrigatório',
                minLength: { value: 1, message: 'Código deve ter pelo menos 1 caractere' },
                maxLength: { value: 20, message: 'Código deve ter no máximo 20 caracteres' },
                pattern: {
                  value: /^[a-zA-Z0-9\-_]+$/,
                  message: 'Código deve conter apenas letras, números, hífens e underscores'
                }
              })}
              error={errors.codigo?.message}
              disabled={viewMode}
            />

            {/* Nome */}
            <Input
              label="Nome *"
              {...register('nome', {
                required: 'Nome é obrigatório',
                minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
                maxLength: { value: 200, message: 'Nome deve ter no máximo 200 caracteres' }
              })}
              error={errors.nome?.message}
              disabled={viewMode}
            />

            {/* Unidade de Medida */}
            <Input
              label="Unidade de Medida *"
              type="select"
              {...register('unidade_medida_id', {
                required: 'Unidade de medida é obrigatória',
                validate: value => value && value !== '' ? true : 'Unidade de medida é obrigatória'
              })}
              error={errors.unidade_medida_id?.message}
              disabled={viewMode}
            >
              <option value="">Selecione uma unidade</option>
              {unidadesMedida.map(unidade => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.nome}
                </option>
              ))}
            </Input>

            {/* Fator de Conversão */}
            <Input
              label="Fator de Conversão"
              type="number"
              step="0.001"
              min="0.001"
              {...register('fator_conversao', {
                min: { value: 0.001, message: 'Fator de conversão deve ser maior que 0' },
                max: { value: 999999.999, message: 'Fator de conversão deve ser menor que 999999.999' }
              })}
              error={errors.fator_conversao?.message}
              disabled={viewMode}
            />

            {/* Grupo */}
            <Input
              label="Grupo"
              type="select"
              {...register('grupo_id')}
              error={errors.grupo_id?.message}
              disabled={viewMode}
            >
              <option value="">Selecione um grupo</option>
              {grupos.map(grupo => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </Input>

            {/* Subgrupo */}
            <Input
              label="Subgrupo"
              type="select"
              {...register('subgrupo_id')}
              error={errors.subgrupo_id?.message}
              disabled={viewMode || !grupoId}
            >
              <option value="">Selecione um subgrupo</option>
              {subgruposFiltrados.map(subgrupo => (
                <option key={subgrupo.id} value={subgrupo.id}>
                  {subgrupo.nome}
                </option>
              ))}
            </Input>

            {/* Classe */}
            <Input
              label="Classe"
              type="select"
              {...register('classe_id')}
              error={errors.classe_id?.message}
              disabled={viewMode || !subgrupoId}
            >
              <option value="">Selecione uma classe</option>
              {classesFiltradas.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nome}
                </option>
              ))}
            </Input>

            {/* Peso Líquido */}
            <Input
              label="Peso Líquido (kg)"
              type="number"
              step="0.001"
              min="0.001"
              {...register('peso_liquido', {
                min: { value: 0.001, message: 'Peso líquido deve ser maior que 0' },
                max: { value: 999999.999, message: 'Peso líquido deve ser menor que 999999.999' }
              })}
              error={errors.peso_liquido?.message}
              disabled={viewMode}
            />

            {/* Produto Genérico Padrão */}
            <Input
              label="Produto Genérico Padrão"
              type="select"
              {...register('produto_generico_padrao_id')}
              error={errors.produto_generico_padrao_id?.message}
              disabled={viewMode}
            >
              <option value="">Selecione um produto genérico</option>
              {produtosGenericosPadrao.map(produto => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome}
                </option>
              ))}
            </Input>
          </div>

          {/* Referência de Mercado */}
          <Input
            label="Referência de Mercado"
            {...register('referencia_mercado', {
              maxLength: { value: 200, message: 'Referência de mercado deve ter no máximo 200 caracteres' }
            })}
            error={errors.referencia_mercado?.message}
            disabled={viewMode}
          />

          {/* Status */}
          <Input
            label="Produto ativo"
            type="checkbox"
            {...register('status')}
            error={errors.status?.message}
            disabled={viewMode}
          />

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
