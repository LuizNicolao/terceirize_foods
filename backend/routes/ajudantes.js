const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar ajudantes
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT a.id, a.nome, a.cpf, a.telefone, a.email, a.endereco, a.status, 
             a.data_admissao, a.observacoes, a.criado_em, a.atualizado_em,
             f.filial as filial_nome
      FROM ajudantes a
      LEFT JOIN filiais f ON a.filial_id = f.id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (a.nome LIKE ? OR a.cpf LIKE ? OR a.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY a.nome ASC';

    const ajudantes = await executeQuery(query, params);

    res.json(ajudantes);

  } catch (error) {
    console.error('Erro ao listar ajudantes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar ajudante por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const ajudantes = await executeQuery(
      `SELECT a.id, a.nome, a.cpf, a.telefone, a.email, a.endereco, a.status, 
              a.data_admissao, a.observacoes, a.criado_em, a.atualizado_em,
              f.filial as filial_nome, a.filial_id
       FROM ajudantes a
       LEFT JOIN filiais f ON a.filial_id = f.id
       WHERE a.id = ?`,
      [id]
    );

    if (ajudantes.length === 0) {
      return res.status(404).json({ error: 'Ajudante não encontrado' });
    }

    res.json(ajudantes[0]);

  } catch (error) {
    console.error('Erro ao buscar ajudante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar ajudante
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'ajudantes'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('cpf').optional().isLength({ min: 11, max: 14 }).withMessage('CPF deve ter entre 11 e 14 caracteres'),
  body('telefone').optional().isLength({ min: 10, max: 20 }).withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('status').isIn(['ativo', 'inativo', 'ferias', 'licenca']).withMessage('Status inválido'),
  body('data_admissao').optional().isISO8601().withMessage('Data de admissão inválida'),
  body('filial_id').optional().isInt().withMessage('ID da filial deve ser um número inteiro')
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
      nome, 
      cpf, 
      telefone, 
      email, 
      endereco, 
      status, 
      data_admissao, 
      observacoes, 
      filial_id 
    } = req.body;

    // Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const existingAjudante = await executeQuery(
        'SELECT id FROM ajudantes WHERE cpf = ?',
        [cpf]
      );

      if (existingAjudante.length > 0) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }
    }

    // Verificar se filial existe (se fornecida)
    if (filial_id) {
      const existingFilial = await executeQuery(
        'SELECT id FROM filiais WHERE id = ?',
        [filial_id]
      );

      if (existingFilial.length === 0) {
        return res.status(400).json({ error: 'Filial não encontrada' });
      }
    }

    const result = await executeQuery(
      `INSERT INTO ajudantes (nome, cpf, telefone, email, endereco, status, data_admissao, observacoes, filial_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, cpf, telefone, email, endereco, status, data_admissao, observacoes, filial_id]
    );

    const newAjudante = await executeQuery(
      `SELECT a.id, a.nome, a.cpf, a.telefone, a.email, a.endereco, a.status, 
              a.data_admissao, a.observacoes, a.criado_em, a.atualizado_em,
              f.filial as filial_nome
       FROM ajudantes a
       LEFT JOIN filiais f ON a.filial_id = f.id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newAjudante[0]);

  } catch (error) {
    console.error('Erro ao criar ajudante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar ajudante
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'ajudantes'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('cpf').optional().isLength({ min: 11, max: 14 }).withMessage('CPF deve ter entre 11 e 14 caracteres'),
  body('telefone').optional().isLength({ min: 10, max: 20 }).withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('status').isIn(['ativo', 'inativo', 'ferias', 'licenca']).withMessage('Status inválido'),
  body('data_admissao').optional().isISO8601().withMessage('Data de admissão inválida'),
  body('filial_id').optional().isInt().withMessage('ID da filial deve ser um número inteiro')
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
      nome, 
      cpf, 
      telefone, 
      email, 
      endereco, 
      status, 
      data_admissao, 
      observacoes, 
      filial_id 
    } = req.body;

    // Verificar se ajudante existe
    const existingAjudante = await executeQuery(
      'SELECT id FROM ajudantes WHERE id = ?',
      [id]
    );

    if (existingAjudante.length === 0) {
      return res.status(404).json({ error: 'Ajudante não encontrado' });
    }

    // Verificar se CPF já existe em outro ajudante (se fornecido)
    if (cpf) {
      const duplicateCpf = await executeQuery(
        'SELECT id FROM ajudantes WHERE cpf = ? AND id != ?',
        [cpf, id]
      );

      if (duplicateCpf.length > 0) {
        return res.status(400).json({ error: 'CPF já cadastrado para outro ajudante' });
      }
    }

    // Verificar se filial existe (se fornecida)
    if (filial_id) {
      const existingFilial = await executeQuery(
        'SELECT id FROM filiais WHERE id = ?',
        [filial_id]
      );

      if (existingFilial.length === 0) {
        return res.status(400).json({ error: 'Filial não encontrada' });
      }
    }

    await executeQuery(
      `UPDATE ajudantes 
       SET nome = ?, cpf = ?, telefone = ?, email = ?, endereco = ?, status = ?, 
           data_admissao = ?, observacoes = ?, filial_id = ?
       WHERE id = ?`,
      [nome, cpf, telefone, email, endereco, status, data_admissao, observacoes, filial_id, id]
    );

    const updatedAjudante = await executeQuery(
      `SELECT a.id, a.nome, a.cpf, a.telefone, a.email, a.endereco, a.status, 
              a.data_admissao, a.observacoes, a.criado_em, a.atualizado_em,
              f.filial as filial_nome
       FROM ajudantes a
       LEFT JOIN filiais f ON a.filial_id = f.id
       WHERE a.id = ?`,
      [id]
    );

    res.json(updatedAjudante[0]);

  } catch (error) {
    console.error('Erro ao atualizar ajudante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir ajudante
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'ajudantes')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se ajudante existe
    const existingAjudante = await executeQuery(
      'SELECT id FROM ajudantes WHERE id = ?',
      [id]
    );

    if (existingAjudante.length === 0) {
      return res.status(404).json({ error: 'Ajudante não encontrado' });
    }

    await executeQuery('DELETE FROM ajudantes WHERE id = ?', [id]);

    res.json({ message: 'Ajudante excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir ajudante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar filiais para o select
router.get('/filiais/options', checkPermission('visualizar'), async (req, res) => {
  try {
    const filiais = await executeQuery(
      'SELECT id, filial as nome FROM filiais WHERE status = 1 ORDER BY filial ASC'
    );

    res.json(filiais);

  } catch (error) {
    console.error('Erro ao buscar filiais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 