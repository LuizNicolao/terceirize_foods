const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');

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
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      nome_generico_produto: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      marcas: { visualizar: true, criar: false, editar: false, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: true, criar: true, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      clientes: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      classes: { visualizar: true, criar: true, editar: true, excluir: false },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      marcas: { visualizar: true, criar: true, editar: true, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: true },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      clientes: { visualizar: true, criar: true, editar: true, excluir: true },
      filiais: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos: { visualizar: true, criar: true, editar: true, excluir: true },
      grupos: { visualizar: true, criar: true, editar: true, excluir: true },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: true },
      classes: { visualizar: true, criar: true, editar: true, excluir: true },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades: { visualizar: true, criar: true, editar: true, excluir: true },
      marcas: { visualizar: true, criar: true, editar: true, excluir: true },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: true, criar: true, editar: true, excluir: true }
    }
  },
  coordenador: {
    I: {
      usuarios: { visualizar: true, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      clientes: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      nome_generico_produto: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      marcas: { visualizar: true, criar: false, editar: false, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: true, criar: true, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      clientes: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      classes: { visualizar: true, criar: true, editar: true, excluir: false },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      marcas: { visualizar: true, criar: true, editar: true, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      clientes: { visualizar: true, criar: true, editar: true, excluir: true },
      filiais: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos: { visualizar: true, criar: true, editar: true, excluir: true },
      grupos: { visualizar: true, criar: true, editar: true, excluir: true },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: true },
      classes: { visualizar: true, criar: true, editar: true, excluir: true },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades: { visualizar: true, criar: true, editar: true, excluir: true },
      marcas: { visualizar: true, criar: true, editar: true, excluir: true },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: true, criar: false, editar: false, excluir: false }
    }
  },
  administrativo: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      clientes: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      nome_generico_produto: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      marcas: { visualizar: true, criar: false, editar: false, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: false, excluir: false },
      clientes: { visualizar: true, criar: true, editar: false, excluir: false },
      filiais: { visualizar: true, criar: true, editar: false, excluir: false },
      produtos: { visualizar: true, criar: true, editar: false, excluir: false },
      grupos: { visualizar: true, criar: true, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: false, excluir: false },
      classes: { visualizar: true, criar: true, editar: false, excluir: false },
      nome_generico_produto: { visualizar: true, criar: true, editar: false, excluir: false },
      unidades: { visualizar: true, criar: true, editar: false, excluir: false },
      marcas: { visualizar: true, criar: true, editar: false, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: true, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      clientes: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      classes: { visualizar: true, criar: true, editar: true, excluir: false },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      marcas: { visualizar: true, criar: true, editar: true, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  },
  gerente: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      clientes: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      nome_generico_produto: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      marcas: { visualizar: true, criar: false, editar: false, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      clientes: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      classes: { visualizar: true, criar: true, editar: true, excluir: false },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      marcas: { visualizar: true, criar: true, editar: true, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      clientes: { visualizar: true, criar: true, editar: true, excluir: true },
      filiais: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos: { visualizar: true, criar: true, editar: true, excluir: true },
      grupos: { visualizar: true, criar: true, editar: true, excluir: true },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: true },
      classes: { visualizar: true, criar: true, editar: true, excluir: true },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades: { visualizar: true, criar: true, editar: true, excluir: true },
      marcas: { visualizar: true, criar: true, editar: true, excluir: true },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  },
  supervisor: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      clientes: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      nome_generico_produto: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      marcas: { visualizar: true, criar: false, editar: false, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: false, excluir: false },
      clientes: { visualizar: true, criar: true, editar: false, excluir: false },
      filiais: { visualizar: true, criar: true, editar: false, excluir: false },
      produtos: { visualizar: true, criar: true, editar: false, excluir: false },
      grupos: { visualizar: true, criar: true, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: false, excluir: false },
      classes: { visualizar: true, criar: true, editar: false, excluir: false },
      nome_generico_produto: { visualizar: true, criar: true, editar: false, excluir: false },
      unidades: { visualizar: true, criar: true, editar: false, excluir: false },
      marcas: { visualizar: true, criar: true, editar: false, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: true, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      clientes: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      classes: { visualizar: true, criar: true, editar: true, excluir: false },
      nome_generico_produto: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      marcas: { visualizar: true, criar: true, editar: true, excluir: false },
      cotacao: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  }
};

// Obter permissões padrão baseadas no tipo e nível de acesso
router.get('/padrao/:tipoAcesso/:nivelAcesso', checkPermission('visualizar'), (req, res) => {
  try {
    const { tipoAcesso, nivelAcesso } = req.params;
    
    const permissoes = PERMISSOES_PADRAO[tipoAcesso]?.[nivelAcesso];
    
    if (!permissoes) {
      return res.status(404).json({ error: 'Combinação de tipo e nível de acesso não encontrada' });
    }

    // Converter para formato da tabela
    const permissoesFormatadas = Object.keys(permissoes).map(tela => ({
      tela,
      pode_visualizar: permissoes[tela].visualizar ? 1 : 0,
      pode_criar: permissoes[tela].criar ? 1 : 0,
      pode_editar: permissoes[tela].editar ? 1 : 0,
      pode_excluir: permissoes[tela].excluir ? 1 : 0
    }));

    res.json({
      tipo_acesso: tipoAcesso,
      nivel_acesso: nivelAcesso,
      permissoes: permissoesFormatadas
    });

  } catch (error) {
    console.error('Erro ao buscar permissões padrão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar permissões de um usuário
router.get('/usuario/:usuarioId', checkPermission('visualizar'), async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Verificar se usuário existe
    const usuario = await executeQuery(
      'SELECT id, nome, email, tipo_de_acesso, nivel_de_acesso FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Lista de todas as telas disponíveis no sistema
    const todasTelas = [
      'usuarios',
      'fornecedores',
      'clientes',
      'filiais',
      'produtos',
      'grupos',
      'subgrupos',
      'classes',
      'nome_generico_produto',
      'unidades',
      'marcas',
      'cotacao',
      'permissoes'
    ];

    // Buscar permissões existentes do usuário
    const permissoesExistentes = await executeQuery(
      'SELECT * FROM permissoes_usuario WHERE usuario_id = ? ORDER BY tela',
      [usuarioId]
    );

    // Criar um mapa das permissões existentes
    const mapaPermissoes = {};
    permissoesExistentes.forEach(perm => {
      mapaPermissoes[perm.tela] = perm;
    });

    // Gerar lista completa de permissões, incluindo telas sem permissões definidas
    const permissoesCompletas = todasTelas.map(tela => {
      if (mapaPermissoes[tela]) {
        return mapaPermissoes[tela];
      } else {
        return {
          tela,
          usuario_id: parseInt(usuarioId),
          pode_visualizar: 0,
          pode_criar: 0,
          pode_editar: 0,
          pode_excluir: 0
        };
      }
    });

    res.json({
      usuario: usuario[0],
      permissoes: permissoesCompletas,
      geradas_automaticamente: false
    });

  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar permissões de um usuário
router.put('/usuario/:usuarioId', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'permissoes')
], async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { permissoes } = req.body;

    // Verificar se usuário existe
    const usuario = await executeQuery(
      'SELECT id, nome, email, tipo_de_acesso, nivel_de_acesso FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar permissões existentes para auditoria
    const permissoesAnteriores = await executeQuery(
      'SELECT * FROM permissoes_usuario WHERE usuario_id = ?',
      [usuarioId]
    );

    // Criar mapa das permissões anteriores para comparação
    const mapaPermissoesAnteriores = {};
    permissoesAnteriores.forEach(perm => {
      mapaPermissoesAnteriores[perm.tela] = perm;
    });

    // Deletar permissões existentes
    await executeQuery(
      'DELETE FROM permissoes_usuario WHERE usuario_id = ?',
      [usuarioId]
    );

    // Inserir novas permissões (apenas para telas com alguma permissão)
    for (const permissao of permissoes) {
      // Só insere se tiver alguma permissão
      if (permissao.pode_visualizar || permissao.pode_criar || permissao.pode_editar || permissao.pode_excluir) {
        await executeQuery(
          'INSERT INTO permissoes_usuario (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir) VALUES (?, ?, ?, ?, ?, ?)',
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
    }

    res.json({ message: 'Permissões atualizadas com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para atualizar permissões quando tipo/nível de acesso for alterado
const atualizarPermissoesPorTipoNivel = async (usuarioId, tipoAcesso, nivelAcesso, req = null) => {
  try {
    const permissoes = PERMISSOES_PADRAO[tipoAcesso]?.[nivelAcesso];
    
    if (!permissoes) {
      console.error('Combinação de tipo e nível de acesso não encontrada:', tipoAcesso, nivelAcesso);
      return false;
    }

    // Deletar permissões existentes
    await executeQuery(
      'DELETE FROM permissoes_usuario WHERE usuario_id = ?',
      [usuarioId]
    );

    // Inserir novas permissões padrão
    for (const [tela, permissoesTela] of Object.entries(permissoes)) {
      await executeQuery(
        'INSERT INTO permissoes_usuario (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir) VALUES (?, ?, ?, ?, ?, ?)',
        [
          usuarioId,
          tela,
          permissoesTela.visualizar ? 1 : 0,
          permissoesTela.criar ? 1 : 0,
          permissoesTela.editar ? 1 : 0,
          permissoesTela.excluir ? 1 : 0
        ]
      );
    }

    // Registrar auditoria se req estiver disponível
    if (req) {
      try {
        const { logAction } = require('../utils/audit');
        const details = {
          method: 'PUT',
          url: `/permissoes/usuario/${usuarioId}`,
          statusCode: 200,
          userAgent: req.get('User-Agent'),
          requestBody: { tipoAcesso, nivelAcesso },
          resourceId: usuarioId,
          changes: {
            tipo_acesso: { from: 'alterado', to: tipoAcesso },
            nivel_acesso: { from: 'alterado', to: nivelAcesso }
          }
        };
        
        await logAction(
          req.user?.id,
          AUDIT_ACTIONS.UPDATE,
          'permissoes',
          details,
          req.ip
        );
      } catch (auditError) {
        console.error('Erro ao registrar auditoria:', auditError);
      }
    }

    return true;

  } catch (error) {
    console.error('Erro ao atualizar permissões por tipo/nível:', error);
    return false;
  }
};

// Listar todas as telas disponíveis
router.get('/telas', checkPermission('visualizar'), (req, res) => {
  const telas = [
    { nome: 'usuarios', descricao: 'Gerenciamento de Usuários' },
    { nome: 'fornecedores', descricao: 'Gerenciamento de Fornecedores' },
    { nome: 'clientes', descricao: 'Gerenciamento de Clientes' },
    { nome: 'filiais', descricao: 'Gerenciamento de Filiais' },
    { nome: 'produtos', descricao: 'Gerenciamento de Produtos' },
    { nome: 'grupos', descricao: 'Gerenciamento de Grupos' },
    { nome: 'subgrupos', descricao: 'Gerenciamento de Subgrupos' },
    { nome: 'classes', descricao: 'Gerenciamento de Classes' },
    { nome: 'nome_generico_produto', descricao: 'Gerenciamento de Nomes Genéricos de Produtos' },
    { nome: 'unidades', descricao: 'Gerenciamento de Unidades de Medida' },
    { nome: 'marcas', descricao: 'Gerenciamento de Marcas' },
    { nome: 'cotacao', descricao: 'Sistema de Cotação' },
    { nome: 'rotas', descricao: 'Gerenciamento de Rotas' },
    { nome: 'permissoes', descricao: 'Gerenciamento de Permissões' }
  ];

  res.json(telas);
});

// Sincronizar permissões de todos os usuários (adicionar telas faltantes)
router.post('/sincronizar', checkPermission('editar'), async (req, res) => {
  try {
    // Buscar todos os usuários
    const usuarios = await executeQuery(
      'SELECT id, tipo_de_acesso, nivel_de_acesso FROM usuarios WHERE status = "ativo"'
    );

    let usuariosAtualizados = 0;
    let telasAdicionadas = 0;

    for (const usuario of usuarios) {
      // Buscar permissões existentes do usuário
      const permissoesExistentes = await executeQuery(
        'SELECT tela FROM permissoes_usuario WHERE usuario_id = ?',
        [usuario.id]
      );

      const telasExistentes = permissoesExistentes.map(p => p.tela);
      
      // Obter permissões padrão para o tipo e nível do usuário
      const permissoesPadrao = PERMISSOES_PADRAO[usuario.tipo_de_acesso]?.[usuario.nivel_de_acesso];
      
      if (permissoesPadrao) {
        const telasEsperadas = Object.keys(permissoesPadrao);
        const telasFaltantes = telasEsperadas.filter(tela => !telasExistentes.includes(tela));
        
        if (telasFaltantes.length > 0) {
          // Adicionar telas faltantes
          for (const tela of telasFaltantes) {
            const permissoesTela = permissoesPadrao[tela];
            await executeQuery(
              `INSERT INTO permissoes_usuario (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                usuario.id,
                tela,
                permissoesTela.visualizar ? 1 : 0,
                permissoesTela.criar ? 1 : 0,
                permissoesTela.editar ? 1 : 0,
                permissoesTela.excluir ? 1 : 0
              ]
            );
          }
          
          usuariosAtualizados++;
          telasAdicionadas += telasFaltantes.length;
          
          console.log(`Usuário ${usuario.id}: Adicionadas ${telasFaltantes.length} telas: ${telasFaltantes.join(', ')}`);
        }
      }
    }

    res.json({
      message: 'Sincronização concluída com sucesso',
      usuarios_atualizados: usuariosAtualizados,
      telas_adicionadas: telasAdicionadas
    });

  } catch (error) {
    console.error('Erro ao sincronizar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar tipos de acesso disponíveis
router.get('/tipos-acesso', checkPermission('visualizar'), (req, res) => {
  const tipos = [
    { valor: 'administrador', descricao: 'Administrador' },
    { valor: 'coordenador', descricao: 'Coordenador' },
    { valor: 'administrativo', descricao: 'Administrativo' },
    { valor: 'gerente', descricao: 'Gerente' },
    { valor: 'supervisor', descricao: 'Supervisor' }
  ];

  res.json(tipos);
});

// Listar níveis de acesso disponíveis
router.get('/niveis-acesso', checkPermission('visualizar'), (req, res) => {
  const niveis = [
    { valor: 'I', descricao: 'Nível I - Básico' },
    { valor: 'II', descricao: 'Nível II - Intermediário' },
    { valor: 'III', descricao: 'Nível III - Avançado' }
  ];

  res.json(niveis);
});

// Exportar a função para ser usada em outras rotas
module.exports = { router, atualizarPermissoesPorTipoNivel }; 