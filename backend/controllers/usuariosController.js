/**
 * Controller de Usuários
 * Implementa todas as operações CRUD com padrões RESTful, HATEOAS e paginação
 */

const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  conflictResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../middleware/responseHandler');
const { asyncHandler } = require('../middleware/responseHandler');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const { atualizarPermissoesPorTipoNivel } = require('../routes/permissoes');

class UsuariosController {
  
  /**
   * Listar usuários com paginação, busca e HATEOAS
   */
  static listarUsuarios = asyncHandler(async (req, res) => {
    const { search = '', page = 1 } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, 
        nome, 
        email, 
        nivel_de_acesso, 
        tipo_de_acesso, 
        status, 
        criado_em, 
        atualizado_em 
      FROM usuarios 
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtro de busca
    if (search) {
      baseQuery += ' AND (nome LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    baseQuery += ' ORDER BY nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    console.log('Query executada:', query);
    console.log('Parâmetros:', params);
    const usuarios = await executeQuery(query, params);
    console.log('Usuários retornados:', usuarios);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM usuarios WHERE 1=1${search ? ' AND (nome LIKE ? OR email LIKE ?)' : ''}`;
    const countParams = search ? [`%${search}%`, `%${search}%`] : [];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/usuarios', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(usuarios, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Usuários listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Buscar usuário por ID
   */
  static buscarUsuarioPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const usuarios = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status, criado_em, atualizado_em FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return notFoundResponse(res, 'Usuário não encontrado');
    }

    const usuario = usuarios[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(usuario);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, usuario.id);

    return successResponse(res, data, 'Usuário encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Criar novo usuário
   */
  static criarUsuario = asyncHandler(async (req, res) => {
    const { nome, email, senha, nivel_de_acesso, tipo_de_acesso } = req.body;

    // Verificar se email já existe
    const existingUser = await executeQuery(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return conflictResponse(res, 'Email já cadastrado');
    }

    // Criptografar senha
    const saltRounds = 12;
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

    // Inserir usuário
    const result = await executeQuery(
      'INSERT INTO usuarios (nome, email, senha, nivel_de_acesso, tipo_de_acesso, status, criado_em) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [nome, email, senhaCriptografada, nivel_de_acesso, tipo_de_acesso, 'ativo']
    );

    const novoUsuarioId = result.insertId;

    // Buscar usuário criado
    const usuarios = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status, criado_em, atualizado_em FROM usuarios WHERE id = ?',
      [novoUsuarioId]
    );

    const usuario = usuarios[0];

    // Atualizar permissões baseado no tipo de acesso
    await atualizarPermissoesPorTipoNivel(novoUsuarioId, tipo_de_acesso, nivel_de_acesso);

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(usuario);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, usuario.id);

    return successResponse(res, data, 'Usuário criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar usuário
   */
  static atualizarUsuario = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, email, nivel_de_acesso, tipo_de_acesso, status } = req.body;

    // Verificar se usuário existe
    const existingUser = await executeQuery(
      'SELECT id, email FROM usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return notFoundResponse(res, 'Usuário não encontrado');
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== existingUser[0].email) {
      const emailExists = await executeQuery(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailExists.length > 0) {
        return conflictResponse(res, 'Email já cadastrado');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];

    if (nome !== undefined) {
      updateFields.push('nome = ?');
      updateParams.push(nome);
    }

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateParams.push(email);
    }

    if (nivel_de_acesso !== undefined) {
      updateFields.push('nivel_de_acesso = ?');
      updateParams.push(nivel_de_acesso);
    }

    if (tipo_de_acesso !== undefined) {
      updateFields.push('tipo_de_acesso = ?');
      updateParams.push(tipo_de_acesso);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('atualizado_em = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Atualizar permissões se tipo de acesso ou nível foram alterados
    if (tipo_de_acesso !== undefined || nivel_de_acesso !== undefined) {
      const currentUser = await executeQuery(
        'SELECT tipo_de_acesso, nivel_de_acesso FROM usuarios WHERE id = ?',
        [id]
      );
      
      const currentTipo = tipo_de_acesso || currentUser[0].tipo_de_acesso;
      const currentNivel = nivel_de_acesso || currentUser[0].nivel_de_acesso;
      
      await atualizarPermissoesPorTipoNivel(id, currentTipo, currentNivel);
    }

    // Buscar usuário atualizado
    const usuarios = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status, criado_em, atualizado_em FROM usuarios WHERE id = ?',
      [id]
    );

    const usuario = usuarios[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(usuario);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, usuario.id);

    return successResponse(res, data, 'Usuário atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir usuário
   */
  static excluirUsuario = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se usuário existe
    const existingUser = await executeQuery(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return notFoundResponse(res, 'Usuário não encontrado');
    }

    // Verificar se não é o último administrador
    const adminCount = await executeQuery(
      'SELECT COUNT(*) as count FROM usuarios WHERE tipo_de_acesso = "administrador" AND status = "ativo"',
      []
    );

    const userToDelete = await executeQuery(
      'SELECT tipo_de_acesso FROM usuarios WHERE id = ?',
      [id]
    );

    if (adminCount[0].count <= 1 && userToDelete[0].tipo_de_acesso === 'administrador') {
      return errorResponse(res, 'Não é possível excluir o último administrador', STATUS_CODES.BAD_REQUEST);
    }

    // Excluir usuário (soft delete - alterar status para inativo)
    await executeQuery(
      'UPDATE usuarios SET status = "inativo", atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Usuário excluído com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Alterar senha do usuário
   */
  static alterarSenha = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { senha_atual, nova_senha } = req.body;

    // Verificar se usuário existe
    const usuarios = await executeQuery(
      'SELECT id, senha FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return notFoundResponse(res, 'Usuário não encontrado');
    }

    const usuario = usuarios[0];

    // Verificar senha atual (se fornecida)
    if (senha_atual) {
      const senhaValida = await bcrypt.compare(senha_atual, usuario.senha);
      if (!senhaValida) {
        return errorResponse(res, 'Senha atual incorreta', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Criptografar nova senha
    const saltRounds = 12;
    const novaSenhaCriptografada = await bcrypt.hash(nova_senha, saltRounds);

    // Atualizar senha
    await executeQuery(
      'UPDATE usuarios SET senha = ?, atualizado_em = NOW() WHERE id = ?',
      [novaSenhaCriptografada, id]
    );

    return successResponse(res, null, 'Senha alterada com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar usuários por tipo de acesso
   */
  static buscarPorTipoAcesso = asyncHandler(async (req, res) => {
    const { tipo } = req.params;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, 
        nome, 
        email, 
        nivel_de_acesso, 
        tipo_de_acesso, 
        status, 
        criado_em, 
        atualizado_em 
      FROM usuarios 
      WHERE tipo_de_acesso = ? AND status = 'ativo'
    `;
    
    let params = [tipo];
    baseQuery += ' ORDER BY nome ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const usuarios = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM usuarios WHERE tipo_de_acesso = ? AND status = 'ativo'`;
    const totalResult = await executeQuery(countQuery, [tipo]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/usuarios/tipo/${tipo}`, queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(usuarios, meta.pagination, queryParams);

    return successResponse(res, data, `Usuários do tipo ${tipo} listados com sucesso`, STATUS_CODES.OK, meta);
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

module.exports = UsuariosController; 