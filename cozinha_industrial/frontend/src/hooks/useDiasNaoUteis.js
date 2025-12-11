import { useState, useEffect, useMemo } from 'react';
import { useCalendario } from './useCalendario';
import FoodsApiService from '../services/FoodsApiService';

// Formata destino para busca
const formatarDestinoDia = (dia) => {
  if (dia.tipo_destino === 'global') {
    return 'Global - todas as unidades';
  }
  if (dia.tipo_destino === 'filial') {
    let descricao = `Filial: ${dia.filial_nome || dia.filial_id}`;
    if (dia.filial_cidade) {
      descricao += ` (${dia.filial_cidade})`;
    }
    return descricao;
  }
  if (dia.tipo_destino === 'unidade') {
    let descricao = `Unidade: ${dia.unidade_nome || dia.unidade_escolar_id}`;
    if (dia.unidade_cidade) {
      descricao += ` (${dia.unidade_cidade})`;
    }
    return descricao;
  }
  return 'Destino não informado';
};

export const useDiasNaoUteis = (ano, diasNaoUteisFromParent = null) => {
  // Se não receber diasNaoUteis do parent, cria uma instância do hook
  const calendarioHook = useCalendario();
  const {
    adicionarDiaNaoUtil,
    atualizarDiaNaoUtil,
    removerDiaNaoUtil,
    carregarConfiguracao,
    loading
  } = calendarioHook;
  
  // Usa os dados do parent se fornecidos, senão usa do hook
  const diasNaoUteis = diasNaoUteisFromParent !== null && diasNaoUteisFromParent !== undefined 
    ? diasNaoUteisFromParent 
    : calendarioHook.diasNaoUteis;

  const [filiais, setFiliais] = useState([]);
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingListas, setLoadingListas] = useState(false);
  const [buscaUnidadesTermo, setBuscaUnidadesTermo] = useState('');
  const [buscaDiaNaoUtil, setBuscaDiaNaoUtil] = useState('');

  // Carregar listas auxiliares
  useEffect(() => {
    const carregarListasAuxiliares = async () => {
      try {
        setLoadingListas(true);
        const [filiaisResult, unidadesResult] = await Promise.all([
          FoodsApiService.getFiliaisAtivas(),
          FoodsApiService.getUnidadesEscolaresAtivas()
        ]);

        if (filiaisResult.success) {
          setFiliais(filiaisResult.data || []);
        }

        if (unidadesResult.success) {
          setUnidadesEscolares(unidadesResult.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar listas auxiliares do calendário:', error);
      } finally {
        setLoadingListas(false);
      }
    };

    carregarListasAuxiliares();
  }, []);

  // Agrupa dias não úteis por data + descrição
  const diasNaoUteisAgrupados = useMemo(() => {
    const diasNaoUteisConfigurados = diasNaoUteis || [];
    if (!diasNaoUteisConfigurados.length) {
      return [];
    }

    const grupos = {};
    
    diasNaoUteisConfigurados.forEach((dia) => {
      const chave = `${dia.data}_${dia.descricao || ''}`;
      
      if (!grupos[chave]) {
        grupos[chave] = {
          data: dia.data,
          descricao: dia.descricao,
          observacoes: dia.observacoes,
          destinos: [],
          ids: []
        };
      }
      
      grupos[chave].destinos.push(dia);
      grupos[chave].ids.push(dia.id);
    });

    return Object.values(grupos).map((grupo) => ({
      ...grupo,
      id: grupo.ids[0],
      quantidade: grupo.destinos.length
    }));
  }, [diasNaoUteis]);

  // Resumo por tipo
  const resumoDiasNaoUteis = useMemo(() => {
    const diasNaoUteisConfigurados = diasNaoUteis || [];
    if (!diasNaoUteisConfigurados.length) {
      return [];
    }
    const mapa = diasNaoUteisConfigurados.reduce((acc, dia) => {
      const tipo = dia.tipo_destino || 'global';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(mapa).map(([tipo, quantidade]) => ({
      tipo,
      quantidade
    }));
  }, [diasNaoUteis]);

  // Ordena por data
  const diasNaoUteisOrdenados = useMemo(() => {
    return [...diasNaoUteisAgrupados].sort((a, b) => {
      const dataA = a.data ? new Date(`${a.data}T00:00:00`).getTime() : 0;
      const dataB = b.data ? new Date(`${b.data}T00:00:00`).getTime() : 0;
      return dataB - dataA;
    });
  }, [diasNaoUteisAgrupados]);

  // Últimos 5
  const diasNaoUteisRecentes = useMemo(() => {
    return diasNaoUteisOrdenados.slice(0, 5);
  }, [diasNaoUteisOrdenados]);

  // Formata destino para busca
  const formatarDestinoDia = (dia) => {
    if (dia.tipo_destino === 'global') {
      return 'Global - todas as unidades';
    }
    if (dia.tipo_destino === 'filial') {
      let descricao = `Filial: ${dia.filial_nome || dia.filial_id}`;
      if (dia.filial_cidade) {
        descricao += ` (${dia.filial_cidade})`;
      }
      return descricao;
    }
    if (dia.tipo_destino === 'unidade') {
      let descricao = `Unidade: ${dia.unidade_nome || dia.unidade_escolar_id}`;
      if (dia.unidade_cidade) {
        descricao += ` (${dia.unidade_cidade})`;
      }
      return descricao;
    }
    return 'Destino não informado';
  };

  // Filtra por busca
  const diasNaoUteisFiltrados = useMemo(() => {
    if (!buscaDiaNaoUtil.trim()) {
      return diasNaoUteisOrdenados;
    }
    const termo = buscaDiaNaoUtil.toLowerCase();
    return diasNaoUteisOrdenados.filter((dia) => {
      const descricao = (dia.descricao || '').toLowerCase();
      const observacoes = (dia.observacoes || '').toLowerCase();
      
      if (descricao.includes(termo) || observacoes.includes(termo)) {
        return true;
      }
      
      if (dia.destinos && Array.isArray(dia.destinos)) {
        return dia.destinos.some((destino) => {
          const destinoFormatado = formatarDestinoDia(destino).toLowerCase();
          return destinoFormatado.includes(termo);
        });
      }
      
      const destino = formatarDestinoDia(dia).toLowerCase();
      return destino.includes(termo);
    });
  }, [buscaDiaNaoUtil, diasNaoUteisOrdenados]);

  // Resumo dos filtrados
  const resumoDiasNaoUteisFiltrados = useMemo(() => {
    if (!diasNaoUteisFiltrados.length) {
      return [];
    }
    const mapa = diasNaoUteisFiltrados.reduce((acc, dia) => {
      const tipo = dia.tipo_destino || 'global';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(mapa).map(([tipo, quantidade]) => ({
      tipo,
      quantidade
    }));
  }, [diasNaoUteisFiltrados]);

  // Opções de filiais formatadas
  const filiaisOptions = useMemo(() => {
    return (filiais || [])
      .map((filial) => {
        const label = filial.filial || filial.razao_social || `Filial ${filial.id}`;
        const description = filial.cidade
          ? `${filial.cidade}${filial.estado ? ` - ${filial.estado}` : ''}`
          : undefined;

        return {
          value: filial.id,
          label,
          description,
          searchableText: `${label} ${filial.codigo_filial || ''} ${filial.cnpj || ''}`.trim()
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [filiais]);

  // Unidades filtradas por filial e busca
  const unidadesFiltradas = useMemo(() => {
    if (!unidadesEscolares || unidadesEscolares.length === 0) {
      return [];
    }
    
    const termoBuscaNormalizado = buscaUnidadesTermo.trim().toLowerCase();
    
    return unidadesEscolares
      .filter((unidade) => {
        // Filtro por filial será aplicado no componente
        return true;
      })
      .filter((unidade) => {
        if (!termoBuscaNormalizado) return true;
        const { nome_escola, cidade, codigo_teknisa } = unidade;
        return (
          (nome_escola && nome_escola.toLowerCase().includes(termoBuscaNormalizado)) ||
          (cidade && cidade.toLowerCase().includes(termoBuscaNormalizado)) ||
          (codigo_teknisa && codigo_teknisa.toString().toLowerCase().includes(termoBuscaNormalizado))
        );
      });
  }, [unidadesEscolares, buscaUnidadesTermo]);

  return {
    // Estados
    filiais,
    unidadesEscolares,
    loadingListas,
    buscaUnidadesTermo,
    setBuscaUnidadesTermo,
    buscaDiaNaoUtil,
    setBuscaDiaNaoUtil,
    
    // Dados processados
    diasNaoUteisAgrupados,
    diasNaoUteisRecentes,
    diasNaoUteisFiltrados,
    diasNaoUteisConfigurados: diasNaoUteis || [],
    resumoDiasNaoUteis,
    resumoDiasNaoUteisFiltrados,
    
    // Opções formatadas
    filiaisOptions,
    unidadesFiltradas,
    
    // Funções
    adicionarDiaNaoUtil,
    atualizarDiaNaoUtil,
    removerDiaNaoUtil,
    carregarConfiguracao,
    loading
  };
};

