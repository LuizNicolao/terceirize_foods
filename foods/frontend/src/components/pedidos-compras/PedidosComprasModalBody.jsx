import React from 'react';
import PedidosComprasItensTable from './PedidosComprasItensTable';
import PedidosComprasFiliaisSelect from './PedidosComprasFiliaisSelect';
import PedidosComprasDadosSolicitacao from './PedidosComprasDadosSolicitacao';
import PedidosComprasFornecedorSection from './PedidosComprasFornecedorSection';
import PedidosComprasPagamentoSection from './PedidosComprasPagamentoSection';
import PedidosComprasSolicitacaoSelect from './PedidosComprasSolicitacaoSelect';

const PedidosComprasModalBody = ({
  // Form
  register,
  handleSubmit,
  errors,
  setValue,
  watch,
  trigger,
  
  // Estados
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
  
  // Handlers
  handleItemChange,
  handleRemoveItem,
  
  // Dados auxiliares
  produtosGenericos,
  
  // Props
  pedidoCompras,
  isViewMode,
  solicitacoesDisponiveis,
  footer
}) => {
  const itensParaExibir = pedidoCompras ? itensSelecionados : itensDisponiveis;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Solicitação de Compras */}
      <PedidosComprasSolicitacaoSelect
        solicitacoesDisponiveis={solicitacoesDisponiveis}
        watch={watch}
        setValue={setValue}
        errors={errors}
        isViewMode={isViewMode}
        pedidoCompras={pedidoCompras}
      />

      {/* Dados da Solicitação (readonly) */}
      <PedidosComprasDadosSolicitacao
        solicitacaoSelecionada={solicitacaoSelecionada}
      />

      {/* Dados das Filiais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PedidosComprasFiliaisSelect
          tipo="faturamento"
          filiais={filiais}
          filialSelecionada={watch('filial_faturamento_id') || solicitacaoSelecionada?.filial_id || null}
          dadosFilial={dadosFilialFaturamento}
          viewMode={isViewMode}
        />
        <PedidosComprasFiliaisSelect
          tipo="cobranca"
          filiais={filiais}
          filialSelecionada={watch('filial_cobranca_id')}
          onFilialChange={(id) => setValue('filial_cobranca_id', id)}
          dadosFilial={dadosFilialCobranca}
          viewMode={isViewMode}
          required
          error={errors.filial_cobranca_id?.message}
        />
        <PedidosComprasFiliaisSelect
          tipo="entrega"
          filiais={filiais}
          filialSelecionada={watch('filial_entrega_id') || solicitacaoSelecionada?.filial_id}
          onFilialChange={(id) => setValue('filial_entrega_id', id)}
          dadosFilial={dadosFilialEntrega}
          viewMode={isViewMode}
          required
          error={errors.filial_entrega_id?.message}
        />
      </div>

      {/* Informações do Fornecedor */}
      <PedidosComprasFornecedorSection
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        fornecedores={fornecedores}
        loadingFornecedores={loadingFornecedores}
        fornecedorSearchTerm={fornecedorSearchTerm}
        setFornecedorSearchTerm={setFornecedorSearchTerm}
        setFornecedores={setFornecedores}
        isViewMode={isViewMode}
      />

      {/* Forma e Prazo de Pagamento */}
      <PedidosComprasPagamentoSection
        watch={watch}
        setValue={setValue}
        formasPagamento={formasPagamento}
        prazosPagamento={prazosPagamento}
        isViewMode={isViewMode}
        errors={errors}
        trigger={trigger}
      />

      {/* Itens do Pedido */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Itens do Pedido {!isViewMode && itensSelecionados.length > 0 && `(${itensSelecionados.length} selecionado(s))`}
          </h3>
        </div>
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
            produtosGenericos={produtosGenericos}
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

      {/* Footer dentro do formulário */}
      {footer}
    </form>
  );
};

export default PedidosComprasModalBody;

