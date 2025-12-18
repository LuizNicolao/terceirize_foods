/**
 * Componente da tabela de produtos com cabeçalho e primeira coluna fixos (sticky)
 */

import React from 'react';
import { formatarNumero, calcularPercentual } from './utils/necessidadeModalUtils';

const NecessidadeProdutosTable = ({
  produtos = [],
  tiposDisponiveis = [],
  onFrequenciaChange,
  onAjusteChange,
  loading = false
}) => {
  return (
    <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
      <table className="min-w-full divide-y divide-gray-200 border-b border-gray-200">
        {/* Cabeçalho fixo */}
        <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {/* Coluna Produtos - fixa à esquerda */}
                <th 
                  rowSpan="2" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 bg-gray-50 sticky left-0 z-20"
                  style={{ boxShadow: '2px 0 4px rgba(0,0,0,0.1)' }}
                >
                  Produtos
                </th>
                {/* Cabeçalhos dos tipos de atendimento */}
                {tiposDisponiveis.map((tipo) => (
                  <th 
                    key={tipo.key} 
                    colSpan="4" 
                    className={`px-2 py-3 text-center text-xs font-medium text-white uppercase tracking-wider ${tipo.bgColor} border-r border-gray-300`}
                  >
                    {tipo.label}
                  </th>
                ))}
                <th 
                  rowSpan="2" 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 bg-gray-50"
                >
                  TOTAL
                </th>
                <th 
                  rowSpan="2" 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 bg-gray-50"
                >
                  PEDIDO
                </th>
                <th 
                  rowSpan="2" 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                >
                  % (Nº)
                </th>
              </tr>
              <tr>
                {/* Subcabeçalhos: Percapta, Média, Frequência, QTD */}
                {tiposDisponiveis.map((tipo) => (
                  <React.Fragment key={tipo.key}>
                    <th className={`px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider ${tipo.bgCellColor} border-r border-gray-200`}>
                      Percapta
                    </th>
                    <th className={`px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider ${tipo.bgCellColor} border-r border-gray-200`}>
                      Média
                    </th>
                    <th className={`px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider ${tipo.bgCellColor} border-r border-gray-200`}>
                      Frequência <span className="text-blue-600">*</span>
                    </th>
                    <th className={`px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider ${tipo.bgCellColor} border-r border-gray-300`}>
                      QTD
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            
            {/* Corpo da tabela */}
            <tbody className="bg-white divide-y divide-gray-200">
              {produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  {/* Coluna Produtos - fixa à esquerda */}
                  <td 
                    className="px-4 py-4 whitespace-nowrap bg-white sticky left-0 z-10"
                    style={{ boxShadow: '2px 0 4px rgba(0,0,0,0.1)' }}
                  >
                    <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                    <div className="text-sm text-gray-500">({produto.unidade_medida})</div>
                  </td>
                  
                  {/* Células dos tipos de atendimento */}
                  {tiposDisponiveis.map((tipo) => {
                    const tipoKey = tipo.key;
                    const percapitaKey = `percapita_${tipoKey}`;
                    const mediaKey = `media_${tipoKey}`;
                    const frequenciaKey = `frequencia_${tipoKey}`;
                    const qtdKey = `qtd_${tipoKey}`;
                    
                    return (
                      <React.Fragment key={tipoKey}>
                        <td className={`px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${tipo.bgCellColor} border-r border-gray-200`}>
                          {formatarNumero(produto[percapitaKey] || 0)}
                        </td>
                        <td className={`px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${tipo.bgCellColor} border-r border-gray-200`}>
                          {produto[mediaKey] || 0}
                        </td>
                        <td className={`px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${tipo.bgCellColor} border-r border-gray-200`}>
                          <input
                            type="number"
                            value={produto[frequenciaKey] || ''}
                            onChange={(e) => onFrequenciaChange(produto.id, tipoKey, e.target.value)}
                            min="0"
                            step="1"
                            placeholder=""
                            className="w-16 text-center border border-gray-300 rounded px-1 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                          />
                        </td>
                        <td className={`px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${tipo.bgCellColor} border-r border-gray-300`}>
                          {formatarNumero(produto[qtdKey] || 0)}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  
                  {/* TOTAL */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center bg-gray-50 border-r border-gray-300">
                    {formatarNumero(produto.total)}
                  </td>
                  
                  {/* PEDIDO */}
                  <td className="px-4 py-4 whitespace-nowrap text-center bg-yellow-50 border-r border-gray-300">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={produto.ajuste}
                      onChange={(e) => onAjusteChange(produto.id, e.target.value)}
                      placeholder=""
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      disabled={loading}
                    />
                  </td>
                  
                  {/* % */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center bg-gray-50">
                    {calcularPercentual(produto.total, produto.ajuste)}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default NecessidadeProdutosTable;
