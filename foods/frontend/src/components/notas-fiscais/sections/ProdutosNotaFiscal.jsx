import React, { useState, useEffect, useRef } from 'react';
import { FaBoxes, FaExclamationTriangle } from 'react-icons/fa';
import FormSection from './FormSection';
import PedidosComprasService from '../../../services/pedidosComprasService';
import NotaFiscalService from '../../../services/notaFiscalService';
import { Modal, Button } from '../../../components/ui';

const ProdutosNotaFiscal = ({ 
  itens, 
  onItensChange, 
  pedidoId,
  descontoTotal,
  notaFiscalId = null, // ID da nota fiscal atual (para edição)
  isViewMode = false 
}) => {
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const pedidoIdAnteriorRef = useRef(null);
  const itensCarregadosRef = useRef(false); // Flag para indicar se os itens já foram carregados da nota fiscal

  // Carregar itens do pedido automaticamente quando pedidoId mudar
  useEffect(() => {
    // Se estamos editando/visualizando uma nota fiscal existente, não carregar do pedido
    // Os itens já foram carregados da nota fiscal
    if (notaFiscalId) {
      return;
    }

    // Se já existem itens carregados da nota fiscal, não carregar do pedido
    if (itensCarregadosRef.current) {
      return;
    }

    // Evitar recarregar se o pedidoId não mudou
    if (pedidoIdAnteriorRef.current === pedidoId) {
      return;
    }
    pedidoIdAnteriorRef.current = pedidoId;

    const carregarItensPedido = async () => {
      if (!pedidoId) {
        // Se não houver pedido e não houver itens já carregados, limpar
        if (!itensCarregadosRef.current) {
          onItensChange([]);
        }
        return;
      }

      setLoadingProdutos(true);
      try {
        // Buscar pedido completo (que já inclui os itens)
        const response = await PedidosComprasService.buscarPorId(pedidoId);
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Erro ao buscar pedido');
        }
        
        const pedido = response.data;
        const itensPedido = pedido.itens || [];
        
        // Buscar quantidades já lançadas em outras notas fiscais
        let quantidadesLancadas = {};
        if (pedidoId) {
          try {
            const quantidadesResponse = await NotaFiscalService.buscarQuantidadesLancadas(pedidoId, notaFiscalId);
            if (quantidadesResponse.success) {
              quantidadesLancadas = quantidadesResponse.data || {};
            }
          } catch (error) {
            console.error('Erro ao buscar quantidades lançadas:', error);
          }
        }
        
        // Transformar itens do pedido em itens da nota fiscal
        const itensNotaFiscal = itensPedido.map(item => {
          const quantidadePedido = parseFloat(item.quantidade_pedido) || 0;
          
          // Calcular quantidade já lançada para este item
          const keyProduto = item.produto_generico_id 
            ? `produto_${item.produto_generico_id}` 
            : `item_${item.id}`;
          const keyItem = `item_${item.id}`;
          const quantidadeLancada = quantidadesLancadas[keyProduto] || quantidadesLancadas[keyItem] || 0;
          
          // Quantidade disponível = quantidade do pedido - quantidade já lançada
          const quantidadeDisponivel = Math.max(0, quantidadePedido - quantidadeLancada);
          
          return {
            produto_id: item.produto_generico_id || null, // Mantido para compatibilidade com o componente
            produto_generico_id: item.produto_generico_id || null,
            descricao: item.nome_produto || '',
            unidade_comercial: item.unidade_medida || item.unidade_sigla || 'UN',
            quantidade: quantidadeDisponivel > 0 ? quantidadeDisponivel : 0, // Quantidade recebida inicia com o disponível
            quantidade_pedido: quantidadePedido,
            quantidade_lancada: quantidadeLancada, // Guardar para referência
            quantidade_disponivel: quantidadeDisponivel, // Guardar para validação
            valor_unitario: parseFloat(item.valor_unitario) || 0,
            valor_total: 0, // Será calculado
            valor_desconto: 0 // Será calculado
          };
        }).filter(item => item.quantidade_disponivel > 0); // Mostrar apenas itens com quantidade disponível
        
        // Só atualizar se não houver itens já carregados (edição/visualização)
        if (!itensCarregadosRef.current) {
          onItensChange(itensNotaFiscal);
        }
      } catch (error) {
        console.error('Erro ao carregar itens do pedido:', error);
        onItensChange([]);
      } finally {
        setLoadingProdutos(false);
      }
    };

    carregarItensPedido();
  }, [pedidoId, notaFiscalId, onItensChange]);

  // Enriquecer itens da nota fiscal com informações do pedido (quando editando/visualizando)
  useEffect(() => {
    const enriquecerItensComPedido = async () => {
      // Se não há pedidoId ou notaFiscalId, não precisa enriquecer
      if (!pedidoId || !notaFiscalId) {
        return;
      }

      // Se os itens já têm quantidade_pedido, não precisa enriquecer
      if (itens && itens.length > 0 && itens.every(item => item.quantidade_pedido)) {
        return;
      }

      // Se não há itens, não precisa enriquecer
      if (!itens || itens.length === 0) {
        return;
      }

      try {
        // Buscar pedido para obter quantidades do pedido
        const response = await PedidosComprasService.buscarPorId(pedidoId);
        if (!response.success || !response.data) {
          return;
        }

        const pedido = response.data;
        const itensPedido = pedido.itens || [];

        // Buscar quantidades já lançadas em outras notas fiscais
        let quantidadesLancadas = {};
        try {
          const quantidadesResponse = await NotaFiscalService.buscarQuantidadesLancadas(pedidoId, notaFiscalId);
          if (quantidadesResponse.success) {
            quantidadesLancadas = quantidadesResponse.data || {};
          }
        } catch (error) {
          console.error('Erro ao buscar quantidades lançadas:', error);
        }

        // Enriquecer itens da nota fiscal com informações do pedido
        const itensEnriquecidos = itens.map(itemNota => {
          // Encontrar item correspondente no pedido
          const itemPedido = itensPedido.find(pedItem => 
            pedItem.produto_generico_id && pedItem.produto_generico_id === itemNota.produto_generico_id
          );

          if (itemPedido) {
            const quantidadePedido = parseFloat(itemPedido.quantidade_pedido) || 0;
            
            // Calcular quantidade já lançada em OUTRAS notas fiscais
            const keyProduto = itemPedido.produto_generico_id 
              ? `produto_${itemPedido.produto_generico_id}` 
              : `item_${itemPedido.id}`;
            const keyItem = `item_${itemPedido.id}`;
            const quantidadeLancadaOutras = quantidadesLancadas[keyProduto] || quantidadesLancadas[keyItem] || 0;
            
            // Quantidade lançada nesta nota fiscal
            const quantidadeNestaNota = parseFloat(itemNota.quantidade) || 0;
            
            // Quantidade disponível = quantidade do pedido - quantidade já lançada em outras notas - quantidade desta nota
            const quantidadeDisponivel = Math.max(0, quantidadePedido - quantidadeLancadaOutras - quantidadeNestaNota);

            return {
              ...itemNota,
              quantidade_pedido: quantidadePedido,
              quantidade_lancada: quantidadeLancadaOutras,
              quantidade_disponivel: quantidadeDisponivel
            };
          }

          // Se não encontrou item no pedido, manter como está
          return itemNota;
        });

        // Atualizar itens apenas se houver mudanças
        const itensMudaram = itensEnriquecidos.some((item, index) => {
          const itemOriginal = itens[index];
          return item.quantidade_pedido !== itemOriginal.quantidade_pedido ||
                 item.quantidade_disponivel !== itemOriginal.quantidade_disponivel;
        });

        if (itensMudaram) {
          onItensChange(itensEnriquecidos);
        }
      } catch (error) {
        console.error('Erro ao enriquecer itens com informações do pedido:', error);
      }
    };

    enriquecerItensComPedido();
  }, [pedidoId, notaFiscalId, itens, onItensChange]);

  // Marcar que os itens foram carregados quando recebidos via props (edição/visualização)
  useEffect(() => {
    if (itens && itens.length > 0) {
      // Verificar se os itens parecem vir da nota fiscal (têm quantidade diferente ou não têm quantidade_pedido)
      const itensVemDaNotaFiscal = itens.some(item => {
        const quantidade = parseFloat(item.quantidade) || 0;
        const quantidadePedido = parseFloat(item.quantidade_pedido) || 0;
        // Se quantidade é diferente de quantidade_pedido OU não tem quantidade_pedido, veio da nota fiscal
        return quantidade !== quantidadePedido || !item.quantidade_pedido;
      });
      
      if (itensVemDaNotaFiscal && !itensCarregadosRef.current) {
        itensCarregadosRef.current = true;
      }
    }
    // Resetar flag se os itens forem limpos
    if (!itens || itens.length === 0) {
      itensCarregadosRef.current = false;
    }
  }, [itens]);

  // Calcular desconto proporcional
  const calcularDescontoProporcional = (item) => {
    if (!descontoTotal || descontoTotal === 0 || itens.length === 0) return 0;
    
    const valorTotalItens = itens.reduce((sum, i) => {
      const qtd = parseFloat(i.quantidade) || 0;
      const valor = parseFloat(i.valor_unitario) || 0;
      return sum + (qtd * valor);
    }, 0);

    if (valorTotalItens === 0) return 0;

    const valorItem = (parseFloat(item.quantidade) || 0) * (parseFloat(item.valor_unitario) || 0);
    return (valorItem / valorTotalItens) * parseFloat(descontoTotal);
  };

  // Calcular valor total do item
  const calcularValorTotalItem = (item) => {
    const quantidade = parseFloat(item.quantidade) || 0;
    const valorUnitario = parseFloat(item.valor_unitario) || 0;
    const desconto = calcularDescontoProporcional(item);
    return (quantidade * valorUnitario) - desconto;
  };

  // Atualizar quantidade recebida de um item
  const handleQuantidadeChange = (index, novaQuantidade) => {
    const qtd = parseFloat(novaQuantidade) || 0;
    const item = itens[index];
    
    // Validar: quantidade recebida não pode ser maior que a disponível
    const quantidadeDisponivel = item.quantidade_disponivel || (item.quantidade_pedido - (item.quantidade_lancada || 0));
    if (qtd > quantidadeDisponivel) {
      setErrorMessage(`Quantidade recebida não pode ser maior que a quantidade disponível (${quantidadeDisponivel})`);
      setShowErrorModal(true);
      return;
    }

    if (qtd < 0) {
      setErrorMessage('Quantidade não pode ser negativa');
      setShowErrorModal(true);
      return;
    }

    const novosItens = [...itens];
    novosItens[index] = {
      ...item,
      quantidade: qtd
    };

    onItensChange(novosItens);
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar número removendo zeros desnecessários à direita (para exibição)
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    if (num === 0) return '0';
    
    // Se o número é inteiro, retornar sem decimais
    if (Number.isInteger(num)) {
      return num.toString();
    }
    
    // Para números decimais, converter para string e remover zeros à direita
    const str = num.toString();
    
    // Se não tem ponto decimal, retornar como está
    if (!str.includes('.')) {
      return str;
    }
    
    // Remover zeros à direita após o ponto decimal
    return str.replace(/\.?0+$/, ''); // Remove zeros à direita e o ponto se não sobrar nada
  };

  // Formatar número para input (remove zeros desnecessários mas mantém formato válido)
  const formatNumberInput = (value) => {
    if (value === null || value === undefined || value === '') return '';
    
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    
    // Se o número é inteiro, retornar sem decimais
    if (Number.isInteger(num)) {
      return num.toString();
    }
    
    // Para números decimais, converter para string e remover zeros à direita
    const str = num.toString();
    
    // Se não tem ponto decimal, retornar como está
    if (!str.includes('.')) {
      return str;
    }
    
    // Remover zeros à direita após o ponto decimal
    return str.replace(/\.?0+$/, ''); // Remove zeros à direita e o ponto se não sobrar nada
  };

  return (
    <FormSection
      icon={FaBoxes}
      title="Produtos da Nota Fiscal"
      description="Os produtos são carregados automaticamente do pedido de compra selecionado. Você pode ajustar as quantidades recebidas."
    >
      {loadingProdutos && (
        <p className="text-sm text-gray-500 text-center py-4">
          Carregando produtos do pedido...
        </p>
      )}

      {!loadingProdutos && !pedidoId && (
        <p className="text-sm text-gray-500 text-center py-4">
          Selecione um pedido de compra acima para carregar os produtos
        </p>
      )}

      {!loadingProdutos && pedidoId && itens.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Nenhum produto encontrado no pedido selecionado
        </p>
      )}

      {/* Tabela de Produtos */}
      {!loadingProdutos && itens.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white border-b-2 border-gray-300">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Produto</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Unidade</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Qtd. Pedido</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Saldo Disponível</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Qtd. Recebida *</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Valor Unit.</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Desconto</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Valor Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {itens.map((item, index) => {
                const desconto = calcularDescontoProporcional(item);
                const valorTotal = calcularValorTotalItem(item);
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.descricao}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {item.unidade_comercial || 'UN'}
                    </td>
                    <td className="px-3 py-2 text-right text-sm text-gray-900">
                      {formatNumber(item.quantidade_pedido)}
                    </td>
                    <td className="px-3 py-2 text-right text-sm text-gray-700 font-medium">
                      {formatNumber(item.quantidade_disponivel || (item.quantidade_pedido - (item.quantidade_lancada || 0)))}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {isViewMode ? (
                        <span className="text-sm text-gray-900">
                          {formatNumber(item.quantidade)}
                        </span>
                      ) : (
                        <input
                          type="number"
                          step="0.0001"
                          min="0"
                          max={item.quantidade_disponivel || item.quantidade_pedido || undefined}
                          value={formatNumberInput(item.quantidade)}
                          onChange={(e) => handleQuantidadeChange(index, e.target.value)}
                          className="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-sm text-gray-900">
                      {formatCurrency(item.valor_unitario)}
                    </td>
                    <td className="px-3 py-2 text-right text-sm text-gray-500">
                      {formatCurrency(desconto)}
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(valorTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Erro */}
      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} size="sm" title="">
        <div className="text-center">
          {/* Ícone */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <FaExclamationTriangle className="h-6 w-6 text-yellow-500" />
          </div>

          {/* Título */}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Validação
          </h3>

          {/* Mensagem */}
          <p className="text-sm text-gray-500 mb-6">
            {errorMessage}
          </p>

          {/* Botão */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowErrorModal(false)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              size="md"
            >
              Entendi
            </Button>
          </div>
        </div>
      </Modal>
    </FormSection>
  );
};

export default ProdutosNotaFiscal;
