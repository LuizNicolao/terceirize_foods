import api from './api';

class ProdutosService {
  // Listar produtos com paginação e filtros
  async listar(params = {}) {
    try {
      const response = await api.get('/produtos', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produto por ID
  async buscarPorId(id) {
    try {
      const response = await api.get(`/produtos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Criar novo produto
  async criar(data) {
    try {
      const response = await api.post('/produtos', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar produto
  async atualizar(id, data) {
    try {
      const response = await api.put(`/produtos/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Excluir produto
  async excluir(id) {
    try {
      const response = await api.delete(`/produtos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produtos ativos
  async buscarAtivos() {
    try {
      const response = await api.get('/produtos/ativos');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produtos por grupo
  async buscarPorGrupo(grupoId) {
    try {
      const response = await api.get(`/produtos/grupo/${grupoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produtos por subgrupo
  async buscarPorSubgrupo(subgrupoId) {
    try {
      const response = await api.get(`/produtos/subgrupo/${subgrupoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produtos por classe
  async buscarPorClasse(classeId) {
    try {
      const response = await api.get(`/produtos/classe/${classeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produtos por marca
  async buscarPorMarca(marcaId) {
    try {
      const response = await api.get(`/produtos/marca/${marcaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produtos por fornecedor
  async buscarPorFornecedor(fornecedorId) {
    try {
      const response = await api.get(`/produtos/fornecedor/${fornecedorId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produtos com estoque baixo
  async buscarComEstoqueBaixo() {
    try {
      const response = await api.get('/produtos/estoque-baixo');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produtos por código de barras
  async buscarPorCodigoBarras(codigoBarras) {
    try {
      const response = await api.get(`/produtos/codigo-barras/${codigoBarras}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produtos por NCM
  async buscarPorNCM(ncm) {
    try {
      const response = await api.get(`/produtos/ncm/${ncm}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar estoque
  async atualizarEstoque(id, quantidade) {
    try {
      const response = await api.patch(`/produtos/${id}/estoque`, { quantidade });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar preços
  async atualizarPrecos(id, precoCusto, precoVenda) {
    try {
      const response = await api.patch(`/produtos/${id}/precos`, { 
        preco_custo: precoCusto, 
        preco_venda: precoVenda 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Upload de foto do produto
  async uploadFoto(id, formData) {
    try {
      const response = await api.post(`/produtos/${id}/foto`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Exportar produtos para XLSX
  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/produtos/export/xlsx', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Exportar produtos para PDF
  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/produtos/export/pdf', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obter estatísticas de produtos
  async obterEstatisticas() {
    try {
      const response = await api.get('/produtos/estatisticas');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Buscar produtos similares
  async buscarSimilares(id) {
    try {
      const response = await api.get(`/produtos/${id}/similares`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Validar código de produto
  async validarCodigo(codigo) {
    try {
      const response = await api.get(`/produtos/validar-codigo/${codigo}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Validar código de barras
  async validarCodigoBarras(codigoBarras) {
    try {
      const response = await api.get(`/produtos/validar-codigo-barras/${codigoBarras}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ProdutosService(); 