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
  const formatarQuantidade = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
      return '0';
    }
    const num = typeof valor === 'number' ? valor : parseFloat(valor);
    if (isNaN(num)) {
      return '0';
    }
    
    // Separar parte inteira e decimal
    const parteInteira = Math.floor(Math.abs(num));
    const parteDecimal = Math.abs(num) - parteInteira;
    const sinal = num < 0 ? '-' : '';
    
    // Formatar parte inteira com separador de milhar (vírgula)
    const parteInteiraFormatada = parteInteira.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Se for um número inteiro, exibir sem decimais
    if (parteDecimal === 0) {
      return sinal + parteInteiraFormatada;
    }
    
    // Caso contrário, formatar com até 3 casas decimais, removendo zeros à direita
    const decimais = parteDecimal.toFixed(3).replace(/\.?0+$/, '');
    return sinal + parteInteiraFormatada + decimais.replace('.', ',');
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
