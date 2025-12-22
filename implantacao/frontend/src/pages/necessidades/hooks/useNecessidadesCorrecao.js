/**
 * Hook para gerenciar a lógica da aba de Correção de Necessidades
 * Responsável por carregar necessidades SEMPRE excluindo status CONF
 * e mostrando apenas status NEC e NEC NUTRI
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNecessidades, useNecessidadesFilters } from '../../../hooks/necessidades';

export const useNecessidadesCorrecao = () => {
  const {
    necessidades,
    escolas,
    grupos,
    loading,
    error,
    pagination,
    carregarNecessidades,
    gerarNecessidade
  } = useNecessidades();

  const { filtros, updateFiltros, clearFiltros } = useNecessidadesFilters();

  // Refs para controle de carregamento
  const carregandoRef = useRef(false);
  const ultimaPaginaRef = useRef(pagination.currentPage);
  const ultimoItemsPerPageRef = useRef(pagination.itemsPerPage);
  const filtrosAnterioresPagRef = useRef(JSON.stringify(filtros));
  const carregadoInicialmenteRef = useRef(false);

  // Carregar necessidades na primeira vez (aba de correção - SEMPRE excluir CONF)
  useEffect(() => {
    if (!carregadoInicialmenteRef.current) {
      carregadoInicialmenteRef.current = true;
      carregandoRef.current = true;
      const filtrosCorrecao = {
        ...filtros,
        excluir_conf: true, // Forçar sempre excluir CONF
        apenas_nec_correcao: true // Mostrar apenas NEC e NEC NUTRI
      };
      carregarNecessidades(filtrosCorrecao).then(() => {
        carregandoRef.current = false;
      }).catch(() => {
        carregandoRef.current = false;
      });
    }
  }, []);

  // Carregar necessidades quando filtros mudarem (aba de correção - SEMPRE excluir CONF)
  useEffect(() => {
    if (!carregandoRef.current) {
      const filtrosAtuais = JSON.stringify(filtros);
      if (filtrosAtuais !== filtrosAnterioresPagRef.current) {
        filtrosAnterioresPagRef.current = filtrosAtuais;
        carregandoRef.current = true;
        // Aba de correção SEMPRE exclui CONF - forçar sempre
        const filtrosCorrecao = {
          ...filtros,
          excluir_conf: true, // Forçar sempre excluir CONF
          apenas_nec_correcao: true // Mostrar apenas NEC e NEC NUTRI
        };
        carregarNecessidades(filtrosCorrecao).then(() => {
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
      // Aba de correção SEMPRE exclui CONF - forçar sempre
      const filtrosCorrecao = {
        ...filtros,
        excluir_conf: true, // Forçar sempre excluir CONF
        apenas_nec_correcao: true // Mostrar apenas NEC e NEC NUTRI
      };
      carregarNecessidades(filtrosCorrecao).then(() => {
        carregandoRef.current = false;
      }).catch(() => {
        carregandoRef.current = false;
      });
    }
  }, [pagination.currentPage, pagination.itemsPerPage, carregarNecessidades, filtros]);

  // Função para recarregar necessidades - SEMPRE excluir CONF e mostrar apenas NEC/NEC NUTRI
  const recarregarNecessidades = useCallback(() => {
    const filtrosCorrecao = {
      ...filtros,
      excluir_conf: true, // Forçar sempre excluir CONF na aba de correção
      apenas_nec_correcao: true // Mostrar apenas NEC e NEC NUTRI
    };
    return carregarNecessidades(filtrosCorrecao);
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
    recarregarNecessidades
  };
};
