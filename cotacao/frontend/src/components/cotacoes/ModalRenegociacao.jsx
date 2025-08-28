import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaSearch, 
  FaCheck, 
  FaTrash, 
  FaBox, 
  FaDollarSign, 
  FaTruck, 
  FaCreditCard, 
  FaFileAlt,
  FaChartPie,
  FaChartBar,
  FaTag,
  FaList,
  FaChevronDown,
  FaChevronUp,
  FaSync,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { AnaliseComparativaAprovacao, MelhorPrecoAprovacao } from '../../pages/aprovacoes/components/visualizacoes';

const ModalRenegociacao = ({ cotacao, onClose, onConfirm }) => {
  const [observacoes, setObservacoes] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [filtroFornecedor, setFiltroFornecedor] = useState('');
  const [filtroProduto, setFiltroProduto] = useState('');
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('padrao');

  // Extrair todos os produtos de todos os fornecedores
  const todosProdutos = cotacao?.fornecedores?.flatMap(fornecedor => 
    fornecedor.produtos?.map(produto => ({
      ...produto,
      fornecedor_nome: fornecedor.nome,
      fornecedor_id: fornecedor.id,
      difal: fornecedor.difal || 0,
      frete: fornecedor.frete || 0,
      prazo_pagamento: fornecedor.prazo_pagamento
    })) || []
  ) || [];

  // Filtrar produtos baseado nos filtros
  const produtosFiltrados = todosProdutos.filter(produto => {
    const matchFornecedor = !filtroFornecedor || 
      produto.fornecedor_nome.toLowerCase().includes(filtroFornecedor.toLowerCase());
    const matchProduto = !filtroProduto || 
      (produto.nome || produto.produto_nome || produto.descricao || '').toLowerCase().includes(filtroProduto.toLowerCase());
    return matchFornecedor && matchProduto;
  });

  // Agrupar produtos por fornecedor
  const produtosPorFornecedor = produtosFiltrados.reduce((acc, produto) => {
    if (!acc[produto.fornecedor_nome]) {
      acc[produto.fornecedor_nome] = [];
    }
    acc[produto.fornecedor_nome].push(produto);
    return acc;
  }, {});

  // Calcular estatísticas do resumo
  const calcularEstatisticas = () => {
    const produtosUnicos = [...new Set(todosProdutos.map(p => p.produto_id))];
    const fornecedoresUnicos = [...new Set(todosProdutos.map(p => p.fornecedor_nome))];
    const quantidadeTotal = todosProdutos.reduce((total, p) => total + (parseFloat(p.qtde) || 0), 0);
    const valorTotal = todosProdutos.reduce((total, p) => {
      const qtde = parseFloat(p.qtde) || 0;
      const valorUnit = parseFloat(p.valor_unitario) || 0;
      const difal = parseFloat(p.difal) || 0;
      const frete = parseFloat(p.frete) || 0;
      const valorComDifalEFrete = valorUnit + (valorUnit * difal / 100) + (frete / qtde);
      return total + (qtde * valorComDifalEFrete);
    }, 0);

    return {
      totalProdutos: produtosUnicos.length,
      totalFornecedores: fornecedoresUnicos.length,
      quantidadeTotal,
      valorTotal
    };
  };

  const estatisticas = calcularEstatisticas();

  const formatarValor = (valor) => {
    if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico === 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valorNumerico);
  };

  const isProdutoSelecionado = (produto) => {
    return produtosSelecionados.some(p => 
      p.produto_id === produto.produto_id && 
      p.fornecedor_id === produto.fornecedor_id
    );
  };

  const toggleProduto = (produto) => {
    setProdutosSelecionados(prev => {
      const isSelected = isProdutoSelecionado(produto);
      if (isSelected) {
        return prev.filter(p => 
          !(p.produto_id === produto.produto_id && p.fornecedor_id === produto.fornecedor_id)
        );
      } else {
        return [...prev, {
          produto_id: produto.produto_id,
          produto_nome: produto.nome,
          fornecedor_id: produto.fornecedor_id,
          fornecedor_nome: produto.fornecedor_nome
        }];
      }
    });
  };

  const selecionarTodosFornecedor = (fornecedorNome) => {
    const produtosFornecedor = produtosPorFornecedor[fornecedorNome];
    const todosSelecionados = produtosFornecedor.every(isProdutoSelecionado);
    
    if (todosSelecionados) {
      // Desmarcar todos
      setProdutosSelecionados(prev => 
        prev.filter(p => p.fornecedor_nome !== fornecedorNome)
      );
    } else {
      // Marcar todos
      const novosProdutos = produtosFornecedor.map(produto => ({
        produto_id: produto.produto_id,
        produto_nome: produto.nome,
        fornecedor_id: produto.fornecedor_id,
        fornecedor_nome: produto.fornecedor_nome
      }));
      setProdutosSelecionados(prev => {
        const semFornecedor = prev.filter(p => p.fornecedor_nome !== fornecedorNome);
        return [...semFornecedor, ...novosProdutos];
      });
    }
  };

  const selecionarTodosFiltrados = () => {
    const todosSelecionados = produtosFiltrados.every(isProdutoSelecionado);
    
    if (todosSelecionados) {
      // Desmarcar todos filtrados
      setProdutosSelecionados(prev => 
        prev.filter(p => !produtosFiltrados.some(fp => 
          fp.produto_id === p.produto_id && fp.fornecedor_id === p.fornecedor_id
        ))
      );
    } else {
      // Marcar todos filtrados
      const novosProdutos = produtosFiltrados.map(produto => ({
        produto_id: produto.produto_id,
        produto_nome: produto.nome,
        fornecedor_id: produto.fornecedor_id,
        fornecedor_nome: produto.fornecedor_nome
      }));
      setProdutosSelecionados(prev => {
        const semFiltrados = prev.filter(p => !produtosFiltrados.some(fp => 
          fp.produto_id === p.produto_id && fp.fornecedor_id === p.fornecedor_id
        ));
        return [...semFiltrados, ...novosProdutos];
      });
    }
  };

  const limparSelecao = () => {
    setProdutosSelecionados([]);
  };

  const handleConfirmar = async () => {
    if (!justificativa.trim()) {
      toast.error('Por favor, informe a justificativa para renegociação.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/cotacoes/${cotacao.id}/renegociar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: cotacao.id,
          status: 'renegociacao',
          produtos_renegociar: produtosSelecionados,
          observacoes: observacoes.trim(),
          justificativa: justificativa.trim()
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        const data = responseData.data;
        toast.success(responseData.message || 'Renegociação solicitada com sucesso!');
        onConfirm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao solicitar renegociação');
      }
    } catch (error) {
      console.error('Erro ao solicitar renegociação:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <FaSync size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Solicitar Renegociação</h3>
                <p className="text-gray-300 text-sm">Selecione os itens e informe a justificativa para renegociação</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors duration-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Informações da Cotação */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              Informações da Cotação
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded p-3 shadow-sm">
                <div className="text-gray-600 font-medium text-xs">ID</div>
                <div className="text-gray-900 font-semibold">{cotacao?.id}</div>
              </div>
              <div className="bg-white rounded p-3 shadow-sm">
                <div className="text-gray-600 font-medium text-xs">Comprador</div>
                <div className="text-gray-900 font-semibold">{cotacao?.usuario_nome}</div>
              </div>
              <div className="bg-white rounded p-3 shadow-sm">
                <div className="text-gray-600 font-medium text-xs">Data Criação</div>
                <div className="text-gray-900 font-semibold">
                  {cotacao?.data_criacao ? new Date(cotacao.data_criacao).toLocaleDateString('pt-BR') : 'N/A'}
                </div>
              </div>
              <div className="bg-white rounded p-3 shadow-sm">
                <div className="text-gray-600 font-medium text-xs">Status</div>
                <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                  cotacao?.status === 'aguardando_aprovacao' ? 'bg-blue-100 text-blue-800' :
                  cotacao?.status === 'renegociacao' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {cotacao?.status === 'aguardando_aprovacao' ? 'Aguardando Aprovação' :
                   cotacao?.status === 'renegociacao' ? 'Em Renegociação' :
                   cotacao?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Resumo do Orçamento */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="text-base font-semibold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <FaChartPie className="text-gray-600" />
              Resumo Orçamento Melhor Preço
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded p-4 text-center shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-800 mb-1">{estatisticas.totalProdutos}</div>
                <div className="text-xs text-gray-600 uppercase font-semibold">Produtos</div>
              </div>
              <div className="bg-white rounded p-4 text-center shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-800 mb-1">{estatisticas.totalFornecedores}</div>
                <div className="text-xs text-gray-600 uppercase font-semibold">Fornecedores</div>
              </div>
              <div className="bg-white rounded p-4 text-center shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-800 mb-1">{estatisticas.quantidadeTotal}</div>
                <div className="text-xs text-gray-600 uppercase font-semibold">Quantidade Total</div>
              </div>
              <div className="bg-white rounded p-4 text-center shadow-sm border border-gray-200">
                <div className="text-lg font-bold text-gray-800 mb-1">{formatarValor(estatisticas.valorTotal)}</div>
                <div className="text-xs text-gray-600 uppercase font-semibold">Valor Total</div>
              </div>
            </div>
          </div>

          {/* Botões de Visualização */}
          <div className="mb-6">
            <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              Modo de Visualização
            </h4>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setViewMode('padrao')}
                className={`relative cursor-pointer transition-all duration-200 ${
                  viewMode === 'padrao'
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                } border border-gray-200 rounded-lg p-4 min-w-[180px]`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    viewMode === 'padrao'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {viewMode === 'padrao' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                      <FaList className="text-gray-600" />
                      Visualização Padrão
                    </div>
                    <div className="text-xs text-gray-600">Seleção manual de itens</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setViewMode('resumo')}
                className={`relative cursor-pointer transition-all duration-200 ${
                  viewMode === 'resumo'
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                } border border-gray-200 rounded-lg p-4 min-w-[180px]`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    viewMode === 'resumo'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {viewMode === 'resumo' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                      <FaChartBar className="text-gray-600" />
                      Resumo Comparativo
                    </div>
                    <div className="text-xs text-gray-600">Análise comparativa</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setViewMode('melhor-preco')}
                className={`relative cursor-pointer transition-all duration-200 ${
                  viewMode === 'melhor-preco'
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                } border border-gray-200 rounded-lg p-4 min-w-[180px]`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    viewMode === 'melhor-preco'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {viewMode === 'melhor-preco' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                      <FaTag className="text-gray-600" />
                      Melhor Preço
                    </div>
                    <div className="text-xs text-gray-600">Itens com melhor valor</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Conteúdo das Visualizações */}
          {viewMode === 'padrao' && (
            <div className="mb-8">
              {/* Observações */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Observações (opcional)
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações técnicas sobre a cotação..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  rows={3}
                />
              </div>

              {/* Filtros */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Filtros de Busca
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaSearch className="text-gray-500" />
                      Buscar Fornecedor
                    </label>
                    <input
                      type="text"
                      value={filtroFornecedor}
                      onChange={(e) => setFiltroFornecedor(e.target.value)}
                      placeholder="Digite o nome do fornecedor..."
                      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaSearch className="text-gray-500" />
                      Buscar Produto
                    </label>
                    <input
                      type="text"
                      value={filtroProduto}
                      onChange={(e) => setFiltroProduto(e.target.value)}
                      placeholder="Digite o nome do produto..."
                      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Ações de Seleção
                </h4>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={selecionarTodosFiltrados}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-200 flex items-center gap-2 hover:bg-blue-700 hover:-translate-y-0.5 shadow-lg"
                  >
                    <FaCheck />
                    Selecionar Filtrados
                  </button>
                  <button
                    onClick={() => setProdutosSelecionados(todosProdutos.map(p => ({
                      produto_id: p.produto_id,
                      produto_nome: p.nome,
                      fornecedor_id: p.fornecedor_id,
                      fornecedor_nome: p.fornecedor_nome
                    })))}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-200 flex items-center gap-2 hover:bg-green-700 hover:-translate-y-0.5 shadow-lg"
                  >
                    <FaCheck />
                    Selecionar Todos
                  </button>
                  <button
                    onClick={limparSelecao}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-200 flex items-center gap-2 hover:bg-red-700 hover:-translate-y-0.5 shadow-lg"
                  >
                    <FaTrash />
                    Limpar Seleção
                  </button>
                </div>
              </div>

              {/* Contador */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-orange-600" />
                    <span className="text-sm font-semibold text-gray-800">
                      {produtosSelecionados.length} Produto(s) selecionado(s) para renegociação
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {produtosFiltrados.length} produtos disponíveis
                  </div>
                </div>
              </div>

              {/* Lista de produtos */}
              <div className="space-y-6">
                {Object.entries(produtosPorFornecedor).map(([fornecedorNome, produtos]) => (
                  <div key={fornecedorNome} className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                        <FaBox className="text-blue-600" />
                        {produtos.length} {fornecedorNome}
                      </h5>
                      <button
                        onClick={() => selecionarTodosFornecedor(fornecedorNome)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-200 flex items-center gap-2 hover:bg-blue-700 hover:-translate-y-0.5 shadow-lg"
                      >
                        <FaCheck />
                        Selecionar Todos
                      </button>
                    </div>

                    <div className="space-y-4">
                      {produtos.map((produto, index) => (
                        <div
                          key={`${produto.produto_id}-${produto.fornecedor_id}`}
                          className={`p-6 border-2 rounded-xl transition-all duration-200 cursor-pointer ${
                            isProdutoSelecionado(produto)
                              ? 'border-orange-500 bg-orange-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                          }`}
                          onClick={() => toggleProduto(produto)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mt-1 ${
                              isProdutoSelecionado(produto)
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                            }`}>
                              {isProdutoSelecionado(produto) && (
                                <FaCheck size={12} className="text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h6 className="font-semibold text-gray-800 mb-3 text-lg">
                                {produto.nome}
                              </h6>
                              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                                  <FaBox className="text-blue-500" />
                                  <div>
                                    <div className="text-gray-600 font-medium">Quantidade</div>
                                    <div className="font-semibold">{produto.qtde} {produto.unidade}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                                  <FaDollarSign className="text-green-500" />
                                  <div>
                                    <div className="text-gray-600 font-medium">Valor Unitário</div>
                                    <div className="font-semibold">{formatarValor(produto.valor_unitario)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                                  <FaDollarSign className="text-green-500" />
                                  <div>
                                    <div className="text-gray-600 font-medium">Valor Total</div>
                                    <div className="font-semibold">{formatarValor(produto.valor_unitario * produto.qtde)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                                  <FaTruck className="text-orange-500" />
                                  <div>
                                    <div className="text-gray-600 font-medium">Prazo Entrega</div>
                                    <div className="font-semibold">{produto.prazo_entrega || 'Não informado'}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                                  <FaCreditCard className="text-purple-500" />
                                  <div>
                                    <div className="text-gray-600 font-medium">Prazo Pagamento</div>
                                    <div className="font-semibold">{produto.prazo_pagamento || 'Não informado'}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                                  <FaFileAlt className="text-gray-500" />
                                  <div>
                                    <div className="text-gray-600 font-medium">Observações</div>
                                    <div className="font-semibold">{produto.observacoes || 'Nenhuma observação'}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'resumo' && (
            <div className="mb-8">
              <AnaliseComparativaAprovacao 
                cotacao={cotacao} 
                active={true} 
                formatarValor={formatarValor}
              />
            </div>
          )}

          {viewMode === 'melhor-preco' && (
            <div className="mb-8">
              <MelhorPrecoAprovacao 
                cotacao={cotacao}
                active={true} 
                formatarValor={formatarValor}
              />
            </div>
          )}

          {/* Justificativa */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Justificativa *
            </label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Informe o motivo da renegociação e as sugestões de ajustes..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              rows={4}
              required
            />
          </div>

                      {/* Botões de ação */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={loading || !justificativa.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-semibold shadow-sm hover:shadow-md transition-all duration-200 text-sm"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <FaSync />
                    Confirmar Renegociação
                  </>
                )}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ModalRenegociacao;
