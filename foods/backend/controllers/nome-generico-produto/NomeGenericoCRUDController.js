/**
 * Controller CRUD de Nomes Genéricos
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

class NomeGenericoCRUDController {
  
  /**
   * Criar novo nome genérico
   */
  static criarNomeGenerico = asyncHandler(async (req, res) => {
    const { nome, grupo_id, subgrupo_id, classe_id, status = 1 } = req.body;

    // Validações específicas
    if (!nome || nome.trim().length < 3) {
      return errorResponse(res, 'O nome deve ter pelo menos 3 caracteres', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se nome já existe
    const existingNome = await executeQuery(
      'SELECT id FROM nome_generico_produto WHERE nome = ?',
      [nome.trim()]
    );

    if (existingNome.length > 0) {
      return conflictResponse(res, 'Já existe um nome genérico com este nome');
    }

    // Verificar se o grupo existe (se fornecido)
    if (grupo_id) {
      const grupo = await executeQuery(
        'SELECT id FROM grupos WHERE id = ?',
        [grupo_id]
      );

      if (grupo.length === 0) {
        return notFoundResponse(res, 'Grupo não encontrado');
      }
    }

    // Verificar se o subgrupo existe (se fornecido)
    if (subgrupo_id) {
      const subgrupo = await executeQuery(
        'SELECT id FROM subgrupos WHERE id = ?',
        [subgrupo_id]
      );

      if (subgrupo.length === 0) {
        return notFoundResponse(res, 'Subgrupo não encontrado');
      }
    }

    // Verificar se a classe existe (se fornecida)
    if (classe_id) {
      const classe = await executeQuery(
        'SELECT id FROM classes WHERE id = ?',
        [classe_id]
      );

      if (classe.length === 0) {
        return notFoundResponse(res, 'Classe não encontrada');
      }
    }

    // Inserir nome genérico
    const result = await executeQuery(
      'INSERT INTO nome_generico_produto (nome, grupo_id, subgrupo_id, classe_id, status) VALUES (?, ?, ?, ?, ?)',
      [
        nome && nome.trim() ? nome.trim() : null,
        grupo_id || null,
        subgrupo_id || null,
        classe_id || null,
        status || 1
      ]
    );

    const novoNomeGenericoId = result.insertId;

    // Buscar nome genérico criado
    const nomesGenericos = await executeQuery(
      `SELECT 
        ngp.id, 
        ngp.nome, 
        ngp.grupo_id,
        ngp.subgrupo_id,
        ngp.classe_id,
        ngp.status, 
        ngp.created_at as criado_em,
        ngp.updated_at as atualizado_em,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        0 as total_produtos
       FROM nome_generico_produto ngp
       LEFT JOIN grupos g ON ngp.grupo_id = g.id
       LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
       LEFT JOIN classes c ON ngp.classe_id = c.id
       WHERE ngp.id = ?`,
      [novoNomeGenericoId]
    );

    const nomeGenerico = nomesGenericos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(nomeGenerico);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, nomeGenerico.id);

    return successResponse(res, data, 'Nome genérico criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar nome genérico
   */
  static atualizarNomeGenerico = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, grupo_id, subgrupo_id, classe_id, status } = req.body;
    const updateData = { nome, grupo_id, subgrupo_id, classe_id, status };

    // Verificar se o nome genérico existe
    const existingNomeGenerico = await executeQuery(
      'SELECT * FROM nome_generico_produto WHERE id = ?',
      [id]
    );

    if (existingNomeGenerico.length === 0) {
      return notFoundResponse(res, 'Nome genérico não encontrado');
    }

    // Validações específicas
    if (nome && nome.trim().length < 3) {
      return errorResponse(res, 'O nome deve ter pelo menos 3 caracteres', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se nome já existe em outro registro
    if (nome) {
      const nomeCheck = await executeQuery(
        'SELECT id FROM nome_generico_produto WHERE nome = ? AND id != ?',
        [nome.trim(), id]
      );

      if (nomeCheck.length > 0) {
        return conflictResponse(res, 'Já existe outro nome genérico com este nome');
      }
    }

    // Verificar se o grupo existe (se fornecido)
    if (updateData.grupo_id) {
      const grupo = await executeQuery(
        'SELECT id FROM grupos WHERE id = ?',
        [updateData.grupo_id]
      );

      if (grupo.length === 0) {
        return notFoundResponse(res, 'Grupo não encontrado');
      }
    }

    // Verificar se o subgrupo existe (se fornecido)
    if (updateData.subgrupo_id) {
      const subgrupo = await executeQuery(
        'SELECT id FROM subgrupos WHERE id = ?',
        [updateData.subgrupo_id]
      );

      if (subgrupo.length === 0) {
        return notFoundResponse(res, 'Subgrupo não encontrado');
      }
    }

    // Verificar se a classe existe (se fornecida)
    if (updateData.classe_id) {
      const classe = await executeQuery(
        'SELECT id FROM classes WHERE id = ?',
        [updateData.classe_id]
      );

      if (classe.length === 0) {
        return notFoundResponse(res, 'Classe não encontrada');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = ['nome', 'grupo_id', 'subgrupo_id', 'classe_id', 'status'];

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

    updateFields.push('updated_at = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE nome_generico_produto SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar nome genérico atualizado
    const nomesGenericos = await executeQuery(
      `SELECT 
        ngp.id, 
        ngp.nome, 
        ngp.grupo_id,
        ngp.subgrupo_id,
        ngp.classe_id,
        ngp.status, 
        ngp.created_at as criado_em,
        ngp.updated_at as atualizado_em,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        0 as total_produtos
       FROM nome_generico_produto ngp
       LEFT JOIN grupos g ON ngp.grupo_id = g.id
       LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
       LEFT JOIN classes c ON ngp.classe_id = c.id
       WHERE ngp.id = ?`,
      [id]
    );

    const nomeGenerico = nomesGenericos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(nomeGenerico);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, nomeGenerico.id);

    return successResponse(res, data, 'Nome genérico atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir nome genérico (soft delete)
   */
  static excluirNomeGenerico = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se o nome genérico existe
    const nomeGenerico = await executeQuery(
      'SELECT * FROM nome_generico_produto WHERE id = ?',
      [id]
    );

    if (nomeGenerico.length === 0) {
      return notFoundResponse(res, 'Nome genérico não encontrado');
    }

    // Verificar se nome genérico está sendo usado em produtos ATIVOS
    // Como não há relação direta implementada, vamos pular essa verificação por enquanto
    // const produtos = await executeQuery(
    //   'SELECT id, nome, status FROM produtos WHERE nome_generico_id = ? AND status = 1',
    //   [id]
    // );

    // if (produtos.length > 0) {
    //   let mensagem = `Nome genérico não pode ser excluído pois possui ${produtos.length} produto(s) ativo(s) vinculado(s):`;
    //   mensagem += `\n- ${produtos.map(p => p.nome).join(', ')}`;
    //   mensagem += '\n\nPara excluir o nome genérico, primeiro desative todos os produtos vinculados.';
      
    //   return errorResponse(res, mensagem, STATUS_CODES.BAD_REQUEST);
    // }

    // Soft delete - marcar como inativo
    await executeQuery(
      'UPDATE nome_generico_produto SET status = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Nome genérico excluído com sucesso', STATUS_CODES.NO_CONTENT);
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

module.exports = NomeGenericoCRUDController;
