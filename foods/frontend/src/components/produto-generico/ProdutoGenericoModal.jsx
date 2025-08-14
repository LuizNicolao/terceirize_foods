/**
 * Modal para Produto Genérico
 * Componente para criação e edição de produtos genéricos
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave } from 'react-icons/fa';

const ProdutoGenericoModal = ({
  isOpen,
  onClose,
  mode,
  produtoGenerico,
  grupos,
  subgrupos,
  classes,
  produtosOrigem,
  unidadesMedida,
  onSubmit
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

  // Carregar dados quando o modal abrir para edição
  useEffect(() => {
    if (isOpen && produtoGenerico && mode === 'edit') {
      reset({
        codigo: produtoGenerico.codigo,
        nome: produtoGenerico.nome,
        produto_origem_id: produtoGenerico.produto_origem_id || '',
        fator_conversao: produtoGenerico.fator_conversao || 1.000,
        grupo_id: produtoGenerico.grupo_id || '',
        subgrupo_id: produtoGenerico.subgrupo_id || '',
        classe_id: produtoGenerico.classe_id || '',
        unidade_medida_id: produtoGenerico.unidade_medida_id || '',
        referencia_mercado: produtoGenerico.referencia_mercado || '',
        produto_padrao: produtoGenerico.produto_padrao || 'Não',
        peso_liquido: produtoGenerico.peso_liquido || '',
        peso_bruto: produtoGenerico.peso_bruto || '',
        regra_palet: produtoGenerico.regra_palet || '',
        informacoes_adicionais: produtoGenerico.informacoes_adicionais || '',
        referencia_interna: produtoGenerico.referencia_interna || '',
        referencia_externa: produtoGenerico.referencia_externa || '',
        registro_especifico: produtoGenerico.registro_especifico || '',
        tipo_registro: produtoGenerico.tipo_registro || '',
        prazo_validade_padrao: produtoGenerico.prazo_validade_padrao || '',
        unidade_validade: produtoGenerico.unidade_validade || '',
        integracao_senior: produtoGenerico.integracao_senior || '',
        status: produtoGenerico.status !== undefined ? produtoGenerico.status : 1
      });
    } else if (isOpen && mode === 'create') {
      reset({
        codigo: '',
        nome: '',
        produto_origem_id: '',
        fator_conversao: 1.000,
        grupo_id: '',
        subgrupo_id: '',
        classe_id: '',
        unidade_medida_id: '',
        referencia_mercado: '',
        produto_padrao: 'Não',
        peso_liquido: '',
        peso_bruto: '',
        regra_palet: '',
        informacoes_adicionais: '',
        referencia_interna: '',
        referencia_externa: '',
        registro_especifico: '',
        tipo_registro: '',
        prazo_validade_padrao: '',
        unidade_validade: '',
        integracao_senior: '',
        status: 1
      });
    }
  }, [isOpen, produtoGenerico, mode, reset]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Novo Produto Genérico' : 'Editar Produto Genérico'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código *
              </label>
              <input
                type="number"
                {...register('codigo', { 
                  required: 'Código é obrigatório',
                  min: { value: 1, message: 'Código deve ser maior que 0' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.codigo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite o código"
              />
              {errors.codigo && (
                <p className="mt-1 text-sm text-red-600">{errors.codigo.message}</p>
              )}
            </div>

            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                {...register('nome', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
                  maxLength: { value: 200, message: 'Nome deve ter no máximo 200 caracteres' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.nome ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite o nome do produto genérico"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            {/* Produto Origem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto Origem
              </label>
              <select
                {...register('produto_origem_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um produto origem</option>
                {produtosOrigem.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.codigo} - {produto.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Fator de Conversão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fator de Conversão
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                {...register('fator_conversao', {
                  min: { value: 0.001, message: 'Fator deve ser maior que 0' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.fator_conversao ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="1.000"
              />
              {errors.fator_conversao && (
                <p className="mt-1 text-sm text-red-600">{errors.fator_conversao.message}</p>
              )}
            </div>

            {/* Unidade de Medida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade de Medida
              </label>
              <select
                {...register('unidade_medida_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma unidade</option>
                {unidadesMedida.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo
              </label>
              <select
                {...register('grupo_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um grupo</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Subgrupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subgrupo
              </label>
              <select
                {...register('subgrupo_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!grupoId || grupoId === ''}
              >
                <option value="">Selecione um subgrupo</option>
                {subgruposFiltrados.map((subgrupo) => (
                  <option key={subgrupo.id} value={subgrupo.id}>
                    {subgrupo.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Classe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe
              </label>
              <select
                {...register('classe_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!subgrupoId || subgrupoId === ''}
              >
                <option value="">Selecione uma classe</option>
                {classesFiltradas.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Produto Padrão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto Padrão
              </label>
              <select
                {...register('produto_padrao')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
            </div>

            {/* Peso Líquido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Líquido (kg)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                {...register('peso_liquido', {
                  min: { value: 0.001, message: 'Peso deve ser maior que 0' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.peso_liquido ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="0.000"
              />
              {errors.peso_liquido && (
                <p className="mt-1 text-sm text-red-600">{errors.peso_liquido.message}</p>
              )}
            </div>

            {/* Peso Bruto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Bruto (kg)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                {...register('peso_bruto', {
                  min: { value: 0.001, message: 'Peso deve ser maior que 0' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.peso_bruto ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="0.000"
              />
              {errors.peso_bruto && (
                <p className="mt-1 text-sm text-red-600">{errors.peso_bruto.message}</p>
              )}
            </div>

            {/* Regra Palet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regra Palet
              </label>
              <input
                type="number"
                min="1"
                {...register('regra_palet', {
                  min: { value: 1, message: 'Regra palet deve ser maior que 0' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.regra_palet ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite a regra palet"
              />
              {errors.regra_palet && (
                <p className="mt-1 text-sm text-red-600">{errors.regra_palet.message}</p>
              )}
            </div>

            {/* Referência de Mercado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referência de Mercado
              </label>
              <input
                type="text"
                {...register('referencia_mercado', {
                  maxLength: { value: 200, message: 'Referência deve ter no máximo 200 caracteres' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.referencia_mercado ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite a referência de mercado"
              />
              {errors.referencia_mercado && (
                <p className="mt-1 text-sm text-red-600">{errors.referencia_mercado.message}</p>
              )}
            </div>

            {/* Referência Interna */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referência Interna
              </label>
              <input
                type="text"
                {...register('referencia_interna', {
                  maxLength: { value: 200, message: 'Referência deve ter no máximo 200 caracteres' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.referencia_interna ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite a referência interna"
              />
              {errors.referencia_interna && (
                <p className="mt-1 text-sm text-red-600">{errors.referencia_interna.message}</p>
              )}
            </div>

            {/* Referência Externa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referência Externa
              </label>
              <input
                type="text"
                {...register('referencia_externa', {
                  maxLength: { value: 200, message: 'Referência deve ter no máximo 200 caracteres' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.referencia_externa ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite a referência externa"
              />
              {errors.referencia_externa && (
                <p className="mt-1 text-sm text-red-600">{errors.referencia_externa.message}</p>
              )}
            </div>

            {/* Registro Específico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registro Específico
              </label>
              <input
                type="text"
                {...register('registro_especifico', {
                  maxLength: { value: 200, message: 'Registro deve ter no máximo 200 caracteres' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.registro_especifico ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite o registro específico"
              />
              {errors.registro_especifico && (
                <p className="mt-1 text-sm text-red-600">{errors.registro_especifico.message}</p>
              )}
            </div>

            {/* Tipo de Registro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Registro
              </label>
              <input
                type="text"
                {...register('tipo_registro', {
                  maxLength: { value: 100, message: 'Tipo deve ter no máximo 100 caracteres' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.tipo_registro ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite o tipo de registro"
              />
              {errors.tipo_registro && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo_registro.message}</p>
              )}
            </div>

            {/* Prazo de Validade Padrão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prazo de Validade Padrão
              </label>
              <input
                type="number"
                min="1"
                {...register('prazo_validade_padrao', {
                  min: { value: 1, message: 'Prazo deve ser maior que 0' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.prazo_validade_padrao ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite o prazo de validade"
              />
              {errors.prazo_validade_padrao && (
                <p className="mt-1 text-sm text-red-600">{errors.prazo_validade_padrao.message}</p>
              )}
            </div>

            {/* Unidade de Validade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade de Validade
              </label>
              <select
                {...register('unidade_validade')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a unidade</option>
                <option value="Dias">Dias</option>
                <option value="Semanas">Semanas</option>
                <option value="Meses">Meses</option>
                <option value="Anos">Anos</option>
              </select>
            </div>

            {/* Integração Senior */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Integração Senior
              </label>
              <input
                type="text"
                {...register('integracao_senior', {
                  maxLength: { value: 50, message: 'Integração deve ter no máximo 50 caracteres' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.integracao_senior ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Digite o código de integração"
              />
              {errors.integracao_senior && (
                <p className="mt-1 text-sm text-red-600">{errors.integracao_senior.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Ativo</option>
                <option value={0}>Inativo</option>
              </select>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Informações Adicionais
            </label>
            <textarea
              {...register('informacoes_adicionais', {
                maxLength: { value: 65535, message: 'Informações devem ter no máximo 65535 caracteres' }
              })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.informacoes_adicionais ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Digite informações adicionais sobre o produto"
            />
            {errors.informacoes_adicionais && (
              <p className="mt-1 text-sm text-red-600">{errors.informacoes_adicionais.message}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaSave className="mr-2" />
              {mode === 'create' ? 'Criar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProdutoGenericoModal;
