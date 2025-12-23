/**
 * Modal de Visualização de Necessidade
 */

import React from 'react';
import { Modal } from '../../../components/ui';

const NecessidadeVisualizacaoModal = ({
  isOpen,
  onClose,
  necessidade = null
}) => {
  // Função para formatar números no padrão brasileiro
  // CORREÇÃO: Valores no banco estão armazenados como inteiros multiplicados por 1000
  // Exemplo: 7200 no banco representa 7,2 (deve dividir por 1000)
  const formatarQuantidade = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
      return '0';
    }
    
    // Se o valor vier como string "7.200", pode ser que o banco retornou como decimal formatado
    // Precisamos verificar se é uma string que representa um número inteiro grande
    let num;
    if (typeof valor === 'string') {
      // Se a string contém ponto, pode ser formato decimal ou separador de milhar
      // Exemplo: "7.200" pode ser 7.2 ou 7200
      // Se não tem vírgula e tem ponto, tentar interpretar como número inteiro
      if (valor.includes('.') && !valor.includes(',')) {
        // Remover pontos e tentar parseFloat
        const semPontos = valor.replace(/\./g, '');
        const numSemPontos = parseFloat(semPontos);
        // Se ao remover os pontos o número fica >= 100, provavelmente é inteiro multiplicado por 1000
        if (!isNaN(numSemPontos) && numSemPontos >= 100 && numSemPontos % 1 === 0) {
          num = numSemPontos / 1000;
        } else {
          num = parseFloat(valor);
        }
      } else {
        num = parseFloat(valor.replace(',', '.'));
      }
    } else {
      num = valor;
    }
    
    if (isNaN(num)) {
      return '0';
    }
    
    // Verificar se o valor precisa ser convertido (valores inteiros >= 100 sem parte decimal)
    // Isso indica que está armazenado como inteiro multiplicado por 1000
    const parteInteiraOriginal = Math.floor(Math.abs(num));
    const parteDecimalOriginal = Math.abs(num) - parteInteiraOriginal;
    
    // Se for um inteiro grande (>= 100) sem parte decimal, dividir por 1000
    if (parteDecimalOriginal === 0 && parteInteiraOriginal >= 100) {
      num = num / 1000;
    }
    
    // Formatar o número completo usando toLocaleString para garantir formatação correta
    const sinal = num < 0 ? '-' : '';
    const numAbsoluto = Math.abs(num);
    
    // Usar toLocaleString para formatar corretamente
    const formatado = numAbsoluto.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    });
    
    return sinal + formatado;
  };

  if (!necessidade) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Necessidade - ${necessidade?.escola || ''}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Informações da Escola */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Escola:</span>
              <p className="text-gray-900">{necessidade.escola}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Rota:</span>
              <p className="text-gray-900">{necessidade.rota}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Semana de Consumo:</span>
              <p className="text-gray-900">{necessidade.data_consumo}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Gerado em:</span>
              <p className="text-gray-900">
                {new Date(necessidade.data_preenchimento).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        {necessidade.produtos && Array.isArray(necessidade.produtos) && necessidade.produtos.length > 0 ? (
          <>
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Produtos ({necessidade.produtos.length})
          </h4>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ajuste
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                    {necessidade.produtos.map((produto, index) => (
                      <tr key={produto.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {produto.produto_nome || produto.produto}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {produto.produto_unidade}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            Number(produto.ajuste || 0) > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                            {formatarQuantidade(produto.ajuste || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">
              <strong>Total de produtos com ajuste:</strong>{' '}
                  {necessidade.produtos.filter(p => Number(p.ajuste || 0) > 0).length}
            </span>
            <span className="text-blue-900 font-semibold">
              <strong>Soma dos ajustes:</strong>{' '}
                  {formatarQuantidade(
                    necessidade.produtos
                      .reduce((sum, p) => sum + Number(p.ajuste || 0), 0)
                  )}
            </span>
          </div>
        </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Esta visualização não possui detalhamento de produtos.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NecessidadeVisualizacaoModal;
