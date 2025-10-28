import api from './api';

class GruposService {
  async listar(params = {}) {
    try {
      const response = await api.get('/grupos', { params });
      
      console.log('🔍 GRUPOS API RESPONSE:', {
        status: response.status,
        fullData: response.data,
        data: response.data.data,
        pagination: response.data.pagination,
        meta: response.data._meta
      });
      
      // Extrair dados da estrutura HATEOAS
      let grupos = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          grupos = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          grupos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        grupos = response.data;
      }
      
      console.log('🔍 GRUPOS PROCESSED:', {
        grupos: grupos.length,
        pagination: pagination || response.data.pagination
      });
      
      return {
        success: true,
        data: grupos,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar grupos'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/grupos/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let grupo = null;
      
      if (response.data.data) {
        grupo = response.data.data;
      } else {
        grupo = response.data;
      }
      
      return {
        success: true,
        data: grupo
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar grupo'
      };
    }
  }

  async obterProximoCodigo() {
    try {
      const response = await api.get('/grupos/proximo-codigo');
      
      // Extrair dados da estrutura HATEOAS
      let data = null;
      
      if (response.data.data) {
        data = response.data.data;
      } else {
        data = response.data;
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter próximo código'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/grupos', data);
      
      // Extrair dados da estrutura HATEOAS
      let grupo = null;
      
      if (response.data.data) {
        grupo = response.data.data;
      } else {
        grupo = response.data;
      }
      
      return {
        success: true,
        data: grupo,
        message: 'Grupo criado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar grupo'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/grupos/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let grupo = null;
      
      if (response.data.data) {
        grupo = response.data.data;
      } else {
        grupo = response.data;
      }
      
      return {
        success: true,
        data: grupo,
        message: 'Grupo atualizado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar grupo'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/grupos/${id}`);
      return {
        success: true,
        message: 'Grupo excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir grupo'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/grupos/ativos');
      
      // Extrair dados da estrutura HATEOAS
      let grupos = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          grupos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          grupos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        grupos = response.data;
      }
      
      return {
        success: true,
        data: grupos
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar grupos ativos'
      };
    }
  }

  async exportarXLSX() {
    try {
      const response = await api.get('/grupos/export/xlsx', {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao exportar XLSX'
      };
    }
  }

  async exportarPDF() {
    try {
      const response = await api.get('/grupos/export/pdf', {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao exportar PDF'
      };
    }
  }
}

export default new GruposService(); 