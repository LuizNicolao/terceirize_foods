import api from './api';

class ClientesService {
  async listar(params = {}) {
    try {
      const response = await api.get('/clientes', { params });
      
      // Extrair dados da estrutura HATEOAS
      let clientes = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          clientes = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          clientes = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        clientes = response.data;
      }
      
      return {
        success: true,
        data: clientes,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar clientes'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/clientes/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let cliente = null;
      
      if (response.data.data) {
        cliente = response.data.data;
      } else {
        cliente = response.data;
      }
      
      return {
        success: true,
        data: cliente
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar cliente'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/clientes', data);
      
      // Extrair dados da estrutura HATEOAS
      let cliente = null;
      
      if (response.data.data) {
        cliente = response.data.data;
      } else {
        cliente = response.data;
      }
      
      return {
        success: true,
        data: cliente,
        message: 'Cliente criado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar cliente'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/clientes/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let cliente = null;
      
      if (response.data.data) {
        cliente = response.data.data;
      } else {
        cliente = response.data;
      }
      
      return {
        success: true,
        data: cliente,
        message: 'Cliente atualizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar cliente'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/clientes/${id}`);
      
      return {
        success: true,
        message: 'Cliente excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir cliente'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/clientes', { params: { status: 1 } });
      
      // Extrair dados da estrutura HATEOAS
      let clientes = [];
      
      if (response.data.data) {
        if (response.data.data.items) {
          clientes = response.data.data.items;
        } else {
          clientes = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        clientes = response.data;
      }
      
      return {
        success: true,
        data: clientes
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar clientes ativos'
      };
    }
  }

  async exportarXLSX() {
    try {
      const response = await api.get('/clientes/export/xlsx', {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar XLSX'
      };
    }
  }

  async exportarPDF() {
    try {
      const response = await api.get('/clientes/export/pdf', {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar PDF'
      };
    }
  }

  async buscarCNPJ(cnpj) {
    try {
      const response = await api.get(`/clientes/buscar-cnpj/${cnpj}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar dados do CNPJ'
      };
    }
  }
}

export default new ClientesService(); 