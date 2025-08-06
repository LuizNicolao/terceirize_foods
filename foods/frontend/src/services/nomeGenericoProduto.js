import api from './api';

class NomeGenericoProdutoService {
  /**
   * Listar nomes genéricos com paginação e filtros
   */
  static async listar(params = {}) {
    try {
      const response = await api.get('/nome-generico-produto', { params });
      
      // Extrair dados da estrutura HATEOAS
      let nomesGenericos = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          nomesGenericos = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          nomesGenericos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        nomesGenericos = response.data;
      }
      
      return {
        success: true,
        data: nomesGenericos,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar nomes genéricos'
      };
    }
  }

  /**
   * Buscar nome genérico por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/nome-generico-produto/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let nomeGenerico = null;
      
      if (response.data.data) {
        nomeGenerico = response.data.data;
      } else {
        nomeGenerico = response.data;
      }
      
      return {
        success: true,
        data: nomeGenerico
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar nome genérico'
      };
    }
  }

  /**
   * Criar novo nome genérico
   */
  static async criar(data) {
    try {
      const response = await api.post('/nome-generico-produto', data);
      
      // Extrair dados da estrutura HATEOAS
      let nomeGenerico = null;
      
      if (response.data.data) {
        nomeGenerico = response.data.data;
      } else {
        nomeGenerico = response.data;
      }
      
      return {
        success: true,
        data: nomeGenerico,
        message: 'Nome genérico criado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar nome genérico'
      };
    }
  }

  /**
   * Atualizar nome genérico
   */
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/nome-generico-produto/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let nomeGenerico = null;
      
      if (response.data.data) {
        nomeGenerico = response.data.data;
      } else {
        nomeGenerico = response.data;
      }
      
      return {
        success: true,
        data: nomeGenerico,
        message: 'Nome genérico atualizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar nome genérico'
      };
    }
  }

  /**
   * Excluir nome genérico
   */
  static async excluir(id) {
    try {
      await api.delete(`/nome-generico-produto/${id}`);
      return {
        success: true,
        message: 'Nome genérico excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir nome genérico'
      };
    }
  }

  /**
   * Buscar nomes genéricos ativos
   */
  static async buscarAtivos(params = {}) {
    try {
      const response = await api.get('/nome-generico-produto', { params: { ...params, status: 1 } });
      
      // Extrair dados da estrutura HATEOAS
      let nomesGenericos = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          nomesGenericos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          nomesGenericos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        nomesGenericos = response.data;
      }
      
      return {
        success: true,
        data: nomesGenericos
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar nomes genéricos ativos'
      };
    }
  }

  /**
   * Buscar nomes genéricos por classe
   */
  static async buscarPorClasse(classeId, params = {}) {
    try {
      const response = await api.get(`/classes/${classeId}/nomes-genericos`, { params });
      
      // Extrair dados da estrutura HATEOAS
      let nomesGenericos = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          nomesGenericos = response.data.data.items;
        } else {
          // Se data é diretamente um array
          nomesGenericos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        nomesGenericos = response.data;
      }
      
      return {
        success: true,
        data: nomesGenericos
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar nomes genéricos por classe'
      };
    }
  }

  /**
   * Exportar nomes genéricos para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/nome-generico-produto/export/xlsx', { 
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
   * Exportar nomes genéricos para PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/nome-generico-produto/export/pdf', { 
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

export default NomeGenericoProdutoService; 