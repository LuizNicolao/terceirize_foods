import api from './api';
import CepService from './cepService';

class FiliaisService {
  async listar(params = {}) {
    try {
      const response = await api.get('/filiais', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar filiais'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/filiais/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar filial'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/filiais', data);
      return {
        success: true,
        data: response.data
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
        message: error.response?.data?.message || 'Erro ao criar filial'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/filiais/${id}`, data);
      return {
        success: true,
        data: response.data
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
        message: error.response?.data?.message || 'Erro ao atualizar filial'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/filiais/${id}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir filial'
      };
    }
  }

  async buscarAtivas(params = {}) {
    try {
      const queryParams = {
        page: 1,
        limit: 1000,
        ...params
      };

      const response = await api.get('/filiais/ativas/listar', { params: queryParams });
      const payload = response.data?.data;
      const filiais = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

      return {
        success: true,
        data: filiais,
        meta: response.data?.meta || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar filiais ativas'
      };
    }
  }

  async consultarCNPJ(cnpj) {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const response = await api.get(`/filiais/buscar-cnpj/${cnpjLimpo}`);
      
      // Extrair dados da estrutura HATEOAS
      let dados = null;
      
      if (response.data.data) {
        dados = response.data.data;
      } else {
        dados = response.data;
      }
      
      return {
        success: true,
        data: dados
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao consultar CNPJ'
      };
    }
  }

  async consultarCEP(cep) {
    return await CepService.buscarCEP(cep);
  }

  async listarAlmoxarifados(filialId) {
    try {
      const response = await api.get(`/filiais/${filialId}/almoxarifados`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar almoxarifados'
      };
    }
  }

  async criarAlmoxarifado(filialId, data) {
    try {
      const response = await api.post(`/filiais/${filialId}/almoxarifados`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar almoxarifado'
      };
    }
  }

  async atualizarAlmoxarifado(id, data) {
    try {
      const response = await api.put(`/filiais/almoxarifados/${id}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar almoxarifado'
      };
    }
  }

  async excluirAlmoxarifado(id) {
    try {
      await api.delete(`/filiais/almoxarifados/${id}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir almoxarifado'
      };
    }
  }

  // async listarItensAlmoxarifado(almoxarifadoId) {
  //   try {
  //     const response = await api.get(`/filiais/almoxarifados/${almoxarifadoId}/itens`);
  //     return {
  //       success: true,
  //       data: response.data.data || response.data
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error.response?.data?.message || 'Erro ao carregar itens do almoxarifado'
  //     };
  //   }
  // }

  // async adicionarItemAlmoxarifado(almoxarifadoId, data) {
  //   try {
  //     const response = await api.post(`/filiais/almoxarifados/${almoxarifadoId}/itens`, data);
  //     return {
  //       success: true,
  //       data: response.data
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error.response?.data?.message || 'Erro ao adicionar item ao almoxarifado'
  //     };
  //   }
  // }

  // async removerItemAlmoxarifado(almoxarifadoId, itemId) {
  //   try {
  //     await api.delete(`/filiais/almoxarifados/${almoxarifadoId}/itens/${itemId}`);
  //     return {
  //       success: true
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error.response?.data?.message || 'Erro ao remover item do almoxarifado'
  //     };
  //   }
  // }

  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/filiais/export/xlsx', { 
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
        error: error.response?.data?.message || 'Erro ao exportar dados'
      };
    }
  }

  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/filiais/export/pdf', { 
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
        error: error.response?.data?.message || 'Erro ao exportar dados'
      };
    }
  }
}

export default new FiliaisService(); 