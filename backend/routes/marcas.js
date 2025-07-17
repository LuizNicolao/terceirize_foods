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
      query += ' AND (marca LIKE ? OR fabricante LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
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
      marca, fabricante, status = 1
    } = req.body;

    // Verificar se marca já existe
    const existingMarca = await executeQuery(
      'SELECT id FROM marcas WHERE marca = ?',
      [marca]
    );

    if (existingMarca.length > 0) {
      return res.status(400).json({ error: 'Marca já cadastrada' });
    }

    // Inserir marca
    const result = await executeQuery(
      `INSERT INTO marcas (marca, fabricante, status)
       VALUES (?, ?, ?)`,
      [marca, fabricante, status]
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



module.exports = router; 