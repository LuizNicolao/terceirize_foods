import React, { useState, useMemo, useEffect } from 'react';
import { FaTrash, FaChevronDown, FaChevronUp, FaList, FaLayerGroup } from 'react-icons/fa';
import { Input, Pagination } from '../../ui';

const AjusteTabelaCoordenacao = ({
  necessidades,
  ajustesLocais,
  onAjusteChange,
  onExcluirNecessidade,
  canEdit
}) => {
  // Estado para controlar modo de visualização
  const [modoVisualizacao, setModoVisualizacao] = useState('individual'); // 'individual' ou 'consolidado'
  const [expandedRows, setExpandedRows] = useState({});
  
  // Funções auxiliares - devem ser definidas antes do useMemo que as utiliza
  // Função para formatar números
  const formatarQuantidade = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
      return '0';
    }
    const num = typeof valor === 'number' ? valor : parseFloat(valor);
    if (isNaN(num)) {
      return '0';
    }
    // Se for um número inteiro, exibir sem decimais
    if (num % 1 === 0) {
      return num.toString();
    }
    // Caso contrário, formatar com até 3 casas decimais, removendo zeros à direita
    return num.toFixed(3).replace(/\.?0+$/, '').replace('.', ',');
  };

  // Função para calcular quantidade anterior
  const getQuantidadeAnterior = (necessidade) => {
    // Se existe ajuste_anterior, usar ele
    if (necessidade.ajuste_anterior !== null && necessidade.ajuste_anterior !== undefined) {
      return necessidade.ajuste_anterior ?? 0;
    }
    // Fallback para lógica antiga se ajuste_anterior não existir
    if (necessidade.status === 'CONF COORD') {
      return necessidade.ajuste_conf_nutri ?? 0;
    }
    if (necessidade.status === 'NEC COORD') {
      return necessidade.ajuste_nutricionista ?? 0;
    }
    return 0;
  };

  // Função para calcular quantidade atual baseado no status
  const getQuantidadeAtual = (necessidade) => {
    if (necessidade.status === 'CONF COORD') {
      return necessidade.ajuste_conf_coord ?? necessidade.ajuste_conf_nutri ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste ?? 0;
    }
    if (necessidade.status === 'NEC COORD') {
      return necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0;
    }
    return necessidade.ajuste_nutricionista ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste ?? 0;
  };

  // Função para calcular a diferença
  const getDiferenca = (necessidade) => {
    const atual = getQuantidadeAtual(necessidade);
    const anterior = getQuantidadeAnterior(necessidade);
    return atual - anterior;
  };

  // Função para consolidar necessidades por produto_id + grupo_id
  const necessidadesConsolidadas = useMemo(() => {
    const consolidado = new Map();
    
    necessidades.forEach(nec => {
      // Chave única: produto_id + grupo_id (para diferenciar mesmo produto em grupos diferentes)
      const chave = `${nec.produto_id || ''}_${nec.grupo_id || nec.grupo || ''}`;
      
      if (!consolidado.has(chave)) {
        consolidado.set(chave, {
          produto_id: nec.produto_id,
          produto_codigo: nec.produto_codigo,
          produto: nec.produto,
          produto_unidade: nec.produto_unidade,
          grupo: nec.grupo,
          grupo_id: nec.grupo_id,
          quantidade_total: parseFloat(getQuantidadeAtual(nec) || 0),
          quantidade_anterior_total: parseFloat(getQuantidadeAnterior(nec) || 0),
          ajuste_total: 0,
          diferenca_total: 0,
          total_escolas: 1,
          escolas: [nec]
        });
      } else {
        const item = consolidado.get(chave);
        item.quantidade_total += parseFloat(getQuantidadeAtual(nec) || 0);
        item.quantidade_anterior_total += parseFloat(getQuantidadeAnterior(nec) || 0);
        item.total_escolas += 1;
        item.escolas.push(nec);
      }
    });

    // Calcular ajuste e diferença totais
    return Array.from(consolidado.values()).map(item => {
      // Calcular ajuste total baseado nos ajustesLocais
      const ajusteTotal = item.escolas.reduce((acc, escola) => {
        const chave = `${escola.escola_id}_${escola.produto_id}`;
        const ajusteLocal = ajustesLocais[chave];
        if (ajusteLocal !== undefined && ajusteLocal !== '') {
          const ajusteNormalizado = String(ajusteLocal).replace(',', '.');
          return acc + (parseFloat(ajusteNormalizado) || 0);
        } else {
          // Se não tem ajuste local, usar o valor atual
          return acc + parseFloat(getQuantidadeAtual(escola) || 0);
        }
      }, 0);

      item.ajuste_total = ajusteTotal;
      item.diferenca_total = ajusteTotal - item.quantidade_anterior_total;

      return item;
    });
  }, [necessidades, ajustesLocais]);

  const handleToggleExpand = (chave) => {
    setExpandedRows(prev => ({
      ...prev,
      [chave]: !prev[chave]
    }));
  };

  // Paginação
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Calcular dados paginados baseado no modo
  const dadosPaginados = useMemo(() => {
    const dados = modoVisualizacao === 'consolidado' ? necessidadesConsolidadas : necessidades;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return dados.slice(start, end);
  }, [modoVisualizacao === 'consolidado' ? necessidadesConsolidadas : necessidades, page, itemsPerPage, modoVisualizacao]);

  const totalItems = modoVisualizacao === 'consolidado' ? necessidadesConsolidadas.length : necessidades.length;

  // Resetar para página 1 quando necessidades ou modo mudarem
  useEffect(() => {
    setPage(1);
  }, [necessidades.length, modoVisualizacao]);

  // Renderização Individual (modo atual)
  const renderTabelaIndividual = () => (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cod Unidade
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unidade Escolar
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Codigo Produto
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unidade de Medida
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade anterior
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ajuste
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Diferença
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {dadosPaginados.map((necessidade) => (
            <tr key={necessidade.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                {necessidade.escola_id || 'N/A'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-center">
                {necessidade.escola}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                {necessidade.produto_codigo || necessidade.produto_id || 'N/A'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-center">
                {necessidade.produto}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {necessidade.produto_unidade}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
              {formatarQuantidade(getQuantidadeAtual(necessidade))}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {formatarQuantidade(getQuantidadeAnterior(necessidade))}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  value={ajustesLocais[`${necessidade.escola_id}_${necessidade.produto_id}`] || ''}
                  onChange={(e) => {
                    const valor = e.target.value;
                    // Permitir apenas números, vírgula e ponto
                    if (valor === '' || /^[0-9]*[.,]?[0-9]*$/.test(valor)) {
                      onAjusteChange({
                        escola_id: necessidade.escola_id,
                        produto_id: necessidade.produto_id,
                        valor: valor
                      });
                    }
                  }}
                  className="w-20 text-center text-xs py-1"
                  disabled={necessidade.status === 'CONF' || !canEdit}
                  placeholder="0.000"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                {getDiferenca(necessidade) !== 0 && (
                  <span className={getDiferenca(necessidade) > 0 ? 'text-green-600' : 'text-red-600'}>
                    {getDiferenca(necessidade) > 0 ? '+' : ''}{formatarQuantidade(getDiferenca(necessidade))}
                  </span>
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                <button
                  onClick={() => onExcluirNecessidade(necessidade)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Excluir produto"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  );

  // Renderização Consolidada
  const renderTabelaConsolidada = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th style={{ width: '50px' }} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Codigo Produto
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Produto
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Unidade de Medida
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Quantidade Total
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Quantidade Anterior Total
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ajuste Total
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Diferença Total
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Escolas
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {dadosPaginados.map((consolidado) => {
          const chave = `${consolidado.produto_id}_${consolidado.grupo_id || consolidado.grupo}`;
          
          return (
            <React.Fragment key={chave}>
              {/* Linha Consolidada */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleToggleExpand(chave)}
                    className="text-green-600 hover:text-green-700 focus:outline-none transition-colors"
                  >
                    {expandedRows[chave] ? (
                      <FaChevronUp className="w-4 h-4" />
                    ) : (
                      <FaChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                  <span className="font-semibold text-cyan-600">
                    {consolidado.produto_codigo || consolidado.produto_id || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                  {consolidado.produto}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                  {consolidado.produto_unidade}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                  {formatarQuantidade(consolidado.quantidade_total)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                  {formatarQuantidade(consolidado.quantidade_anterior_total)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                  {formatarQuantidade(consolidado.ajuste_total)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                  {consolidado.diferenca_total !== 0 && (
                    <span className={consolidado.diferenca_total > 0 ? 'text-green-600' : 'text-red-600'}>
                      {consolidado.diferenca_total > 0 ? '+' : ''}{formatarQuantidade(consolidado.diferenca_total)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                    {consolidado.total_escolas}
                  </span>
                </td>
              </tr>

              {/* Linha Expandida (Detalhes das Escolas) */}
              {expandedRows[chave] && (
                <tr className="bg-gray-50">
                  <td colSpan="9" className="px-6 py-4">
                    <div className="bg-gray-50 border-l-4 border-green-600 p-4">
                      <h4 className="text-md font-semibold text-green-700 mb-4 flex items-center gap-2">
                        <span className="text-xl">🏢</span>
                        Unidades Escolares - {consolidado.produto}
                      </h4>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Cod Unidade</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Unidade Escolar</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produto</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Unidade</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quantidade</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quantidade Anterior</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ajuste</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Diferença</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {consolidado.escolas.map((necessidade) => (
                            <tr key={necessidade.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                {necessidade.escola_id}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                {necessidade.escola}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                {necessidade.produto}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                                {necessidade.produto_unidade}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                {formatarQuantidade(getQuantidadeAtual(necessidade))}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                                {formatarQuantidade(getQuantidadeAnterior(necessidade))}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  value={ajustesLocais[`${necessidade.escola_id}_${necessidade.produto_id}`] || ''}
                                  onChange={(e) => {
                                    const valor = e.target.value;
                                    if (valor === '' || /^[0-9]*[.,]?[0-9]*$/.test(valor)) {
                                      onAjusteChange({
                                        escola_id: necessidade.escola_id,
                                        produto_id: necessidade.produto_id,
                                        valor: valor
                                      });
                                    }
                                  }}
                                  className="w-20 text-center text-xs py-1"
                                  disabled={necessidade.status === 'CONF' || !canEdit}
                                  placeholder="0.000"
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                                {getDiferenca(necessidade) !== 0 && (
                                  <span className={getDiferenca(necessidade) > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {getDiferenca(necessidade) > 0 ? '+' : ''}{formatarQuantidade(getDiferenca(necessidade))}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                                <button
                                  onClick={() => onExcluirNecessidade(necessidade)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Excluir produto"
                                  disabled={!canEdit}
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="overflow-x-auto">
      {/* Botão de alternância de modo */}
      <div className="mb-4 flex justify-end">
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setModoVisualizacao('individual')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              modoVisualizacao === 'individual'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Visualização Individual"
          >
            <FaList className="w-4 h-4" />
            Individual
          </button>
          <button
            onClick={() => setModoVisualizacao('consolidado')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              modoVisualizacao === 'consolidado'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Visualização Consolidada"
          >
            <FaLayerGroup className="w-4 h-4" />
            Consolidado
          </button>
        </div>
      </div>

      {/* Tabela baseada no modo */}
      {modoVisualizacao === 'consolidado' ? renderTabelaConsolidada() : renderTabelaIndividual()}
      
      {/* Paginação */}
      {totalItems > itemsPerPage && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AjusteTabelaCoordenacao;
