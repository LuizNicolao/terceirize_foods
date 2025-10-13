/**
 * Controller CRUD de Classes
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
const { gerarCodigoClasse } = require('../../utils/codigoGenerator');

class ClassesCRUDController {
  
  /**
   * Criar nova classe
   */
  static criarClasse = asyncHandler(async (req, res) => {
    const { nome, descricao, subgrupo_id, status } = req.body;

    // Verificar se subgrupo existe
    const subgrupo = await executeQuery(
      'SELECT id, nome FROM subgrupos WHERE id = ?',
      [subgrupo_id]
    );

    if (subgrupo.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    // Verificar se classe já existe no mesmo subgrupo
    const existingClasse = await executeQuery(
      'SELECT id FROM classes WHERE nome = ? AND subgrupo_id = ?',
      [nome, subgrupo_id]
    );

    if (existingClasse.length > 0) {
      return conflictResponse(res, 'Classe já cadastrada neste subgrupo');
    }

    // Inserir classe (com código temporário)
    const result = await executeQuery(
      'INSERT INTO classes (nome, codigo, descricao, subgrupo_id, status, data_cadastro) VALUES (?, ?, ?, ?, ?, NOW())',
      [nome && nome.trim() ? nome.trim() : null, 'TEMP', descricao && descricao.trim() ? descricao.trim() : null, subgrupo_id || null, status === 1 || status === '1' ? 'ativo' : 'inativo']
    );

    // Gerar código de vitrine baseado no ID inserido
    const codigoVitrine = gerarCodigoClasse(result.insertId);

    // Atualizar o registro com o código de vitrine
    await executeQuery(
      'UPDATE classes SET codigo = ? WHERE id = ?',
      [codigoVitrine, result.insertId]
    );

    const novaClasseId = result.insertId;

    // Buscar classe criada
    const classes = await executeQuery(
      `SELECT 
        c.id, 
        c.nome, 
        c.codigo,
        c.descricao,
        c.subgrupo_id,
        c.status, 
        c.data_cadastro as criado_em,
        c.data_atualizacao as atualizado_em,
        s.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM classes c
       LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
       LEFT JOIN grupos g ON s.grupo_id = g.id
       LEFT JOIN produtos p ON c.id = p.classe_id
       WHERE c.id = ?
       GROUP BY c.id, c.nome, c.codigo, c.descricao, c.subgrupo_id, c.status, c.data_cadastro, c.data_atualizacao, s.nome, g.nome`,
      [novaClasseId]
    );

    const classe = classes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(classe);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, classe.id);

    return successResponse(res, data, 'Classe criada com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar classe
   */
  static atualizarClasse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, codigo, descricao, subgrupo_id, status } = req.body;
    const updateData = { nome, codigo, descricao, subgrupo_id, status };

    // Verificar se classe existe
    const existingClasse = await executeQuery(
      'SELECT id, nome, subgrupo_id FROM classes WHERE id = ?',
      [id]
    );

    if (existingClasse.length === 0) {
      return notFoundResponse(res, 'Classe não encontrada');
    }

    // Verificar se subgrupo existe (se estiver sendo alterado)
    if (updateData.subgrupo_id) {
      const subgrupo = await executeQuery(
        'SELECT id, nome FROM subgrupos WHERE id = ?',
        [updateData.subgrupo_id]
      );

      if (subgrupo.length === 0) {
        return notFoundResponse(res, 'Subgrupo não encontrado');
      }
    }

    // Verificar se classe já existe no mesmo subgrupo (se estiver sendo alterada)
    if (updateData.nome || updateData.subgrupo_id) {
      const nome = updateData.nome || existingClasse[0].nome;
      const subgrupoId = updateData.subgrupo_id || existingClasse[0].subgrupo_id;
      
      const classeCheck = await executeQuery(
        'SELECT id FROM classes WHERE nome = ? AND subgrupo_id = ? AND id != ?',
        [nome, subgrupoId, id]
      );

      if (classeCheck.length > 0) {
        return conflictResponse(res, 'Classe já cadastrada neste subgrupo');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = ['nome', 'descricao', 'subgrupo_id', 'status']; // Removido 'codigo' pois é gerado automaticamente

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
      `UPDATE classes SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar classe atualizada
    const classes = await executeQuery(
      `SELECT 
        c.id, 
        c.nome, 
        c.codigo,
        c.descricao,
        c.subgrupo_id,
        c.status, 
        c.data_cadastro as criado_em,
        c.data_atualizacao as atualizado_em,
        s.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM classes c
       LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
       LEFT JOIN grupos g ON s.grupo_id = g.id
       LEFT JOIN produtos p ON c.id = p.classe_id
       WHERE c.id = ?
       GROUP BY c.id, c.nome, c.codigo, c.descricao, c.subgrupo_id, c.status, c.data_cadastro, c.data_atualizacao, s.nome, g.nome`,
      [id]
    );

    const classe = classes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(classe);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, classe.id);

    return successResponse(res, data, 'Classe atualizada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Obter próximo código disponível
   */
  static obterProximoCodigo = asyncHandler(async (req, res) => {
    // Buscar o maior ID atual e adicionar 1
    const maxIdResult = await executeQuery(
      'SELECT MAX(id) as maxId FROM classes'
    );
    
    const maxId = maxIdResult[0]?.maxId || 0;
    const proximoId = maxId + 1;
    const proximoCodigo = gerarCodigoClasse(proximoId);

    return successResponse(res, {
      proximoId,
      proximoCodigo
    }, 'Próximo código obtido com sucesso', STATUS_CODES.OK);
  });

  /**
   * Excluir classe
   */
  static excluirClasse = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se classe existe
    const existingClasse = await executeQuery(
      'SELECT id, nome FROM classes WHERE id = ?',
      [id]
    );

    if (existingClasse.length === 0) {
      return notFoundResponse(res, 'Classe não encontrada');
    }

    // Verificar se classe está sendo usada em produtos ATIVOS
    const produtos = await executeQuery(
      'SELECT id, nome, status FROM produtos WHERE classe_id = ? AND status = 1',
      [existingClasse[0].id]
    );

    if (produtos.length > 0) {
      let mensagem = `Classe não pode ser excluída pois possui ${produtos.length} produto(s) ativo(s) vinculado(s):`;
      mensagem += `\n- ${produtos.map(p => p.nome).join(', ')}`;
      mensagem += '\n\nPara excluir a classe, primeiro desative todos os produtos vinculados.';
      
      return errorResponse(res, mensagem, STATUS_CODES.BAD_REQUEST);
    }

    // Excluir classe (soft delete - alterar status para inativo)
    await executeQuery(
      'UPDATE classes SET status = "inativo", data_atualizacao = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Classe excluída com sucesso', STATUS_CODES.NO_CONTENT);
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

module.exports = ClassesCRUDController;
