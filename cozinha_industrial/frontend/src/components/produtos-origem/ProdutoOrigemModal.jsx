import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';
import FoodsApiService from '../../services/FoodsApiService';

const ProdutoOrigemModal = ({
  isOpen,
  onClose,
  onSubmit,
  produtoOrigem,
  isViewMode = false,
  grupos = [],
  subgrupos = [],
  classes = [],
  unidadesMedida = [],
  loading = false
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

  // Estados para dados de referência
  const [referenciaData, setReferenciaData] = useState({
    grupos: [],
    subgrupos: [],
    classes: [],
    unidadesMedida: []
  });

  // Observar mudanças nos campos para filtros dependentes
  const grupoId = watch('grupo_id');
  const subgrupoId = watch('subgrupo_id');

  // Usar dados carregados dinamicamente ou props como fallback
  const gruposDisponiveis = referenciaData.grupos.length > 0 ? referenciaData.grupos : grupos;
  const subgruposDisponiveis = referenciaData.subgrupos.length > 0 ? referenciaData.subgrupos : subgrupos;
  const classesDisponiveis = referenciaData.classes.length > 0 ? referenciaData.classes : classes;
  const unidadesDisponiveis = referenciaData.unidadesMedida.length > 0 ? referenciaData.unidadesMedida : unidadesMedida;

  // Filtrar subgrupos baseado no grupo selecionado
  const subgruposFiltrados = grupoId && grupoId !== '' 
    ? subgruposDisponiveis.filter(sg => String(sg.grupo_id) === String(grupoId))
    : produtoOrigem && produtoOrigem.grupo_id 
      ? subgruposDisponiveis.filter(sg => String(sg.grupo_id) === String(produtoOrigem.grupo_id))
      : [];

  // Filtrar classes baseado no subgrupo selecionado
  const classesFiltradas = subgrupoId && subgrupoId !== '' 
    ? classesDisponiveis.filter(c => String(c.subgrupo_id) === String(subgrupoId))
    : produtoOrigem && produtoOrigem.subgrupo_id 
      ? classesDisponiveis.filter(c => String(c.subgrupo_id) === String(produtoOrigem.subgrupo_id))
      : [];

  // Função para carregar dados de referência
  const carregarDadosReferencia = async () => {
    if (!isViewMode || !isOpen) return;
    
    try {
      const [gruposRes, subgruposRes, classesRes, unidadesRes] = await Promise.all([
        FoodsApiService.getGrupos(),
        FoodsApiService.getSubgrupos(),
        FoodsApiService.getClasses(),
        FoodsApiService.getUnidadesMedida()
      ]);

      setReferenciaData({
        grupos: gruposRes.success ? (gruposRes.data || []) : [],
        subgrupos: subgruposRes.success ? (subgruposRes.data || []) : [],
        classes: classesRes.success ? (classesRes.data || []) : [],
        unidadesMedida: unidadesRes.success ? (unidadesRes.data || []) : []
      });
    } catch (error) {
      console.error('Erro ao carregar dados de referência:', error);
    }
  };

  // Função para carregar dados completos do produto origem
  const carregarProdutoOrigemCompleto = async () => {
    if (!produtoOrigem || !isOpen) return;
    
    // Se já temos dados completos, não precisa buscar novamente
    if (produtoOrigem.unidade_medida_id || produtoOrigem.grupo_id) {
      return;
    }
    
    const produtoId = produtoOrigem.data || produtoOrigem;
    if (typeof produtoId === 'number' || typeof produtoId === 'string') {
      try {
        const response = await FoodsApiService.getProdutoOrigemById(produtoId);
        if (response.success && response.data) {
          // Atualizar o formulário com os dados completos
          Object.keys(response.data).forEach(key => {
            if (response.data[key] !== null && response.data[key] !== undefined) {
              setValue(key, response.data[key]);
            }
          });
        }
      } catch (error) {
        console.error('Erro ao buscar produto origem completo:', error);
      }
    }
  };

  useEffect(() => {
    if (produtoOrigem && isOpen) {
      // Preencher formulário com dados do produto origem
      const produtoData = produtoOrigem.data || produtoOrigem;
      
      Object.keys(produtoData).forEach(key => {
        if (produtoData[key] !== null && produtoData[key] !== undefined) {
          setValue(key, produtoData[key]);
        }
      });
    } else if (!produtoOrigem && isOpen) {
      // Resetar formulário para novo produto origem
      reset();
      setValue('status', 1);
      setValue('fator_conversao', 1.000);
    }
  }, [produtoOrigem, isOpen, setValue, reset]);

  // Carregar dados de referência e produto completo quando abrir em modo visualização
  useEffect(() => {
    if (isViewMode && isOpen) {
      carregarDadosReferencia();
      carregarProdutoOrigemCompleto();
    }
  }, [isViewMode, isOpen, produtoOrigem]);

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
              {isViewMode ? <FaEye className="w-5 h-5 text-white" /> : produtoOrigem ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isViewMode ? 'Visualizar Produto Origem' : produtoOrigem ? 'Editar Produto Origem' : 'Novo Produto Origem'}
              </h2>
              <p className="text-sm text-gray-600">
                {isViewMode ? 'Visualizando informações do produto origem' : produtoOrigem ? 'Editando informações do produto origem' : 'Preencha as informações do novo produto origem'}
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
              disabled={isViewMode}
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
              disabled={isViewMode}
            >
                <option value="">Selecione uma unidade</option>
                {unidadesDisponiveis.map(unidade => (
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
              disabled={isViewMode}
            />

            {/* Grupo */}
            <Input
              label="Grupo"
              type="select"
              {...register('grupo_id')}
              error={errors.grupo_id?.message}
              disabled={isViewMode}
              >
                <option value="">Selecione um grupo</option>
                {gruposDisponiveis.map(grupo => (
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
              disabled={isViewMode || !grupoId}
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
              disabled={isViewMode || !subgrupoId}
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
              disabled={isViewMode}
            />

            {/* Produto Genérico Padrão */}
            <Input
              label="Produto Genérico Padrão"
              type="text"
              value={produtoOrigem?.produto_generico_padrao_nome ? `${produtoOrigem.produto_generico_padrao_codigo} - ${produtoOrigem.produto_generico_padrao_nome}` : 'Nenhum produto genérico vinculado'}
              disabled={true}
              className="bg-gray-50"
            />
          </div>

          {/* Referência de Mercado */}
          <Input
            label="Referência de Mercado"
            {...register('referencia_mercado', {
              maxLength: { value: 200, message: 'Referência de mercado deve ter no máximo 200 caracteres' }
            })}
            error={errors.referencia_mercado?.message}
            disabled={isViewMode}
          />

          {/* Status */}
          <Input
            label="Status"
            type="select"
            {...register('status')}
            error={errors.status?.message}
            disabled={isViewMode}
          >
            <option value={1}>Ativo</option>
            <option value={0}>Inativo</option>
          </Input>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            {!isViewMode && (
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'Salvando...' : produtoOrigem ? 'Atualizar' : 'Criar'}
              </Button>
            )}
            <Button type="button" variant="outline" size="lg" onClick={onClose}>
              {isViewMode ? 'Fechar' : 'Cancelar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProdutoOrigemModal;
