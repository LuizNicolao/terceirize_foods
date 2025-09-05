import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input } from '../ui';
import IntoleranciasService from '../../services/intolerancias';
import UnidadesEscolaresService from '../../services/unidadesEscolares';

const EfetivoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  efetivo, 
  isViewMode = false,
  unidadeEscolarId = null,
  periodoRefeicao = null
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const [intolerancias, setIntolerancias] = useState([]);
  const [loadingIntolerancias, setLoadingIntolerancias] = useState(false);
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  
  const tipoEfetivo = watch('tipo_efetivo');

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      if (!unidadeEscolarId) {
        loadUnidadesEscolares();
      }
      loadIntolerancias();
    }
  }, [isOpen, unidadeEscolarId]);

  const loadUnidadesEscolares = async () => {
    setLoadingUnidades(true);
    try {
      const result = await UnidadesEscolaresService.listar();
      if (result.success) {
        setUnidadesEscolares(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
    } finally {
      setLoadingUnidades(false);
    }
  };

  const loadIntolerancias = async () => {
    setLoadingIntolerancias(true);
    try {
      const result = await IntoleranciasService.buscarAtivas();
      if (result.success) {
        setIntolerancias(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar intolerâncias:', error);
    } finally {
      setLoadingIntolerancias(false);
    }
  };

  React.useEffect(() => {
    if (efetivo && isOpen) {
      // Preencher formulário com dados do efetivo
      Object.keys(efetivo).forEach(key => {
        if (efetivo[key] !== null && efetivo[key] !== undefined) {
          setValue(key, efetivo[key]);
        }
      });
    } else if (!efetivo && isOpen) {
      // Resetar formulário para novo efetivo
      reset();
      setValue('tipo_efetivo', 'PADRAO');
      setValue('quantidade', 1);
      if (unidadeEscolarId) {
        setValue('unidade_escolar_id', unidadeEscolarId);
      }
    }
  }, [efetivo, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    setIntolerancias([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isViewMode ? 'Visualizar Efetivo' : efetivo ? 'Editar Efetivo' : 'Adicionar Efetivo'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-h-[75vh] overflow-y-auto">
        {/* Informações do Período (se fornecido) */}
        {periodoRefeicao && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-700 mb-2">
              📅 Período de Refeição
            </h3>
            <p className="text-sm text-blue-600">
              <strong>Nome:</strong> {periodoRefeicao.nome}
            </p>
            {periodoRefeicao.descricao && (
              <p className="text-sm text-blue-600">
                <strong>Descrição:</strong> {periodoRefeicao.descricao}
              </p>
            )}
          </div>
        )}

        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <div className="space-y-3">
              {!unidadeEscolarId && (
                <Input
                  label="Unidade Escolar *"
                  type="select"
                  {...register('unidade_escolar_id', {
                    required: 'Unidade escolar é obrigatória'
                  })}
                  error={errors.unidade_escolar_id?.message}
                  disabled={isViewMode || loadingUnidades}
                >
                  <option value="">
                    {loadingUnidades ? 'Carregando unidades...' : 'Selecione a unidade escolar'}
                  </option>
                  {unidadesEscolares.map(unidade => (
                    <option key={unidade.id} value={unidade.id}>
                      {unidade.nome_escola}
                    </option>
                  ))}
                </Input>
              )}

              <Input
                label="Tipo de Efetivo *"
                type="select"
                {...register('tipo_efetivo', {
                  required: 'Tipo de efetivo é obrigatório'
                })}
                error={errors.tipo_efetivo?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione o tipo</option>
                <option value="PADRAO">Padrão</option>
                <option value="NAE">NAE</option>
              </Input>

              <Input
                label="Quantidade *"
                type="number"
                placeholder="Digite a quantidade"
                {...register('quantidade', {
                  required: 'Quantidade é obrigatória',
                  min: {
                    value: 1,
                    message: 'Quantidade deve ser maior que zero'
                  }
                })}
                error={errors.quantidade?.message}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 2: Intolerância (se NAE) */}
          {tipoEfetivo === 'NAE' && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Intolerância
              </h3>
              <div className="space-y-3">
                <Input
                  label="Intolerância *"
                  type="select"
                  {...register('intolerancia_id', {
                    required: tipoEfetivo === 'NAE' ? 'Intolerância é obrigatória para NAE' : false
                  })}
                  error={errors.intolerancia_id?.message}
                  disabled={isViewMode || loadingIntolerancias}
                >
                  <option value="">
                    {loadingIntolerancias ? 'Carregando intolerâncias...' : 'Selecione a intolerância'}
                  </option>
                  {intolerancias.map(intolerancia => (
                    <option key={intolerancia.id} value={intolerancia.id}>
                      {intolerancia.nome}
                    </option>
                  ))}
                </Input>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {efetivo ? 'Atualizar' : 'Criar'} Efetivo
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default EfetivoModal;
