/**
 * Controller CRUD de Subgrupos
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

class SubgruposCRUDController {
  
  /**
   * Criar novo subgrupo
   */
  static criarSubgrupo = asyncHandler(async (req, res) => {
    const { nome, grupo_id, status } = req.body;

    // Verificar se grupo existe
    const grupo = await executeQuery(
      'SELECT id, nome FROM grupos WHERE id = ?',
      [grupo_id]
    );

    if (grupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Verificar se nome já existe no grupo
    const existingSubgrupo = await executeQuery(
      'SELECT id FROM subgrupos WHERE nome = ? AND grupo_id = ?',
      [nome, grupo_id]
    );

    if (existingSubgrupo.length > 0) {
      return conflictResponse(res, 'Nome do subgrupo já existe neste grupo');
    }

    // Inserir subgrupo
    const result = await executeQuery(
      'INSERT INTO subgrupos (nome, codigo, descricao, grupo_id, status, data_cadastro) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        nome && nome.trim() ? nome.trim() : null, 
        req.body.codigo && req.body.codigo.trim() ? req.body.codigo.trim() : null,
        req.body.descricao && req.body.descricao.trim() ? req.body.descricao.trim() : null,
        grupo_id || null, 
        status === 1 ? 'ativo' : 'inativo'
      ]
    );

    const novoSubgrupoId = result.insertId;

    // Buscar subgrupo criado
    const subgrupos = await executeQuery(
      `SELECT 
        sg.id, 
        sg.nome, 
        sg.codigo,
        sg.descricao,
        sg.grupo_id,
        sg.status, 
        sg.data_cadastro as criado_em,
        sg.data_atualizacao as atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM subgrupos sg
       LEFT JOIN grupos g ON sg.grupo_id = g.id
       LEFT JOIN produtos p ON sg.id = p.subgrupo_id
       WHERE sg.id = ?
       GROUP BY sg.id, sg.nome, sg.codigo, sg.descricao, sg.grupo_id, sg.status, sg.data_cadastro, sg.data_atualizacao, g.nome`,
      [novoSubgrupoId]
    );

    const subgrupo = subgrupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(subgrupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, subgrupo.id);

    return successResponse(res, data, 'Subgrupo criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar subgrupo
   */
  static atualizarSubgrupo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se subgrupo existe
    const existingSubgrupo = await executeQuery(
      'SELECT id, nome, grupo_id FROM subgrupos WHERE id = ?',
      [id]
    );

    if (existingSubgrupo.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    // Verificar se grupo existe (se estiver sendo alterado)
    if (updateData.grupo_id) {
      const grupo = await executeQuery(
        'SELECT id, nome FROM grupos WHERE id = ?',
        [updateData.grupo_id]
      );

      if (grupo.length === 0) {
        return notFoundResponse(res, 'Grupo não encontrado');
      }
    }

    // Verificar se nome já existe no grupo (se estiver sendo alterado)
    if (updateData.nome) {
      const grupoId = updateData.grupo_id || existingSubgrupo[0].grupo_id;
      const nomeCheck = await executeQuery(
        'SELECT id FROM subgrupos WHERE nome = ? AND grupo_id = ? AND id != ?',
        [updateData.nome, grupoId, id]
      );

      if (nomeCheck.length > 0) {
        return conflictResponse(res, 'Nome do subgrupo já existe neste grupo');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = ['nome', 'codigo', 'descricao', 'grupo_id', 'status'];

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
        
        updateFields.push(`${key} = ?`);
        updateParams.push(value);
      }
    });

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('data_atualizacao = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE subgrupos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar subgrupo atualizado
    const subgrupos = await executeQuery(
      `SELECT 
        sg.id, 
        sg.nome, 
        sg.codigo,
        sg.descricao,
        sg.grupo_id,
        sg.status, 
        sg.data_cadastro as criado_em,
        sg.data_atualizacao as atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM subgrupos sg
       LEFT JOIN grupos g ON sg.grupo_id = g.id
       LEFT JOIN produtos p ON sg.id = p.subgrupo_id
       WHERE sg.id = ?
       GROUP BY sg.id, sg.nome, sg.codigo, sg.descricao, sg.grupo_id, sg.status, sg.data_cadastro, sg.data_atualizacao, g.nome`,
      [id]
    );

    const subgrupo = subgrupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(subgrupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, subgrupo.id);

    return successResponse(res, data, 'Subgrupo atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir subgrupo
   */
  static excluirSubgrupo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se subgrupo existe
    const existingSubgrupo = await executeQuery(
      'SELECT id FROM subgrupos WHERE id = ?',
      [id]
    );

    if (existingSubgrupo.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    // Verificar se subgrupo está sendo usado em produtos ATIVOS
    const produtos = await executeQuery(
      'SELECT id, nome, status FROM produtos WHERE subgrupo_id = ? AND status = 1',
      [id]
    );

    if (produtos.length > 0) {
      let mensagem = `Subgrupo não pode ser excluído pois possui ${produtos.length} produto(s) ativo(s) vinculado(s):`;
      mensagem += `\n- ${produtos.map(p => p.nome).join(', ')}`;
      mensagem += '\n\nPara excluir o subgrupo, primeiro desative todos os produtos vinculados.';
      
      return errorResponse(res, mensagem, STATUS_CODES.BAD_REQUEST);
    }

    // Excluir subgrupo (soft delete - alterar status para inativo)
    await executeQuery(
      'UPDATE subgrupos SET status = "inativo", data_atualizacao = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Subgrupo excluído com sucesso', STATUS_CODES.NO_CONTENT);
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

module.exports = SubgruposCRUDController;
