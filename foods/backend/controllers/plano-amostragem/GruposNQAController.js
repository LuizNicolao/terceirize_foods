/**
 * Controller de Vinculação Grupos ↔ NQA
 * Responsável por vincular/desvincular grupos de produtos aos NQAs
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class GruposNQAController {
  
  /**
   * Vincular grupo a NQA
   */
  static vincularGrupo = asyncHandler(async (req, res) => {
    const { grupo_id, nqa_id, observacoes } = req.body;
    const usuario_id = req.user.id;

    // Validar parâmetros
    if (!grupo_id || !nqa_id) {
      return errorResponse(res, 'grupo_id e nqa_id são obrigatórios', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se grupo existe
    const grupo = await executeQuery(
      'SELECT id, nome, status FROM grupos WHERE id = ?',
      [grupo_id]
    );

    if (grupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    if (grupo[0].status !== 'ativo') {
      return errorResponse(res, 'Grupo deve estar ativo para ser vinculado', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se NQA existe
    const nqa = await executeQuery(
      'SELECT id, codigo, ativo FROM nqa WHERE id = ?',
      [nqa_id]
    );

    if (nqa.length === 0) {
      return notFoundResponse(res, 'NQA não encontrado');
    }

    if (nqa[0].ativo !== 1) {
      return errorResponse(res, 'NQA deve estar ativo para ser vinculado', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se já existe vinculação (independente do status ativo)
    const existingVinculo = await executeQuery(
      'SELECT id, nqa_id, ativo FROM grupos_nqa WHERE grupo_id = ?',
      [grupo_id]
    );

    if (existingVinculo.length > 0) {
      // Se já existe (ativo ou inativo), reativar e atualizar para o novo NQA
      await executeQuery(
        'UPDATE grupos_nqa SET nqa_id = ?, observacoes = ?, ativo = 1, atualizado_em = NOW(), usuario_cadastro_id = ? WHERE grupo_id = ?',
        [
          nqa_id, 
          observacoes && observacoes.trim() ? observacoes.trim() : null,
          usuario_id,
          grupo_id
        ]
      );

      const vinculoAtualizado = await executeQuery(
        `SELECT 
          gn.id,
          gn.grupo_id,
          gn.nqa_id,
          gn.observacoes,
          gn.ativo,
          gn.criado_em,
          gn.atualizado_em,
          g.nome as grupo_nome,
          n.codigo as nqa_codigo,
          n.nome as nqa_nome
         FROM grupos_nqa gn
         INNER JOIN grupos g ON gn.grupo_id = g.id
         INNER JOIN nqa n ON gn.nqa_id = n.id
         WHERE gn.grupo_id = ? AND gn.ativo = 1`,
        [grupo_id]
      );

      return successResponse(res, vinculoAtualizado[0], `Grupo ${existingVinculo[0].ativo === 1 ? 'atualizado' : 'reativado'}: vinculado ao NQA ${nqa[0].codigo}`, STATUS_CODES.OK);
    }

    // Criar nova vinculação
    const result = await executeQuery(
      'INSERT INTO grupos_nqa (grupo_id, nqa_id, observacoes, ativo, usuario_cadastro_id, criado_em) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        grupo_id,
        nqa_id,
        observacoes && observacoes.trim() ? observacoes.trim() : null,
        1,
        usuario_id
      ]
    );

    // Buscar vinculação criada
    const vinculo = await executeQuery(
      `SELECT 
        gn.id,
        gn.grupo_id,
        gn.nqa_id,
        gn.observacoes,
        gn.ativo,
        gn.criado_em,
        gn.atualizado_em,
        g.nome as grupo_nome,
        n.codigo as nqa_codigo,
        n.nome as nqa_nome
       FROM grupos_nqa gn
       INNER JOIN grupos g ON gn.grupo_id = g.id
       INNER JOIN nqa n ON gn.nqa_id = n.id
       WHERE gn.id = ?`,
      [result.insertId]
    );

    return successResponse(res, vinculo[0], 'Grupo vinculado ao NQA com sucesso', STATUS_CODES.CREATED);
  });

  /**
   * Desvincular grupo de NQA
   */
  static desvincularGrupo = asyncHandler(async (req, res) => {
    const { grupo_id } = req.params;

    // Verificar se vinculação existe
    const vinculo = await executeQuery(
      'SELECT id FROM grupos_nqa WHERE grupo_id = ? AND ativo = 1',
      [grupo_id]
    );

    if (vinculo.length === 0) {
      return notFoundResponse(res, 'Vinculação não encontrada');
    }

    // Desvincular (soft delete)
    await executeQuery(
      'UPDATE grupos_nqa SET ativo = 0, atualizado_em = NOW() WHERE grupo_id = ?',
      [grupo_id]
    );

    return successResponse(res, null, 'Grupo desvinculado do NQA com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Listar grupos vinculados a um NQA
   */
  static listarGruposPorNQA = asyncHandler(async (req, res) => {
    const { nqa_id } = req.params;

    const grupos = await executeQuery(
      `SELECT 
        gn.id,
        gn.grupo_id,
        gn.nqa_id,
        gn.observacoes,
        gn.ativo,
        gn.criado_em,
        gn.atualizado_em,
        g.nome as grupo_nome,
        g.codigo as grupo_codigo,
        n.codigo as nqa_codigo,
        n.nome as nqa_nome
       FROM grupos_nqa gn
       INNER JOIN grupos g ON gn.grupo_id = g.id
       INNER JOIN nqa n ON gn.nqa_id = n.id
       WHERE gn.nqa_id = ? AND gn.ativo = 1 AND g.status = 'ativo'
       ORDER BY g.nome ASC`,
      [nqa_id]
    );

    return successResponse(res, grupos, 'Grupos vinculados listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Listar todos os grupos vinculados (com seus NQAs)
   */
  static listarTodosVinculos = asyncHandler(async (req, res) => {
    const grupos = await executeQuery(
      `SELECT 
        gn.id,
        gn.grupo_id,
        gn.nqa_id,
        gn.observacoes,
        gn.ativo,
        gn.criado_em,
        gn.atualizado_em,
        g.nome as grupo_nome,
        g.codigo as grupo_codigo,
        n.codigo as nqa_codigo,
        n.nome as nqa_nome
       FROM grupos_nqa gn
       INNER JOIN grupos g ON gn.grupo_id = g.id
       INNER JOIN nqa n ON gn.nqa_id = n.id
       WHERE gn.ativo = 1 AND g.status = 'ativo'
       ORDER BY g.nome ASC`
    );

    return successResponse(res, grupos, 'Grupos vinculados listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar NQA vinculado a um grupo
   */
  static buscarNQAPorGrupo = asyncHandler(async (req, res) => {
    const { grupo_id } = req.params;

    const vinculo = await executeQuery(
      `SELECT 
        gn.id,
        gn.grupo_id,
        gn.nqa_id,
        gn.observacoes,
        gn.ativo,
        gn.criado_em,
        gn.atualizado_em,
        g.nome as grupo_nome,
        g.codigo as grupo_codigo,
        n.codigo as nqa_codigo,
        n.nome as nqa_nome,
        n.nivel_inspecao
       FROM grupos_nqa gn
       INNER JOIN grupos g ON gn.grupo_id = g.id
       INNER JOIN nqa n ON gn.nqa_id = n.id
       WHERE gn.grupo_id = ? AND gn.ativo = 1`,
      [grupo_id]
    );

    if (vinculo.length === 0) {
      return notFoundResponse(res, 'Grupo não possui NQA vinculado');
    }

    return successResponse(res, vinculo[0], 'NQA vinculado encontrado com sucesso', STATUS_CODES.OK);
  });
}

module.exports = GruposNQAController;

