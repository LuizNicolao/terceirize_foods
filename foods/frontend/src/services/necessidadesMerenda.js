import api from './api';

class NecessidadesMerendaService {
  // Listar necessidades com paginação, busca e filtros
  static async listar(params = {}) {
    try {
      const response = await api.get('/necessidades-merenda', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar necessidades:', error);
      return {
        success: false,
        error: 'Erro ao carregar necessidades'
      };
    }
  }

  // Buscar necessidade por ID
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/necessidades-merenda/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar necessidade:', error);
      return {
        success: false,
        error: 'Erro ao carregar necessidade'
      };
    }
  }

  // Criar nova necessidade
  static async criar(data) {
    try {
      const response = await api.post('/necessidades-merenda', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar necessidade:', error);
      return {
        success: false,
        error: 'Erro ao criar necessidade'
      };
    }
  }

  // Atualizar necessidade
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/necessidades-merenda/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar necessidade:', error);
      return {
        success: false,
        error: 'Erro ao atualizar necessidade'
      };
    }
  }

  // Excluir necessidade
  static async excluir(id) {
    try {
      const response = await api.delete(`/necessidades-merenda/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir necessidade:', error);
      return {
        success: false,
        error: 'Erro ao excluir necessidade'
      };
    }
  }

  // Gerar necessidades a partir de PDF
  static async gerarDePDF(formData) {
    try {
      
      const response = await api.post('/necessidades-merenda/gerar-de-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // Aumentar timeout para 30 segundos
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar necessidades de PDF:', error);
      return {
        success: false,
        error: 'Erro ao processar PDF e gerar necessidades'
      };
    }
  }

  // Gerar necessidades a partir de cardápio existente
  static async gerarDeCardapio(cardapioId, data) {
    try {
      const response = await api.post(`/necessidades-merenda/gerar-de-cardapio/${cardapioId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar necessidades de cardápio:', error);
      return {
        success: false,
        error: 'Erro ao gerar necessidades do cardápio'
      };
    }
  }

  // Alterar status de múltiplas necessidades
  static async alterarStatus(ids, status, observacoes = '') {
    try {
      const response = await api.patch('/necessidades-merenda/alterar-status', {
        ids,
        status,
        observacoes
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      return {
        success: false,
        error: 'Erro ao alterar status das necessidades'
      };
    }
  }

  // Exportar necessidades para Excel
  static async exportarExcel(params = {}) {
    try {
      const response = await api.get('/necessidades-merenda/exportar/excel', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      return {
        success: false,
        error: 'Erro ao exportar necessidades para Excel'
      };
    }
  }

  // Exportar necessidades para PDF
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/necessidades-merenda/exportar/pdf', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return {
        success: false,
        error: 'Erro ao exportar necessidades para PDF'
      };
    }
  }

  // Exportar lista de compras
  static async exportarListaCompras(params = {}) {
    try {
      const response = await api.get('/necessidades-merenda/exportar/lista-compras', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar lista de compras:', error);
      return {
        success: false,
        error: 'Erro ao exportar lista de compras'
      };
    }
  }

  // Buscar estatísticas
  static async buscarEstatisticas() {
    try {
      const response = await api.get('/necessidades-merenda/estatisticas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        success: false,
        error: 'Erro ao carregar estatísticas'
      };
    }
  }

  // Buscar histórico de alterações
  static async buscarHistorico(necessidadeId) {
    try {
      const response = await api.get(`/necessidades-merenda/${necessidadeId}/historico`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return {
        success: false,
        error: 'Erro ao carregar histórico'
      };
    }
  }

  // Buscar unidades escolares para filtros
  static async buscarUnidadesEscolares() {
    try {
      const response = await api.get('/unidades-escolares');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar unidades escolares:', error);
      return {
        success: false,
        error: 'Erro ao carregar unidades escolares'
      };
    }
  }

  // Buscar produtos para seleção
  static async buscarProdutos(params = {}) {
    try {
      const response = await api.get('/produtos', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return {
        success: false,
        error: 'Erro ao carregar produtos'
      };
    }
  }

  // Buscar receitas para seleção
  static async buscarReceitas(params = {}) {
    try {
      const response = await api.get('/receitas', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      return {
        success: false,
        error: 'Erro ao carregar receitas'
      };
    }
  }

  // Buscar cardápios para seleção
  static async buscarCardapios(params = {}) {
    try {
      const response = await api.get('/cardapios-gerados', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cardápios:', error);
      return {
        success: false,
        error: 'Erro ao carregar cardápios'
      };
    }
  }

  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/necessidades-merenda/export/xlsx', { params, responseType: 'blob' });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erro ao exportar dados' };
    }
  }

  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/necessidades-merenda/export/pdf', { params, responseType: 'blob' });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erro ao exportar dados' };
    }
  }
}

export default NecessidadesMerendaService;
