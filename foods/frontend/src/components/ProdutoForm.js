import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from './ui';
import produtosService from '../services/produtos';

const ProdutoForm = ({ 
  isOpen, 
  onClose, 
  produto = null, 
  onSuccess,
  grupos = [],
  subgrupos = [],
  classes = [],
  marcas = [],
  nomesGenericos = [],
  unidades = [],
  fornecedores = []
}) => {
  const [loading, setLoading] = useState(false);
  const [subgruposFiltrados, setSubgruposFiltrados] = useState([]);
  const [classesFiltradas, setClassesFiltradas] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm();

  const grupoSelecionado = watch('grupo_id');
  const subgrupoSelecionado = watch('subgrupo_id');

  // Filtrar subgrupos baseado no grupo selecionado
  useEffect(() => {
    if (grupoSelecionado) {
      const filtrados = (subgrupos || []).filter(sub => sub.grupo_id === parseInt(grupoSelecionado));
      setSubgruposFiltrados(filtrados);
      setValue('subgrupo_id', '');
      setValue('classe_id', '');
    } else {
      setSubgruposFiltrados([]);
    }
  }, [grupoSelecionado, subgrupos, setValue]);

  // Filtrar classes baseado no subgrupo selecionado
  useEffect(() => {
    if (subgrupoSelecionado) {
      const filtrados = (classes || []).filter(classe => classe.subgrupo_id === parseInt(subgrupoSelecionado));
      setClassesFiltradas(filtrados);
      setValue('classe_id', '');
    } else {
      setClassesFiltradas([]);
    }
  }, [subgrupoSelecionado, classes, setValue]);

  // Preencher formulário quando editar
  useEffect(() => {
    if (produto) {
      Object.keys(produto).forEach(key => {
        setValue(key, produto[key]);
      });
    } else {
      reset();
    }
  }, [produto, setValue, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (produto) {
        await produtosService.atualizar(produto.id, data);
      } else {
        await produtosService.criar(data);
      }
      onSuccess();
      onClose();
      reset();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={produto ? 'Editar Produto' : 'Novo Produto'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código do Produto */}
          <Input
            label="Código do Produto"
            {...register('codigo_produto', { required: 'Código é obrigatório' })}
            error={errors.codigo_produto?.message}
          />

          {/* Descrição */}
          <Input
            label="Descrição"
            {...register('descricao', { required: 'Descrição é obrigatória' })}
            error={errors.descricao?.message}
          />

          {/* Grupo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo *
            </label>
            <select
              {...register('grupo_id', { required: 'Grupo é obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                             <option value="">Selecione um grupo</option>
               {(grupos || []).map(grupo => (
                 <option key={grupo.id} value={grupo.id}>
                   {grupo.nome_grupo}
                 </option>
               ))}
            </select>
            {errors.grupo_id && (
              <p className="text-red-500 text-sm mt-1">{errors.grupo_id.message}</p>
            )}
          </div>

          {/* Subgrupo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subgrupo *
            </label>
            <select
              {...register('subgrupo_id', { required: 'Subgrupo é obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!grupoSelecionado}
            >
                             <option value="">Selecione um subgrupo</option>
               {(subgruposFiltrados || []).map(subgrupo => (
                 <option key={subgrupo.id} value={subgrupo.id}>
                   {subgrupo.nome_subgrupo}
                 </option>
               ))}
            </select>
            {errors.subgrupo_id && (
              <p className="text-red-500 text-sm mt-1">{errors.subgrupo_id.message}</p>
            )}
          </div>

          {/* Classe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe *
            </label>
            <select
              {...register('classe_id', { required: 'Classe é obrigatória' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!subgrupoSelecionado}
            >
                             <option value="">Selecione uma classe</option>
               {(classesFiltradas || []).map(classe => (
                 <option key={classe.id} value={classe.id}>
                   {classe.nome_classe}
                 </option>
               ))}
            </select>
            {errors.classe_id && (
              <p className="text-red-500 text-sm mt-1">{errors.classe_id.message}</p>
            )}
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca
            </label>
            <select
              {...register('marca_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                             <option value="">Selecione uma marca</option>
               {(marcas || []).map(marca => (
                 <option key={marca.id} value={marca.id}>
                   {marca.nome_marca}
                 </option>
               ))}
            </select>
          </div>

          {/* Nome Genérico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Genérico
            </label>
            <select
              {...register('nome_generico_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                             <option value="">Selecione um nome genérico</option>
               {(nomesGenericos || []).map(nome => (
                 <option key={nome.id} value={nome.id}>
                   {nome.nome_generico}
                 </option>
               ))}
            </select>
          </div>

          {/* Unidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade *
            </label>
            <select
              {...register('unidade_id', { required: 'Unidade é obrigatória' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                             <option value="">Selecione uma unidade</option>
               {(unidades || []).map(unidade => (
                 <option key={unidade.id} value={unidade.id}>
                   {unidade.nome_unidade}
                 </option>
               ))}
            </select>
            {errors.unidade_id && (
              <p className="text-red-500 text-sm mt-1">{errors.unidade_id.message}</p>
            )}
          </div>

          {/* Fornecedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fornecedor
            </label>
            <select
              {...register('fornecedor_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                             <option value="">Selecione um fornecedor</option>
               {(fornecedores || []).map(fornecedor => (
                 <option key={fornecedor.id} value={fornecedor.id}>
                   {fornecedor.razao_social}
                 </option>
               ))}
            </select>
          </div>

          {/* Preço Unitário */}
          <Input
            label="Preço Unitário"
            type="number"
            step="0.01"
            {...register('preco_unitario')}
            error={errors.preco_unitario?.message}
          />

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              {...register('status', { required: 'Status é obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione o status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            {...register('observacoes')}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Observações sobre o produto..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {produto ? 'Atualizar' : 'Criar'} Produto
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProdutoForm; 