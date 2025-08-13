/**
 * Controller CRUD de Grupos
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

class GruposCRUDController {
  
  /**
   * Criar novo grupo
   */
  static criarGrupo = asyncHandler(async (req, res) => {
    const { nome, codigo, descricao, status } = req.body;

    // Verificar se nome já existe
    const existingGrupo = await executeQuery(
      'SELECT id FROM grupos WHERE nome = ?',
      [nome]
    );

    if (existingGrupo.length > 0) {
      return conflictResponse(res, 'Nome do grupo já existe');
    }

    // Verificar se código já existe
    const existingCodigo = await executeQuery(
      'SELECT id FROM grupos WHERE codigo = ?',
      [codigo]
    );

    if (existingCodigo.length > 0) {
      return conflictResponse(res, 'Código do grupo já existe');
    }

    // Inserir grupo
    const result = await executeQuery(
      'INSERT INTO grupos (nome, codigo, descricao, status, data_cadastro) VALUES (?, ?, ?, ?, NOW())',
      [
        nome && nome.trim() ? nome.trim() : null, 
        codigo && codigo.trim() ? codigo.trim() : null,
        descricao && descricao.trim() ? descricao.trim() : null,
        status === 1 ? 'ativo' : 'inativo'
      ]
    );

    const novoGrupoId = result.insertId;

    // Buscar grupo criado
    const grupos = await executeQuery(
      `SELECT 
        g.id, 
        g.nome, 
        g.codigo,
        g.descricao,
        g.status, 
        g.data_cadastro as criado_em,
        g.data_atualizacao as atualizado_em,
        COUNT(sg.id) as subgrupos_count
       FROM grupos g
       LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
       WHERE g.id = ?
       GROUP BY g.id, g.nome, g.codigo, g.descricao, g.status, g.data_cadastro, g.data_atualizacao`,
      [novoGrupoId]
    );

    const grupo = grupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(grupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, grupo.id);

    return successResponse(res, data, 'Grupo criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar grupo
   */
  static atualizarGrupo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se grupo existe
    const existingGrupo = await executeQuery(
      'SELECT id, nome FROM grupos WHERE id = ?',
      [id]
    );

    if (existingGrupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Verificar se nome já existe (se estiver sendo alterado)
    if (updateData.nome) {
      const nomeCheck = await executeQuery(
        'SELECT id FROM grupos WHERE nome = ? AND id != ?',
        [updateData.nome, id]
      );

      if (nomeCheck.length > 0) {
        return conflictResponse(res, 'Nome do grupo já existe');
      }
    }

    // Verificar se código já existe (se estiver sendo alterado)
    if (updateData.codigo) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM grupos WHERE codigo = ? AND id != ?',
        [updateData.codigo, id]
      );

      if (codigoCheck.length > 0) {
        return conflictResponse(res, 'Código do grupo já existe');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = ['nome', 'codigo', 'descricao', 'status'];

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
          value = value === 1 || value === '1' ? 'ativo' : 'inativo';
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
      `UPDATE grupos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar grupo atualizado
    const grupos = await executeQuery(
      `SELECT 
        g.id, 
        g.nome, 
        g.codigo,
        g.descricao,
        g.status, 
        g.data_cadastro as criado_em,
        g.data_atualizacao as atualizado_em,
        COUNT(sg.id) as subgrupos_count
      FROM grupos g
      LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
      WHERE g.id = ?
      GROUP BY g.id, g.nome, g.codigo, g.descricao, g.status, g.data_cadastro, g.data_atualizacao`,
      [id]
    );

    const grupo = grupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(grupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, grupo.id);

    return successResponse(res, data, 'Grupo atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir grupo
   */
  static excluirGrupo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se grupo existe
    const existingGrupo = await executeQuery(
      'SELECT id FROM grupos WHERE id = ?',
      [id]
    );

    if (existingGrupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Verificar se grupo está sendo usado em produtos ATIVOS
    const produtos = await executeQuery(
      'SELECT id, nome, status FROM produtos WHERE grupo_id = ? AND status = 1',
      [id]
    );

    if (produtos.length > 0) {
      let mensagem = `Grupo não pode ser excluído pois possui ${produtos.length} produto(s) ativo(s) vinculado(s):`;
      mensagem += `\n- ${produtos.map(p => p.nome).join(', ')}`;
      mensagem += '\n\nPara excluir o grupo, primeiro desative todos os produtos vinculados.';
      
      return errorResponse(res, mensagem, STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se grupo possui subgrupos ATIVOS
    const subgrupos = await executeQuery(
      'SELECT id, nome, status FROM subgrupos WHERE grupo_id = ? AND status = 1',
      [id]
    );

    if (subgrupos.length > 0) {
      let mensagem = `Grupo não pode ser excluído pois possui ${subgrupos.length} subgrupo(s) ativo(s) vinculado(s):`;
      mensagem += `\n- ${subgrupos.map(sg => sg.nome).join(', ')}`;
      mensagem += '\n\nPara excluir o grupo, primeiro desative todos os subgrupos vinculados.';
      
      return errorResponse(res, mensagem, STATUS_CODES.BAD_REQUEST);
    }

    // Excluir grupo (soft delete - alterar status para inativo)
    await executeQuery(
      'UPDATE grupos SET status = "inativo", data_atualizacao = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Grupo excluído com sucesso', STATUS_CODES.NO_CONTENT);
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

module.exports = GruposCRUDController;
