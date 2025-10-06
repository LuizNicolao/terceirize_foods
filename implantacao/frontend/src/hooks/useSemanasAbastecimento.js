import { useState, useEffect, useCallback } from 'react';
import { 
  gerarOpcoesSemanas, 
  encontrarSemanaAtual, 
  filtrarPorSemana,
  obterInfoSemana 
} from '../utils/semanasAbastecimentoUtils';

/**
 * Hook para gerenciar semanas de abastecimento
 */
export const useSemanasAbastecimento = (ano = new Date().getFullYear()) => {
  const [opcoes, setOpcoes] = useState([]);
  const [semanaAtual, setSemanaAtual] = useState(null);
  const [semanas, setSemanas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar semanas quando o ano mudar
  useEffect(() => {
    setLoading(true);
    try {
      const { opcoes: novasOpcoes, semanaAtual: novaSemanaAtual, semanas: novasSemanas } = 
        gerarOpcoesSemanas(ano);
      
      
      setOpcoes(novasOpcoes);
      setSemanaAtual(novaSemanaAtual);
      setSemanas(novasSemanas);
    } catch (error) {
      console.error('Erro ao carregar semanas de abastecimento:', error);
    } finally {
      setLoading(false);
    }
  }, [ano]);

  /**
   * Filtra dados por semana selecionada
   */
  const filtrarDados = useCallback((dados, semanaSelecionada, campoData = 'data_recebimento') => {
    return filtrarPorSemana(dados, semanaSelecionada, campoData);
  }, []);

  /**
   * Obtém informações de uma semana específica
   */
  const obterSemana = useCallback((semanaLabel) => {
    return obterInfoSemana(semanaLabel, ano);
  }, [ano]);

  /**
   * Verifica se uma semana é a semana atual
   */
  const isSemanaAtual = useCallback((semanaLabel) => {
    return semanaAtual && semanaAtual.label === semanaLabel;
  }, [semanaAtual]);

  /**
   * Obtém a semana padrão para seleção inicial
   */
  const obterSemanaPadrao = useCallback(() => {
    return semanaAtual ? semanaAtual.label : '';
  }, [semanaAtual]);

  /**
   * Obtém o valor padrão para o estado inicial
   */
  const obterValorPadrao = useCallback(() => {
    return semanaAtual ? semanaAtual.label : '';
  }, [semanaAtual]);

  return {
    opcoes,
    semanaAtual,
    semanas,
    loading,
    filtrarDados,
    obterSemana,
    isSemanaAtual,
    obterSemanaPadrao,
    obterValorPadrao
  };
};
