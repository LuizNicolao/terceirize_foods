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
      SELECT c.*, sg.nome as subgrupo_nome, g.nome as grupo_nome
      FROM classes c
      LEFT JOIN subgrupos sg ON c.subgrupo_id = sg.id
      LEFT JOIN grupos g ON sg.grupo_id = g.id
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
      `SELECT c.*, sg.nome as subgrupo_nome, g.nome as grupo_nome
       FROM classes c
       LEFT JOIN subgrupos sg ON c.subgrupo_id = sg.id
       LEFT JOIN grupos g ON sg.grupo_id = g.id
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
  body('nome').isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('subgrupo_id').isInt({ min: 1 }).withMessage('Subgrupo é obrigatório'),
  body('status').optional().isIn([0, 1]).withMessage('Status deve ser 0 ou 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { nome, subgrupo_id, descricao, status = 1 } = req.body;

    // Verificar se nome já existe no mesmo subgrupo
    const existingClasse = await executeQuery(
      'SELECT id FROM classes WHERE nome = ? AND subgrupo_id = ?',
      [nome, subgrupo_id]
    );

    if (existingClasse.length > 0) {
      return res.status(400).json({ error: 'Já existe uma classe com este nome no subgrupo selecionado' });
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
      `INSERT INTO classes (nome, subgrupo_id, descricao, status)
       VALUES (?, ?, ?, ?)`,
      [nome, subgrupo_id, descricao, status]
    );

    const newClasse = await executeQuery(
      `SELECT c.*, sg.nome as subgrupo_nome, g.nome as grupo_nome
       FROM classes c
       LEFT JOIN subgrupos sg ON c.subgrupo_id = sg.id
       LEFT JOIN grupos g ON sg.grupo_id = g.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Classe criada com sucesso',
      classe: newClasse[0]
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
  body('nome').optional().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('subgrupo_id').optional().isInt({ min: 1 }).withMessage('Subgrupo deve ser um ID válido'),
  body('status').optional().isIn([0, 1]).withMessage('Status deve ser 0 ou 1')
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
    const updateData = req.body;

    // Verificar se classe existe
    const existingClasse = await executeQuery(
      'SELECT id FROM classes WHERE id = ?',
      [id]
    );

    if (existingClasse.length === 0) {
      return res.status(404).json({ error: 'Classe não encontrada' });
    }

    // Verificar se nome já existe no mesmo subgrupo (se estiver sendo alterado)
    if (updateData.nome && updateData.subgrupo_id) {
      const nomeCheck = await executeQuery(
        'SELECT id FROM classes WHERE nome = ? AND subgrupo_id = ? AND id != ?',
        [updateData.nome, updateData.subgrupo_id, id]
      );

      if (nomeCheck.length > 0) {
        return res.status(400).json({ error: 'Já existe uma classe com este nome no subgrupo selecionado' });
      }
    }

    // Verificar se subgrupo existe (se estiver sendo alterado)
    if (updateData.subgrupo_id) {
      const subgrupo = await executeQuery(
        'SELECT id FROM subgrupos WHERE id = ?',
        [updateData.subgrupo_id]
      );

      if (subgrupo.length === 0) {
        return res.status(400).json({ error: 'Subgrupo não encontrado' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateParams.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updateParams.push(id);
    await executeQuery(
      `UPDATE classes SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar classe atualizada
    const updatedClasse = await executeQuery(
      `SELECT c.*, sg.nome as subgrupo_nome, g.nome as grupo_nome
       FROM classes c
       LEFT JOIN subgrupos sg ON c.subgrupo_id = sg.id
       LEFT JOIN grupos g ON sg.grupo_id = g.id
       WHERE c.id = ?`,
      [id]
    );

    res.json({
      message: 'Classe atualizada com sucesso',
      classe: updatedClasse[0]
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
    const existingClasse = await executeQuery(
      'SELECT id FROM classes WHERE id = ?',
      [id]
    );

    if (existingClasse.length === 0) {
      return res.status(404).json({ error: 'Classe não encontrada' });
    }

    // Verificar se há produtos usando esta classe
    const produtosUsingClasse = await executeQuery(
      'SELECT COUNT(*) as count FROM produtos WHERE classe_id = ?',
      [id]
    );

    if (produtosUsingClasse[0].count > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir esta classe pois existem produtos vinculados a ela' 
      });
    }

    await executeQuery('DELETE FROM classes WHERE id = ?', [id]);

    res.json({ message: 'Classe excluída com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir classe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 