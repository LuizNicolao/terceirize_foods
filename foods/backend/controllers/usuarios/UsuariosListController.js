/**
 * Controller de Listagem de Usuários
 * Responsável por listar e buscar usuários
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { paginatedResponse } = require('../../middleware/pagination');

class UsuariosListController {
  
  /**
   * Listar usuários com paginação, busca e HATEOAS
   */
  static listarUsuarios = asyncHandler(async (req, res) => {
    const { search = '' } = req.query;

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

    // Usar a função padronizada de paginação
    const result = await paginatedResponse(req, res, baseQuery, params, '/api/usuarios');
    
    // Adicionar links HATEOAS
    const data = res.addListLinks(result.data, result.meta.pagination, req.query);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Usuários listados com sucesso', STATUS_CODES.OK, {
      ...result.meta,
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
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões baseada no usuário
    // Por enquanto, retorna permissões básicas
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = UsuariosListController;
