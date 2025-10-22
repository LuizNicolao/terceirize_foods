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
      // Buscar dados do calendário para o ano
      const response = await calendarioService.listar({
        ano: anoSelecionado,
        limit: 1000 // Buscar todos os registros
      });

      if (response.success && response.data) {
        // Extrair semanas de consumo únicas
        const semanasConsumo = new Set();
        
        response.data.forEach(dia => {
          if (dia.semana_consumo && dia.semana_consumo.trim() !== '') {
            semanasConsumo.add(dia.semana_consumo);
          }
        });

        // Converter para array e ordenar
        const semanasArray = Array.from(semanasConsumo).sort((a, b) => {
          // Ordenar por data de início da semana
          const [diaA, mesA] = a.split(' a ')[0].split('/');
          const [diaB, mesB] = b.split(' a ')[0].split('/');
          
          const dataA = new Date(anoSelecionado, parseInt(mesA) - 1, parseInt(diaA));
          const dataB = new Date(anoSelecionado, parseInt(mesB) - 1, parseInt(diaB));
          
          return dataA - dataB;
        });

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

  return {
    opcoes,
    semanas,
    loading,
    error,
    recarregar,
    obterValorPadrao
  };
};
