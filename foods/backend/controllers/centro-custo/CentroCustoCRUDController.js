/**
 * Controller CRUD de Centro de Custo
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

class CentroCustoCRUDController {
  
  /**
   * Criar novo centro de custo
   */
  static criarCentroCusto = asyncHandler(async (req, res) => {
    const { codigo, nome, descricao, filial_id, status = 1 } = req.body;
    const userId = req.user?.id || null;

    // Verificar se código já existe
    const existingCodigo = await executeQuery(
      'SELECT id FROM centro_custo WHERE codigo = ?',
      [codigo]
    );

    if (existingCodigo.length > 0) {
      return conflictResponse(res, 'Código do centro de custo já existe');
    }

    // Verificar se filial existe
    const filial = await executeQuery(
      'SELECT id FROM filiais WHERE id = ?',
      [filial_id]
    );

    if (filial.length === 0) {
      return errorResponse(res, 'Filial não encontrada', STATUS_CODES.BAD_REQUEST);
    }

    // Inserir centro de custo
    const result = await executeQuery(
      'INSERT INTO centro_custo (codigo, nome, descricao, filial_id, status, usuario_cadastro_id, criado_em) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [
        codigo.trim(),
        nome.trim(),
        descricao && descricao.trim() ? descricao.trim() : null,
        filial_id,
        status === 1 || status === '1' ? 1 : 0,
        userId
      ]
    );

    const novoCentroCustoId = result.insertId;

    // Buscar centro de custo criado
    const centrosCusto = await executeQuery(
      `SELECT 
        cc.id, 
        cc.codigo,
        cc.nome, 
        cc.descricao,
        cc.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        cc.status, 
        cc.criado_em,
        cc.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
       FROM centro_custo cc
       LEFT JOIN filiais f ON cc.filial_id = f.id
       LEFT JOIN usuarios uc ON cc.usuario_cadastro_id = uc.id
       LEFT JOIN usuarios ua ON cc.usuario_atualizacao_id = ua.id
       WHERE cc.id = ?`,
      [novoCentroCustoId]
    );

    const centroCusto = centrosCusto[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(centroCusto);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, centroCusto.id);

    return successResponse(res, data, 'Centro de custo criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar centro de custo
   */
  static atualizarCentroCusto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id || null;

    // Verificar se centro de custo existe
    const existingCentroCusto = await executeQuery(
      'SELECT id, codigo FROM centro_custo WHERE id = ?',
      [id]
    );

    if (existingCentroCusto.length === 0) {
      return notFoundResponse(res, 'Centro de custo não encontrado');
    }

    // Verificar se código já existe (se estiver sendo alterado)
    if (updateData.codigo) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM centro_custo WHERE codigo = ? AND id != ?',
        [updateData.codigo, id]
      );

      if (codigoCheck.length > 0) {
        return conflictResponse(res, 'Código do centro de custo já existe');
      }
    }

    // Verificar se filial existe (se estiver sendo alterada)
    if (updateData.filial_id) {
      const filial = await executeQuery(
        'SELECT id FROM filiais WHERE id = ?',
        [updateData.filial_id]
      );

      if (filial.length === 0) {
        return errorResponse(res, 'Filial não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = ['codigo', 'nome', 'descricao', 'filial_id', 'status'];

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
        
        // Tratamento específico para o campo status
        if (key === 'status') {
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
    updateParams.push(userId, id);

    // Executar atualização
    await executeQuery(
      `UPDATE centro_custo SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar centro de custo atualizado
    const centrosCusto = await executeQuery(
      `SELECT 
        cc.id, 
        cc.codigo,
        cc.nome, 
        cc.descricao,
        cc.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        cc.status, 
        cc.criado_em,
        cc.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM centro_custo cc
      LEFT JOIN filiais f ON cc.filial_id = f.id
      LEFT JOIN usuarios uc ON cc.usuario_cadastro_id = uc.id
      LEFT JOIN usuarios ua ON cc.usuario_atualizacao_id = ua.id
      WHERE cc.id = ?`,
      [id]
    );

    const centroCusto = centrosCusto[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(centroCusto);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, centroCusto.id);

    return successResponse(res, data, 'Centro de custo atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Obter próximo código disponível
   */
  static obterProximoCodigo = asyncHandler(async (req, res) => {
    // Buscar o maior ID atual e adicionar 1
    const maxIdResult = await executeQuery(
      'SELECT MAX(id) as maxId FROM centro_custo'
    );
    
    const maxId = maxIdResult[0]?.maxId || 0;
    const proximoId = maxId + 1;
    const proximoCodigo = `CC-${proximoId.toString().padStart(4, '0')}`;

    return successResponse(res, {
      proximoId,
      proximoCodigo
    }, 'Próximo código obtido com sucesso', STATUS_CODES.OK);
  });

  /**
   * Excluir centro de custo
   */
  static excluirCentroCusto = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se centro de custo existe
    const existingCentroCusto = await executeQuery(
      'SELECT id, nome FROM centro_custo WHERE id = ?',
      [id]
    );

    if (existingCentroCusto.length === 0) {
      return notFoundResponse(res, 'Centro de custo não encontrado');
    }

    // Verificar se centro de custo está sendo usado (pode ser expandido no futuro)
    // Por enquanto, apenas fazer soft delete

    // Soft delete - alterar status para inativo
    await executeQuery(
      'UPDATE centro_custo SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Centro de custo excluído com sucesso', STATUS_CODES.NO_CONTENT);
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

module.exports = CentroCustoCRUDController;

