import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button } from '../ui';
import PedidosComprasItensTable from './PedidosComprasItensTable';
import PedidosComprasFiliaisSelect from './PedidosComprasFiliaisSelect';
import PedidosComprasDadosSolicitacao from './PedidosComprasDadosSolicitacao';
import PedidosComprasFornecedorSection from './PedidosComprasFornecedorSection';
import PedidosComprasPagamentoSection from './PedidosComprasPagamentoSection';
import PedidosComprasSolicitacaoSelect from './PedidosComprasSolicitacaoSelect';
import PedidosComprasItensDisponiveis from './PedidosComprasItensDisponiveis';

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
  handleAdicionarItem,
  
  // Itens disponíveis para adicionar
  itensDisponiveisParaAdicionar,
  loadingItensDisponiveis,
  
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

      {/* Itens do Pedido */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Itens do Pedido {!isViewMode && itensSelecionados.length > 0 && `(${itensSelecionados.length} selecionado(s))`}
          </h3>
          {!isViewMode && (
            <Button 
              onClick={() => {
                // Se há itens disponíveis, mostrar a seção ou abrir modal
                // Por enquanto, vamos apenas garantir que a seção de itens disponíveis esteja visível
                const itensDisponiveisSection = document.getElementById('itens-disponiveis-section');
                if (itensDisponiveisSection) {
                  itensDisponiveisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }} 
              size="sm" 
              variant="ghost" 
              type="button"
            >
              <FaPlus className="mr-1" />
              Adicionar Produto
            </Button>
          )}
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
          />
        )}
      </div>

      {/* Itens Disponíveis para Adicionar (apenas durante edição) */}
      {pedidoCompras && !isViewMode && solicitacaoSelecionada && (
        <div id="itens-disponiveis-section">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Produtos Disponíveis da Solicitação
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Produtos da solicitação que ainda não foram adicionados a este pedido.
          </p>
          <PedidosComprasItensDisponiveis
            itens={itensDisponiveisParaAdicionar}
            onAdicionarItem={handleAdicionarItem}
            loading={loadingItensDisponiveis}
          />
        </div>
      )}

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

      {/* Status - Campo menor no final */}
      <div className="flex items-center gap-4">
        {pedidoCompras && !isViewMode && (
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
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
              <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
            )}
          </div>
        )}

        {isViewMode && pedidoCompras?.status && (
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-900">
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
      </div>
    </form>
  );
};

export default PedidosComprasModalBody;

