import { useState, useEffect, useCallback } from 'react';
import necessidadesCoordenacaoService from '../services/necessidadesCoordenacaoService';
import toast from 'react-hot-toast';

const useNecessidadesCoordenacao = () => {
  const [necessidades, setNecessidades] = useState([]);
  const [necessidadesFiltradas, setNecessidadesFiltradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ajustesLocais, setAjustesLocais] = useState({});
  const [produtosModal, setProdutosModal] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [searchProduto, setSearchProduto] = useState('');
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    escola_id: '',
    grupo: '',
    semana_consumo: '',
    semana_abastecimento: '',
    nutricionista_id: ''
  });
  
  // Dados para filtros
  const [escolas, setEscolas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [nutricionistas, setNutricionistas] = useState([]);
  const [semanasConsumo, setSemanasConsumo] = useState([]);
  const [semanasAbastecimento, setSemanasAbastecimento] = useState([]);
  
  // Carregar necessidades
  const carregarNecessidades = useCallback(async () => {
    if (!filtros.escola_id || !filtros.grupo || !filtros.semana_consumo) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await necessidadesCoordenacaoService.listarParaCoordenacao(filtros);
      
      if (response.success) {
        setNecessidades(response.data);
        setNecessidadesFiltradas(response.data);
        
        // Inicializar ajustes locais
        const ajustesIniciais = {};
        response.data.forEach(nec => {
          ajustesIniciais[nec.id] = nec.ajuste_coordenacao || '';
        });
        setAjustesLocais(ajustesIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar necessidades:', error);
      toast.error('Erro ao carregar necessidades');
    } finally {
      setLoading(false);
    }
  }, [filtros]);
  
  // Carregar dados para filtros
  const carregarDadosFiltros = useCallback(async () => {
    try {
      // Carregar nutricionistas
      const responseNutricionistas = await necessidadesCoordenacaoService.listarNutricionistas();
      if (responseNutricionistas.success) {
        setNutricionistas(responseNutricionistas.data);
      }
      
      // Carregar escolas (usar o mesmo serviço da tela de ajuste)
      // TODO: Implementar carregamento de escolas
      
      // Carregar grupos (usar dados estáticos por enquanto)
      setGrupos([
        { value: 'FRIOS', label: 'FRIOS' },
        { value: 'CARNES', label: 'CARNES' },
        { value: 'HORTIFRUTI', label: 'HORTIFRUTI' },
        { value: 'LATICINIOS', label: 'LATICÍNIOS' },
        { value: 'CEREAIS', label: 'CEREAIS' }
      ]);
      
      // Carregar semanas (usar dados estáticos por enquanto)
      const semanas = [
        { value: '06/01 a 12/01', label: '06/01 a 12/01' },
        { value: '13/01 a 19/01', label: '13/01 a 19/01' },
        { value: '20/01 a 26/01', label: '20/01 a 26/01' }
      ];
      setSemanasConsumo(semanas);
      setSemanasAbastecimento(semanas);
      
    } catch (error) {
      console.error('Erro ao carregar dados dos filtros:', error);
    }
  }, []);
  
  // Atualizar filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };
  
  // Buscar produtos para modal
  const buscarProdutosParaModal = useCallback(async () => {
    if (!filtros.grupo || !filtros.escola_id) {
      toast.error('Selecione grupo e escola primeiro');
      return;
    }
    
    setLoadingProdutos(true);
    try {
      const response = await necessidadesCoordenacaoService.buscarProdutosParaModal({
        grupo: filtros.grupo,
        escola_id: filtros.escola_id,
        semana_consumo: filtros.semana_consumo,
        search: searchProduto
      });
      
      if (response.success) {
        setProdutosModal(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao buscar produtos');
    } finally {
      setLoadingProdutos(false);
    }
  }, [filtros.grupo, filtros.escola_id, filtros.semana_consumo, searchProduto]);
  
  // Incluir produto extra
  const incluirProdutoExtra = useCallback(async (produto) => {
    try {
      const response = await necessidadesCoordenacaoService.incluirProdutoExtra({
        produto_id: produto.produto_id,
        escola_id: filtros.escola_id,
        grupo: filtros.grupo,
        semana_consumo: filtros.semana_consumo,
        semana_abastecimento: filtros.semana_abastecimento
      });
      
      if (response.success) {
        toast.success('Produto incluído com sucesso');
        // Recarregar necessidades
        await carregarNecessidades();
      }
    } catch (error) {
      console.error('Erro ao incluir produto:', error);
      toast.error('Erro ao incluir produto');
    }
  }, [filtros, carregarNecessidades]);
  
  // Salvar ajustes
  const salvarAjustes = useCallback(async () => {
    const itens = Object.entries(ajustesLocais)
      .filter(([id, ajuste]) => ajuste !== '' && ajuste !== null && ajuste !== undefined)
      .map(([id, ajuste]) => ({
        id: parseInt(id),
        ajuste: parseFloat(ajuste)
      }));
    
    if (itens.length === 0) {
      toast.warning('Nenhum ajuste para salvar');
      return;
    }
    
    setLoading(true);
    try {
      const response = await necessidadesCoordenacaoService.salvarAjustesCoordenacao(itens);
      
      if (response.success) {
        toast.success('Ajustes salvos com sucesso');
        setAjustesLocais({});
        await carregarNecessidades();
      }
    } catch (error) {
      console.error('Erro ao salvar ajustes:', error);
      toast.error('Erro ao salvar ajustes');
    } finally {
      setLoading(false);
    }
  }, [ajustesLocais, carregarNecessidades]);
  
  // Liberar para logística
  const liberarParaLogistica = useCallback(async () => {
    const necessidadeIds = [...new Set(necessidades.map(n => n.necessidade_id))];
    
    if (necessidadeIds.length === 0) {
      toast.warning('Nenhuma necessidade para liberar');
      return;
    }
    
    setLoading(true);
    try {
      const response = await necessidadesCoordenacaoService.liberarParaLogistica(necessidadeIds);
      
      if (response.success) {
        toast.success('Necessidades liberadas para logística');
        await carregarNecessidades();
      }
    } catch (error) {
      console.error('Erro ao liberar para logística:', error);
      toast.error('Erro ao liberar para logística');
    } finally {
      setLoading(false);
    }
  }, [necessidades, carregarNecessidades]);
  
  // Atualizar ajuste local
  const handleAjusteChange = (id, valor) => {
    setAjustesLocais(prev => ({
      ...prev,
      [id]: valor
    }));
  };
  
  // Filtrar produtos por busca
  useEffect(() => {
    if (searchProduto) {
      const filtrados = produtosModal.filter(produto =>
        produto.produto_nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
        produto.produto_codigo.toLowerCase().includes(searchProduto.toLowerCase())
      );
      setProdutosModal(filtrados);
    } else {
      buscarProdutosParaModal();
    }
  }, [searchProduto, buscarProdutosParaModal]);
  
  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosFiltros();
  }, [carregarDadosFiltros]);
  
  return {
    // Estados
    necessidades,
    necessidadesFiltradas,
    loading,
    ajustesLocais,
    produtosModal,
    loadingProdutos,
    searchProduto,
    produtosSelecionados,
    filtros,
    escolas,
    grupos,
    nutricionistas,
    semanasConsumo,
    semanasAbastecimento,
    
    // Ações
    carregarNecessidades,
    handleFiltroChange,
    buscarProdutosParaModal,
    incluirProdutoExtra,
    salvarAjustes,
    liberarParaLogistica,
    handleAjusteChange,
    setSearchProduto,
    setProdutosSelecionados
  };
};

export default useNecessidadesCoordenacao;
