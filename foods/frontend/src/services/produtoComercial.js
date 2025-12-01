/**
 * Service para Produto Comercial
 * Gerencia todas as operações de API relacionadas a produtos comerciais
 */

import api from './api';

class ProdutoComercialService {
  async listar(params = {}) {
    try {
      const response = await api.get('/produto-comercial', { params });
      
      // Extrair dados da estrutura HATEOAS
      let produtosComerciais = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          produtosComerciais = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
          statistics = response.data.data._meta?.statistics;
        } else {
          // Se data é diretamente um array
          produtosComerciais = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        produtosComerciais = response.data;
      }
      
      // Se não conseguiu extrair paginação da estrutura HATEOAS, usar diretamente da resposta
      if (!pagination && response.data.pagination) {
        pagination = response.data.pagination;
      }
      if (!statistics && response.data.statistics) {
        statistics = response.data.statistics;
      }
      
      
      return {
        success: true,
        data: produtosComerciais,
        pagination: pagination || response.data.pagination,
        statistics: statistics || response.data.statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar produtos comerciais'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/produto-comercial/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let produtoComercial = null;
      
      if (response.data.data) {
        produtoComercial = response.data.data;
      } else {
        produtoComercial = response.data;
      }
      
      return {
        success: true,
        data: produtoComercial
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar produto comercial'
      };
    }
  }

  async obterProximoCodigo() {
    try {
      const response = await api.get('/produto-comercial/proximo-codigo');
      
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
      const response = await api.post('/produto-comercial', data);
      
      // Extrair dados da estrutura HATEOAS
      let produtoComercial = null;
      
      if (response.data.data) {
        produtoComercial = response.data.data;
      } else {
        produtoComercial = response.data;
      }
      
      return {
        success: true,
        data: produtoComercial,
        message: 'Produto comercial criado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar produto comercial'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/produto-comercial/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let produtoComercial = null;
      
      if (response.data.data) {
        produtoComercial = response.data.data;
      } else {
        produtoComercial = response.data;
      }
      
      return {
        success: true,
        data: produtoComercial,
        message: 'Produto comercial atualizado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar produto comercial'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/produto-comercial/${id}`);
      return {
        success: true,
        message: 'Produto comercial excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir produto comercial'
      };
    }
  }
}

export default new ProdutoComercialService();

