import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../ui';

const TipoRotaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  tipoRota, 
  isViewMode = false,
  filiais = [],
  loadingFiliais = false,
  grupos = [],
  loadingGrupos = false
}) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [gruposSelecionados, setGruposSelecionados] = useState([]);

  React.useEffect(() => {
    if (tipoRota && isOpen) {
      // Preencher campos básicos
      Object.keys(tipoRota).forEach(key => {
        if (key !== 'grupos_id' && key !== 'grupos' && tipoRota[key] !== null && tipoRota[key] !== undefined) {
          setValue(key, tipoRota[key]);
        }
      });
      
      // Preencher grupos selecionados
      if (tipoRota.grupos_id && Array.isArray(tipoRota.grupos_id)) {
        setGruposSelecionados(tipoRota.grupos_id);
        setValue('grupos_id', tipoRota.grupos_id);
      } else if (tipoRota.grupo_id) {
        // Compatibilidade com formato antigo (um grupo apenas)
        setGruposSelecionados([tipoRota.grupo_id]);
        setValue('grupos_id', [tipoRota.grupo_id]);
      }
    } else if (!tipoRota && isOpen) {
      reset();
      setGruposSelecionados([]);
      setValue('status', 'ativo');
      setValue('grupos_id', []);
    }
  }, [tipoRota, isOpen, setValue, reset]);

  const handleGrupoToggle = (grupoId) => {
    const grupoIdNum = parseInt(grupoId);
    let novosGrupos;
    
    if (gruposSelecionados.includes(grupoIdNum)) {
      novosGrupos = gruposSelecionados.filter(id => id !== grupoIdNum);
    } else {
      novosGrupos = [...gruposSelecionados, grupoIdNum];
    }
    
    setGruposSelecionados(novosGrupos);
    setValue('grupos_id', novosGrupos);
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Tipo de Rota' : tipoRota ? 'Editar Tipo de Rota' : 'Adicionar Tipo de Rota'}
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
                label="Nome da Rota *"
                type="text"
                placeholder="Nome da rota"
                {...register('nome')}
                disabled={isViewMode}
              />

              <Input
                label="Filial *"
                type="select"
                {...register('filial_id')}
                disabled={isViewMode || loadingFiliais}
              >
                <option value="">
                  {loadingFiliais ? 'Carregando filiais...' : 'Selecione uma filial'}
                </option>
                {filiais.map(filial => (
                  <option key={filial.id} value={filial.id}>
                    {filial.filial}
                  </option>
                ))}
              </Input>

              <Input
                label="Status"
                type="select"
                {...register('status')}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Input>
            </div>
          </div>

          {/* Card 2: Configurações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Configurações
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grupos * <span className="text-gray-500 text-xs">({gruposSelecionados.length} selecionado{gruposSelecionados.length !== 1 ? 's' : ''})</span>
                </label>
                {loadingGrupos ? (
                  <div className="text-sm text-gray-500">Carregando grupos...</div>
                ) : grupos.length === 0 ? (
                  <div className="text-sm text-gray-500">Nenhum grupo disponível</div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto bg-white">
                    <div className="grid grid-cols-2 gap-2">
                      {grupos.map(grupo => {
                        const isSelected = gruposSelecionados.includes(grupo.id);
                        return (
                          <label
                            key={grupo.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                              isSelected ? 'bg-green-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleGrupoToggle(grupo.id)}
                              disabled={isViewMode}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{grupo.nome}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                <input
                  type="hidden"
                  {...register('grupos_id', {
                    validate: (value) => {
                      if (!value || !Array.isArray(value) || value.length === 0) {
                        return 'Selecione ao menos um grupo';
                      }
                      return true;
                    }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isViewMode}
          >
            Cancelar
          </Button>
          {!isViewMode && (
            <Button type="submit">
              {tipoRota ? 'Atualizar' : 'Criar'} Tipo de Rota
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TipoRotaModal;

