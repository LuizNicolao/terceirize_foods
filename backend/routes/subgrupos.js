const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar subgrupos
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', grupo_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sg.*, g.nome as grupo_nome
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM subgrupos WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND sg.nome LIKE ?';
      countQuery += ' AND nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (grupo_id) {
      query += ' AND sg.grupo_id = ?';
      countQuery += ' AND grupo_id = ?';
      params.push(grupo_id);
    }

    query += ' ORDER BY sg.nome ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [subgrupos, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, search ? [`%${search}%`] : [])
    ]);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      subgrupos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Erro ao listar subgrupos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar subgrupo por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const subgrupos = await executeQuery(
      'SELECT sg.*, g.nome as grupo_nome FROM subgrupos sg LEFT JOIN grupos g ON sg.grupo_id = g.id WHERE sg.id = ?',
      [id]
    );

    if (subgrupos.length === 0) {
      return res.status(404).json({ error: 'Subgrupo não encontrado' });
    }

    res.json(subgrupos[0]);

  } catch (error) {
    console.error('Erro ao buscar subgrupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar subgrupo
router.post('/', [
  checkPermission('criar'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('grupo_id').isInt({ min: 1 }).withMessage('ID do grupo é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { nome, grupo_id } = req.body;

    // Verificar se grupo existe
    const grupo = await executeQuery(
      'SELECT id FROM grupos WHERE id = ?',
      [grupo_id]
    );

    if (grupo.length === 0) {
      return res.status(400).json({ error: 'Grupo não encontrado' });
    }

    // Verificar se nome já existe no grupo
    const existingSubgrupo = await executeQuery(
      'SELECT id FROM subgrupos WHERE nome = ? AND grupo_id = ?',
      [nome, grupo_id]
    );

    if (existingSubgrupo.length > 0) {
      return res.status(400).json({ error: 'Nome do subgrupo já existe neste grupo' });
    }

    // Inserir subgrupo
    const result = await executeQuery(
      'INSERT INTO subgrupos (nome, grupo_id) VALUES (?, ?)',
      [nome, grupo_id]
    );

    const newSubgrupo = await executeQuery(
      'SELECT sg.*, g.nome as grupo_nome FROM subgrupos sg LEFT JOIN grupos g ON sg.grupo_id = g.id WHERE sg.id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Subgrupo criado com sucesso',
      subgrupo: newSubgrupo[0]
    });

  } catch (error) {
    console.error('Erro ao criar subgrupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar subgrupo
router.put('/:id', [
  checkPermission('editar'),
  body('nome').optional().isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('grupo_id').optional().isInt({ min: 1 }).withMessage('ID do grupo deve ser um número válido'),
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
    const { nome, grupo_id, status } = req.body;

    // Verificar se subgrupo existe
    const existingSubgrupo = await executeQuery(
      'SELECT id FROM subgrupos WHERE id = ?',
      [id]
    );

    if (existingSubgrupo.length === 0) {
      return res.status(404).json({ error: 'Subgrupo não encontrado' });
    }

    // Verificar se grupo existe (se estiver sendo alterado)
    if (grupo_id) {
      const grupo = await executeQuery(
        'SELECT id FROM grupos WHERE id = ?',
        [grupo_id]
      );

      if (grupo.length === 0) {
        return res.status(400).json({ error: 'Grupo não encontrado' });
      }
    }

    // Verificar se nome já existe no grupo (se estiver sendo alterado)
    if (nome) {
      const nomeCheck = await executeQuery(
        'SELECT id FROM subgrupos WHERE nome = ? AND grupo_id = ? AND id != ?',
        [nome, grupo_id || (await executeQuery('SELECT grupo_id FROM subgrupos WHERE id = ?', [id]))[0].grupo_id, id]
      );

      if (nomeCheck.length > 0) {
        return res.status(400).json({ error: 'Nome do subgrupo já existe neste grupo' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (nome) {
      updateFields.push('nome = ?');
      updateParams.push(nome);
    }
    if (grupo_id) {
      updateFields.push('grupo_id = ?');
      updateParams.push(grupo_id);
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
      `UPDATE subgrupos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar subgrupo atualizado
    const updatedSubgrupo = await executeQuery(
      'SELECT sg.*, g.nome as grupo_nome FROM subgrupos sg LEFT JOIN grupos g ON sg.grupo_id = g.id WHERE sg.id = ?',
      [id]
    );

    res.json({
      message: 'Subgrupo atualizado com sucesso',
      subgrupo: updatedSubgrupo[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar subgrupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir subgrupo
router.delete('/:id', checkPermission('excluir'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se subgrupo existe
    const existingSubgrupo = await executeQuery(
      'SELECT id FROM subgrupos WHERE id = ?',
      [id]
    );

    if (existingSubgrupo.length === 0) {
      return res.status(404).json({ error: 'Subgrupo não encontrado' });
    }

    // Verificar se há produtos vinculados
    const produtosVinculados = await executeQuery(
      'SELECT id FROM produtos WHERE subgrupo_id = ?',
      [id]
    );

    if (produtosVinculados.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir subgrupo com produtos vinculados' 
      });
    }

    await executeQuery('DELETE FROM subgrupos WHERE id = ?', [id]);

    res.json({ message: 'Subgrupo excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir subgrupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 