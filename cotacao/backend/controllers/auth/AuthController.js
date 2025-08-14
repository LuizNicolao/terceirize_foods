const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery, executeTransaction } = require('../../config/database');

/**
 * Controller de Autenticação
 * Gerencia login, logout, refresh token e operações de usuário
 */

class AuthController {
  /**
   * Login do usuário
   * POST /cotacao/api/auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuário no banco
      const users = await executeQuery(
        'SELECT id, name, email, password, role, status FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          error: {
            message: 'Email ou senha inválidos',
            code: 'INVALID_CREDENTIALS'
          }
        });
      }

      const user = users[0];

      // Verificar se o usuário está ativo
      if (user.status !== 'ativo') {
        return res.status(401).json({
          error: {
            message: 'Usuário inativo. Entre em contato com o administrador.',
            code: 'USER_INACTIVE'
          }
        });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: {
            message: 'Email ou senha inválidos',
            code: 'INVALID_CREDENTIALS'
          }
        });
      }

      // Buscar permissões do usuário
      const permissions = await executeQuery(
        'SELECT screen, can_view, can_create, can_edit, can_delete FROM user_permissions WHERE user_id = ?',
        [user.id]
      );

      // Organizar permissões por tela
      const userPermissions = {};
      permissions.forEach(perm => {
        userPermissions[perm.screen] = {
          canView: perm.can_view === 1,
          canCreate: perm.can_create === 1,
          canEdit: perm.can_edit === 1,
          canDelete: perm.can_delete === 1
        };
      });

      // Gerar tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { 
          userId: user.id,
          type: 'refresh'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Salvar refresh token no banco
      await executeTransaction(async (connection) => {
        // Remover tokens antigos do usuário
        await connection.execute(
          'DELETE FROM user_sessions WHERE user_id = ?',
          [user.id]
        );

        // Inserir novo token
        await connection.execute(
          'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
          [user.id, refreshToken]
        );
      });

      // Remover senha do objeto de resposta
      delete user.password;

      res.status(200).json({
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          },
          permissions: userPermissions,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 24 * 60 * 60 // 24 horas em segundos
          }
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }

  /**
   * Logout do usuário
   * POST /cotacao/api/auth/logout
   */
  static async logout(req, res) {
    try {
      const userId = req.user.userId;

      // Remover token do banco
      await executeQuery(
        'DELETE FROM user_sessions WHERE user_id = ?',
        [userId]
      );

      res.status(200).json({
        message: 'Logout realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }

  /**
   * Renovar token de acesso
   * POST /cotacao/api/auth/refresh
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      // Verificar se o refresh token é válido
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          error: {
            message: 'Token inválido',
            code: 'INVALID_TOKEN'
          }
        });
      }

      // Verificar se o token existe no banco
      const sessions = await executeQuery(
        'SELECT * FROM user_sessions WHERE user_id = ? AND token = ? AND expires_at > NOW()',
        [decoded.userId, refreshToken]
      );

      if (sessions.length === 0) {
        return res.status(401).json({
          error: {
            message: 'Token expirado ou inválido',
            code: 'TOKEN_EXPIRED'
          }
        });
      }

      // Buscar dados do usuário
      const users = await executeQuery(
        'SELECT id, name, email, role, status FROM users WHERE id = ? AND status = "ativo"',
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.status(401).json({
          error: {
            message: 'Usuário não encontrado ou inativo',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      const user = users[0];

      // Gerar novo access token
      const newAccessToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'Token renovado com sucesso',
        data: {
          accessToken: newAccessToken,
          expiresIn: 24 * 60 * 60 // 24 horas em segundos
        }
      });

    } catch (error) {
      console.error('Erro ao renovar token:', error);
      res.status(401).json({
        error: {
          message: 'Token inválido',
          code: 'INVALID_TOKEN'
        }
      });
    }
  }

  /**
   * Obter dados do usuário logado
   * GET /cotacao/api/auth/me
   */
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;

      // Buscar dados do usuário
      const users = await executeQuery(
        'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          error: {
            message: 'Usuário não encontrado',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      const user = users[0];

      // Buscar permissões do usuário
      const permissions = await executeQuery(
        'SELECT screen, can_view, can_create, can_edit, can_delete FROM user_permissions WHERE user_id = ?',
        [userId]
      );

      // Organizar permissões por tela
      const userPermissions = {};
      permissions.forEach(perm => {
        userPermissions[perm.screen] = {
          canView: perm.can_view === 1,
          canCreate: perm.can_create === 1,
          canEdit: perm.can_edit === 1,
          canDelete: perm.can_delete === 1
        };
      });

      res.status(200).json({
        data: {
          user,
          permissions: userPermissions
        }
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }

  /**
   * Alterar senha do usuário
   * POST /cotacao/api/auth/change-password
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      // Buscar usuário
      const users = await executeQuery(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          error: {
            message: 'Usuário não encontrado',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      const user = users[0];

      // Verificar senha atual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          error: {
            message: 'Senha atual incorreta',
            code: 'INVALID_PASSWORD'
          }
        });
      }

      // Criptografar nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha
      await executeQuery(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, userId]
      );

      res.status(200).json({
        message: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }

  /**
   * Esqueci minha senha
   * POST /cotacao/api/auth/forgot-password
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Buscar usuário
      const users = await executeQuery(
        'SELECT id, name, email FROM users WHERE email = ? AND status = "ativo"',
        [email]
      );

      if (users.length === 0) {
        // Por segurança, não informar se o email existe ou não
        return res.status(200).json({
          message: 'Se o email existir em nossa base, você receberá as instruções para redefinir sua senha'
        });
      }

      const user = users[0];

      // Gerar token de reset
      const resetToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          type: 'reset'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // TODO: Implementar envio de email
      // Por enquanto, apenas retornar sucesso
      console.log('Token de reset gerado:', resetToken);

      res.status(200).json({
        message: 'Se o email existir em nossa base, você receberá as instruções para redefinir sua senha'
      });

    } catch (error) {
      console.error('Erro ao processar esqueci minha senha:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }

  /**
   * Redefinir senha
   * POST /cotacao/api/auth/reset-password
   */
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type !== 'reset') {
        return res.status(401).json({
          error: {
            message: 'Token inválido',
            code: 'INVALID_TOKEN'
          }
        });
      }

      // Buscar usuário
      const users = await executeQuery(
        'SELECT id FROM users WHERE id = ? AND status = "ativo"',
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          error: {
            message: 'Usuário não encontrado',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      // Criptografar nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha
      await executeQuery(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, decoded.userId]
      );

      res.status(200).json({
        message: 'Senha redefinida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(401).json({
        error: {
          message: 'Token inválido ou expirado',
          code: 'INVALID_TOKEN'
        }
      });
    }
  }
}

module.exports = AuthController;
