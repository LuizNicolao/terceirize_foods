/**
 * Service para Produto Genérico
 * Responsável pela comunicação com a API de produtos genéricos
 */

import api from './api';

class ProdutoGenericoService {
  async listar(params = {}) {
    try {
      const response = await api.get('/produto-generico', { params });
      
      // Extrair dados da estrutura HATEOAS
      let produtosGenericos = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          produtosGenericos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          produtosGenericos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        produtosGenericos = response.data;
      }
      
      // Extrair paginação
      if (response.data.pagination) {
        pagination = response.data.pagination;
      }
      
      // Extrair estatísticas
      console.log('Resposta completa da API:', response.data);
      if (response.data.statistics) {
        statistics = response.data.statistics;
        console.log('Estatísticas extraídas:', statistics);
      }
      
      return {
        success: true,
        data: produtosGenericos,
        pagination: pagination || response.data.pagination,
        statistics: statistics || response.data.statistics
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos genéricos'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/produto-generico/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let produtoGenerico = null;
      
      if (response.data.data) {
        produtoGenerico = response.data.data;
      } else {
        produtoGenerico = response.data;
      }
      
      return {
        success: true,
        data: produtoGenerico
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produto genérico'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/produto-generico', data);
      
      // Extrair dados da estrutura HATEOAS
      let produtoGenerico = null;
      
      if (response.data.data) {
        produtoGenerico = response.data.data;
      } else {
        produtoGenerico = response.data;
      }
      
      return {
        success: true,
        data: produtoGenerico,
        message: 'Produto genérico criado com sucesso!'
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
        error: error.response?.data?.message || 'Erro ao criar produto genérico',
        validationErrors: error.response?.data?.errors || []
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/produto-generico/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let produtoGenerico = null;
      
      if (response.data.data) {
        produtoGenerico = response.data.data;
      } else {
        produtoGenerico = response.data;
      }
      
      return {
        success: true,
        data: produtoGenerico,
        message: 'Produto genérico atualizado com sucesso!'
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
        error: error.response?.data?.message || 'Erro ao atualizar produto genérico',
        validationErrors: error.response?.data?.errors || []
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/produto-generico/${id}`);
      return {
        success: true,
        message: 'Produto genérico excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir produto genérico'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/produto-generico/ativos');
      
      // Extrair dados da estrutura HATEOAS
      let produtosGenericos = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          produtosGenericos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          produtosGenericos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        produtosGenericos = response.data;
      }
      
      return {
        success: true,
        data: produtosGenericos
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos genéricos ativos'
      };
    }
  }

  async buscarPadrao() {
    try {
      const response = await api.get('/produto-generico/padrao');
      
      // Extrair dados da estrutura HATEOAS
      let produtosGenericos = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          produtosGenericos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          produtosGenericos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        produtosGenericos = response.data;
      }
      
      return {
        success: true,
        data: produtosGenericos
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos genéricos padrão'
      };
    }
  }

  async buscarPorCodigo(codigo) {
    try {
      const response = await api.get(`/produto-generico/buscar/codigo/${codigo}`);
      
      // Extrair dados da estrutura HATEOAS
      let produtosGenericos = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          produtosGenericos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          produtosGenericos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        produtosGenericos = response.data;
      }
      
      return {
        success: true,
        data: produtosGenericos
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produto genérico por código'
      };
    }
  }

  async buscarSimilares(search, limit = 10) {
    try {
      const response = await api.get('/produto-generico/buscar/similar', {
        params: { search, limit }
      });
      
      // Extrair dados da estrutura HATEOAS
      let produtosGenericos = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          produtosGenericos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          produtosGenericos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        produtosGenericos = response.data;
      }
      
      return {
        success: true,
        data: produtosGenericos
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produtos genéricos similares'
      };
    }
  }

  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/produto-generico/exportar/xlsx', {
        params,
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `produtos-genericos-${new Date().toISOString().split('T')[0]}.xlsx`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar produtos genéricos'
      };
    }
  }

  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/produto-generico/exportar/pdf', {
        params,
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `produtos-genericos-${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar produtos genéricos'
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

  async getProdutosOrigem() {
    try {
      const response = await api.get('/produto-origem');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos origem'
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
}

export default new ProdutoGenericoService();
