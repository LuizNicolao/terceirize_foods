import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaBuilding } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';
import FiliaisService from '../../services/filiais';

const PeriodoRefeicaoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  periodo, 
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [filiaisSelecionadas, setFiliaisSelecionadas] = useState([]);

  // Carregar filiais quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadFiliais();
    }
  }, [isOpen]);

  // Carregar filiais disponíveis
  const loadFiliais = async () => {
    try {
      setLoadingFiliais(true);
      const result = await FiliaisService.buscarAtivas();
      if (result.success) {
        setFiliais(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoadingFiliais(false);
    }
  };

  React.useEffect(() => {
    if (periodo && isOpen) {
      // Preencher formulário com dados do período
      Object.keys(periodo).forEach(key => {
        if (periodo[key] !== null && periodo[key] !== undefined) {
          setValue(key, periodo[key]);
        }
      });
      
      // Preencher filiais selecionadas se o período já tiver
      if (periodo.filiais && Array.isArray(periodo.filiais)) {
        setFiliaisSelecionadas(periodo.filiais.map(f => f.id || f));
      }
    } else if (isOpen) {
      // Limpar formulário para novo período
      reset();
      setFiliaisSelecionadas([]);
    }
  }, [periodo, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    const formData = {
      ...data,
      filiais: filiaisSelecionadas
    };
    onSubmit(formData);
  };

  const handleFilialToggle = (filialId) => {
    setFiliaisSelecionadas(prev => {
      if (prev.includes(filialId)) {
        return prev.filter(id => id !== filialId);
      } else {
        return [...prev, filialId];
      }
    });
  };

  const getTitle = () => {
    if (periodo) {
      return isViewMode ? 'Visualizar Período de Refeição' : 'Editar Período de Refeição';
    }
    return 'Novo Período de Refeição';
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
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
                label="Nome *"
                {...register('nome', { required: 'Nome é obrigatório' })}
                placeholder="Ex: Matutino, Almoço, Jantar"
                disabled={isViewMode}
                maxLength={100}
              />
              <Input
                label="Código"
                {...register('codigo')}
                placeholder="Ex: MATUTINO, ALMOCO"
                disabled={isViewMode}
                maxLength={20}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Filiais com Acesso */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Filiais com Acesso
            </h3>
            {isViewMode && periodo?.filiais ? (
              <div className="flex flex-wrap gap-2">
                {periodo.filiais.map(filial => (
                  <span
                    key={filial.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {filial.filial}
                  </span>
                ))}
              </div>
            ) : !isViewMode ? (
              <div>
                {loadingFiliais ? (
                  <div className="text-gray-500 text-center py-4">Carregando filiais...</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filiais.length === 0 ? (
                      <div className="text-gray-500 text-center py-4">Nenhuma filial disponível</div>
                    ) : (
                      filiais.map(filial => (
                        <label key={filial.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded">
                          <input
                            type="checkbox"
                            checked={filiaisSelecionadas.includes(filial.id)}
                            onChange={(e) => handleFilialToggle(filial.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">{filial.filial}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">Nenhuma filial vinculada</div>
            )}
          </div>
        </div>

        {/* Segunda Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 3: Descrição e Observações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Descrição e Observações
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  {...register('descricao')}
                  rows={3}
                  placeholder="Descrição detalhada do período de refeição..."
                  disabled={isViewMode}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  {...register('observacoes')}
                  rows={3}
                  placeholder="Observações adicionais..."
                  disabled={isViewMode}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        {!isViewMode && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <FaTimes className="text-sm" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex items-center gap-2"
              disabled={filiaisSelecionadas.length === 0}
            >
              <FaSave className="text-sm" />
              {periodo && periodo.id ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        )}

        {isViewMode && (
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <FaEye className="text-sm" />
              Fechar
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default PeriodoRefeicaoModal;
