/**
 * Hook para gerenciar a lógica da aba de Listagem de Necessidades
 * Responsável por carregar necessidades sem excluir status CONF
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNecessidades, useNecessidadesFilters } from '../../../hooks/necessidades';

export const useNecessidadesListagem = () => {
  const {
    necessidades,
    escolas,
    grupos,
    loading,
    error,
    pagination,
    carregarNecessidades,
    gerarNecessidade,
    exportarXLSX,
    exportarPDF
  } = useNecessidades();

  const { filtros, updateFiltros, clearFiltros } = useNecessidadesFilters();

  // Refs para controle de carregamento
  const carregandoRef = useRef(false);
  const ultimaPaginaRef = useRef(pagination.currentPage);
  const ultimoItemsPerPageRef = useRef(pagination.itemsPerPage);
  const filtrosAnterioresPagRef = useRef(JSON.stringify(filtros));
  const carregadoInicialmenteRef = useRef(false);

  // Carregar necessidades na primeira vez (aba de listagem - SEM excluir CONF)
  useEffect(() => {
    if (!carregadoInicialmenteRef.current) {
      carregadoInicialmenteRef.current = true;
      carregandoRef.current = true;
      const filtrosListagem = {
        ...filtros,
        excluir_conf: false
      };
      carregarNecessidades(filtrosListagem).then(() => {
        carregandoRef.current = false;
      }).catch(() => {
        carregandoRef.current = false;
      });
    }
  }, []);

  // Carregar necessidades quando filtros mudarem (aba de listagem - SEM excluir CONF)
  useEffect(() => {
    if (!carregandoRef.current) {
      const filtrosAtuais = JSON.stringify(filtros);
      if (filtrosAtuais !== filtrosAnterioresPagRef.current) {
        filtrosAnterioresPagRef.current = filtrosAtuais;
        carregandoRef.current = true;
        // Aba de listagem NUNCA exclui CONF
        const filtrosListagem = {
          ...filtros,
          excluir_conf: false
        };
        carregarNecessidades(filtrosListagem).then(() => {
          carregandoRef.current = false;
        }).catch(() => {
          carregandoRef.current = false;
        });
      }
    }
  }, [carregarNecessidades, filtros]);

  // Carregar necessidades quando paginação mudar
  useEffect(() => {
    const paginaMudou = ultimaPaginaRef.current !== pagination.currentPage;
    const itemsPerPageMudou = ultimoItemsPerPageRef.current !== pagination.itemsPerPage;
    
    if ((paginaMudou || itemsPerPageMudou) && !carregandoRef.current) {
      ultimaPaginaRef.current = pagination.currentPage;
      ultimoItemsPerPageRef.current = pagination.itemsPerPage;
      carregandoRef.current = true;
      // Aba de listagem NUNCA exclui CONF
      const filtrosListagem = {
        ...filtros,
        excluir_conf: false
      };
      carregarNecessidades(filtrosListagem).then(() => {
        carregandoRef.current = false;
      }).catch(() => {
        carregandoRef.current = false;
      });
    }
  }, [pagination.currentPage, pagination.itemsPerPage, carregarNecessidades, filtros]);

  // Função para recarregar necessidades
  const recarregarNecessidades = useCallback(() => {
    const filtrosListagem = {
      ...filtros,
      excluir_conf: false
    };
    return carregarNecessidades(filtrosListagem);
  }, [carregarNecessidades, filtros]);

  return {
    necessidades,
    escolas,
    grupos,
    loading,
    error,
    pagination,
    filtros,
    updateFiltros,
    clearFiltros,
    gerarNecessidade,
    exportarXLSX,
    exportarPDF,
    recarregarNecessidades
  };
};
