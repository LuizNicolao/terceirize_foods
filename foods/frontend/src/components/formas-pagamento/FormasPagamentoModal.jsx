import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaPlus } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

const FormasPagamentoModal = ({
  isOpen,
  onClose,
  onSubmit,
  formaPagamento,
  viewMode,
  loading
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (formaPagamento && isOpen) {
      // Preencher formulário com dados da forma de pagamento
      Object.keys(formaPagamento).forEach(key => {
        if (formaPagamento[key] !== null && formaPagamento[key] !== undefined) {
          setValue(key, formaPagamento[key]);
        }
      });
      // Converter ativo para string para o select
      setValue('ativo', formaPagamento.ativo === 1 || formaPagamento.ativo === true ? '1' : '0');
    } else if (!formaPagamento && isOpen) {
      // Resetar formulário para nova forma de pagamento
      reset();
      setValue('ativo', '1'); // Padrão: Ativo
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
        ativo: data.ativo === '1' || data.ativo === 1 || data.ativo === true
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
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {isViewMode ? <FaEye className="w-5 h-5 text-white" /> : formaPagamento ? <FaEdit className="w-5 h-5 text-white" /> : <FaPlus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isViewMode ? 'Visualizar Forma de Pagamento' : formaPagamento ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
              </h2>
              <p className="text-sm text-gray-600">
                {isViewMode 
                  ? 'Visualizando informações da forma de pagamento' 
                  : formaPagamento 
                    ? 'Editando informações da forma de pagamento' 
                    : 'Preencha as informações da nova forma de pagamento'}
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

