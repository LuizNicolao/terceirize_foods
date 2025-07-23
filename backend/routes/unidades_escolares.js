const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar unidades escolares
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT ue.*, r.nome as rota_nome
      FROM unidades_escolares ue
      LEFT JOIN rotas r ON ue.rota_id = r.id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (ue.nome_escola LIKE ? OR ue.cidade LIKE ? OR ue.estado LIKE ? OR ue.codigo_teknis LIKE ? OR ue.centro_distribuicao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY ue.nome_escola ASC';

    const unidades = await executeQuery(query, params);

    res.json(unidades);

  } catch (error) {
    console.error('Erro ao listar unidades escolares:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar unidade escolar por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const unidades = await executeQuery(`
      SELECT ue.*, r.nome as rota_nome
      FROM unidades_escolares ue
      LEFT JOIN rotas r ON ue.rota_id = r.id
      WHERE ue.id = ?
    `, [id]);

    if (unidades.length === 0) {
      return res.status(404).json({ error: 'Unidade escolar não encontrada' });
    }

    res.json(unidades[0]);

  } catch (error) {
    console.error('Erro ao buscar unidade escolar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar unidade escolar
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'unidades_escolares'),
  body('codigo_teknis').isLength({ min: 1, max: 50 }).withMessage('Código Teknis deve ter entre 1 e 50 caracteres'),
  body('nome_escola').isLength({ min: 3, max: 200 }).withMessage('Nome da escola deve ter entre 3 e 200 caracteres'),
  body('cidade').isLength({ min: 2, max: 100 }).withMessage('Cidade deve ter entre 2 e 100 caracteres'),
  body('estado').isLength({ min: 2, max: 50 }).withMessage('Estado deve ter entre 2 e 50 caracteres'),
  body('endereco').isLength({ min: 5, max: 300 }).withMessage('Endereço deve ter entre 5 e 300 caracteres'),
  body('rota_id').optional().isInt({ min: 1 }).withMessage('ID da rota deve ser um número inteiro válido'),
  body('ordem_entrega').optional().isInt({ min: 0 }).withMessage('Ordem de entrega deve ser um número inteiro não negativo'),
  body('status').optional().isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo')
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
      codigo_teknis, nome_escola, cidade, estado, pais, endereco, numero, bairro, cep,
      centro_distribuicao, rota_id, regional, lot, cc_senic, codigo_senio, abastecimento,
      ordem_entrega, status, observacoes
    } = req.body;

    // Verificar se a rota existe (se fornecida)
    if (rota_id) {
      const rota = await executeQuery(
        'SELECT id FROM rotas WHERE id = ?',
        [rota_id]
      );

      if (rota.length === 0) {
        return res.status(400).json({ error: 'Rota não encontrada' });
      }
    }

    // Verificar se código teknis já existe
    const existingUnidade = await executeQuery(
      'SELECT id FROM unidades_escolares WHERE codigo_teknis = ?',
      [codigo_teknis]
    );

    if (existingUnidade.length > 0) {
      return res.status(400).json({ error: 'Código Teknis já cadastrado' });
    }

    // Inserir unidade escolar
    const result = await executeQuery(
      `INSERT INTO unidades_escolares (
        codigo_teknis, nome_escola, cidade, estado, pais, endereco, numero, bairro, cep,
        centro_distribuicao, rota_id, regional, lot, cc_senic, codigo_senio, abastecimento,
        ordem_entrega, status, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo_teknis, nome_escola, cidade, estado, pais || 'Brasil', endereco, numero, bairro, cep,
        centro_distribuicao, rota_id, regional, lot, cc_senic, codigo_senio, abastecimento,
        ordem_entrega || 0, status || 'ativo', observacoes
      ]
    );

    const newUnidade = await executeQuery(
      'SELECT ue.*, r.nome as rota_nome FROM unidades_escolares ue LEFT JOIN rotas r ON ue.rota_id = r.id WHERE ue.id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Unidade escolar criada com sucesso',
      unidade: newUnidade[0]
    });

  } catch (error) {
    console.error('Erro ao criar unidade escolar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar unidade escolar
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'unidades_escolares'),
  body('codigo_teknis').optional().isLength({ min: 1, max: 50 }).withMessage('Código Teknis deve ter entre 1 e 50 caracteres'),
  body('nome_escola').optional().isLength({ min: 3, max: 200 }).withMessage('Nome da escola deve ter entre 3 e 200 caracteres'),
  body('cidade').optional().isLength({ min: 2, max: 100 }).withMessage('Cidade deve ter entre 2 e 100 caracteres'),
  body('estado').optional().isLength({ min: 2, max: 50 }).withMessage('Estado deve ter entre 2 e 50 caracteres'),
  body('endereco').optional().isLength({ min: 5, max: 300 }).withMessage('Endereço deve ter entre 5 e 300 caracteres'),
  body('rota_id').optional().isInt({ min: 1 }).withMessage('ID da rota deve ser um número inteiro válido'),
  body('ordem_entrega').optional().isInt({ min: 0 }).withMessage('Ordem de entrega deve ser um número inteiro não negativo'),
  body('status').optional().isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo')
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
      codigo_teknis, nome_escola, cidade, estado, pais, endereco, numero, bairro, cep,
      centro_distribuicao, rota_id, regional, lot, cc_senic, codigo_senio, abastecimento,
      ordem_entrega, status, observacoes
    } = req.body;

    // Verificar se a unidade existe
    const existingUnidade = await executeQuery(
      'SELECT id FROM unidades_escolares WHERE id = ?',
      [id]
    );

    if (existingUnidade.length === 0) {
      return res.status(404).json({ error: 'Unidade escolar não encontrada' });
    }

    // Verificar se a rota existe (se fornecida)
    if (rota_id) {
      const rota = await executeQuery(
        'SELECT id FROM rotas WHERE id = ?',
        [rota_id]
      );

      if (rota.length === 0) {
        return res.status(400).json({ error: 'Rota não encontrada' });
      }
    }

    // Verificar se código teknis já existe (se estiver sendo alterado)
    if (codigo_teknis) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM unidades_escolares WHERE codigo_teknis = ? AND id != ?',
        [codigo_teknis, id]
      );

      if (codigoCheck.length > 0) {
        return res.status(400).json({ error: 'Código Teknis já cadastrado' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (codigo_teknis !== undefined) {
      updateFields.push('codigo_teknis = ?');
      updateParams.push(codigo_teknis);
    }
    if (nome_escola !== undefined) {
      updateFields.push('nome_escola = ?');
      updateParams.push(nome_escola);
    }
    if (cidade !== undefined) {
      updateFields.push('cidade = ?');
      updateParams.push(cidade);
    }
    if (estado !== undefined) {
      updateFields.push('estado = ?');
      updateParams.push(estado);
    }
    if (pais !== undefined) {
      updateFields.push('pais = ?');
      updateParams.push(pais);
    }
    if (endereco !== undefined) {
      updateFields.push('endereco = ?');
      updateParams.push(endereco);
    }
    if (numero !== undefined) {
      updateFields.push('numero = ?');
      updateParams.push(numero);
    }
    if (bairro !== undefined) {
      updateFields.push('bairro = ?');
      updateParams.push(bairro);
    }
    if (cep !== undefined) {
      updateFields.push('cep = ?');
      updateParams.push(cep);
    }
    if (centro_distribuicao !== undefined) {
      updateFields.push('centro_distribuicao = ?');
      updateParams.push(centro_distribuicao);
    }
    if (rota_id !== undefined) {
      updateFields.push('rota_id = ?');
      updateParams.push(rota_id);
    }
    if (regional !== undefined) {
      updateFields.push('regional = ?');
      updateParams.push(regional);
    }
    if (lot !== undefined) {
      updateFields.push('lot = ?');
      updateParams.push(lot);
    }
    if (cc_senic !== undefined) {
      updateFields.push('cc_senic = ?');
      updateParams.push(cc_senic);
    }
    if (codigo_senio !== undefined) {
      updateFields.push('codigo_senio = ?');
      updateParams.push(codigo_senio);
    }
    if (abastecimento !== undefined) {
      updateFields.push('abastecimento = ?');
      updateParams.push(abastecimento);
    }
    if (ordem_entrega !== undefined) {
      updateFields.push('ordem_entrega = ?');
      updateParams.push(ordem_entrega);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }
    if (observacoes !== undefined) {
      updateFields.push('observacoes = ?');
      updateParams.push(observacoes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo foi fornecido para atualização' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateParams.push(id);

    await executeQuery(
      `UPDATE unidades_escolares SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    const updatedUnidade = await executeQuery(
      'SELECT ue.*, r.nome as rota_nome FROM unidades_escolares ue LEFT JOIN rotas r ON ue.rota_id = r.id WHERE ue.id = ?',
      [id]
    );

    res.json({
      message: 'Unidade escolar atualizada com sucesso',
      unidade: updatedUnidade[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar unidade escolar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir unidade escolar
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'unidades_escolares')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a unidade existe
    const unidade = await executeQuery(
      'SELECT id, nome_escola FROM unidades_escolares WHERE id = ?',
      [id]
    );

    if (unidade.length === 0) {
      return res.status(404).json({ error: 'Unidade escolar não encontrada' });
    }

    // Excluir unidade escolar
    await executeQuery('DELETE FROM unidades_escolares WHERE id = ?', [id]);

    res.json({
      message: 'Unidade escolar excluída com sucesso',
      unidade: unidade[0]
    });

  } catch (error) {
    console.error('Erro ao excluir unidade escolar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 