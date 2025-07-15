const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar permissões de um usuário
router.get('/usuario/:usuarioId', checkPermission('visualizar'), async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Verificar se usuário existe
    const usuario = await executeQuery(
      'SELECT id, nome FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar permissões do usuário
    const permissoes = await executeQuery(
      'SELECT * FROM permissoes_usuario WHERE usuario_id = ? ORDER BY tela',
      [usuarioId]
    );

    res.json({
      usuario: usuario[0],
      permissoes
    });

  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar permissões de um usuário
router.put('/usuario/:usuarioId', [
  checkPermission('editar'),
  body('permissoes').isArray().withMessage('Permissões deve ser um array'),
  body('permissoes.*.tela').isString().withMessage('Tela é obrigatória'),
  body('permissoes.*.pode_visualizar').isBoolean().withMessage('pode_visualizar deve ser booleano'),
  body('permissoes.*.pode_criar').isBoolean().withMessage('pode_criar deve ser booleano'),
  body('permissoes.*.pode_editar').isBoolean().withMessage('pode_editar deve ser booleano'),
  body('permissoes.*.pode_excluir').isBoolean().withMessage('pode_excluir deve ser booleano')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { usuarioId } = req.params;
    const { permissoes } = req.body;

    // Verificar se usuário existe
    const usuario = await executeQuery(
      'SELECT id FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Deletar permissões existentes
    await executeQuery(
      'DELETE FROM permissoes_usuario WHERE usuario_id = ?',
      [usuarioId]
    );

    // Inserir novas permissões
    for (const permissao of permissoes) {
      await executeQuery(
        `INSERT INTO permissoes_usuario (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          usuarioId,
          permissao.tela,
          permissao.pode_visualizar ? 1 : 0,
          permissao.pode_criar ? 1 : 0,
          permissao.pode_editar ? 1 : 0,
          permissao.pode_excluir ? 1 : 0
        ]
      );
    }

    // Buscar permissões atualizadas
    const permissoesAtualizadas = await executeQuery(
      'SELECT * FROM permissoes_usuario WHERE usuario_id = ? ORDER BY tela',
      [usuarioId]
    );

    res.json({
      message: 'Permissões atualizadas com sucesso',
      permissoes: permissoesAtualizadas
    });

  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todas as telas disponíveis
router.get('/telas', checkPermission('visualizar'), (req, res) => {
  const telas = [
    { nome: 'usuarios', descricao: 'Gerenciamento de Usuários' },
    { nome: 'fornecedores', descricao: 'Gerenciamento de Fornecedores' },
    { nome: 'produtos', descricao: 'Gerenciamento de Produtos' },
    { nome: 'grupos', descricao: 'Gerenciamento de Grupos' },
    { nome: 'subgrupos', descricao: 'Gerenciamento de Subgrupos' },
    { nome: 'unidades', descricao: 'Gerenciamento de Unidades de Medida' },
    { nome: 'permissoes', descricao: 'Gerenciamento de Permissões' }
  ];

  res.json(telas);
});

module.exports = router; 