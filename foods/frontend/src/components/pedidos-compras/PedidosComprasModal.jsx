import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaPlus } from 'react-icons/fa';
import { Button, Input, Modal, SearchableSelect } from '../ui';
import PedidosComprasService from '../../services/pedidosComprasService';
import toast from 'react-hot-toast';

const PedidosComprasModal = ({
  isOpen,
  onClose,
  onSubmit,
  pedidoCompras,
  viewMode,
  loading,
  solicitacoesDisponiveis = []
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  const [saving, setSaving] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);

  useEffect(() => {
    if (pedidoCompras && isOpen) {
      // Preencher formulário com dados do pedido
      Object.keys(pedidoCompras).forEach(key => {
        if (pedidoCompras[key] !== null && pedidoCompras[key] !== undefined && key !== 'itens') {
          setValue(key, pedidoCompras[key]);
        }
      });
      setSolicitacaoSelecionada(pedidoCompras);
    } else if (!pedidoCompras && isOpen) {
      // Resetar formulário para novo pedido
      reset();
    }
  }, [pedidoCompras, isOpen, setValue, reset]);

  const handleFormSubmit = async (data) => {
    setSaving(true);
    try {
      const formData = {
        solicitacao_compras_id: data.solicitacao_compras_id,
        fornecedor_nome: data.fornecedor_nome?.trim(),
        fornecedor_cnpj: data.fornecedor_cnpj || null,
        forma_pagamento: data.forma_pagamento || null,
        prazo_pagamento: data.prazo_pagamento || null,
        observacoes: data.observacoes || null,
        // Para itens, seria necessário uma lógica mais complexa
        // Por enquanto, mantemos apenas os dados básicos
        itens: pedidoCompras?.itens || []
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar pedido de compras:', error);
      toast.error('Erro ao salvar pedido de compras');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = viewMode === true;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {isViewMode ? <FaEye className="w-5 h-5 text-white" /> : pedidoCompras ? <FaEdit className="w-5 h-5 text-white" /> : <FaPlus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isViewMode ? 'Visualizar Pedido de Compras' : pedidoCompras ? 'Editar Pedido de Compras' : 'Novo Pedido de Compras'}
              </h2>
              <p className="text-sm text-gray-600">
                {isViewMode 
                  ? 'Visualizando informações do pedido de compras' 
                  : pedidoCompras 
                    ? 'Editando informações do pedido de compras' 
                    : 'Preencha as informações do novo pedido de compras'}
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
          {/* Solicitação de Compras */}
          {!pedidoCompras && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solicitação de Compras <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={solicitacoesDisponiveis.map(s => ({
                  value: s.id.toString(),
                  label: `${s.numero_solicitacao || 'SC'} - ${s.filial_nome || 'Filial'} - Entrega: ${s.data_entrega_cd || ''}`
                }))}
                value={watch('solicitacao_compras_id')?.toString() || ''}
                onChange={(value) => {
                  setValue('solicitacao_compras_id', parseInt(value));
                  const sol = solicitacoesDisponiveis.find(s => s.id.toString() === value);
                  if (sol) {
                    setSolicitacaoSelecionada(sol);
                  }
                }}
                disabled={isViewMode}
                placeholder="Selecione uma solicitação"
                error={errors.solicitacao_compras_id?.message}
              />
            </div>
          )}

          {/* Fornecedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Fornecedor <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('fornecedor_nome', {
                required: 'O nome do fornecedor é obrigatório'
              })}
              disabled={isViewMode}
              placeholder="Digite o nome do fornecedor"
              error={errors.fornecedor_nome?.message}
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNPJ do Fornecedor
            </label>
            <Input
              {...register('fornecedor_cnpj')}
              disabled={isViewMode}
              placeholder="00.000.000/0000-00"
              error={errors.fornecedor_cnpj?.message}
            />
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pagamento
            </label>
            <Input
              {...register('forma_pagamento')}
              disabled={isViewMode}
              placeholder="Ex: Boleto, PIX, etc."
              error={errors.forma_pagamento?.message}
            />
          </div>

          {/* Prazo de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prazo de Pagamento
            </label>
            <Input
              {...register('prazo_pagamento')}
              disabled={isViewMode}
              placeholder="Ex: 30 dias, 3x (30/60/90)"
              error={errors.prazo_pagamento?.message}
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              {...register('observacoes')}
              disabled={isViewMode}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Digite observações sobre o pedido"
            />
          </div>

          {/* Nota: Itens do pedido seriam adicionados em uma versão mais completa */}
          {pedidoCompras?.itens && pedidoCompras.itens.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Itens do Pedido ({pedidoCompras.itens.length})
              </label>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-600">
                  {pedidoCompras.itens.length} item(ns) cadastrado(s). A edição de itens será implementada em uma versão futura.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              size="sm"
            >
              {isViewMode ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isViewMode && (
              <Button
                type="submit"
                disabled={saving || loading}
                loading={saving}
                size="sm"
              >
                <FaSave className="mr-2" />
                {pedidoCompras ? 'Atualizar' : 'Criar'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PedidosComprasModal;

