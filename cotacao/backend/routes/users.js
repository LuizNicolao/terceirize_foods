const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// GET /api/users - Listar todos os usuários
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await executeQuery(`
      SELECT id, name, email, role, status, created_at, updated_at
      FROM users
      ORDER BY name
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/users/:id - Buscar usuário específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const users = await executeQuery(`
      SELECT id, name, email, role, status, created_at, updated_at
      FROM users WHERE id = ?
    `, [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const user = users[0];

    // Buscar permissões do usuário
    const permissions = await executeQuery(`
      SELECT screen, can_view, can_create, can_edit, can_delete
      FROM user_permissions WHERE user_id = ?
    `, [req.params.id]);
    
    res.json({
      ...user,
      permissions
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/users - Criar novo usuário
router.post('/', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { name, email, password, role, status, permissions } = req.body;

    // Verificar se email já existe
    const [existingUsers] = await connection.execute(`
      SELECT id FROM users WHERE email = ?
    `, [email]);

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir usuário
    const [userResult] = await connection.execute(`
      INSERT INTO users (name, email, password, role, status)
      VALUES (?, ?, ?, ?, ?)
    `, [name, email, hashedPassword, role, status]);

    const userId = userResult.insertId;

    // Inserir permissões padrão se não fornecidas
    const defaultPermissions = permissions || [
      { screen: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { screen: 'usuarios', can_view: 0, can_create: 0, can_edit: 0, can_delete: 0 },
      { screen: 'cotacoes', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { screen: 'nova-cotacao', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { screen: 'visualizar-cotacao', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { screen: 'editar-cotacao', can_view: 0, can_create: 0, can_edit: 0, can_delete: 0 }
    ];

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
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { name, email, password, role, status, permissions } = req.body;

    console.log('Dados recebidos para atualização:', {
      userId: req.params.id,
      name,
      email,
      hasPassword: !!password,
      role,
      status
    });

    // Primeiro, buscar o usuário atual para comparar
    const [currentUser] = await connection.execute(`
      SELECT email FROM users WHERE id = ?
    `, [req.params.id]);

    if (currentUser.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const currentEmail = currentUser[0].email;
    const emailChanged = currentEmail !== email;

    console.log('Verificando e-mail:', email, 'para usuário ID:', req.params.id);
    console.log('E-mail atual:', currentEmail, 'Novo e-mail:', email, 'Mudou:', emailChanged);

    // Só verificar duplicação se o e-mail mudou
    if (emailChanged) {
      const [existingUsers] = await connection.execute(`
        SELECT id FROM users WHERE email = ? AND id != ?
      `, [email, req.params.id]);

      console.log('Usuários encontrados com mesmo e-mail:', existingUsers);

      if (existingUsers.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
    }

    // Atualizar dados básicos do usuário
    let updateQuery = `
      UPDATE users SET 
        name = ?, 
        role = ?, 
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    let updateParams = [name, role, status, req.params.id];

    // Só incluir e-mail no UPDATE se ele mudou
    if (emailChanged) {
      updateQuery = `
        UPDATE users SET 
          name = ?, 
          email = ?, 
          role = ?, 
          status = ?,
          updated_at = NOW()
        WHERE id = ?
      `;
      updateParams = [name, email, role, status, req.params.id];
    }

    // Se senha foi fornecida, incluir no update
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      if (emailChanged) {
        updateQuery = `
          UPDATE users SET 
            name = ?, 
            email = ?, 
            password = ?,
            role = ?, 
            status = ?,
            updated_at = NOW()
          WHERE id = ?
        `;
        updateParams = [name, email, hashedPassword, role, status, req.params.id];
      } else {
        updateQuery = `
          UPDATE users SET 
            name = ?, 
            password = ?,
            role = ?, 
            status = ?,
            updated_at = NOW()
          WHERE id = ?
        `;
        updateParams = [name, hashedPassword, role, status, req.params.id];
      }
    }

    await connection.execute(updateQuery, updateParams);

    // Atualizar permissões se fornecidas
    if (permissions) {
      // Remover permissões existentes
      await connection.execute(`
        DELETE FROM user_permissions WHERE user_id = ?
      `, [req.params.id]);

      // Inserir novas permissões
      for (const permission of permissions) {
        await connection.execute(`
          INSERT INTO user_permissions (user_id, screen, can_view, can_create, can_edit, can_delete)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [req.params.id, permission.screen, permission.can_view, permission.can_create, permission.can_edit, permission.can_delete]);
      }
    }

    await connection.commit();
    
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar usuário:', error);
    
    // Se for erro de duplicação de e-mail, retornar mensagem específica
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage && error.sqlMessage.includes('users.email')) {
      return res.status(400).json({ message: 'Email já cadastrado para outro usuário' });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    await connection.release();
  }
});

// DELETE /api/users/:id - Excluir usuário
router.delete('/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Verificar se é o próprio usuário logado
    if (parseInt(req.params.id) === req.user.id) {
      await connection.rollback();
      return res.status(400).json({ message: 'Não é possível excluir o próprio usuário' });
    }

    // Excluir permissões
    await connection.execute(`
      DELETE FROM user_permissions WHERE user_id = ?
    `, [req.params.id]);

    // Excluir sessões
    await connection.execute(`
      DELETE FROM user_sessions WHERE user_id = ?
    `, [req.params.id]);

    // Excluir usuário
    await connection.execute(`
      DELETE FROM users WHERE id = ?
    `, [req.params.id]);

    await connection.commit();
    
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    await connection.release();
  }
});

// GET /api/users/:id/permissions - Buscar permissões do usuário
router.get('/:id/permissions', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [permissions] = await connection.execute(`
      SELECT screen, can_view, can_create, can_edit, can_delete
      FROM user_permissions WHERE user_id = ?
      ORDER BY screen
    `, [req.params.id]);

    await connection.release();
    
    res.json(permissions);
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 