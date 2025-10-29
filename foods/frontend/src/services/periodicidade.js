import api from './api';

class PeriodicidadeService {

  /**
   * Listar agrupamentos com filtros e paginação
   */
  static async listar(params = {}) {
    return this.listarAgrupamentos(params);
  }

  static async listarAgrupamentos(params = {}) {
    try {
      const response = await api.get('/periodicidade/agrupamentos', { params });
      
      // Extrair dados da estrutura HATEOAS
      let agrupamentos = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          agrupamentos = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          agrupamentos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        agrupamentos = response.data;
      }
      
      return {
        success: true,
        data: agrupamentos,
        pagination: pagination || response.data.pagination,
        stats: response.data.stats || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao carregar agrupamentos'
      };
    }
  }

  /**
   * Criar novo agrupamento
   */
  static async criarAgrupamento(dados) {
    try {
      const response = await api.post('/periodicidade/agrupamentos', dados);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar agrupamento'
      };
    }
  }

  /**
   * Buscar agrupamento por ID
   */
  static async buscarAgrupamentoPorId(id) {
    try {
      const response = await api.get(`/periodicidade/agrupamentos/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar agrupamento'
      };
    }
  }

  /**
   * Atualizar agrupamento
   */
  static async atualizarAgrupamento(id, dados) {
    try {
      const response = await api.put(`/periodicidade/agrupamentos/${id}`, dados);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar agrupamento'
      };
    }
  }

  /**
   * Excluir agrupamento
   */
  static async excluirAgrupamento(id) {
    try {
      const response = await api.delete(`/periodicidade/agrupamentos/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao excluir agrupamento'
      };
    }
  }

  /**
   * Aliases para compatibilidade com useBaseEntity
   */
  static async criar(dados) {
    return this.criarAgrupamento(dados);
  }

  static async atualizar(id, dados) {
    return this.atualizarAgrupamento(id, dados);
  }

  static async excluir(id) {
    return this.excluirAgrupamento(id);
  }

  /**
   * Vincular escolas ao agrupamento
   */
  static async vincularEscolas(id, escolasIds) {
    try {
      const response = await api.post(`/periodicidade/agrupamentos/${id}/escolas`, {
        escolas: escolasIds
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao vincular escolas'
      };
    }
  }

  /**
   * Buscar escolas vinculadas ao agrupamento
   */
  static async buscarEscolasVinculadas(id) {
    try {
      const response = await api.get(`/periodicidade/agrupamentos/${id}/escolas`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar escolas vinculadas'
      };
    }
  }

  /**
   * Buscar produtos vinculados ao agrupamento
   */
  static async buscarProdutosVinculados(id) {
    try {
      const response = await api.get(`/periodicidade/agrupamentos/${id}/produtos`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar produtos vinculados'
      };
    }
  }

  /**
   * Buscar agrupamentos por escola
   */
  static async buscarAgrupamentosPorEscola(escolaId) {
    try {
      const response = await api.get(`/periodicidade/escolas/${escolaId}/agrupamentos`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar agrupamentos da escola'
      };
    }
  }

  /**
   * Buscar agrupamentos vinculados a uma unidade escolar
   */
  static async buscarAgrupamentosPorUnidade(unidadeEscolarId) {
    try {
      const response = await api.get(`/periodicidade/unidades-escolares/${unidadeEscolarId}/agrupamentos`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar agrupamentos da unidade escolar'
      };
    }
  }

  /**
   * Buscar histórico de aplicações
   */
  static async buscarHistoricoAplicacoes(id, params = {}) {
    try {
      const response = await api.get(`/periodicidade/agrupamentos/${id}/historico`, { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar histórico de aplicações'
      };
    }
  }

  /**
   * Listar tipos de periodicidade
   */
  static async listarTipos() {
    try {
      const response = await api.get('/periodicidade/tipos');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao carregar tipos de periodicidade'
      };
    }
  }

  /**
   * Buscar estatísticas
   */
  static async buscarEstatisticas() {
    try {
      const response = await api.get('/periodicidade/estatisticas');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar estatísticas'
      };
    }
  }

  /**
   * Buscar produtos por grupo (para seleção na periodicidade)
   */
  static async buscarProdutosPorGrupo(grupoId) {
    try {
      const response = await api.get(`/periodicidade/produtos/grupo/${grupoId}`);
      
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || 'Produtos carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao carregar produtos do grupo'
      };
    }
  }

  /**
   * Buscar contagem de produtos por grupo
   */
  static async buscarContagemProdutosPorGrupo() {
    try {
      const response = await api.get(`/periodicidade/produtos/contagem-grupos`);
      
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Contagem carregada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao carregar contagem de produtos por grupo'
      };
    }
  }
}

export default PeriodicidadeService;