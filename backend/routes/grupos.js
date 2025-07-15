const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Listar todos os grupos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM grupos 
      ORDER BY nome
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar grupo por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM grupos WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar novo grupo
router.post('/', async (req, res) => {
  try {
    const { nome, descricao, status } = req.body;

    const [result] = await db.query(`
      INSERT INTO grupos (nome, descricao, status) 
      VALUES (?, ?, ?)
    `, [nome, descricao, status]);

    res.status(201).json({
      id: result.insertId,
      message: 'Grupo criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar grupo
router.put('/:id', async (req, res) => {
  try {
    const { nome, descricao, status } = req.body;

    const [result] = await db.query(`
      UPDATE grupos SET nome = ?, descricao = ?, status = ?
      WHERE id = ?
    `, [nome, descricao, status, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    res.json({ message: 'Grupo atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Excluir grupo
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM grupos WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    res.json({ message: 'Grupo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 