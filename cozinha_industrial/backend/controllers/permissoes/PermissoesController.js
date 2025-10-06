/**
 * Controller de Permissões
 * Lógica de negócio para gerenciamento de permissões
 */

const { executeQuery } = require('../../config/database');
const { PERMISSOES_PADRAO, TIPOS_ACESSO, NIVEIS_ACESSO, TELAS_COM_DESCRICOES } = require('./permissoesPadrao');
const {
  converterPermissoesParaFormatoTabela,
  gerarPermissoesCompletas,
  sincronizarPermissoesUsuarios,
  atualizarPermissoesUsuario
} = require('./permissoesUtils');

/**
 * Listar usuários com contagem de permissões
 */
const listarUsuarios = async (req, res) => {
  try {
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

    res.json({
      success: true,
      data: usuarios,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      }
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Obter permissões padrão baseadas no tipo e nível de acesso
 */
const obterPermissoesPadrao = (req, res) => {
  try {
    const { tipoAcesso, nivelAcesso } = req.params;
    
    const permissoes = PERMISSOES_PADRAO[tipoAcesso]?.[nivelAcesso];
    
    if (!permissoes) {
      return res.status(404).json({ error: 'Combinação de tipo e nível de acesso não encontrada' });
    }

    // Converter para formato da tabela
    const permissoesFormatadas = converterPermissoesParaFormatoTabela(permissoes);

    res.json({
      tipo_acesso: tipoAcesso,
      nivel_acesso: nivelAcesso,
      permissoes: permissoesFormatadas
    });

  } catch (error) {
    console.error('Erro ao buscar permissões padrão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar permissões de um usuário
 */
const listarPermissoesUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    
    // Validar se o usuário existe
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

    // Gerar lista completa de permissões
    const permissoesCompletas = await gerarPermissoesCompletas(usuarioId);

    res.json({
      success: true,
      data: {
        usuario: usuario[0],
        permissoes: permissoesCompletas
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar permissões de um usuário
 */
const atualizarPermissoes = async (req, res) => {
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

    // Atualizar permissões
    const resultado = await atualizarPermissoesUsuario(usuarioId, permissoes);

    res.json({ message: 'Permissões atualizadas com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar todas as telas disponíveis
 */
const listarTelas = (req, res) => {
  try {
    res.json(TELAS_COM_DESCRICOES);
  } catch (error) {
    console.error('Erro ao listar telas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Sincronizar permissões de todos os usuários
 */
const sincronizarPermissoes = async (req, res) => {
  try {
    const resultado = await sincronizarPermissoesUsuarios();

    res.json({
      message: 'Sincronização concluída com sucesso',
      usuarios_atualizados: resultado.usuarios_atualizados,
      telas_adicionadas: resultado.telas_adicionadas
    });

  } catch (error) {
    console.error('Erro ao sincronizar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar tipos de acesso disponíveis
 */
const listarTiposAcesso = (req, res) => {
  try {
    res.json(TIPOS_ACESSO);
  } catch (error) {
    console.error('Erro ao listar tipos de acesso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar níveis de acesso disponíveis
 */
const listarNiveisAcesso = (req, res) => {
  try {
    res.json(NIVEIS_ACESSO);
  } catch (error) {
    console.error('Erro ao listar níveis de acesso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  listarUsuarios,
  obterPermissoesPadrao,
  listarPermissoesUsuario,
  atualizarPermissoes,
  listarTelas,
  sincronizarPermissoes,
  listarTiposAcesso,
  listarNiveisAcesso
};
