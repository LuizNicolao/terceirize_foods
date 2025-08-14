import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave } from 'react-icons/fa';
import { Button, Input } from '../ui';

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
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedSubgrupo, setSelectedSubgrupo] = useState('');

  // Observar mudanças no grupo para filtrar subgrupos
  const grupoId = watch('grupo_id');

  // Filtrar subgrupos baseado no grupo selecionado
  const subgruposFiltrados = grupoId 
    ? subgrupos.filter(sg => sg.grupo_id === parseInt(grupoId))
    : [];

  // Filtrar classes baseado no subgrupo selecionado
  const subgrupoId = watch('subgrupo_id');
  const classesFiltradas = subgrupoId 
    ? classes.filter(c => c.subgrupo_id === parseInt(subgrupoId))
    : [];

  useEffect(() => {
    if (produtoOrigem) {
      reset({
        codigo: produtoOrigem.codigo || '',
        nome: produtoOrigem.nome || '',
        unidade_medida_id: produtoOrigem.unidade_medida_id || '',
        fator_conversao: produtoOrigem.fator_conversao || '1.000',
        grupo_id: produtoOrigem.grupo_id || '',
        subgrupo_id: produtoOrigem.subgrupo_id || '',
        classe_id: produtoOrigem.classe_id || '',
        peso_liquido: produtoOrigem.peso_liquido || '',
        referencia_mercado: produtoOrigem.referencia_mercado || '',
        produto_generico_padrao_id: produtoOrigem.produto_generico_padrao_id || '',
        status: produtoOrigem.status !== undefined ? produtoOrigem.status : 1
      });
      setSelectedGrupo(produtoOrigem.grupo_id || '');
      setSelectedSubgrupo(produtoOrigem.subgrupo_id || '');
    } else {
      reset({
        codigo: '',
        nome: '',
        unidade_medida_id: '',
        fator_conversao: '1.000',
        grupo_id: '',
        subgrupo_id: '',
        classe_id: '',
        peso_liquido: '',
        referencia_mercado: '',
        produto_generico_padrao_id: '',
        status: 1
      });
      setSelectedGrupo('');
      setSelectedSubgrupo('');
    }
  }, [produtoOrigem, reset]);

  const handleFormSubmit = (data) => {
    // Converter valores numéricos
    const formData = {
      ...data,
      fator_conversao: data.fator_conversao ? parseFloat(data.fator_conversao) : 1.000,
      peso_liquido: data.peso_liquido ? parseFloat(data.peso_liquido) : null,
      grupo_id: data.grupo_id ? parseInt(data.grupo_id) : null,
      subgrupo_id: data.subgrupo_id ? parseInt(data.subgrupo_id) : null,
      classe_id: data.classe_id ? parseInt(data.classe_id) : null,
      produto_generico_padrao_id: data.produto_generico_padrao_id ? parseInt(data.produto_generico_padrao_id) : null,
      status: data.status ? 1 : 0
    };

    onSubmit(formData);
  };

  const handleGrupoChange = (e) => {
    const grupoId = e.target.value;
    setSelectedGrupo(grupoId);
    setValue('subgrupo_id', '');
    setValue('classe_id', '');
    setSelectedSubgrupo('');
  };

  const handleSubgrupoChange = (e) => {
    const subgrupoId = e.target.value;
    setSelectedSubgrupo(subgrupoId);
    setValue('classe_id', '');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {viewMode ? 'Visualizar' : produtoOrigem ? 'Editar' : 'Novo'} Produto Origem
          </h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <FaTimes className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código *
              </label>
              <Input
                {...register('codigo', { 
                  required: 'Código é obrigatório',
                  pattern: {
                    value: /^[a-zA-Z0-9\-_]+$/,
                    message: 'Código deve conter apenas letras, números, hífens e underscores'
                  }
                })}
                placeholder="Digite o código"
                disabled={viewMode}
                error={errors.codigo?.message}
              />
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <Input
                {...register('nome', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' }
                })}
                placeholder="Digite o nome"
                disabled={viewMode}
                error={errors.nome?.message}
              />
            </div>

            {/* Unidade de Medida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade de Medida *
              </label>
              <Select
                {...register('unidade_medida_id', { required: 'Unidade de medida é obrigatória' })}
                disabled={viewMode}
                error={errors.unidade_medida_id?.message}
              >
                <option value="">Selecione uma unidade</option>
                {unidadesMedida.map(unidade => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.nome}
                  </option>
                ))}
              </Select>
            </div>

            {/* Fator de Conversão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fator de Conversão
              </label>
              <Input
                {...register('fator_conversao', {
                  pattern: {
                    value: /^\d+(\.\d{1,3})?$/,
                    message: 'Fator de conversão deve ser um número válido'
                  }
                })}
                type="number"
                step="0.001"
                min="0.001"
                placeholder="1.000"
                disabled={viewMode}
                error={errors.fator_conversao?.message}
              />
            </div>

            {/* Grupo */}
            <div>
              <Input
                label="Grupo"
                type="select"
                {...register('grupo_id')}
                onChange={handleGrupoChange}
                disabled={viewMode}
                error={errors.grupo_id?.message}
              >
                <option value="">Selecione um grupo</option>
                {grupos.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </Input>
            </div>

            {/* Subgrupo */}
            <div>
              <Input
                label="Subgrupo"
                type="select"
                {...register('subgrupo_id')}
                onChange={handleSubgrupoChange}
                disabled={viewMode || !grupoId}
                error={errors.subgrupo_id?.message}
              >
                <option value="">Selecione um subgrupo</option>
                {subgruposFiltrados.map(subgrupo => (
                  <option key={subgrupo.id} value={subgrupo.id}>
                    {subgrupo.nome}
                  </option>
                ))}
              </Input>
            </div>

            {/* Classe */}
            <div>
              <Input
                label="Classe"
                type="select"
                {...register('classe_id')}
                disabled={viewMode || !subgrupoId}
                error={errors.classe_id?.message}
              >
                <option value="">Selecione uma classe</option>
                {classesFiltradas.map(classe => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nome}
                  </option>
                ))}
              </Input>
            </div>

            {/* Peso Líquido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Líquido (kg)
              </label>
              <Input
                {...register('peso_liquido', {
                  pattern: {
                    value: /^\d+(\.\d{1,3})?$/,
                    message: 'Peso líquido deve ser um número válido'
                  }
                })}
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.000"
                disabled={viewMode}
                error={errors.peso_liquido?.message}
              />
            </div>

            {/* Produto Genérico Padrão */}
            <div>
              <Input
                label="Produto Genérico Padrão"
                type="select"
                {...register('produto_generico_padrao_id')}
                disabled={viewMode}
                error={errors.produto_generico_padrao_id?.message}
              >
                <option value="">Selecione um produto genérico</option>
                {produtosGenericosPadrao.map(produto => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome}
                  </option>
                ))}
              </Input>
            </div>
          </div>

          {/* Referência de Mercado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referência de Mercado
            </label>
            <Input
              {...register('referencia_mercado')}
              placeholder="Digite a referência de mercado"
              disabled={viewMode}
              error={errors.referencia_mercado?.message}
            />
          </div>

          {/* Status */}
          <div>
            <Input
              label="Produto ativo"
              type="checkbox"
              {...register('status')}
              disabled={viewMode}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={loading}
            >
              Cancelar
            </Button>
            {!viewMode && (
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                <FaSave className="mr-2 h-4 w-4" />
                {loading ? 'Salvando...' : produtoOrigem ? 'Atualizar' : 'Criar'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProdutoOrigemModal;
