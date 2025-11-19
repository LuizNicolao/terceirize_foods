import { useMemo, useState } from 'react';
import { consolidarNecessidades } from '../utils/consolidarNecessidades';

/**
 * Hook para gerenciar filtragem, consolidação e paginação de necessidades
 */
export const useStatusNecessidadesData = (
  necessidades,
  modoVisualizacao,
  busca,
  sortConfig,
  page,
  itemsPerPage,
  isProcessadas = false
) => {
  // Filtrar e ordenar necessidades
  const necessidadesFiltradas = useMemo(() => {
    // Aplicar consolidação primeiro se necessário
    let dadosParaFiltrar = modoVisualizacao === 'consolidado'
      ? consolidarNecessidades(necessidades, isProcessadas)
      : necessidades;
    
    // Depois aplicar busca local
    let filtered = dadosParaFiltrar.filter(n => {
      const searchTerm = busca.toLowerCase();
      const matches = (
        n.escola_nome?.toLowerCase().includes(searchTerm) ||
        n.nutricionista_nome?.toLowerCase().includes(searchTerm) ||
        n.usuario_email?.toLowerCase().includes(searchTerm) ||
        n.produto?.toLowerCase().includes(searchTerm) ||
        n.produto_generico_nome?.toLowerCase().includes(searchTerm) ||
        n.grupo?.toLowerCase().includes(searchTerm) ||
        n.status?.toLowerCase().includes(searchTerm) ||
        n.status_substituicao?.toLowerCase().includes(searchTerm) ||
        (modoVisualizacao === 'consolidado' && (
          n.total_escolas?.toString().includes(searchTerm) ||
          n.total_necessidades?.toString().includes(searchTerm) ||
          n.quantidade_total?.toString().includes(searchTerm)
        ))
      );
      return matches;
    });

    // Aplicar ordenação
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Tratar campos consolidados
        if (sortConfig.key === 'quantidade' && modoVisualizacao === 'consolidado') {
          aVal = a.quantidade_total || 0;
          bVal = b.quantidade_total || 0;
        }
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal?.toLowerCase() || '';
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [necessidades, busca, sortConfig, modoVisualizacao, isProcessadas]);

  // Paginar necessidades
  const necessidadesPaginadas = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return necessidadesFiltradas.slice(start, end);
  }, [necessidadesFiltradas, page, itemsPerPage]);

  return {
    necessidadesFiltradas,
    necessidadesPaginadas
  };
};

