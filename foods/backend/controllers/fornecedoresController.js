/**
 * Controller de Fornecedores
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

class FornecedoresController {
  
  /**
   * Listar fornecedores com paginação, busca e HATEOAS
   */
  static listarFornecedores = asyncHandler(async (req, res) => {
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
      FROM fornecedores 
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
    const fornecedores = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM fornecedores WHERE 1=1${search ? ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)' : ''}${status !== undefined ? ' AND status = ?' : ''}${uf ? ' AND uf = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/fornecedores', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(fornecedores, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Fornecedores listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Buscar fornecedor por ID
   */
  static buscarFornecedorPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const fornecedores = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [id]
    );

    if (fornecedores.length === 0) {
      return notFoundResponse(res, 'Fornecedor não encontrado');
    }

    const fornecedor = fornecedores[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(fornecedor);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, fornecedor.id);

    return successResponse(res, data, 'Fornecedor encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Criar novo fornecedor
   */
  static criarFornecedor = asyncHandler(async (req, res) => {
    const {
      cnpj, razao_social, nome_fantasia, logradouro, numero, bairro, 
      municipio, uf, cep, email, telefone, status
    } = req.body;

    // Limpar CNPJ
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    // Verificar se CNPJ já existe
    const existingFornecedor = await executeQuery(
      'SELECT id FROM fornecedores WHERE cnpj = ?',
      [cnpjLimpo]
    );

    if (existingFornecedor.length > 0) {
      return conflictResponse(res, 'CNPJ já cadastrado');
    }

    // Verificar se razão social já existe
    const existingRazaoSocial = await executeQuery(
      'SELECT id FROM fornecedores WHERE razao_social = ?',
      [razao_social]
    );

    if (existingRazaoSocial.length > 0) {
      return conflictResponse(res, 'Razão social já cadastrada');
    }

    // Inserir fornecedor
    const result = await executeQuery(
      `INSERT INTO fornecedores (cnpj, razao_social, nome_fantasia, logradouro, numero, bairro, 
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

    const novoFornecedorId = result.insertId;

    // Buscar fornecedor criado
    const fornecedores = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [novoFornecedorId]
    );

    const fornecedor = fornecedores[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(fornecedor);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, fornecedor.id);

    return successResponse(res, data, 'Fornecedor criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar fornecedor
   */
  static atualizarFornecedor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se fornecedor existe
    const existingFornecedor = await executeQuery(
      'SELECT id, cnpj, razao_social FROM fornecedores WHERE id = ?',
      [id]
    );

    if (existingFornecedor.length === 0) {
      return notFoundResponse(res, 'Fornecedor não encontrado');
    }

    // Verificar se CNPJ já existe (se estiver sendo alterado)
    if (updateData.cnpj) {
      const cnpjLimpo = updateData.cnpj.replace(/\D/g, '');
      const cnpjCheck = await executeQuery(
        'SELECT id FROM fornecedores WHERE cnpj = ? AND id != ?',
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
        'SELECT id FROM fornecedores WHERE razao_social = ? AND id != ?',
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
      `UPDATE fornecedores SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar fornecedor atualizado
    const fornecedores = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [id]
    );

    const fornecedor = fornecedores[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(fornecedor);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, fornecedor.id);

    return successResponse(res, data, 'Fornecedor atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir fornecedor
   */
  static excluirFornecedor = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se fornecedor existe
    const existingFornecedor = await executeQuery(
      'SELECT id FROM fornecedores WHERE id = ?',
      [id]
    );

    if (existingFornecedor.length === 0) {
      return notFoundResponse(res, 'Fornecedor não encontrado');
    }

    // Verificar se fornecedor está sendo usado em produtos
    const hasProducts = await executeQuery(
      'SELECT COUNT(*) as count FROM produtos WHERE fornecedor_id = ?',
      [id]
    );

    if (hasProducts[0].count > 0) {
      return errorResponse(res, 'Fornecedor não pode ser excluído pois possui produtos cadastrados', STATUS_CODES.BAD_REQUEST);
    }

    // Excluir fornecedor (soft delete - alterar status para 0)
    await executeQuery(
      'UPDATE fornecedores SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Fornecedor excluído com sucesso', STATUS_CODES.NO_CONTENT);
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
   * Buscar fornecedores por UF
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
      FROM fornecedores 
      WHERE uf = ? AND status = 1
    `;
    
    let params = [uf.toUpperCase()];
    baseQuery += ' ORDER BY razao_social ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const fornecedores = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM fornecedores WHERE uf = ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [uf.toUpperCase()]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/fornecedores/uf/${uf}`, queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(fornecedores, meta.pagination, queryParams);

    return successResponse(res, data, `Fornecedores da UF ${uf.toUpperCase()} listados com sucesso`, STATUS_CODES.OK, meta);
  });

  /**
   * Buscar estatísticas totais dos fornecedores
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Query para buscar estatísticas totais
    const statsQuery = `
      SELECT 
        COUNT(*) as total_fornecedores,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as fornecedores_ativos,
        SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as com_email,
        SUM(CASE WHEN telefone IS NOT NULL AND telefone != '' THEN 1 ELSE 0 END) as com_telefone
      FROM fornecedores
    `;
    
    const statsResult = await executeQuery(statsQuery);
    const estatisticas = statsResult[0];

    return successResponse(res, estatisticas, 'Estatísticas carregadas com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar fornecedores ativos
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
      FROM fornecedores 
      WHERE status = 1
    `;
    
    let params = [];
    baseQuery += ' ORDER BY razao_social ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const fornecedores = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM fornecedores WHERE status = 1`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/fornecedores/ativos', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(fornecedores, meta.pagination, queryParams);

    return successResponse(res, data, 'Fornecedores ativos listados com sucesso', STATUS_CODES.OK, meta);
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

module.exports = FornecedoresController; 