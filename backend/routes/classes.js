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
    const { search = '', status = '', subgrupo_id = '' } = req.query;

    let query = `
      SELECT c.*, s.nome as subgrupo_nome, g.nome as grupo_nome
      FROM classes c
      LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
      LEFT JOIN grupos g ON s.grupo_id = g.id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND c.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (status !== '') {
      query += ' AND c.status = ?';
      params.push(parseInt(status));
    }

    if (subgrupo_id) {
      query += ' AND c.subgrupo_id = ?';
      params.push(parseInt(subgrupo_id));
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
      `SELECT c.*, s.nome as subgrupo_nome, g.nome as grupo_nome
       FROM classes c
       LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
       LEFT JOIN grupos g ON s.grupo_id = g.id
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
  body('subgrupo_id').notEmpty().withMessage('Subgrupo é obrigatório'),
  body('status').optional().isIn(['0', '1']).withMessage('Status deve ser 0 ou 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const {
      nome, subgrupo_id, status = 1
    } = req.body;

    // Verificar se classe já existe no mesmo subgrupo
    const existingClasse = await executeQuery(
      'SELECT id FROM classes WHERE nome = ? AND subgrupo_id = ?',
      [nome, subgrupo_id]
    );

    if (existingClasse.length > 0) {
      return res.status(400).json({ error: 'Classe já cadastrada neste subgrupo' });
    }

    // Inserir classe
    const result = await executeQuery(
      `INSERT INTO classes (nome, subgrupo_id, status)
       VALUES (?, ?, ?)`,
      [nome, subgrupo_id, status]
    );

    const newClasse = await executeQuery(
      `SELECT c.*, s.nome as subgrupo_nome, g.nome as grupo_nome
       FROM classes c
       LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
       LEFT JOIN grupos g ON s.grupo_id = g.id
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
  body('subgrupo_id').optional().notEmpty().withMessage('Subgrupo deve ser válido'),
  body('status').optional().isIn(['0', '1']).withMessage('Status deve ser 0 ou 1')
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

    // Verificar se classe já existe no mesmo subgrupo (se estiver sendo alterada)
    if (updateData.nome || updateData.subgrupo_id) {
      const nome = updateData.nome || (await executeQuery('SELECT nome FROM classes WHERE id = ?', [id]))[0].nome;
      const subgrupoId = updateData.subgrupo_id || (await executeQuery('SELECT subgrupo_id FROM classes WHERE id = ?', [id]))[0].subgrupo_id;
      
      const classeCheck = await executeQuery(
        'SELECT id FROM classes WHERE nome = ? AND subgrupo_id = ? AND id != ?',
        [nome, subgrupoId, id]
      );

      if (classeCheck.length > 0) {
        return res.status(400).json({ error: 'Classe já cadastrada neste subgrupo' });
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
      `SELECT c.*, s.nome as subgrupo_nome, g.nome as grupo_nome
       FROM classes c
       LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
       LEFT JOIN grupos g ON s.grupo_id = g.id
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

    // Verificar se classe está sendo usada em produtos
    const produtosUsingClasse = await executeQuery(
      'SELECT COUNT(*) as count FROM produtos WHERE classe = (SELECT nome FROM classes WHERE id = ?)',
      [id]
    );

    if (produtosUsingClasse[0].count > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir esta classe pois está sendo utilizada em produtos' 
      });
    }

    await executeQuery('DELETE FROM classes WHERE id = ?', [id]);

    res.json({ message: 'Classe excluída com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir classe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar subgrupos para o select
router.get('/subgrupos/list', checkPermission('visualizar'), async (req, res) => {
  try {
    const subgrupos = await executeQuery(
      `SELECT s.id, s.nome, g.nome as grupo_nome
       FROM subgrupos s
       LEFT JOIN grupos g ON s.grupo_id = g.id
       WHERE s.status = 1
       ORDER BY g.nome, s.nome`
    );

    res.json(subgrupos);

  } catch (error) {
    console.error('Erro ao listar subgrupos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 