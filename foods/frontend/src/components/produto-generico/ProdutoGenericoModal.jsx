/**
 * Modal para Produto Genérico
 * Componente para criação e edição de produtos genéricos
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

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

  const [subgruposFiltrados, setSubgruposFiltrados] = useState([]);
  const [classesFiltradas, setClassesFiltradas] = useState([]);

  // Observar mudanças nos campos dependentes
  const grupoId = watch('grupo_id');
  const subgrupoId = watch('subgrupo_id');

  // Filtrar subgrupos baseado no grupo selecionado
  useEffect(() => {
    if (grupoId && grupoId !== '') {
      const filtrados = subgrupos.filter(sg => String(sg.grupo_id) === String(grupoId));
      setSubgruposFiltrados(filtrados);
      
      // Limpar subgrupo se não for compatível
      if (produtoGenerico && produtoGenerico.grupo_id !== parseInt(grupoId)) {
        setValue('subgrupo_id', '');
        setValue('classe_id', '');
      }
    } else {
      setSubgruposFiltrados([]);
      setValue('subgrupo_id', '');
      setValue('classe_id', '');
    }
  }, [grupoId, subgrupos, setValue, produtoGenerico]);

  // Filtrar classes baseado no subgrupo selecionado
  useEffect(() => {
    if (subgrupoId && subgrupoId !== '') {
      const filtradas = classes.filter(c => String(c.subgrupo_id) === String(subgrupoId));
      setClassesFiltradas(filtradas);
      
      // Limpar classe se não for compatível
      if (produtoGenerico && produtoGenerico.subgrupo_id !== parseInt(subgrupoId)) {
        setValue('classe_id', '');
      }
    } else {
      setClassesFiltradas([]);
      setValue('classe_id', '');
    }
  }, [subgrupoId, classes, setValue, produtoGenerico]);

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
    }
  }, [produtoGenerico, isOpen, setValue, reset]);

  // Processar envio do formulário
  const handleFormSubmit = (data) => {
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Código */}
            <div>
              <Input
                label="Código *"
                type="number"
                {...register('codigo', { 
                  required: 'Código é obrigatório',
                  min: { value: 1, message: 'Código deve ser maior que 0' }
                })}
                error={errors.codigo?.message}
                disabled={viewMode}
                placeholder="Digite o código"
              />
            </div>

            {/* Nome */}
            <div className="md:col-span-2">
              <Input
                label="Nome *"
                type="text"
                {...register('nome', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
                  maxLength: { value: 200, message: 'Nome deve ter no máximo 200 caracteres' }
                })}
                error={errors.nome?.message}
                disabled={viewMode}
                placeholder="Digite o nome do produto genérico"
              />
            </div>

            {/* Produto Origem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto Origem
              </label>
              <select
                {...register('produto_origem_id')}
                disabled={viewMode}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.produto_origem_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Selecione um produto origem</option>
                {produtosOrigem?.map(produto => (
                  <option key={produto.id} value={produto.id}>
                    {produto.codigo} - {produto.nome}
                  </option>
                ))}
              </select>
              {errors.produto_origem_id && (
                <p className="mt-1 text-sm text-red-600">{errors.produto_origem_id.message}</p>
              )}
            </div>

            {/* Fator de Conversão */}
            <div>
              <Input
                label="Fator de Conversão"
                type="number"
                step="0.001"
                {...register('fator_conversao', {
                  min: { value: 0.001, message: 'Fator deve ser maior que 0' },
                  max: { value: 999999.999, message: 'Fator deve ser menor que 999999.999' }
                })}
                error={errors.fator_conversao?.message}
                disabled={viewMode}
                placeholder="1.000"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                disabled={viewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Ativo</option>
                <option value={0}>Inativo</option>
              </select>
            </div>

            {/* Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo
              </label>
              <select
                {...register('grupo_id')}
                disabled={viewMode}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.grupo_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Selecione um grupo</option>
                {grupos?.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </select>
              {errors.grupo_id && (
                <p className="mt-1 text-sm text-red-600">{errors.grupo_id.message}</p>
              )}
            </div>

            {/* Subgrupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subgrupo
              </label>
              <select
                {...register('subgrupo_id')}
                disabled={viewMode}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.subgrupo_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Selecione um subgrupo</option>
                {subgruposFiltrados?.map(subgrupo => (
                  <option key={subgrupo.id} value={subgrupo.id}>
                    {subgrupo.nome}
                  </option>
                ))}
              </select>
              {errors.subgrupo_id && (
                <p className="mt-1 text-sm text-red-600">{errors.subgrupo_id.message}</p>
              )}
            </div>

            {/* Classe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe
              </label>
              <select
                {...register('classe_id')}
                disabled={viewMode}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.classe_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Selecione uma classe</option>
                {classesFiltradas?.map(classe => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nome}
                  </option>
                ))}
              </select>
              {errors.classe_id && (
                <p className="mt-1 text-sm text-red-600">{errors.classe_id.message}</p>
              )}
            </div>

            {/* Unidade de Medida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade de Medida
              </label>
              <select
                {...register('unidade_medida_id')}
                disabled={viewMode}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.unidade_medida_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Selecione uma unidade</option>
                {unidadesMedida?.map(unidade => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
              {errors.unidade_medida_id && (
                <p className="mt-1 text-sm text-red-600">{errors.unidade_medida_id.message}</p>
              )}
            </div>

            {/* Produto Padrão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto Padrão
              </label>
              <select
                {...register('produto_padrao')}
                disabled={viewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
            </div>

            {/* Referência de Mercado */}
            <div>
              <Input
                label="Referência de Mercado"
                type="text"
                {...register('referencia_mercado', {
                  maxLength: { value: 200, message: 'Referência deve ter no máximo 200 caracteres' }
                })}
                error={errors.referencia_mercado?.message}
                disabled={viewMode}
                placeholder="Digite a referência de mercado"
              />
            </div>

            {/* Peso Líquido */}
            <div>
              <Input
                label="Peso Líquido"
                type="number"
                step="0.001"
                {...register('peso_liquido', {
                  min: { value: 0.001, message: 'Peso deve ser maior que 0' },
                  max: { value: 999999.999, message: 'Peso deve ser menor que 999999.999' }
                })}
                error={errors.peso_liquido?.message}
                disabled={viewMode}
                placeholder="0.000"
              />
            </div>

            {/* Peso Bruto */}
            <div>
              <Input
                label="Peso Bruto"
                type="number"
                step="0.001"
                {...register('peso_bruto', {
                  min: { value: 0.001, message: 'Peso deve ser maior que 0' },
                  max: { value: 999999.999, message: 'Peso deve ser menor que 999999.999' }
                })}
                error={errors.peso_bruto?.message}
                disabled={viewMode}
                placeholder="0.000"
              />
            </div>

            {/* Regra Palet */}
            <div>
              <Input
                label="Regra Palet"
                type="number"
                {...register('regra_palet', {
                  min: { value: 1, message: 'Regra deve ser maior que 0' }
                })}
                error={errors.regra_palet?.message}
                disabled={viewMode}
                placeholder="Digite a regra palet"
              />
            </div>

            {/* Referência Interna */}
            <div>
              <Input
                label="Referência Interna"
                type="text"
                {...register('referencia_interna', {
                  maxLength: { value: 200, message: 'Referência deve ter no máximo 200 caracteres' }
                })}
                error={errors.referencia_interna?.message}
                disabled={viewMode}   
                placeholder="Digite a referência interna"
              />
            </div>

            {/* Referência Externa */}
            <div>
              <Input
                label="Referência Externa"
                type="text"
                {...register('referencia_externa', {
                  maxLength: { value: 200, message: 'Referência deve ter no máximo 200 caracteres' }
                })}
                error={errors.referencia_externa?.message}
                disabled={viewMode}
                placeholder="Digite a referência externa"
              />
            </div>

            {/* Registro Específico */}
            <div>
              <Input
                label="Registro Específico"
                type="text"
                {...register('registro_especifico', {
                  maxLength: { value: 200, message: 'Registro deve ter no máximo 200 caracteres' }
                })}
                error={errors.registro_especifico?.message}
                disabled={viewMode}
                placeholder="Digite o registro específico"
              />
            </div>

            {/* Tipo de Registro */}
            <div>
              <Input
                label="Tipo de Registro"
                type="text"
                {...register('tipo_registro', {
                  maxLength: { value: 100, message: 'Tipo deve ter no máximo 100 caracteres' }
                })}
                error={errors.tipo_registro?.message}
                disabled={viewMode}
                placeholder="Digite o tipo de registro"
              />
            </div>

            {/* Prazo de Validade Padrão */}
            <div>
              <Input
                label="Prazo de Validade Padrão"
                type="number"
                {...register('prazo_validade_padrao', {
                  min: { value: 1, message: 'Prazo deve ser maior que 0' }
                })}
                error={errors.prazo_validade_padrao?.message}
                disabled={viewMode}
                placeholder="Digite o prazo de validade"
              />
            </div>

            {/* Unidade de Validade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade de Validade
              </label>
              <select
                {...register('unidade_validade')}
                disabled={viewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione</option>
                <option value="Dias">Dias</option>
                <option value="Semanas">Semanas</option>
                <option value="Meses">Meses</option>
                <option value="Anos">Anos</option>
              </select>
            </div>

            {/* Integração Senior */}
            <div>
              <Input
                label="Integração Senior"
                type="text"
                {...register('integracao_senior', {
                  maxLength: { value: 50, message: 'Integração deve ter no máximo 50 caracteres' }
                })}
                error={errors.integracao_senior?.message}
                disabled={viewMode}
                placeholder="Digite a integração Senior"
              />
            </div>

            {/* Informações Adicionais */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Informações Adicionais
              </label>
              <textarea
                {...register('informacoes_adicionais', {
                  maxLength: { value: 65535, message: 'Informações devem ter no máximo 65535 caracteres' }
                })}
                disabled={viewMode}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.informacoes_adicionais ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite informações adicionais"
              />
              {errors.informacoes_adicionais && (
                <p className="mt-1 text-sm text-red-600">{errors.informacoes_adicionais.message}</p>
              )}
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
