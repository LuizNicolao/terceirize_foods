const bcrypt = require('bcryptjs');
const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  conflictResponse,
  asyncHandler 
} = require('../../middleware/responseHandler');

class UsuariosController {
  // GET /api/users - Listar todos os usuários
  static getUsuarios = asyncHandler(async (req, res) => {
    try {
      console.log('Iniciando busca de usuários...');

      const usuarios = await executeQuery(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users
        ORDER BY name
      `);

      // Adicionar links HATEOAS
      const responseData = res.addHateoasLinks(usuarios);

      return successResponse(res, responseData, 'Usuários carregados com sucesso');
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  });

  // GET /api/users/:id - Buscar usuário específico
  static getUsuario = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const usuarios = await executeQuery(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users WHERE id = ?
      `, [id]);

      if (usuarios.length === 0) {
        return notFoundResponse(res, 'Usuário não encontrado');
      }

      const usuario = usuarios[0];

      // Buscar permissões do usuário
      const permissions = await executeQuery(`
        SELECT screen, can_view, can_create, can_edit, can_delete
        FROM user_permissions WHERE user_id = ?
      `, [id]);

      const usuarioCompleto = {
        ...usuario,
        permissions
      };

      // Adicionar links HATEOAS
      const responseData = res.addHateoasLinks(usuarioCompleto);

      return successResponse(res, responseData, 'Usuário carregado com sucesso');
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  });

  // GET /api/users/by-email/:email - Buscar usuário por email
  static getUsuarioByEmail = asyncHandler(async (req, res) => {
    try {
      const { email } = req.params;

      const usuarios = await executeQuery(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users WHERE email = ?
      `, [email]);

      if (usuarios.length === 0) {
        return notFoundResponse(res, 'Usuário não encontrado');
      }

      const usuario = usuarios[0];

      // Buscar permissões do usuário
      const permissions = await executeQuery(`
        SELECT screen, can_view, can_create, can_edit, can_delete
        FROM user_permissions WHERE user_id = ?
      `, [usuario.id]);

      const usuarioCompleto = {
        ...usuario,
        permissions
      };

      // Adicionar links HATEOAS
      const responseData = res.addHateoasLinks(usuarioCompleto);

      return successResponse(res, responseData, 'Usuário carregado com sucesso');
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  });

  // POST /api/users - Criar novo usuário
  static createUsuario = asyncHandler(async (req, res) => {
    try {
      const { name, email, password, role, status, permissions } = req.body;

      // Verificar se email já existe
      const existingUsers = await executeQuery(`
        SELECT id FROM users WHERE email = ?
      `, [email]);

      if (existingUsers.length > 0) {
        return conflictResponse(res, 'Email já cadastrado');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserir usuário
      const result = await executeQuery(`
        INSERT INTO users (name, email, password, role, status)
        VALUES (?, ?, ?, ?, ?)
      `, [name, email, hashedPassword, role, status]);

      const userId = result.insertId;

      // Inserir permissões se fornecidas
      if (permissions && permissions.length > 0) {
        for (const permission of permissions) {
          await executeQuery(`
            INSERT INTO user_permissions (user_id, screen, can_view, can_create, can_edit, can_delete)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            userId,
            permission.screen,
            permission.can_view || false,
            permission.can_create || false,
            permission.can_edit || false,
            permission.can_delete || false
          ]);
        }
      }

      // Buscar usuário criado
      const newUser = await executeQuery(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users WHERE id = ?
      `, [userId]);

      // Adicionar links HATEOAS
      const responseData = res.addHateoasLinks(newUser[0]);

      return successResponse(res, responseData, 'Usuário criado com sucesso', 201);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  });

  // PUT /api/users/:id - Atualizar usuário
  static updateUsuario = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, password, role, status, permissions } = req.body;

      // Verificar se usuário existe
      const existingUsers = await executeQuery(`
        SELECT id FROM users WHERE id = ?
      `, [id]);

      if (existingUsers.length === 0) {
        return notFoundResponse(res, 'Usuário não encontrado');
      }

      // Verificar se email já existe (exceto para o próprio usuário)
      if (email) {
        const emailUsers = await executeQuery(`
          SELECT id FROM users WHERE email = ? AND id != ?
        `, [email, id]);

        if (emailUsers.length > 0) {
          return conflictResponse(res, 'Email já cadastrado');
        }
      }

      // Preparar dados para atualização
      const updateData = [];
      const updateFields = [];

      if (name) {
        updateFields.push('name = ?');
        updateData.push(name);
      }

      if (email) {
        updateFields.push('email = ?');
        updateData.push(email);
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.push('password = ?');
        updateData.push(hashedPassword);
      }

      if (role) {
        updateFields.push('role = ?');
        updateData.push(role);
      }

      if (status) {
        updateFields.push('status = ?');
        updateData.push(status);
      }

      updateData.push(id);

      // Atualizar usuário
      await executeQuery(`
        UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, updateData);

      // Atualizar permissões se fornecidas
      if (permissions) {
        // Remover permissões existentes
        await executeQuery(`
          DELETE FROM user_permissions WHERE user_id = ?
        `, [id]);

        // Inserir novas permissões
        for (const permission of permissions) {
          await executeQuery(`
            INSERT INTO user_permissions (user_id, screen, can_view, can_create, can_edit, can_delete)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            id,
            permission.screen,
            permission.can_view || false,
            permission.can_create || false,
            permission.can_edit || false,
            permission.can_delete || false
          ]);
        }
      }

      // Buscar usuário atualizado
      const updatedUser = await executeQuery(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users WHERE id = ?
      `, [id]);

      // Adicionar links HATEOAS
      const responseData = res.addHateoasLinks(updatedUser[0]);

      return successResponse(res, responseData, 'Usuário atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  });

  // DELETE /api/users/:id - Excluir usuário
  static deleteUsuario = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar se usuário existe
      const existingUsers = await executeQuery(`
        SELECT id FROM users WHERE id = ?
      `, [id]);

      if (existingUsers.length === 0) {
        return notFoundResponse(res, 'Usuário não encontrado');
      }

      // Excluir permissões do usuário
      await executeQuery(`
        DELETE FROM user_permissions WHERE user_id = ?
      `, [id]);

      // Excluir usuário
      await executeQuery(`
        DELETE FROM users WHERE id = ?
      `, [id]);

      return successResponse(res, null, 'Usuário excluído com sucesso', 204);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  });
}

module.exports = UsuariosController;
