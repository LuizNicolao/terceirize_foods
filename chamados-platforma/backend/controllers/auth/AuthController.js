/**
 * Controller de Autenticação
 * Responsável por login, logout e validação de tokens
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../../config/database');
const { generateToken } = require('../../middleware/auth');

// Controle de tentativas de login (em memória)
const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MINUTES = 30;

class AuthController {
  
  /**
   * Realizar login
   */
  static async login(req, res) {
    try {
      const { email, senha, rememberMe = false } = req.body;
      const now = Date.now();

      // Inicializar tentativas
      if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 0, lastAttempt: now, blockedUntil: null };
      }

      // Verificar se está bloqueado temporariamente
      if (loginAttempts[email].blockedUntil && now < loginAttempts[email].blockedUntil) {
        return res.status(403).json({ error: `Usuário temporariamente bloqueado por tentativas inválidas. Tente novamente em alguns minutos.` });
      }

      // Buscar usuário
      const usuarios = await executeQuery(
        'SELECT id, nome, email, senha, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE email = ?',
        [email]
      );

      if (usuarios.length === 0) {
        loginAttempts[email].count++;
        loginAttempts[email].lastAttempt = now;
        if (loginAttempts[email].count >= MAX_ATTEMPTS) {
          loginAttempts[email].blockedUntil = now + BLOCK_TIME_MINUTES * 60 * 1000;
        }
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      const usuario = usuarios[0];

      // Se já estiver bloqueado permanentemente
      if (usuario.status === 'bloqueado') {
        return res.status(403).json({ error: 'Usuário bloqueado. Procure o administrador.' });
      }

      // Se não estiver ativo
      if (usuario.status !== 'ativo') {
        return res.status(401).json({ error: 'Usuário inativo' });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(senha, usuario.senha);

      if (!isValidPassword) {
        loginAttempts[email].count++;
        loginAttempts[email].lastAttempt = now;
        if (loginAttempts[email].count >= MAX_ATTEMPTS) {
          loginAttempts[email].blockedUntil = now + BLOCK_TIME_MINUTES * 60 * 1000;
          return res.status(403).json({ error: 'Usuário temporariamente bloqueado por tentativas inválidas. Tente novamente em alguns minutos.' });
        }
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      // Login bem-sucedido: resetar tentativas
      loginAttempts[email] = { count: 0, lastAttempt: now, blockedUntil: null };

      // Gerar token com duração baseada na opção "Mantenha-me conectado"
      const tokenExpiration = rememberMe ? '30d' : '24h';
      const token = await generateToken(usuario.id, tokenExpiration);

      // Remover senha do objeto de resposta
      const { senha: _, ...userWithoutPassword } = usuario;

      res.json({
        message: 'Login realizado com sucesso',
        user: userWithoutPassword,
        token,
        rememberMe: rememberMe,
        tokenExpiration: tokenExpiration
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Verificar token
   */
  static async verifyToken(req, res) {
    try {
      const user = req.user;
      res.json({
        valid: true,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          nivel_de_acesso: user.nivel_de_acesso,
          tipo_de_acesso: user.tipo_de_acesso
        }
      });
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Logout (apenas limpar token no frontend)
   */
  static async logout(req, res) {
    try {
      res.json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = AuthController;

