/**
 * Serviço de API para Cotações
 * Centraliza todas as chamadas de API relacionadas a cotações
 */

import api from '../utils/axiosConfig';

class CotacoesService {
  
  // ===== OPERAÇÕES CRUD =====
  
  /**
   * Criar nova cotação
   */
  static async criarCotacao(dados) {
    try {
      const response = await api.post('/cotacoes', dados);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar cotação por ID
   */
  static async buscarCotacao(id) {
    try {
      const response = await api.get(`/cotacoes/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar cotação
   */
  static async atualizarCotacao(id, dados) {
    try {
      const response = await api.put(`/cotacoes/${id}`, dados);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Excluir cotação
   */
  static async excluirCotacao(id) {
    try {
      const response = await api.delete(`/cotacoes/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== OPERAÇÕES DE LISTAGEM =====
  
  /**
   * Listar cotações com filtros
   */
  static async listarCotacoes(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros à query string
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/cotacoes?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Listar cotações pendentes para supervisor
   */
  static async listarCotacoesPendentesSupervisor(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/cotacoes/pendentes-supervisor?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Listar cotações para aprovação
   */
  static async listarCotacoesAprovacao(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/cotacoes/aprovacoes?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== OPERAÇÕES DE BUSCA =====
  
  /**
   * Buscar cotações por status
   */
  static async buscarPorStatus(status, filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/cotacoes/buscar/status/${status}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar cotações por comprador
   */
  static async buscarPorComprador(compradorId, filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/cotacoes/buscar/comprador/${compradorId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== OPERAÇÕES DE ESTATÍSTICAS =====
  
  /**
   * Buscar estatísticas gerais
   */
  static async buscarEstatisticas() {
    try {
      const response = await api.get('/cotacoes/stats/overview');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar dashboard overview
   */
  static async buscarDashboardOverview() {
    try {
      const response = await api.get('/cotacoes/stats/dashboard');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar estatísticas por período
   */
  static async buscarEstatisticasPorPeriodo(dataInicio, dataFim) {
    try {
      const response = await api.get('/cotacoes/stats/periodo', {
        params: {
          data_inicio: dataInicio,
          data_fim: dataFim
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar estatísticas por comprador
   */
  static async buscarEstatisticasPorComprador(compradorId) {
    try {
      const response = await api.get(`/cotacoes/stats/comprador/${compradorId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== UTILITÁRIOS =====
  
  /**
   * Tratamento padronizado de erros
   */
  static handleError(error) {
    if (error.response) {
      // Erro da API com resposta
      const { data, status } = error.response;
      return {
        message: data.message || 'Erro na requisição',
        status,
        data: data.data || null,
        errors: data.errors || null
      };
    } else if (error.request) {
      // Erro de rede
      return {
        message: 'Erro de conexão. Verifique sua internet.',
        status: 0,
        data: null,
        errors: null
      };
    } else {
      // Erro geral
      return {
        message: error.message || 'Erro desconhecido',
        status: 0,
        data: null,
        errors: null
      };
    }
  }

  /**
   * Validar dados de cotação antes do envio
   */
  static validarDadosCotacao(dados) {
    const erros = [];

    if (!dados.comprador) {
      erros.push('Comprador é obrigatório');
    }

    if (!dados.local_entrega || dados.local_entrega.trim().length < 3) {
      erros.push('Local de entrega deve ter pelo menos 3 caracteres');
    }

    if (!dados.tipo_compra) {
      erros.push('Tipo de compra é obrigatório');
    }

    if (!dados.justificativa || dados.justificativa.trim().length < 10) {
      erros.push('Justificativa deve ter pelo menos 10 caracteres');
    }

    if (!dados.produtos || dados.produtos.length === 0) {
      erros.push('É necessário pelo menos um produto');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  /**
   * Formatar dados para exibição
   */
  static formatarCotacaoParaExibicao(cotacao) {
    return {
      ...cotacao,
      data_criacao_formatada: new Date(cotacao.data_criacao).toLocaleDateString('pt-BR'),
      data_atualizacao_formatada: cotacao.data_atualizacao 
        ? new Date(cotacao.data_atualizacao).toLocaleDateString('pt-BR')
        : null,
      status_formatado: this.formatarStatus(cotacao.status),
      tipo_compra_formatado: this.formatarTipoCompra(cotacao.tipo_compra)
    };
  }

  /**
   * Formatar status para exibição
   */
  static formatarStatus(status) {
    const statusMap = {
      'pendente': 'Pendente',
      'em_analise': 'Em Análise',
      'aprovada': 'Aprovada',
      'rejeitada': 'Rejeitada',
      'cancelada': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  /**
   * Formatar tipo de compra para exibição
   */
  static formatarTipoCompra(tipo) {
    const tipoMap = {
      'normal': 'Normal',
      'emergencial': 'Emergencial',
      'urgente': 'Urgente'
    };
    return tipoMap[tipo] || tipo;
  }
}

export default CotacoesService;
