import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaBuilding } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';
import FiliaisService from '../../services/filiais';

const TipoCardapioModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  tipo, 
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
    if (tipo && isOpen) {
      // Preencher formulário com dados do tipo
      Object.keys(tipo).forEach(key => {
        if (tipo[key] !== null && tipo[key] !== undefined) {
          setValue(key, tipo[key]);
        }
      });
      
      // Preencher filiais selecionadas se o tipo já tiver
      if (tipo.filiais && Array.isArray(tipo.filiais)) {
        const filiaisIds = tipo.filiais.map(f => f.id);
        setFiliaisSelecionadas(filiaisIds);
      }
    } else if (isOpen) {
      // Limpar formulário para novo tipo
      reset();
      setFiliaisSelecionadas([]);
    }
  }, [tipo, isOpen, setValue, reset]);

  // Manipular seleção de filiais
  const handleFilialChange = (filialId, checked) => {
    if (checked) {
      setFiliaisSelecionadas(prev => [...prev, filialId]);
    } else {
      setFiliaisSelecionadas(prev => prev.filter(id => id !== filialId));
    }
  };

  // Manipular envio do formulário
  const handleFormSubmit = async (data) => {
    const formData = {
      ...data,
      filiais: filiaisSelecionadas
    };
    
    await onSubmit(formData);
  };

  const getTitle = () => {
    if (tipo) {
      return isViewMode ? 'Visualizar Tipo de Cardápio' : 'Editar Tipo de Cardápio';
    }
    return 'Novo Tipo de Cardápio';
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
                placeholder="Ex: Desjejum, Integral I, Parcial..."
                disabled={isViewMode}
                maxLength={100}
              />
              <Input
                label="Código"
                {...register('codigo')}
                placeholder="Ex: DESJ, INT1..."
                disabled={isViewMode}
                maxLength={50}
                onChange={(e) => setValue('codigo', e.target.value.toUpperCase())}
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

          {/* Card 2: Filiais Vinculadas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Filiais com Acesso
            </h3>
            {isViewMode && tipo?.filiais ? (
              <div className="flex flex-wrap gap-2">
                {tipo.filiais.map(filial => (
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
                            onChange={(e) => handleFilialChange(filial.id, e.target.checked)}
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
                  placeholder="Descrição detalhada do tipo de cardápio..."
                  disabled={isViewMode}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  {...register('observacoes')}
                  rows={2}
                  placeholder="Observações adicionais..."
                  disabled={isViewMode}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
          >
            <FaTimes className="mr-2" />
            {isViewMode ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isViewMode && (
            <Button
              variant="primary"
              type="submit"
            >
              <FaSave className="mr-2" />
              {tipo ? 'Salvar' : 'Criar'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TipoCardapioModal;
