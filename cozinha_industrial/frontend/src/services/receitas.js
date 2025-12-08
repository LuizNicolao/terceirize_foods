import api from './api';

class ReceitasService {
  async listar(params = {}) {
    try {
      const response = await api.get('/receitas', { params });
      
      // Extrair dados da estrutura HATEOAS
      let receitas = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          receitas = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          receitas = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        receitas = response.data;
      }
      
      return {
        success: true,
        data: receitas,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar receitas'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/receitas/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let receita = null;
      
      if (response.data.data) {
        receita = response.data.data;
      } else {
        receita = response.data;
      }
      
      return {
        success: true,
        data: receita
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar receita'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/receitas', data);
      
      // Extrair dados da estrutura HATEOAS
      let receita = null;
      
      if (response.data.data) {
        receita = response.data.data;
      } else {
        receita = response.data;
      }
      
      return {
        success: true,
        data: receita,
        message: 'Receita criada com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar receita'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/receitas/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let receita = null;
      
      if (response.data.data) {
        receita = response.data.data;
      } else {
        receita = response.data;
      }
      
      return {
        success: true,
        data: receita,
        message: 'Receita atualizada com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar receita'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/receitas/${id}`);
      return {
        success: true,
        message: 'Receita excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir receita'
      };
    }
  }

  async exportarJSON() {
    try {
      const response = await api.get('/receitas/exportar/json', {
        responseType: 'blob'
      });
      
      // Criar link de download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receitas_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return {
        success: true,
        message: 'Receitas exportadas com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao exportar receitas'
      };
    }
  }
}

export default new ReceitasService();

