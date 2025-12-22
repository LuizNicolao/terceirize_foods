/**
 * Handlers compartilhados para a página de Necessidades
 */

import toast from 'react-hot-toast';
import necessidadesService from '../../../services/necessidadesService';

/**
 * Handler para salvar necessidade gerada
 */
export const createSalvarNecessidadeHandler = (gerarNecessidade, recarregarNecessidades, setModalAberto, setGerando) => {
  return async (dados) => {
    setGerando(true);
    try {
      const resultado = await gerarNecessidade(dados);
      if (resultado.success) {
        setModalAberto(false);
        await recarregarNecessidades();
      }
    } catch (error) {
      console.error('Erro ao gerar necessidade:', error);
      toast.error('Erro ao gerar necessidade');
    } finally {
      setGerando(false);
    }
  };
};

/**
 * Handler para sucesso na importação
 */
export const createImportSuccessHandler = (setModalImportAberto, recarregarNecessidades) => {
  return () => {
    setModalImportAberto(false);
    recarregarNecessidades();
    toast.success('Necessidades importadas com sucesso!');
  };
};

/**
 * Handler para excluir necessidade (marca como EXCLUÍDO)
 */
export const createExcluirNecessidadeHandler = (recarregarNecessidades) => {
  return async (necessidadeId) => {
    try {
      const response = await necessidadesService.excluirNecessidade(necessidadeId);
      
      if (response.success) {
        toast.success(`Necessidade ID ${necessidadeId} marcada como excluída com sucesso!`);
        await recarregarNecessidades();
      } else {
        toast.error(response.message || 'Erro ao excluir necessidade');
      }
    } catch (error) {
      console.error('Erro ao excluir necessidade:', error);
      toast.error('Erro ao excluir necessidade');
    }
  };
};

/**
 * Handler para correção salva
 */
export const createCorrecaoSalvaHandler = (recarregarNecessidades) => {
  return () => {
    recarregarNecessidades();
  };
};
