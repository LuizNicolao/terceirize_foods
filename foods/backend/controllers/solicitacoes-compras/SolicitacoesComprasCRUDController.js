/**
 * Controller de CRUD de Solicitações de Compras
 * Responsável por criar, atualizar e excluir solicitações
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class SolicitacoesComprasCRUDController {
  
  /**
   * Gerar número automático da solicitação
   */
  static async gerarNumeroSolicitacao() {
    const [ultima] = await executeQuery(
      `SELECT numero_solicitacao 
       FROM solicitacoes_compras 
       WHERE numero_solicitacao LIKE 'SC%' 
       ORDER BY id DESC 
       LIMIT 1`
    );

    if (ultima) {
      const numero = parseInt(ultima.numero_solicitacao.substring(2));
      const proximo = 'SC' + String(numero + 1).padStart(6, '0');
      return proximo;
    }
    return 'SC000001';
  }

  /**
   * Calcular semana de abastecimento baseado na data (semana seguinte)
   */
  static calcularSemanaAbastecimento(dataEntrega) {
    // Adicionar 7 dias para pegar a semana seguinte
    const data = new Date(dataEntrega);
    data.setDate(data.getDate() + 7);
    
    const diaSemana = data.getDay();
    const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana; // Segunda-feira
    
    const inicioSemana = new Date(data);
    inicioSemana.setDate(data.getDate() + diferenca);
    
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);

    const formatarData = (d) => {
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      return `${dia}/${mes}/${ano}`;
    };

    return `${formatarData(inicioSemana)} a ${formatarData(fimSemana)}`;
  }

  /**
   * Buscar semana de abastecimento existente ou calcular
   * A semana de abastecimento deve ser a semana seguinte à data de entrega CD
   */
  static async buscarSemanaAbastecimento(dataEntrega) {
    // Primeiro, buscar se já existe na tabela solicitacoes_compras
    const [existente] = await executeQuery(
      `SELECT semana_abastecimento 
       FROM solicitacoes_compras 
       WHERE data_entrega_cd = ? 
         AND semana_abastecimento IS NOT NULL 
       LIMIT 1`,
      [dataEntrega]
    );

    if (existente && existente.semana_abastecimento) {
      return existente.semana_abastecimento;
    }

    // Buscar na tabela calendario usando a data + 7 dias (semana seguinte)
    // A tabela calendario tem a relação entre data e semana_abastecimento
    const dataEntregaObj = new Date(dataEntrega);
    const dataSeguinte = new Date(dataEntregaObj);
    dataSeguinte.setDate(dataSeguinte.getDate() + 7);
    const dataSeguinteStr = dataSeguinte.toISOString().split('T')[0];

    const [calendario] = await executeQuery(
      `SELECT semana_abastecimento, semana_abastecimento_inicio, semana_abastecimento_fim
       FROM calendario 
       WHERE data = ?
       LIMIT 1`,
      [dataSeguinteStr]
    );

    if (calendario && calendario.semana_abastecimento) {
      return calendario.semana_abastecimento;
    }

    // Se não encontrou na tabela calendario, calcular a semana seguinte manualmente
    return this.calcularSemanaAbastecimento(dataEntrega);
  }

  /**
   * Criar nova solicitação de compras
   */
  static criarSolicitacao = asyncHandler(async (req, res) => {
    const {
      filial_id,
      data_entrega_cd,
      motivo,
      observacoes,
      itens
    } = req.body;

    const usuario_id = req.user.id;

    // Validar campos obrigatórios
    if (!filial_id || !data_entrega_cd || !motivo) {
      return errorResponse(res, 'Campos obrigatórios: filial_id, data_entrega_cd, motivo', STATUS_CODES.BAD_REQUEST);
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return errorResponse(res, 'A solicitação deve ter pelo menos um item', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se filial existe
    const [filial] = await executeQuery(
      'SELECT filial FROM filiais WHERE id = ?',
      [filial_id]
    );

    if (!filial) {
      return errorResponse(res, 'Filial não encontrada', STATUS_CODES.NOT_FOUND);
    }

    // Gerar número da solicitação
    const numero_solicitacao = await this.gerarNumeroSolicitacao();

    // Buscar semana de abastecimento
    const semana_abastecimento = await this.buscarSemanaAbastecimento(data_entrega_cd);

    // Buscar nome do usuário
    const [usuario] = await executeQuery(
      'SELECT nome FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    const usuario_nome = usuario ? usuario.nome : req.user.nome || 'Usuário';

    // Inserir solicitação
    const result = await executeQuery(
      `INSERT INTO solicitacoes_compras (
        numero_solicitacao,
        descricao,
        usuario_id,
        usuario_nome,
        unidade,
        data_necessidade,
        data_entrega_cd,
        semana_abastecimento,
        observacoes,
        status,
        data_documento,
        motivo,
        filial_id,
        criado_por,
        criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'em_digitacao', CURDATE(), ?, ?, ?, NOW())`,
      [
        numero_solicitacao,
        motivo, // descricao = motivo
        usuario_id,
        usuario_nome,
        filial.filial || filial.nome,
        data_entrega_cd,
        data_entrega_cd,
        semana_abastecimento,
        observacoes || null,
        motivo,
        filial_id,
        usuario_id
      ]
    );

    const solicitacao_id = result.insertId;

    // Inserir itens
    for (const item of itens) {
      const { produto_id, quantidade, unidade_medida_id, observacao } = item;

      if (!produto_id || !quantidade || !unidade_medida_id) {
        await executeQuery('DELETE FROM solicitacoes_compras WHERE id = ?', [solicitacao_id]);
        return errorResponse(res, 'Todos os itens devem ter produto_id, quantidade e unidade_medida_id', STATUS_CODES.BAD_REQUEST);
      }

      // Buscar dados do produto
      const [produto] = await executeQuery(
        'SELECT codigo, nome FROM produto_generico WHERE id = ?',
        [produto_id]
      );

      if (!produto) {
        await executeQuery('DELETE FROM solicitacoes_compras WHERE id = ?', [solicitacao_id]);
        return errorResponse(res, `Produto com ID ${produto_id} não encontrado`, STATUS_CODES.NOT_FOUND);
      }

      // Buscar símbolo da unidade
      const [unidade] = await executeQuery(
        'SELECT sigla FROM unidades_medida WHERE id = ?',
        [unidade_medida_id]
      );

      await executeQuery(
        `INSERT INTO solicitacao_compras_itens (
          solicitacao_id,
          produto_id,
          codigo_produto,
          nome_produto,
          unidade_medida_id,
          unidade_medida,
          quantidade,
          observacao,
          criado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          solicitacao_id,
          produto_id,
          produto.codigo,
          produto.nome,
          unidade_medida_id,
          unidade ? unidade.sigla : null,
          quantidade,
          observacao || null
        ]
      );
    }

    // Trigger já atualiza valor_total automaticamente

    // Buscar solicitação criada
    const [solicitacao] = await executeQuery(
      `SELECT 
        sc.*,
        f.filial as filial_nome,
        f.codigo_filial as filial_codigo
      FROM solicitacoes_compras sc
      LEFT JOIN filiais f ON sc.filial_id = f.id
      WHERE sc.id = ?`,
      [solicitacao_id]
    );

    return successResponse(res, solicitacao, 'Solicitação de compras criada com sucesso', STATUS_CODES.CREATED);
  });

  /**
   * Atualizar solicitação de compras
   */
  static atualizarSolicitacao = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      filial_id,
      data_entrega_cd,
      motivo,
      observacoes,
      itens
    } = req.body;

    // Verificar se solicitação existe
    const [solicitacao] = await executeQuery(
      'SELECT * FROM solicitacoes_compras WHERE id = ?',
      [id]
    );

    if (!solicitacao) {
      return notFoundResponse(res, 'Solicitação de compras não encontrada');
    }

    // Verificar se pode editar (apenas status = 'em_digitacao')
    if (solicitacao.status !== 'em_digitacao') {
      return errorResponse(res, `Esta solicitação não pode ser editada. Status: ${solicitacao.status}. Apenas solicitações 'em_digitacao' podem ser alteradas.`, STATUS_CODES.BAD_REQUEST);
    }

    // Validar campos obrigatórios
    if (!filial_id || !data_entrega_cd || !motivo) {
      return errorResponse(res, 'Campos obrigatórios: filial_id, data_entrega_cd, motivo', STATUS_CODES.BAD_REQUEST);
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return errorResponse(res, 'A solicitação deve ter pelo menos um item', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se filial existe
    const [filial] = await executeQuery(
      'SELECT filial FROM filiais WHERE id = ?',
      [filial_id]
    );

    if (!filial) {
      return errorResponse(res, 'Filial não encontrada', STATUS_CODES.NOT_FOUND);
    }

    // Buscar semana de abastecimento
    const semana_abastecimento = await this.buscarSemanaAbastecimento(data_entrega_cd);

    // Atualizar solicitação
    await executeQuery(
      `UPDATE solicitacoes_compras SET
        descricao = ?,
        unidade = ?,
        data_necessidade = ?,
        data_entrega_cd = ?,
        semana_abastecimento = ?,
        observacoes = ?,
        motivo = ?,
        filial_id = ?,
        atualizado_em = NOW()
      WHERE id = ?`,
      [
        motivo,
        filial.nome,
        data_entrega_cd,
        data_entrega_cd,
        semana_abastecimento,
        observacoes || null,
        motivo,
        filial_id,
        id
      ]
    );

    // Deletar itens antigos
    await executeQuery(
      'DELETE FROM solicitacao_compras_itens WHERE solicitacao_id = ?',
      [id]
    );

    // Inserir novos itens
    for (const item of itens) {
      const { produto_id, quantidade, unidade_medida_id, observacao } = item;

      if (!produto_id || !quantidade || !unidade_medida_id) {
        return errorResponse(res, 'Todos os itens devem ter produto_id, quantidade e unidade_medida_id', STATUS_CODES.BAD_REQUEST);
      }

      // Buscar dados do produto
      const [produto] = await executeQuery(
        'SELECT codigo, nome FROM produto_generico WHERE id = ?',
        [produto_id]
      );

      if (!produto) {
        return errorResponse(res, `Produto com ID ${produto_id} não encontrado`, STATUS_CODES.NOT_FOUND);
      }

      // Buscar símbolo da unidade
      const [unidade] = await executeQuery(
        'SELECT sigla FROM unidades_medida WHERE id = ?',
        [unidade_medida_id]
      );

      await executeQuery(
        `INSERT INTO solicitacao_compras_itens (
          solicitacao_id,
          produto_id,
          codigo_produto,
          nome_produto,
          unidade_medida_id,
          unidade_medida,
          quantidade,
          observacao,
          criado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          id,
          produto_id,
          produto.codigo,
          produto.nome,
          unidade_medida_id,
          unidade ? unidade.sigla : null,
          quantidade,
          observacao || null
        ]
      );
    }

    // Buscar solicitação atualizada
    const [solicitacaoAtualizada] = await executeQuery(
      `SELECT 
        sc.*,
        f.filial as filial_nome,
        f.codigo_filial as filial_codigo
      FROM solicitacoes_compras sc
      LEFT JOIN filiais f ON sc.filial_id = f.id
      WHERE sc.id = ?`,
      [id]
    );

    return successResponse(res, solicitacaoAtualizada, 'Solicitação de compras atualizada com sucesso');
  });

  /**
   * Excluir solicitação de compras
   */
  static excluirSolicitacao = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se solicitação existe
    const [solicitacao] = await executeQuery(
      'SELECT status FROM solicitacoes_compras WHERE id = ?',
      [id]
    );

    if (!solicitacao) {
      return notFoundResponse(res, 'Solicitação de compras não encontrada');
    }

    // Verificar se pode excluir (apenas status = 'em_digitacao')
    if (solicitacao.status !== 'em_digitacao') {
      return errorResponse(res, `Não é possível excluir. Esta solicitação está vinculada a pedidos de compras. Status: ${solicitacao.status}`, STATUS_CODES.BAD_REQUEST);
    }

    // Deletar itens (CASCADE faz isso automaticamente, mas vamos garantir)
    await executeQuery(
      'DELETE FROM solicitacao_compras_itens WHERE solicitacao_id = ?',
      [id]
    );

    // Deletar solicitação
    await executeQuery(
      'DELETE FROM solicitacoes_compras WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Solicitação de compras excluída com sucesso');
  });
}

module.exports = SolicitacoesComprasCRUDController;

