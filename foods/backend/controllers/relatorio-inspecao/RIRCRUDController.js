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
const RIRProdutosController = require('./RIRProdutosController');

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
      produtos,
      checklist_json,
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
    const produtosArray = produtos && Array.isArray(produtos) ? produtos : [];
    const resultado_geral = RIRProdutosController.calcularStatusGeral(produtosArray);

    // Calcular status: DISPONIVEL se não tiver nota_fiscal_id, FINALIZADO se tiver
    const status = nota_fiscal_id ? 'FINALIZADO' : 'DISPONIVEL';

    // Extrair dados do checklist (pegar o primeiro item do array, se houver)
    const checklist = checklist_json && Array.isArray(checklist_json) && checklist_json.length > 0 
      ? checklist_json[0] 
      : null;
    
    const tipo_transporte = checklist?.tipo_transporte || null;
    const isento_material = checklist?.isento_material || null;
    const condicoes_caminhao = checklist?.condicoes_caminhao || null;
    const acondicionamento = checklist?.acondicionamento || null;
    const condicoes_embalagem = checklist?.condicoes_embalagem || null;

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
        ocorrencias,
        recebedor,
        visto_responsavel,
        resultado_geral,
        status,
        tipo_transporte,
        isento_material,
        condicoes_caminhao,
        acondicionamento,
        condicoes_embalagem,
        usuario_cadastro_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data_inspecao,
        hora_inspecao,
        numero_nota_fiscal,
        fornecedor,
        numero_pedido || null,
        cnpj_fornecedor || null,
        nota_fiscal_id || null,
        ocorrencias || null,
        recebedor || null,
        visto_responsavel || null,
        resultado_geral,
        status,
        tipo_transporte,
        isento_material,
        condicoes_caminhao,
        acondicionamento,
        condicoes_embalagem,
        usuario_id
      ]
    );

    const relatorioId = result.insertId;

    // Inserir produtos na tabela relacionada
    if (produtosArray.length > 0) {
      const produtosResult = await RIRProdutosController.inserirProdutos(relatorioId, produtosArray);
      if (!produtosResult.success) {
        // Rollback: remover relatório se falhar ao inserir produtos
        await executeQuery('DELETE FROM relatorio_inspecao WHERE id = ?', [relatorioId]);
        return errorResponse(res, produtosResult.error, STATUS_CODES.BAD_REQUEST);
      }
    }

    // Buscar relatório criado com produtos
    const rir = await executeQuery(
      `SELECT 
        ri.*,
        u.nome as usuario_nome
       FROM relatorio_inspecao ri
       LEFT JOIN usuarios u ON ri.usuario_cadastro_id = u.id
       WHERE ri.id = ?`,
      [relatorioId]
    );

    // Buscar produtos
    const produtosData = await RIRProdutosController.buscarProdutos(relatorioId);
    rir[0].produtos = produtosData;

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
      produtos,
      checklist_json,
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
    const produtosArray = produtos && Array.isArray(produtos) ? produtos : [];
    const resultado_geral = RIRProdutosController.calcularStatusGeral(produtosArray);

    // Calcular status: DISPONIVEL se não tiver nota_fiscal_id, FINALIZADO se tiver
    const status = nota_fiscal_id ? 'FINALIZADO' : 'DISPONIVEL';

    // Extrair dados do checklist (pegar o primeiro item do array, se houver)
    const checklist = checklist_json && Array.isArray(checklist_json) && checklist_json.length > 0 
      ? checklist_json[0] 
      : null;
    
    const tipo_transporte = checklist?.tipo_transporte || null;
    const isento_material = checklist?.isento_material || null;
    const condicoes_caminhao = checklist?.condicoes_caminhao || null;
    const acondicionamento = checklist?.acondicionamento || null;
    const condicoes_embalagem = checklist?.condicoes_embalagem || null;

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
        ocorrencias = ?,
        recebedor = ?,
        visto_responsavel = ?,
        resultado_geral = ?,
        status = ?,
        tipo_transporte = ?,
        isento_material = ?,
        condicoes_caminhao = ?,
        acondicionamento = ?,
        condicoes_embalagem = ?,
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
        ocorrencias || null,
        recebedor || null,
        visto_responsavel || null,
        resultado_geral,
        status,
        tipo_transporte,
        isento_material,
        condicoes_caminhao,
        acondicionamento,
        condicoes_embalagem,
        usuario_id,
        id
      ]
    );

    // Atualizar produtos (remove antigos e insere novos)
    const produtosResult = await RIRProdutosController.atualizarProdutos(id, produtosArray);
    if (!produtosResult.success) {
      return errorResponse(res, produtosResult.error, STATUS_CODES.BAD_REQUEST);
    }

    // Buscar relatório atualizado com produtos
    const rir = await executeQuery(
      `SELECT 
        ri.*,
        u.nome as usuario_nome
       FROM relatorio_inspecao ri
       LEFT JOIN usuarios u ON ri.usuario_cadastro_id = u.id
       WHERE ri.id = ?`,
      [id]
    );

    // Buscar produtos
    const produtosData = await RIRProdutosController.buscarProdutos(id);
    rir[0].produtos = produtosData;

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

