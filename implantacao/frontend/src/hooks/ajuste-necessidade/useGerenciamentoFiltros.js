import { useState, useCallback } from 'react';
import necessidadesService from '../../services/necessidadesService';

/**
 * Hook para gerenciar mudanças de filtros e busca de semana de abastecimento
 */
export const useGerenciamentoFiltros = ({
  activeTab,
  atualizarFiltrosNutricionista,
  atualizarFiltrosCoordenacao,
  atualizarFiltrosLogistica
}) => {
  const [loadingSemanaAbastecimento, setLoadingSemanaAbastecimento] = useState(false);

  const handleFiltroChange = useCallback(async (campo, valor) => {
    // Se a semana de consumo mudou ou foi limpa
    if (campo === 'semana_consumo') {
      // Se foi limpa, limpar também a semana de abastecimento
      if (!valor) {
        if (activeTab === 'nutricionista') {
          atualizarFiltrosNutricionista({ 
            semana_consumo: null,
            semana_abastecimento: null
          });
        } else if (activeTab === 'coordenacao') {
          atualizarFiltrosCoordenacao({ 
            semana_consumo: null,
            semana_abastecimento: null
          });
        } else if (activeTab === 'logistica') {
          atualizarFiltrosLogistica({ 
            semana_consumo: null,
            semana_abastecimento: null
          });
        }
        return;
      }
      
      // Se tem valor, buscar automaticamente a semana de abastecimento relacionada (da tabela necessidades)
      setLoadingSemanaAbastecimento(true);
      try {
        // Buscar diretamente da tabela necessidades (sem consultar calendário)
        const response = await necessidadesService.buscarSemanaAbastecimentoPorConsumo(valor, activeTab);
        if (response && response.success && response.data && response.data.semana_abastecimento) {
          const semanaAbastecimento = response.data.semana_abastecimento;
          
          // Atualizar tanto semana_consumo quanto semana_abastecimento
          if (activeTab === 'nutricionista') {
            atualizarFiltrosNutricionista({ 
              semana_consumo: valor,
              semana_abastecimento: semanaAbastecimento
            });
          } else if (activeTab === 'coordenacao') {
            atualizarFiltrosCoordenacao({ 
              semana_consumo: valor,
              semana_abastecimento: semanaAbastecimento
            });
          } else if (activeTab === 'logistica') {
            atualizarFiltrosLogistica({ 
              semana_consumo: valor,
              semana_abastecimento: semanaAbastecimento
            });
          }
        } else {
          // Se não encontrou semana de abastecimento, limpar o campo mas manter semana_consumo
          if (activeTab === 'nutricionista') {
            atualizarFiltrosNutricionista({ 
              semana_consumo: valor,
              semana_abastecimento: null
            });
          } else if (activeTab === 'coordenacao') {
            atualizarFiltrosCoordenacao({ 
              semana_consumo: valor,
              semana_abastecimento: null
            });
          } else if (activeTab === 'logistica') {
            atualizarFiltrosLogistica({ 
              semana_consumo: valor,
              semana_abastecimento: null
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar semana de abastecimento:', error);
        // Continuar com a atualização da semana_consumo mesmo se houver erro na busca de abastecimento
        if (activeTab === 'nutricionista') {
          atualizarFiltrosNutricionista({ semana_consumo: valor });
        } else if (activeTab === 'coordenacao') {
          atualizarFiltrosCoordenacao({ semana_consumo: valor });
        } else if (activeTab === 'logistica') {
          atualizarFiltrosLogistica({ semana_consumo: valor });
        }
      } finally {
        setLoadingSemanaAbastecimento(false);
      }
      return;
    }
    
    // Se não for semana_consumo, atualizar normalmente
    if (activeTab === 'nutricionista') {
      atualizarFiltrosNutricionista({ [campo]: valor });
    } else if (activeTab === 'coordenacao') {
      atualizarFiltrosCoordenacao({ [campo]: valor });
    } else if (activeTab === 'logistica') {
      atualizarFiltrosLogistica({ [campo]: valor });
    }
  }, [activeTab, atualizarFiltrosNutricionista, atualizarFiltrosCoordenacao, atualizarFiltrosLogistica]);

  const createHandleLimparFiltros = useCallback(({
    limparFiltrosNutricionista,
    limparFiltrosCoordenacao,
    limparFiltrosLogistica,
    carregarEscolasNutricionista,
    carregarGruposNutricionista,
    carregarEscolasCoordenacao,
    carregarGruposCoordenacao,
    carregarEscolasLogistica,
    carregarGruposLogistica
  }) => {
    return () => {
      // Limpar filtros da aba atual
      if (activeTab === 'nutricionista') {
        limparFiltrosNutricionista();
        // Recarregar escolas e grupos sem filtros
        carregarEscolasNutricionista();
        carregarGruposNutricionista();
      } else if (activeTab === 'coordenacao') {
        limparFiltrosCoordenacao();
        // Recarregar escolas e grupos sem filtros
        carregarEscolasCoordenacao();
        carregarGruposCoordenacao();
      } else if (activeTab === 'logistica') {
        limparFiltrosLogistica();
        // Recarregar escolas e grupos sem filtros
        carregarEscolasLogistica();
        carregarGruposLogistica();
      }
    };
  }, [activeTab]);

  return {
    loadingSemanaAbastecimento,
    handleFiltroChange,
    createHandleLimparFiltros
  };
};

