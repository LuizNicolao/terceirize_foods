import { useState, useCallback } from 'react';
import SubstituicoesNecessidadesService from '../../../services/substituicoesNecessidades';
import toast from 'react-hot-toast';

export const useSubstituicoesCoordenacao = () => {
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

  const aprovarSubstituicao = useCallback(async (substituicao) => {
    setLoading(true);
    try {
      const response = await substituicoesNecessidadesService.aprovarSubstituicao(substituicao.id);
      if (response.success) {
        toast.success('Substituição aprovada com sucesso!');
        return response;
      } else {
        toast.error(response.message || 'Erro ao aprovar substituição');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro ao aprovar substituição:', error);
      toast.error('Erro ao aprovar substituição');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const rejeitarSubstituicao = useCallback(async (substituicao) => {
    setLoading(true);
    try {
      const response = await substituicoesNecessidadesService.rejeitarSubstituicao(substituicao.id);
      if (response.success) {
        toast.success('Substituição rejeitada com sucesso!');
        return response;
      } else {
        toast.error(response.message || 'Erro ao rejeitar substituição');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro ao rejeitar substituição:', error);
      toast.error('Erro ao rejeitar substituição');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    salvando,
    salvarSubstituicao,
    aprovarSubstituicao,
    rejeitarSubstituicao
  };
};
