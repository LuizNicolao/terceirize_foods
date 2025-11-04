import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaCreditCard } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

const FormasPagamentoModal = ({
  isOpen,
  onClose,
  onSubmit,
  formaPagamento,
  viewMode,
  loading
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  const [saving, setSaving] = useState(false);

  const ativo = watch('ativo');

  useEffect(() => {
    if (formaPagamento && isOpen) {
      // Preencher formulário com dados da forma de pagamento
      Object.keys(formaPagamento).forEach(key => {
        if (formaPagamento[key] !== null && formaPagamento[key] !== undefined) {
          setValue(key, formaPagamento[key]);
        }
      });
      // Garantir que ativo seja boolean
      setValue('ativo', formaPagamento.ativo === 1 || formaPagamento.ativo === true);
    } else if (!formaPagamento && isOpen) {
      // Resetar formulário para nova forma de pagamento
      reset();
      setValue('ativo', true);
    }
  }, [formaPagamento, isOpen, setValue, reset]);

  const handleFormSubmit = async (data) => {
    setSaving(true);
    try {
      // Converter campos e enviar apenas os campos editáveis
      const formData = {
        nome: data.nome.trim(),
        descricao: data.descricao || null,
        prazo_padrao: data.prazo_padrao || null,
        ativo: data.ativo === true || data.ativo === 1 || data.ativo === '1'
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar forma de pagamento:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = viewMode === true;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCreditCard className="text-green-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {isViewMode ? 'Visualizar' : formaPagamento ? 'Editar' : 'Nova'} Forma de Pagamento
              </h2>
              <p className="text-sm text-gray-600">
                {isViewMode 
                  ? 'Visualize os detalhes da forma de pagamento' 
                  : formaPagamento 
                    ? 'Atualize as informações da forma de pagamento' 
                    : 'Preencha os dados para criar uma nova forma de pagamento'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Forma de Pagamento <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('nome', {
                required: 'O nome é obrigatório',
                maxLength: {
                  value: 100,
                  message: 'O nome deve ter no máximo 100 caracteres'
                }
              })}
              placeholder="Ex: Boleto Bancário, PIX, Cartão de Crédito"
              disabled={isViewMode}
              error={errors.nome?.message}
            />
          </div>

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
              placeholder="Descreva os detalhes desta forma de pagamento"
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

          {/* Prazo Padrão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prazo Padrão
            </label>
            <Input
              {...register('prazo_padrao', {
                maxLength: {
                  value: 50,
                  message: 'O prazo padrão deve ter no máximo 50 caracteres'
                }
              })}
              placeholder="Ex: 30 dias, À vista"
              disabled={isViewMode}
              error={errors.prazo_padrao?.message}
            />
          </div>

          {/* Ativo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativo"
              {...register('ativo')}
              disabled={isViewMode}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="ativo" className="ml-2 block text-sm text-gray-700">
              Forma de pagamento ativa
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {isViewMode ? (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
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
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving || loading}
                  loading={saving}
                >
                  <FaSave className="mr-2" />
                  {formaPagamento ? 'Atualizar' : 'Criar'}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default FormasPagamentoModal;

