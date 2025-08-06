import api from './api';

class UnidadesService {
  /**
   * Listar unidades com paginação e filtros
   */
  static async listar(params = {}) {
    try {
      const response = await api.get('/unidades', { params });
      
      // Extrair dados da estrutura HATEOAS
      let unidades = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          unidades = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          unidades = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        unidades = response.data;
      }
      
      return {
        success: true,
        data: unidades,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar unidades'
      };
    }
  }

  /**
   * Buscar unidade por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/unidades/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let unidade = null;
      
      if (response.data.data) {
        unidade = response.data.data;
      } else {
        unidade = response.data;
      }
      
      return {
        success: true,
        data: unidade
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar unidade'
      };
    }
  }

  /**
   * Criar nova unidade
   */
  static async criar(data) {
    try {
      const response = await api.post('/unidades', data);
      
      // Extrair dados da estrutura HATEOAS
      let unidade = null;
      
      if (response.data.data) {
        unidade = response.data.data;
      } else {
        unidade = response.data;
      }
      
      return {
        success: true,
        data: unidade,
        message: 'Unidade criada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar unidade'
      };
    }
  }

  /**
   * Atualizar unidade
   */
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/unidades/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let unidade = null;
      
      if (response.data.data) {
        unidade = response.data.data;
      } else {
        unidade = response.data;
      }
      
      return {
        success: true,
        data: unidade,
        message: 'Unidade atualizada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar unidade'
      };
    }
  }

  /**
   * Excluir unidade
   */
  static async excluir(id) {
    try {
      await api.delete(`/unidades/${id}`);
      return {
        success: true,
        message: 'Unidade excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir unidade'
      };
    }
  }

  /**
   * Buscar unidades ativas
   */
  static async buscarAtivas(params = {}) {
    try {
      const response = await api.get('/unidades', { params: { ...params, status: 1 } });
      
      // Extrair dados da estrutura HATEOAS
      let unidades = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          unidades = response.data.data.items;
        } else {
          // Se data é diretamente um array
          unidades = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        unidades = response.data;
      }
      
      return {
        success: true,
        data: unidades
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar unidades ativas'
      };
    }
  }

  /**
   * Exportar unidades para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/unidades/export/xlsx', { 
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
   * Exportar unidades para PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/unidades/export/pdf', { 
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

export default UnidadesService; 