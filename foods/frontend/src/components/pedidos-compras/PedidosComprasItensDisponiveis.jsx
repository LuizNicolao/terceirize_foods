import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button, Input } from '../ui';

const PedidosComprasItensDisponiveis = ({
  itens,
  onAdicionarItem,
  loading = false
}) => {
  const [quantidades, setQuantidades] = useState({});
  const [valoresUnitarios, setValoresUnitarios] = useState({});

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
        <p>Carregando itens disponíveis...</p>
      </div>
    );
  }

  if (!itens || itens.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
        <p>Não há itens disponíveis para adicionar.</p>
      </div>
    );
  }

  const handleQuantidadeChange = (itemId, value) => {
    setQuantidades(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleValorUnitarioChange = (itemId, value) => {
    setValoresUnitarios(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleAdicionar = (item) => {
    const quantidade = parseFloat(quantidades[item.id] || 0);
    const valorUnitario = parseFloat(valoresUnitarios[item.id] || 0);

    if (!quantidade || quantidade <= 0) {
      alert('Informe a quantidade!');
      return;
    }

    if (!valorUnitario || valorUnitario <= 0) {
      alert('Informe o valor unitário!');
      return;
    }

    if (quantidade > parseFloat(item.saldo_disponivel || 0)) {
      alert(`Quantidade não pode ser maior que o saldo disponível (${item.saldo_disponivel})!`);
      return;
    }

    onAdicionarItem({
      ...item,
      quantidade_pedido: quantidade,
      valor_unitario: valorUnitario,
      selected: true
    });

    // Limpar campos após adicionar
    setQuantidades(prev => {
      const newState = { ...prev };
      delete newState[item.id];
      return newState;
    });
    setValoresUnitarios(prev => {
      const newState = { ...prev };
      delete newState[item.id];
      return newState;
    });
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unidade
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Qtd. Disponível
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Qtd. a Adicionar <span className="text-red-500">*</span>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor Unitário <span className="text-red-500">*</span>
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ação
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {itens.map((item) => {
            const saldoDisponivel = parseFloat(item.saldo_disponivel || 0);
            const quantidade = quantidades[item.id] || '';
            const valorUnitario = valoresUnitarios[item.id] || '';
            const quantidadeNum = parseFloat(quantidade || 0);
            const isSaldoInsuficiente = quantidadeNum > saldoDisponivel;

            return (
              <tr 
                key={item.id} 
                className={`hover:bg-gray-50 ${isSaldoInsuficiente ? 'bg-red-50' : ''}`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.produto_nome || item.nome_produto || 'Produto não informado'}
                  </div>
                  {item.codigo_produto && (
                    <div className="text-xs text-gray-500">
                      {item.codigo_produto}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.unidade_simbolo || item.unidade_medida || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={saldoDisponivel}
                    value={quantidade}
                    onChange={(e) => handleQuantidadeChange(item.id, e.target.value)}
                    className={`w-24 ${isSaldoInsuficiente ? 'border-red-500' : ''}`}
                    placeholder="0,00"
                  />
                  {isSaldoInsuficiente && (
                    <p className="mt-1 text-xs text-red-600">
                      Saldo insuficiente
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorUnitario}
                    onChange={(e) => handleValorUnitarioChange(item.id, e.target.value)}
                    className="w-32"
                    placeholder="0,00"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAdicionar(item)}
                    className="flex items-center gap-2"
                  >
                    <FaPlus className="w-3 h-3" />
                    Adicionar
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PedidosComprasItensDisponiveis;

