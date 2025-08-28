import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaSpinner, FaDollarSign, FaTruck, FaCreditCard, FaBox } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { aprovacoesService } from '../../services/aprovacoes';

const ModalAprovacao = ({ 
  cotacao, 
  onClose, 
  onSuccess,
  itensMelhorPreco,
  itensMelhorEntrega,
  itensMelhorPagamento,
  aprovacoesResumo
}) => {
  const [motivoAprovacao, setMotivoAprovacao] = useState('');
  const [tipoAprovacao, setTipoAprovacao] = useState(() => {
    // Se há seleções no resumo comparativo, usar seleção personalizada como padrão
    if (aprovacoesResumo && Object.values(aprovacoesResumo).some(arr => arr.length > 0)) {
      return 'selecao-personalizada';
    }
    return 'manual';
  });
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleAprovacaoConfirmada = async () => {
    if (!motivoAprovacao.trim()) {
      toast.error('Por favor, informe o motivo da aprovação.');
      return;
    }

    // Determinar quais itens serão aprovados baseado no tipo de aprovação
    let itensAprovados = [];
    
    switch (tipoAprovacao) {
      case 'manual':
        itensAprovados = itensSelecionados;
        break;
      case 'melhor-preco':
        itensAprovados = itensMelhorPreco;
        break;
      case 'melhor-prazo-entrega':
        itensAprovados = itensMelhorEntrega;
        break;
      case 'melhor-prazo-pagamento':
        itensAprovados = itensMelhorPagamento;
        break;
      case 'selecao-personalizada':
        // Usar as seleções do resumo comparativo
        const produtosSelecionados = [];
        
        // Adicionar produtos de melhor preço selecionados
        if (aprovacoesResumo?.melhorPreco) {
          aprovacoesResumo.melhorPreco.forEach(produtoNome => {
            const item = cotacao.itens.find(item => 
              item.produto_nome === produtoNome && 
              item.fornecedor_nome === cotacao.itens.find(i => 
                i.produto_nome === produtoNome
              )?.fornecedor_nome
            );
            if (item) produtosSelecionados.push(item);
          });
        }
        
        // Adicionar produtos de melhor entrega selecionados
        if (aprovacoesResumo?.melhorEntrega) {
          aprovacoesResumo.melhorEntrega.forEach(produtoNome => {
            const item = cotacao.itens.find(item => 
              item.produto_nome === produtoNome && 
              item.fornecedor_nome === cotacao.itens.find(i => 
                i.produto_nome === produtoNome
              )?.fornecedor_nome
            );
            if (item) produtosSelecionados.push(item);
          });
        }
        
        // Adicionar produtos de melhor pagamento selecionados
        if (aprovacoesResumo?.melhorPagamento) {
          aprovacoesResumo.melhorPagamento.forEach(produtoNome => {
            const item = cotacao.itens.find(item => 
              item.produto_nome === produtoNome && 
              item.fornecedor_nome === cotacao.itens.find(i => 
                i.produto_nome === produtoNome
              )?.fornecedor_nome
            );
            if (item) produtosSelecionados.push(item);
          });
        }
        
        itensAprovados = produtosSelecionados;
        break;
    }

    if (itensAprovados.length === 0) {
      toast.error('Por favor, selecione pelo menos um item para aprovação.');
      return;
    }

    setSaving(true);
    try {
      // Log para debug
      console.log('Dados sendo enviados:', {
        motivo_aprovacao: motivoAprovacao,
        itens_aprovados: itensAprovados,
        tipo_aprovacao: tipoAprovacao
      });
      
      await aprovacoesService.aprovarCotacao(cotacao.id, {
        motivo_aprovacao: motivoAprovacao,
        itens_aprovados: itensAprovados,
        tipo_aprovacao: tipoAprovacao
      });
      
      toast.success('Cotação aprovada com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao aprovar cotação:', error);
      console.error('Detalhes do erro:', error.response?.data);
      
      // Mostrar detalhes específicos dos erros de validação
      if (error.response?.data?.errors) {
        console.error('Erros de validação:');
        error.response.data.errors.forEach((err, index) => {
          console.error(`${index + 1}. Campo: ${err.path}, Valor: ${err.value}, Mensagem: ${err.msg}`);
        });
        
        // Mostrar o primeiro erro para o usuário
        const primeiroErro = error.response.data.errors[0];
        toast.error(`Erro de validação: ${primeiroErro.msg}`);
      } else {
        toast.error('Erro ao aprovar cotação');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <FaCheck size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Aprovar Cotação</h3>
                <p className="text-green-100 text-sm">Selecione os itens e informe o motivo da aprovação</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-100 transition-colors duration-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="p-10 overflow-y-auto max-h-[calc(95vh-160px)]">
          {/* Opções de Aprovação */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Tipo de Aprovação
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <label className={`relative cursor-pointer transition-all duration-200 ${
                tipoAprovacao === 'manual' 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:bg-gray-50'
              } border-2 border-gray-200 rounded-lg p-6`}>
                <input
                  type="radio"
                  name="tipo-aprovacao"
                  value="manual"
                  checked={tipoAprovacao === 'manual'}
                  onChange={(e) => setTipoAprovacao(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    tipoAprovacao === 'manual' 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-300'
                  }`}>
                    {tipoAprovacao === 'manual' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Seleção Manual</div>
                    <div className="text-sm text-gray-600 mt-1">Escolha manualmente quais itens aprovar</div>
                  </div>
                </div>
              </label>

              <label className={`relative cursor-pointer transition-all duration-200 ${
                tipoAprovacao === 'melhor-preco' 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:bg-gray-50'
              } border-2 border-gray-200 rounded-lg p-6`}>
                <input
                  type="radio"
                  name="tipo-aprovacao"
                  value="melhor-preco"
                  checked={tipoAprovacao === 'melhor-preco'}
                  onChange={(e) => setTipoAprovacao(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    tipoAprovacao === 'melhor-preco' 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-300'
                  }`}>
                    {tipoAprovacao === 'melhor-preco' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Melhor Preço</div>
                    <div className="text-sm text-gray-600 mt-1">Aprova automaticamente itens com menor valor</div>
                  </div>
                </div>
              </label>

              <label className={`relative cursor-pointer transition-all duration-200 ${
                tipoAprovacao === 'melhor-prazo-entrega' 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:bg-gray-50'
              } border-2 border-gray-200 rounded-lg p-6`}>
                <input
                  type="radio"
                  name="tipo-aprovacao"
                  value="melhor-prazo-entrega"
                  checked={tipoAprovacao === 'melhor-prazo-entrega'}
                  onChange={(e) => setTipoAprovacao(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    tipoAprovacao === 'melhor-prazo-entrega' 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-300'
                  }`}>
                    {tipoAprovacao === 'melhor-prazo-entrega' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Melhor Entrega</div>
                    <div className="text-sm text-gray-600 mt-1">Aprova itens com prazo de entrega menor</div>
                  </div>
                </div>
              </label>

              <label className={`relative cursor-pointer transition-all duration-200 ${
                tipoAprovacao === 'melhor-prazo-pagamento' 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:bg-gray-50'
              } border-2 border-gray-200 rounded-lg p-6`}>
                <input
                  type="radio"
                  name="tipo-aprovacao"
                  value="melhor-prazo-pagamento"
                  checked={tipoAprovacao === 'melhor-prazo-pagamento'}
                  onChange={(e) => setTipoAprovacao(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    tipoAprovacao === 'melhor-prazo-pagamento' 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-300'
                  }`}>
                    {tipoAprovacao === 'melhor-prazo-pagamento' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Melhor Pagamento</div>
                    <div className="text-sm text-gray-600 mt-1">Aprova itens com prazo de pagamento maior</div>
                  </div>
                </div>
              </label>

              {/* Nova opção: Seleção Personalizada */}
              {aprovacoesResumo && Object.values(aprovacoesResumo).some(arr => arr.length > 0) && (
                <label className={`relative cursor-pointer transition-all duration-200 ${
                  tipoAprovacao === 'selecao-personalizada' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                } border-2 border-gray-200 rounded-lg p-6`}>
                  <input
                    type="radio"
                    name="tipo-aprovacao"
                    value="selecao-personalizada"
                    checked={tipoAprovacao === 'selecao-personalizada'}
                    onChange={(e) => setTipoAprovacao(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      tipoAprovacao === 'selecao-personalizada' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {tipoAprovacao === 'selecao-personalizada' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Seleção Personalizada</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Usa as seleções do Resumo Comparativo
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          💰 Melhor Preço: {aprovacoesResumo.melhorPreco?.length || 0}
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          🚚 Melhor Entrega: {aprovacoesResumo.melhorEntrega?.length || 0}
                        </div>
                        <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          💳 Melhor Pagamento: {aprovacoesResumo.melhorPagamento?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Lista de Itens */}
          {tipoAprovacao === 'manual' && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Selecionar Itens
              </h4>
                             <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <div className="grid gap-3">
                  {cotacao?.itens?.map((item, index) => (
                    <label key={index} className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      itensSelecionados.some(
                        selected => selected.produto_id === item.produto_id && 
                        selected.fornecedor_nome === item.fornecedor_nome
                      )
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={itensSelecionados.some(
                          selected => selected.produto_id === item.produto_id && 
                          selected.fornecedor_nome === item.fornecedor_nome
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setItensSelecionados([...itensSelecionados, {
                              produto_id: item.produto_id,
                              fornecedor_nome: item.fornecedor_nome,
                              valor_unitario: parseFloat(item.valor_unitario) || 0,
                              produto_nome: item.produto_nome,
                              quantidade: parseFloat(item.quantidade) || 1
                            }]);
                          } else {
                            setItensSelecionados(itensSelecionados.filter(
                              selected => !(selected.produto_id === item.produto_id && 
                              selected.fornecedor_nome === item.fornecedor_nome)
                            ));
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-4 ${
                        itensSelecionados.some(
                          selected => selected.produto_id === item.produto_id && 
                          selected.fornecedor_nome === item.fornecedor_nome
                        )
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {itensSelecionados.some(
                          selected => selected.produto_id === item.produto_id && 
                          selected.fornecedor_nome === item.fornecedor_nome
                        ) && (
                          <FaCheck size={12} className="text-white" />
                        )}
                      </div>
                                                   <div className="flex-1">
                               <div className="font-semibold text-gray-900 text-lg">{item.produto_nome}</div>
                               <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2 text-sm">
                                 <div className="flex items-center gap-2">
                                   <FaDollarSign className="text-green-500" />
                                   <span className="text-green-600 font-semibold">
                                     R$ {parseFloat(item.valor_unitario).toFixed(2)}
                                   </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <FaTruck className="text-orange-500" />
                                   <span className="text-gray-600">
                                     {item.prazo_entrega || 'Não informado'}
                                   </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <FaCreditCard className="text-purple-500" />
                                   <span className="text-gray-600">
                                     {item.prazo_pagamento || 'Não informado'}
                                   </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <FaBox className="text-blue-500" />
                                   <span className="font-medium text-gray-700">{item.fornecedor_nome}</span>
                                 </div>
                               </div>
                             </div>
                           </label>
                         ))}
                       </div>
                     </div>
                   </div>
                 )}

          {/* Resumo dos Itens Selecionados */}
          {(tipoAprovacao === 'melhor-preco' || tipoAprovacao === 'melhor-prazo-entrega' || tipoAprovacao === 'melhor-prazo-pagamento' || tipoAprovacao === 'selecao-personalizada') && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Itens que serão aprovados
              </h4>
                             <div className="bg-green-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <div className="grid gap-3">
                  {(tipoAprovacao === 'melhor-preco' ? itensMelhorPreco :
                    tipoAprovacao === 'melhor-prazo-entrega' ? itensMelhorEntrega :
                    tipoAprovacao === 'melhor-prazo-pagamento' ? itensMelhorPagamento :
                    tipoAprovacao === 'selecao-personalizada' ? (() => {
                      // Calcular itens da seleção personalizada
                      const produtosSelecionados = [];
                      
                      if (aprovacoesResumo?.melhorPreco) {
                        aprovacoesResumo.melhorPreco.forEach(produtoNome => {
                          const item = cotacao.itens.find(item => 
                            item.produto_nome === produtoNome && 
                            item.fornecedor_nome === cotacao.itens.find(i => 
                              i.produto_nome === produtoNome
                            )?.fornecedor_nome
                          );
                          if (item) produtosSelecionados.push(item);
                        });
                      }
                      
                      if (aprovacoesResumo?.melhorEntrega) {
                        aprovacoesResumo.melhorEntrega.forEach(produtoNome => {
                          const item = cotacao.itens.find(item => 
                            item.produto_nome === produtoNome && 
                            item.fornecedor_nome === cotacao.itens.find(i => 
                              i.produto_nome === produtoNome
                            )?.fornecedor_nome
                          );
                          if (item) produtosSelecionados.push(item);
                        });
                      }
                      
                      if (aprovacoesResumo?.melhorPagamento) {
                        aprovacoesResumo.melhorPagamento.forEach(produtoNome => {
                          const item = cotacao.itens.find(item => 
                            item.produto_nome === produtoNome && 
                            item.fornecedor_nome === cotacao.itens.find(i => 
                              i.produto_nome === produtoNome
                            )?.fornecedor_nome
                          );
                          if (item) produtosSelecionados.push(item);
                        });
                      }
                      
                      return produtosSelecionados;
                    })() : []).map((item, index) => (
                    <div key={index} className="flex items-center p-4 bg-white rounded-lg border border-green-200">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                                                   <div className="flex-1">
                               <div className="font-semibold text-gray-900 text-lg">{item.produto_nome}</div>
                               <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2 text-sm">
                                 <div className="flex items-center gap-2">
                                   <FaDollarSign className="text-green-500" />
                                   <span className="text-green-600 font-semibold">
                                     R$ {parseFloat(item.valor_unitario).toFixed(2)}
                                   </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <FaTruck className="text-orange-500" />
                                   <span className="text-gray-600">
                                     {item.prazo_entrega || 'Não informado'}
                                   </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <FaCreditCard className="text-purple-500" />
                                   <span className="text-gray-600">
                                     {item.prazo_pagamento || 'Não informado'}
                                   </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <FaBox className="text-blue-500" />
                                   <span className="font-medium text-gray-700">{item.fornecedor_nome}</span>
                                 </div>
                               </div>
                             </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Motivo da Aprovação */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Motivo da Aprovação
            </label>
            <textarea
              value={motivoAprovacao}
              onChange={(e) => setMotivoAprovacao(e.target.value)}
              placeholder="Descreva o motivo da aprovação desta cotação..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
              rows={4}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleAprovacaoConfirmada}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Aprovando...
                </>
              ) : (
                <>
                  <FaCheck />
                  Confirmar Aprovação
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAprovacao;
