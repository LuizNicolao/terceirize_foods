const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

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
  // Listar todos os usuários
  static async listarUsuarios(req, res) {
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

  // Buscar usuário específico
  static async buscarUsuario(req, res) {
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

  // Criar novo usuário
  static async criarUsuario(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { name, email, password, role, status = 'ativo', permissions = [] } = req.body;

      // Verificar se email já existe
      const [existingUsers] = await connection.execute(`
        SELECT id FROM users WHERE email = ?
      `, [email]);

      if (existingUsers.length > 0) {
        await connection.rollback();
        await connection.release();
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserir usuário
      const [result] = await connection.execute(`
        INSERT INTO users (name, email, password, role, status)
        VALUES (?, ?, ?, ?, ?)
      `, [name, email, hashedPassword, role, status]);

      const userId = result.insertId;

      // Inserir permissões padrão se fornecidas
      if (permissions.length > 0) {
        const permissionValues = permissions.map(perm => [
          userId,
          perm.screen,
          perm.can_view || false,
          perm.can_create || false,
          perm.can_edit || false,
          perm.can_delete || false
        ]);

        await connection.execute(`
          INSERT INTO user_permissions (user_id, screen, can_view, can_create, can_edit, can_delete)
          VALUES ?
        `, [permissionValues]);
      }

      await connection.commit();
      await connection.release();

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        userId
      });
    } catch (error) {
      await connection.rollback();
      await connection.release();
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar usuário
  static async atualizarUsuario(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { name, email, password, role, status, permissions = [] } = req.body;
      const userId = req.params.id;

      // Verificar se usuário existe
      const [existingUsers] = await connection.execute(`
        SELECT id FROM users WHERE id = ?
      `, [userId]);

      if (existingUsers.length === 0) {
        await connection.rollback();
        await connection.release();
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verificar se email já existe (exceto para o próprio usuário)
      if (email) {
        const [emailCheck] = await connection.execute(`
          SELECT id FROM users WHERE email = ? AND id != ?
        `, [email, userId]);

        if (emailCheck.length > 0) {
          await connection.rollback();
          await connection.release();
          return res.status(400).json({ message: 'Email já cadastrado' });
        }
      }

      // Preparar dados para atualização
      const updateData = {};
      const updateParams = [];

      if (name) {
        updateData.name = name;
        updateParams.push(name);
      }
      if (email) {
        updateData.email = email;
        updateParams.push(email);
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
        updateParams.push(hashedPassword);
      }
      if (role) {
        updateData.role = role;
        updateParams.push(role);
      }
      if (status) {
        updateData.status = status;
        updateParams.push(status);
      }

      // Atualizar usuário
      if (Object.keys(updateData).length > 0) {
        const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        updateParams.push(userId);

        await connection.execute(`
          UPDATE users SET ${updateFields}, updated_at = NOW() WHERE id = ?
        `, updateParams);
      }

      // Atualizar permissões se fornecidas
      if (permissions.length > 0) {
        // Remover permissões existentes
        await connection.execute(`
          DELETE FROM user_permissions WHERE user_id = ?
        `, [userId]);

        // Inserir novas permissões
        const permissionValues = permissions.map(perm => [
          userId,
          perm.screen,
          perm.can_view || false,
          perm.can_create || false,
          perm.can_edit || false,
          perm.can_delete || false
        ]);

        await connection.execute(`
          INSERT INTO user_permissions (user_id, screen, can_view, can_create, can_edit, can_delete)
          VALUES ?
        `, [permissionValues]);
      }

      await connection.commit();
      await connection.release();

      res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      await connection.rollback();
      await connection.release();
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Deletar usuário
  static async deletarUsuario(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const userId = req.params.id;

      // Verificar se usuário existe
      const [existingUsers] = await connection.execute(`
        SELECT id FROM users WHERE id = ?
      `, [userId]);

      if (existingUsers.length === 0) {
        await connection.rollback();
        await connection.release();
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Remover permissões do usuário
      await connection.execute(`
        DELETE FROM user_permissions WHERE user_id = ?
      `, [userId]);

      // Remover usuário
      await connection.execute(`
        DELETE FROM users WHERE id = ?
      `, [userId]);

      await connection.commit();
      await connection.release();

      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      await connection.rollback();
      await connection.release();
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar usuários por role
  static async buscarUsuariosPorRole(req, res) {
    try {
      const connection = await pool.getConnection();
      
      const { role } = req.params;
      
      const [rows] = await connection.execute(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users 
        WHERE role = ?
        ORDER BY name
      `, [role]);

      await connection.release();
      
      res.json(rows);
    } catch (error) {
      console.error('Erro ao buscar usuários por role:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Buscar usuários ativos
  static async buscarUsuariosAtivos(req, res) {
    try {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT id, name, email, role, status, created_at, updated_at
        FROM users 
        WHERE status = 'ativo'
        ORDER BY name
      `);

      await connection.release();
      
      res.json(rows);
    } catch (error) {
      console.error('Erro ao buscar usuários ativos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

module.exports = UsuariosController;
