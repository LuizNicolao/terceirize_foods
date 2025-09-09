import { useState, useEffect, useCallback } from 'react';
import GruposService from '../../services/grupos';
import PeriodicidadeService from '../../services/periodicidade';

export const useGruposProdutos = (produtosIndividuais, onProdutosIndividuaisChange) => {
  // Estados para Grupos e Produtos
  const [gruposProdutos, setGruposProdutos] = useState([]);
  const [produtosPorGrupo, setProdutosPorGrupo] = useState({});
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState({});
  
  // Estados para seleção
  const [gruposCompletos, setGruposCompletos] = useState([]);
  const [produtosIndividuaisLocal, setProdutosIndividuaisLocal] = useState(produtosIndividuais);
  
  // Estados para interface
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [buscaGlobal, setBuscaGlobal] = useState('');

  // Carregar grupos de produtos
  const carregarGruposProdutos = useCallback(async () => {
    try {
      setLoadingGrupos(true);
      const result = await GruposService.buscarAtivos();
      if (result.success) {
        setGruposProdutos(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos de produtos:', error);
      setGruposProdutos([]);
    } finally {
      setLoadingGrupos(false);
    }
  }, []);

  // Carregar produtos de um grupo específico
  const carregarProdutosGrupo = useCallback(async (grupoId) => {
    try {
      setLoadingProdutos(prev => ({ ...prev, [grupoId]: true }));
      const result = await PeriodicidadeService.buscarProdutosPorGrupo(grupoId);
      if (result.success) {
        setProdutosPorGrupo(prev => ({
          ...prev,
          [grupoId]: result.data || []
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar produtos do grupo:', error);
      setProdutosPorGrupo(prev => ({
        ...prev,
        [grupoId]: []
      }));
    } finally {
      setLoadingProdutos(prev => ({ ...prev, [grupoId]: false }));
    }
  }, []);

  // Função para selecionar grupo completo
  const handleGrupoCompletoChange = useCallback((grupoId, checked) => {
    if (checked) {
      setGruposCompletos(prev => [...prev, grupoId]);
    } else {
      setGruposCompletos(prev => prev.filter(id => id !== grupoId));
    }
  }, []);

  // Função para selecionar produto individual
  const handleProdutoIndividualChange = useCallback((produtoId, grupoId, checked) => {
    if (checked) {
      const novosProdutos = [...produtosIndividuaisLocal, produtoId];
      setProdutosIndividuaisLocal(novosProdutos);
      onProdutosIndividuaisChange && onProdutosIndividuaisChange(novosProdutos);
    } else {
      const novosProdutos = produtosIndividuaisLocal.filter(id => id !== produtoId);
      setProdutosIndividuaisLocal(novosProdutos);
      onProdutosIndividuaisChange && onProdutosIndividuaisChange(novosProdutos);
    }
  }, [produtosIndividuaisLocal, onProdutosIndividuaisChange]);

  // Calcular total de produtos finais
  const calcularTotalProdutosFinais = useCallback(() => {
    let total = 0;
    
    // Adicionar produtos de grupos completos
    gruposCompletos.forEach(grupoId => {
      const produtosGrupo = produtosPorGrupo[grupoId] || [];
      total += produtosGrupo.length;
    });
    
    // Adicionar produtos individuais (apenas os que não estão em grupos completos)
    produtosIndividuaisLocal.forEach(produtoId => {
      const produto = Object.values(produtosPorGrupo)
        .flat()
        .find(p => p.id === produtoId);
      
      if (produto && !gruposCompletos.includes(produto.grupo_id)) {
        total += 1;
      }
    });
    
    return total;
  }, [gruposCompletos, produtosPorGrupo, produtosIndividuaisLocal]);

  // Verificar se produto está em grupo completo
  const isProdutoEmGrupoCompleto = useCallback((produtoId) => {
    const produto = Object.values(produtosPorGrupo)
      .flat()
      .find(p => p.id === produtoId);
    
    return produto && gruposCompletos.includes(produto.grupo_id);
  }, [produtosPorGrupo, gruposCompletos]);

  // Funções para interface
  const contarProdutosSelecionadosNoGrupo = useCallback((grupoId) => {
    if (!produtosPorGrupo[grupoId]) return 0;
    return produtosPorGrupo[grupoId].filter(produto => 
      produtosIndividuaisLocal.includes(produto.id)
    ).length;
  }, [produtosPorGrupo, produtosIndividuaisLocal]);

  const isGrupoCompleto = useCallback((grupoId) => {
    return gruposCompletos.includes(grupoId);
  }, [gruposCompletos]);

  const isGrupoParcial = useCallback((grupoId) => {
    const totalProdutos = produtosPorGrupo[grupoId]?.length || 0;
    const produtosSelecionados = contarProdutosSelecionadosNoGrupo(grupoId);
    return produtosSelecionados > 0 && produtosSelecionados < totalProdutos;
  }, [produtosPorGrupo, contarProdutosSelecionadosNoGrupo]);

  const filtrarGrupos = useCallback(() => {
    let gruposFiltrados = gruposProdutos;
    
    if (buscaGlobal.trim()) {
      const termo = buscaGlobal.toLowerCase();
      gruposFiltrados = gruposFiltrados.filter(grupo => 
        grupo.nome.toLowerCase().includes(termo)
      );
    }
    
    if (filtroTipo === 'grupos') {
      gruposFiltrados = gruposFiltrados.filter(grupo => 
        isGrupoCompleto(grupo.id)
      );
    } else if (filtroTipo === 'produtos') {
      gruposFiltrados = gruposFiltrados.filter(grupo => 
        contarProdutosSelecionadosNoGrupo(grupo.id) > 0
      );
    }
    
    return gruposFiltrados;
  }, [gruposProdutos, buscaGlobal, filtroTipo, isGrupoCompleto, contarProdutosSelecionadosNoGrupo]);

  const selecionarTodosGrupos = useCallback(() => {
    const todosGrupos = gruposProdutos.map(grupo => grupo.id);
    setGruposCompletos(todosGrupos);
    setProdutosIndividuaisLocal([]);
  }, [gruposProdutos]);

  const limparTudo = useCallback(() => {
    setGruposCompletos([]);
    setProdutosIndividuaisLocal([]);
  }, []);

  const selecionarTodosProdutos = useCallback(() => {
    if (!grupoSelecionado) return;
    
    const produtosGrupo = produtosPorGrupo[grupoSelecionado.id] || [];
    const produtosIds = produtosGrupo.map(p => p.id);
    
    // Adicionar apenas produtos que não estão em grupos completos
    const novosProdutos = [...produtosIndividuaisLocal];
    produtosIds.forEach(id => {
      if (!novosProdutos.includes(id) && !isProdutoEmGrupoCompleto(id)) {
        novosProdutos.push(id);
      }
    });
    
    setProdutosIndividuaisLocal(novosProdutos);
    onProdutosIndividuaisChange && onProdutosIndividuaisChange(novosProdutos);
  }, [grupoSelecionado, produtosPorGrupo, produtosIndividuaisLocal, isProdutoEmGrupoCompleto, onProdutosIndividuaisChange]);

  const limparProdutosGrupo = useCallback(() => {
    if (!grupoSelecionado) return;
    
    const produtosGrupo = produtosPorGrupo[grupoSelecionado.id] || [];
    const produtosIds = produtosGrupo.map(p => p.id);
    
    const novosProdutos = produtosIndividuaisLocal.filter(id => !produtosIds.includes(id));
    setProdutosIndividuaisLocal(novosProdutos);
    onProdutosIndividuaisChange && onProdutosIndividuaisChange(novosProdutos);
  }, [grupoSelecionado, produtosPorGrupo, produtosIndividuaisLocal, onProdutosIndividuaisChange]);

  // Sincronizar produtos individuais com as props
  useEffect(() => {
    setProdutosIndividuaisLocal(produtosIndividuais);
    
    // Se há produtos selecionados, precisamos carregar os produtos dos grupos
    if (produtosIndividuais.length > 0 && gruposProdutos.length > 0) {
      gruposProdutos.forEach(grupo => {
        if (!produtosPorGrupo[grupo.id] && !loadingProdutos[grupo.id]) {
          carregarProdutosGrupo(grupo.id);
        }
      });
    }
  }, [produtosIndividuais, gruposProdutos, produtosPorGrupo, loadingProdutos, carregarProdutosGrupo]);

  // Carregar dados quando o componente montar
  useEffect(() => {
    carregarGruposProdutos();
  }, [carregarGruposProdutos]);

  return {
    // Estados
    gruposProdutos,
    produtosPorGrupo,
    loadingGrupos,
    loadingProdutos,
    gruposCompletos,
    produtosIndividuaisLocal,
    grupoSelecionado,
    filtroTipo,
    buscaGlobal,
    
    // Ações
    carregarProdutosGrupo,
    handleGrupoCompletoChange,
    handleProdutoIndividualChange,
    setGrupoSelecionado,
    setFiltroTipo,
    setBuscaGlobal,
    selecionarTodosGrupos,
    limparTudo,
    selecionarTodosProdutos,
    limparProdutosGrupo,
    
    // Funções utilitárias
    calcularTotalProdutosFinais,
    isProdutoEmGrupoCompleto,
    contarProdutosSelecionadosNoGrupo,
    isGrupoCompleto,
    isGrupoParcial,
    filtrarGrupos
  };
};
