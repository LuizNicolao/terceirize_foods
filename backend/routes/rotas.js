const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar rotas
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT r.*, f.filial as filial_nome
      FROM rotas r
      LEFT JOIN filiais f ON r.filial_id = f.id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (r.codigo LIKE ? OR r.nome LIKE ? OR r.id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY r.nome ASC';

    const rotas = await executeQuery(query, params);

    res.json(rotas);

  } catch (error) {
    console.error('Erro ao listar rotas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar rota por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const rotas = await executeQuery(`
      SELECT r.*, f.filial as filial_nome
      FROM rotas r
      LEFT JOIN filiais f ON r.filial_id = f.id
      WHERE r.id = ?
    `, [id]);

    if (rotas.length === 0) {
      return res.status(404).json({ error: 'Rota não encontrada' });
    }

    res.json(rotas[0]);

  } catch (error) {
    console.error('Erro ao buscar rota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar rota
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'rotas'),
  body('filial_id').isInt().withMessage('ID da filial deve ser um número inteiro'),
  body('codigo').isLength({ min: 1, max: 20 }).withMessage('Código deve ter entre 1 e 20 caracteres'),
  body('nome').isLength({ min: 1, max: 100 }).withMessage('Nome deve ter entre 1 e 100 caracteres'),
  body('distancia_km').optional().isFloat({ min: 0 }).withMessage('Distância deve ser um número positivo'),
  body('status').isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
  body('tipo_rota').isIn(['semanal', 'quinzenal', 'mensal', 'transferencia']).withMessage('Tipo de rota inválido'),
  body('custo_diario').optional().isFloat({ min: 0 }).withMessage('Custo diário deve ser um número positivo'),
  body('observacoes').optional().isLength({ max: 65535 }).withMessage('Observações muito longas')
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
      filial_id, codigo, nome, distancia_km, status, tipo_rota, custo_diario, observacoes
    } = req.body;

    // Verificar se a filial existe
    const filial = await executeQuery(
      'SELECT id FROM filiais WHERE id = ?',
      [filial_id]
    );

    if (filial.length === 0) {
      return res.status(400).json({ error: 'Filial não encontrada' });
    }

    // Verificar se código já existe
    const existingRota = await executeQuery(
      'SELECT id FROM rotas WHERE codigo = ?',
      [codigo]
    );

    if (existingRota.length > 0) {
      return res.status(400).json({ error: 'Código de rota já cadastrado' });
    }

    // Inserir rota
    const result = await executeQuery(
      `INSERT INTO rotas (filial_id, codigo, nome, distancia_km, status, tipo_rota, custo_diario, observacoes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [filial_id, codigo, nome, distancia_km || 0, status, tipo_rota, custo_diario || 0, observacoes]
    );

    const newRota = await executeQuery(
      'SELECT r.*, f.filial as filial_nome FROM rotas r LEFT JOIN filiais f ON r.filial_id = f.id WHERE r.id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Rota criada com sucesso',
      rota: newRota[0]
    });

  } catch (error) {
    console.error('Erro ao criar rota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar rota
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'rotas'),
  body('filial_id').isInt().withMessage('ID da filial deve ser um número inteiro'),
  body('codigo').isLength({ min: 1, max: 20 }).withMessage('Código deve ter entre 1 e 20 caracteres'),
  body('nome').isLength({ min: 1, max: 100 }).withMessage('Nome deve ter entre 1 e 100 caracteres'),
  body('distancia_km').optional().isFloat({ min: 0 }).withMessage('Distância deve ser um número positivo'),
  body('status').isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
  body('tipo_rota').isIn(['semanal', 'quinzenal', 'mensal', 'transferencia']).withMessage('Tipo de rota inválido'),
  body('custo_diario').optional().isFloat({ min: 0 }).withMessage('Custo diário deve ser um número positivo'),
  body('observacoes').optional().isLength({ max: 65535 }).withMessage('Observações muito longas')
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
      filial_id, codigo, nome, distancia_km, status, tipo_rota, custo_diario, observacoes
    } = req.body;

    // Verificar se a rota existe
    const existingRota = await executeQuery(
      'SELECT id FROM rotas WHERE id = ?',
      [id]
    );

    if (existingRota.length === 0) {
      return res.status(404).json({ error: 'Rota não encontrada' });
    }

    // Verificar se a filial existe
    const filial = await executeQuery(
      'SELECT id FROM filiais WHERE id = ?',
      [filial_id]
    );

    if (filial.length === 0) {
      return res.status(400).json({ error: 'Filial não encontrada' });
    }

    // Verificar se código já existe (se estiver sendo alterado)
    if (codigo) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM rotas WHERE codigo = ? AND id != ?',
        [codigo, id]
      );

      if (codigoCheck.length > 0) {
        return res.status(400).json({ error: 'Código de rota já cadastrado' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (filial_id !== undefined) {
      updateFields.push('filial_id = ?');
      updateParams.push(filial_id);
    }
    if (codigo !== undefined) {
      updateFields.push('codigo = ?');
      updateParams.push(codigo);
    }
    if (nome !== undefined) {
      updateFields.push('nome = ?');
      updateParams.push(nome);
    }
    if (distancia_km !== undefined) {
      updateFields.push('distancia_km = ?');
      updateParams.push(distancia_km);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }
    if (tipo_rota !== undefined) {
      updateFields.push('tipo_rota = ?');
      updateParams.push(tipo_rota);
    }
    if (custo_diario !== undefined) {
      updateFields.push('custo_diario = ?');
      updateParams.push(custo_diario);
    }
    if (observacoes !== undefined) {
      updateFields.push('observacoes = ?');
      updateParams.push(observacoes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo foi fornecido para atualização' });
    }

    updateFields.push('updated_at = NOW()');
    updateParams.push(id);

    await executeQuery(
      `UPDATE rotas SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    const updatedRota = await executeQuery(
      'SELECT r.*, f.filial as filial_nome FROM rotas r LEFT JOIN filiais f ON r.filial_id = f.id WHERE r.id = ?',
      [id]
    );

    res.json({
      message: 'Rota atualizada com sucesso',
      rota: updatedRota[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar rota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir rota
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'rotas')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a rota existe
    const rota = await executeQuery(
      'SELECT id, nome FROM rotas WHERE id = ?',
      [id]
    );

    if (rota.length === 0) {
      return res.status(404).json({ error: 'Rota não encontrada' });
    }

    // Excluir rota
    await executeQuery('DELETE FROM rotas WHERE id = ?', [id]);

    res.json({
      message: 'Rota excluída com sucesso',
      rota: rota[0]
    });

  } catch (error) {
    console.error('Erro ao excluir rota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 