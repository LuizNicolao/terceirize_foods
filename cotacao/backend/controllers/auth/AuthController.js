const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  asyncHandler 
} = require('../../middleware/responseHandler');

class AuthController {
  // Login
  static login = asyncHandler(async (req, res) => {
    const { email, senha, rememberMe } = req.body;

    // Buscar usuário por email
    const users = await executeQuery(`
      SELECT id, name, email, password, role, status
      FROM users WHERE email = ?
    `, [email]);

    if (users.length === 0) {
      return unauthorizedResponse(res, 'Credenciais inválidas');
    }

    const user = users[0];

    // Verificar se o usuário está ativo
    if (user.status !== 'ativo') {
      return unauthorizedResponse(res, 'Usuário inativo');
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, user.password);
    if (!isValidPassword) {
      return unauthorizedResponse(res, 'Credenciais inválidas');
    }

    // Gerar token JWT com expiração baseada no rememberMe
    const expiresIn = rememberMe ? '30d' : (process.env.NODE_ENV === 'development' ? '7d' : '24h');
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Retornar dados do usuário (sem senha) e token
    const { password: _, ...userWithoutPassword } = user;

    // Adicionar links HATEOAS
    const responseData = res.addHateoasLinks({
      user: userWithoutPassword,
      token
    });

    return successResponse(
      res, 
      responseData, 
      'Login realizado com sucesso', 
      200
    );
  });

  // Verificar token
  static verifyToken = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return unauthorizedResponse(res, 'Token não fornecido');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar dados atualizados do usuário
    const users = await executeQuery(`
      SELECT id, name, email, role, status
      FROM users WHERE id = ?
    `, [decoded.id]);

    if (users.length === 0) {
      return unauthorizedResponse(res, 'Usuário não encontrado');
    }

    const user = users[0];

    if (user.status !== 'ativo') {
      return unauthorizedResponse(res, 'Usuário inativo');
    }

    // Adicionar links HATEOAS
    const responseData = res.addHateoasLinks({
      user,
      valid: true
    });

    return successResponse(res, responseData, 'Token válido');
  });

  // Logout
  static logout = asyncHandler(async (req, res) => {
    // Em uma implementação mais robusta, você poderia invalidar o token
    // Por exemplo, adicionando à uma blacklist
    
    return successResponse(res, null, 'Logout realizado com sucesso', 200);
  });

  // SSO Login
  static ssoLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;

    // Aqui você implementaria a lógica de validação do token SSO
    // Por enquanto, vamos simular uma validação
    
    // Simular busca de usuário por token SSO
    const users = await executeQuery(`
      SELECT id, name, email, role, status
      FROM users WHERE email = 'admin@example.com'
    `);

    if (users.length === 0) {
      return unauthorizedResponse(res, 'Token SSO inválido');
    }

    const user = users[0];

    if (user.status !== 'ativo') {
      return unauthorizedResponse(res, 'Usuário inativo');
    }

    // Gerar novo token JWT
    const jwtToken = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Adicionar links HATEOAS
    const responseData = res.addHateoasLinks({
      user,
      token: jwtToken
    });

    return successResponse(
      res, 
      responseData, 
      'SSO Login realizado com sucesso', 
      200
    );
  });

  // Buscar permissões do usuário
  static getUserPermissions = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const permissionsArray = await executeQuery(`
      SELECT screen, can_view, can_create, can_edit, can_delete
      FROM user_permissions WHERE user_id = ?
    `, [userId]);

    // Converter array para objeto
    const permissions = {};
    permissionsArray.forEach(perm => {
      permissions[perm.screen] = {
        can_view: Boolean(perm.can_view),
        can_create: Boolean(perm.can_create),
        can_edit: Boolean(perm.can_edit),
        can_delete: Boolean(perm.can_delete)
      };
    });

    // Adicionar links HATEOAS
    const responseData = res.addHateoasLinks({
      permissions,
      userId
    });

    return successResponse(res, responseData, 'Permissões carregadas com sucesso');
  });
}

module.exports = AuthController;
