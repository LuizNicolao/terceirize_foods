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

    if (!token) {
      return unauthorizedResponse(res, 'Token SSO não fornecido');
    }

    try {
      // Validar token SSO com o secret compartilhado
      const ssoSecret = process.env.SSO_SECRET || process.env.JWT_SECRET;
      const decoded = jwt.verify(token, ssoSecret);

      // Verificar se o token é do sistema Foods
      if (decoded.sistema !== 'foods') {
        return unauthorizedResponse(res, 'Token SSO inválido - sistema não reconhecido');
      }

      // Buscar usuário por email
      let users = await executeQuery(`
        SELECT id, name, email, role, status
        FROM users WHERE email = ?
      `, [decoded.email]);

      let user;

      // Se usuário não existe, criar automaticamente
      if (users.length === 0) {
        console.log(`📝 Criando usuário SSO: ${decoded.email}`);
        
        // Mapear role do Foods para role da Cotação
        const roleMap = {
          'administrador': 'administrador',
          'gestor': 'gestor',
          'nutricionista': 'comprador',
          'supervisor': 'supervisor'
        };
        const mappedRole = roleMap[decoded.tipo_de_acesso] || 'comprador';

        // Criar usuário sem senha (SSO only)
        const result = await executeQuery(`
          INSERT INTO users (name, email, password, role, status, created_at)
          VALUES (?, ?, ?, ?, 'ativo', NOW())
        `, [
          decoded.nome,
          decoded.email,
          '$2a$10$SSOUSER.NO.PASSWORD.HASH', // Hash placeholder para SSO
          mappedRole
        ]);

        // Criar permissões padrão baseadas no role
        const userId = result.insertId;
        await AuthController.createDefaultPermissions(userId, mappedRole);

        // Buscar usuário recém-criado
        users = await executeQuery(`
          SELECT id, name, email, role, status
          FROM users WHERE id = ?
        `, [userId]);
      }

      user = users[0];

      // Verificar se usuário está ativo
      if (user.status !== 'ativo') {
        return unauthorizedResponse(res, 'Usuário inativo');
      }

      console.log(`✅ SSO Login bem-sucedido: ${user.email}`);

      // Gerar token JWT da Cotação
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

    } catch (error) {
      console.error('❌ Erro na validação SSO:', error.message);
      return unauthorizedResponse(res, 'Token SSO inválido ou expirado');
    }
  });

  // Helper: Criar permissões padrão para usuário SSO
  static async createDefaultPermissions(userId, role) {
    const screens = ['cotacoes', 'fornecedores', 'produtos', 'aprovacoes'];
    
    // Definir permissões baseadas no role
    const permissions = {
      'administrador': { view: 1, create: 1, edit: 1, delete: 1 },
      'gestor': { view: 1, create: 1, edit: 1, delete: 0 },
      'supervisor': { view: 1, create: 1, edit: 1, delete: 0 },
      'comprador': { view: 1, create: 1, edit: 0, delete: 0 }
    };

    const userPerms = permissions[role] || permissions['comprador'];

    for (const screen of screens) {
      await executeQuery(`
        INSERT INTO user_permissions (user_id, screen, can_view, can_create, can_edit, can_delete)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userId,
        screen,
        userPerms.view,
        userPerms.create,
        userPerms.edit,
        userPerms.delete
      ]);
    }

    console.log(`✅ Permissões padrão criadas para usuário ${userId} (${role})`);
  }

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
