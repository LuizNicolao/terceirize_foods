/**
 * Controller CRUD de NQA
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

class NQACRUDController {
  
  /**
   * Criar novo NQA
   */
  static criarNQA = asyncHandler(async (req, res) => {
    const { nome, codigo, descricao, nivel_inspecao, ativo } = req.body;
    const usuario_id = req.user.id;

    // Verificar se código já existe
    const existingNQA = await executeQuery(
      'SELECT id FROM nqa WHERE codigo = ?',
      [codigo]
    );

    if (existingNQA.length > 0) {
      return conflictResponse(res, 'Código do NQA já existe');
    }

    // Inserir NQA
    const result = await executeQuery(
      'INSERT INTO nqa (nome, codigo, descricao, nivel_inspecao, ativo, usuario_cadastro_id, criado_em) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [
        nome && nome.trim() ? nome.trim() : null, 
        codigo && codigo.trim() ? codigo.trim() : null,
        descricao && descricao.trim() ? descricao.trim() : null,
        nivel_inspecao || 'II',
        ativo === 1 || ativo === '1' ? 1 : 0,
        usuario_id
      ]
    );

    const novoNQAId = result.insertId;

    // Buscar NQA criado
    const nqas = await executeQuery(
      `SELECT 
        n.id, 
        n.nome, 
        n.codigo,
        n.descricao,
        n.nivel_inspecao,
        n.ativo,
        n.criado_em,
        n.atualizado_em,
        COUNT(DISTINCT ta.id) as faixas_count,
        COUNT(DISTINCT gn.id) as grupos_count
       FROM nqa n
       LEFT JOIN tabela_amostragem ta ON n.id = ta.nqa_id AND ta.ativo = 1
       LEFT JOIN grupos_nqa gn ON n.id = gn.nqa_id AND gn.ativo = 1
       WHERE n.id = ?
       GROUP BY n.id, n.nome, n.codigo, n.descricao, n.nivel_inspecao, n.ativo, n.criado_em, n.atualizado_em`,
      [novoNQAId]
    );

    const nqa = nqas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(nqa);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, nqa.id);

    return successResponse(res, data, 'NQA criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar NQA
   */
  static atualizarNQA = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const usuario_id = req.user.id;

    // Verificar se NQA existe
    const existingNQA = await executeQuery(
      'SELECT id, codigo FROM nqa WHERE id = ?',
      [id]
    );

    if (existingNQA.length === 0) {
      return notFoundResponse(res, 'NQA não encontrado');
    }

    // Verificar se código já existe (se estiver sendo alterado)
    if (updateData.codigo && updateData.codigo !== existingNQA[0].codigo) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM nqa WHERE codigo = ? AND id != ?',
        [updateData.codigo, id]
      );

      if (codigoCheck.length > 0) {
        return conflictResponse(res, 'Código do NQA já existe');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = ['nome', 'codigo', 'descricao', 'nivel_inspecao', 'ativo'];

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
      `UPDATE nqa SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar NQA atualizado
    const nqas = await executeQuery(
      `SELECT 
        n.id, 
        n.nome, 
        n.codigo,
        n.descricao,
        n.nivel_inspecao,
        n.ativo,
        n.criado_em,
        n.atualizado_em,
        COUNT(DISTINCT ta.id) as faixas_count,
        COUNT(DISTINCT gn.id) as grupos_count
      FROM nqa n
      LEFT JOIN tabela_amostragem ta ON n.id = ta.nqa_id AND ta.ativo = 1
      LEFT JOIN grupos_nqa gn ON n.id = gn.nqa_id AND gn.ativo = 1
      WHERE n.id = ?
      GROUP BY n.id, n.nome, n.codigo, n.descricao, n.nivel_inspecao, n.ativo, n.criado_em, n.atualizado_em`,
      [id]
    );

    const nqa = nqas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(nqa);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, nqa.id);

    return successResponse(res, data, 'NQA atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir NQA (soft delete)
   */
  static excluirNQA = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se NQA existe
    const existingNQA = await executeQuery(
      'SELECT id FROM nqa WHERE id = ?',
      [id]
    );

    if (existingNQA.length === 0) {
      return notFoundResponse(res, 'NQA não encontrado');
    }

    // Verificar se NQA possui faixas ativas
    const faixas = await executeQuery(
      'SELECT id FROM tabela_amostragem WHERE nqa_id = ? AND ativo = 1',
      [id]
    );

    if (faixas.length > 0) {
      return errorResponse(res, `NQA não pode ser excluído pois possui ${faixas.length} faixa(s) de amostragem ativa(s) vinculada(s)`, STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se NQA possui grupos vinculados
    const grupos = await executeQuery(
      'SELECT id FROM grupos_nqa WHERE nqa_id = ? AND ativo = 1',
      [id]
    );

    if (grupos.length > 0) {
      return errorResponse(res, `NQA não pode ser excluído pois possui ${grupos.length} grupo(s) vinculado(s)`, STATUS_CODES.BAD_REQUEST);
    }

    // Excluir NQA (soft delete - alterar ativo para 0)
    await executeQuery(
      'UPDATE nqa SET ativo = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'NQA excluído com sucesso', STATUS_CODES.NO_CONTENT);
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

module.exports = NQACRUDController;

