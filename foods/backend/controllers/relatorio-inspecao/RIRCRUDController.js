/**
 * Controller de CRUD de Relatórios de Inspeção de Recebimento (RIR)
 * Responsável por criar, atualizar e excluir relatórios
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class RIRCRUDController {
  
  /**
   * Criar novo relatório de inspeção
   */
  static criarRIR = asyncHandler(async (req, res) => {
    const {
      data_inspecao,
      hora_inspecao,
      numero_nota_fiscal,
      fornecedor,
      numero_pedido,
      cnpj_fornecedor,
      nota_fiscal_id,
      checklist_json,
      produtos_json,
      ocorrencias,
      recebedor,
      visto_responsavel
    } = req.body;

    const usuario_id = req.user.id;

    // Validar campos obrigatórios
    if (!data_inspecao || !hora_inspecao || !numero_nota_fiscal || !fornecedor) {
      return errorResponse(res, 'Campos obrigatórios: data_inspecao, hora_inspecao, numero_nota_fiscal, fornecedor', STATUS_CODES.BAD_REQUEST);
    }

    // Calcular status geral baseado nos produtos
    let status_geral = 'APROVADO';
    if (produtos_json && Array.isArray(produtos_json)) {
      const totalAprovados = produtos_json.filter(p => p.resultado_final === 'Aprovado').length;
      const totalReprovados = produtos_json.filter(p => p.resultado_final === 'Reprovado').length;
      
      if (totalReprovados > 0 && totalAprovados > 0) {
        status_geral = 'PARCIAL';
      } else if (totalReprovados > 0) {
        status_geral = 'REPROVADO';
      }
    }

    // Preparar JSONs
    const checklistJson = checklist_json ? JSON.stringify(checklist_json) : null;
    const produtosJson = produtos_json ? JSON.stringify(produtos_json) : null;

    // Inserir relatório
    const result = await executeQuery(
      `INSERT INTO relatorio_inspecao (
        data_inspecao,
        hora_inspecao,
        numero_nota_fiscal,
        fornecedor,
        numero_pedido,
        cnpj_fornecedor,
        nota_fiscal_id,
        checklist_json,
        produtos_json,
        ocorrencias,
        recebedor,
        visto_responsavel,
        status_geral,
        usuario_cadastro_id,
        criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data_inspecao,
        hora_inspecao,
        numero_nota_fiscal,
        fornecedor,
        numero_pedido || null,
        cnpj_fornecedor || null,
        nota_fiscal_id || null,
        checklistJson,
        produtosJson,
        ocorrencias || null,
        recebedor || null,
        visto_responsavel || null,
        status_geral,
        usuario_id
      ]
    );

    // Buscar relatório criado
    const rir = await executeQuery(
      `SELECT 
        ri.*,
        u.nome as usuario_nome
       FROM relatorio_inspecao ri
       LEFT JOIN usuarios u ON ri.usuario_cadastro_id = u.id
       WHERE ri.id = ?`,
      [result.insertId]
    );

    // Decodificar JSONs
    if (rir[0].checklist_json && typeof rir[0].checklist_json === 'string') {
      try {
        rir[0].checklist_json = JSON.parse(rir[0].checklist_json);
      } catch (e) {
        rir[0].checklist_json = [];
      }
    }

    if (rir[0].produtos_json && typeof rir[0].produtos_json === 'string') {
      try {
        rir[0].produtos_json = JSON.parse(rir[0].produtos_json);
      } catch (e) {
        rir[0].produtos_json = [];
      }
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(rir[0]);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, rir[0].id);

    return successResponse(res, data, 'Relatório de inspeção criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar relatório de inspeção
   */
  static atualizarRIR = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      data_inspecao,
      hora_inspecao,
      numero_nota_fiscal,
      fornecedor,
      numero_pedido,
      cnpj_fornecedor,
      nota_fiscal_id,
      checklist_json,
      produtos_json,
      ocorrencias,
      recebedor,
      visto_responsavel
    } = req.body;

    const usuario_id = req.user.id;

    // Verificar se relatório existe
    const existingRIR = await executeQuery(
      'SELECT id FROM relatorio_inspecao WHERE id = ?',
      [id]
    );

    if (existingRIR.length === 0) {
      return notFoundResponse(res, 'Relatório de inspeção não encontrado');
    }

    // Calcular status geral baseado nos produtos
    let status_geral = 'APROVADO';
    if (produtos_json && Array.isArray(produtos_json)) {
      const totalAprovados = produtos_json.filter(p => p.resultado_final === 'Aprovado').length;
      const totalReprovados = produtos_json.filter(p => p.resultado_final === 'Reprovado').length;
      
      if (totalReprovados > 0 && totalAprovados > 0) {
        status_geral = 'PARCIAL';
      } else if (totalReprovados > 0) {
        status_geral = 'REPROVADO';
      }
    }

    // Preparar JSONs
    const checklistJson = checklist_json ? JSON.stringify(checklist_json) : null;
    const produtosJson = produtos_json ? JSON.stringify(produtos_json) : null;

    // Atualizar relatório
    await executeQuery(
      `UPDATE relatorio_inspecao SET
        data_inspecao = ?,
        hora_inspecao = ?,
        numero_nota_fiscal = ?,
        fornecedor = ?,
        numero_pedido = ?,
        cnpj_fornecedor = ?,
        nota_fiscal_id = ?,
        checklist_json = ?,
        produtos_json = ?,
        ocorrencias = ?,
        recebedor = ?,
        visto_responsavel = ?,
        status_geral = ?,
        usuario_atualizacao_id = ?,
        atualizado_em = NOW()
      WHERE id = ?`,
      [
        data_inspecao,
        hora_inspecao,
        numero_nota_fiscal,
        fornecedor,
        numero_pedido || null,
        cnpj_fornecedor || null,
        nota_fiscal_id || null,
        checklistJson,
        produtosJson,
        ocorrencias || null,
        recebedor || null,
        visto_responsavel || null,
        status_geral,
        usuario_id,
        id
      ]
    );

    // Buscar relatório atualizado
    const rir = await executeQuery(
      `SELECT 
        ri.*,
        u.nome as usuario_nome
       FROM relatorio_inspecao ri
       LEFT JOIN usuarios u ON ri.usuario_cadastro_id = u.id
       WHERE ri.id = ?`,
      [id]
    );

    // Decodificar JSONs
    if (rir[0].checklist_json && typeof rir[0].checklist_json === 'string') {
      try {
        rir[0].checklist_json = JSON.parse(rir[0].checklist_json);
      } catch (e) {
        rir[0].checklist_json = [];
      }
    }

    if (rir[0].produtos_json && typeof rir[0].produtos_json === 'string') {
      try {
        rir[0].produtos_json = JSON.parse(rir[0].produtos_json);
      } catch (e) {
        rir[0].produtos_json = [];
      }
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(rir[0]);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, rir[0].id);

    return successResponse(res, data, 'Relatório de inspeção atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir relatório de inspeção (hard delete)
   */
  static excluirRIR = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se relatório existe
    const existingRIR = await executeQuery(
      'SELECT id FROM relatorio_inspecao WHERE id = ?',
      [id]
    );

    if (existingRIR.length === 0) {
      return notFoundResponse(res, 'Relatório de inspeção não encontrado');
    }

    // Excluir relatório (hard delete)
    await executeQuery(
      'DELETE FROM relatorio_inspecao WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Relatório de inspeção excluído com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões baseada no usuário
    // Por enquanto, retorna permissões básicas
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = RIRCRUDController;

