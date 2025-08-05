import api from './api';

const produtosService = {
  // Listar produtos com paginação e filtros
  listar: async (params = {}) => {
    const response = await api.get('/produtos', { params });
    return response.data;
  },

  // Buscar produto por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  // Criar novo produto
  criar: async (produto) => {
    const response = await api.post('/produtos', produto);
    return response.data;
  },

  // Atualizar produto
  atualizar: async (id, produto) => {
    const response = await api.put(`/produtos/${id}`, produto);
    return response.data;
  },

  // Excluir produto
  excluir: async (id) => {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
  },

  // Buscar produtos ativos
  buscarAtivos: async () => {
    const response = await api.get('/produtos/ativos');
    return response.data;
  },

  // Buscar produtos por grupo
  buscarPorGrupo: async (grupoId) => {
    const response = await api.get(`/produtos/grupo/${grupoId}`);
    return response.data;
  },

  // Buscar produtos por subgrupo
  buscarPorSubgrupo: async (subgrupoId) => {
    const response = await api.get(`/produtos/subgrupo/${subgrupoId}`);
    return response.data;
  },

  // Buscar produtos por classe
  buscarPorClasse: async (classeId) => {
    const response = await api.get(`/produtos/classe/${classeId}`);
    return response.data;
  },

  // Buscar produtos por marca
  buscarPorMarca: async (marcaId) => {
    const response = await api.get(`/produtos/marca/${marcaId}`);
    return response.data;
  },

  // Buscar produtos por nome genérico
  buscarPorNomeGenerico: async (nomeGenericoId) => {
    const response = await api.get(`/produtos/nome-generico/${nomeGenericoId}`);
    return response.data;
  },

  // Buscar produtos por unidade
  buscarPorUnidade: async (unidadeId) => {
    const response = await api.get(`/produtos/unidade/${unidadeId}`);
    return response.data;
  },

  // Buscar produtos por fornecedor
  buscarPorFornecedor: async (fornecedorId) => {
    const response = await api.get(`/produtos/fornecedor/${fornecedorId}`);
    return response.data;
  },

  // Buscar produtos por código
  buscarPorCodigo: async (codigo) => {
    const response = await api.get(`/produtos/codigo/${codigo}`);
    return response.data;
  },

  // Buscar produtos por descrição
  buscarPorDescricao: async (descricao) => {
    const response = await api.get(`/produtos/descricao/${descricao}`);
    return response.data;
  },

  // Listar grupos
  listarGrupos: async () => {
    const response = await api.get('/grupos');
    return response.data;
  },

  // Listar subgrupos
  listarSubgrupos: async () => {
    const response = await api.get('/subgrupos');
    return response.data;
  },

  // Listar classes
  listarClasses: async () => {
    const response = await api.get('/classes');
    return response.data;
  },

  // Listar marcas
  listarMarcas: async () => {
    const response = await api.get('/marcas');
    return response.data;
  },

  // Listar nomes genéricos
  listarNomesGenericos: async () => {
    const response = await api.get('/nome-generico-produto');
    return response.data;
  },

  // Listar unidades
  listarUnidades: async () => {
    const response = await api.get('/unidades');
    return response.data;
  },

  // Listar fornecedores
  listarFornecedores: async () => {
    const response = await api.get('/fornecedores');
    return response.data;
  },

  // Exportar produtos para XLSX
  exportarXLSX: async (filtros = {}) => {
    const response = await api.get('/produtos/exportar/xlsx', { 
      params: filtros,
      responseType: 'blob'
    });
    return response.data;
  },

  // Exportar produtos para PDF
  exportarPDF: async (filtros = {}) => {
    const response = await api.get('/produtos/exportar/pdf', { 
      params: filtros,
      responseType: 'blob'
    });
    return response.data;
  },

  // Listar logs de auditoria
  listarAuditoria: async (filtros = {}) => {
    const response = await api.get('/auditoria/produtos', { params: filtros });
    return response.data;
  },

  // Exportar auditoria para XLSX
  exportarAuditoriaXLSX: async (filtros = {}) => {
    const response = await api.get('/auditoria/produtos/exportar/xlsx', { 
      params: filtros,
      responseType: 'blob'
    });
    return response.data;
  },

  // Exportar auditoria para PDF
  exportarAuditoriaPDF: async (filtros = {}) => {
    const response = await api.get('/auditoria/produtos/exportar/pdf', { 
      params: filtros,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default produtosService; 