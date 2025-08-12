/**
 * Rotas de Permissões
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { executeQuery } = require('../../config/database');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Definir permissões padrão por tipo e nível de acesso
const PERMISSOES_PADRAO = {
  administrador: {
    I: {
      usuarios: { visualizar: true, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      clientes: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      nome_generico_produto: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_escolares: { visualizar: true, criar: false, editar: false, excluir: false },
      marcas: { visualizar: true, criar: false, editar: false, excluir: false },
      veiculos: { visualizar: true, criar: false, editar: false, excluir: false },
      motoristas: { visualizar: true, criar: false, editar: false, excluir: false },
      ajudantes: { visualizar: true, criar: false, editar: false, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: true, criar: true, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      clientes: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      rotas: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      classes: { visualizar: true, criar: true, editar: true, excluir: false },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: false },
      marcas: { visualizar: true, criar: true, editar: true, excluir: false },
      veiculos: { visualizar: true, criar: true, editar: true, excluir: false },
      motoristas: { visualizar: true, criar: true, editar: true, excluir: false },
      ajudantes: { visualizar: true, criar: true, editar: true, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: true },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      clientes: { visualizar: true, criar: true, editar: true, excluir: true },
      filiais: { visualizar: true, criar: true, editar: true, excluir: true },
      rotas: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos: { visualizar: true, criar: true, editar: true, excluir: true },
      grupos: { visualizar: true, criar: true, editar: true, excluir: true },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: true },
      classes: { visualizar: true, criar: true, editar: true, excluir: true },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: true },
      marcas: { visualizar: true, criar: true, editar: true, excluir: true },
      veiculos: { visualizar: true, criar: true, editar: true, excluir: true },
      motoristas: { visualizar: true, criar: true, editar: true, excluir: true },
      ajudantes: { visualizar: true, criar: true, editar: true, excluir: true },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: true, criar: true, editar: true, excluir: true }
    }
  },
  coordenador: {
    I: {
      usuarios: { visualizar: true, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      clientes: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      nome_generico_produto: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_escolares: { visualizar: true, criar: false, editar: false, excluir: false },
      marcas: { visualizar: true, criar: false, editar: false, excluir: false },
      veiculos: { visualizar: true, criar: false, editar: false, excluir: false },
      motoristas: { visualizar: true, criar: false, editar: false, excluir: false },
      ajudantes: { visualizar: true, criar: false, editar: false, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: true, criar: true, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      clientes: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      rotas: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      classes: { visualizar: true, criar: true, editar: true, excluir: false },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: false },
      marcas: { visualizar: true, criar: true, editar: true, excluir: false },
      veiculos: { visualizar: true, criar: true, editar: true, excluir: false },
      motoristas: { visualizar: true, criar: true, editar: true, excluir: false },
      ajudantes: { visualizar: true, criar: true, editar: true, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      clientes: { visualizar: true, criar: true, editar: true, excluir: true },
      filiais: { visualizar: true, criar: true, editar: true, excluir: true },
      rotas: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos: { visualizar: true, criar: true, editar: true, excluir: true },
      grupos: { visualizar: true, criar: true, editar: true, excluir: true },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: true },
      classes: { visualizar: true, criar: true, editar: true, excluir: true },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: true },
      marcas: { visualizar: true, criar: true, editar: true, excluir: true },
      veiculos: { visualizar: true, criar: true, editar: true, excluir: true },
      motoristas: { visualizar: true, criar: true, editar: true, excluir: true },
      ajudantes: { visualizar: true, criar: true, editar: true, excluir: true },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: true, criar: true, editar: true, excluir: false }
    }
  }
};

// GET /api/permissoes/usuarios - Listar usuários com contagem de permissões
router.get('/usuarios', 
  checkPermission('visualizar'),
  async (req, res) => {
    try {
      const { search = '', limit = 1000 } = req.query;
      
             let query = `
         SELECT 
           u.id, u.nome, u.email, u.nivel_de_acesso, u.status,
           COUNT(p.id) as permissoes_count
         FROM usuarios u
         LEFT JOIN permissoes_usuario p ON u.id = p.usuario_id
         WHERE 1=1
       `;
      
      let params = [];

      if (search) {
        query += ' AND (u.nome LIKE ? OR u.email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' GROUP BY u.id, u.nome, u.email, u.nivel_de_acesso, u.status ORDER BY u.nome ASC';

      if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
      }

      const usuarios = await executeQuery(query, params);

      res.json({
        success: true,
        data: usuarios,
        message: 'Usuários listados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// GET /api/permissoes/usuario/:id - Buscar permissões de um usuário
router.get('/usuario/:id', 
  checkPermission('visualizar'),
  [
    param('id').isInt().withMessage('ID deve ser um número inteiro'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }
      next();
    }
  ],
  async (req, res) => {
    try {
      const { id } = req.params;

      // Buscar usuário
      const usuarios = await executeQuery(
        'SELECT id, nome, email, nivel_de_acesso, status FROM usuarios WHERE id = ?',
        [id]
      );

      if (usuarios.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

             // Buscar permissões
       const permissoes = await executeQuery(
         'SELECT tela, pode_visualizar, pode_criar, pode_editar, pode_excluir FROM permissoes_usuario WHERE usuario_id = ?',
         [id]
       );

      res.json({
        success: true,
        data: {
          usuario: usuarios[0],
          permissoes
        },
        message: 'Permissões encontradas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// PUT /api/permissoes/usuario/:id - Atualizar permissões de um usuário
router.put('/usuario/:id', 
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'permissoes'),
  [
    param('id').isInt().withMessage('ID deve ser um número inteiro'),
    body('permissoes').isArray().withMessage('Permissões deve ser um array'),
    body('permissoes.*.tela').notEmpty().withMessage('Tela é obrigatória'),
    body('permissoes.*.pode_visualizar').isIn([true, false, 0, 1]).withMessage('pode_visualizar deve ser booleano'),
    body('permissoes.*.pode_criar').isIn([true, false, 0, 1]).withMessage('pode_criar deve ser booleano'),
    body('permissoes.*.pode_editar').isIn([true, false, 0, 1]).withMessage('pode_editar deve ser booleano'),
    body('permissoes.*.pode_excluir').isIn([true, false, 0, 1]).withMessage('pode_excluir deve ser booleano'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }
      next();
    }
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { permissoes } = req.body;

      // Verificar se usuário existe
      const usuarios = await executeQuery(
        'SELECT id FROM usuarios WHERE id = ?',
        [id]
      );

      if (usuarios.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Iniciar transação
      await executeQuery('START TRANSACTION');

      try {
                 // Remover permissões existentes
         await executeQuery('DELETE FROM permissoes_usuario WHERE usuario_id = ?', [id]);

                 // Inserir novas permissões
         for (const perm of permissoes) {
           await executeQuery(
             `INSERT INTO permissoes_usuario (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir) 
              VALUES (?, ?, ?, ?, ?, ?)`,
             [
               id,
               perm.tela,
               perm.pode_visualizar ? 1 : 0,
               perm.pode_criar ? 1 : 0,
               perm.pode_editar ? 1 : 0,
               perm.pode_excluir ? 1 : 0
             ]
           );
         }

        await executeQuery('COMMIT');

        res.json({
          success: true,
          message: 'Permissões atualizadas com sucesso'
        });
      } catch (error) {
        await executeQuery('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// POST /api/permissoes/padrao/:tipo/:nivel - Aplicar permissões padrão
router.post('/padrao/:tipo/:nivel', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'permissoes'),
  async (req, res) => {
    try {
      const { tipo, nivel } = req.params;
      const { usuario_id } = req.body;

      if (!PERMISSOES_PADRAO[tipo] || !PERMISSOES_PADRAO[tipo][nivel]) {
        return res.status(400).json({
          success: false,
          error: 'Tipo ou nível de acesso inválido'
        });
      }

      // Verificar se usuário existe
      const usuarios = await executeQuery(
        'SELECT id FROM usuarios WHERE id = ?',
        [usuario_id]
      );

      if (usuarios.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      const permissoesPadrao = PERMISSOES_PADRAO[tipo][nivel];

      // Iniciar transação
      await executeQuery('START TRANSACTION');

      try {
                 // Remover permissões existentes
         await executeQuery('DELETE FROM permissoes_usuario WHERE usuario_id = ?', [usuario_id]);

                 // Inserir permissões padrão
         for (const [tela, perms] of Object.entries(permissoesPadrao)) {
           await executeQuery(
             `INSERT INTO permissoes_usuario (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir) 
              VALUES (?, ?, ?, ?, ?, ?)`,
             [
               usuario_id,
               tela,
               perms.visualizar ? 1 : 0,
               perms.criar ? 1 : 0,
               perms.editar ? 1 : 0,
               perms.excluir ? 1 : 0
             ]
           );
         }

        await executeQuery('COMMIT');

        res.json({
          success: true,
          message: 'Permissões padrão aplicadas com sucesso'
        });
      } catch (error) {
        await executeQuery('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro ao aplicar permissões padrão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

module.exports = router;
