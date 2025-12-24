/**
 * Controller CRUD de Chamados
 * Responsável por criar, atualizar e excluir chamados
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  conflictResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const NotificacoesService = require('../../services/notificacoes/NotificacoesService');
const SLAService = require('../../services/sla/SLAService');

class ChamadosCRUDController {
  
  /**
   * Criar novo chamado
   */
  static criarChamado = asyncHandler(async (req, res) => {
    const { titulo, descricao, sistema, tela, tipo, prioridade } = req.body;
    const usuario_abertura_id = req.user.id; // ID do usuário autenticado

    // Inserir chamado
    const result = await executeQuery(
      `INSERT INTO chamados 
        (titulo, descricao, sistema, tela, tipo, status, prioridade, usuario_abertura_id, data_abertura) 
      VALUES (?, ?, ?, ?, ?, 'aberto', ?, ?, NOW())`,
      [titulo, descricao, sistema, tela || null, tipo, prioridade || 'media', usuario_abertura_id]
    );

    const novoChamadoId = result.insertId;

    // Calcular e definir prazo de resolução baseado na prioridade
    const prioridadeFinal = prioridade || 'media';
    await SLAService.atualizarDataLimite(novoChamadoId, prioridadeFinal);

    // Registrar no histórico
    await executeQuery(
      `INSERT INTO chamados_historico 
        (chamado_id, usuario_id, campo_alterado, valor_anterior, valor_novo) 
      VALUES (?, ?, 'status', NULL, 'aberto')`,
      [novoChamadoId, usuario_abertura_id]
    );

    // Buscar chamado criado
    const chamados = await executeQuery(
      `SELECT 
        c.id,
        c.titulo,
        c.descricao,
        c.descricao_correcao,
        c.sistema,
        c.tela,
        c.tipo,
        c.status,
        c.prioridade,
        c.usuario_abertura_id,
        c.usuario_responsavel_id,
        c.data_abertura,
        c.data_conclusao,
        c.data_atualizacao,
        c.prazo_resolucao_horas,
        c.data_limite_resolucao,
        c.tempo_resposta_minutos,
        c.data_primeira_resposta,
        ua.nome as usuario_abertura_nome,
        ua.email as usuario_abertura_email,
        ur.nome as usuario_responsavel_nome,
        ur.email as usuario_responsavel_email
      FROM chamados c
      LEFT JOIN usuarios ua ON c.usuario_abertura_id = ua.id
      LEFT JOIN usuarios ur ON c.usuario_responsavel_id = ur.id
      WHERE c.id = ?`,
      [novoChamadoId]
    );

    const chamado = chamados[0];

    // Criar notificação para administradores/supervisores
    try {
      await NotificacoesService.notificarChamadoCriado(chamado);
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      // Não falhar a criação do chamado se a notificação falhar
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(chamado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, chamado.id);

    return successResponse(res, data, 'Chamado criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar chamado
   */
  static atualizarChamado = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, descricao_correcao, sistema, tela, tipo, status, prioridade, usuario_responsavel_id } = req.body;
    const usuario_id = req.user.id;

    // Verificar se chamado existe
    const existingChamado = await executeQuery(
      'SELECT * FROM chamados WHERE id = ? AND ativo = 1',
      [id]
    );

    if (existingChamado.length === 0) {
      return notFoundResponse(res, 'Chamado não encontrado');
    }

    const chamadoAntigo = existingChamado[0];

    // Verificar se apenas o responsável pode editar (se houver responsável)
    // Administradores sempre podem editar
    if (req.user.tipo_de_acesso !== 'administrador') {
      if (chamadoAntigo.usuario_responsavel_id) {
        // Se o chamado tem um responsável, apenas ele pode editar
        if (chamadoAntigo.usuario_responsavel_id !== usuario_id) {
          return errorResponse(
            res, 
            'Apenas o responsável pelo chamado pode editá-lo. Para editar este chamado, você precisa assumi-lo primeiro.', 
            STATUS_CODES.FORBIDDEN
          );
        }
      }
    }

    // Construir query de atualização dinamicamente
    const updates = [];
    const params = [];

    // Campos que podem ser atualizados
    const camposPermitidos = {
      titulo,
      descricao,
      descricao_correcao,
      sistema,
      tela,
      tipo,
      status,
      prioridade,
      usuario_responsavel_id
    };

    // Registrar mudanças no histórico e criar notificações
    for (const [campo, valorNovo] of Object.entries(camposPermitidos)) {
      if (valorNovo !== undefined && valorNovo !== null && valorNovo !== chamadoAntigo[campo]) {
        updates.push(`${campo} = ?`);
        params.push(valorNovo);

        // Registrar no histórico
        await executeQuery(
          `INSERT INTO chamados_historico 
            (chamado_id, usuario_id, campo_alterado, valor_anterior, valor_novo) 
          VALUES (?, ?, ?, ?, ?)`,
          [id, usuario_id, campo, chamadoAntigo[campo] || null, valorNovo]
        );

        // Criar notificações para mudanças importantes
        try {
          if (campo === 'status') {
            await NotificacoesService.notificarStatusAlterado(
              chamadoAntigo, 
              chamadoAntigo.status, 
              valorNovo, 
              req.user
            );
          } else if (campo === 'prioridade') {
            // Atualizar prazo de resolução quando prioridade mudar
            await SLAService.atualizarDataLimite(id, valorNovo);
            
            await NotificacoesService.notificarPrioridadeAlterada(
              chamadoAntigo,
              chamadoAntigo.prioridade,
              valorNovo
            );
          } else if (campo === 'usuario_responsavel_id' && valorNovo) {
            // Buscar dados do usuário atribuidor
            const usuarios = await executeQuery('SELECT nome FROM usuarios WHERE id = ?', [usuario_id]);
            const usuarioAtribuidor = usuarios[0] || { nome: 'Sistema' };
            
            await NotificacoesService.notificarChamadoAtribuido(
              chamadoAntigo,
              valorNovo,
              usuarioAtribuidor
            );
          }
        } catch (error) {
          console.error('Erro ao criar notificação:', error);
          // Não falhar a atualização se a notificação falhar
        }
      }
    }

    // Se status foi alterado para concluido, atualizar data_conclusao
    if (status === 'concluido' && chamadoAntigo.status !== 'concluido') {
      updates.push('data_conclusao = NOW()');
    } else if (status !== 'concluido' && chamadoAntigo.status === 'concluido') {
      updates.push('data_conclusao = NULL');
    }

    if (updates.length === 0) {
      // Nenhuma alteração, retornar chamado atual
      const chamados = await executeQuery(
        `SELECT 
          c.id,
          c.titulo,
          c.descricao,
          c.descricao_correcao,
          c.sistema,
          c.tela,
          c.tipo,
          c.status,
          c.prioridade,
          c.usuario_abertura_id,
          c.usuario_responsavel_id,
          c.data_abertura,
          c.data_conclusao,
          c.data_atualizacao,
          c.prazo_resolucao_horas,
          c.data_limite_resolucao,
          c.tempo_resposta_minutos,
          c.data_primeira_resposta,
          ua.nome as usuario_abertura_nome,
          ua.email as usuario_abertura_email,
          ur.nome as usuario_responsavel_nome,
          ur.email as usuario_responsavel_email
        FROM chamados c
        LEFT JOIN usuarios ua ON c.usuario_abertura_id = ua.id
        LEFT JOIN usuarios ur ON c.usuario_responsavel_id = ur.id
        WHERE c.id = ?`,
        [id]
      );

      const chamado = chamados[0];
      const data = res.addResourceLinks(chamado);
      const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
      const actions = res.generateActionLinks(userPermissions, chamado.id);

      return successResponse(res, data, 'Nenhuma alteração realizada', STATUS_CODES.OK, {
        actions
      });
    }

    // Adicionar data_atualizacao
    updates.push('data_atualizacao = NOW()');
    params.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE chamados SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Buscar chamado atualizado
    const chamados = await executeQuery(
      `SELECT 
        c.id,
        c.titulo,
        c.descricao,
        c.descricao_correcao,
        c.sistema,
        c.tela,
        c.tipo,
        c.status,
        c.prioridade,
        c.usuario_abertura_id,
        c.usuario_responsavel_id,
        c.data_abertura,
        c.data_conclusao,
        c.data_atualizacao,
        c.prazo_resolucao_horas,
        c.data_limite_resolucao,
        c.tempo_resposta_minutos,
        c.data_primeira_resposta,
        ua.nome as usuario_abertura_nome,
        ua.email as usuario_abertura_email,
        ur.nome as usuario_responsavel_nome,
        ur.email as usuario_responsavel_email
      FROM chamados c
      LEFT JOIN usuarios ua ON c.usuario_abertura_id = ua.id
      LEFT JOIN usuarios ur ON c.usuario_responsavel_id = ur.id
      WHERE c.id = ?`,
      [id]
    );

    const chamado = chamados[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(chamado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, chamado.id);

    return successResponse(res, data, 'Chamado atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir chamado (soft delete)
   */
  static excluirChamado = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se chamado existe
    const existingChamado = await executeQuery(
      'SELECT id FROM chamados WHERE id = ? AND ativo = 1',
      [id]
    );

    if (existingChamado.length === 0) {
      return notFoundResponse(res, 'Chamado não encontrado');
    }

    // Soft delete
    await executeQuery(
      'UPDATE chamados SET ativo = 0, data_atualizacao = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Chamado excluído com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões baseada no usuário
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }

}

module.exports = ChamadosCRUDController;
