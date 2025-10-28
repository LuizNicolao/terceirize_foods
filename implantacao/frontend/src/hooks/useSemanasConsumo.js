import { useState, useEffect, useCallback } from 'react';
import calendarioService from '../services/calendarioService';

/**
 * Hook para gerenciar semanas de consumo do calendário
 */
export const useSemanasConsumo = (ano = new Date().getFullYear()) => {
  const [opcoes, setOpcoes] = useState([]);
  const [semanas, setSemanas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar semanas de consumo do calendário
  const carregarSemanasConsumo = useCallback(async (anoSelecionado) => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar endpoint específico para semanas de consumo
      const response = await calendarioService.buscarSemanasConsumo(anoSelecionado);
      
      if (response.success && response.data) {
        // response.data contém array de objetos com semana_consumo
        const semanasArray = response.data.map(item => item.semana_consumo).filter(semana => semana);

        // Criar opções para o selectbox
        const opcoesSelect = [
          { value: '', label: 'Selecione uma semana de consumo...' }
        ];

        semanasArray.forEach(semana => {
          opcoesSelect.push({
            value: semana,
            label: semana
          });
        });

        setOpcoes(opcoesSelect);
        setSemanas(semanasArray);
      } else {
        setError('Erro ao carregar semanas de consumo');
        setOpcoes([{ value: '', label: 'Selecione uma semana de consumo...' }]);
        setSemanas([]);
      }
    } catch (err) {
      console.error('Erro ao carregar semanas de consumo:', err);
      setError(err.message || 'Erro ao carregar semanas de consumo');
      setOpcoes([{ value: '', label: 'Selecione uma semana de consumo...' }]);
      setSemanas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar semanas quando o ano mudar
  useEffect(() => {
    carregarSemanasConsumo(ano);
  }, [ano, carregarSemanasConsumo]);

  /**
   * Obtém o valor padrão para o estado inicial
   */
  const obterValorPadrao = useCallback(() => {
    // Retornar a primeira semana disponível ou string vazia
    return semanas.length > 0 ? semanas[0] : '';
  }, [semanas]);

  /**
   * Recarrega as semanas de consumo
   */
  const recarregar = useCallback(() => {
    carregarSemanasConsumo(ano);
  }, [ano, carregarSemanasConsumo]);

  /**
   * Busca semana de consumo por semana de abastecimento
   */
  const buscarPorSemanaAbastecimento = useCallback(async (semanaAbastecimento) => {
    try {
      const response = await calendarioService.buscarSemanaPorAbastecimento(semanaAbastecimento, ano);
      if (response.success && response.data) {
        return response.data.semana_consumo;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar semana de consumo:', error);
      return null;
    }
  }, [ano]);

  return {
    opcoes,
    semanas,
    loading,
    error,
    recarregar,
    obterValorPadrao,
    buscarPorSemanaAbastecimento
  };
};
