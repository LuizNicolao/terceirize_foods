import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '../ui';

const NomeGenericoProdutoModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingNomeGenerico,
  viewMode,
  grupos,
  subgrupos,
  classes,
  loadingGrupos,
  loadingSubgrupos,
  loadingClasses,
  loadSubgrupos,
  loadClasses
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  // Observar mudanças nos campos para carregar dados dependentes
  const selectedGrupo = watch('grupo_id');
  const selectedSubgrupo = watch('subgrupo_id');

  // Carregar subgrupos quando grupo mudar
  useEffect(() => {
    if (selectedGrupo && selectedGrupo !== '') {
      loadSubgrupos(selectedGrupo);
    } else {
      loadSubgrupos();
    }
  }, [selectedGrupo, loadSubgrupos]);

  // Carregar classes quando subgrupo mudar
  useEffect(() => {
    if (selectedSubgrupo && selectedSubgrupo !== '') {
      loadClasses(selectedSubgrupo);
    } else {
      loadClasses();
    }
  }, [selectedSubgrupo, loadClasses]);

  // Preencher formulário quando editingNomeGenerico mudar
  useEffect(() => {
    if (editingNomeGenerico) {
      setValue('nome', editingNomeGenerico.nome);
      setValue('grupo_id', editingNomeGenerico.grupo_id?.toString() || '');
      setValue('subgrupo_id', editingNomeGenerico.subgrupo_id?.toString() || '');
      setValue('classe_id', editingNomeGenerico.classe_id?.toString() || '');
      setValue('status', editingNomeGenerico.status === 1 ? '1' : '0');
    } else {
      reset();
    }
  }, [editingNomeGenerico, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        viewMode
          ? 'Visualizar Nome Genérico'
          : editingNomeGenerico
          ? 'Editar Nome Genérico'
          : 'Novo Nome Genérico'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nome"
            {...register('nome', { required: 'Nome é obrigatório' })}
            error={errors.nome?.message}
            disabled={viewMode}
            placeholder="Digite o nome do produto"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status', { required: 'Status é obrigatório' })}
              disabled={viewMode}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.status ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo
            </label>
            <select
              {...register('grupo_id')}
              disabled={viewMode || loadingGrupos}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione um grupo</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subgrupo
            </label>
            <select
              {...register('subgrupo_id')}
              disabled={viewMode || loadingSubgrupos}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione um subgrupo</option>
              {subgrupos.map((subgrupo) => (
                <option key={subgrupo.id} value={subgrupo.id}>
                  {subgrupo.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe
            </label>
            <select
              {...register('classe_id')}
              disabled={viewMode || loadingClasses}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione uma classe</option>
              {classes.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!viewMode && (
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingNomeGenerico ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default NomeGenericoProdutoModal;
