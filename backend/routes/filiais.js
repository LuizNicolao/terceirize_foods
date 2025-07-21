const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar filiais
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT id, nome, logradouro, numero, bairro, cep, cidade, estado, 
             supervisao, coordenacao, centro_distribuicao, regional, rota_id, 
             lote, abastecimento, status, criado_em, atualizado_em 
      FROM filiais 
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (nome LIKE ? OR cidade LIKE ? OR estado LIKE ? OR supervisao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY nome ASC';

    const filiais = await executeQuery(query, params);

    res.json(filiais);

  } catch (error) {
    console.error('Erro ao listar filiais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== ROTAS PARA ALMOXARIFADOS =====

// Listar almoxarifados de uma filial
router.get('/:filialId/almoxarifados', checkPermission('visualizar'), async (req, res) => {
  try {
    const { filialId } = req.params;
    const query = `
      SELECT id, nome, status, criado_em, atualizado_em
      FROM almoxarifados
      WHERE filial_id = ?
      ORDER BY nome ASC
    `;
    const almoxarifados = await executeQuery(query, [filialId]);
    res.json(almoxarifados);
  } catch (error) {
    console.error('Erro ao listar almoxarifados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar almoxarifado por ID
router.get('/almoxarifados/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;
    const almoxarifados = await executeQuery(
      'SELECT id, filial_id, nome, status, criado_em, atualizado_em FROM almoxarifados WHERE id = ?',
      [id]
    );
    if (almoxarifados.length === 0) {
      return res.status(404).json({ error: 'Almoxarifado não encontrado' });
    }
    res.json(almoxarifados[0]);
  } catch (error) {
    console.error('Erro ao buscar almoxarifado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar almoxarifado
router.post('/:filialId/almoxarifados', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'almoxarifados'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('status').optional().isIn(['0', '1']).withMessage('Status deve ser 0 ou 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }
    const { filialId } = req.params;
    const { nome, status } = req.body;
    // Verificar se a filial existe
    const filial = await executeQuery('SELECT id FROM filiais WHERE id = ?', [filialId]);
    if (filial.length === 0) {
      return res.status(404).json({ error: 'Filial não encontrada' });
    }
    // Inserir almoxarifado
    const result = await executeQuery(
      `INSERT INTO almoxarifados (filial_id, nome, status) VALUES (?, ?, ?)`,
      [filialId, nome, status || 1]
    );
    const newAlmoxarifado = await executeQuery(
      'SELECT id, filial_id, nome, status, criado_em, atualizado_em FROM almoxarifados WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json({
      message: 'Almoxarifado criado com sucesso',
      almoxarifado: newAlmoxarifado[0]
    });
  } catch (error) {
    console.error('Erro ao criar almoxarifado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar almoxarifado
router.put('/almoxarifados/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'almoxarifados'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('status').optional().isIn(['0', '1']).withMessage('Status deve ser 0 ou 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }
    const { id } = req.params;
    const { nome, status } = req.body;
    // Verificar se o almoxarifado existe
    const almoxarifado = await executeQuery('SELECT id FROM almoxarifados WHERE id = ?', [id]);
    if (almoxarifado.length === 0) {
      return res.status(404).json({ error: 'Almoxarifado não encontrado' });
    }
    // Atualizar almoxarifado
    await executeQuery(
      `UPDATE almoxarifados SET nome = ?, status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`,
      [nome, status, id]
    );
    const updatedAlmoxarifado = await executeQuery(
      'SELECT id, filial_id, nome, status, criado_em, atualizado_em FROM almoxarifados WHERE id = ?',
      [id]
    );
    res.json({
      message: 'Almoxarifado atualizado com sucesso',
      almoxarifado: updatedAlmoxarifado[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar almoxarifado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir almoxarifado
router.delete('/almoxarifados/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'almoxarifados')
], async (req, res) => {
  try {
    const { id } = req.params;
    // Verificar se o almoxarifado existe
    const almoxarifado = await executeQuery('SELECT id FROM almoxarifados WHERE id = ?', [id]);
    if (almoxarifado.length === 0) {
      return res.status(404).json({ error: 'Almoxarifado não encontrado' });
    }
    // Verificar se há itens vinculados
    const itens = await executeQuery('SELECT id FROM almoxarifado_itens WHERE almoxarifado_id = ?', [id]);
    if (itens.length > 0) {
      return res.status(400).json({ error: 'Não é possível excluir o almoxarifado. Existem itens vinculados a ele.' });
    }
    await executeQuery('DELETE FROM almoxarifados WHERE id = ?', [id]);
    res.json({ message: 'Almoxarifado excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir almoxarifado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== ROTAS PARA ITENS DO ALMOXARIFADO =====

// Listar itens de um almoxarifado
router.get('/almoxarifados/:almoxarifadoId/itens', checkPermission('visualizar'), async (req, res) => {
  try {
    const { almoxarifadoId } = req.params;

    const itens = await executeQuery(
      `SELECT ai.id, ai.almoxarifado_id, ai.produto_id, ai.quantidade, ai.criado_em, ai.atualizado_em,
              p.nome as produto_nome, p.codigo_barras as produto_codigo
       FROM almoxarifado_itens ai
       JOIN produtos p ON ai.produto_id = p.id
       WHERE ai.almoxarifado_id = ?
       ORDER BY p.nome ASC`,
      [almoxarifadoId]
    );

    res.json(itens);

  } catch (error) {
    console.error('Erro ao listar itens do almoxarifado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar item ao almoxarifado
router.post('/almoxarifados/:almoxarifadoId/itens', [
  checkPermission('editar'),
  body('produto_id').isInt({ min: 1 }).withMessage('ID do produto é obrigatório'),
  body('quantidade').isNumeric().withMessage('Quantidade deve ser um número válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { almoxarifadoId } = req.params;
    const { produto_id, quantidade } = req.body;

    // Verificar se o almoxarifado existe
    const almoxarifado = await executeQuery(
      'SELECT id FROM almoxarifados WHERE id = ?',
      [almoxarifadoId]
    );

    if (almoxarifado.length === 0) {
      return res.status(404).json({ error: 'Almoxarifado não encontrado' });
    }

    // Verificar se o produto existe
    const produto = await executeQuery(
      'SELECT id FROM produtos WHERE id = ?',
      [produto_id]
    );

    if (produto.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Verificar se o item já existe
    const existingItem = await executeQuery(
      'SELECT id FROM almoxarifado_itens WHERE almoxarifado_id = ? AND produto_id = ?',
      [almoxarifadoId, produto_id]
    );

    if (existingItem.length > 0) {
      // Atualizar quantidade
      await executeQuery(
        'UPDATE almoxarifado_itens SET quantidade = quantidade + ?, atualizado_em = CURRENT_TIMESTAMP WHERE almoxarifado_id = ? AND produto_id = ?',
        [quantidade, almoxarifadoId, produto_id]
      );
    } else {
      // Inserir novo item
      await executeQuery(
        'INSERT INTO almoxarifado_itens (almoxarifado_id, produto_id, quantidade) VALUES (?, ?, ?)',
        [almoxarifadoId, produto_id, quantidade]
      );
    }

    res.status(201).json({ message: 'Item adicionado ao almoxarifado com sucesso' });

  } catch (error) {
    console.error('Erro ao adicionar item ao almoxarifado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover item do almoxarifado
router.delete('/almoxarifados/:almoxarifadoId/itens/:itemId', checkPermission('editar'), async (req, res) => {
  try {
    const { almoxarifadoId, itemId } = req.params;

    // Verificar se o item existe
    const item = await executeQuery(
      'SELECT id FROM almoxarifado_itens WHERE id = ? AND almoxarifado_id = ?',
      [itemId, almoxarifadoId]
    );

    if (item.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    await executeQuery(
      'DELETE FROM almoxarifado_itens WHERE id = ?',
      [itemId]
    );

    res.json({ message: 'Item removido do almoxarifado com sucesso' });

  } catch (error) {
    console.error('Erro ao remover item do almoxarifado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar filial por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const filiais = await executeQuery(
      'SELECT * FROM filiais WHERE id = ?',
      [id]
    );

    if (filiais.length === 0) {
      return res.status(404).json({ error: 'Filial não encontrada' });
    }

    res.json(filiais[0]);

  } catch (error) {
    console.error('Erro ao buscar filial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar filial
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'filiais'),
  body('nome').custom((value) => {
    if (!value || value.trim().length < 3) {
      throw new Error('Nome deve ter pelo menos 3 caracteres');
    }
    return true;
  }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('cidade').optional().custom((value) => {
    if (value && value.trim().length < 2) {
      throw new Error('Cidade deve ter pelo menos 2 caracteres');
    }
    return true;
  }).withMessage('Cidade deve ter pelo menos 2 caracteres'),
  body('estado').optional().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('status').optional().custom((value) => {
    if (value !== undefined && value !== null && value !== '') {
      const statusValue = value.toString();
      if (!['0', '1'].includes(statusValue)) {
        throw new Error('Status deve ser 0 (Inativo) ou 1 (Ativo)');
      }
    }
    return true;
  }).withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)')
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
      nome, logradouro, numero, bairro, cep, cidade, estado,
      supervisao, coordenacao, centro_distribuicao, regional,
      rota_id, lote, abastecimento, status
    } = req.body;

    // Inserir filial
    const result = await executeQuery(
      `INSERT INTO filiais (nome, logradouro, numero, bairro, cep, cidade, estado,
                           supervisao, coordenacao, centro_distribuicao, regional,
                           rota_id, lote, abastecimento, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, logradouro, numero, bairro, cep, cidade, estado,
       supervisao, coordenacao, centro_distribuicao, regional,
       rota_id, lote, abastecimento, status || 1]
    );

    const newFilial = await executeQuery(
      'SELECT * FROM filiais WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Filial criada com sucesso',
      filial: newFilial[0]
    });

  } catch (error) {
    console.error('Erro ao criar filial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar filial
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'filiais'),
  body('nome').custom((value) => {
    if (!value || value.trim().length < 3) {
      throw new Error('Nome deve ter pelo menos 3 caracteres');
    }
    return true;
  }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('cidade').optional().custom((value) => {
    if (value && value.trim().length < 2) {
      throw new Error('Cidade deve ter pelo menos 2 caracteres');
    }
    return true;
  }).withMessage('Cidade deve ter pelo menos 2 caracteres'),
  body('estado').optional().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('status').optional().custom((value) => {
    if (value !== undefined && value !== null && value !== '') {
      const statusValue = value.toString();
      if (!['0', '1'].includes(statusValue)) {
        throw new Error('Status deve ser 0 (Inativo) ou 1 (Ativo)');
      }
    }
    return true;
  }).withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)')
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
      nome, logradouro, numero, bairro, cep, cidade, estado,
      supervisao, coordenacao, centro_distribuicao, regional,
      rota_id, lote, abastecimento, status
    } = req.body;

    // Verificar se a filial existe
    const filial = await executeQuery(
      'SELECT * FROM filiais WHERE id = ?',
      [id]
    );

    if (filial.length === 0) {
      return res.status(404).json({ error: 'Filial não encontrada' });
    }

    // Atualizar filial
    await executeQuery(
      `UPDATE filiais SET nome = ?, logradouro = ?, numero = ?, bairro = ?, cep = ?, 
                         cidade = ?, estado = ?, supervisao = ?, coordenacao = ?, 
                         centro_distribuicao = ?, regional = ?, rota_id = ?, lote = ?, 
                         abastecimento = ?, status = ?, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nome, logradouro, numero, bairro, cep, cidade, estado,
       supervisao, coordenacao, centro_distribuicao, regional,
       rota_id, lote, abastecimento, status, id]
    );

    const updatedFilial = await executeQuery(
      'SELECT * FROM filiais WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Filial atualizada com sucesso',
      filial: updatedFilial[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar filial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir filial
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'filiais')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a filial existe
    const filial = await executeQuery(
      'SELECT id FROM filiais WHERE id = ?',
      [id]
    );

    if (filial.length === 0) {
      return res.status(404).json({ error: 'Filial não encontrada' });
    }

    // Verificar se há almoxarifados vinculados
    const almoxarifados = await executeQuery(
      'SELECT id FROM almoxarifados WHERE filial_id = ?',
      [id]
    );

    if (almoxarifados.length > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir a filial. Existem almoxarifados vinculados a ela.'
      });
    }

    // Excluir filial
    await executeQuery('DELETE FROM filiais WHERE id = ?', [id]);
    res.json({ message: 'Filial excluída com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir filial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 