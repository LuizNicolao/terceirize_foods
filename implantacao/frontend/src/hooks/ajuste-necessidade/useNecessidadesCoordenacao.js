import { useState, useCallback, useEffect } from 'react';
import necessidadesCoordenacaoService from '../../services/necessidadesCoordenacaoService';
import necessidadesService from '../../services/necessidadesService';
import toast from 'react-hot-toast';
import { useExport } from '../common/useExport';

const useNecessidadesCoordenacao = () => {
  const [necessidades, setNecessidades] = useState([]);
  const [nutricionistas, setNutricionistas] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    escola_id: null,
    grupo: null,
    semana_consumo: null,
    semana_abastecimento: null,
    nutricionista_id: null
  });

  // Carregar necessidades
  const carregarNecessidades = useCallback(async (filtrosAtualizados = filtros) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await necessidadesCoordenacaoService.listarParaCoordenacao(filtrosAtualizados);
      
      if (response.success) {
        setNecessidades(response.data);
        setFiltros(filtrosAtualizados);
      } else {
        setError(response.message || 'Erro ao carregar necessidades');
      }
    } catch (error) {
      console.error('Erro ao carregar necessidades:', error);
      setError('Erro ao carregar necessidades');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Carregar nutricionistas
  const carregarNutricionistas = useCallback(async () => {
    try {
      const response = await necessidadesCoordenacaoService.listarNutricionistas();
      
      if (response.success) {
        setNutricionistas(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar nutricionistas:', error);
    }
  }, []);

  // Carregar escolas disponíveis (apenas com necessidades geradas)
  const carregarEscolas = useCallback(async (filtrosAdicionais = {}) => {
    setLoading(true);
    try {
      const response = await necessidadesService.buscarEscolasDisponiveis({
        aba: 'coordenacao',
        ...filtrosAdicionais
      });
      if (response.success) {
        setEscolas(response.data || []);
      } else {
        toast.error(response.message || 'Erro ao carregar escolas');
        setEscolas([]);
      }
    } catch (err) {
      console.error('Erro ao carregar escolas:', err);
      toast.error('Erro ao carregar escolas');
      setEscolas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar grupos de produtos (apenas com necessidades geradas)
  const carregarGrupos = useCallback(async (filtrosAdicionais = {}) => {
    setLoading(true);
    try {
      const response = await necessidadesService.buscarGruposDisponiveis({
        aba: 'coordenacao',
        ...filtrosAdicionais
      });
      if (response.success) {
        setGrupos(response.data || []);
      } else {
        toast.error(response.message || 'Erro ao carregar grupos');
        setGrupos([]);
      }
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
      toast.error('Erro ao carregar grupos');
      setGrupos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar ajustes
  const salvarAjustes = useCallback(async (ajustes) => {
    setLoading(true);
    
    try {
      const response = await necessidadesCoordenacaoService.salvarAjustesCoordenacao(ajustes);
      
      if (response.success) {
        toast.success(response.message);
        // Recarregar necessidades após salvar
        await carregarNecessidades();
        return true;
      } else {
        toast.error(response.message || 'Erro ao salvar ajustes');
        return false;
      }
    } catch (error) {
      console.error('Erro ao salvar ajustes:', error);
      toast.error('Erro ao salvar ajustes');
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarNecessidades]);

  // Liberar para logística
  const liberarParaLogistica = useCallback(async (necessidadeIds) => {
    setLoading(true);
    
    try {
      const response = await necessidadesCoordenacaoService.liberarParaLogistica(necessidadeIds);
      
      if (response.success) {
        const quantidade = response.sucessos || necessidadeIds.length;
        const erros = response.erros || 0;
        let mensagem = `${quantidade} necessidade(s) enviada(s) para Logística (NEC LOG)!`;
        
        if (erros > 0) {
          mensagem += ` (${erros} erro(s))`;
        }
        
        toast.success(mensagem);
        // Recarregar necessidades após liberar
        await carregarNecessidades();
        return true;
      } else {
        toast.error(response.message || 'Erro ao liberar para logística');
        return false;
      }
    } catch (error) {
      console.error('Erro ao liberar para logística:', error);
      toast.error('Erro ao liberar para logística');
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarNecessidades]);

  // Novo: CONF NUTRI (coordenação devolve para Nutri confirmar)
  const confirmarNutri = useCallback(async (dados) => {
    setLoading(true);
    try {
      const response = await necessidadesCoordenacaoService.confirmarNutri(dados);
      if (response.success) {
        const quantidade = response.affectedRows || 1;
        const mensagem = `${quantidade} necessidade(s) enviada(s) para Confirmação Nutri (CONF NUTRI)!`;
        toast.success(mensagem);
        await carregarNecessidades();
        return true;
      } else {
        toast.error(response.message || 'Erro ao confirmar para Nutri');
        return false;
      }
    } catch (error) {
      console.error('Erro ao confirmar para Nutri:', error);
      toast.error('Erro ao confirmar para Nutri');
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarNecessidades]);

  // Novo: confirmação final (CONF)
  const confirmarFinal = useCallback(async (necessidadeIds) => {
    setLoading(true);
    try {
      const response = await necessidadesCoordenacaoService.confirmarFinal(necessidadeIds);
      if (response.success) {
        const quantidade = response.sucessos || necessidadeIds.length;
        const erros = response.erros || 0;
        let mensagem = `${quantidade} necessidade(s) confirmada(s) (CONF)!`;
        
        if (erros > 0) {
          mensagem += ` (${erros} erro(s))`;
        }
        
        toast.success(mensagem);
        await carregarNecessidades();
        return true;
      } else {
        toast.error(response.message || 'Erro ao confirmar');
        return false;
      }
    } catch (error) {
      console.error('Erro ao confirmar final:', error);
      toast.error('Erro ao confirmar');
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarNecessidades]);

  // Buscar produtos para modal
  const buscarProdutosParaModal = useCallback(async (filtrosModal) => {
    try {
      const response = await necessidadesCoordenacaoService.buscarProdutosParaModal(filtrosModal);
      return response;
    } catch (error) {
      console.error('Erro ao buscar produtos para modal:', error);
      throw error;
    }
  }, []);

  // Incluir produto extra
  const incluirProdutoExtra = useCallback(async (dados) => {
    try {
      const response = await necessidadesCoordenacaoService.incluirProdutoExtra(dados);
      
      if (response.success) {
        toast.success(response.message);
        // Recarregar necessidades após incluir
        await carregarNecessidades();
        return true;
      } else {
        toast.error(response.message || 'Erro ao incluir produto');
        return false;
      }
    } catch (error) {
      console.error('Erro ao incluir produto extra:', error);
      toast.error('Erro ao incluir produto extra');
      return false;
    }
  }, [carregarNecessidades]);

  // Atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    setFiltros({
      escola_id: null,
      grupo: null,
      semana_consumo: null,
      semana_abastecimento: null,
      nutricionista_id: null
    });
  }, []);

  const limparNecessidades = useCallback(() => {
    setNecessidades([]);
  }, []);

  // Hook de exportação padronizado
  const { handleExportXLSX, handleExportPDF } = useExport(necessidadesCoordenacaoService);

  // Carregar dados iniciais
  useEffect(() => {
    carregarEscolas();
    carregarGrupos();
  }, [carregarEscolas, carregarGrupos]);

  return {
    // Estados
    necessidades,
    nutricionistas,
    escolas,
    grupos,
    filtros,
    loading,
    error,
    
    // Ações
    carregarNecessidades,
    carregarNutricionistas,
    salvarAjustes,
    liberarParaLogistica,
    confirmarNutri,
    confirmarFinal,
    buscarProdutosParaModal,
    incluirProdutoExtra,
    atualizarFiltros,
    limparFiltros,
    limparNecessidades,

    // Dados auxiliares
    carregarEscolas,
    carregarGrupos,

    // Exportação
    exportarXLSX: handleExportXLSX,
    exportarPDF: handleExportPDF
  };
};

export default useNecessidadesCoordenacao;