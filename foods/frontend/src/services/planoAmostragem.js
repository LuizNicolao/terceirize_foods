import api from './api';

class PlanoAmostragemService {
  // ========== MÉTODOS NQA ==========

  async listarNQAs(params = {}) {
    try {
      const response = await api.get('/plano-amostragem/nqa', { params });
      
      // Extrair dados da estrutura HATEOAS
      let nqas = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        if (response.data.data.items) {
          nqas = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
          statistics = response.data.data._meta?.statistics;
        } else {
          nqas = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        nqas = response.data;
      }
      
      if (!pagination) {
        pagination = response.data.pagination || response.data.meta?.pagination;
      }
      if (!statistics) {
        statistics = response.data.statistics || response.data.meta?.statistics;
      }
      
      return {
        success: true,
        data: nqas,
        pagination: pagination || response.data.pagination || response.data.meta?.pagination,
        statistics: statistics || response.data.statistics || response.data.meta?.statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar NQAs'
      };
    }
  }

  async buscarNQAPorId(id) {
    try {
      const response = await api.get(`/plano-amostragem/nqa/${id}`);
      
      let nqa = null;
      if (response.data.data) {
        nqa = response.data.data;
      } else {
        nqa = response.data;
      }
      
      return {
        success: true,
        data: nqa
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar NQA'
      };
    }
  }

  async buscarNQAsAtivos() {
    try {
      const response = await api.get('/plano-amostragem/nqa/ativos');
      
      let nqas = [];
      if (response.data.data) {
        if (response.data.data.items) {
          nqas = response.data.data.items;
        } else {
          nqas = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        nqas = response.data;
      }
      
      return {
        success: true,
        data: nqas
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar NQAs ativos'
      };
    }
  }

  async criarNQA(data) {
    try {
      const response = await api.post('/plano-amostragem/nqa', data);
      
      let nqa = null;
      if (response.data.data) {
        nqa = response.data.data;
      } else {
        nqa = response.data;
      }
      
      return {
        success: true,
        data: nqa,
        message: 'NQA criado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar NQA'
      };
    }
  }

  async atualizarNQA(id, data) {
    try {
      const response = await api.put(`/plano-amostragem/nqa/${id}`, data);
      
      let nqa = null;
      if (response.data.data) {
        nqa = response.data.data;
      } else {
        nqa = response.data;
      }
      
      return {
        success: true,
        data: nqa,
        message: 'NQA atualizado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar NQA'
      };
    }
  }

  async excluirNQA(id) {
    try {
      await api.delete(`/plano-amostragem/nqa/${id}`);
      return {
        success: true,
        message: 'NQA excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir NQA'
      };
    }
  }

  // ========== MÉTODOS TABELA DE AMOSTRAGEM ==========

  async listarFaixas(params = {}) {
    try {
      const response = await api.get('/plano-amostragem/tabela-amostragem', { params });
      
      let faixas = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        if (response.data.data.items) {
          faixas = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
          statistics = response.data.data._meta?.statistics;
        } else {
          faixas = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        faixas = response.data;
      }
      
      if (!pagination) {
        pagination = response.data.pagination || response.data.meta?.pagination;
      }
      if (!statistics) {
        statistics = response.data.statistics || response.data.meta?.statistics;
      }
      
      return {
        success: true,
        data: faixas,
        pagination: pagination || response.data.pagination || response.data.meta?.pagination,
        statistics: statistics || response.data.statistics || response.data.meta?.statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar faixas de amostragem'
      };
    }
  }

  async buscarFaixaPorId(id) {
    try {
      const response = await api.get(`/plano-amostragem/tabela-amostragem/${id}`);
      
      let faixa = null;
      if (response.data.data) {
        faixa = response.data.data;
      } else {
        faixa = response.data;
      }
      
      return {
        success: true,
        data: faixa
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar faixa de amostragem'
      };
    }
  }

  async buscarFaixasPorNQA(nqa_id) {
    try {
      const response = await api.get(`/plano-amostragem/tabela-amostragem/nqa/${nqa_id}`);
      
      let faixas = [];
      if (response.data.data) {
        if (response.data.data.items) {
          faixas = response.data.data.items;
        } else {
          faixas = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        faixas = response.data;
      }
      
      return {
        success: true,
        data: faixas
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar faixas do NQA'
      };
    }
  }

  async buscarPlanoPorLote(lote) {
    try {
      const response = await api.get('/plano-amostragem/tabela-amostragem/buscar-por-lote', {
        params: { lote }
      });
      
      let plano = null;
      if (response.data.data) {
        plano = response.data.data;
      } else {
        plano = response.data;
      }
      
      return {
        success: true,
        data: plano
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar plano de amostragem'
      };
    }
  }

  async criarFaixa(data) {
    try {
      const response = await api.post('/plano-amostragem/tabela-amostragem', data);
      
      let faixa = null;
      if (response.data.data) {
        faixa = response.data.data;
      } else {
        faixa = response.data;
      }
      
      return {
        success: true,
        data: faixa,
        message: 'Faixa de amostragem criada com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar faixa de amostragem'
      };
    }
  }

  async criarNQAAutomatico(codigo) {
    try {
      const response = await api.post('/plano-amostragem/tabela-amostragem/criar-nqa-automatico', {
        codigo
      });
      
      let nqa = null;
      if (response.data.data) {
        nqa = response.data.data;
      } else {
        nqa = response.data;
      }
      
      return {
        success: true,
        data: nqa,
        message: 'NQA criado automaticamente com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar NQA automaticamente'
      };
    }
  }

  async atualizarFaixa(id, data) {
    try {
      const response = await api.put(`/plano-amostragem/tabela-amostragem/${id}`, data);
      
      let faixa = null;
      if (response.data.data) {
        faixa = response.data.data;
      } else {
        faixa = response.data;
      }
      
      return {
        success: true,
        data: faixa,
        message: 'Faixa de amostragem atualizada com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar faixa de amostragem'
      };
    }
  }

  async excluirFaixa(id) {
    try {
      await api.delete(`/plano-amostragem/tabela-amostragem/${id}`);
      return {
        success: true,
        message: 'Faixa de amostragem excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir faixa de amostragem'
      };
    }
  }

  // ========== MÉTODOS GRUPOS ↔ NQA ==========

  async vincularGrupo(data) {
    try {
      const response = await api.post('/plano-amostragem/grupos-nqa', data);
      
      let vinculo = null;
      if (response.data.data) {
        vinculo = response.data.data;
      } else {
        vinculo = response.data;
      }
      
      return {
        success: true,
        data: vinculo,
        message: response.data.message || 'Grupo vinculado ao NQA com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao vincular grupo'
      };
    }
  }

  async desvincularGrupo(grupo_id) {
    try {
      await api.delete(`/plano-amostragem/grupos-nqa/${grupo_id}`);
      return {
        success: true,
        message: 'Grupo desvinculado do NQA com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao desvincular grupo'
      };
    }
  }

  async listarGruposPorNQA(nqa_id) {
    try {
      const response = await api.get(`/plano-amostragem/grupos-nqa/nqa/${nqa_id}`);
      
      let grupos = [];
      if (response.data.data) {
        if (response.data.data.items) {
          grupos = response.data.data.items;
        } else {
          grupos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        grupos = response.data;
      }
      
      return {
        success: true,
        data: grupos
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar grupos do NQA'
      };
    }
  }

  async listarTodosVinculos() {
    try {
      const response = await api.get('/plano-amostragem/grupos-nqa');
      
      let vinculos = [];
      if (response.data.data) {
        if (response.data.data.items) {
          vinculos = response.data.data.items;
        } else {
          vinculos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        vinculos = response.data;
      }
      
      return {
        success: true,
        data: vinculos
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar vínculos'
      };
    }
  }

  async buscarNQAPorGrupo(grupo_id) {
    try {
      const response = await api.get(`/plano-amostragem/grupos-nqa/grupo/${grupo_id}`);
      
      let vinculo = null;
      if (response.data.data) {
        vinculo = response.data.data;
      } else {
        vinculo = response.data;
      }
      
      return {
        success: true,
        data: vinculo
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar NQA do grupo'
      };
    }
  }
}

export default new PlanoAmostragemService();

