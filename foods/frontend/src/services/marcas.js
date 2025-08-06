import api from './api';

class MarcasService {
  /**
   * Listar marcas com paginação e filtros
   */
  static async listar(params = {}) {
    try {
      const response = await api.get('/marcas', { params });
      
      // Extrair dados da estrutura HATEOAS
      let marcas = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          marcas = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          marcas = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        marcas = response.data;
      }
      
      return {
        success: true,
        data: marcas,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar marcas'
      };
    }
  }

  /**
   * Buscar marca por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/marcas/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let marca = null;
      
      if (response.data.data) {
        marca = response.data.data;
      } else {
        marca = response.data;
      }
      
      return {
        success: true,
        data: marca
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar marca'
      };
    }
  }

  /**
   * Criar nova marca
   */
  static async criar(data) {
    try {
      const response = await api.post('/marcas', data);
      
      // Extrair dados da estrutura HATEOAS
      let marca = null;
      
      if (response.data.data) {
        marca = response.data.data;
      } else {
        marca = response.data;
      }
      
      return {
        success: true,
        data: marca,
        message: 'Marca criada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar marca'
      };
    }
  }

  /**
   * Atualizar marca
   */
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/marcas/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let marca = null;
      
      if (response.data.data) {
        marca = response.data.data;
      } else {
        marca = response.data;
      }
      
      return {
        success: true,
        data: marca,
        message: 'Marca atualizada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar marca'
      };
    }
  }

  /**
   * Excluir marca
   */
  static async excluir(id) {
    try {
      await api.delete(`/marcas/${id}`);
      return {
        success: true,
        message: 'Marca excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir marca'
      };
    }
  }

  /**
   * Buscar marcas ativas
   */
  static async buscarAtivas(params = {}) {
    try {
      const response = await api.get('/marcas', { params: { ...params, status: 1 } });
      
      // Extrair dados da estrutura HATEOAS
      let marcas = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          marcas = response.data.data.items;
        } else {
          // Se data é diretamente um array
          marcas = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        marcas = response.data;
      }
      
      return {
        success: true,
        data: marcas
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar marcas ativas'
      };
    }
  }

  /**
   * Exportar marcas para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/marcas/export/xlsx', { 
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
        error: 'Erro ao exportar XLSX'
      };
    }
  }

  /**
   * Exportar marcas para PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/marcas/export/pdf', { 
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
        error: 'Erro ao exportar PDF'
      };
    }
  }
}

export default MarcasService; 