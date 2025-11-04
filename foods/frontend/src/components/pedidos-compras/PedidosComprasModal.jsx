import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaPlus } from 'react-icons/fa';
import { Button, Modal, SearchableSelect } from '../ui';
import PedidosComprasService from '../../services/pedidosComprasService';
import FormasPagamentoService from '../../services/formasPagamentoService';
import PrazosPagamentoService from '../../services/prazosPagamentoService';
import FornecedoresService from '../../services/fornecedores';
import PedidosComprasItensTable from './PedidosComprasItensTable';
import PedidosComprasDadosFilial from './PedidosComprasDadosFilial';
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
  const [itensDisponiveis, setItensDisponiveis] = useState([]);
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [dadosFilial, setDadosFilial] = useState(null);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [prazosPagamento, setPrazosPagamento] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loadingItens, setLoadingItens] = useState(false);
  const [loadingDadosFilial, setLoadingDadosFilial] = useState(false);

  const solicitacaoId = watch('solicitacao_compras_id');
  const fornecedorId = watch('fornecedor_id');

  // Carregar dados auxiliares quando modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarFormasPagamento();
      carregarPrazosPagamento();
      carregarFornecedores();
    }
  }, [isOpen]);

  // Carregar itens quando solicitação for selecionada
  useEffect(() => {
    if (solicitacaoId && !pedidoCompras && isOpen) {
      carregarItensSolicitacao(solicitacaoId);
    }
  }, [solicitacaoId, pedidoCompras, isOpen]);

  // Auto-preenchimento de fornecedor
  useEffect(() => {
    if (fornecedorId && fornecedores.length > 0) {
      const fornecedor = fornecedores.find(f => f.id.toString() === fornecedorId.toString());
      if (fornecedor) {
        setValue('fornecedor_nome', fornecedor.razao_social || fornecedor.nome);
        setValue('fornecedor_cnpj', fornecedor.cnpj);
      }
    }
  }, [fornecedorId, fornecedores, setValue]);

  // Carregar dados quando modal abrir com pedido existente
  useEffect(() => {
    if (pedidoCompras && isOpen) {
      // Preencher formulário
      Object.keys(pedidoCompras).forEach(key => {
        if (pedidoCompras[key] !== null && pedidoCompras[key] !== undefined && key !== 'itens') {
          setValue(key, pedidoCompras[key]);
        }
      });
      
      // Carregar itens se existirem
      if (pedidoCompras.itens && Array.isArray(pedidoCompras.itens)) {
        const itensComSelected = pedidoCompras.itens.map(item => ({
          ...item,
          selected: true,
          quantidade_pedido: item.quantidade_pedido || item.quantidade || 0
        }));
        setItensSelecionados(itensComSelected);
        setItensDisponiveis(itensComSelected);
      }

      // Carregar dados da filial se houver
      if (pedidoCompras.filial_id) {
        carregarDadosFilial(pedidoCompras.filial_id);
      }
    } else if (!pedidoCompras && isOpen) {
      reset();
      setItensDisponiveis([]);
      setItensSelecionados([]);
      setDadosFilial(null);
      setSolicitacaoSelecionada(null);
    }
  }, [pedidoCompras, isOpen, setValue, reset]);

  const carregarFormasPagamento = async () => {
    try {
      const response = await FormasPagamentoService.buscarAtivas();
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        setFormasPagamento(items);
      }
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    }
  };

  const carregarPrazosPagamento = async () => {
    try {
      const response = await PrazosPagamentoService.buscarAtivos();
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        setPrazosPagamento(items);
      }
    } catch (error) {
      console.error('Erro ao carregar prazos de pagamento:', error);
    }
  };

  const carregarFornecedores = async () => {
    try {
      const response = await FornecedoresService.buscarAtivos();
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        setFornecedores(items);
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  };

  const carregarItensSolicitacao = async (id) => {
    setLoadingItens(true);
    try {
      const response = await PedidosComprasService.buscarItensSolicitacao(id);
      if (response.success && response.data) {
        const { solicitacao, itens } = response.data;
        setSolicitacaoSelecionada(solicitacao);
        setItensDisponiveis(itens.map(item => ({ ...item, selected: false, quantidade_pedido: 0 })));
        setItensSelecionados([]);
        
        // Carregar dados da filial
        if (solicitacao.filial_id) {
          carregarDadosFilial(solicitacao.filial_id);
        }
      } else {
        toast.error(response.error || 'Erro ao carregar itens da solicitação');
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast.error('Erro ao carregar itens da solicitação');
    } finally {
      setLoadingItens(false);
    }
  };

  const carregarDadosFilial = async (id) => {
    setLoadingDadosFilial(true);
    try {
      const response = await PedidosComprasService.buscarDadosFilial(id);
      if (response.success && response.data) {
        setDadosFilial(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da filial:', error);
    } finally {
      setLoadingDadosFilial(false);
    }
  };

  const handleItemChange = (index, updatedItem) => {
    const newItens = [...itensDisponiveis];
    newItens[index] = updatedItem;
    setItensDisponiveis(newItens);
    
    // Atualizar itens selecionados
    const selected = newItens.filter(item => item.selected && parseFloat(item.quantidade_pedido || 0) > 0);
    setItensSelecionados(selected);
  };

  const handleRemoveItem = (index) => {
    const newItens = [...itensDisponiveis];
    newItens[index] = { ...newItens[index], selected: false, quantidade_pedido: 0 };
    setItensDisponiveis(newItens);
    setItensSelecionados(newItens.filter(item => item.selected && parseFloat(item.quantidade_pedido || 0) > 0));
  };

  const handleFormSubmit = async (data) => {
    // Validar se há itens selecionados
    if (!pedidoCompras && itensSelecionados.length === 0) {
      toast.error('Selecione pelo menos um item para criar o pedido');
      return;
    }

    setSaving(true);
    try {
      const formData = {
        solicitacao_compras_id: data.solicitacao_compras_id || pedidoCompras?.solicitacao_compras_id,
        fornecedor_id: data.fornecedor_id || null,
        fornecedor_nome: data.fornecedor_nome?.trim(),
        fornecedor_cnpj: data.fornecedor_cnpj || null,
        forma_pagamento_id: data.forma_pagamento_id || null,
        prazo_pagamento_id: data.prazo_pagamento_id || null,
        observacoes: data.observacoes || null,
        itens: pedidoCompras 
          ? (pedidoCompras.itens || [])
          : itensSelecionados.map(item => ({
              solicitacao_item_id: item.id,
              quantidade_pedido: parseFloat(item.quantidade_pedido || 0)
            }))
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
  const itensParaExibir = pedidoCompras ? itensSelecionados : itensDisponiveis;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
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
                }}
                disabled={isViewMode}
                placeholder="Selecione uma solicitação"
                error={errors.solicitacao_compras_id?.message}
              />
            </div>
          )}

          {/* Dados da Filial */}
          {dadosFilial && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PedidosComprasDadosFilial dadosFilial={dadosFilial} tipo="faturamento" viewMode={isViewMode} />
              <PedidosComprasDadosFilial dadosFilial={dadosFilial} tipo="cobranca" viewMode={isViewMode} />
              <PedidosComprasDadosFilial dadosFilial={dadosFilial} tipo="entrega" viewMode={isViewMode} />
            </div>
          )}

          {/* Informações do Fornecedor */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fornecedor</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fornecedor
                </label>
                <SearchableSelect
                  options={fornecedores.map(f => ({
                    value: f.id.toString(),
                    label: `${f.razao_social || f.nome || 'Fornecedor'} ${f.cnpj ? `- ${f.cnpj}` : ''}`
                  }))}
                  value={watch('fornecedor_id')?.toString() || ''}
                  onChange={(value) => {
                    setValue('fornecedor_id', value ? parseInt(value) : null);
                  }}
                  disabled={isViewMode}
                  placeholder="Selecione um fornecedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Fornecedor <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('fornecedor_nome', {
                    required: 'O nome do fornecedor é obrigatório'
                  })}
                  disabled={isViewMode}
                  placeholder="Digite o nome do fornecedor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                {errors.fornecedor_nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.fornecedor_nome.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ do Fornecedor
                </label>
                <input
                  {...register('fornecedor_cnpj')}
                  disabled={isViewMode}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Forma e Prazo de Pagamento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forma de Pagamento
              </label>
              <SearchableSelect
                options={formasPagamento.map(fp => ({
                  value: fp.id.toString(),
                  label: fp.nome
                }))}
                value={watch('forma_pagamento_id')?.toString() || ''}
                onChange={(value) => {
                  setValue('forma_pagamento_id', value ? parseInt(value) : null);
                }}
                disabled={isViewMode}
                placeholder="Selecione uma forma de pagamento"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prazo de Pagamento
              </label>
              <SearchableSelect
                options={prazosPagamento.map(pp => ({
                  value: pp.id.toString(),
                  label: pp.nome
                }))}
                value={watch('prazo_pagamento_id')?.toString() || ''}
                onChange={(value) => {
                  setValue('prazo_pagamento_id', value ? parseInt(value) : null);
                }}
                disabled={isViewMode}
                placeholder="Selecione um prazo de pagamento"
              />
            </div>
          </div>

          {/* Itens do Pedido */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Itens do Pedido {!isViewMode && itensSelecionados.length > 0 && `(${itensSelecionados.length} selecionado(s))`}
            </h3>
            {loadingItens ? (
              <div className="p-8 text-center text-gray-500">
                <p>Carregando itens da solicitação...</p>
              </div>
            ) : (
              <PedidosComprasItensTable
                itens={itensParaExibir}
                onItemChange={handleItemChange}
                onRemoveItem={handleRemoveItem}
                viewMode={isViewMode}
                errors={errors}
              />
            )}
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
