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
  
  // Props
  pedidoCompras,
  isViewMode,
  solicitacoesDisponiveis
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
      />

      {/* Status (apenas na edição) */}
      {pedidoCompras && !isViewMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="em_digitacao">Em Digitação</option>
            <option value="aprovado">Aprovado</option>
            <option value="enviado">Enviado</option>
            <option value="confirmado">Confirmado</option>
            <option value="em_transito">Em Trânsito</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      )}

      {/* Status (apenas visualização) */}
      {isViewMode && pedidoCompras?.status && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
            {watch('status') === 'em_digitacao' && 'Em Digitação'}
            {watch('status') === 'aprovado' && 'Aprovado'}
            {watch('status') === 'enviado' && 'Enviado'}
            {watch('status') === 'confirmado' && 'Confirmado'}
            {watch('status') === 'em_transito' && 'Em Trânsito'}
            {watch('status') === 'entregue' && 'Entregue'}
            {watch('status') === 'cancelado' && 'Cancelado'}
          </div>
        </div>
      )}

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
    </form>
  );
};

export default PedidosComprasModalBody;

