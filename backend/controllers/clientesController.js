/**
 * Controller de Clientes
 * Implementa todas as operações CRUD com padrões RESTful, HATEOAS e paginação
 */

const { executeQuery } = require('../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  conflictResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../middleware/responseHandler');
const { asyncHandler } = require('../middleware/responseHandler');
const axios = require('axios');

class ClientesController {
  
  /**
   * Listar clientes com paginação, busca e HATEOAS
   */
  static listarClientes = asyncHandler(async (req, res) => {
    const { search = '', status, uf } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, 
        cnpj, 
        razao_social, 
        nome_fantasia, 
        logradouro, 
        numero, 
        cep, 
        bairro, 
        municipio, 
        uf, 
        email, 
        telefone, 
        status, 
        criado_em, 
        atualizado_em 
      FROM clientes 
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== undefined) {
      baseQuery += ' AND status = ?';
      params.push(status);
    }

    if (uf) {
      baseQuery += ' AND uf = ?';
      params.push(uf.toUpperCase());
    }

    baseQuery += ' ORDER BY razao_social ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const clientes = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM clientes WHERE 1=1${search ? ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)' : ''}${status !== undefined ? ' AND status = ?' : ''}${uf ? ' AND uf = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/clientes', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(clientes, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Clientes listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Buscar cliente por ID
   */
  static buscarClientePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const clientes = await executeQuery(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    if (clientes.length === 0) {
      return notFoundResponse(res, 'Cliente não encontrado');
    }

    const cliente = clientes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(cliente);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, cliente.id);

    return successResponse(res, data, 'Cliente encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Criar novo cliente
   */
  static criarCliente = asyncHandler(async (req, res) => {
    const {
      cnpj, razao_social, nome_fantasia, logradouro, numero, bairro, 
      municipio, uf, cep, email, telefone, status
    } = req.body;

    // Limpar CNPJ
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    // Verificar se CNPJ já existe
    const existingCliente = await executeQuery(
      'SELECT id FROM clientes WHERE cnpj = ?',
      [cnpjLimpo]
    );

    if (existingCliente.length > 0) {
      return conflictResponse(res, 'CNPJ já cadastrado');
    }

    // Verificar se razão social já existe
    const existingRazaoSocial = await executeQuery(
      'SELECT id FROM clientes WHERE razao_social = ?',
      [razao_social]
    );

    if (existingRazaoSocial.length > 0) {
      return conflictResponse(res, 'Razão social já cadastrada');
    }

    // Inserir cliente
    const result = await executeQuery(
      `INSERT INTO clientes (cnpj, razao_social, nome_fantasia, logradouro, numero, bairro, 
                             municipio, uf, cep, email, telefone, status, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        cnpjLimpo, 
        razao_social, 
        nome_fantasia && nome_fantasia.trim() ? nome_fantasia.trim() : null,
        logradouro && logradouro.trim() ? logradouro.trim() : null,
        numero && numero.trim() ? numero.trim() : null,
        bairro && bairro.trim() ? bairro.trim() : null,
        municipio && municipio.trim() ? municipio.trim() : null,
        uf && uf.trim() ? uf.trim().toUpperCase() : null,
        cep && cep.trim() ? cep.trim() : null,
        email && email.trim() ? email.trim() : null,
        telefone && telefone.trim() ? telefone.trim() : null,
        status || 1
      ]
    );

    const novoClienteId = result.insertId;

    // Buscar cliente criado
    const clientes = await executeQuery(
      'SELECT * FROM clientes WHERE id = ?',
      [novoClienteId]
    );

    const cliente = clientes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(cliente);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, cliente.id);

    return successResponse(res, data, 'Cliente criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar cliente
   */
  static atualizarCliente = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se cliente existe
    const existingCliente = await executeQuery(
      'SELECT id, cnpj, razao_social FROM clientes WHERE id = ?',
      [id]
    );

    if (existingCliente.length === 0) {
      return notFoundResponse(res, 'Cliente não encontrado');
    }

    // Verificar se CNPJ já existe (se estiver sendo alterado)
    if (updateData.cnpj) {
      const cnpjLimpo = updateData.cnpj.replace(/\D/g, '');
      const cnpjCheck = await executeQuery(
        'SELECT id FROM clientes WHERE cnpj = ? AND id != ?',
        [cnpjLimpo, id]
      );

      if (cnpjCheck.length > 0) {
        return conflictResponse(res, 'CNPJ já cadastrado');
      }
      updateData.cnpj = cnpjLimpo; // Atualizar com CNPJ limpo
    }

    // Verificar se razão social já existe (se estiver sendo alterada)
    if (updateData.razao_social) {
      const razaoSocialCheck = await executeQuery(
        'SELECT id FROM clientes WHERE razao_social = ? AND id != ?',
        [updateData.razao_social, id]
      );

      if (razaoSocialCheck.length > 0) {
        return conflictResponse(res, 'Razão social já cadastrada');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        let value = updateData[key];
        
        // Tratar valores vazios ou undefined
        if (value === '' || value === null || value === undefined) {
          value = null;
        } else if (typeof value === 'string') {
          value = value.trim();
          if (value === '') {
            value = null;
          }
        }
        
        if (key === 'uf' && value) {
          updateFields.push(`${key} = ?`);
          updateParams.push(value.toUpperCase());
        } else {
          updateFields.push(`${key} = ?`);
          updateParams.push(value);
        }
      }
    });

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('atualizado_em = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE clientes SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar cliente atualizado
    const clientes = await executeQuery(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    const cliente = clientes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(cliente);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, cliente.id);

    return successResponse(res, data, 'Cliente atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir cliente
   */
  static excluirCliente = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se cliente existe
    const existingCliente = await executeQuery(
      'SELECT id FROM clientes WHERE id = ?',
      [id]
    );

    if (existingCliente.length === 0) {
      return notFoundResponse(res, 'Cliente não encontrado');
    }

    // Verificar se cliente está sendo usado em alguma tabela relacionada
    // Aqui você pode adicionar verificações específicas se houver relacionamentos
    // Por exemplo, se clientes estiverem relacionados a pedidos, contratos, etc.

    // Excluir cliente (soft delete - alterar status para 0)
    await executeQuery(
      'UPDATE clientes SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Cliente excluído com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Buscar dados do CNPJ via API externa
   */
  static buscarCNPJ = asyncHandler(async (req, res) => {
    const { cnpj } = req.params;
    
    // Limpar CNPJ (remover pontos, traços e barras)
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      return errorResponse(res, 'CNPJ deve ter 14 dígitos', STATUS_CODES.BAD_REQUEST);
    }

    // Tentar buscar dados do CNPJ usando API mais estável
    let dadosCNPJ = null;
    
    try {
      // Usar Brasil API que é mais confiável
      const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
        timeout: 8000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.data && response.data.razao_social) {
        dadosCNPJ = {
          razao_social: response.data.razao_social,
          nome_fantasia: response.data.nome_fantasia,
          logradouro: response.data.logradouro,
          numero: response.data.numero,
          bairro: response.data.bairro,
          municipio: response.data.municipio,
          uf: response.data.uf,
          cep: response.data.cep,
          telefone: (() => {
            // Tentar diferentes formatos de telefone da API
            let telefone = null;
            
            if (response.data.ddd_telefone_1 && response.data.telefone_1) {
              telefone = `${response.data.ddd_telefone_1}${response.data.telefone_1}`;
            } else if (response.data.telefone) {
              telefone = response.data.telefone;
            } else if (response.data.ddd_telefone_1) {
              telefone = response.data.ddd_telefone_1;
            }
            
            // Limpar telefone se encontrado
            if (telefone) {
              // Remover "undefined" se estiver concatenado
              telefone = telefone.toString().replace(/undefined/g, '');
              // Remover caracteres não numéricos
              telefone = telefone.replace(/\D/g, '');
              // Retornar apenas se tiver pelo menos 10 dígitos
              return telefone.length >= 10 ? telefone : null;
            }
            
            return null;
          })(),
          email: response.data.email
        };
      }
    } catch (error) {
      console.log('Erro ao buscar CNPJ na API externa:', error.message);
      
      // Se a API externa falhar, retornar erro específico
      return errorResponse(res, 'Serviço de consulta CNPJ temporariamente indisponível. Tente novamente em alguns minutos.', STATUS_CODES.SERVICE_UNAVAILABLE);
    }

    if (dadosCNPJ) {
      return successResponse(res, dadosCNPJ, 'Dados do CNPJ encontrados', STATUS_CODES.OK);
    } else {
      return notFoundResponse(res, 'CNPJ não encontrado ou dados indisponíveis');
    }
  });

  /**
   * Buscar clientes por UF
   */
  static buscarPorUF = asyncHandler(async (req, res) => {
    const { uf } = req.params;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, 
        cnpj, 
        razao_social, 
        nome_fantasia, 
        logradouro, 
        numero, 
        cep, 
        bairro, 
        municipio, 
        uf, 
        email, 
        telefone, 
        status, 
        criado_em, 
        atualizado_em 
      FROM clientes 
      WHERE uf = ? AND status = 1
    `;
    
    let params = [uf.toUpperCase()];
    baseQuery += ' ORDER BY razao_social ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const clientes = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM clientes WHERE uf = ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [uf.toUpperCase()]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/clientes/uf/${uf}`, queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(clientes, meta.pagination, queryParams);

    return successResponse(res, data, `Clientes da UF ${uf.toUpperCase()} listados com sucesso`, STATUS_CODES.OK, meta);
  });

  /**
   * Buscar clientes ativos
   */
  static buscarAtivos = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, 
        cnpj, 
        razao_social, 
        nome_fantasia, 
        logradouro, 
        numero, 
        cep, 
        bairro, 
        municipio, 
        uf, 
        email, 
        telefone, 
        status, 
        criado_em, 
        atualizado_em 
      FROM clientes 
      WHERE status = 1
    `;
    
    let params = [];
    baseQuery += ' ORDER BY razao_social ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const clientes = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM clientes WHERE status = 1`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/clientes/ativos', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(clientes, meta.pagination, queryParams);

    return successResponse(res, data, 'Clientes ativos listados com sucesso', STATUS_CODES.OK, meta);
  });

  /**
   * Obter permissões do usuário atual
   */
  static getUserPermissions(user) {
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    if (user.tipo_de_acesso === 'administrador') {
      return ['visualizar', 'criar', 'editar', 'excluir'];
    }

    return accessLevels[user.nivel_de_acesso] || [];
  }
}

module.exports = ClientesController; 