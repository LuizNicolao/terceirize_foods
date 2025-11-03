/**
 * Controller CRUD de Tabela de Amostragem
 * Responsável por operações de Create, Update e Delete
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class TabelaAmostragemCRUDController {
  
  /**
   * Criar nova faixa de amostragem
   */
  static criarFaixa = asyncHandler(async (req, res) => {
    const { 
      nqa_id, 
      faixa_inicial, 
      faixa_final, 
      tamanho_amostra, 
      ac, 
      re,
      meses_validade,
      dias_validade,
      dias_70,
      observacoes,
      ativo
    } = req.body;
    const usuario_id = req.user.id;

    // Validar faixas
    if (faixa_inicial <= 0 || faixa_final <= 0) {
      return errorResponse(res, 'Faixas devem ser números positivos', STATUS_CODES.BAD_REQUEST);
    }

    if (faixa_final < faixa_inicial) {
      return errorResponse(res, 'Faixa final deve ser maior ou igual à faixa inicial', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se NQA existe
    const nqa = await executeQuery(
      'SELECT id FROM nqa WHERE id = ? AND ativo = 1',
      [nqa_id]
    );

    if (nqa.length === 0) {
      return notFoundResponse(res, 'NQA não encontrado ou inativo');
    }

    // Verificar sobreposição de faixas (mesmo NQA)
    const sobreposicao = await executeQuery(
      `SELECT id FROM tabela_amostragem 
       WHERE nqa_id = ? 
         AND ativo = 1
         AND (
           (faixa_inicial <= ? AND faixa_final >= ?) 
           OR (faixa_inicial <= ? AND faixa_final >= ?)
           OR (? <= faixa_inicial AND ? >= faixa_final)
         )`,
      [nqa_id, faixa_inicial, faixa_inicial, faixa_final, faixa_final, faixa_inicial, faixa_final]
    );

    if (sobreposicao.length > 0) {
      return conflictResponse(res, 'Já existe uma faixa de amostragem que se sobrepõe a esta faixa para o mesmo NQA');
    }

    // Inserir faixa
    const result = await executeQuery(
      `INSERT INTO tabela_amostragem 
       (nqa_id, faixa_inicial, faixa_final, tamanho_amostra, ac, re, meses_validade, dias_validade, dias_70, observacoes, ativo, usuario_cadastro_id, criado_em) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nqa_id,
        faixa_inicial,
        faixa_final,
        tamanho_amostra,
        ac,
        re,
        meses_validade || null,
        dias_validade || null,
        dias_70 || null,
        observacoes && observacoes.trim() ? observacoes.trim() : null,
        ativo === 1 || ativo === '1' ? 1 : 0,
        usuario_id
      ]
    );

    const novaFaixaId = result.insertId;

    // Buscar faixa criada
    const faixas = await executeQuery(
      `SELECT 
        ta.id,
        ta.nqa_id,
        ta.faixa_inicial,
        ta.faixa_final,
        ta.tamanho_amostra,
        ta.ac,
        ta.re,
        ta.meses_validade,
        ta.dias_validade,
        ta.dias_70,
        ta.observacoes,
        ta.ativo,
        ta.criado_em,
        ta.atualizado_em,
        n.codigo as nqa_codigo,
        n.nome as nqa_nome
       FROM tabela_amostragem ta
       INNER JOIN nqa n ON ta.nqa_id = n.id
       WHERE ta.id = ?`,
      [novaFaixaId]
    );

    const faixa = faixas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(faixa);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, faixa.id);

    return successResponse(res, data, 'Faixa de amostragem criada com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar faixa de amostragem
   */
  static atualizarFaixa = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const usuario_id = req.user.id;

    // Verificar se faixa existe
    const existingFaixa = await executeQuery(
      'SELECT id, nqa_id, faixa_inicial, faixa_final FROM tabela_amostragem WHERE id = ?',
      [id]
    );

    if (existingFaixa.length === 0) {
      return notFoundResponse(res, 'Faixa de amostragem não encontrada');
    }

    const faixaAtual = existingFaixa[0];
    const nqa_id = updateData.nqa_id || faixaAtual.nqa_id;
    const faixa_inicial = updateData.faixa_inicial || faixaAtual.faixa_inicial;
    const faixa_final = updateData.faixa_final || faixaAtual.faixa_final;

    // Validar faixas
    if (faixa_inicial <= 0 || faixa_final <= 0) {
      return errorResponse(res, 'Faixas devem ser números positivos', STATUS_CODES.BAD_REQUEST);
    }

    if (faixa_final < faixa_inicial) {
      return errorResponse(res, 'Faixa final deve ser maior ou igual à faixa inicial', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar sobreposição de faixas (excluindo o próprio registro)
    if (updateData.faixa_inicial || updateData.faixa_final) {
      const sobreposicao = await executeQuery(
        `SELECT id FROM tabela_amostragem 
         WHERE id != ? 
           AND nqa_id = ? 
           AND ativo = 1
           AND (
             (faixa_inicial <= ? AND faixa_final >= ?) 
             OR (faixa_inicial <= ? AND faixa_final >= ?)
             OR (? <= faixa_inicial AND ? >= faixa_final)
           )`,
        [id, nqa_id, faixa_inicial, faixa_inicial, faixa_final, faixa_final, faixa_inicial, faixa_final]
      );

      if (sobreposicao.length > 0) {
        return conflictResponse(res, 'Já existe uma faixa de amostragem que se sobrepõe a esta faixa para o mesmo NQA');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = [
      'nqa_id', 'faixa_inicial', 'faixa_final', 'tamanho_amostra', 
      'ac', 're', 'meses_validade', 'dias_validade', 'dias_70', 
      'observacoes', 'ativo'
    ];

    Object.keys(updateData).forEach(key => {
      if (camposValidos.includes(key) && updateData[key] !== undefined) {
        let value = updateData[key];
        
        // Tratar valores vazios ou undefined
        if (value === '' || value === null || value === undefined) {
          value = null;
        } else if (typeof value === 'string') {
          value = value.trim();
          if (value === '') {
            value = null;
          }
        }
        
        // Tratamento específico para o campo ativo
        if (key === 'ativo') {
          value = value === 1 || value === '1' ? 1 : 0;
        }
        
        updateFields.push(`${key} = ?`);
        updateParams.push(value);
      }
    });

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('usuario_atualizacao_id = ?', 'atualizado_em = NOW()');
    updateParams.push(usuario_id, id);

    // Executar atualização
    await executeQuery(
      `UPDATE tabela_amostragem SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar faixa atualizada
    const faixas = await executeQuery(
      `SELECT 
        ta.id,
        ta.nqa_id,
        ta.faixa_inicial,
        ta.faixa_final,
        ta.tamanho_amostra,
        ta.ac,
        ta.re,
        ta.meses_validade,
        ta.dias_validade,
        ta.dias_70,
        ta.observacoes,
        ta.ativo,
        ta.criado_em,
        ta.atualizado_em,
        n.codigo as nqa_codigo,
        n.nome as nqa_nome
      FROM tabela_amostragem ta
      INNER JOIN nqa n ON ta.nqa_id = n.id
      WHERE ta.id = ?`,
      [id]
    );

    const faixa = faixas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(faixa);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, faixa.id);

    return successResponse(res, data, 'Faixa de amostragem atualizada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir faixa de amostragem (soft delete)
   */
  static excluirFaixa = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se faixa existe
    const existingFaixa = await executeQuery(
      'SELECT id FROM tabela_amostragem WHERE id = ?',
      [id]
    );

    if (existingFaixa.length === 0) {
      return notFoundResponse(res, 'Faixa de amostragem não encontrada');
    }

    // Excluir faixa (soft delete - alterar ativo para 0)
    await executeQuery(
      'UPDATE tabela_amostragem SET ativo = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Faixa de amostragem excluída com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Criar NQA automaticamente se não existir (usado ao cadastrar faixa)
   */
  static criarNQAAutomatico = asyncHandler(async (req, res) => {
    const { codigo } = req.body;
    const usuario_id = req.user.id;

    if (!codigo || !codigo.trim()) {
      return errorResponse(res, 'Código do NQA é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se NQA já existe
    const existingNQA = await executeQuery(
      'SELECT id FROM nqa WHERE codigo = ?',
      [codigo.trim()]
    );

    if (existingNQA.length > 0) {
      const nqa = await executeQuery(
        'SELECT id, codigo, nome, nivel_inspecao, ativo FROM nqa WHERE codigo = ?',
        [codigo.trim()]
      );
      return successResponse(res, nqa[0], 'NQA já existe', STATUS_CODES.OK);
    }

    // Criar NQA automaticamente
    const nome = `NQA ${codigo.trim()}`;
    const result = await executeQuery(
      'INSERT INTO nqa (codigo, nome, nivel_inspecao, ativo, usuario_cadastro_id, criado_em) VALUES (?, ?, ?, ?, ?, NOW())',
      [codigo.trim(), nome, 'II', 1, usuario_id]
    );

    const novoNQA = await executeQuery(
      'SELECT id, codigo, nome, nivel_inspecao, ativo FROM nqa WHERE id = ?',
      [result.insertId]
    );

    return successResponse(res, novoNQA[0], 'NQA criado automaticamente com sucesso', STATUS_CODES.CREATED);
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

module.exports = TabelaAmostragemCRUDController;

