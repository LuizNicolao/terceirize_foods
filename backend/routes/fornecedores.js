const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar fornecedores
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT id, cnpj, razao_social, nome_fantasia, logradouro, numero, cep, 
             bairro, municipio, uf, email, telefone, status, criado_em, atualizado_em 
      FROM fornecedores 
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY razao_social ASC';

    const fornecedores = await executeQuery(query, params);

    res.json(fornecedores);

  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar fornecedor por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const fornecedores = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [id]
    );

    if (fornecedores.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json(fornecedores[0]);

  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar fornecedor
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'fornecedores'),
  body('cnpj').isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
  body('razao_social').isLength({ min: 3 }).withMessage('Razão social deve ter pelo menos 3 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('uf').optional().isLength({ min: 2, max: 2 }).withMessage('UF deve ter 2 caracteres')
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
      cnpj, razao_social, nome_fantasia, logradouro, numero, cep,
      bairro, municipio, uf, email, telefone
    } = req.body;

    // Verificar se CNPJ já existe
    const existingFornecedor = await executeQuery(
      'SELECT id FROM fornecedores WHERE cnpj = ?',
      [cnpj]
    );

    if (existingFornecedor.length > 0) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }

    // Inserir fornecedor
    const result = await executeQuery(
      `INSERT INTO fornecedores (cnpj, razao_social, nome_fantasia, logradouro, numero, cep, 
                                bairro, municipio, uf, email, telefone) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cnpj, razao_social, nome_fantasia, logradouro, numero, cep, 
       bairro, municipio, uf, email, telefone]
    );

    const newFornecedor = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Fornecedor criado com sucesso',
      fornecedor: newFornecedor[0]
    });

  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar fornecedor
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'fornecedores'),
  body('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
  body('razao_social').optional().isLength({ min: 3 }).withMessage('Razão social deve ter pelo menos 3 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('uf').optional().isLength({ min: 2, max: 2 }).withMessage('UF deve ter 2 caracteres')
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
      cnpj, razao_social, nome_fantasia, logradouro, numero, cep,
      bairro, municipio, uf, email, telefone, status
    } = req.body;

    // Verificar se fornecedor existe
    const existingFornecedor = await executeQuery(
      'SELECT id FROM fornecedores WHERE id = ?',
      [id]
    );

    if (existingFornecedor.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Verificar se CNPJ já existe (se estiver sendo alterado)
    if (cnpj) {
      const cnpjCheck = await executeQuery(
        'SELECT id FROM fornecedores WHERE cnpj = ? AND id != ?',
        [cnpj, id]
      );

      if (cnpjCheck.length > 0) {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (cnpj) {
      updateFields.push('cnpj = ?');
      updateParams.push(cnpj);
    }
    if (razao_social) {
      updateFields.push('razao_social = ?');
      updateParams.push(razao_social);
    }
    if (nome_fantasia !== undefined) {
      updateFields.push('nome_fantasia = ?');
      updateParams.push(nome_fantasia);
    }
    if (logradouro !== undefined) {
      updateFields.push('logradouro = ?');
      updateParams.push(logradouro);
    }
    if (numero !== undefined) {
      updateFields.push('numero = ?');
      updateParams.push(numero);
    }
    if (cep !== undefined) {
      updateFields.push('cep = ?');
      updateParams.push(cep);
    }
    if (bairro !== undefined) {
      updateFields.push('bairro = ?');
      updateParams.push(bairro);
    }
    if (municipio !== undefined) {
      updateFields.push('municipio = ?');
      updateParams.push(municipio);
    }
    if (uf) {
      updateFields.push('uf = ?');
      updateParams.push(uf);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateParams.push(email);
    }
    if (telefone !== undefined) {
      updateFields.push('telefone = ?');
      updateParams.push(telefone);
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
      `UPDATE fornecedores SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar fornecedor atualizado
    const updatedFornecedor = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Fornecedor atualizado com sucesso',
      fornecedor: updatedFornecedor[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir fornecedor
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'fornecedores')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se fornecedor existe
    const existingFornecedor = await executeQuery(
      'SELECT id FROM fornecedores WHERE id = ?',
      [id]
    );

    if (existingFornecedor.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Verificar se há produtos vinculados
    const produtosVinculados = await executeQuery(
      'SELECT id FROM produtos WHERE id_fornecedor = ?',
      [id]
    );

    if (produtosVinculados.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir fornecedor com produtos vinculados' 
      });
    }

    await executeQuery('DELETE FROM fornecedores WHERE id = ?', [id]);

    res.json({ message: 'Fornecedor excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 