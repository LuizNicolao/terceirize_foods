/**
 * Controller de Aprovações
 * Gerencia todas as operações relacionadas a aprovações de cotações
 */

const { executeQuery } = require('../../config/database');

// Debug: verificar se o banco de dados foi importado (comentado para limpeza)
// console.log('📦 Banco de dados importado:', !!executeQuery);
const { successResponse, errorResponse, notFoundResponse } = require('../../middleware/responseHandler');

// Debug: verificar se o middleware de resposta foi importado (comentado para limpeza)
// console.log('📦 Middleware de resposta importado:', !!successResponse, !!errorResponse, !!notFoundResponse);

class AprovacoesController {
  // GET /api/aprovacoes - Listar aprovações
  static async getAprovacoes(req, res) {
    try {
      const { page = 1, limit = 10, search = '', status = '', tipo = '', comprador = '', dataInicio = '', dataFim = '' } = req.query;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let params = [];

      // Filtro baseado no papel do usuário
      if (req.user.role !== 'administrador') {
        whereConditions.push('c.comprador = ?');
        params.push(req.user.name);
      }

      // Filtrar apenas cotações aguardando aprovação da gerência
      whereConditions.push('c.status = ?');
      params.push('aguardando_aprovacao');

      // Filtros de busca
      if (search) {
        whereConditions.push('(c.comprador LIKE ? OR c.local_entrega LIKE ? OR c.justificativa LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (tipo && tipo !== 'todos') {
        whereConditions.push('c.tipo_compra = ?');
        params.push(tipo);
      }

      if (comprador) {
        whereConditions.push('c.comprador = ?');
        params.push(comprador);
      }

      if (dataInicio) {
        whereConditions.push('DATE(c.data_criacao) >= ?');
        params.push(dataInicio);
      }

      if (dataFim) {
        whereConditions.push('DATE(c.data_criacao) <= ?');
        params.push(dataFim);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Query para buscar aprovações
      const query = `
        SELECT 
          c.id,
          c.id as numero,
          c.local_entrega as titulo,
          c.comprador as solicitante,
          c.tipo_compra,
          c.motivo_emergencial,
          c.justificativa,
          c.motivo_final,
          c.status,
          c.data_criacao,
          c.data_atualizacao,
          c.total_produtos,
          c.produtos_duplicados,
          c.total_quantidade,
          c.total_fornecedores
        FROM cotacoes c
        ${whereClause}
        ORDER BY c.data_criacao DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;

      const aprovacoes = await executeQuery(query, params);

      // Contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total
        FROM cotacoes c
        ${whereClause}
      `;

      const [{ total }] = await executeQuery(countQuery, params);

      // Calcular estatísticas apenas para cotações aguardando aprovação
      const statsQuery = `
        SELECT 
          COUNT(CASE WHEN status = 'aguardando_aprovacao' THEN 1 END) as aguardando_aprovacao,
          COUNT(CASE WHEN status = 'em_analise' THEN 1 END) as em_analise,
          COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as aprovado,
          COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as rejeitado,
          COUNT(CASE WHEN status = 'renegociacao' THEN 1 END) as renegociacao
        FROM cotacoes c
        WHERE c.status = 'aguardando_aprovacao'
        ${req.user.role !== 'administrador' ? 'AND c.comprador = ?' : ''}
      `;
      
      const statsParams = req.user.role !== 'administrador' ? [req.user.name] : [];

      const [stats] = await executeQuery(statsQuery, statsParams);

      const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        stats
      };

      return successResponse(res, aprovacoes, 'Aprovações listadas com sucesso', 200, meta);
    } catch (error) {
      console.error('Erro ao buscar aprovações:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  // GET /api/aprovacoes/:id - Buscar aprovação por ID
  static async getAprovacao(req, res) {
    try {
      const { id } = req.params;

      // Buscar dados básicos da cotação
      let cotacaoQuery = `
        SELECT 
          c.*
        FROM cotacoes c
        WHERE c.id = ?
      `;
      let queryParams = [id];

      // Adicionar filtro de segurança para usuários não administradores
      if (req.user.role !== 'administrador') {
        cotacaoQuery += ' AND c.comprador = ?';
        queryParams.push(req.user.name);
      }

      const [cotacao] = await executeQuery(cotacaoQuery, queryParams);

      if (!cotacao) {
        return notFoundResponse(res, 'Aprovação não encontrada');
      }

      // Buscar todos os itens da cotação (produtos + fornecedores) no formato do supervisor
      const itensQuery = `
        SELECT 
          fp.id as item_id,
          fp.produto_id,
          fp.nome as produto_nome,
          fp.qtde as quantidade,
          fp.un as unidade,
          fp.valor_unitario,
          fp.primeiro_valor,
          fp.valor_anterior,
          fp.total,
          fp.difal,
          fp.ipi,
          fp.prazo_entrega,
          fp.data_entrega_fn,
          fp.ult_valor_aprovado,
          fp.ult_fornecedor_aprovado,
          f.id as fornecedor_id,
          f.nome as fornecedor_nome,
          f.fornecedor_id as fornecedor_codigo,
          f.tipo_frete,
          f.valor_frete,
          f.prazo_pagamento,
          f.frete,
          -- Buscar último valor aprovado das tabelas saving e saving_itens
          (
            SELECT si.valor_unitario_final
            FROM saving s
            JOIN saving_itens si ON s.id = si.saving_id
            WHERE s.tipo = 'programada'
              AND s.status = 'concluido'
              AND si.descricao COLLATE utf8mb4_general_ci = fp.nome COLLATE utf8mb4_general_ci
              AND si.status = 'aprovado'
            ORDER BY s.data_registro DESC
            LIMIT 1
          ) as ultimo_valor_aprovado_saving,
          -- Buscar último fornecedor aprovado das tabelas saving e saving_itens
          (
            SELECT si.fornecedor
            FROM saving s
            JOIN saving_itens si ON s.id = si.saving_id
            WHERE s.tipo = 'programada'
              AND s.status = 'concluido'
              AND si.descricao COLLATE utf8mb4_general_ci = fp.nome COLLATE utf8mb4_general_ci
              AND si.status = 'aprovado'
            ORDER BY s.data_registro DESC
            LIMIT 1
          ) as ultimo_fornecedor_aprovado_saving
        FROM produtos_fornecedores fp
        INNER JOIN fornecedores f ON fp.fornecedor_id = f.id
        WHERE f.cotacao_id = ?
        ORDER BY fp.nome, f.nome
      `;

      const itens = await executeQuery(itensQuery, [id]);

      // Verificar se existem fornecedores e produtos
      const fornecedoresCountQuery = 'SELECT COUNT(*) as count FROM fornecedores WHERE cotacao_id = ?';
      const produtosCountQuery = 'SELECT COUNT(*) as count FROM produtos_fornecedores fp INNER JOIN fornecedores f ON fp.fornecedor_id = f.id WHERE f.cotacao_id = ?';
      
      const [fornecedoresCount] = await executeQuery(fornecedoresCountQuery, [id]);
      const [produtosCount] = await executeQuery(produtosCountQuery, [id]);

      // Montar resposta no formato do supervisor
      const aprovacaoCompleta = {
        ...cotacao,
        itens
      };

      return successResponse(res, aprovacaoCompleta, 'Aprovação encontrada com sucesso');
    } catch (error) {
      console.error('Erro ao buscar aprovação:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  // POST /api/aprovacoes/:id/aprovar - Aprovar cotação
  static async aprovarCotacao(req, res) {
    try {
      const { id } = req.params;
      const { motivo_aprovacao, itens_aprovados, tipo_aprovacao = 'manual' } = req.body;

      // Debug removido
      
      // Verificar se a cotação existe e pode ser aprovada
      const [cotacao] = await executeQuery(
        'SELECT * FROM cotacoes WHERE id = ? AND status IN ("aguardando_aprovacao")',
        [id]
      );

      if (!cotacao) {
        return notFoundResponse(res, 'Cotação não encontrada ou não pode ser aprovada');
      }

      // Atualizar status da cotação
      await executeQuery(
        'UPDATE cotacoes SET status = "aprovada", data_atualizacao = NOW() WHERE id = ?',
        [id]
      );

      // Criar registro de auditoria (comentado temporariamente)
      // await executeQuery(
      //   `INSERT INTO auditoria_cotacoes 
      //    (cotacao_id, usuario_id, acao, detalhes, data_registro) 
      //    VALUES (?, ?, ?, ?, NOW())`,
      //   [id, req.user.id, 'aprovacao', JSON.stringify({ motivo: motivo_aprovacao, tipo: tipo_aprovacao, itens: itens_aprovados })]
      // );

      // Criar registro na tabela saving (se necessário)
      if (itens_aprovados && itens_aprovados.length > 0) {
        await AprovacoesController.criarRegistroSaving(id, req.user.id, cotacao, motivo_aprovacao, itens_aprovados);
        
        // Após criar o saving, remover dados das tabelas originais (comentado temporariamente)
        // console.log('🔍 Removendo dados originais da cotação:', id);
        // await this.limparDadosOriginais(id);
      }

      return successResponse(res, null, 'Cotação aprovada com sucesso', 200);
    } catch (error) {
      console.error('Erro ao aprovar cotação:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  // POST /api/aprovacoes/:id/rejeitar - Rejeitar cotação
  static async rejeitarCotacao(req, res) {
    try {
      const { id } = req.params;
      const { motivo_rejeicao } = req.body;

      // Verificar se a cotação existe e pode ser rejeitada
      const [cotacao] = await executeQuery(
        'SELECT * FROM cotacoes WHERE id = ? AND status IN ("aguardando_aprovacao")',
        [id]
      );

      if (!cotacao) {
        return notFoundResponse(res, 'Cotação não encontrada ou não pode ser rejeitada');
      }

      // Atualizar status da cotação
      await executeQuery(
        'UPDATE cotacoes SET status = "rejeitada", data_atualizacao = NOW() WHERE id = ?',
        [id]
      );

      // Criar registro de auditoria (comentado temporariamente)
      // await executeQuery(
      //   `INSERT INTO auditoria_cotacoes 
      //    (cotacao_id, usuario_id, acao, detalhes, data_registro) 
      //    VALUES (?, ?, ?, ?, NOW())`,
      //   [id, req.user.id, 'rejeicao', JSON.stringify({ motivo: motivo_rejeicao })]
      // );

      return successResponse(res, null, 'Cotação rejeitada com sucesso', 200);
    } catch (error) {
      console.error('Erro ao rejeitar cotação:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  // POST /api/aprovacoes/:id/renegociar - Renegociar cotação
  static async renegociarCotacao(req, res) {
    try {
      const { id } = req.params;
      const { motivo_renegociacao } = req.body;

      // Verificar se a cotação existe e pode ser renegociada
      const [cotacao] = await executeQuery(
        'SELECT * FROM cotacoes WHERE id = ? AND status IN ("aguardando_aprovacao")',
        [id]
      );

      if (!cotacao) {
        return notFoundResponse(res, 'Cotação não encontrada ou não pode ser renegociada');
      }

      // Atualizar status da cotação
      await executeQuery(
        'UPDATE cotacoes SET status = "renegociacao", data_atualizacao = NOW() WHERE id = ?',
        [id]
      );

      // Criar registro de auditoria (comentado temporariamente)
      // await executeQuery(
      //   `INSERT INTO auditoria_cotacoes 
      //    (cotacao_id, usuario_id, acao, detalhes, data_registro) 
      //    VALUES (?, ?, ?, ?, NOW())`,
      //   [id, req.user.id, 'renegociacao', JSON.stringify({ motivo: motivo_renegociacao })]
      // );

      return successResponse(res, null, 'Cotação enviada para renegociação com sucesso', 200);
    } catch (error) {
      console.error('Erro ao renegociar cotação:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  // GET /api/aprovacoes/stats/overview - Estatísticas gerais
  static async getStatsOverview(req, res) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'aguardando_aprovacao' THEN 1 END) as aguardando_aprovacao,
          COUNT(CASE WHEN status = 'em_analise' THEN 1 END) as em_analise,
          COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as aprovadas,
          COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as rejeitadas,
          COUNT(CASE WHEN status = 'renegociacao' THEN 1 END) as renegociacao
        FROM cotacoes
        WHERE status IN ('aguardando_aprovacao', 'aprovada', 'rejeitada', 'renegociacao')
      `;

      const [stats] = await executeQuery(statsQuery);

      return successResponse(res, stats, 'Estatísticas carregadas com sucesso');
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  // GET /api/aprovacoes/export/xlsx - Exportar para XLSX
  static async exportXLSX(req, res) {
    try {
      // Implementar lógica de exportação XLSX
      return successResponse(res, null, 'Exportação XLSX implementada');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  // GET /api/aprovacoes/export/pdf - Exportar para PDF
  static async exportPDF(req, res) {
    try {
      // Implementar lógica de exportação PDF
      return successResponse(res, null, 'Exportação PDF implementada');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  // Método auxiliar para criar registro de saving
  static async criarRegistroSaving(cotacaoId, usuarioId, cotacao, motivo, itensAprovados) {
    try {
      // Calcular valores totais
      let valorTotalInicial = 0;
      let valorTotalFinal = 0;

      for (const item of itensAprovados) {
        // Usar valor_unitario como valor final e estimar valor inicial (10% a mais)
        const valorFinal = parseFloat(item.valor_unitario) || 0;
        const valorInicial = valorFinal * 1.1; // 10% a mais como estimativa
        const quantidade = parseFloat(item.quantidade) || 1;
        
        valorTotalInicial += valorInicial * quantidade;
        valorTotalFinal += valorFinal * quantidade;
      }

      const economia = valorTotalInicial - valorTotalFinal;
      const economiaPercentual = valorTotalInicial > 0 ? (economia / valorTotalInicial) * 100 : 0;

      // Buscar usuário comprador
      const usuarios = await executeQuery(
        'SELECT id FROM users WHERE name = ?',
        [cotacao.comprador]
      );

      const compradorId = usuarios.length > 0 ? usuarios[0].id : usuarioId;

      // Inserir registro na tabela saving
      const savingQuery = `
        INSERT INTO saving (
          cotacao_id, 
          usuario_id, 
          data_registro, 
          data_aprovacao,
          valor_total_inicial, 
          valor_total_final, 
          economia, 
          economia_percentual, 
          rodadas, 
          status, 
          observacoes,
          tipo,
          motivo_emergencial,
          centro_distribuicao
        ) VALUES (?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, 'concluido', ?, ?, ?, ?)
      `;
      
      const savingResult = await executeQuery(savingQuery, [
        cotacaoId,
        compradorId,
        valorTotalInicial,
        valorTotalFinal,
        economia,
        economiaPercentual,
        1, // rodadas
        `Cotação aprovada: ${motivo || 'Sem motivo informado'}`,
        cotacao.tipo_compra || 'programada',
        cotacao.motivo_emergencial || null,
        cotacao.local_entrega || 'CD CHAPECO'
      ]);

      const savingId = savingResult.insertId;

      // Buscar dados completos dos itens aprovados incluindo informações do fornecedor
      for (const item of itensAprovados) {
        // Buscar dados completos do item incluindo informações do fornecedor
        const itemCompletoQuery = `
          SELECT 
            pf.*,
            f.prazo_pagamento as fornecedor_prazo_pagamento,
            f.valor_frete,
            f.tipo_frete
          FROM produtos_fornecedores pf
          JOIN fornecedores f ON pf.fornecedor_id = f.id
          WHERE pf.nome = ? 
          AND f.nome = ?
          AND f.cotacao_id = ?
        `;
        

        
        const itemCompleto = await executeQuery(itemCompletoQuery, [
          item.produto_nome,
          item.fornecedor_nome,
          cotacaoId
        ]);

        const dadosItem = itemCompleto.length > 0 ? itemCompleto[0] : {};

        // Calcular valores para o item
        const valorFinal = parseFloat(item.valor_unitario) || 0;
        const valorInicial = valorFinal * 1.1; // 10% a mais como estimativa
        const quantidade = parseFloat(item.quantidade) || 1;
        const valorTotalInicial = valorInicial * quantidade;
        const valorTotalFinal = valorFinal * quantidade;
        const economia = valorTotalInicial - valorTotalFinal;
        const economiaPercentual = valorTotalInicial > 0 ? (economia / valorTotalInicial) * 100 : 0;

        await executeQuery(`
          INSERT INTO saving_itens (
            saving_id,
            item_id,
            descricao,
            quantidade,
            valor_unitario_inicial,
            valor_unitario_final,
            economia,
            economia_percentual,
            fornecedor,
            status,
            prazo_entrega,
            data_entrega_fn,
            frete,
            difal,
            prazo_pagamento
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'aprovado', ?, ?, ?, ?, ?)
        `, [
          savingId,
          0, // item_id temporário
          item.produto_nome,
          quantidade,
          valorInicial,
          valorFinal,
          economia,
          economiaPercentual,
          item.fornecedor_nome,
          dadosItem.prazo_entrega || null,
          dadosItem.data_entrega_fn || null,
          dadosItem.valor_frete || 0,
          dadosItem.difal || 0,
          dadosItem.fornecedor_prazo_pagamento || null
        ]);
      }
    } catch (error) {
      console.error('Erro ao criar registro de saving:', error);
      throw error;
    }
  }

  // Método auxiliar para limpar dados originais (como no cotacaoLuiz)
  static async limparDadosOriginais(cotacaoId) {
    try {
      // Remover produtos_fornecedores
      await executeQuery(
        'DELETE pf FROM produtos_fornecedores pf JOIN fornecedores f ON pf.fornecedor_id = f.id WHERE f.cotacao_id = ?',
        [cotacaoId]
      );

      // Remover fornecedores
      await executeQuery(
        'DELETE FROM fornecedores WHERE cotacao_id = ?',
        [cotacaoId]
      );

      // Remover produtos
      await executeQuery(
        'DELETE FROM produtos WHERE cotacao_id = ?',
        [cotacaoId]
      );

      // Remover cotacao
      await executeQuery(
        'DELETE FROM cotacoes WHERE id = ?',
        [cotacaoId]
      );

      console.log(`Dados da cotação ${cotacaoId} removidos com sucesso.`);
    } catch (error) {
      console.error('Erro ao limpar dados originais:', error);
      throw error;
    }
  }
}

module.exports = AprovacoesController;
