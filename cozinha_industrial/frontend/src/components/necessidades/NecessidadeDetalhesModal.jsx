import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaDownload, FaList, FaLayerGroup, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Modal, Button, Pagination } from '../ui';

/**
 * Modal para visualizar detalhes de uma necessidade
 */
const NecessidadeDetalhesModal = ({
  isOpen,
  onClose,
  necessidade = null,
  loading = false
}) => {
  // Estado para controlar modo de visualização
  const [modoVisualizacao, setModoVisualizacao] = useState('individual'); // 'individual' ou 'consolidado'
  const [expandedRows, setExpandedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Resetar página quando a necessidade mudar
  useEffect(() => {
    if (necessidade && necessidade.itens) {
      setCurrentPage(1);
      setExpandedRows({});
    }
  }, [necessidade?.id]);

  // Resetar para página 1 quando modo de visualização mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [modoVisualizacao]);

  const meses = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const mesesAbreviados = [
    '', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const formatarData = (data) => {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  };

  const formatarMesRef = (mesRef) => {
    if (!mesRef) return '-';
    const mesNum = parseInt(mesRef);
    return mesesAbreviados[mesNum] || mesRef;
  };

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

  // Função para consolidar itens por produto
  const itensConsolidados = useMemo(() => {
    if (!necessidade || !necessidade.itens) return [];
    
    const consolidado = new Map();
    
    necessidade.itens.forEach(item => {
      // Chave única: produto_id (ou produto_nome se não houver ID)
      const chave = item.produto_id || item.produto_nome || 'sem_produto';
      
      if (!consolidado.has(chave)) {
        consolidado.set(chave, {
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          produto_codigo: item.produto_codigo,
          quantidade_total: parseFloat(item.quantidade || 0),
          percapta_total: parseFloat(item.percapta || 0),
          media_efetivos_total: parseFloat(item.media_efetivos || 0),
          total_itens: 1,
          itens: [item]
        });
      } else {
        const itemConsolidado = consolidado.get(chave);
        itemConsolidado.quantidade_total += parseFloat(item.quantidade || 0);
        itemConsolidado.percapta_total += parseFloat(item.percapta || 0);
        itemConsolidado.media_efetivos_total += parseFloat(item.media_efetivos || 0);
        itemConsolidado.total_itens += 1;
        itemConsolidado.itens.push(item);
      }
    });

    return Array.from(consolidado.values());
  }, [necessidade?.itens]);

  // Calcular dados paginados baseado no modo
  const dadosPaginados = useMemo(() => {
    if (!necessidade || !necessidade.itens) return [];
    const dados = modoVisualizacao === 'consolidado' ? itensConsolidados : necessidade.itens;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return dados.slice(start, end);
  }, [modoVisualizacao === 'consolidado' ? itensConsolidados : necessidade?.itens, currentPage, itemsPerPage, modoVisualizacao]);

  const totalItems = modoVisualizacao === 'consolidado' 
    ? (itensConsolidados?.length || 0) 
    : (necessidade?.itens?.length || 0);

  const handleToggleExpand = (chave) => {
    setExpandedRows(prev => ({
      ...prev,
      [chave]: !prev[chave]
    }));
  };

  // Se não houver necessidade, não renderizar nada
  if (!necessidade) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" hideCloseButton={true}>
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detalhes da Necessidade</h2>
            <p className="text-sm text-gray-600">{necessidade.codigo}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="ml-3 text-gray-600">Carregando...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informações gerais */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Código:</span>
                    <p className="text-sm text-gray-900">{necessidade.codigo || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Nome do Cardápio:</span>
                    <p className="text-sm text-gray-900">{necessidade.cardapio_nome || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mês Ref:</span>
                    <p className="text-sm text-gray-900">{formatarMesRef(necessidade.mes_ref)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Ano:</span>
                    <p className="text-sm text-gray-900">{necessidade.ano || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Filial:</span>
                    <p className="text-sm text-gray-900">{necessidade.filial_nome || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Centro de Custo:</span>
                    <p className="text-sm text-gray-900">{necessidade.centro_custo_nome || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Contrato:</span>
                    <p className="text-sm text-gray-900">{necessidade.contrato_nome || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Tipo de Cardápio:</span>
                    <p className="text-sm text-gray-900">
                      {necessidade.itens && necessidade.itens.length > 0 && necessidade.itens[0].tipo_de_cardapio
                        ? necessidade.itens[0].tipo_de_cardapio
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Total de Cozinhas:</span>
                    <p className="text-sm text-gray-900">{necessidade.total_cozinhas || 0}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Total de Itens:</span>
                    <p className="text-sm text-gray-900">{necessidade.total_itens || 0}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      necessidade.status === 'gerada'
                        ? 'bg-green-100 text-green-800'
                        : necessidade.status === 'pendente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {necessidade.status || '-'}
                    </span>
                  </div>
                  {necessidade.usuario_gerador_nome && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Gerado por:</span>
                      <p className="text-sm text-gray-900">{necessidade.usuario_gerador_nome}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Criado em:</span>
                    <p className="text-sm text-gray-900">{formatarData(necessidade.criado_em)}</p>
                  </div>
                </div>
              </div>

              {/* Itens da necessidade */}
              {necessidade.itens && necessidade.itens.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Itens da Necessidade</h3>
                    
                    {/* Botão de alternância de modo */}
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

                  <div className="overflow-x-auto border rounded-lg">
                    {modoVisualizacao === 'consolidado' ? (
                      // Tabela Consolidada
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th style={{ width: '50px' }} className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"></th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Produto
                            </th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Percapta Total
                            </th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Média/Efetivos Total
                            </th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Quantidade Total
                            </th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Total Itens
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dadosPaginados.map((consolidado) => {
                            const chave = consolidado.produto_id || consolidado.produto_nome || 'sem_produto';
                            
                            return (
                              <React.Fragment key={chave}>
                                {/* Linha Consolidada */}
                                <tr className="hover:bg-gray-50">
                                  <td className="px-2 py-2 whitespace-nowrap text-center">
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
                                  <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                    <span className="font-semibold text-cyan-600">
                                      {consolidado.produto_nome || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-center font-semibold">
                                    {formatarQuantidade(consolidado.percapta_total)}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-center font-semibold">
                                    {formatarQuantidade(consolidado.media_efetivos_total)}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-center font-semibold">
                                    {formatarQuantidade(consolidado.quantidade_total)}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-center">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                      {consolidado.total_itens}
                                    </span>
                                  </td>
                                </tr>

                                {/* Linha Expandida (Detalhes dos Itens) */}
                                {expandedRows[chave] && (
                                  <tr className="bg-gray-50">
                                    <td colSpan="6" className="px-4 py-4">
                                      <div className="bg-gray-50 border-l-4 border-green-600 p-4">
                                        <h4 className="text-md font-semibold text-green-700 mb-4 flex items-center gap-2">
                                          <span className="text-xl">📦</span>
                                          Detalhes - {consolidado.produto_nome}
                                        </h4>
                                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                                          <thead>
                                            <tr className="bg-gray-100">
                                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Nome do Cardápio</th>
                                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Mês Ref</th>
                                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Ano</th>
                                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Cozinha Industrial</th>
                                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Período</th>
                                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Data Consumo</th>
                                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Prato</th>
                                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produto</th>
                                              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase">Percapta</th>
                                              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase">Média/Efetivos</th>
                                              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quantidade</th>
                                              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ordem</th>
                                            </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                            {consolidado.itens.map((item, index) => (
                                              <tr key={`${chave}-${index}`} className="hover:bg-gray-50">
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                                  {item.nome_docardapio || necessidade.cardapio_nome}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                                  {formatarMesRef(item.mes_ref || necessidade.mes_ref)}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                                  {item.ano || necessidade.ano}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                                  {item.cozinha_industrial_nome}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                                  {item.periodo_nome}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                                  {item.data_consumo ? new Date(item.data_consumo).toLocaleDateString('pt-BR') : '-'}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                                  {item.prato_nome}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                                  {item.produto_nome}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-center">
                                                  {item.percapta ? parseFloat(item.percapta).toFixed(6) : '0.000000'}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-center">
                                                  {item.media_efetivos || 0}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-center">
                                                  {item.quantidade ? parseFloat(item.quantidade).toFixed(3) : '0.000'}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-gray-900 text-center">
                                                  {item.ordem || 0}
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
                    ) : (
                      // Tabela Individual
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Nome do Cardápio
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Mês Ref
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Ano
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Filial
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Centro de Custo
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Contrato
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Tipo de Cardápio
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Cozinha Industrial
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Período
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Data Consumo
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Prato
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Produto
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Percapta
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Média/Efetivos
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Quantidade
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                              Ordem
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dadosPaginados.map((item, index) => (
                            <tr key={`item-${index}`} className="hover:bg-gray-50">
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.nome_docardapio || necessidade.cardapio_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {formatarMesRef(item.mes_ref || necessidade.mes_ref)}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.ano || necessidade.ano}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.filial_nome || necessidade.filial_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.centro_custo_nome || necessidade.centro_custo_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.contrato_nome || necessidade.contrato_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.tipo_de_cardapio || '-'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.cozinha_industrial_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.periodo_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.data_consumo ? new Date(item.data_consumo).toLocaleDateString('pt-BR') : '-'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.prato_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.produto_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.percapta ? parseFloat(item.percapta).toFixed(6) : '0.000000'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.media_efetivos || 0}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.quantidade ? parseFloat(item.quantidade).toFixed(3) : '0.000'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.ordem || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Paginação */}
                  {totalItems > itemsPerPage && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalItems / itemsPerPage)}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Nenhum item encontrado para esta necessidade.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NecessidadeDetalhesModal;
