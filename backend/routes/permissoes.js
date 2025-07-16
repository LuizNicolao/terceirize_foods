const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Definir permissões padrão por tipo e nível de acesso
const PERMISSOES_PADRAO = {
  administrador: {
    I: {
      usuarios: { visualizar: true, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: true, criar: true, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: true },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos: { visualizar: true, criar: true, editar: true, excluir: true },
      grupos: { visualizar: true, criar: true, editar: true, excluir: true },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: true, criar: true, editar: true, excluir: true }
    }
  },
  coordenador: {
    I: {
      usuarios: { visualizar: true, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: true, criar: true, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos: { visualizar: true, criar: true, editar: true, excluir: true },
      grupos: { visualizar: true, criar: true, editar: true, excluir: true },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: true, criar: false, editar: false, excluir: false }
    }
  },
  administrativo: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: false, excluir: false },
      produtos: { visualizar: true, criar: true, editar: false, excluir: false },
      grupos: { visualizar: true, criar: true, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: false, excluir: false },
      unidades: { visualizar: true, criar: true, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  },
  gerente: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos: { visualizar: true, criar: true, editar: true, excluir: true },
      grupos: { visualizar: true, criar: true, editar: true, excluir: true },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  },
  supervisor: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: false, excluir: false },
      produtos: { visualizar: true, criar: true, editar: false, excluir: false },
      grupos: { visualizar: true, criar: true, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: false, excluir: false },
      unidades: { visualizar: true, criar: true, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos: { visualizar: true, criar: true, editar: true, excluir: false },
      grupos: { visualizar: true, criar: true, editar: true, excluir: false },
      subgrupos: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades: { visualizar: true, criar: true, editar: true, excluir: false },
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

    // Buscar permissões do usuário
    const permissoes = await executeQuery(
      'SELECT * FROM permissoes_usuario WHERE usuario_id = ? ORDER BY tela',
      [usuarioId]
    );

    // Se não há permissões, gerar baseadas no tipo e nível
    if (permissoes.length === 0) {
      const tipoAcesso = usuario[0].tipo_de_acesso;
      const nivelAcesso = usuario[0].nivel_de_acesso;
      const permissoesPadrao = PERMISSOES_PADRAO[tipoAcesso]?.[nivelAcesso];

      if (permissoesPadrao) {
        // Inserir permissões padrão
        for (const [tela, permissoesTela] of Object.entries(permissoesPadrao)) {
          await executeQuery(
            `INSERT INTO permissoes_usuario (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir)
             VALUES (?, ?, ?, ?, ?, ?)`,
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

        // Buscar permissões inseridas
        const permissoesInseridas = await executeQuery(
          'SELECT * FROM permissoes_usuario WHERE usuario_id = ? ORDER BY tela',
          [usuarioId]
        );

        res.json({
          usuario: usuario[0],
          permissoes: permissoesInseridas,
          geradas_automaticamente: true
        });
      } else {
        res.json({
          usuario: usuario[0],
          permissoes: [],
          geradas_automaticamente: false
        });
      }
    } else {
      res.json({
        usuario: usuario[0],
        permissoes,
        geradas_automaticamente: false
      });
    }

  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar permissões de um usuário
router.put('/usuario/:usuarioId', checkPermission('editar'), async (req, res) => {
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

    // Deletar permissões existentes
    await executeQuery(
      'DELETE FROM permissoes_usuario WHERE usuario_id = ?',
      [usuarioId]
    );

    // Inserir novas permissões
    for (const permissao of permissoes) {
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

    res.json({ message: 'Permissões atualizadas com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para atualizar permissões quando tipo/nível de acesso for alterado
const atualizarPermissoesPorTipoNivel = async (usuarioId, tipoAcesso, nivelAcesso) => {
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
    { nome: 'produtos', descricao: 'Gerenciamento de Produtos' },
    { nome: 'grupos', descricao: 'Gerenciamento de Grupos' },
    { nome: 'subgrupos', descricao: 'Gerenciamento de Subgrupos' },
    { nome: 'unidades', descricao: 'Gerenciamento de Unidades de Medida' },
    { nome: 'permissoes', descricao: 'Gerenciamento de Permissões' }
  ];

  res.json(telas);
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