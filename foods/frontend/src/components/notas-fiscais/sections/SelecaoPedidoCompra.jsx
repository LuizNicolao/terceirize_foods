import React from 'react';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { SearchableSelect } from '../../ui';
import FormSection from './FormSection';

const SelecaoPedidoCompra = ({ 
  pedidoCompraId, 
  onPedidoChange, 
  pedidosDisponiveis = [],
  rirId,
  onRirChange,
  rirsDisponiveis = [],
  isViewMode = false,
  loading = false
}) => {
  return (
    <FormSection
      icon={FaFileInvoiceDollar}
      title="Selecionar Pedido de Compra"
      description="Selecione o pedido de compra que será faturado. Os dados do fornecedor e filial serão carregados automaticamente."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SearchableSelect
            label="Pedido de Compra"
            value={pedidoCompraId || ''}
            onChange={onPedidoChange}
            options={pedidosDisponiveis.map(pedido => ({
              value: String(pedido.id),
              label: `${pedido.numero_pedido || pedido.id} - ${pedido.fornecedor_nome || ''}`,
              description: `Filial: ${pedido.filial_nome || ''}`
            }))}
            placeholder={loading ? 'Carregando...' : 'Selecione um pedido de compra...'}
            disabled={isViewMode || loading}
            loading={loading}
            required
          />
          {pedidosDisponiveis.length === 0 && !loading && (
            <p className="text-xs text-red-600 mt-1">
              Nenhum pedido de compra disponível
            </p>
          )}
        </div>
        <div>
          <SearchableSelect
            label="RIR - Relatório de Inspeção"
            value={rirId || ''}
            onChange={onRirChange}
            options={rirsDisponiveis.map(rir => {
              // Formatar data de inspeção
              const dataInspecao = rir.data_inspecao 
                ? new Date(rir.data_inspecao).toLocaleDateString('pt-BR')
                : '-';
              
              // Criar label principal com ID, número da NF e número do pedido
              const labelParts = [`RIR #${rir.id}`];
              if (rir.numero_nota_fiscal) {
                labelParts.push(`NF: ${rir.numero_nota_fiscal}`);
              }
              if (rir.numero_pedido) {
                labelParts.push(`Pedido: ${rir.numero_pedido}`);
              }
              const label = labelParts.join(' - ');
              
              // Criar descrição com mais informações
              const description = [
                rir.fornecedor && `Fornecedor: ${rir.fornecedor}`,
                dataInspecao !== '-' && `Data: ${dataInspecao}`,
                rir.resultado_geral && `Status: ${rir.resultado_geral}`
              ].filter(Boolean).join(' | ');
              
              return {
                value: String(rir.id),
                label,
                description
              };
            })}
            placeholder="RIR será preenchido automaticamente..."
            disabled={true}
            loading={loading}
          />
          {rirsDisponiveis.length === 0 && !loading && rirId && (
            <p className="text-xs text-gray-500 mt-1">
              Nenhum RIR disponível para este pedido
            </p>
          )}
        </div>
      </div>
    </FormSection>
  );
};

export default SelecaoPedidoCompra;

