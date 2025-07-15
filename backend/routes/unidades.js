const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar unidades
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM unidades_medida WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM unidades_medida WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (nome LIKE ? OR sigla LIKE ?)';
      countQuery += ' AND (nome LIKE ? OR sigla LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY nome ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [unidades, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, search ? [`%${search}%`, `%${search}%`] : [])
    ]);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      unidades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Erro ao listar unidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar unidade por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;
    const unidades = await executeQuery('SELECT * FROM unidades_medida WHERE id = ?', [id]);

    if (unidades.length === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    res.json(unidades[0]);
  } catch (error) {
    console.error('Erro ao buscar unidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar unidade
router.post('/', [
  checkPermission('criar'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('sigla').isLength({ min: 1, max: 10 }).withMessage('Sigla deve ter entre 1 e 10 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }

    const { nome, sigla } = req.body;

    // Verificar se sigla já existe
    const existingUnidade = await executeQuery(
      'SELECT id FROM unidades_medida WHERE sigla = ?',
      [sigla]
    );

    if (existingUnidade.length > 0) {
      return res.status(400).json({ error: 'Sigla já cadastrada' });
    }

    const result = await executeQuery(
      'INSERT INTO unidades_medida (nome, sigla) VALUES (?, ?)',
      [nome, sigla]
    );

    const newUnidade = await executeQuery(
      'SELECT * FROM unidades_medida WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Unidade criada com sucesso',
      unidade: newUnidade[0]
    });

  } catch (error) {
    console.error('Erro ao criar unidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar unidade
router.put('/:id', [
  checkPermission('editar'),
  body('nome').optional().isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('sigla').optional().isLength({ min: 1, max: 10 }).withMessage('Sigla deve ter entre 1 e 10 caracteres'),
  body('status').optional().isIn([0, 1]).withMessage('Status deve ser 0 ou 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }

    const { id } = req.params;
    const { nome, sigla, status } = req.body;

    // Verificar se unidade existe
    const existingUnidade = await executeQuery(
      'SELECT id FROM unidades_medida WHERE id = ?',
      [id]
    );

    if (existingUnidade.length === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    // Verificar se sigla já existe (se estiver sendo alterada)
    if (sigla) {
      const siglaCheck = await executeQuery(
        'SELECT id FROM unidades_medida WHERE sigla = ? AND id != ?',
        [sigla, id]
      );

      if (siglaCheck.length > 0) {
        return res.status(400).json({ error: 'Sigla já cadastrada' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (nome) {
      updateFields.push('nome = ?');
      updateParams.push(nome);
    }
    if (sigla) {
      updateFields.push('sigla = ?');
      updateParams.push(sigla);
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
      `UPDATE unidades_medida SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    const updatedUnidade = await executeQuery(
      'SELECT * FROM unidades_medida WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Unidade atualizada com sucesso',
      unidade: updatedUnidade[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar unidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir unidade
router.delete('/:id', checkPermission('excluir'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se unidade existe
    const existingUnidade = await executeQuery(
      'SELECT id FROM unidades_medida WHERE id = ?',
      [id]
    );

    if (existingUnidade.length === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    // Verificar se há produtos vinculados
    const produtosVinculados = await executeQuery(
      'SELECT id FROM produtos WHERE unidade_id = ?',
      [id]
    );

    if (produtosVinculados.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir unidade com produtos vinculados' 
      });
    }

    await executeQuery('DELETE FROM unidades_medida WHERE id = ?', [id]);

    res.json({ message: 'Unidade excluída com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir unidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 