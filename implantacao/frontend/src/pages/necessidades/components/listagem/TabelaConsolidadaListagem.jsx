/**
 * Componente de tabela para visualização Consolidada
 * Agrupa por produto, grupo e status, somando quantidades
 */

import React from 'react';
import { StatusBadge } from '../../../../components/necessidades';

const TabelaConsolidadaListagem = ({
  dados = [],
  onView = () => {}
}) => {
  // Função auxiliar para converter valor antes de formatar
  // CORREÇÃO: Valores no banco estão armazenados como inteiros multiplicados por 1000
  const converterValor = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
      return 0;
    }
    
    let num;
    if (typeof valor === 'string') {
      if (valor.includes('.') && !valor.includes(',')) {
        const semPontos = valor.replace(/\./g, '');
        const numSemPontos = parseFloat(semPontos);
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
      return 0;
    }
    
    const parteInteiraOriginal = Math.floor(Math.abs(num));
    const parteDecimalOriginal = Math.abs(num) - parteInteiraOriginal;
    
    if (parteDecimalOriginal === 0 && parteInteiraOriginal >= 100) {
      num = num / 1000;
    }
    
    return num;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grupo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Escolas
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Necessidades
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dados.map((item, index) => (
              <tr 
                key={`consolidado-${item.produto_id || item.id || index}`} 
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.produto_nome || item.produto || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.grupo ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {item.grupo}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                    {item.total_escolas || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                    {item.total_necessidades || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {item.quantidade_total ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      {converterValor(item.quantidade_total).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })} {item.produto_unidade || item.unidade_medida_sigla || ''}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <StatusBadge status={item.status || 'NEC'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaConsolidadaListagem;

