const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Listar todas as unidades
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM unidades 
      ORDER BY nome
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar unidade por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM unidades WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar unidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar nova unidade
router.post('/', async (req, res) => {
  try {
    const { nome, abreviacao, descricao, status } = req.body;

    const [result] = await db.query(`
      INSERT INTO unidades (nome, abreviacao, descricao, status) 
      VALUES (?, ?, ?, ?)
    `, [nome, abreviacao, descricao, status]);

    res.status(201).json({
      id: result.insertId,
      message: 'Unidade criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar unidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar unidade
router.put('/:id', async (req, res) => {
  try {
    const { nome, abreviacao, descricao, status } = req.body;

    const [result] = await db.query(`
      UPDATE unidades SET nome = ?, abreviacao = ?, descricao = ?, status = ?
      WHERE id = ?
    `, [nome, abreviacao, descricao, status, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    res.json({ message: 'Unidade atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar unidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Excluir unidade
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM unidades WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    res.json({ message: 'Unidade excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir unidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 