const mysql = require('mysql2/promise');

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cotacao_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexões
const pool = mysql.createPool(dbConfig);

class UsuariosController {
  // GET /api/users - Listar todos os usuários
  static async getUsuarios(req, res) {
    try {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users
        ORDER BY name
      `);

      await connection.release();
      
      res.json(rows);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // GET /api/users/:id - Buscar usuário específico
  static async getUsuario(req, res) {
    try {
      const connection = await pool.getConnection();
      
      const [users] = await connection.execute(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users WHERE id = ?
      `, [req.params.id]);

      if (users.length === 0) {
        await connection.release();
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const user = users[0];

      // Buscar permissões do usuário
      const [permissions] = await connection.execute(`
        SELECT screen, can_view, can_create, can_edit, can_delete
        FROM user_permissions WHERE user_id = ?
      `, [req.params.id]);

      await connection.release();
      
      res.json({
        ...user,
        permissions
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // POST /api/users - Criar novo usuário
  static async createUsuario(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { name, email, password, role, status = 'ativo' } = req.body;

      // Validações básicas
      if (!name || !email || !password || !role) {
        return res.status(400).json({ 
          message: 'Nome, email, senha e tipo são obrigatórios' 
        });
      }

      // Verificar se o email já existe
      const [existingUsers] = await connection.execute(`
        SELECT id FROM users WHERE email = ?
      `, [email]);

      if (existingUsers.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      // Hash da senha
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserir usuário
      const [result] = await connection.execute(`
        INSERT INTO users (name, email, password, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [name, email, hashedPassword, role, status]);

      const userId = result.insertId;

      // Inserir permissões padrão baseadas no role
      const defaultPermissions = this.getDefaultPermissions(role);
      
      for (const permission of defaultPermissions) {
        await connection.execute(`
          INSERT INTO user_permissions (user_id, screen, can_view, can_create, can_edit, can_delete)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, permission.screen, permission.can_view, permission.can_create, permission.can_edit, permission.can_delete]);
      }

      await connection.commit();

      res.status(201).json({ 
        message: 'Usuário criado com sucesso',
        userId 
      });
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    } finally {
      await connection.release();
    }
  }

  // PUT /api/users/:id - Atualizar usuário
  static async updateUsuario(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { name, email, role, status } = req.body;
      const userId = req.params.id;

      // Verificar se o usuário existe
      const [existingUsers] = await connection.execute(`
        SELECT id FROM users WHERE id = ?
      `, [userId]);

      if (existingUsers.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verificar se o email já existe (exceto para o próprio usuário)
      if (email) {
        const [emailCheck] = await connection.execute(`
          SELECT id FROM users WHERE email = ? AND id != ?
        `, [email, userId]);

        if (emailCheck.length > 0) {
          await connection.rollback();
          return res.status(400).json({ message: 'Email já cadastrado' });
        }
      }

      // Atualizar usuário
      const updateFields = [];
      const updateValues = [];

      if (name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (role) {
        updateFields.push('role = ?');
        updateValues.push(role);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(userId);

      await connection.execute(`
        UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
      `, updateValues);

      await connection.commit();

      res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    } finally {
      await connection.release();
    }
  }

  // DELETE /api/users/:id - Excluir usuário
  static async deleteUsuario(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const userId = req.params.id;

      // Verificar se o usuário existe
      const [existingUsers] = await connection.execute(`
        SELECT id FROM users WHERE id = ?
      `, [userId]);

      if (existingUsers.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Excluir permissões do usuário
      await connection.execute(`
        DELETE FROM user_permissions WHERE user_id = ?
      `, [userId]);

      // Excluir sessões do usuário
      await connection.execute(`
        DELETE FROM user_sessions WHERE user_id = ?
      `, [userId]);

      // Excluir usuário
      await connection.execute(`
        DELETE FROM users WHERE id = ?
      `, [userId]);

      await connection.commit();

      res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    } finally {
      await connection.release();
    }
  }

  // GET /api/users/:id/permissions - Buscar permissões do usuário
  static async getUsuarioPermissions(req, res) {
    try {
      const connection = await pool.getConnection();
      
      const [permissions] = await connection.execute(`
        SELECT screen, can_view, can_create, can_edit, can_delete
        FROM user_permissions WHERE user_id = ?
      `, [req.params.id]);

      await connection.release();
      
      res.json(permissions);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // PUT /api/users/:id/permissions - Atualizar permissões do usuário
  static async updateUsuarioPermissions(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const userId = req.params.id;
      const { permissions } = req.body;

      // Verificar se o usuário existe
      const [existingUsers] = await connection.execute(`
        SELECT id FROM users WHERE id = ?
      `, [userId]);

      if (existingUsers.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Excluir permissões existentes
      await connection.execute(`
        DELETE FROM user_permissions WHERE user_id = ?
      `, [userId]);

      // Inserir novas permissões
      for (const permission of permissions) {
        await connection.execute(`
          INSERT INTO user_permissions (user_id, screen, can_view, can_create, can_edit, can_delete)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, permission.screen, permission.can_view, permission.can_create, permission.can_edit, permission.can_delete]);
      }

      await connection.commit();

      res.json({ message: 'Permissões atualizadas com sucesso' });
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao atualizar permissões:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    } finally {
      await connection.release();
    }
  }

  // POST /api/users/:id/change-password - Alterar senha
  static async changePassword(req, res) {
    const connection = await pool.getConnection();
    
    try {
      const userId = req.params.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: 'Senha atual e nova senha são obrigatórias' 
        });
      }

      // Buscar senha atual
      const [users] = await connection.execute(`
        SELECT password FROM users WHERE id = ?
      `, [userId]);

      if (users.length === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verificar senha atual
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);

      if (!isValidPassword) {
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha
      await connection.execute(`
        UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?
      `, [hashedPassword, userId]);

      await connection.release();

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // POST /api/users/:id/activate - Ativar usuário
  static async activateUsuario(req, res) {
    try {
      const connection = await pool.getConnection();
      
      const [result] = await connection.execute(`
        UPDATE users SET status = 'ativo', updated_at = NOW() WHERE id = ?
      `, [req.params.id]);

      await connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({ message: 'Usuário ativado com sucesso' });
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // POST /api/users/:id/deactivate - Desativar usuário
  static async deactivateUsuario(req, res) {
    try {
      const connection = await pool.getConnection();
      
      const [result] = await connection.execute(`
        UPDATE users SET status = 'inativo', updated_at = NOW() WHERE id = ?
      `, [req.params.id]);

      await connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({ message: 'Usuário desativado com sucesso' });
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Método auxiliar para obter permissões padrão baseadas no role
  static getDefaultPermissions(role) {
    const permissions = {
      administrador: [
        { screen: 'usuarios', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
        { screen: 'cotacoes', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
        { screen: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
        { screen: 'saving', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 }
      ],
      gestor: [
        { screen: 'usuarios', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
        { screen: 'cotacoes', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
        { screen: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
        { screen: 'saving', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 }
      ],
      supervisor: [
        { screen: 'usuarios', can_view: 0, can_create: 0, can_edit: 0, can_delete: 0 },
        { screen: 'cotacoes', can_view: 1, can_create: 0, can_edit: 1, can_delete: 0 },
        { screen: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
        { screen: 'saving', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 }
      ],
      comprador: [
        { screen: 'usuarios', can_view: 0, can_create: 0, can_edit: 0, can_delete: 0 },
        { screen: 'cotacoes', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
        { screen: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
        { screen: 'saving', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 }
      ]
    };

    return permissions[role] || permissions.comprador;
  }
}

module.exports = UsuariosController;
