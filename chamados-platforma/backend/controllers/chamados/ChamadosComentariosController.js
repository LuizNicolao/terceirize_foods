/**
 * Controller de Comentários de Chamados
 * Responsável por gerenciar comentários dos chamados
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const NotificacoesService = require('../../services/notificacoes/NotificacoesService');
const SLAService = require('../../services/sla/SLAService');

class ChamadosComentariosController {
  
  /**
   * Listar comentários de um chamado
   */
  static listarComentarios = asyncHandler(async (req, res) => {
    const { chamadoId } = req.params;
    const pagination = req.pagination;

    // Verificar se chamado existe
    const chamado = await executeQuery(
      'SELECT id FROM chamados WHERE id = ? AND ativo = 1',
      [chamadoId]
    );

    if (chamado.length === 0) {
      return notFoundResponse(res, 'Chamado não encontrado');
    }

    const baseQuery = `
      SELECT 
        cc.id,
        cc.chamado_id,
        cc.usuario_id,
        cc.comentario,
        cc.tipo,
        cc.data_criacao,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM chamados_comentarios cc
      LEFT JOIN usuarios u ON cc.usuario_id = u.id
      WHERE cc.chamado_id = ? AND cc.ativo = 1
      ORDER BY cc.data_criacao ASC
    `;

    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    const comentarios = await executeQuery(query, [chamadoId]);

    const totalResult = await executeQuery(
      'SELECT COUNT(*) as total FROM chamados_comentarios WHERE chamado_id = ? AND ativo = 1',
      [chamadoId]
    );
    const totalItems = totalResult[0].total;

    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/chamados/api/chamados/${chamadoId}/comentarios`, queryParams);

    const data = res.addListLinks(comentarios, meta.pagination, queryParams);
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Comentários listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Criar comentário em um chamado
   */
  static criarComentario = asyncHandler(async (req, res) => {
    const { chamadoId } = req.params;
    const { comentario, tipo = 'comentario' } = req.body;
    const usuario_id = req.user.id;

    // Verificar se chamado existe
    const chamado = await executeQuery(
      'SELECT id FROM chamados WHERE id = ? AND ativo = 1',
      [chamadoId]
    );

    if (chamado.length === 0) {
      return notFoundResponse(res, 'Chamado não encontrado');
    }

    // Inserir comentário
    const result = await executeQuery(
      `INSERT INTO chamados_comentarios 
        (chamado_id, usuario_id, comentario, tipo, data_criacao) 
      VALUES (?, ?, ?, ?, NOW())`,
      [chamadoId, usuario_id, comentario, tipo]
    );

    const novoComentarioId = result.insertId;

    // Atualizar data_atualizacao do chamado
    await executeQuery(
      'UPDATE chamados SET data_atualizacao = NOW() WHERE id = ?',
      [chamadoId]
    );

    // Buscar comentário criado
    const comentarios = await executeQuery(
      `SELECT 
        cc.id,
        cc.chamado_id,
        cc.usuario_id,
        cc.comentario,
        cc.tipo,
        cc.data_criacao,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM chamados_comentarios cc
      LEFT JOIN usuarios u ON cc.usuario_id = u.id
      WHERE cc.id = ?`,
      [novoComentarioId]
    );

    const comentarioCriado = comentarios[0];

    // Criar notificação para interessados no chamado
    try {
      // Buscar dados do chamado
      const chamados = await executeQuery(
        'SELECT * FROM chamados WHERE id = ?',
        [chamadoId]
      );
      
      if (chamados.length > 0) {
        const chamado = chamados[0];
        const usuarioComentador = {
          id: usuario_id,
          nome: req.user?.nome || 'Usuário'
        };
        
        await NotificacoesService.notificarComentarioAdicionado(
          chamado,
          comentarioCriado,
          usuarioComentador
        );
      }
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      // Não falhar a criação do comentário se a notificação falhar
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(comentarioCriado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, comentarioCriado.id);

    return successResponse(res, data, 'Comentário criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar comentário
   */
  static atualizarComentario = asyncHandler(async (req, res) => {
    const { chamadoId, comentarioId } = req.params;
    const { comentario, tipo } = req.body;
    const usuario_id = req.user.id;

    // Verificar se comentário existe e pertence ao chamado
    const existingComentario = await executeQuery(
      'SELECT * FROM chamados_comentarios WHERE id = ? AND chamado_id = ? AND ativo = 1',
      [comentarioId, chamadoId]
    );

    if (existingComentario.length === 0) {
      return notFoundResponse(res, 'Comentário não encontrado');
    }

    // Verificar se o usuário pode editar (apenas o próprio comentário ou admin)
    // Por enquanto, qualquer usuário autenticado pode editar qualquer comentário
    // TODO: Implementar verificação de permissões mais específica

    const updates = [];
    const params = [];

    if (comentario !== undefined) {
      updates.push('comentario = ?');
      params.push(comentario);
    }

    if (tipo !== undefined) {
      updates.push('tipo = ?');
      params.push(tipo);
    }

    if (updates.length === 0) {
      return successResponse(res, existingComentario[0], 'Nenhuma alteração realizada', STATUS_CODES.OK);
    }

    params.push(comentarioId, chamadoId);

    // Executar atualização
    await executeQuery(
      `UPDATE chamados_comentarios SET ${updates.join(', ')} WHERE id = ? AND chamado_id = ?`,
      params
    );

    // Atualizar data_atualizacao do chamado
    await executeQuery(
      'UPDATE chamados SET data_atualizacao = NOW() WHERE id = ?',
      [chamadoId]
    );

    // Buscar comentário atualizado
    const comentarios = await executeQuery(
      `SELECT 
        cc.id,
        cc.chamado_id,
        cc.usuario_id,
        cc.comentario,
        cc.tipo,
        cc.data_criacao,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM chamados_comentarios cc
      LEFT JOIN usuarios u ON cc.usuario_id = u.id
      WHERE cc.id = ? AND cc.chamado_id = ?`,
      [comentarioId, chamadoId]
    );

    const comentarioAtualizado = comentarios[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(comentarioAtualizado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, comentarioAtualizado.id);

    return successResponse(res, data, 'Comentário atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir comentário (soft delete)
   */
  static excluirComentario = asyncHandler(async (req, res) => {
    const { chamadoId, comentarioId } = req.params;

    // Verificar se comentário existe
    const existingComentario = await executeQuery(
      'SELECT id FROM chamados_comentarios WHERE id = ? AND chamado_id = ? AND ativo = 1',
      [comentarioId, chamadoId]
    );

    if (existingComentario.length === 0) {
      return notFoundResponse(res, 'Comentário não encontrado');
    }

    // Soft delete
    await executeQuery(
      'UPDATE chamados_comentarios SET ativo = 0 WHERE id = ? AND chamado_id = ?',
      [comentarioId, chamadoId]
    );

    // Atualizar data_atualizacao do chamado
    await executeQuery(
      'UPDATE chamados SET data_atualizacao = NOW() WHERE id = ?',
      [chamadoId]
    );

    return successResponse(res, null, 'Comentário excluído com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }

}

module.exports = ChamadosComentariosController;
