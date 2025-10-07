import api from './api';

class UnidadesEscolaresService {
  static async listar(params = {}) {
    try {
      const response = await api.get('/unidades-escolares', { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        filters: response.data.filters || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar unidades escolares',
        data: []
      };
    }
  }

  static async buscarPorId(id) {
    try {
      const response = await api.get(`/unidades-escolares/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidade escolar'
      };
    }
  }

  static async criar(data) {
    try {
      const response = await api.post('/unidades-escolares', data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Unidade escolar criada com sucesso!'
      };
    } catch (error) {
      // Capturar erros de validação do backend
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar unidade escolar'
      };
    }
  }

  static async atualizar(id, data) {
    try {
      const response = await api.put(`/unidades-escolares/${id}`, data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Unidade escolar atualizada com sucesso!'
      };
    } catch (error) {
      // Capturar erros de validação do backend
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar unidade escolar'
      };
    }
  }

  static async excluir(id) {
    try {
      const response = await api.delete(`/unidades-escolares/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Unidade escolar excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao excluir unidade escolar'
      };
    }
  }

  // Métodos de Busca
  static async buscarDisponiveisPorFilial(filialId) {
    try {
      const response = await api.get(`/unidades-escolares/disponiveis/filial/${filialId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidades disponíveis por filial',
        data: []
      };
    }
  }

  // Métodos de Importação
  static async importarPlanilha(formData) {
    try {
      const response = await api.post('/unidades-escolares/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Importação realizada com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.error || 'Erro na validação',
          message: error.response?.data?.message || 'Erro na validação da planilha',
          details: error.response?.data?.details || null,
          errorsByRow: error.response?.data?.errorsByRow || null,
          validationErrors: error.response?.data?.validationErrors || [],
          totalErrors: error.response?.data?.totalErrors || 0,
          affectedRows: error.response?.data?.affectedRows || 0
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao importar planilha',
        message: error.response?.data?.message || 'Erro ao importar planilha'
      };
    }
  }

  static async downloadTemplate() {
    try {
      const response = await api.get('/unidades-escolares/importar/template', {
        responseType: 'blob',
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao baixar template'
      };
    }
  }

  static async buscarAtivas() {
    try {
      const response = await api.get('/unidades-escolares/ativas/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidades escolares ativas',
        data: []
      };
    }
  }

  static async buscarEstatisticas() {
    try {
      const response = await api.get('/unidades-escolares/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao carregar estatísticas'
      };
    }
  }

  static async buscarPorEstado(estado) {
    try {
      const response = await api.get(`/unidades-escolares/estado/${estado}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidades escolares por estado',
        data: []
      };
    }
  }

  static async buscarPorRota(rotaId) {
    try {
      const response = await api.get(`/unidades-escolares/rota/${rotaId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidades escolares por rota',
        data: []
      };
    }
  }

  static async buscarPorIds(ids) {
    try {
      const response = await api.post('/unidades-escolares/buscar-por-ids', { ids });
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidades escolares por IDs',
        data: []
      };
    }
  }

  static async listarEstados() {
    try {
      const response = await api.get('/unidades-escolares/estados/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar estados',
        data: []
      };
    }
  }

  static async listarCentrosDistribuicao() {
    try {
      const response = await api.get('/unidades-escolares/centros-distribuicao/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar centros de distribuição',
        data: []
      };
    }
  }

  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/unidades-escolares/export/pdf', { 
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao exportar dados'
      };
    }
  }

  // Métodos para Almoxarifado
  static async buscarAlmoxarifado(unidadeEscolarId) {
    try {
      const response = await api.get(`/unidades-escolares/${unidadeEscolarId}/almoxarifado`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Almoxarifado não encontrado'
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar almoxarifado'
      };
    }
  }

  static async criarAlmoxarifado(unidadeEscolarId, data) {
    try {
      const response = await api.post(`/unidades-escolares/${unidadeEscolarId}/almoxarifado`, data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Almoxarifado criado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar almoxarifado'
      };
    }
  }

  static async atualizarAlmoxarifado(id, data) {
    try {
      const response = await api.put(`/unidades-escolares/almoxarifado/${id}`, data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Almoxarifado atualizado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar almoxarifado'
      };
    }
  }

  static async excluirAlmoxarifado(id) {
    try {
      const response = await api.delete(`/unidades-escolares/almoxarifado/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Almoxarifado excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao excluir almoxarifado'
      };
    }
  }

  // ===== MÉTODOS PARA TIPOS DE CARDÁPIO =====

  static async getTiposCardapio(unidadeId) {
    try {
      const response = await api.get(`/unidades-escolares/${unidadeId}/tipos-cardapio`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar tipos de cardápio da unidade',
        data: []
      };
    }
  }

  static async vincularTipoCardapio(unidadeId, tipoId) {
    try {
      const response = await api.post(`/unidades-escolares/${unidadeId}/tipos-cardapio`, {
        tipo_cardapio_id: tipoId
      });
      return {
        success: true,
        data: response.data.data,
        message: 'Tipo de cardápio vinculado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao vincular tipo de cardápio'
      };
    }
  }

  static async desvincularTipoCardapio(unidadeId, tipoId) {
    try {
      const response = await api.delete(`/unidades-escolares/${unidadeId}/tipos-cardapio/${tipoId}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Tipo de cardápio desvinculado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao desvincular tipo de cardápio'
      };
    }
  }

  // ===== MÉTODOS PARA PERÍODOS DE REFEIÇÃO =====

  static async getPeriodosRefeicao(unidadeId) {
    try {
      const response = await api.get(`/unidades-escolares/${unidadeId}/periodos-refeicao`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar períodos de refeição da unidade',
        data: []
      };
    }
  }

  static async vincularPeriodoRefeicao(unidadeId, periodoId, quantidadeEfetivosPadrao = 0, quantidadeEfetivosNae = 0) {
    try {
      const response = await api.post(`/unidades-escolares/${unidadeId}/periodos-refeicao`, {
        periodo_refeicao_id: periodoId,
        quantidade_efetivos_padrao: quantidadeEfetivosPadrao,
        quantidade_efetivos_nae: quantidadeEfetivosNae
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao vincular período de refeição'
      };
    }
  }

  static async atualizarQuantidadesEfetivos(unidadeId, periodoId, quantidadeEfetivosPadrao, quantidadeEfetivosNae) {
    try {
      const response = await api.put(`/unidades-escolares/${unidadeId}/periodos-refeicao/${periodoId}/quantidades`, {
        quantidade_efetivos_padrao: quantidadeEfetivosPadrao,
        quantidade_efetivos_nae: quantidadeEfetivosNae
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar quantidades de efetivos'
      };
    }
  }

  static async desvincularPeriodoRefeicao(unidadeId, periodoId) {
    try {
      const response = await api.delete(`/unidades-escolares/${unidadeId}/periodos-refeicao/${periodoId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao desvincular período de refeição'
      };
    }
  }
}

export default UnidadesEscolaresService; 