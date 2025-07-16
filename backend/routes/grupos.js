const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar grupos
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT g.id, g.nome, g.status, COUNT(sg.id) as total_subgrupos
      FROM grupos g
      LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND g.nome LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' GROUP BY g.id, g.nome, g.status ORDER BY g.nome ASC';

    const grupos = await executeQuery(query, params);

    res.json(grupos);

  } catch (error) {
    console.error('Erro ao listar grupos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar grupo por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const grupos = await executeQuery(
      'SELECT * FROM grupos WHERE id = ?',
      [id]
    );

    if (grupos.length === 0) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    res.json(grupos[0]);

  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar grupo
router.post('/', [
  checkPermission('criar'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
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

    const { nome, status = 1 } = req.body;

    // Verificar se nome já existe
    const existingGrupo = await executeQuery(
      'SELECT id FROM grupos WHERE nome = ?',
      [nome]
    );

    if (existingGrupo.length > 0) {
      return res.status(400).json({ error: 'Nome do grupo já existe' });
    }

    // Inserir grupo
    const result = await executeQuery(
      'INSERT INTO grupos (nome, status) VALUES (?, ?)',
      [nome, status]
    );

    const newGrupo = await executeQuery(
      'SELECT * FROM grupos WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Grupo criado com sucesso',
      grupo: newGrupo[0]
    });

  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar grupo
router.put('/:id', [
  checkPermission('editar'),
  body('nome').optional().isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('status').optional().isIn([0, 1]).withMessage('Status deve ser 0 ou 1')
], async (req, res) => {
  try {
    console.log('Dados recebidos para atualização:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { nome, status } = req.body;

    // Verificar se grupo existe
    const existingGrupo = await executeQuery(
      'SELECT id FROM grupos WHERE id = ?',
      [id]
    );

    if (existingGrupo.length === 0) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    // Verificar se nome já existe (se estiver sendo alterado)
    if (nome) {
      console.log('Verificando duplicação de nome:', nome, 'para grupo ID:', id);
      const nomeCheck = await executeQuery(
        'SELECT id FROM grupos WHERE nome = ? AND id != ?',
        [nome, id]
      );

      if (nomeCheck.length > 0) {
        console.log('Nome já existe:', nomeCheck);
        return res.status(400).json({ error: 'Nome do grupo já existe' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (nome) {
      updateFields.push('nome = ?');
      updateParams.push(nome);
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
      `UPDATE grupos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar grupo atualizado
    const updatedGrupo = await executeQuery(
      'SELECT * FROM grupos WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Grupo atualizado com sucesso',
      grupo: updatedGrupo[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir grupo
router.delete('/:id', checkPermission('excluir'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se grupo existe
    const existingGrupo = await executeQuery(
      'SELECT id FROM grupos WHERE id = ?',
      [id]
    );

    if (existingGrupo.length === 0) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    // Verificar se há subgrupos vinculados
    const subgruposVinculados = await executeQuery(
      'SELECT id FROM subgrupos WHERE grupo_id = ?',
      [id]
    );

    if (subgruposVinculados.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir grupo com subgrupos vinculados' 
      });
    }

    // Verificar se há produtos vinculados
    const produtosVinculados = await executeQuery(
      'SELECT id FROM produtos WHERE grupo_id = ?',
      [id]
    );

    if (produtosVinculados.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir grupo com produtos vinculados' 
      });
    }

    await executeQuery('DELETE FROM grupos WHERE id = ?', [id]);

    res.json({ message: 'Grupo excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 