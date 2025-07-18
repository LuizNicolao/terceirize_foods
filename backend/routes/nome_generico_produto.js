const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar nomes genéricos de produtos
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;

    let query = `
      SELECT ngp.*, 
             g.nome as grupo_nome,
             sg.nome as subgrupo_nome,
             c.nome as classe_nome
      FROM nome_generico_produto ngp
      LEFT JOIN grupos g ON ngp.grupo_id = g.id
      LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
      LEFT JOIN classes c ON ngp.classe_id = c.id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (ngp.nome LIKE ? OR g.nome LIKE ? OR sg.nome LIKE ? OR c.nome LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== '') {
      query += ' AND ngp.status = ?';
      params.push(parseInt(status));
    }

    query += ' ORDER BY ngp.nome ASC';

    const nomesGenericos = await executeQuery(query, params);
    res.json(nomesGenericos);

  } catch (error) {
    console.error('Erro ao listar nomes genéricos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar nome genérico por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const nomesGenericos = await executeQuery(
      `SELECT ngp.*, 
              g.nome as grupo_nome,
              sg.nome as subgrupo_nome,
              c.nome as classe_nome
       FROM nome_generico_produto ngp
       LEFT JOIN grupos g ON ngp.grupo_id = g.id
       LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
       LEFT JOIN classes c ON ngp.classe_id = c.id
       WHERE ngp.id = ?`,
      [id]
    );

    if (nomesGenericos.length === 0) {
      return res.status(404).json({ error: 'Nome genérico não encontrado' });
    }

    res.json(nomesGenericos[0]);

  } catch (error) {
    console.error('Erro ao buscar nome genérico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nome genérico
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'nome_generico_produto'),
  body('nome').isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
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
      nome, grupo_id, subgrupo_id, classe_id, status = 1
    } = req.body;

    // Verificar se nome já existe
    const existingNome = await executeQuery(
      'SELECT id FROM nome_generico_produto WHERE nome = ?',
      [nome]
    );

    if (existingNome.length > 0) {
      return res.status(400).json({ error: 'Nome genérico já cadastrado' });
    }

    // Inserir nome genérico
    const result = await executeQuery(
      `INSERT INTO nome_generico_produto (nome, grupo_id, subgrupo_id, classe_id, status)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, grupo_id || null, subgrupo_id || null, classe_id || null, status]
    );

    const newNomeGenerico = await executeQuery(
      `SELECT ngp.*, 
              g.nome as grupo_nome,
              sg.nome as subgrupo_nome,
              c.nome as classe_nome
       FROM nome_generico_produto ngp
       LEFT JOIN grupos g ON ngp.grupo_id = g.id
       LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
       LEFT JOIN classes c ON ngp.classe_id = c.id
       WHERE ngp.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Nome genérico criado com sucesso',
      nome_generico: newNomeGenerico[0]
    });

  } catch (error) {
    console.error('Erro ao criar nome genérico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar nome genérico
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'nome_generico_produto'),
  body('nome').optional().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
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

    // Verificar se nome genérico existe
    const existingNomeGenerico = await executeQuery(
      'SELECT id FROM nome_generico_produto WHERE id = ?',
      [id]
    );

    if (existingNomeGenerico.length === 0) {
      return res.status(404).json({ error: 'Nome genérico não encontrado' });
    }

    // Verificar se nome já existe (se estiver sendo alterado)
    if (updateData.nome) {
      const nomeCheck = await executeQuery(
        'SELECT id FROM nome_generico_produto WHERE nome = ? AND id != ?',
        [updateData.nome, id]
      );

      if (nomeCheck.length > 0) {
        return res.status(400).json({ error: 'Nome genérico já cadastrado' });
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
      `UPDATE nome_generico_produto SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar nome genérico atualizado
    const updatedNomeGenerico = await executeQuery(
      `SELECT ngp.*, 
              g.nome as grupo_nome,
              sg.nome as subgrupo_nome,
              c.nome as classe_nome
       FROM nome_generico_produto ngp
       LEFT JOIN grupos g ON ngp.grupo_id = g.id
       LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
       LEFT JOIN classes c ON ngp.classe_id = c.id
       WHERE ngp.id = ?`,
      [id]
    );

    res.json({
      message: 'Nome genérico atualizado com sucesso',
      nome_generico: updatedNomeGenerico[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar nome genérico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir nome genérico
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'nome_generico_produto')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se nome genérico existe
    const existingNomeGenerico = await executeQuery(
      'SELECT id FROM nome_generico_produto WHERE id = ?',
      [id]
    );

    if (existingNomeGenerico.length === 0) {
      return res.status(404).json({ error: 'Nome genérico não encontrado' });
    }

    // Verificar se nome genérico está sendo usado em produtos
    const produtosUsingNomeGenerico = await executeQuery(
      'SELECT COUNT(*) as count FROM produtos WHERE nome_generico_id = ?',
      [id]
    );

    if (produtosUsingNomeGenerico[0].count > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir este nome genérico pois está sendo utilizado em produtos' 
      });
    }

    await executeQuery('DELETE FROM nome_generico_produto WHERE id = ?', [id]);

    res.json({ message: 'Nome genérico excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir nome genérico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 