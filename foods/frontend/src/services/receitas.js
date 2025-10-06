import api from './api';

class ReceitasService {
  // Listar cardápios com paginação, busca e filtros
  static async listar(params = {}) {
    try {
      const response = await api.get('/receitas', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar receitas:', error);
      return {
        success: false,
        error: 'Erro ao carregar receitas'
      };
    }
  }

  // Buscar cardápio por ID
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/receitas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cardápio:', error);
      return {
        success: false,
        error: 'Erro ao carregar cardápio'
      };
    }
  }

  // Criar novo cardápio
  static async criar(data) {
    try {
      const response = await api.post('/receitas', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cardápio:', error);
      return {
        success: false,
        error: 'Erro ao criar cardápio'
      };
    }
  }

  // Atualizar cardápio
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/receitas/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar cardápio:', error);
      return {
        success: false,
        error: 'Erro ao atualizar cardápio'
      };
    }
  }

  // Excluir cardápio
  static async excluir(id) {
    try {
      const response = await api.delete(`/receitas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir cardápio:', error);
      return {
        success: false,
        error: 'Erro ao excluir cardápio'
      };
    }
  }



  // Alterar ingrediente de receita
  static async alterarIngrediente(cardapioId, receitaId, ingredienteId, novoIngrediente) {
    try {
      const response = await api.put(`/receitas/${cardapioId}/receitas/${receitaId}/ingredientes/${ingredienteId}`, novoIngrediente);
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar ingrediente:', error);
      return {
        success: false,
        error: 'Erro ao alterar ingrediente'
      };
    }
  }

  // Buscar receitas
  static async buscarReceitas(params = {}) {
    try {
      const response = await api.get('/receitas', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      return {
        success: false,
        error: 'Erro ao carregar receitas'
      };
    }
  }

  // Buscar receita por ID
  static async buscarReceitaPorId(id) {
    try {
      const response = await api.get(`/receitas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar receita:', error);
      return {
        success: false,
        error: 'Erro ao carregar receita'
      };
    }
  }

  // Criar nova receita
  static async criarReceita(data) {
    try {
      const response = await api.post('/receitas', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      return {
        success: false,
        error: 'Erro ao criar receita'
      };
    }
  }

  // Atualizar receita
  static async atualizarReceita(id, data) {
    try {
      const response = await api.put(`/receitas/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      return {
        success: false,
        error: 'Erro ao atualizar receita'
      };
    }
  }

  // Excluir receita
  static async excluirReceita(id) {
    try {
      const response = await api.delete(`/receitas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      return {
        success: false,
        error: 'Erro ao excluir receita'
      };
    }
  }

  // Validar ingrediente
  static async validarIngrediente(nomeIngrediente) {
    try {
      const response = await api.post('/receitas/validar-ingrediente', { nome: nomeIngrediente });
      return response.data;
    } catch (error) {
      console.error('Erro ao validar ingrediente:', error);
      return {
        success: false,
        error: 'Erro ao validar ingrediente'
      };
    }
  }

  // Buscar produtos similares
  static async buscarProdutosSimilares(nomeIngrediente) {
    try {
      const response = await api.get('/receitas/produtos-similares', { 
        params: { nome: nomeIngrediente } 
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos similares:', error);
      return {
        success: false,
        error: 'Erro ao buscar produtos similares'
      };
    }
  }

  // Calcular efetivos para cardápio
  static async calcularEfetivos(cardapioId) {
    try {
      const response = await api.get(`/receitas/${cardapioId}/efetivos`);
      return response.data;
    } catch (error) {
      console.error('Erro ao calcular efetivos:', error);
      return {
        success: false,
        error: 'Erro ao calcular efetivos'
      };
    }
  }

  // Buscar produtos NAE para cardápio
  static async buscarProdutosNAE(cardapioId) {
    try {
      const response = await api.get(`/receitas/${cardapioId}/produtos-nae`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos NAE:', error);
      return {
        success: false,
        error: 'Erro ao buscar produtos NAE'
      };
    }
  }

  // Exportar cardápio
  static async exportar(cardapioId, formato = 'xlsx', tipo = 'completo') {
    try {
      const response = await api.get(`/receitas/${cardapioId}/exportar`, {
        params: { formato, tipo },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar cardápio:', error);
      return {
        success: false,
        error: 'Erro ao exportar cardápio'
      };
    }
  }

  // Exportar lista de compras
  static async exportarListaCompras(cardapioId, formato = 'xlsx') {
    try {
      const response = await api.get(`/receitas/${cardapioId}/lista-compras`, {
        params: { formato },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar lista de compras:', error);
      return {
        success: false,
        error: 'Erro ao exportar lista de compras'
      };
    }
  }

  // Exportar relatório NAE
  static async exportarRelatorioNAE(cardapioId, formato = 'pdf') {
    try {
      const response = await api.get(`/receitas/${cardapioId}/relatorio-nae`, {
        params: { formato },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar relatório NAE:', error);
      return {
        success: false,
        error: 'Erro ao exportar relatório NAE'
      };
    }
  }

  // Buscar estatísticas
  static async buscarEstatisticas() {
    try {
      const response = await api.get('/receitas/estatisticas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        success: false,
        error: 'Erro ao carregar estatísticas'
      };
    }
  }

  // Buscar histórico de alterações
  static async buscarHistorico(cardapioId) {
    try {
      const response = await api.get(`/receitas/${cardapioId}/historico`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return {
        success: false,
        error: 'Erro ao carregar histórico'
      };
    }
  }
}

export default ReceitasService;
