const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkScreenPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const axios = require('axios');
const { filialValidations, filialAtualizacaoValidations, handleValidationErrors } = require('../middleware/validation');
const { paginationMiddleware } = require('../middleware/pagination');
const { hateoasMiddleware } = require('../middleware/hateoas');
const filiaisController = require('../controllers/filiaisController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS PRINCIPAIS DE FILIAIS =====

// Listar filiais com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('filiais', 'visualizar'),
  paginationMiddleware,
  filiaisController.listarFiliais,
  hateoasMiddleware
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar filiais ativas
router.get('/ativas/listar', 
  checkScreenPermission('filiais', 'visualizar'),
  filiaisController.buscarFiliaisAtivas,
  hateoasMiddleware
);

// Buscar filiais por estado
router.get('/estado/:estado', 
  checkScreenPermission('filiais', 'visualizar'),
  filiaisController.buscarFiliaisPorEstado,
  hateoasMiddleware
);

// Listar estados disponíveis
router.get('/estados/listar', 
  checkScreenPermission('filiais', 'visualizar'),
  filiaisController.listarEstados,
  hateoasMiddleware
);

// Listar supervisões disponíveis
router.get('/supervisoes/listar', 
  checkScreenPermission('filiais', 'visualizar'),
  filiaisController.listarSupervisoes,
  hateoasMiddleware
);

// Listar coordenações disponíveis
router.get('/coordenacoes/listar', 
  checkScreenPermission('filiais', 'visualizar'),
  filiaisController.listarCoordenacoes,
  hateoasMiddleware
);

// Consultar CNPJ na API externa
router.get('/consulta-cnpj/:cnpj', 
  checkScreenPermission('filiais', 'visualizar'),
  filiaisController.consultarCNPJ
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar filial por ID
router.get('/:id', 
  checkScreenPermission('filiais', 'visualizar'),
  filiaisController.buscarFilialPorId,
  hateoasMiddleware
);

// Criar filial
router.post('/', [
  checkScreenPermission('filiais', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'filiais'),
  filialValidations,
  handleValidationErrors
], filiaisController.criarFilial);

// Atualizar filial
router.put('/:id', [
  checkScreenPermission('filiais', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'filiais'),
  filialAtualizacaoValidations,
  handleValidationErrors
], filiaisController.atualizarFilial);

// Excluir filial
router.delete('/:id', [
  checkScreenPermission('filiais', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'filiais')
], filiaisController.excluirFilial);

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
    res.json({
      success: true,
      data: almoxarifados
    });
  } catch (error) {
    console.error('Erro ao listar almoxarifados:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível listar os almoxarifados'
    });
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
      return res.status(404).json({ 
        success: false,
        error: 'Almoxarifado não encontrado',
        message: 'O almoxarifado especificado não foi encontrado'
      });
    }
    res.json({
      success: true,
      data: almoxarifados[0]
    });
  } catch (error) {
    console.error('Erro ao buscar almoxarifado:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o almoxarifado'
    });
  }
});

// Criar almoxarifado
router.post('/:filialId/almoxarifados', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'almoxarifados'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('status').optional().isIn(['0', '1']).withMessage('Status deve ser 0 ou 1'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { filialId } = req.params;
    const { nome, status } = req.body;
    
    // Verificar se a filial existe
    const filial = await executeQuery('SELECT id FROM filiais WHERE id = ?', [filialId]);
    if (filial.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Filial não encontrada',
        message: 'A filial especificada não foi encontrada'
      });
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
      success: true,
      message: 'Almoxarifado criado com sucesso',
      data: newAlmoxarifado[0]
    });
  } catch (error) {
    console.error('Erro ao criar almoxarifado:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o almoxarifado'
    });
  }
});

// Atualizar almoxarifado
router.put('/almoxarifados/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'almoxarifados'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('status').optional().isIn(['0', '1']).withMessage('Status deve ser 0 ou 1'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, status } = req.body;
    
    // Verificar se o almoxarifado existe
    const almoxarifado = await executeQuery('SELECT id FROM almoxarifados WHERE id = ?', [id]);
    if (almoxarifado.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Almoxarifado não encontrado',
        message: 'O almoxarifado especificado não foi encontrado'
      });
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
      success: true,
      message: 'Almoxarifado atualizado com sucesso',
      data: updatedAlmoxarifado[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar almoxarifado:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o almoxarifado'
    });
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
      return res.status(404).json({ 
        success: false,
        error: 'Almoxarifado não encontrado',
        message: 'O almoxarifado especificado não foi encontrado'
      });
    }
    
    // Verificar se há itens vinculados
    const itens = await executeQuery('SELECT id FROM almoxarifado_itens WHERE almoxarifado_id = ?', [id]);
    if (itens.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Almoxarifado possui dependências',
        message: 'Não é possível excluir o almoxarifado. Existem itens vinculados a ele.',
        dependencies: {
          itens: itens.length
        }
      });
    }
    
    await executeQuery('DELETE FROM almoxarifados WHERE id = ?', [id]);
    res.json({ 
      success: true,
      message: 'Almoxarifado excluído com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir almoxarifado:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível excluir o almoxarifado'
    });
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

    res.json({
      success: true,
      data: itens
    });

  } catch (error) {
    console.error('Erro ao listar itens do almoxarifado:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível listar os itens do almoxarifado'
    });
  }
});

// Adicionar item ao almoxarifado
router.post('/almoxarifados/:almoxarifadoId/itens', [
  checkPermission('editar'),
  body('produto_id').isInt({ min: 1 }).withMessage('ID do produto é obrigatório'),
  body('quantidade').isNumeric().withMessage('Quantidade deve ser um número válido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { almoxarifadoId } = req.params;
    const { produto_id, quantidade } = req.body;

    // Verificar se o almoxarifado existe
    const almoxarifado = await executeQuery(
      'SELECT id FROM almoxarifados WHERE id = ?',
      [almoxarifadoId]
    );

    if (almoxarifado.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Almoxarifado não encontrado',
        message: 'O almoxarifado especificado não foi encontrado'
      });
    }

    // Verificar se o produto existe
    const produto = await executeQuery(
      'SELECT id FROM produtos WHERE id = ?',
      [produto_id]
    );

    if (produto.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Produto não encontrado',
        message: 'O produto especificado não foi encontrado'
      });
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

    res.status(201).json({ 
      success: true,
      message: 'Item adicionado ao almoxarifado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao adicionar item ao almoxarifado:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível adicionar o item ao almoxarifado'
    });
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
      return res.status(404).json({ 
        success: false,
        error: 'Item não encontrado',
        message: 'O item especificado não foi encontrado'
      });
    }

    await executeQuery(
      'DELETE FROM almoxarifado_itens WHERE id = ?',
      [itemId]
    );

    res.json({ 
      success: true,
      message: 'Item removido do almoxarifado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao remover item do almoxarifado:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível remover o item do almoxarifado'
    });
  }
});

module.exports = router; 