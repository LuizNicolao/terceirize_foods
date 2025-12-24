import { useEffect } from 'react';

/**
 * Hook para gerenciar recarregamento dinâmico de filtros (escolas e grupos)
 */
export const useFiltrosDinamicos = (
  activeTab,
  filtros,
  carregarGruposNutricionista,
  carregarGruposCoordenacao,
  carregarGruposLogistica,
  carregarEscolasNutricionista,
  carregarEscolasCoordenacao,
  carregarEscolasLogistica
) => {
  // Recarregar grupos dinamicamente baseado nos filtros (escola_id e semana_consumo)
  // Quando escola_id é selecionado, grupos devem mostrar apenas os relacionados à escola
  // Quando escola_id é limpo, grupos devem mostrar todos novamente
  useEffect(() => {
    const filtrosGrupos = {};
    if (filtros.escola_id) filtrosGrupos.escola_id = filtros.escola_id;
    if (filtros.semana_consumo) filtrosGrupos.semana_consumo = filtros.semana_consumo;

    if (activeTab === 'nutricionista') {
      carregarGruposNutricionista(filtrosGrupos);
    } else if (activeTab === 'coordenacao') {
      carregarGruposCoordenacao(filtrosGrupos);
    } else if (activeTab === 'logistica') {
      carregarGruposLogistica(filtrosGrupos);
    }
  }, [filtros.escola_id, filtros.semana_consumo, activeTab, carregarGruposNutricionista, carregarGruposCoordenacao, carregarGruposLogistica]);

  // Recarregar escolas dinamicamente baseado nos filtros (grupo e semana_consumo)
  useEffect(() => {
    const filtrosEscolas = {};
    if (filtros.grupo) filtrosEscolas.grupo = filtros.grupo;
    if (filtros.semana_consumo) filtrosEscolas.semana_consumo = filtros.semana_consumo;

    if (activeTab === 'nutricionista') {
      carregarEscolasNutricionista(filtrosEscolas);
    } else if (activeTab === 'coordenacao') {
      carregarEscolasCoordenacao(filtrosEscolas);
    } else if (activeTab === 'logistica') {
      carregarEscolasLogistica(filtrosEscolas);
    }
  }, [filtros.grupo, filtros.semana_consumo, activeTab, carregarEscolasNutricionista, carregarEscolasCoordenacao, carregarEscolasLogistica]);
};

