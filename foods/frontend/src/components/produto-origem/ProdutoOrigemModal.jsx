import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';
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

  // Observar mudanças nos campos para filtros dependentes
  const grupoId = watch('grupo_id');
  const subgrupoId = watch('subgrupo_id');
  const classeId = watch('classe_id');

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

  // Função para buscar produto genérico padrão baseado na classificação
  const buscarProdutoGenericoPadrao = (grupoId, subgrupoId, classeId) => {
    if (!grupoId || !subgrupoId || !classeId) return null;
    
    // Buscar produto genérico padrão com a mesma classificação
    const produtoPadrao = produtosGenericosPadrao.find(pg => 
      pg.produto_padrao === 'Sim' && 
      pg.status === 1 &&
      pg.grupo_id === parseInt(grupoId) &&
      pg.subgrupo_id === parseInt(subgrupoId) &&
      pg.classe_id === parseInt(classeId)
    );
    
    return produtoPadrao || null;
  };

  // Efeito para vincular automaticamente produto genérico padrão quando classificação mudar
  useEffect(() => {
    if (grupoId && subgrupoId && classeId && !viewMode) {
      const produtoPadrao = buscarProdutoGenericoPadrao(grupoId, subgrupoId, classeId);
      if (produtoPadrao) {
        setValue('produto_generico_padrao_id', produtoPadrao.id);
      } else {
        setValue('produto_generico_padrao_id', '');
      }
    }
  }, [grupoId, subgrupoId, classeId, produtosGenericosPadrao, setValue, viewMode]);

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
  }, [produtoOrigem, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
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

  // Buscar produto genérico padrão atual para exibição
  const produtoGenericoPadraoAtual = watch('produto_generico_padrao_id');
  const produtoPadraoInfo = produtosGenericosPadrao.find(pg => pg.id === parseInt(produtoGenericoPadraoAtual));

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {viewMode ? (
              <FaEye className="w-5 h-5 text-blue-500" />
            ) : produtoOrigem ? (
              <FaEdit className="w-5 h-5 text-green-500" />
            ) : (
              <FaSave className="w-5 h-5 text-blue-500" />
            )}
            <h2 className="text-xl font-semibold text-gray-800">
              {viewMode ? 'Visualizar' : produtoOrigem ? 'Editar' : 'Criar'} Produto Origem
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Código */}
            <Input
              label="Código *"
              placeholder="Código gerado automaticamente"
              {...register('codigo', {
                required: 'Código é obrigatório'
              })}
              error={errors.codigo?.message}
              disabled={true}
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

            {/* Produto Genérico Padrão - Campo não editável */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Produto Genérico Padrão
              </label>
              <input
                type="text"
                value={produtoPadraoInfo ? produtoPadraoInfo.nome : ''}
                placeholder="Preenchido automaticamente quando um produto genérico for marcado como padrão"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled={true}
                readOnly
              />
              <input
                type="hidden"
                {...register('produto_generico_padrao_id')}
              />
              <p className="text-xs text-gray-500">
                Preenchido automaticamente quando um produto genérico for marcado como padrão
              </p>
            </div>
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
            label="Status"
            type="select"
            {...register('status')}
            error={errors.status?.message}
            disabled={viewMode}
          >
            <option value={1}>Ativo</option>
            <option value={0}>Inativo</option>
          </Input>

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
