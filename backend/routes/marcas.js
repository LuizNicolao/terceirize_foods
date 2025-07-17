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
    const { search = '', status = '' } = req.query;

    let query = `
      SELECT * FROM marcas WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (marca LIKE ? OR fabricante LIKE ? OR descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== '') {
      query += ' AND status = ?';
      params.push(parseInt(status));
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
  body('marca').isLength({ min: 2 }).withMessage('Marca deve ter pelo menos 2 caracteres'),
  body('fabricante').isLength({ min: 2 }).withMessage('Fabricante deve ter pelo menos 2 caracteres'),
  body('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ deve ter entre 14 e 18 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido'),
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
      marca, fabricante, descricao, cnpj, telefone, email, website, endereco, status = 1
    } = req.body;

    // Verificar se marca já existe
    const existingMarca = await executeQuery(
      'SELECT id FROM marcas WHERE marca = ?',
      [marca]
    );

    if (existingMarca.length > 0) {
      return res.status(400).json({ error: 'Marca já cadastrada' });
    }

    // Verificar se CNPJ já existe (se fornecido)
    if (cnpj) {
      const existingCNPJ = await executeQuery(
        'SELECT id FROM marcas WHERE cnpj = ?',
        [cnpj]
      );

      if (existingCNPJ.length > 0) {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
      }
    }

    // Inserir marca
    const result = await executeQuery(
      `INSERT INTO marcas (marca, fabricante, descricao, cnpj, telefone, email, website, endereco, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [marca, fabricante, descricao, cnpj, telefone, email, website, endereco, status]
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
  body('marca').optional().isLength({ min: 2 }).withMessage('Marca deve ter pelo menos 2 caracteres'),
  body('fabricante').optional().isLength({ min: 2 }).withMessage('Fabricante deve ter pelo menos 2 caracteres'),
  body('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ deve ter entre 14 e 18 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido'),
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

    // Verificar se marca existe
    const existingMarca = await executeQuery(
      'SELECT id FROM marcas WHERE id = ?',
      [id]
    );

    if (existingMarca.length === 0) {
      return res.status(404).json({ error: 'Marca não encontrada' });
    }

    // Verificar se marca já existe (se estiver sendo alterada)
    if (updateData.marca) {
      const marcaCheck = await executeQuery(
        'SELECT id FROM marcas WHERE marca = ? AND id != ?',
        [updateData.marca, id]
      );

      if (marcaCheck.length > 0) {
        return res.status(400).json({ error: 'Marca já cadastrada' });
      }
    }

    // Verificar se CNPJ já existe (se estiver sendo alterado)
    if (updateData.cnpj) {
      const cnpjCheck = await executeQuery(
        'SELECT id FROM marcas WHERE cnpj = ? AND id != ?',
        [updateData.cnpj, id]
      );

      if (cnpjCheck.length > 0) {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
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

    // Verificar se marca está sendo usada em produtos
    const produtosUsingMarca = await executeQuery(
      'SELECT COUNT(*) as count FROM produtos WHERE marca = (SELECT marca FROM marcas WHERE id = ?)',
      [id]
    );

    if (produtosUsingMarca[0].count > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir esta marca pois está sendo utilizada em produtos' 
      });
    }

    await executeQuery('DELETE FROM marcas WHERE id = ?', [id]);

    res.json({ message: 'Marca excluída com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir marca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar marca por CNPJ
router.get('/buscar-cnpj/:cnpj', checkPermission('visualizar'), async (req, res) => {
  try {
    const { cnpj } = req.params;
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    const marcas = await executeQuery(
      'SELECT * FROM marcas WHERE REPLACE(REPLACE(REPLACE(cnpj, ".", ""), "-", ""), "/", "") = ?',
      [cnpjLimpo]
    );

    if (marcas.length === 0) {
      return res.status(404).json({ error: 'Marca não encontrada' });
    }

    res.json(marcas[0]);

  } catch (error) {
    console.error('Erro ao buscar marca por CNPJ:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 