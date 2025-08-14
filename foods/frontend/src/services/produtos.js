import api from './api';

class ProdutosService {
  async listar(params = {}) {
    try {
      const response = await api.get('/produtos', { params });
      
      // Extrair dados da estrutura HATEOAS
      let produtos = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          produtos = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
          statistics = response.data.data._meta?.statistics;
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
        pagination: pagination || response.data.pagination,
        statistics: statistics || response.data.statistics
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
      // Se tem erros de validação, retornar eles
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        const validationMessages = error.response.data.errors.map(err => err.msg).join(', ');
        return {
          success: false,
          error: validationMessages,
          validationErrors: error.response.data.errors
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar produto',
        validationErrors: error.response?.data?.errors || []
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
      // Se tem erros de validação, retornar eles
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        const validationMessages = error.response.data.errors.map(err => err.msg).join(', ');
        return {
          success: false,
          error: validationMessages,
          validationErrors: error.response.data.errors
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar produto',
        validationErrors: error.response?.data?.errors || []
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
      const response = await api.get('/produtos/ativos');
      
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

  async buscarPorCodigo(codigo) {
    try {
      const response = await api.get(`/produtos/buscar/codigo/${codigo}`);
      
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
        error: error.response?.data?.message || 'Erro ao buscar produto por código'
      };
    }
  }

  async buscarSimilares(search, limit = 10) {
    try {
      const response = await api.get('/produtos/buscar/similar', {
        params: { search, limit }
      });
      
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
        error: error.response?.data?.message || 'Erro ao buscar produtos similares'
      };
    }
  }

  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/produtos/exportar/xlsx', {
        params,
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `produtos-${new Date().toISOString().split('T')[0]}.xlsx`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar produtos'
      };
    }
  }

  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/produtos/exportar/pdf', {
        params,
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `produtos-${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar produtos'
      };
    }
  }

  // Métodos auxiliares para carregar dados relacionados
  async getGrupos() {
    try {
      const response = await api.get('/grupos');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar grupos'
      };
    }
  }

  async getSubgrupos() {
    try {
      const response = await api.get('/subgrupos');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar subgrupos'
      };
    }
  }

  async getClasses() {
    try {
      const response = await api.get('/classes');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar classes'
      };
    }
  }

  async getUnidadesMedida() {
    try {
      const response = await api.get('/unidades');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar unidades de medida'
      };
    }
  }

  async getMarcas() {
    try {
      const response = await api.get('/marcas');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar marcas'
      };
    }
  }

  async getProdutosGenericos() {
    try {
      const response = await api.get('/produto-generico');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos genéricos'
      };
    }
  }
}

export default new ProdutosService(); 