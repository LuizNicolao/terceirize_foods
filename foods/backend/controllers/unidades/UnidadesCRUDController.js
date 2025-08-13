/**
 * Controller CRUD de Unidades de Medida
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

class UnidadesCRUDController {
  
  /**
   * Criar nova unidade
   */
  static criarUnidade = asyncHandler(async (req, res) => {
    const { nome, sigla, status = 1 } = req.body;

    // Verificar se já existe uma unidade com a mesma sigla
    const existingUnidade = await executeQuery(
      'SELECT id FROM unidades_medida WHERE sigla = ?',
      [sigla.toUpperCase()]
    );

    if (existingUnidade.length > 0) {
      return conflictResponse(res, 'Já existe uma unidade com esta sigla');
    }

    // Inserir unidade
    const insertQuery = `
      INSERT INTO unidades_medida (nome, sigla, status) 
      VALUES (?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      nome.trim(),
      sigla.toUpperCase().trim(),
      status
    ]);

    // Buscar unidade criada
    const newUnidade = await executeQuery(
      'SELECT * FROM unidades_medida WHERE id = ?',
      [result.insertId]
    );

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(newUnidade[0]);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, newUnidade[0].id);

    return successResponse(res, data, 'Unidade criada com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar unidade
   */
  static atualizarUnidade = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, sigla, status } = req.body;
    const updateData = { nome, sigla, status };

    // Verificar se a unidade existe
    const existingUnidade = await executeQuery(
      'SELECT * FROM unidades_medida WHERE id = ?',
      [id]
    );

    if (existingUnidade.length === 0) {
      return notFoundResponse(res, 'Unidade não encontrada');
    }

    // Verificar se já existe outra unidade com a mesma sigla
    if (sigla) {
      const existingUnidadeWithSigla = await executeQuery(
        'SELECT id FROM unidades_medida WHERE sigla = ? AND id != ?',
        [sigla.toUpperCase().trim(), id]
      );

      if (existingUnidadeWithSigla.length > 0) {
        return conflictResponse(res, 'Já existe outra unidade com esta sigla');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = ['nome', 'sigla', 'status'];

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
          // Converter sigla para maiúsculo
          if (key === 'sigla') {
            value = value.toUpperCase();
          }
        }
        
        updateFields.push(`${key} = ?`);
        updateParams.push(value);
      }
    });

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    // Sempre atualizar o timestamp
    updateFields.push('atualizado_em = CURRENT_TIMESTAMP');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE unidades_medida SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar unidade atualizada
    const updatedUnidade = await executeQuery(
      'SELECT * FROM unidades_medida WHERE id = ?',
      [id]
    );

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(updatedUnidade[0]);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, updatedUnidade[0].id);

    return successResponse(res, data, 'Unidade atualizada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir unidade (hard delete)
   */
  static excluirUnidade = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se a unidade existe
    const unidade = await executeQuery(
      'SELECT * FROM unidades_medida WHERE id = ?',
      [id]
    );

    if (unidade.length === 0) {
      return notFoundResponse(res, 'Unidade não encontrada');
    }

    // Verificar se há produtos vinculados
    const produtos = await executeQuery(
      'SELECT id FROM produtos WHERE unidade_id = ?',
      [id]
    );

    if (produtos.length > 0) {
      return conflictResponse(res, `Não é possível excluir a unidade. Existem ${produtos.length} produto(s) vinculado(s) a ela.`);
    }

    // Excluir unidade
    await executeQuery('DELETE FROM unidades_medida WHERE id = ?', [id]);

    return successResponse(res, null, 'Unidade excluída com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    if (user.tipo_de_acesso === 'administrador') {
      return ['visualizar', 'criar', 'editar', 'excluir'];
    }

    return accessLevels[user.nivel_de_acesso] || [];
  }
}

module.exports = UnidadesCRUDController;
