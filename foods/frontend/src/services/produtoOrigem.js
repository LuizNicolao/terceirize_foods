/**
 * Service para Produto Origem
 * Gerencia todas as operações de API relacionadas a produtos origem
 */

import api from './api';

class ProdutoOrigemService {
  async listar(params = {}) {
    try {
      const response = await api.get('/produto-origem', { params });
      
      // Extrair dados da estrutura HATEOAS
      let produtosOrigem = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          produtosOrigem = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
          statistics = response.data.data._meta?.statistics;
        } else {
          // Se data é diretamente um array
          produtosOrigem = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        produtosOrigem = response.data;
      }
      
      return {
        success: true,
        data: produtosOrigem,
        pagination: pagination || response.data.pagination,
        statistics: statistics || response.data.statistics
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos origem'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/produto-origem/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let produtoOrigem = null;
      
      if (response.data.data) {
        produtoOrigem = response.data.data;
      } else {
        produtoOrigem = response.data;
      }
      
      return {
        success: true,
        data: produtoOrigem
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produto origem'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/produto-origem', data);
      
      // Extrair dados da estrutura HATEOAS
      let produtoOrigem = null;
      
      if (response.data.data) {
        produtoOrigem = response.data.data;
      } else {
        produtoOrigem = response.data;
      }
      
      return {
        success: true,
        data: produtoOrigem,
        message: 'Produto origem criado com sucesso!'
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
        error: error.response?.data?.message || 'Erro ao criar produto origem',
        validationErrors: error.response?.data?.errors || []
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/produto-origem/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let produtoOrigem = null;
      
      if (response.data.data) {
        produtoOrigem = response.data.data;
      } else {
        produtoOrigem = response.data;
      }
      
      return {
        success: true,
        data: produtoOrigem,
        message: 'Produto origem atualizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar produto origem'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/produto-origem/${id}`);
      return {
        success: true,
        message: 'Produto origem excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir produto origem'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/produto-origem/ativos');
      
      // Extrair dados da estrutura HATEOAS
      let produtosOrigem = [];
      
      if (response.data.data) {
        produtosOrigem = response.data.data;
      } else if (Array.isArray(response.data)) {
        produtosOrigem = response.data;
      }
      
      return {
        success: true,
        data: produtosOrigem
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produtos origem ativos'
      };
    }
  }

  async buscarPorCodigo(codigo) {
    try {
      const response = await api.get(`/produto-origem/codigo/${codigo}`);
      
      // Extrair dados da estrutura HATEOAS
      let produtoOrigem = null;
      
      if (response.data.data) {
        produtoOrigem = response.data.data;
      } else {
        produtoOrigem = response.data;
      }
      
      return {
        success: true,
        data: produtoOrigem
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produto origem por código'
      };
    }
  }

  // Métodos de exportação
  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/produto-origem/export/xlsx', { 
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
        error: 'Erro ao exportar para XLSX'
      };
    }
  }

  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/produto-origem/export/pdf', { 
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
        error: 'Erro ao exportar para PDF'
      };
    }
  }
}

export default new ProdutoOrigemService();
