import { useState, useEffect, useCallback } from 'react';
import UsuariosService from '../../services/usuarios';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import { useAuth } from '../../contexts/AuthContext';

export const useUnidadesEscolares = (unidadesSelecionadas, onUnidadesChange) => {
  const { user } = useAuth();
  
  // Estados para Filiais
  const [filiais, setFiliais] = useState([]);
  const [filiaisSelecionadas, setFiliaisSelecionadas] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  
  // Estados para Unidades Escolares
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [buscaUnidades, setBuscaUnidades] = useState('');
  const [unidadesFiltradas, setUnidadesFiltradas] = useState([]);

  // Carregar filiais do usuário
  const carregarFiliais = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoadingFiliais(true);
      
      // Buscar filiais do usuário
      const userResult = await UsuariosService.buscarPorId(user.id);
      if (userResult.success && userResult.data?.filiais) {
        setFiliais(userResult.data.filiais);
      } else {
        setFiliais([]);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      setFiliais([]);
    } finally {
      setLoadingFiliais(false);
    }
  }, [user?.id]);

  // Carregar unidades escolares baseado nas filiais selecionadas
  const carregarUnidadesEscolares = useCallback(async (filiaisIds = filiaisSelecionadas) => {
    if (filiaisIds.length === 0) {
      setUnidadesEscolares([]);
      return;
    }

    try {
      setLoadingUnidades(true);
      
      // Buscar unidades escolares das filiais selecionadas
      const unidadesResult = await UnidadesEscolaresService.buscarAtivas();
      if (unidadesResult.success) {
        const unidadesFiltradas = unidadesResult.data.filter(ue => 
          filiaisIds.includes(parseInt(ue.filial_id))
        );
        setUnidadesEscolares(unidadesFiltradas);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      setUnidadesEscolares([]);
    } finally {
      setLoadingUnidades(false);
    }
  }, [filiaisSelecionadas]);

  // Filtrar unidades escolares baseado na busca
  useEffect(() => {
    if (!buscaUnidades.trim()) {
      setUnidadesFiltradas(unidadesEscolares);
      return;
    }

    const filtradas = unidadesEscolares.filter(unidade => {
      const termoBusca = buscaUnidades.toLowerCase();
      return (
        (unidade.nome_escola && unidade.nome_escola.toLowerCase().includes(termoBusca)) ||
        (unidade.cidade && unidade.cidade.toLowerCase().includes(termoBusca)) ||
        (unidade.estado && unidade.estado.toLowerCase().includes(termoBusca)) ||
        (unidade.endereco && unidade.endereco.toLowerCase().includes(termoBusca))
      );
    });
    setUnidadesFiltradas(filtradas);
  }, [buscaUnidades, unidadesEscolares]);

  // Funções para manipular seleções de filiais
  const handleFilialChange = useCallback(async (filialId, checked) => {
    if (checked) {
      const novasFiliais = [...filiaisSelecionadas, filialId];
      setFiliaisSelecionadas(novasFiliais);
      // Recarregar unidades escolares com as novas filiais
      await carregarUnidadesEscolares(novasFiliais);
    } else {
      const novasFiliais = filiaisSelecionadas.filter(id => id !== filialId);
      setFiliaisSelecionadas(novasFiliais);
      // Remover unidades escolares da filial desmarcada
      onUnidadesChange(prev => {
        const filial = filiais.find(f => f.id === filialId);
        if (filial) {
          return prev.filter(unidadeId => {
            const unidade = unidadesEscolares.find(u => u.id === unidadeId);
            return unidade && unidade.filial_id !== filialId;
          });
        }
        return prev;
      });
      // Recarregar unidades escolares com as filiais restantes
      await carregarUnidadesEscolares(novasFiliais);
    }
  }, [filiaisSelecionadas, filiais, unidadesEscolares, onUnidadesChange, carregarUnidadesEscolares]);

  // Funções para manipular seleções de unidades escolares
  const handleUnidadeChange = useCallback((unidadeId, checked) => {
    if (checked) {
      onUnidadesChange(prev => [...prev, unidadeId]);
    } else {
      onUnidadesChange(prev => prev.filter(id => id !== unidadeId));
    }
  }, [onUnidadesChange]);

  // Funções para seleção em lote
  const handleSelecionarTodasUnidades = useCallback(() => {
    const todasUnidades = unidadesFiltradas.map(u => u.id);
    onUnidadesChange(prev => {
      const novas = [...prev];
      todasUnidades.forEach(id => {
        if (!novas.includes(id)) {
          novas.push(id);
        }
      });
      return novas;
    });
  }, [unidadesFiltradas, onUnidadesChange]);

  const handleDesselecionarTodasUnidades = useCallback(() => {
    const unidadesFiltradasIds = unidadesFiltradas.map(u => u.id);
    onUnidadesChange(prev => 
      prev.filter(id => !unidadesFiltradasIds.includes(id))
    );
  }, [unidadesFiltradas, onUnidadesChange]);

  const handleSelecionarTodasFiliais = useCallback(() => {
    setFiliaisSelecionadas(filiais.map(f => f.id));
    carregarUnidadesEscolares(filiais.map(f => f.id));
  }, [filiais, carregarUnidadesEscolares]);

  const handleDesselecionarTodasFiliais = useCallback(() => {
    setFiliaisSelecionadas([]);
    setUnidadesEscolares([]);
    onUnidadesChange([]);
  }, [onUnidadesChange]);

  // Carregar unidades escolares das unidades já selecionadas para marcar filiais
  const carregarUnidadesSelecionadas = useCallback(async () => {
    if (unidadesSelecionadas.length > 0 && filiais.length > 0) {
      try {
        // Buscar todas as unidades escolares ativas
        const unidadesResult = await UnidadesEscolaresService.buscarAtivas();
        if (unidadesResult.success) {
          // Filtrar apenas as unidades selecionadas
          const unidadesSelecionadasData = unidadesResult.data.filter(ue => 
            unidadesSelecionadas.includes(ue.id)
          );
          
          // Encontrar filiais das unidades selecionadas
          const filiaisDasUnidades = unidadesSelecionadasData.map(ue => ue.filial_id);
          const filiaisUnicas = [...new Set(filiaisDasUnidades)];
          
          // Marcar as filiais se ainda não estiverem marcadas
          if (filiaisUnicas.length > 0 && filiaisSelecionadas.length === 0) {
            setFiliaisSelecionadas(filiaisUnicas);
            // Carregar unidades escolares das filiais marcadas
            await carregarUnidadesEscolares(filiaisUnicas);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar unidades selecionadas:', error);
      }
    }
  }, [unidadesSelecionadas, filiais, filiaisSelecionadas, carregarUnidadesEscolares]);

  // Efeito para marcar filiais quando unidades escolares são carregadas
  useEffect(() => {
    if (unidadesSelecionadas.length > 0 && unidadesEscolares.length > 0) {
      // Encontrar filiais das unidades selecionadas
      const filiaisDasUnidades = unidadesSelecionadas.map(unidadeId => {
        const unidade = unidadesEscolares.find(u => u.id === unidadeId);
        return unidade ? unidade.filial_id : null;
      }).filter(Boolean);
      
      // Remover duplicatas
      const filiaisUnicas = [...new Set(filiaisDasUnidades)];
      
      // Marcar as filiais se ainda não estiverem marcadas
      if (filiaisUnicas.length > 0 && filiaisSelecionadas.length === 0) {
        setFiliaisSelecionadas(filiaisUnicas);
      }
    }
  }, [unidadesEscolares, unidadesSelecionadas, filiaisSelecionadas]);

  // Carregar dados quando o componente montar
  useEffect(() => {
    carregarFiliais();
  }, [carregarFiliais]);

  // Carregar unidades selecionadas quando filiais estiverem carregadas
  useEffect(() => {
    carregarUnidadesSelecionadas();
  }, [carregarUnidadesSelecionadas]);

  return {
    // Estados
    filiais,
    filiaisSelecionadas,
    loadingFiliais,
    unidadesEscolares,
    loadingUnidades,
    buscaUnidades,
    unidadesFiltradas,
    
    // Ações
    setBuscaUnidades,
    handleFilialChange,
    handleUnidadeChange,
    handleSelecionarTodasUnidades,
    handleDesselecionarTodasUnidades,
    handleSelecionarTodasFiliais,
    handleDesselecionarTodasFiliais
  };
};
