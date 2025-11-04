import React from 'react';
import { Modal } from '../ui';
import { usePedidosComprasModal } from '../../hooks/usePedidosComprasModal';
import PedidosComprasModalHeader from './PedidosComprasModalHeader';
import PedidosComprasModalBody from './PedidosComprasModalBody';
import PedidosComprasModalFooter from './PedidosComprasModalFooter';
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
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    saving,
    setSaving,
    solicitacaoSelecionada,
    itensDisponiveis,
    itensSelecionados,
    dadosFilialFaturamento,
    dadosFilialCobranca,
    dadosFilialEntrega,
    formasPagamento,
    prazosPagamento,
    fornecedores,
    filiais,
    loadingItens,
    loadingFornecedores,
    fornecedorSearchTerm,
    setFornecedorSearchTerm,
    setFornecedores,
    handleItemChange,
    handleRemoveItem,
    handleAdicionarItem,
    handleAddNewItem,
    produtosGenericos,
    itensDisponiveisParaAdicionar,
    loadingItensDisponiveis
  } = usePedidosComprasModal({ pedidoCompras, isOpen, solicitacoesDisponiveis });

  const handleFormSubmit = async (data) => {
    // Validar se há itens selecionados (considerar produtos novos mesmo com quantidade 0)
    const itensValidos = itensSelecionados.filter(item => {
      // Produtos novos precisam ter produto_id preenchido
      if (item.isNewProduct) {
        return item.produto_id && item.produto_id !== '';
      }
      // Itens da solicitação precisam ter quantidade > 0
      return parseFloat(item.quantidade_pedido || 0) > 0;
    });

    if (!pedidoCompras && itensValidos.length === 0) {
      toast.error('Selecione pelo menos um item para criar o pedido');
      return;
    }

    // Validar produtos novos: precisam ter produto_id, quantidade e valor unitário
    const produtosNovosInvalidos = itensSelecionados.filter(item => 
      item.isNewProduct && (
        !item.produto_id || 
        item.produto_id === '' ||
        !item.quantidade_pedido || 
        parseFloat(item.quantidade_pedido || 0) <= 0 ||
        !item.valor_unitario || 
        parseFloat(item.valor_unitario || 0) <= 0
      )
    );
    
    if (produtosNovosInvalidos.length > 0) {
      toast.error('Produtos novos devem ter produto selecionado, quantidade e valor unitário preenchidos');
      return;
    }

    // Validar itens da solicitação: precisam ter valor unitário
    const itensSolicitacaoSemValor = itensSelecionados.filter(item => 
      !item.isNewProduct && (
        !item.valor_unitario || 
        parseFloat(item.valor_unitario || 0) <= 0
      )
    );
    
    if (itensSolicitacaoSemValor.length > 0) {
      toast.error('Todos os itens selecionados devem ter um valor unitário preenchido');
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
        status: pedidoCompras ? (data.status || pedidoCompras.status) : undefined,
        filial_faturamento_id: solicitacaoSelecionada?.filial_id || pedidoCompras?.filial_id || null,
        filial_cobranca_id: data.filial_cobranca_id || null,
        filial_entrega_id: data.filial_entrega_id || null,
        itens: itensSelecionados
          .filter(item => {
            // Filtrar apenas itens válidos
            if (item.isNewProduct) {
              // Produtos novos precisam ter produto_id, quantidade > 0 e valor > 0
              return item.produto_id && 
                     item.produto_id !== '' &&
                     parseFloat(item.quantidade_pedido || 0) > 0 &&
                     parseFloat(item.valor_unitario || 0) > 0;
            } else {
              // Itens da solicitação precisam ter quantidade > 0 e valor > 0
              return parseFloat(item.quantidade_pedido || 0) > 0 &&
                     parseFloat(item.valor_unitario || 0) > 0;
            }
          })
          .map(item => {
            // Se for produto novo (isNewProduct), usar produto_generico_id ao invés de solicitacao_item_id
            if (item.isNewProduct && item.produto_id) {
              return {
                produto_generico_id: parseInt(item.produto_id),
                quantidade_pedido: parseFloat(item.quantidade_pedido || 0),
                valor_unitario: parseFloat(item.valor_unitario || 0),
                unidade_medida: item.unidade_simbolo || item.unidade_medida || ''
              };
            } else {
              return {
                solicitacao_item_id: item.id,
                quantidade_pedido: parseFloat(item.quantidade_pedido || 0),
                valor_unitario: parseFloat(item.valor_unitario || 0)
              };
            }
          })
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
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <PedidosComprasModalHeader
          isViewMode={isViewMode}
          pedidoCompras={pedidoCompras}
          saving={saving}
          onClose={onClose}
        />

        <PedidosComprasModalBody
          register={register}
          handleSubmit={handleSubmit(handleFormSubmit)}
          errors={errors}
          setValue={setValue}
          watch={watch}
          solicitacaoSelecionada={solicitacaoSelecionada}
          itensDisponiveis={itensDisponiveis}
          itensSelecionados={itensSelecionados}
          dadosFilialFaturamento={dadosFilialFaturamento}
          dadosFilialCobranca={dadosFilialCobranca}
          dadosFilialEntrega={dadosFilialEntrega}
          formasPagamento={formasPagamento}
          prazosPagamento={prazosPagamento}
          fornecedores={fornecedores}
          filiais={filiais}
          loadingItens={loadingItens}
          loadingFornecedores={loadingFornecedores}
          fornecedorSearchTerm={fornecedorSearchTerm}
          setFornecedorSearchTerm={setFornecedorSearchTerm}
          setFornecedores={setFornecedores}
          handleItemChange={handleItemChange}
          handleRemoveItem={handleRemoveItem}
          handleAdicionarItem={handleAdicionarItem}
          handleAddNewItem={handleAddNewItem}
          produtosGenericos={produtosGenericos}
          itensDisponiveisParaAdicionar={itensDisponiveisParaAdicionar}
          loadingItensDisponiveis={loadingItensDisponiveis}
          pedidoCompras={pedidoCompras}
          isViewMode={isViewMode}
          solicitacoesDisponiveis={solicitacoesDisponiveis}
        />

        <PedidosComprasModalFooter
          isViewMode={isViewMode}
          pedidoCompras={pedidoCompras}
          saving={saving}
          loading={loading}
          onClose={onClose}
          formId="pedidos-compras-form"
        />
      </div>
    </Modal>
  );
};

export default PedidosComprasModal;
