import { useState, useEffect, useMemo } from 'react';

const useSubstituicoesTableState = (necessidades) => {
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
  const [quantidadesOrigemEditadas, setQuantidadesOrigemEditadas] = useState({});
  
  // Estados para modais de confirmação
  const [showDeleteIndividualModal, setShowDeleteIndividualModal] = useState(false);
  const [substituicaoToDelete, setSubstituicaoToDelete] = useState(null);
  const [showDeleteConsolidatedModal, setShowDeleteConsolidatedModal] = useState(false);
  const [necessidadeToDelete, setNecessidadeToDelete] = useState(null);
  
  // Paginação
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const getChaveOrigem = (necessidade) => 
    `${necessidade.codigo_origem}_${necessidade.semana_abastecimento}_${necessidade.semana_consumo}`;

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
      const chaveOrigem = getChaveOrigem(necessidade);
      const unidade = necessidade.produto_origem_unidade || '';
      valoresIniciais[chaveOrigem] = `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${unidade}`;
      mapaProdutosPadrao[chaveOrigem] = false;
      const valorOrigem = `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${unidade}`;
      
      necessidade.escolas.forEach(escola => {
        const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
        origemEscolasIniciais[chaveEscola] = valorOrigem;
      });

      if (necessidade.produto_generico_id) {
        const valorGenerico = `${necessidade.produto_generico_id}|${necessidade.produto_generico_nome}|${necessidade.produto_generico_unidade || ''}|1`;
        genericosIniciais[chaveOrigem] = valorGenerico;
        unidadesIniciais[chaveOrigem] = necessidade.produto_generico_unidade || '';
        quantidadesIniciais[chaveOrigem] = necessidade.quantidade_total_origem || '';
      }
    });

    setSelectedProdutosOrigem(valoresIniciais);
    setSelectedProdutosGenericos(genericosIniciais);
    setUndGenericos(unidadesIniciais);
    setQuantidadesGenericos(quantidadesIniciais);
    setProdutosPadraoSelecionados(mapaProdutosPadrao);
    setSelectedProdutosOrigemPorEscola(origemEscolasIniciais);
    setOrigemInicialPorEscola(origemEscolasIniciais);
    
    // Preservar quantidades editadas existentes, mas priorizar valores da substituição se ela voltar
    setQuantidadesOrigemEditadas(prev => {
      const atualizadas = { ...prev };
      necessidades.forEach((necessidade) => {
        const chaveOrigem = getChaveOrigem(necessidade);
        necessidade.escolas.forEach(escola => {
          const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
          if (escola.substituicao && escola.substituicao.id) {
            if (escola.substituicao.quantidade_origem !== undefined && escola.substituicao.quantidade_origem !== null) {
              atualizadas[chaveEscola] = parseFloat(escola.substituicao.quantidade_origem).toFixed(3).replace('.', ',');
            }
          } else if (prev[chaveEscola] !== undefined) {
            atualizadas[chaveEscola] = prev[chaveEscola];
          }
        });
      });
      return atualizadas;
    });
  }, [necessidades]);

  const handleToggleExpand = (chaveOrigem) => {
    setExpandedRows(prev => ({
      ...prev,
      [chaveOrigem]: !prev[chaveOrigem]
    }));
  };

  return {
    // Estados
    expandedRows,
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
    quantidadesOrigemEditadas,
    setQuantidadesOrigemEditadas,
    
    // Modais
    showDeleteIndividualModal,
    setShowDeleteIndividualModal,
    substituicaoToDelete,
    setSubstituicaoToDelete,
    showDeleteConsolidatedModal,
    setShowDeleteConsolidatedModal,
    necessidadeToDelete,
    setNecessidadeToDelete,
    
    // Paginação
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    necessidadesPaginadas,
    
    // Funções utilitárias
    getChaveOrigem,
    handleToggleExpand
  };
};

export default useSubstituicoesTableState;

