import { useState, useEffect, useCallback } from 'react';
import { useSubstituicoesNecessidades } from '../../../hooks/useSubstituicoesNecessidades';
import { useSemanasAbastecimento } from '../../../hooks/useSemanasAbastecimento';
import { useSemanasConsumo } from '../../../hooks/useSemanasConsumo';
import { useAuth } from '../../../contexts/AuthContext';
import { usePermissions } from '../../../contexts/PermissionsContext';

export const useSubstituicoesOrchestrator = () => {
  const { user } = useAuth();
  const { canView, canEdit, canDelete, canCreate } = usePermissions();
  
  // Hooks específicos
  const {
    necessidades,
    produtosGenericos,
    loadingNecessidades,
    loadingGenericos,
    carregarNecessidades,
    carregarProdutosGenericos,
    salvarSubstituicao
  } = useSubstituicoesNecessidades();

  const {
    opcoes: semanasAbastecimento,
    loading: loadingSemanasAbast
  } = useSemanasAbastecimento();

  const {
    semanasConsumo,
    loadingSemanasConsumo,
    carregarSemanasConsumo
  } = useSemanasConsumo();

  // Estados locais
  const [filtros, setFiltros] = useState({
    grupo: '',
    semana_abastecimento: '',
    semana_consumo: ''
  });
  
  const [ajustesAtivados, setAjustesAtivados] = useState(false);
  const [activeTab, setActiveTab] = useState('nutricionista');

  // Verificar se ajustes estão ativados baseado nas necessidades
  useEffect(() => {
    if (necessidades.length > 0) {
      const temSubstituicoes = necessidades.some(nec => 
        nec.escolas.some(escola => escola.substituicao)
      );
      setAjustesAtivados(temSubstituicoes);
    }
  }, [necessidades]);

  // Carregar dados iniciais - semanas de abastecimento são carregadas automaticamente

  // Carregar semanas de consumo quando semana de abastecimento mudar
  useEffect(() => {
    if (filtros.semana_abastecimento) {
      carregarSemanasConsumo(filtros.semana_abastecimento);
    }
  }, [filtros.semana_abastecimento, carregarSemanasConsumo]);

  // Carregar necessidades quando filtros mudarem
  useEffect(() => {
    if (filtros.grupo || filtros.semana_abastecimento || filtros.semana_consumo) {
      carregarNecessidades(filtros);
    }
  }, [filtros, carregarNecessidades]);

  // Carregar produtos genéricos quando necessidades mudarem
  useEffect(() => {
    if (necessidades.length > 0) {
      const produtosOrigem = [...new Set(necessidades.map(n => n.codigo_origem))];
      produtosOrigem.forEach(produtoId => {
        carregarProdutosGenericos({ produto_origem_id: produtoId });
      });
    }
  }, [necessidades, carregarProdutosGenericos]);

  const handleFiltrosChange = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  const handleIniciarAjustes = useCallback(async () => {
    if (!necessidades.length) {
      return { success: false, message: 'Nenhuma necessidade encontrada' };
    }

    try {
      const resultados = await Promise.allSettled(
        necessidades.map(async (necessidade) => {
          try {
            const produtoPadrao = produtosGenericos[necessidade.codigo_origem]?.find(
              p => p.produto_padrao === 'Sim'
            );

            if (!produtoPadrao) {
              return { success: false, message: `Produto padrão não encontrado para ${necessidade.codigo_origem}` };
            }

            const unidade = produtoPadrao.unidade_medida_sigla || produtoPadrao.unidade || '';
            const fatorConversao = produtoPadrao.fator_conversao || 1;

            const dados = {
              produto_origem_id: necessidade.codigo_origem,
              produto_origem_nome: necessidade.produto_origem_nome,
              produto_origem_unidade: necessidade.produto_origem_unidade,
              produto_generico_id: produtoPadrao.id || produtoPadrao.codigo,
              produto_generico_codigo: produtoPadrao.id || produtoPadrao.codigo,
              produto_generico_nome: produtoPadrao.nome,
              produto_generico_unidade: unidade,
              necessidade_id_grupo: necessidade.necessidade_id_grupo,
              semana_abastecimento: necessidade.semana_abastecimento,
              semana_consumo: necessidade.semana_consumo,
              quantidade_origem: necessidade.quantidade_total_origem,
              quantidade_generico: Math.ceil(parseFloat(necessidade.quantidade_total_origem) / fatorConversao),
              escola_ids: necessidade.escolas.map(escola => {
                const quantidadeGenerico = Math.ceil(parseFloat(escola.quantidade_origem) / fatorConversao);
                return {
                  necessidade_id: escola.necessidade_id,
                  escola_id: escola.escola_id,
                  escola_nome: escola.escola_nome,
                  quantidade_origem: escola.quantidade_origem,
                  quantidade_generico: quantidadeGenerico
                };
              })
            };

            const response = await salvarSubstituicao(dados);
            return response;
          } catch (error) {
            return { success: false, error: error.message };
          }
        })
      );
      
      const sucessos = resultados.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const erros = resultados.filter(r => r.status === 'rejected' || !r.value.success).length;
      
      if (erros > 0) {
        return { success: false, message: `${sucessos} salvos com sucesso, ${erros} falharam` };
      } else {
        setAjustesAtivados(true);
        return { success: true, message: 'Ajustes iniciados com sucesso!' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [necessidades, produtosGenericos, salvarSubstituicao]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Determinar qual tabela mostrar baseado no tipo de usuário
  const getTabelaParaUsuario = useCallback(() => {
    if (user?.tipo === 'coordenador') {
      return 'coordenacao';
    }
    return activeTab;
  }, [user?.tipo, activeTab]);

  return {
    // Estados
    necessidades,
    produtosGenericos,
    filtros,
    ajustesAtivados,
    activeTab,
    semanasAbastecimento,
    semanasConsumo,
    
    // Loading states
    loadingNecessidades,
    loadingGenericos,
    loadingSemanasAbast,
    loadingSemanasConsumo,
    
    // Funções
    handleFiltrosChange,
    handleIniciarAjustes,
    handleTabChange,
    getTabelaParaUsuario,
    salvarSubstituicao,
    carregarNecessidades,
    
    // Permissões
    canView: canView('necessidades_substituicoes'),
    canEdit: canEdit('necessidades_substituicoes'),
    canDelete: canDelete('necessidades_substituicoes'),
    canCreate: canCreate('necessidades_substituicoes')
  };
};
