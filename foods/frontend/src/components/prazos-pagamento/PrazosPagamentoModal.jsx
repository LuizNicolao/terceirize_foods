import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaPlus } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

const PrazosPagamentoModal = ({
  isOpen,
  onClose,
  onSubmit,
  prazoPagamento,
  viewMode,
  loading
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  const [saving, setSaving] = useState(false);
  const parcelas = watch('parcelas');

  useEffect(() => {
    if (prazoPagamento && isOpen) {
      // Preencher formulário com dados do prazo de pagamento
      Object.keys(prazoPagamento).forEach(key => {
        if (prazoPagamento[key] !== null && prazoPagamento[key] !== undefined) {
          setValue(key, prazoPagamento[key]);
        }
      });
      // Converter ativo para string para o select
      setValue('ativo', prazoPagamento.ativo === 1 || prazoPagamento.ativo === true ? '1' : '0');
      // Garantir que parcelas seja um número
      setValue('parcelas', prazoPagamento.parcelas || 1);
    } else if (!prazoPagamento && isOpen) {
      // Resetar formulário para novo prazo de pagamento
      reset();
      setValue('ativo', '1'); // Padrão: Ativo
      setValue('parcelas', 1); // Padrão: 1 parcela
      setValue('dias', 0);
    }
  }, [prazoPagamento, isOpen, setValue, reset]);

  const handleFormSubmit = async (data) => {
    setSaving(true);
    try {
      // Converter campos e enviar apenas os campos editáveis
      const formData = {
        nome: data.nome.trim(),
        dias: parseInt(data.dias) || 0,
        parcelas: parseInt(data.parcelas) || 1,
        intervalo_dias: data.parcelas > 1 && data.intervalo_dias ? parseInt(data.intervalo_dias) : null,
        descricao: data.descricao || null,
        ativo: data.ativo === '1' || data.ativo === 1 || data.ativo === true
      };

      // Se parcelas = 1, garantir que intervalo_dias seja null
      if (formData.parcelas === 1) {
        formData.intervalo_dias = null;
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar prazo de pagamento:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = viewMode === true;
  const showIntervalo = parcelas && parseInt(parcelas) > 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {isViewMode ? <FaEye className="w-5 h-5 text-white" /> : prazoPagamento ? <FaEdit className="w-5 h-5 text-white" /> : <FaPlus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isViewMode ? 'Visualizar Prazo de Pagamento' : prazoPagamento ? 'Editar Prazo de Pagamento' : 'Novo Prazo de Pagamento'}
              </h2>
              <p className="text-sm text-gray-600">
                {isViewMode 
                  ? 'Visualizando informações do prazo de pagamento' 
                  : prazoPagamento 
                    ? 'Editando informações do prazo de pagamento' 
                    : 'Preencha as informações do novo prazo de pagamento'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
            disabled={saving}
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Prazo <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('nome', {
                required: 'O nome é obrigatório',
                maxLength: {
                  value: 100,
                  message: 'O nome deve ter no máximo 100 caracteres'
                }
              })}
              placeholder="Ex: 30 dias, À vista, 3x (30/60/90 dias)"
              disabled={isViewMode}
              error={errors.nome?.message}
            />
          </div>

          {/* Grid: Dias e Parcelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dias da 1ª Parcela */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dias da 1ª Parcela <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                {...register('dias', {
                  required: 'O número de dias é obrigatório',
                  min: {
                    value: 0,
                    message: 'O número de dias deve ser maior ou igual a 0'
                  }
                })}
                placeholder="Ex: 0 (à vista), 30, 45"
                disabled={isViewMode}
                error={errors.dias?.message}
              />
              <p className="mt-1 text-xs text-gray-500">0 = à vista</p>
            </div>

            {/* Número de Parcelas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Parcelas <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                {...register('parcelas', {
                  required: 'O número de parcelas é obrigatório',
                  min: {
                    value: 1,
                    message: 'O número de parcelas deve ser pelo menos 1'
                  },
                  max: {
                    value: 12,
                    message: 'O número de parcelas deve ser no máximo 12'
                  }
                })}
                placeholder="Ex: 1, 2, 3"
                disabled={isViewMode}
                error={errors.parcelas?.message}
              />
              <p className="mt-1 text-xs text-gray-500">1 = pagamento único, 2+ = parcelado</p>
            </div>
          </div>

          {/* Intervalo entre Parcelas (condicional) */}
          {showIntervalo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo entre Parcelas (dias)
              </label>
              <Input
                type="number"
                {...register('intervalo_dias', {
                  min: {
                    value: 1,
                    message: 'O intervalo deve ser maior ou igual a 1'
                  }
                })}
                placeholder="Ex: 30 para mensal, 15 para quinzenal"
                disabled={isViewMode}
                error={errors.intervalo_dias?.message}
              />
              <p className="mt-1 text-xs text-gray-500">
                Intervalo em dias entre cada parcela. Se deixar vazio, será usado o valor de "Dias da 1ª Parcela"
              </p>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              {...register('descricao', {
                maxLength: {
                  value: 1000,
                  message: 'A descrição deve ter no máximo 1000 caracteres'
                }
              })}
              placeholder="Descreva os detalhes deste prazo de pagamento"
              rows={4}
              disabled={isViewMode}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                isViewMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
              } ${errors.descricao ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <Input
              type="select"
              {...register('ativo', {
                required: 'O status é obrigatório'
              })}
              disabled={isViewMode}
              error={errors.ativo?.message}
            >
              <option value="">Selecione o status</option>
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </Input>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {isViewMode ? (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                size="sm"
              >
                Fechar
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={saving}
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving || loading}
                  loading={saving}
                  size="sm"
                >
                  <FaSave className="mr-2" />
                  {prazoPagamento ? 'Atualizar' : 'Criar'}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PrazosPagamentoModal;

