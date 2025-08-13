/**
 * Índice dos Controllers de Usuários
 * Centraliza a exportação de todos os controllers organizados
 */

const UsuariosListController = require('./UsuariosListController');
const UsuariosCRUDController = require('./UsuariosCRUDController');
const UsuariosSearchController = require('./UsuariosSearchController');
const UsuariosAuthController = require('./UsuariosAuthController');

module.exports = {
  // Métodos de Listagem
  listarUsuarios: UsuariosListController.listarUsuarios,
  buscarUsuarioPorId: UsuariosListController.buscarUsuarioPorId,
  
  // Métodos CRUD
  criarUsuario: UsuariosCRUDController.criarUsuario,
  atualizarUsuario: UsuariosCRUDController.atualizarUsuario,
  excluirUsuario: UsuariosCRUDController.excluirUsuario,
  
  // Métodos de Busca
  buscarPorTipoAcesso: UsuariosSearchController.buscarPorTipoAcesso,
  
  // Métodos de Autenticação
  alterarSenha: UsuariosAuthController.alterarSenha
};
