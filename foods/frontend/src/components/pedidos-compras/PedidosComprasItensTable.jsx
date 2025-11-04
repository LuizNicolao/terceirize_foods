import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Button, Input } from '../ui';

const PedidosComprasItensTable = ({
  itens,
  onItemChange,
  onRemoveItem,
  viewMode = false,
  errors = {}
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
                  <div className="text-sm text-gray-900">
                    {item.produto_nome || item.nome_produto || 'Produto não informado'}
                  </div>
                  {item.codigo_produto && (
                    <div className="text-xs text-gray-500">
                      Código: {item.codigo_produto}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {item.unidade_simbolo || item.unidade_medida || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {parseFloat(item.quantidade_solicitada || item.quantidade || 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {parseFloat(item.quantidade_utilizada || 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    saldoDisponivel > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {saldoDisponivel.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
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
                      max={saldoDisponivel}
                      value={quantidadePedido || ''}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        onItemChange(index, { 
                          ...item, 
                          quantidade_pedido: newValue,
                          selected: newValue > 0 || isSelected
                        });
                      }}
                      disabled={!isSelected || saldoDisponivel <= 0}
                      className={`w-24 ${isSaldoInsuficiente ? 'border-red-500' : ''}`}
                      error={isSaldoInsuficiente ? 'Quantidade excede saldo disponível' : errors[`itens.${index}.quantidade_pedido`]}
                    />
                  )}
                </td>
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
      </table>
    </div>
  );
};

export default PedidosComprasItensTable;

