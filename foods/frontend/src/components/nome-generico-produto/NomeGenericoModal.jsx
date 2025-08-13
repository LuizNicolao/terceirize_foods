import React from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

const NomeGenericoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  nomeGenerico, 
  isViewMode = false,
  grupos = [],
  subgrupos = [],
  classes = []
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

  // Observar mudanças nos campos para filtros dependentes
  const grupoId = watch('grupo_id');
  const subgrupoId = watch('subgrupo_id');

  // Filtrar subgrupos baseado no grupo selecionado
  const subgruposFiltrados = grupoId && grupoId !== '' 
    ? subgrupos.filter(sg => String(sg.grupo_id) === String(grupoId))
    : subgrupos;

  // Filtrar classes baseado no subgrupo selecionado
  const classesFiltradas = subgrupoId && subgrupoId !== '' 
    ? classes.filter(c => String(c.subgrupo_id) === String(subgrupoId))
    : classes;

  React.useEffect(() => {
    if (nomeGenerico && isOpen) {
      // Preencher formulário com dados do nome genérico
      Object.keys(nomeGenerico).forEach(key => {
        if (nomeGenerico[key] !== null && nomeGenerico[key] !== undefined) {
          setValue(key, nomeGenerico[key]);
        }
      });
      setValue('status', nomeGenerico.status === 1 ? 'ativo' : 'inativo');
    } else if (!nomeGenerico && isOpen) {
      // Resetar formulário para novo nome genérico
      reset();
      setValue('status', 'ativo');
    }
  }, [nomeGenerico, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Nome Genérico' : nomeGenerico ? 'Editar Nome Genérico' : 'Adicionar Nome Genérico'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <div className="space-y-3">
              <Input
                label="Nome Genérico *"
                {...register('nome', { required: 'Nome é obrigatório' })}
                error={errors.nome?.message}
                disabled={isViewMode}
              />
              <Input
                label="Status"
                type="select"
                {...register('status')}
                error={errors.status?.message}
                disabled={isViewMode}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Input>
            </div>
          </div>

          {/* Card 2: Classificação */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Classificação
            </h3>
            <div className="space-y-3">
              <Input
                label="Grupo"
                type="select"
                {...register('grupo_id')}
                error={errors.grupo_id?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione um grupo</option>
                {grupos.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </Input>
              <Input
                label="Subgrupo"
                type="select"
                {...register('subgrupo_id')}
                error={errors.subgrupo_id?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione um subgrupo</option>
                {subgruposFiltrados.map(subgrupo => (
                  <option key={subgrupo.id} value={subgrupo.id}>
                    {subgrupo.nome}
                  </option>
                ))}
              </Input>
              <Input
                label="Classe"
                type="select"
                {...register('classe_id')}
                error={errors.classe_id?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione uma classe</option>
                {classesFiltradas.map(classe => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nome}
                  </option>
                ))}
              </Input>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
            >
              {nomeGenerico ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default NomeGenericoModal;
