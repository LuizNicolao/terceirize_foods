import api from './api';

/**
 * Service para Necessidades
 * Gerencia comunicação com a API de necessidades
 */
const necessidadesService = {
  /**
   * Listar necessidades com filtros e paginação
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/necessidades', { params });
      
      const responseData = response.data?.data || response.data || {};
      
      let items = [];
      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.items && Array.isArray(responseData.items)) {
        items = responseData.items;
      } else if (Array.isArray(responseData.data)) {
        items = responseData.data;
      }
      
      const paginationData = responseData.pagination || response.data?.pagination || null;
      
      const normalizedPagination = paginationData ? {
        currentPage: paginationData.page || paginationData.currentPage || 1,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.total || paginationData.totalItems || 0,
        itemsPerPage: paginationData.limit || paginationData.itemsPerPage || 20
      } : null;
      
      return {
        success: true,
        data: items,
        pagination: normalizedPagination,
        links: response.data?.links || null
      };
    } catch (error) {
      console.error('Erro ao listar necessidades:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar necessidades',
        data: []
      };
    }
  },

  /**
   * Buscar necessidade por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/necessidades/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data || null
      };
    } catch (error) {
      console.error('Erro ao buscar necessidade:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar necessidade',
        data: null
      };
    }
  },

  /**
   * Pré-visualizar necessidade (calcular sem salvar)
   */
  async previsualizar(dados) {
    try {
      const response = await api.post('/necessidades/previsualizar', dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Pré-visualização gerada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao pré-visualizar necessidade:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao pré-visualizar necessidade',
        data: null,
        mediasFaltantes: error.response?.data?.medias_faltantes || null
      };
    }
  },

  /**
   * Gerar e salvar necessidade
   */
  async gerar(dados) {
    try {
      const response = await api.post('/necessidades/gerar', dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Necessidade gerada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao gerar necessidade:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao gerar necessidade',
        data: null,
        necessidadeExistente: error.response?.data?.necessidade_existente || null,
        conflict: error.response?.status === 409,
        mediasFaltantes: error.response?.data?.medias_faltantes || null
      };
    }
  },

  /**
   * Recalcular necessidade existente
   */
  async recalcular(id, dados = {}) {
    try {
      const response = await api.post(`/necessidades/${id}/recalcular`, dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Necessidade recalculada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao recalcular necessidade:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao recalcular necessidade',
        data: null
      };
    }
  },

  /**
   * Excluir necessidade
   */
  async excluir(id) {
    try {
      const response = await api.delete(`/necessidades/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Necessidade excluída com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir necessidade:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir necessidade'
      };
    }
  },

  /**
   * Exportar necessidades em JSON
   */
  async exportarJSON(params = {}) {
    try {
      const response = await api.get('/necessidades/exportar/json', { params });
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao exportar necessidades:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar necessidades',
        data: []
      };
    }
  },

  /**
   * Exportar itens de necessidades em XLSX
   */
  async exportarXLSX(params = {}) {
    try {
      // Remover parâmetros vazios
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );

      const response = await api.get('/necessidades/exportar/xlsx', {
        params: cleanParams,
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo do header ou usar padrão
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'necessidades.xlsx';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar necessidades em XLSX'
      };
    }
  },

  /**
   * Exportar itens de necessidades em PDF
   */
  async exportarPDF(params = {}) {
    try {
      // Remover parâmetros vazios
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );

      const response = await api.get('/necessidades/exportar/pdf', {
        params: cleanParams,
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo do header ou usar padrão
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'necessidades.pdf';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar necessidades em PDF'
      };
    }
  }
};

export default necessidadesService;
