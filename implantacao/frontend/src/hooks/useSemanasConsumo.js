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
      
      console.log('DEBUG: Response semanas consumo:', response);

      if (response.success && response.data) {
        // response.data contém array de objetos com semana_consumo
        const semanasArray = response.data.map(item => item.semana_consumo).filter(semana => semana);
        
        console.log('DEBUG: Semanas extraídas:', semanasArray);

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

        console.log('DEBUG: Opções finais:', opcoesSelect);

        setOpcoes(opcoesSelect);
        setSemanas(semanasArray);
      } else {
        console.log('DEBUG: Erro na resposta ou dados vazios');
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
