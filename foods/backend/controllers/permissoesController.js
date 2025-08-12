const { executeQuery } = require('../config/database');
const { successResponse, notFoundResponse, conflictResponse, errorResponse, STATUS_CODES } = require('../middleware/responseHandler');
const { asyncHandler } = require('../middleware/responseHandler');

class PermissoesController {
  /**
   * Listar usuários com contagem de permissões
   */
  static listarUsuarios = asyncHandler(async (req, res) => {
    const { search, limit = 1000, page = 1 } = req.query;
    
    let baseQuery = `
      SELECT 
        u.id, 
        u.nome, 
        u.email, 
        u.nivel_de_acesso, 
        u.tipo_de_acesso, 
        u.status, 
        u.criado_em, 
        u.atualizado_em,
        COALESCE(p.permissoes_count, 0) as permissoes_count
      FROM usuarios u
      LEFT JOIN (
        SELECT 
          usuario_id,
          COUNT(DISTINCT tela) as permissoes_count
        FROM permissoes_usuario 
        WHERE pode_visualizar = 1 OR pode_criar = 1 OR pode_editar = 1 OR pode_excluir = 1
        GROUP BY usuario_id
      ) p ON u.id = p.usuario_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtro de busca
    if (search) {
      baseQuery += ' AND (u.nome LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    baseQuery += ' ORDER BY u.nome ASC';

    // Aplicar paginação
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
    
    // Executar query paginada
    const usuarios = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total 
      FROM usuarios u 
      WHERE 1=1${search ? ' AND (u.nome LIKE ? OR u.email LIKE ?)' : ''}
    `;
    const countParams = search ? [`%${search}%`, `%${search}%`] : [];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Adicionar links HATEOAS
    const data = res.addListLinks(usuarios, {
      total: totalItems,
      page: parseInt(page),
      limit: limitNum,
      pages: Math.ceil(totalItems / limitNum)
    }, req.query);

    return successResponse(res, data, 'Usuários listados com sucesso');
  });

  /**
   * Buscar permissões de um usuário
   */
  static buscarPermissoesUsuario = asyncHandler(async (req, res) => {
    const { usuarioId } = req.params;

    // Verificar se usuário existe
    const usuario = await executeQuery(
      'SELECT id, nome, email, tipo_de_acesso, nivel_de_acesso FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuario.length === 0) {
      return notFoundResponse(res, 'Usuário não encontrado');
    }

    // Lista de todas as telas disponíveis no sistema
    const todasTelas = [
      'usuarios',
      'fornecedores',
      'clientes',
      'filiais',
      'rotas',
      'produtos',
      'grupos',
      'subgrupos',
      'classes',
      'nome_generico_produto',
      'unidades',
      'unidades_escolares',
      'marcas',
      'veiculos',
      'motoristas',
      'ajudantes',
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

    const data = {
      usuario: usuario[0],
      permissoes: permissoesCompletas,
      geradas_automaticamente: false
    };

    // Adicionar links HATEOAS
    const dataWithLinks = res.addResourceLinks(data);

    return successResponse(res, dataWithLinks, 'Permissões do usuário encontradas com sucesso');
  });

  /**
   * Atualizar permissões de um usuário
   */
  static atualizarPermissoes = asyncHandler(async (req, res) => {
    const { usuarioId } = req.params;
    const { permissoes } = req.body;

    // Verificar se usuário existe
    const usuario = await executeQuery(
      'SELECT id, nome, email, tipo_de_acesso, nivel_de_acesso FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuario.length === 0) {
      return notFoundResponse(res, 'Usuário não encontrado');
    }

    // Iniciar transação
    await executeQuery('START TRANSACTION');

    try {
      // Remover permissões existentes
      await executeQuery(
        'DELETE FROM permissoes_usuario WHERE usuario_id = ?',
        [usuarioId]
      );

      // Inserir novas permissões
      if (permissoes && permissoes.length > 0) {
        const values = permissoes.map(perm => [
          usuarioId,
          perm.tela,
          perm.pode_visualizar || 0,
          perm.pode_criar || 0,
          perm.pode_editar || 0,
          perm.pode_excluir || 0
        ]);

        const insertQuery = `
          INSERT INTO permissoes_usuario 
          (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir) 
          VALUES ?
        `;

        await executeQuery(insertQuery, [values]);
      }

      // Commit da transação
      await executeQuery('COMMIT');

      // Buscar permissões atualizadas
      const permissoesAtualizadas = await executeQuery(
        'SELECT * FROM permissoes_usuario WHERE usuario_id = ? ORDER BY tela',
        [usuarioId]
      );

      const data = {
        usuario: usuario[0],
        permissoes: permissoesAtualizadas,
        mensagem: 'Permissões atualizadas com sucesso'
      };

      // Adicionar links HATEOAS
      const dataWithLinks = res.addResourceLinks(data);

      return successResponse(res, dataWithLinks, 'Permissões atualizadas com sucesso');

    } catch (error) {
      // Rollback em caso de erro
      await executeQuery('ROLLBACK');
      throw error;
    }
  });

  /**
   * Obter permissões padrão baseadas no tipo e nível de acesso
   */
  static obterPermissoesPadrao = asyncHandler(async (req, res) => {
    const { tipoAcesso, nivelAcesso } = req.params;
    
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
    
    const permissoes = PERMISSOES_PADRAO[tipoAcesso]?.[nivelAcesso];
    
    if (!permissoes) {
      return notFoundResponse(res, 'Combinação de tipo e nível de acesso não encontrada');
    }

    // Converter para formato da tabela
    const permissoesFormatadas = Object.keys(permissoes).map(tela => ({
      tela,
      pode_visualizar: permissoes[tela].visualizar ? 1 : 0,
      pode_criar: permissoes[tela].criar ? 1 : 0,
      pode_editar: permissoes[tela].editar ? 1 : 0,
      pode_excluir: permissoes[tela].excluir ? 1 : 0
    }));

    const data = {
      tipo_acesso: tipoAcesso,
      nivel_acesso: nivelAcesso,
      permissoes: permissoesFormatadas
    };

    // Adicionar links HATEOAS
    const dataWithLinks = res.addResourceLinks(data);

    return successResponse(res, dataWithLinks, 'Permissões padrão encontradas com sucesso');
  });

  /**
   * Listar todas as telas disponíveis
   */
  static listarTelas = asyncHandler(async (req, res) => {
    const telas = [
      { id: 1, nome: 'Usuários', chave: 'usuarios' },
      { id: 2, nome: 'Fornecedores', chave: 'fornecedores' },
      { id: 3, nome: 'Clientes', chave: 'clientes' },
      { id: 4, nome: 'Filiais', chave: 'filiais' },
      { id: 5, nome: 'Rotas', chave: 'rotas' },
      { id: 6, nome: 'Produtos', chave: 'produtos' },
      { id: 7, nome: 'Grupos', chave: 'grupos' },
      { id: 8, nome: 'Subgrupos', chave: 'subgrupos' },
      { id: 9, nome: 'Classes', chave: 'classes' },
      { id: 10, nome: 'Nome Genérico', chave: 'nome_generico_produto' },
      { id: 11, nome: 'Unidades', chave: 'unidades' },
      { id: 12, nome: 'Unidades Escolares', chave: 'unidades_escolares' },
      { id: 13, nome: 'Marcas', chave: 'marcas' },
      { id: 14, nome: 'Veículos', chave: 'veiculos' },
      { id: 15, nome: 'Motoristas', chave: 'motoristas' },
      { id: 16, nome: 'Ajudantes', chave: 'ajudantes' },
      { id: 17, nome: 'Cotação', chave: 'cotacao' },
      { id: 18, nome: 'Permissões', chave: 'permissoes' }
    ];

    // Adicionar links HATEOAS
    const data = res.addListLinks(telas);

    return successResponse(res, data, 'Telas listadas com sucesso');
  });

  /**
   * Obter permissões do usuário atual
   */
  static getUserPermissions(user) {
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    if (user.tipo_de_acesso === 'administrador') {
      return ['visualizar', 'criar', 'editar', 'excluir'];
    }

    return accessLevels[user.nivel_de_acesso] || [];
  }
}

module.exports = PermissoesController;
