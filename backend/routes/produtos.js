const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        f.razao_social as fornecedor_nome,
        g.nome as grupo_nome,
        u.nome as unidade_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN unidades u ON p.unidade_id = u.id
      ORDER BY p.nome
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        f.razao_social as fornecedor_nome,
        g.nome as grupo_nome,
        u.nome as unidade_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN unidades u ON p.unidade_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar novo produto
router.post('/', async (req, res) => {
  try {
    const {
      codigo,
      nome,
      descricao,
      preco_custo,
      preco_venda,
      estoque_minimo,
      estoque_atual,
      fornecedor_id,
      grupo_id,
      unidade_id,
      status
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO produtos (
        codigo, nome, descricao, preco_custo, preco_venda,
        estoque_minimo, estoque_atual, fornecedor_id, grupo_id, unidade_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo, nome, descricao, preco_custo, preco_venda,
      estoque_minimo, estoque_atual, fornecedor_id, grupo_id, unidade_id, status
    ]);

    res.status(201).json({
      id: result.insertId,
      message: 'Produto criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar produto
router.put('/:id', async (req, res) => {
  try {
    const {
      codigo,
      nome,
      descricao,
      preco_custo,
      preco_venda,
      estoque_minimo,
      estoque_atual,
      fornecedor_id,
      grupo_id,
      unidade_id,
      status
    } = req.body;

    const [result] = await db.query(`
      UPDATE produtos SET
        codigo = ?, nome = ?, descricao = ?, preco_custo = ?, preco_venda = ?,
        estoque_minimo = ?, estoque_atual = ?, fornecedor_id = ?, grupo_id = ?, 
        unidade_id = ?, status = ?
      WHERE id = ?
    `, [
      codigo, nome, descricao, preco_custo, preco_venda,
      estoque_minimo, estoque_atual, fornecedor_id, grupo_id, unidade_id, status, req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Excluir produto
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM produtos WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 