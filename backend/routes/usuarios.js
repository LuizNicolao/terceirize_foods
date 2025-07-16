const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission, checkAccessType } = require('../middleware/auth');
const { atualizarPermissoesPorTipoNivel } = require('./permissoes');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar usuários
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status, criado_em, atualizado_em 
      FROM usuarios 
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (nome LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY nome ASC';

    const users = await executeQuery(query, params);

    res.json(users);

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar usuário por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const users = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status, criado_em, atualizado_em FROM usuarios WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(users[0]);

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar usuário
router.post('/', [
  checkPermission('criar'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('nivel_de_acesso').isIn(['I', 'II', 'III']).withMessage('Nível de acesso inválido'),
  body('tipo_de_acesso').isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor']).withMessage('Tipo de acesso inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { nome, email, senha, nivel_de_acesso, tipo_de_acesso } = req.body;

    // Verificar se email já existe
    const existingUser = await executeQuery(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(senha, 12);

    // Inserir usuário
    const result = await executeQuery(
      'INSERT INTO usuarios (nome, email, senha, nivel_de_acesso, tipo_de_acesso) VALUES (?, ?, ?, ?, ?)',
      [nome, email, hashedPassword, nivel_de_acesso, tipo_de_acesso]
    );

    const newUser = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status, criado_em FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    // Criar permissões padrão para o novo usuário
    try {
      await atualizarPermissoesPorTipoNivel(result.insertId, tipo_de_acesso, nivel_de_acesso);
      console.log('Permissões padrão criadas para novo usuário');
    } catch (error) {
      console.error('Erro ao criar permissões padrão:', error);
      // Não falhar a criação do usuário se a criação de permissões falhar
    }

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: newUser[0]
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário
router.put('/:id', [
  checkPermission('editar'),
  body('nome').optional().isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('senha').optional().isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('nivel_de_acesso').optional().isIn(['I', 'II', 'III']).withMessage('Nível de acesso inválido'),
  body('tipo_de_acesso').optional().isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor']).withMessage('Tipo de acesso inválido'),
  body('status').optional().isIn(['ativo', 'inativo']).withMessage('Status inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { nome, email, senha, nivel_de_acesso, tipo_de_acesso, status } = req.body;

    // Verificar se usuário existe
    const existingUser = await executeQuery(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (email) {
      const emailCheck = await executeQuery(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (nome) {
      updateFields.push('nome = ?');
      updateParams.push(nome);
    }
    if (email) {
      updateFields.push('email = ?');
      updateParams.push(email);
    }
    if (nivel_de_acesso) {
      updateFields.push('nivel_de_acesso = ?');
      updateParams.push(nivel_de_acesso);
    }
    if (tipo_de_acesso) {
      updateFields.push('tipo_de_acesso = ?');
      updateParams.push(tipo_de_acesso);
    }
    if (status) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    // Tratar senha se fornecida
    if (senha && senha.trim() !== '') {
      const hashedPassword = await bcrypt.hash(senha, 12);
      updateFields.push('senha = ?');
      updateParams.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updateParams.push(id);
    await executeQuery(
      `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar usuário atualizado
    const updatedUser = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status, criado_em, atualizado_em FROM usuarios WHERE id = ?',
      [id]
    );

    // Se tipo_de_acesso ou nivel_de_acesso foram alterados, atualizar permissões automaticamente
    if (tipo_de_acesso || nivel_de_acesso) {
      const finalTipo = tipo_de_acesso || updatedUser[0].tipo_de_acesso;
      const finalNivel = nivel_de_acesso || updatedUser[0].nivel_de_acesso;
      
      console.log(`Atualizando permissões para usuário ${id}: ${finalTipo} - ${finalNivel}`);
      
      try {
        await atualizarPermissoesPorTipoNivel(id, finalTipo, finalNivel);
        console.log('Permissões atualizadas com sucesso');
      } catch (error) {
        console.error('Erro ao atualizar permissões:', error);
        // Não falhar a atualização do usuário se a atualização de permissões falhar
      }
    }

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir usuário
router.delete('/:id', checkPermission('excluir'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const existingUser = await executeQuery(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Não permitir excluir o próprio usuário
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
    }

    await executeQuery('DELETE FROM usuarios WHERE id = ?', [id]);

    res.json({ message: 'Usuário excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 