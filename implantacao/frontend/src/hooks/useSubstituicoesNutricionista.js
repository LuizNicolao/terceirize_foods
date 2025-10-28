import { useState, useCallback } from 'react';
import SubstituicoesNecessidadesService from '../services/substituicoesNecessidades';
import toast from 'react-hot-toast';

export const useSubstituicoesNutricionista = () => {
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const salvarSubstituicao = useCallback(async (dados) => {
    setSalvando(true);
    try {
      const response = await substituicoesNecessidadesService.salvarSubstituicao(dados);
      if (response.success) {
        toast.success('Substituição salva com sucesso!');
        return response;
      } else {
        toast.error(response.message || 'Erro ao salvar substituição');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro ao salvar substituição:', error);
      toast.error('Erro ao salvar substituição');
      return { success: false, error: error.message };
    } finally {
      setSalvando(false);
    }
  }, []);

  const liberarParaCoordenacao = useCallback(async (necessidades) => {
    setLoading(true);
    try {
      const resultados = await Promise.allSettled(
        necessidades.map(async (necessidade) => {
          try {
            // Atualizar status de 'pendente' para 'conf' para todas as substituições desta necessidade
            const response = await substituicoesNecessidadesService.liberarParaCoordenacao(necessidade.codigo_origem);
            return response;
          } catch (error) {
            return { success: false, error: error.message };
          }
        })
      );
      
      const sucessos = resultados.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const erros = resultados.filter(r => r.status === 'rejected' || !r.value.success).length;
      
      if (erros > 0) {
        toast.error(`${sucessos} liberados com sucesso, ${erros} falharam`);
      } else {
        toast.success('Necessidades liberadas para coordenação!');
      }
      
      return { success: sucessos > 0, sucessos, erros };
    } catch (error) {
      console.error('Erro ao liberar para coordenação:', error);
      toast.error('Erro ao liberar para coordenação');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    salvando,
    salvarSubstituicao,
    liberarParaCoordenacao
  };
};
