/**
 * Service de Notificações
 * Responsável pela lógica de negócio das notificações
 */

const { executeQuery } = require('../../config/database');

class NotificacoesService {
  
  /**
   * Criar notificação
   */
  static async criarNotificacao(data) {
    const { usuario_id, chamado_id, tipo, titulo, mensagem } = data;

    const result = await executeQuery(
      `INSERT INTO notificacoes 
        (usuario_id, chamado_id, tipo, titulo, mensagem, data_criacao) 
      VALUES (?, ?, ?, ?, ?, NOW())`,
      [usuario_id, chamado_id || null, tipo, titulo, mensagem]
    );

    return result.insertId;
  }

  /**
   * Criar notificações para múltiplos usuários
   */
  static async criarNotificacoesEmMassa(usuarios_ids, data) {
    if (!usuarios_ids || usuarios_ids.length === 0) return [];

    const valores = usuarios_ids.map(usuario_id => 
      `(${usuario_id}, ${data.chamado_id || 'NULL'}, '${data.tipo}', '${data.titulo.replace(/'/g, "''")}', '${data.mensagem.replace(/'/g, "''")}', NOW())`
    ).join(',');

    const query = `
      INSERT INTO notificacoes 
        (usuario_id, chamado_id, tipo, titulo, mensagem, data_criacao) 
      VALUES ${valores}
    `;

    await executeQuery(query);
  }

  /**
   * Notificar quando chamado é criado
   */
  static async notificarChamadoCriado(chamado, usuariosParaNotificar = []) {
    // Notificar administradores e supervisores se não houver usuários específicos
    if (usuariosParaNotificar.length === 0) {
      const admins = await executeQuery(
        `SELECT id FROM usuarios 
         WHERE tipo_de_acesso IN ('administrador', 'supervisor') 
         AND status = 'ativo'`
      );
      usuariosParaNotificar = admins.map(u => u.id);
    }

    if (usuariosParaNotificar.length === 0) return;

    await this.criarNotificacoesEmMassa(usuariosParaNotificar, {
      chamado_id: chamado.id,
      tipo: 'chamado_criado',
      titulo: 'Novo Chamado Criado',
      mensagem: `Um novo chamado foi criado: "${chamado.titulo}"`
    });
  }

  /**
   * Notificar quando chamado é atribuído
   */
  static async notificarChamadoAtribuido(chamado, usuarioResponsavelId, usuarioAtribuidor) {
    if (!usuarioResponsavelId) return;

    await this.criarNotificacao({
      usuario_id: usuarioResponsavelId,
      chamado_id: chamado.id,
      tipo: 'chamado_atribuido',
      titulo: 'Chamado Atribuído a Você',
      mensagem: `${usuarioAtribuidor?.nome || 'Um administrador'} atribuiu o chamado "${chamado.titulo}" a você.`
    });
  }

  /**
   * Função auxiliar para formatar status para exibição
   */
  static formatarStatus(status) {
    const statusMap = {
      'aberto': 'Aberto',
      'em_analise': 'Em Análise',
      'em_desenvolvimento': 'Em Desenvolvimento',
      'em_teste': 'Em Teste',
      'concluido': 'Concluído',
      'fechado': 'Fechado'
    };
    return statusMap[status] || status;
  }

  /**
   * Notificar quando status é alterado
   */
  static async notificarStatusAlterado(chamado, statusAnterior, statusNovo, usuarioAlterador) {
    const statusAnteriorFormatado = this.formatarStatus(statusAnterior);
    const statusNovoFormatado = this.formatarStatus(statusNovo);
    
    // Notificar criador do chamado
    if (chamado.usuario_abertura_id) {
      await this.criarNotificacao({
        usuario_id: chamado.usuario_abertura_id,
        chamado_id: chamado.id,
        tipo: 'status_alterado',
        titulo: 'Status do Chamado Alterado',
        mensagem: `O status do chamado "${chamado.titulo}" foi alterado de "${statusAnteriorFormatado}" para "${statusNovoFormatado}" por ${usuarioAlterador?.nome || 'um usuário'}.`
      });
    }

    // Notificar responsável se houver
    if (chamado.usuario_responsavel_id && chamado.usuario_responsavel_id !== chamado.usuario_abertura_id) {
      await this.criarNotificacao({
        usuario_id: chamado.usuario_responsavel_id,
        chamado_id: chamado.id,
        tipo: 'status_alterado',
        titulo: 'Status do Chamado Alterado',
        mensagem: `O status do chamado "${chamado.titulo}" foi alterado de "${statusAnteriorFormatado}" para "${statusNovoFormatado}".`
      });
    }
  }

  /**
   * Notificar quando comentário é adicionado
   */
  static async notificarComentarioAdicionado(chamado, comentario, usuarioComentador) {
    const usuariosParaNotificar = [];

    // Adicionar criador do chamado
    if (chamado.usuario_abertura_id) {
      usuariosParaNotificar.push(chamado.usuario_abertura_id);
    }

    // Adicionar responsável se houver e for diferente
    if (chamado.usuario_responsavel_id && 
        chamado.usuario_responsavel_id !== chamado.usuario_abertura_id &&
        chamado.usuario_responsavel_id !== usuarioComentador.id) {
      usuariosParaNotificar.push(chamado.usuario_responsavel_id);
    }

    // Remover duplicatas
    const usuariosUnicos = [...new Set(usuariosParaNotificar)];

    if (usuariosUnicos.length === 0) return;

    await this.criarNotificacoesEmMassa(usuariosUnicos, {
      chamado_id: chamado.id,
      tipo: 'comentario_adicionado',
      titulo: 'Novo Comentário no Chamado',
      mensagem: `${usuarioComentador.nome} adicionou um comentário no chamado "${chamado.titulo}".`
    });
  }

  /**
   * Notificar quando prioridade é alterada
   */
  static async notificarPrioridadeAlterada(chamado, prioridadeAnterior, prioridadeNova) {
    // Notificar apenas se for crítica
    if (prioridadeNova === 'critica') {
      const admins = await executeQuery(
        `SELECT id FROM usuarios 
         WHERE tipo_de_acesso IN ('administrador', 'supervisor') 
         AND status = 'ativo'`
      );

      if (admins.length > 0) {
        await this.criarNotificacoesEmMassa(admins.map(u => u.id), {
          chamado_id: chamado.id,
          tipo: 'prioridade_alterada',
          titulo: 'Chamado com Prioridade Crítica',
          mensagem: `O chamado "${chamado.titulo}" foi marcado como CRÍTICO.`
        });
      }
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async marcarComoLida(notificacaoId, usuarioId) {
    await executeQuery(
      `UPDATE notificacoes 
       SET lida = 1, data_leitura = NOW() 
       WHERE id = ? AND usuario_id = ?`,
      [notificacaoId, usuarioId]
    );
  }

  /**
   * Marcar todas as notificações como lidas
   */
  static async marcarTodasComoLidas(usuarioId) {
    await executeQuery(
      `UPDATE notificacoes 
       SET lida = 1, data_leitura = NOW() 
       WHERE usuario_id = ? AND lida = 0`,
      [usuarioId]
    );
  }

  /**
   * Obter notificações não lidas de um usuário
   */
  static async obterNaoLidas(usuarioId, limit = 20) {
    return await executeQuery(
      `SELECT 
        n.id,
        n.chamado_id,
        n.tipo,
        n.titulo,
        n.mensagem,
        n.lida,
        n.data_criacao,
        c.titulo as chamado_titulo,
        c.status as chamado_status
      FROM notificacoes n
      LEFT JOIN chamados c ON n.chamado_id = c.id
      WHERE n.usuario_id = ? AND n.lida = 0 AND n.ativo = 1
      ORDER BY n.data_criacao DESC
      LIMIT ?`,
      [usuarioId, limit]
    );
  }

  /**
   * Contar notificações não lidas
   */
  static async contarNaoLidas(usuarioId) {
    const result = await executeQuery(
      `SELECT COUNT(*) as total 
       FROM notificacoes 
       WHERE usuario_id = ? AND lida = 0 AND ativo = 1`,
      [usuarioId]
    );
    return result[0]?.total || 0;
  }
}

module.exports = NotificacoesService;

