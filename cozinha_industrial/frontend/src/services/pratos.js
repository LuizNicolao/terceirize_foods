import api from './api';

/**
 * Service para Pratos
 * Gerencia comunicação com a API de pratos
 */
const pratosService = {
  /**
   * Listar pratos com filtros e paginação
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/pratos', { params });
      const paginationData = response.data?.data?.pagination || response.data?.pagination || null;
      
      // Normalizar dados de paginação para o formato esperado pelo frontend
      const normalizedPagination = paginationData ? {
        currentPage: paginationData.page || paginationData.currentPage || 1,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.total || paginationData.totalItems || 0,
        itemsPerPage: paginationData.limit || paginationData.itemsPerPage || 20
      } : null;
      
      return {
        success: true,
        data: response.data?.data?.items || response.data?.data || response.data || [],
        pagination: normalizedPagination,
        links: response.data?.links || null
      };
    } catch (error) {
      console.error('Erro ao listar pratos:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar pratos',
        data: []
      };
    }
  },

  /**
   * Buscar prato por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/pratos/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data || null
      };
    } catch (error) {
      console.error('Erro ao buscar prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar prato',
        data: null
      };
    }
  },

  /**
   * Criar novo prato
   */
  async criar(dados) {
    try {
      const response = await api.post('/pratos', dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Prato criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar prato',
        data: null
      };
    }
  },

  /**
   * Atualizar prato
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/pratos/${id}`, dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Prato atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar prato',
        data: null
      };
    }
  },

  /**
   * Excluir prato
   */
  async excluir(id) {
    try {
      const response = await api.delete(`/pratos/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Prato excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir prato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir prato'
      };
    }
  },

  /**
   * Exportar pratos em JSON
   */
  async exportarJson() {
    try {
      const response = await api.get('/pratos/exportar/json');
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao exportar pratos:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar pratos',
        data: []
      };
    }
  },

  /**
   * Exportar pratos em XLSX
   */
  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/pratos/exportar/xlsx', {
        params,
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo do header ou usar padrão
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'pratos.xlsx';
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
        error: error.response?.data?.message || 'Erro ao exportar pratos em XLSX'
      };
    }
  },

  /**
   * Exportar pratos em PDF
   */
  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/pratos/exportar/pdf', {
        params,
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo do header ou usar padrão
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'pratos.pdf';
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
        error: error.response?.data?.message || 'Erro ao exportar pratos em PDF'
      };
    }
  },

  /**
   * Baixar modelo de planilha para importação
   */
  async baixarModelo() {
    try {
      const response = await api.get('/pratos/importar/modelo', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modelo_pratos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao baixar modelo de planilha'
      };
    }
  },

  /**
   * Importar pratos via arquivo Excel
   */
  async importar(formData) {
    try {
      const response = await api.post('/pratos/importar', formData);
      
      return {
        success: true,
        data: response.data?.data || response.data || {}
      };
    } catch (error) {
      console.error('Erro na importação:', error);
      
      let errorMessage = 'Erro na importação';
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = typeof error.response.data.error === 'string' 
            ? error.response.data.error 
            : (error.response.data.error?.message || JSON.stringify(error.response.data.error));
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        data: error.response?.data?.data || null
      };
    }
  }
};

export default pratosService;

