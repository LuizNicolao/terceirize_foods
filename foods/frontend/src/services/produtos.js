import api from './api';

class ProdutosService {
  async listar(params = {}) {
    try {
      const response = await api.get('/produtos', { params });
      
      // Extrair dados da estrutura HATEOAS
      let produtos = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          produtos = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          produtos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        produtos = response.data;
      }
      
      return {
        success: true,
        data: produtos,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/produtos/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let produto = null;
      
      if (response.data.data) {
        produto = response.data.data;
      } else {
        produto = response.data;
      }
      
      return {
        success: true,
        data: produto
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produto'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/produtos', data);
      
      // Extrair dados da estrutura HATEOAS
      let produto = null;
      
      if (response.data.data) {
        produto = response.data.data;
      } else {
        produto = response.data;
      }
      
      return {
        success: true,
        data: produto,
        message: 'Produto criado com sucesso!'
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
        error: error.response?.data?.error || 'Erro ao criar produto'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/produtos/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let produto = null;
      
      if (response.data.data) {
        produto = response.data.data;
      } else {
        produto = response.data;
      }
      
      return {
        success: true,
        data: produto,
        message: 'Produto atualizado com sucesso!'
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
        error: error.response?.data?.error || 'Erro ao atualizar produto'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/produtos/${id}`);
      return {
        success: true,
        message: 'Produto excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir produto'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/produtos', { params: { status: 1 } });
      
      // Extrair dados da estrutura HATEOAS
      let produtos = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          produtos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          produtos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        produtos = response.data;
      }
      
      return {
        success: true,
        data: produtos
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos ativos'
      };
    }
  }

  async exportarXLSX() {
    try {
      const response = await api.get('/produtos/export/xlsx', {
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

  async exportarPDF() {
    try {
      const response = await api.get('/produtos/export/pdf', {
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

  async imprimirPDF(id) {
    try {
      const response = await api.get(`/produtos/${id}/pdf`, {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao imprimir produto'
      };
    }
  }
}

export default new ProdutosService(); 