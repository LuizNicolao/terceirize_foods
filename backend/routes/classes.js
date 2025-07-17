const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar classes
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT c.id, c.nome, c.descricao, c.status, c.criado_em, c.atualizado_em,
             s.nome as subgrupo_nome
      FROM classes c
      LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (c.nome LIKE ? OR c.descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY c.nome ASC';

    const classes = await executeQuery(query, params);
    res.json(classes);

  } catch (error) {
    console.error('Erro ao listar classes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar classe por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const classes = await executeQuery(
      `SELECT c.*, s.nome as subgrupo_nome 
       FROM classes c
       LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
       WHERE c.id = ?`,
      [id]
    );

    if (classes.length === 0) {
      return res.status(404).json({ error: 'Classe não encontrada' });
    }

    res.json(classes[0]);

  } catch (error) {
    console.error('Erro ao buscar classe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar classe
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'classes'),
  body('nome').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('subgrupo_id').isInt().withMessage('Subgrupo é obrigatório'),
  body('descricao').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { nome, subgrupo_id, descricao } = req.body;

    // Verificar se nome já existe
    const existingClass = await executeQuery(
      'SELECT id FROM classes WHERE nome = ?',
      [nome]
    );

    if (existingClass.length > 0) {
      return res.status(400).json({ error: 'Nome da classe já existe' });
    }

    // Verificar se subgrupo existe
    const subgrupo = await executeQuery(
      'SELECT id FROM subgrupos WHERE id = ?',
      [subgrupo_id]
    );

    if (subgrupo.length === 0) {
      return res.status(400).json({ error: 'Subgrupo não encontrado' });
    }

    // Inserir classe
    const result = await executeQuery(
      'INSERT INTO classes (nome, subgrupo_id, descricao) VALUES (?, ?, ?)',
      [nome, subgrupo_id, descricao]
    );

    const newClass = await executeQuery(
      'SELECT * FROM classes WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Classe criada com sucesso',
      classe: newClass[0]
    });

  } catch (error) {
    console.error('Erro ao criar classe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar classe
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'classes'),
  body('nome').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('subgrupo_id').optional().isInt().withMessage('Subgrupo inválido'),
  body('descricao').optional().trim()
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
    const { nome, subgrupo_id, descricao, status } = req.body;

    // Verificar se classe existe
    const existingClass = await executeQuery(
      'SELECT id FROM classes WHERE id = ?',
      [id]
    );

    if (existingClass.length === 0) {
      return res.status(404).json({ error: 'Classe não encontrada' });
    }

    // Verificar se nome já existe (se estiver sendo alterado)
    if (nome) {
      const nameCheck = await executeQuery(
        'SELECT id FROM classes WHERE nome = ? AND id != ?',
        [nome, id]
      );

      if (nameCheck.length > 0) {
        return res.status(400).json({ error: 'Nome da classe já existe' });
      }
    }

    // Verificar se subgrupo existe (se estiver sendo alterado)
    if (subgrupo_id) {
      const subgrupo = await executeQuery(
        'SELECT id FROM subgrupos WHERE id = ?',
        [subgrupo_id]
      );

      if (subgrupo.length === 0) {
        return res.status(400).json({ error: 'Subgrupo não encontrado' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (nome) {
      updateFields.push('nome = ?');
      updateParams.push(nome);
    }
    if (subgrupo_id) {
      updateFields.push('subgrupo_id = ?');
      updateParams.push(subgrupo_id);
    }
    if (descricao !== undefined) {
      updateFields.push('descricao = ?');
      updateParams.push(descricao);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updateParams.push(id);
    await executeQuery(
      `UPDATE classes SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar classe atualizada
    const updatedClass = await executeQuery(
      'SELECT * FROM classes WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Classe atualizada com sucesso',
      classe: updatedClass[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar classe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir classe
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'classes')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se classe existe
    const existingClass = await executeQuery(
      'SELECT id FROM classes WHERE id = ?',
      [id]
    );

    if (existingClass.length === 0) {
      return res.status(404).json({ error: 'Classe não encontrada' });
    }

    // Verificar se há produtos usando esta classe
    const produtos = await executeQuery(
      'SELECT id FROM produtos WHERE classe_id = ?',
      [id]
    );

    if (produtos.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir a classe. Existem produtos vinculados a ela.' 
      });
    }

    // Excluir classe
    await executeQuery('DELETE FROM classes WHERE id = ?', [id]);

    res.json({ message: 'Classe excluída com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir classe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 