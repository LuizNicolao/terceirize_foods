import { useState, useEffect, useMemo } from 'react';

export const useHistoricoPatrimonio = (movimentacoes = []) => {
  const [filtrosHistorico, setFiltrosHistorico] = useState({
    dataInicio: '',
    dataFim: '',
    motivo: 'todos',
    responsavel: '',
    local: ''
  });
  
  const [paginaHistorico, setPaginaHistorico] = useState(1);
  const [itensPorPagina] = useState(10);

  // Filtrar movimentações baseado nos filtros
  const movimentacoesFiltradas = useMemo(() => {
    if (!Array.isArray(movimentacoes)) return [];
    
    return movimentacoes.filter(mov => {
      // Filtro por data
      if (filtrosHistorico.dataInicio) {
        const dataMov = new Date(mov.data_movimentacao);
        const dataInicio = new Date(filtrosHistorico.dataInicio);
        if (dataMov < dataInicio) return false;
      }
      
      if (filtrosHistorico.dataFim) {
        const dataMov = new Date(mov.data_movimentacao);
        const dataFim = new Date(filtrosHistorico.dataFim);
        if (dataMov > dataFim) return false;
      }
      
      // Filtro por motivo
      if (filtrosHistorico.motivo !== 'todos' && mov.motivo !== filtrosHistorico.motivo) {
        return false;
      }
      
      // Filtro por responsável
      if (filtrosHistorico.responsavel && 
          !mov.responsavel_nome?.toLowerCase().includes(filtrosHistorico.responsavel.toLowerCase())) {
        return false;
      }
      
      // Filtro por local (origem ou destino)
      if (filtrosHistorico.local && 
          !mov.local_origem_nome?.toLowerCase().includes(filtrosHistorico.local.toLowerCase()) &&
          !mov.local_destino_nome?.toLowerCase().includes(filtrosHistorico.local.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [movimentacoes, filtrosHistorico]);

  // Calcular movimentações paginadas
  const movimentacoesPaginadas = useMemo(() => {
    const inicio = (paginaHistorico - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return movimentacoesFiltradas.slice(inicio, fim);
  }, [movimentacoesFiltradas, paginaHistorico, itensPorPagina]);

  // Calcular total de páginas
  const totalPaginas = Math.ceil(movimentacoesFiltradas.length / itensPorPagina);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPaginaHistorico(1);
  }, [filtrosHistorico]);

  // Função para limpar filtros
  const limparFiltros = () => {
    setFiltrosHistorico({
      dataInicio: '',
      dataFim: '',
      motivo: 'todos',
      responsavel: '',
      local: ''
    });
  };

  return {
    filtrosHistorico,
    setFiltrosHistorico,
    paginaHistorico,
    setPaginaHistorico,
    itensPorPagina,
    movimentacoesFiltradas,
    movimentacoesPaginadas,
    totalPaginas,
    limparFiltros
  };
};
