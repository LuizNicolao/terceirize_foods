/**
 * Controller de Autenticação de Usuários
 * Responsável por funcionalidades de autenticação e segurança
 */

const bcrypt = require('bcryptjs');
const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class UsuariosAuthController {
  
  /**
   * Alterar senha do usuário
   */
  static alterarSenha = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { senha_atual, nova_senha } = req.body;

    // Verificar se usuário existe
    const usuarios = await executeQuery(
      'SELECT id, senha FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return notFoundResponse(res, 'Usuário não encontrado');
    }

    const usuario = usuarios[0];

    // Verificar senha atual (se fornecida)
    if (senha_atual) {
      const senhaValida = await bcrypt.compare(senha_atual, usuario.senha);
      if (!senhaValida) {
        return errorResponse(res, 'Senha atual incorreta', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Criptografar nova senha
    const saltRounds = 12;
    const novaSenhaCriptografada = await bcrypt.hash(nova_senha, saltRounds);

    // Atualizar senha
    await executeQuery(
      'UPDATE usuarios SET senha = ?, atualizado_em = NOW() WHERE id = ?',
      [novaSenhaCriptografada, id]
    );

    return successResponse(res, null, 'Senha alterada com sucesso', STATUS_CODES.OK);
  });
}

module.exports = UsuariosAuthController;
