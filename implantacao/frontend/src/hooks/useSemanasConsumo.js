import { useState, useEffect, useCallback, useRef } from 'react';
import calendarioService from '../services/calendarioService';
import necessidadesService from '../services/necessidadesService';

/**
 * Hook para gerenciar semanas de consumo do calendário
 * @param {number} ano - Ano para buscar semanas (quando usarCalendario = true)
 * @param {boolean} usarCalendario - Se true, busca do calendário. Se false, busca da tabela necessidades
 * @param {object} filtros - Filtros opcionais (escola_id) quando usarCalendario = false
 * @param {number} mes - Mês opcional para filtrar semanas (quando usarCalendario = true)
 */
export const useSemanasConsumo = (ano = new Date().getFullYear(), usarCalendario = true, filtros = {}, mes = null) => {
  const [opcoes, setOpcoes] = useState([]);
  const [semanas, setSemanas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Usar ref para armazenar filtros e evitar loop infinito
  const filtrosRef = useRef(filtros);
  useEffect(() => {
    filtrosRef.current = filtros;
  }, [filtros]);

  // Carregar semanas de consumo
  const carregarSemanasConsumo = useCallback(async (anoSelecionado, usarCalend = usarCalendario, filtrosData = null, mesSelecionado = null) => {
    // Usar filtros do ref se não foram passados
    const filtrosParaUsar = filtrosData !== null ? filtrosData : filtrosRef.current;
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (usarCalend) {
        // Usar endpoint do calendário
        // Obter mês dos filtros, do parâmetro mesSelecionado ou do parâmetro mes do hook
        const mesParaBuscar = filtrosParaUsar?.mes || mesSelecionado || mes;
        response = await calendarioService.buscarSemanasConsumo(anoSelecionado || new Date().getFullYear(), mesParaBuscar);
      } else {
        // Usar endpoint da tabela necessidades
        response = await necessidadesService.buscarSemanasConsumoDisponiveis(filtrosParaUsar);
      }
      
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
  }, [usarCalendario, mes]);

  // Carregar semanas quando o ano mudar ou usarCalendario mudar
  // Usar stringify para comparar filtros de forma estável e evitar loop
  const filtrosString = JSON.stringify(filtros);
  useEffect(() => {
    if (usarCalendario) {
      carregarSemanasConsumo(ano, true, {}, mes);
    } else {
      carregarSemanasConsumo(null, false, null, null);
    }
  }, [ano, mes, usarCalendario, filtrosString, carregarSemanasConsumo]);

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
    if (usarCalendario) {
      carregarSemanasConsumo(ano, true, {}, mes);
    } else {
      carregarSemanasConsumo(null, false, null, null);
    }
  }, [ano, mes, usarCalendario, carregarSemanasConsumo]);

  return {
    opcoes,
    semanas,
    loading,
    error,
    recarregar,
    obterValorPadrao
  };
};
