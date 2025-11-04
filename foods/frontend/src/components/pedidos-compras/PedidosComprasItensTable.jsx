import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Button, Input, SearchableSelect } from '../ui';

const PedidosComprasItensTable = ({
  itens,
  onItemChange,
  onRemoveItem,
  viewMode = false,
  errors = {},
  produtosGenericos = []
}) => {
  if (!itens || itens.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
        <p>Nenhum item selecionado. Selecione uma solicitação para carregar os itens disponíveis.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {!viewMode && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Selecionar
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unidade
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Solicitado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilizado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Saldo Disponível
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade Pedido
            </th>
            {!viewMode && (
              <>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Unitário <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
              </>
            )}
            {viewMode && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Total
              </th>
            )}
            {!viewMode && (
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {itens.map((item, index) => {
            const saldoDisponivel = parseFloat(item.saldo_disponivel || 0);
            const quantidadePedido = parseFloat(item.quantidade_pedido || 0);
            const valorUnitario = parseFloat(item.valor_unitario || 0);
            const valorTotal = quantidadePedido * valorUnitario;
            const isSaldoInsuficiente = quantidadePedido > saldoDisponivel;
            const isSelected = item.selected || false;

            return (
              <tr 
                key={item.id || index} 
                className={`hover:bg-gray-50 ${!isSelected && !viewMode ? 'opacity-50' : ''} ${isSaldoInsuficiente ? 'bg-red-50' : ''}`}
              >
                {!viewMode && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        onItemChange(index, { ...item, selected: e.target.checked });
                      }}
                      disabled={saldoDisponivel <= 0}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.isNewProduct && !viewMode ? (
                    <SearchableSelect
                      value={item.produto_id || ''}
                      onChange={(value) => {
                        onItemChange(index, { ...item, produto_id: value });
                      }}
                      options={produtosGenericos
                        .filter(p => p.status === 1 || p.status === 'ativo')
                        .map(p => ({
                          value: p.id,
                          label: `${p.codigo || p.codigo_produto || ''} - ${p.nome}`
                        }))}
                      placeholder="Selecione um produto genérico..."
                      className="w-full min-w-[300px]"
                    />
                  ) : (
                    <>
                      <div className="text-sm text-gray-900">
                        {item.produto_nome || item.nome_produto || 'Produto não informado'}
                      </div>
                      {item.codigo_produto && (
                        <div className="text-xs text-gray-500">
                          Código: {item.codigo_produto}
                        </div>
                      )}
                    </>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.isNewProduct && !item.produto_id && !viewMode ? (
                    <span className="text-sm text-gray-400 italic">Selecione um produto...</span>
                  ) : (
                    <span className="text-sm text-gray-900">
                      {item.unidade_simbolo || item.unidade_medida || '-'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.isNewProduct ? (
                    <span className="text-sm text-gray-400">-</span>
                  ) : (
                    <span className="text-sm text-gray-900">
                      {parseFloat(item.quantidade_solicitada || item.quantidade || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.isNewProduct ? (
                    <span className="text-sm text-gray-400">-</span>
                  ) : (
                    <span className="text-sm text-gray-900">
                      {parseFloat(item.quantidade_utilizada || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.isNewProduct ? (
                    <span className="text-sm text-gray-400">-</span>
                  ) : (
                    <span className={`text-sm font-medium ${
                      saldoDisponivel > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {saldoDisponivel.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {viewMode ? (
                    <span className="text-sm text-gray-900">
                      {quantidadePedido.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  ) : (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={item.isNewProduct ? undefined : saldoDisponivel}
                      value={quantidadePedido || ''}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        onItemChange(index, { 
                          ...item, 
                          quantidade_pedido: newValue,
                          selected: newValue > 0 || isSelected
                        });
                      }}
                      disabled={!isSelected || (!item.isNewProduct && saldoDisponivel <= 0)}
                      className={`w-24 ${isSaldoInsuficiente ? 'border-red-500' : ''}`}
                      error={isSaldoInsuficiente ? 'Quantidade excede saldo disponível' : errors[`itens.${index}.quantidade_pedido`]}
                    />
                  )}
                </td>
                {!viewMode && (
                  <>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={valorUnitario || ''}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0;
                          onItemChange(index, { 
                            ...item, 
                            valor_unitario: newValue
                          });
                        }}
                        disabled={!isSelected || saldoDisponivel <= 0}
                        className="w-32"
                        error={errors[`itens.${index}.valor_unitario`]}
                        placeholder="0,00"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {valorTotal.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </span>
                    </td>
                  </>
                )}
                {viewMode && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {valorTotal.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </span>
                  </td>
                )}
                {!viewMode && (
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onRemoveItem(index)}
                      disabled={!isSelected}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        {!viewMode && (
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td colSpan="9" className="px-4 py-3 text-right font-medium">
                <span className="text-sm text-gray-700">Valor Total do Pedido:</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-lg font-bold text-green-600">
                  {itens
                    .filter(item => item.selected && parseFloat(item.quantidade_pedido || 0) > 0)
                    .reduce((total, item) => {
                      const qtd = parseFloat(item.quantidade_pedido || 0);
                      const valorUnit = parseFloat(item.valor_unitario || 0);
                      return total + (qtd * valorUnit);
                    }, 0)
                    .toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                </span>
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default PedidosComprasItensTable;

