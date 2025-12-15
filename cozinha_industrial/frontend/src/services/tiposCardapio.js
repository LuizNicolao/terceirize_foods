import api from './api';

/**
 * Service para Tipos de Cardápio
 * Gerencia comunicação com a API de tipos de cardápio
 */
const tiposCardapioService = {
  /**
   * Listar tipos de cardápio com filtros e paginação
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/tipos-cardapio', { params });
      
      // O backend retorna: { success: true, data: { items: [...], pagination: {...} } }
      const responseData = response.data?.data || response.data || {};
      
      // Extrair items e pagination
      let items = [];
      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.items && Array.isArray(responseData.items)) {
        items = responseData.items;
      } else if (Array.isArray(responseData.data)) {
        items = responseData.data;
      }
      
      const paginationData = responseData.pagination || response.data?.pagination || null;
      
      // Normalizar dados de paginação para o formato esperado pelo frontend
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
      console.error('Erro ao listar tipos de cardápio:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar tipos de cardápio',
        data: []
      };
    }
  },

  /**
   * Buscar tipo de cardápio por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/tipos-cardapio/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data || null
      };
    } catch (error) {
      console.error('Erro ao buscar tipo de cardápio:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar tipo de cardápio',
        data: null
      };
    }
  },

  /**
   * Buscar unidades vinculadas a um tipo de cardápio
   */
  async buscarUnidadesVinculadas(id) {
    try {
      const response = await api.get(`/tipos-cardapio/${id}/unidades`);
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao buscar unidades vinculadas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar unidades vinculadas',
        data: []
      };
    }
  },

  /**
   * Buscar produtos vinculados a um tipo de cardápio
   */
  async buscarProdutosVinculados(id) {
    try {
      const response = await api.get(`/tipos-cardapio/${id}/produtos`);
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao buscar produtos vinculados:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produtos vinculados',
        data: []
      };
    }
  },

  /**
   * Criar novo tipo de cardápio
   */
  async criar(dados) {
    try {
      const response = await api.post('/tipos-cardapio', dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Tipo de cardápio criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar tipo de cardápio:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null) ||
                          'Erro ao criar tipo de cardápio';
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  /**
   * Atualizar tipo de cardápio
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/tipos-cardapio/${id}`, dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Tipo de cardápio atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar tipo de cardápio:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar tipo de cardápio',
        data: null
      };
    }
  },

  /**
   * Excluir tipo de cardápio
   */
  async excluir(id) {
    try {
      const response = await api.delete(`/tipos-cardapio/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Tipo de cardápio excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir tipo de cardápio:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir tipo de cardápio'
      };
    }
  },

  /**
   * Exportar tipos de cardápio em JSON
   */
  async exportarJson() {
    try {
      const response = await api.get('/tipos-cardapio/exportar/json');
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao exportar tipos de cardápio:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar tipos de cardápio',
        data: []
      };
    }
  },

  /**
   * Exportar tipos de cardápio em XLSX
   */
  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/tipos-cardapio/exportar/xlsx', {
        params,
        responseType: 'blob'
      });
      
      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `tipos_cardapio_${new Date().toISOString().split('T')[0]}.xlsx`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'Exportação realizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao exportar tipos de cardápio para XLSX:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar tipos de cardápio para XLSX'
      };
    }
  },

  /**
   * Exportar tipos de cardápio em PDF
   */
  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/tipos-cardapio/exportar/pdf', {
        params,
        responseType: 'blob'
      });
      
      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `tipos_cardapio_${new Date().toISOString().split('T')[0]}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'Exportação realizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao exportar tipos de cardápio para PDF:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar tipos de cardápio para PDF'
      };
    }
  },

  /**
   * Buscar todos os tipos de cardápio vinculados a uma lista de unidades
   */
  async buscarTiposCardapioPorUnidades(unidadesIds, includeInactive = false) {
    try {
      const params = new URLSearchParams();
      if (Array.isArray(unidadesIds)) {
        unidadesIds.forEach(id => params.append('unidades_ids[]', id));
      } else {
        params.append('unidades_ids[]', unidadesIds);
      }
      if (includeInactive) {
        params.append('include_inactive', 'true');
      }

      const response = await api.get(`/tipos-cardapio/unidades?${params.toString()}`);
      return {
        success: true,
        data: response.data?.data || response.data || { vinculos: {}, tipos_cardapio: [] }
      };
    } catch (error) {
      console.error('Erro ao buscar tipos de cardápio por unidades:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar tipos de cardápio por unidades',
        data: { vinculos: {}, tipos_cardapio: [] }
      };
    }
  }
};

export default tiposCardapioService;

