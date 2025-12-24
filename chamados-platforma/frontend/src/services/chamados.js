import api from './api';

class ChamadosService {
  async listar(params = {}) {
    try {
      const response = await api.get('/chamados', { params });
      
      // Extrair dados da estrutura HATEOAS
      let chamados = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          chamados = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          chamados = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        chamados = response.data;
      }
      
      return {
        success: true,
        data: chamados,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar chamados'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/chamados/${id}`, {
        skipAuthRedirect: true // Evitar redirecionamento automático em caso de erro
      });
      
      // Extrair dados da estrutura HATEOAS
      let chamado = null;
      
      if (response.data.data) {
        chamado = response.data.data;
      } else {
        chamado = response.data;
      }
      
      return {
        success: true,
        data: chamado
      };
    } catch (error) {
      // Se for erro 401, tratar especificamente
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Sessão expirada. Por favor, faça login novamente.',
          unauthorized: true
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar chamado'
      };
    }
  }

  async buscarPorSistema(sistema, params = {}) {
    try {
      const response = await api.get(`/chamados/sistema/${sistema}`, { params });
      
      let chamados = [];
      let pagination = null;
      
      if (response.data.data) {
        if (response.data.data.items) {
          chamados = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          chamados = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        chamados = response.data;
      }
      
      return {
        success: true,
        data: chamados,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar chamados do sistema'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/chamados', data);
      
      // Extrair dados da estrutura HATEOAS
      let chamado = null;
      
      if (response.data.data) {
        chamado = response.data.data;
      } else {
        chamado = response.data;
      }
      
      return {
        success: true,
        data: chamado,
        message: 'Chamado criado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.rawErrors || [];
        
        // Formatar mensagem de erro mais amigável
        let errorMessage = error.response.data.message || 'Dados inválidos';
        if (errors.length > 0) {
          const errorMessages = errors.map(err => {
            const field = err.field || err.path || err.param || 'campo';
            const msg = err.message || err.msg || 'inválido';
            return `${field}: ${msg}`;
          });
          errorMessage = errorMessages.join('; ');
        }
        
        return {
          success: false,
          message: errorMessage,
          validationErrors: errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar chamado'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/chamados/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let chamado = null;
      
      if (response.data.data) {
        chamado = response.data.data;
      } else {
        chamado = response.data;
      }
      
      return {
        success: true,
        data: chamado,
        message: 'Chamado atualizado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar chamado'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/chamados/${id}`);
      return {
        success: true,
        message: 'Chamado excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir chamado'
      };
    }
  }

  // Métodos de comentários
  async listarComentarios(chamadoId, params = {}) {
    try {
      const response = await api.get(`/chamados/${chamadoId}/comentarios`, { params });
      
      let comentarios = [];
      let pagination = null;
      
      if (response.data.data) {
        if (response.data.data.items) {
          comentarios = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          comentarios = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        comentarios = response.data;
      }
      
      return {
        success: true,
        data: comentarios,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar comentários'
      };
    }
  }

  async criarComentario(chamadoId, data) {
    try {
      const response = await api.post(`/chamados/${chamadoId}/comentarios`, data);
      
      let comentario = null;
      
      if (response.data.data) {
        comentario = response.data.data;
      } else {
        comentario = response.data;
      }
      
      return {
        success: true,
        data: comentario,
        message: 'Comentário adicionado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar comentário'
      };
    }
  }

  async atualizarComentario(chamadoId, comentarioId, data) {
    try {
      const response = await api.put(`/chamados/${chamadoId}/comentarios/${comentarioId}`, data);
      
      let comentario = null;
      
      if (response.data.data) {
        comentario = response.data.data;
      } else {
        comentario = response.data;
      }
      
      return {
        success: true,
        data: comentario,
        message: 'Comentário atualizado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar comentário'
      };
    }
  }

  async excluirComentario(chamadoId, comentarioId) {
    try {
      await api.delete(`/chamados/${chamadoId}/comentarios/${comentarioId}`);
      return {
        success: true,
        message: 'Comentário excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir comentário'
      };
    }
  }

  // Métodos de anexos
  async listarAnexos(chamadoId) {
    try {
      const response = await api.get(`/chamados/${chamadoId}/anexos`);
      
      let anexos = [];
      
      if (response.data.data) {
        anexos = response.data.data;
      } else if (Array.isArray(response.data)) {
        anexos = response.data;
      }
      
      return {
        success: true,
        data: anexos
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar anexos'
      };
    }
  }

  async uploadAnexo(chamadoId, file, tipoAnexo = 'problema') {
    try {
      const formData = new FormData();
      formData.append('arquivo', file);
      formData.append('tipo_anexo', tipoAnexo);

      const response = await api.post(`/chamados/${chamadoId}/anexos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      let anexo = null;
      
      if (response.data.data) {
        anexo = response.data.data;
      } else {
        anexo = response.data;
      }
      
      return {
        success: true,
        data: anexo,
        message: 'Arquivo enviado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao enviar arquivo'
      };
    }
  }

  async downloadAnexo(chamadoId, anexoId) {
    try {
      const response = await api.get(`/chamados/${chamadoId}/anexos/${anexoId}/download`, {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao baixar arquivo'
      };
    }
  }

  async excluirAnexo(chamadoId, anexoId) {
    try {
      await api.delete(`/chamados/${chamadoId}/anexos/${anexoId}`);
      return {
        success: true,
        message: 'Anexo excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir anexo'
      };
    }
  }

  // Métodos de histórico
  async listarHistorico(chamadoId, params = {}) {
    try {
      const response = await api.get(`/chamados/${chamadoId}/historico`, { params });
      
      let historico = [];
      let pagination = null;
      
      if (response.data.data) {
        if (response.data.data.items) {
          historico = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          historico = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        historico = response.data;
      }
      
      return {
        success: true,
        data: historico,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar histórico'
      };
    }
  }
}

export default new ChamadosService();
