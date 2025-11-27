/**
 * Controller CRUD de Almoxarifado
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

class AlmoxarifadoCRUDController {
  
  /**
   * Criar novo almoxarifado
   */
  static criarAlmoxarifado = asyncHandler(async (req, res) => {
    const { codigo, nome, filial_id, centro_custo_id, observacoes, status = 1, tipo_vinculo = 'filial', unidade_escolar_id = null } = req.body;
    const userId = req.user?.id || null;

    // Validar tipo_vinculo
    if (!['filial', 'unidade_escolar'].includes(tipo_vinculo)) {
      return errorResponse(res, 'Tipo de vínculo inválido. Deve ser "filial" ou "unidade_escolar"', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se código já existe (se fornecido)
    if (codigo) {
      const existingCodigo = await executeQuery(
        'SELECT id FROM almoxarifado WHERE codigo = ?',
        [codigo]
      );

      if (existingCodigo.length > 0) {
        return conflictResponse(res, 'Código do almoxarifado já existe');
      }
    }

    // Verificar se filial existe (sempre necessário)
    const filial = await executeQuery(
      'SELECT id FROM filiais WHERE id = ?',
      [filial_id]
    );

    if (filial.length === 0) {
      return errorResponse(res, 'Filial não encontrada', STATUS_CODES.BAD_REQUEST);
    }

    // Se for vínculo com unidade escolar, validar
    if (tipo_vinculo === 'unidade_escolar') {
      if (!unidade_escolar_id) {
        return errorResponse(res, 'Unidade escolar é obrigatória para vínculo com unidade escolar', STATUS_CODES.BAD_REQUEST);
      }

      // Verificar se unidade escolar existe e pertence à filial
      const unidadeEscolar = await executeQuery(
        'SELECT id, nome_escola, filial_id FROM unidades_escolares WHERE id = ?',
        [unidade_escolar_id]
      );

      if (unidadeEscolar.length === 0) {
        return errorResponse(res, 'Unidade escolar não encontrada', STATUS_CODES.BAD_REQUEST);
      }

      if (unidadeEscolar[0].filial_id !== parseInt(filial_id)) {
        return errorResponse(res, 'Unidade escolar não pertence à filial selecionada', STATUS_CODES.BAD_REQUEST);
      }

      // Validar: apenas 1 almoxarifado por unidade escolar
      const almoxarifadoExistente = await executeQuery(
        'SELECT id FROM almoxarifado WHERE unidade_escolar_id = ? AND status = 1',
        [unidade_escolar_id]
      );

      if (almoxarifadoExistente.length > 0) {
        return conflictResponse(res, 'Esta unidade escolar já possui um almoxarifado vinculado. Cada unidade escolar pode ter apenas um almoxarifado.');
      }
    }

    // Verificar se centro de custo existe
    const centroCusto = await executeQuery(
      'SELECT id FROM centro_custo WHERE id = ? AND status = 1',
      [centro_custo_id]
    );

    if (centroCusto.length === 0) {
      return errorResponse(res, 'Centro de custo não encontrado ou inativo', STATUS_CODES.BAD_REQUEST);
    }

    // Gerar código se não fornecido
    let codigoFinal = codigo;
    if (!codigoFinal) {
      const maxIdResult = await executeQuery(
        'SELECT MAX(id) as maxId FROM almoxarifado'
      );
      const maxId = maxIdResult[0]?.maxId || 0;
      const proximoId = maxId + 1;
      codigoFinal = `ALM-${proximoId.toString().padStart(4, '0')}`;
    }

    // Inserir almoxarifado
    const result = await executeQuery(
      'INSERT INTO almoxarifado (codigo, nome, filial_id, tipo_vinculo, unidade_escolar_id, centro_custo_id, observacoes, status, usuario_cadastro_id, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [
        codigoFinal.trim(),
        nome.trim(),
        filial_id,
        tipo_vinculo,
        tipo_vinculo === 'unidade_escolar' ? unidade_escolar_id : null,
        centro_custo_id,
        observacoes && observacoes.trim() ? observacoes.trim() : null,
        status === 1 || status === '1' ? 1 : 0,
        userId
      ]
    );

    const novoAlmoxarifadoId = result.insertId;

    // Atualizar vínculos conforme o tipo
    if (tipo_vinculo === 'unidade_escolar') {
      // Atualizar unidade escolar com o ID do almoxarifado e centro_custo_id
      await executeQuery(
        'UPDATE unidades_escolares SET almoxarifado_id = ?, centro_custo_id = ? WHERE id = ?',
        [novoAlmoxarifadoId, centro_custo_id || null, unidade_escolar_id]
      );
    } else {
      // Atualizar filial com a lista de IDs de almoxarifados
      const almoxarifadosFilial = await executeQuery(
        'SELECT id FROM almoxarifado WHERE filial_id = ? AND tipo_vinculo = ? AND status = 1',
        [filial_id, 'filial']
      );
      const ids = almoxarifadosFilial.map(a => a.id).join(',');
      await executeQuery(
        'UPDATE filiais SET almoxarifados_ids = ? WHERE id = ?',
        [ids || null, filial_id]
      );
    }

    // Buscar almoxarifado criado
    const almoxarifados = await executeQuery(
      `SELECT 
        a.id, 
        a.codigo,
        a.nome, 
        a.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        a.tipo_vinculo,
        a.unidade_escolar_id,
        ue.nome_escola as unidade_escolar_nome,
        ue.codigo_teknisa as unidade_escolar_codigo,
        a.centro_custo_id,
        cc.codigo as centro_custo_codigo,
        cc.nome as centro_custo_nome,
        a.observacoes,
        a.status, 
        a.criado_em,
        a.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
       FROM almoxarifado a
       LEFT JOIN filiais f ON a.filial_id = f.id
       LEFT JOIN unidades_escolares ue ON a.unidade_escolar_id = ue.id
       LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
       LEFT JOIN usuarios uc ON a.usuario_cadastro_id = uc.id
       LEFT JOIN usuarios ua ON a.usuario_atualizacao_id = ua.id
       WHERE a.id = ?`,
      [novoAlmoxarifadoId]
    );

    const almoxarifado = almoxarifados[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(almoxarifado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, almoxarifado.id);

    return successResponse(res, data, 'Almoxarifado criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar almoxarifado
   */
  static atualizarAlmoxarifado = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id || null;

    // Verificar se almoxarifado existe
    const existingAlmoxarifado = await executeQuery(
      'SELECT id, codigo FROM almoxarifado WHERE id = ?',
      [id]
    );

    if (existingAlmoxarifado.length === 0) {
      return notFoundResponse(res, 'Almoxarifado não encontrado');
    }

    // Verificar se código já existe (se estiver sendo alterado)
    if (updateData.codigo) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM almoxarifado WHERE codigo = ? AND id != ?',
        [updateData.codigo, id]
      );

      if (codigoCheck.length > 0) {
        return conflictResponse(res, 'Código do almoxarifado já existe');
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

    // Verificar se centro de custo existe (se estiver sendo alterado)
    if (updateData.centro_custo_id) {
      const centroCusto = await executeQuery(
        'SELECT id FROM centro_custo WHERE id = ? AND status = 1',
        [updateData.centro_custo_id]
      );

      if (centroCusto.length === 0) {
        return errorResponse(res, 'Centro de custo não encontrado ou inativo', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = ['codigo', 'nome', 'filial_id', 'tipo_vinculo', 'unidade_escolar_id', 'centro_custo_id', 'observacoes', 'status'];

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
      `UPDATE almoxarifado SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar almoxarifado atualizado
    const almoxarifados = await executeQuery(
      `SELECT 
        a.id, 
        a.codigo,
        a.nome, 
        a.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        a.tipo_vinculo,
        a.unidade_escolar_id,
        ue.nome_escola as unidade_escolar_nome,
        ue.codigo_teknisa as unidade_escolar_codigo,
        a.centro_custo_id,
        cc.codigo as centro_custo_codigo,
        cc.nome as centro_custo_nome,
        a.observacoes,
        a.status, 
        a.criado_em,
        a.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM almoxarifado a
      LEFT JOIN filiais f ON a.filial_id = f.id
      LEFT JOIN unidades_escolares ue ON a.unidade_escolar_id = ue.id
      LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
      LEFT JOIN usuarios uc ON a.usuario_cadastro_id = uc.id
      LEFT JOIN usuarios ua ON a.usuario_atualizacao_id = ua.id
      WHERE a.id = ?`,
      [id]
    );

    const almoxarifado = almoxarifados[0];

    // Atualizar vínculos conforme o tipo
    if (almoxarifado.tipo_vinculo === 'unidade_escolar' && almoxarifado.unidade_escolar_id) {
      // Atualizar unidade escolar com o ID do almoxarifado e centro_custo_id
      await executeQuery(
        'UPDATE unidades_escolares SET almoxarifado_id = ?, centro_custo_id = ? WHERE id = ?',
        [id, almoxarifado.centro_custo_id || null, almoxarifado.unidade_escolar_id]
      );
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(almoxarifado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, almoxarifado.id);

    return successResponse(res, data, 'Almoxarifado atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Obter próximo código disponível
   */
  static obterProximoCodigo = asyncHandler(async (req, res) => {
    // Buscar o maior ID atual e adicionar 1
    const maxIdResult = await executeQuery(
      'SELECT MAX(id) as maxId FROM almoxarifado'
    );
    
    const maxId = maxIdResult[0]?.maxId || 0;
    const proximoId = maxId + 1;
    const proximoCodigo = `ALM-${proximoId.toString().padStart(4, '0')}`;

    return successResponse(res, {
      proximoId,
      proximoCodigo
    }, 'Próximo código obtido com sucesso', STATUS_CODES.OK);
  });

  /**
   * Excluir almoxarifado
   */
  static excluirAlmoxarifado = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se almoxarifado existe
    const existingAlmoxarifado = await executeQuery(
      'SELECT id, nome FROM almoxarifado WHERE id = ?',
      [id]
    );

    if (existingAlmoxarifado.length === 0) {
      return notFoundResponse(res, 'Almoxarifado não encontrado');
    }

    // Soft delete - alterar status para inativo
    await executeQuery(
      'UPDATE almoxarifado SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Almoxarifado excluído com sucesso', STATUS_CODES.NO_CONTENT);
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

module.exports = AlmoxarifadoCRUDController;

