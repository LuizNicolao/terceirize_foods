import { useState, useEffect, useMemo } from 'react';

/**
 * Hook para gerenciar estados da tabela de Coordenação
 */
const useCoordenacaoTableState = (necessidades) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedProdutosGenericos, setSelectedProdutosGenericos] = useState({});
  const [quantidadesGenericos, setQuantidadesGenericos] = useState({});
  const [undGenericos, setUndGenericos] = useState({});
  const [produtosPadraoSelecionados, setProdutosPadraoSelecionados] = useState({});
  const [selectedProdutosPorEscola, setSelectedProdutosPorEscola] = useState({});
  const [selectedProdutosOrigem, setSelectedProdutosOrigem] = useState({});
  const [selectedProdutosOrigemPorEscola, setSelectedProdutosOrigemPorEscola] = useState({});
  const [trocaLoading, setTrocaLoading] = useState({});
  const [origemInicialPorEscola, setOrigemInicialPorEscola] = useState({});
  
  // Paginação
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const getChaveUnica = (necessidade) => 
    `${necessidade.codigo_origem}_${necessidade.produto_generico_id || 'novo'}`;

  // Calcular dados paginados
  const necessidadesPaginadas = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return necessidades.slice(start, end);
  }, [necessidades, page, itemsPerPage]);
  
  // Resetar para página 1 quando necessidades mudarem
  useEffect(() => {
    setPage(1);
  }, [necessidades.length]);

  // Inicializar estados quando necessidades mudarem
  useEffect(() => {
    const valoresIniciais = {};
    const genericosIniciais = {};
    const unidadesIniciais = {};
    const quantidadesIniciais = {};
    const mapaProdutosPadrao = {};
    const origemEscolasIniciais = {};

    necessidades.forEach((necessidade) => {
      const chaveUnica = getChaveUnica(necessidade);
      const unidade = necessidade.produto_origem_unidade || '';
      valoresIniciais[chaveUnica] = `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${unidade}`;
      mapaProdutosPadrao[chaveUnica] = false;
      const valorOrigem = `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${unidade}`;
      
      necessidade.escolas.forEach(escola => {
        const chaveEscola = `${chaveUnica}-${escola.escola_id}`;
        origemEscolasIniciais[chaveEscola] = valorOrigem;
      });

      if (necessidade.produto_generico_id) {
        const valorGenerico = `${necessidade.produto_generico_id}|${necessidade.produto_generico_nome}|${necessidade.produto_generico_unidade || ''}|1`;
        genericosIniciais[chaveUnica] = valorGenerico;
        unidadesIniciais[chaveUnica] = necessidade.produto_generico_unidade || '';
        quantidadesIniciais[chaveUnica] = necessidade.quantidade_total_origem || '';
      }
    });

    setSelectedProdutosOrigem(valoresIniciais);
    setSelectedProdutosGenericos(genericosIniciais);
    setUndGenericos(unidadesIniciais);
    setQuantidadesGenericos(quantidadesIniciais);
    setProdutosPadraoSelecionados(mapaProdutosPadrao);
    setSelectedProdutosOrigemPorEscola(origemEscolasIniciais);
    setOrigemInicialPorEscola(origemEscolasIniciais);
  }, [necessidades]);

  return {
    expandedRows,
    setExpandedRows,
    selectedProdutosGenericos,
    setSelectedProdutosGenericos,
    quantidadesGenericos,
    setQuantidadesGenericos,
    undGenericos,
    setUndGenericos,
    produtosPadraoSelecionados,
    setProdutosPadraoSelecionados,
    selectedProdutosPorEscola,
    setSelectedProdutosPorEscola,
    selectedProdutosOrigem,
    setSelectedProdutosOrigem,
    selectedProdutosOrigemPorEscola,
    setSelectedProdutosOrigemPorEscola,
    trocaLoading,
    setTrocaLoading,
    origemInicialPorEscola,
    setOrigemInicialPorEscola,
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    necessidadesPaginadas,
    getChaveUnica
  };
};

export default useCoordenacaoTableState;

