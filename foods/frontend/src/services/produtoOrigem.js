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
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar produto origem'
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

  // Métodos para dados auxiliares
  async listarGrupos() {
    try {
      const response = await api.get('/produto-origem/grupos');
      
      // Extrair dados da estrutura HATEOAS
      let grupos = [];
      
      if (response.data.data) {
        grupos = response.data.data;
      } else if (Array.isArray(response.data)) {
        grupos = response.data;
      }
      
      return grupos;
    } catch (error) {
      console.error('Erro ao listar grupos:', error);
      return [];
    }
  }

  async listarSubgrupos() {
    try {
      const response = await api.get('/produto-origem/subgrupos');
      
      // Extrair dados da estrutura HATEOAS
      let subgrupos = [];
      
      if (response.data.data) {
        subgrupos = response.data.data;
      } else if (Array.isArray(response.data)) {
        subgrupos = response.data;
      }
      
      return subgrupos;
    } catch (error) {
      console.error('Erro ao listar subgrupos:', error);
      return [];
    }
  }

  async listarClasses() {
    try {
      const response = await api.get('/produto-origem/classes');
      
      // Extrair dados da estrutura HATEOAS
      let classes = [];
      
      if (response.data.data) {
        classes = response.data.data;
      } else if (Array.isArray(response.data)) {
        classes = response.data;
      }
      
      return classes;
    } catch (error) {
      console.error('Erro ao listar classes:', error);
      return [];
    }
  }

  async listarUnidadesMedida() {
    try {
      const response = await api.get('/produto-origem/unidades-medida');
      
      // Extrair dados da estrutura HATEOAS
      let unidades = [];
      
      if (response.data.data) {
        unidades = response.data.data;
      } else if (Array.isArray(response.data)) {
        unidades = response.data;
      }
      
      return unidades;
    } catch (error) {
      console.error('Erro ao listar unidades de medida:', error);
      return [];
    }
  }

  async listarProdutosGenericosPadrao() {
    try {
      const response = await api.get('/produto-origem/produtos-genericos-padrao');
      
      // Extrair dados da estrutura HATEOAS
      let produtosGenericos = [];
      
      if (response.data.data) {
        produtosGenericos = response.data.data;
      } else if (Array.isArray(response.data)) {
        produtosGenericos = response.data;
      }
      
      return produtosGenericos;
    } catch (error) {
      console.error('Erro ao listar produtos genéricos padrão:', error);
      return [];
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
