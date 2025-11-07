/**
 * Controller CRUD de Usuários
 * Responsável por criar, atualizar e excluir usuários
 */

const bcrypt = require('bcryptjs');
const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  conflictResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { atualizarPermissoesPorTipoNivel } = require('../permissoes/permissoesUtils');

class UsuariosCRUDController {
  
  /**
   * Criar novo usuário
   */
  static criarUsuario = asyncHandler(async (req, res) => {
    const { nome, email, senha, nivel_de_acesso, tipo_de_acesso } = req.body;
    // const { filiais } = req.body; // TODO: Implementar quando a tabela filiais for criada

    // Verificar se email já existe
    const existingUser = await executeQuery(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return conflictResponse(res, 'Email já cadastrado');
    }

    // Criptografar senha
    const saltRounds = 12;
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

    // Inserir usuário
    const result = await executeQuery(
      'INSERT INTO usuarios (nome, email, senha, nivel_de_acesso, tipo_de_acesso, status, criado_em) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [nome, email, senhaCriptografada, nivel_de_acesso, tipo_de_acesso, 'ativo']
    );

    const novoUsuarioId = result.insertId;

    // Buscar usuário criado
    const usuarios = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status, criado_em, atualizado_em FROM usuarios WHERE id = ?',
      [novoUsuarioId]
    );

    const usuario = usuarios[0];

    // Atualizar permissões baseado no tipo de acesso
    await atualizarPermissoesPorTipoNivel(novoUsuarioId, tipo_de_acesso, nivel_de_acesso);

    // Vincular filiais se fornecidas (temporariamente desabilitado)
    // TODO: Implementar quando a tabela filiais for criada
    // if (filiais && Array.isArray(filiais) && filiais.length > 0) {
    //   await this.vincularFiliais(novoUsuarioId, filiais);
    // }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(usuario);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, usuario.id);

    return successResponse(res, data, 'Usuário criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar usuário
   */
  static atualizarUsuario = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, email, nivel_de_acesso, tipo_de_acesso, status, senha } = req.body;
    // const { filiais } = req.body; // TODO: Implementar quando a tabela filiais for criada

    // Verificar se usuário existe
    const existingUser = await executeQuery(
      'SELECT id, email FROM usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return notFoundResponse(res, 'Usuário não encontrado');
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== existingUser[0].email) {
      const emailExists = await executeQuery(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailExists.length > 0) {
        return conflictResponse(res, 'Email já cadastrado');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];

    if (nome !== undefined) {
      updateFields.push('nome = ?');
      updateParams.push(nome);
    }

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateParams.push(email);
    }

    if (nivel_de_acesso !== undefined) {
      updateFields.push('nivel_de_acesso = ?');
      updateParams.push(nivel_de_acesso);
    }

    if (tipo_de_acesso !== undefined) {
      updateFields.push('tipo_de_acesso = ?');
      updateParams.push(tipo_de_acesso);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    if (senha !== undefined && senha !== null && String(senha).trim() !== '') {
      const saltRounds = 12;
      const senhaCriptografada = await bcrypt.hash(String(senha), saltRounds);
      updateFields.push('senha = ?');
      updateParams.push(senhaCriptografada);
    }

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('atualizado_em = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Atualizar permissões se tipo de acesso ou nível foram alterados
    if (tipo_de_acesso !== undefined || nivel_de_acesso !== undefined) {
      const currentUser = await executeQuery(
        'SELECT tipo_de_acesso, nivel_de_acesso FROM usuarios WHERE id = ?',
        [id]
      );
      
      const currentTipo = tipo_de_acesso || currentUser[0].tipo_de_acesso;
      const currentNivel = nivel_de_acesso || currentUser[0].nivel_de_acesso;
      
      await atualizarPermissoesPorTipoNivel(id, currentTipo, currentNivel);
    }

    // Atualizar vínculos com filiais se fornecidos (temporariamente desabilitado)
    // TODO: Implementar quando a tabela filiais for criada
    // if (filiais !== undefined) {
    //   await this.atualizarVinculosFiliais(id, filiais);
    // }

    // Buscar usuário atualizado
    const usuarios = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status, criado_em, atualizado_em FROM usuarios WHERE id = ?',
      [id]
    );

    const usuario = usuarios[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(usuario);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, usuario.id);

    return successResponse(res, data, 'Usuário atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir usuário
   */
  static excluirUsuario = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se usuário existe
    const existingUser = await executeQuery(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return notFoundResponse(res, 'Usuário não encontrado');
    }

    // Verificar se não é o último administrador
    const adminCount = await executeQuery(
      'SELECT COUNT(*) as count FROM usuarios WHERE tipo_de_acesso = "administrador" AND status = "ativo"',
      []
    );

    const userToDelete = await executeQuery(
      'SELECT tipo_de_acesso FROM usuarios WHERE id = ?',
      [id]
    );

    if (adminCount[0].count <= 1 && userToDelete[0].tipo_de_acesso === 'administrador') {
      return errorResponse(res, 'Não é possível excluir o último administrador', STATUS_CODES.BAD_REQUEST);
    }

    // Excluir usuário (soft delete - alterar status para inativo)
    await executeQuery(
      'UPDATE usuarios SET status = "inativo", atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Usuário excluído com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões baseada no usuário
    // Por enquanto, retorna permissões básicas
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }

  /**
   * Vincular usuário a filiais (temporariamente desabilitado)
   */
  static async vincularFiliais(usuarioId, filiais) {
    // TODO: Implementar quando a tabela filiais for criada
    console.log('Função vincularFiliais temporariamente desabilitada');
    return;
    
    // try {
    //   // Remover vínculos existentes
    //   await executeQuery(
    //     'DELETE FROM usuarios_filiais WHERE usuario_id = ?',
    //     [usuarioId]
    //   );

    //   // Inserir novos vínculos
    //   if (filiais.length > 0) {
    //     const values = filiais.map(filialId => [usuarioId, filialId]);
    //     const placeholders = values.map(() => '(?, ?)').join(', ');
        
    //     await executeQuery(
    //       `INSERT INTO usuarios_filiais (usuario_id, filial_id) VALUES ${placeholders}`,
    //       values.flat()
    //     );
    //   }
    // } catch (error) {
    //   console.error('Erro ao vincular filiais:', error);
    //   throw new Error('Erro ao vincular usuário às filiais');
    // }
  }

  /**
   * Atualizar vínculos com filiais (temporariamente desabilitado)
   */
  static async atualizarVinculosFiliais(usuarioId, filiais) {
    // TODO: Implementar quando a tabela filiais for criada
    console.log('Função atualizarVinculosFiliais temporariamente desabilitada');
    return;
    
    // try {
    //   // Remover vínculos existentes
    //   await executeQuery(
    //     'DELETE FROM usuarios_filiais WHERE usuario_id = ?',
    //     [usuarioId]
    //   );

    //   // Inserir novos vínculos
    //   if (filiais.length > 0) {
    //     const values = filiais.map(filialId => [usuarioId, filialId]);
    //     const placeholders = values.map(() => '(?, ?)').join(', ');
        
    //     await executeQuery(
    //       `INSERT INTO usuarios_filiais (usuario_id, filial_id) VALUES ${placeholders}`,
    //       values.flat()
    //     );
    //   }
    // } catch (error) {
    //   console.error('Erro ao atualizar vínculos com filiais:', error);
    //   throw new Error('Erro ao atualizar vínculos com filiais');
    // }
  }

  /**
   * Obter filiais vinculadas ao usuário (temporariamente desabilitado)
   */
  static async obterFiliaisUsuario(usuarioId) {
    // TODO: Implementar quando a tabela filiais for criada
    console.log('Função obterFiliaisUsuario temporariamente desabilitada');
    return [];
    
    // try {
    //   const filiais = await executeQuery(
    //     `SELECT f.id, f.filial, f.cidade, f.estado, f.codigo_filial
    //      FROM filiais f
    //      INNER JOIN usuarios_filiais uf ON f.id = uf.filial_id
    //      WHERE uf.usuario_id = ? AND f.status = 'ativo'
    //      ORDER BY f.filial`,
    //     [usuarioId]
    //   );
    //   return filiais;
    // } catch (error) {
    //   console.error('Erro ao obter filiais do usuário:', error);
    //   return [];
    // }
  }

  /**
   * Verificar se usuário tem acesso à filial
   */
  static async verificarAcessoFilial(usuarioId, filialId) {
    try {
      const resultado = await executeQuery(
        'SELECT COUNT(*) as count FROM usuarios_filiais WHERE usuario_id = ? AND filial_id = ?',
        [usuarioId, filialId]
      );
      return resultado[0].count > 0;
    } catch (error) {
      console.error('Erro ao verificar acesso à filial:', error);
      return false;
    }
  }

  /**
   * Atualizar filiais do usuário (rota específica)
   */
  static atualizarFiliaisUsuario = asyncHandler(async (req, res) => {
    // TODO: Implementar quando a tabela filiais for criada
    return errorResponse(res, 'Funcionalidade de filiais temporariamente desabilitada', STATUS_CODES.SERVICE_UNAVAILABLE);
    
    // const { id } = req.params;
    // const { filiais } = req.body;

    // // Verificar se usuário existe
    // const existingUser = await executeQuery(
    //   'SELECT id, nome FROM usuarios WHERE id = ?',
    //   [id]
    // );

    // if (existingUser.length === 0) {
    //   return notFoundResponse(res, 'Usuário não encontrado');
    // }

    // // Validar se filiais é um array
    // if (!Array.isArray(filiais)) {
    //   return errorResponse(res, 'Filiais deve ser um array', STATUS_CODES.BAD_REQUEST);
    // }

    // try {
    //   // Atualizar vínculos com filiais
    //   await this.atualizarVinculosFiliais(id, filiais);

    //   // Buscar filiais atualizadas
    //   const filiaisAtualizadas = await this.obterFiliaisUsuario(id);

    //   // Adicionar links HATEOAS
    //   const data = res.addResourceLinks({
    //     usuario: existingUser[0],
    //     filiais: filiaisAtualizadas
    //   });

    //   return successResponse(res, data, 'Filiais do usuário atualizadas com sucesso', STATUS_CODES.OK);
    // } catch (error) {
    //   console.error('Erro ao atualizar filiais do usuário:', error);
    //   return errorResponse(res, 'Erro ao atualizar filiais do usuário', STATUS_CODES.INTERNAL_SERVER_ERROR);
    // }
  });
}

module.exports = UsuariosCRUDController;
