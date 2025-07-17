const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar marcas
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT id, marca, fabricante, descricao, cnpj, telefone, email, website, 
             endereco, status, criado_em, atualizado_em
      FROM marcas 
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (marca LIKE ? OR fabricante LIKE ? OR descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY marca ASC';

    const marcas = await executeQuery(query, params);
    res.json(marcas);

  } catch (error) {
    console.error('Erro ao listar marcas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar marca por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const marcas = await executeQuery(
      'SELECT * FROM marcas WHERE id = ?',
      [id]
    );

    if (marcas.length === 0) {
      return res.status(404).json({ error: 'Marca não encontrada' });
    }

    res.json(marcas[0]);

  } catch (error) {
    console.error('Erro ao buscar marca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar marca
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'marcas'),
  body('marca').trim().isLength({ min: 2 }).withMessage('Marca deve ter pelo menos 2 caracteres'),
  body('fabricante').trim().isLength({ min: 2 }).withMessage('Fabricante deve ter pelo menos 2 caracteres'),
  body('descricao').optional().trim(),
  body('cnpj').optional().custom((value) => {
    if (value) {
      const cnpjLimpo = value.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        throw new Error('CNPJ deve ter 14 dígitos');
      }
    }
    return true;
  }).withMessage('CNPJ inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('website').optional().isURL().withMessage('Website inválido')
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
      marca, fabricante, descricao, cnpj, telefone, email, website, endereco
    } = req.body;

    // Verificar se marca já existe
    const existingMarca = await executeQuery(
      'SELECT id FROM marcas WHERE marca = ?',
      [marca]
    );

    if (existingMarca.length > 0) {
      return res.status(400).json({ error: 'Marca já existe' });
    }

    // Inserir marca
    const result = await executeQuery(
      `INSERT INTO marcas (marca, fabricante, descricao, cnpj, telefone, email, website, endereco) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [marca, fabricante, descricao, cnpj, telefone, email, website, endereco]
    );

    const newMarca = await executeQuery(
      'SELECT * FROM marcas WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Marca criada com sucesso',
      marca: newMarca[0]
    });

  } catch (error) {
    console.error('Erro ao criar marca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar marca
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'marcas'),
  body('marca').optional().trim().isLength({ min: 2 }).withMessage('Marca deve ter pelo menos 2 caracteres'),
  body('fabricante').optional().trim().isLength({ min: 2 }).withMessage('Fabricante deve ter pelo menos 2 caracteres'),
  body('descricao').optional().trim(),
  body('cnpj').optional().custom((value) => {
    if (value) {
      const cnpjLimpo = value.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        throw new Error('CNPJ deve ter 14 dígitos');
      }
    }
    return true;
  }).withMessage('CNPJ inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('website').optional().isURL().withMessage('Website inválido')
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
    const {
      marca, fabricante, descricao, cnpj, telefone, email, website, endereco, status
    } = req.body;

    // Verificar se marca existe
    const existingMarca = await executeQuery(
      'SELECT id FROM marcas WHERE id = ?',
      [id]
    );

    if (existingMarca.length === 0) {
      return res.status(404).json({ error: 'Marca não encontrada' });
    }

    // Verificar se marca já existe (se estiver sendo alterada)
    if (marca) {
      const marcaCheck = await executeQuery(
        'SELECT id FROM marcas WHERE marca = ? AND id != ?',
        [marca, id]
      );

      if (marcaCheck.length > 0) {
        return res.status(400).json({ error: 'Marca já existe' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (marca) {
      updateFields.push('marca = ?');
      updateParams.push(marca);
    }
    if (fabricante) {
      updateFields.push('fabricante = ?');
      updateParams.push(fabricante);
    }
    if (descricao !== undefined) {
      updateFields.push('descricao = ?');
      updateParams.push(descricao);
    }
    if (cnpj !== undefined) {
      updateFields.push('cnpj = ?');
      updateParams.push(cnpj);
    }
    if (telefone !== undefined) {
      updateFields.push('telefone = ?');
      updateParams.push(telefone);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateParams.push(email);
    }
    if (website !== undefined) {
      updateFields.push('website = ?');
      updateParams.push(website);
    }
    if (endereco !== undefined) {
      updateFields.push('endereco = ?');
      updateParams.push(endereco);
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
      `UPDATE marcas SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar marca atualizada
    const updatedMarca = await executeQuery(
      'SELECT * FROM marcas WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Marca atualizada com sucesso',
      marca: updatedMarca[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar marca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir marca
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'marcas')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se marca existe
    const existingMarca = await executeQuery(
      'SELECT id FROM marcas WHERE id = ?',
      [id]
    );

    if (existingMarca.length === 0) {
      return res.status(404).json({ error: 'Marca não encontrada' });
    }

    // Verificar se há produtos usando esta marca
    const produtos = await executeQuery(
      'SELECT id FROM produtos WHERE marca_id = ?',
      [id]
    );

    if (produtos.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir a marca. Existem produtos vinculados a ela.' 
      });
    }

    // Excluir marca
    await executeQuery('DELETE FROM marcas WHERE id = ?', [id]);

    res.json({ message: 'Marca excluída com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir marca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 