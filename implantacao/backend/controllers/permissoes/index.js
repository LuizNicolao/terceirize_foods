/**
 * Índice dos Controllers de Permissões
 * Centraliza a exportação de todos os controllers organizados
 */

const PermissoesController = require('./PermissoesController');

module.exports = {
  // Métodos de listagem
  listarUsuarios: PermissoesController.listarUsuarios,
  listarPermissoesUsuario: PermissoesController.listarPermissoesUsuario,
  listarTelas: PermissoesController.listarTelas,
  listarTiposAcesso: PermissoesController.listarTiposAcesso,
  listarNiveisAcesso: PermissoesController.listarNiveisAcesso,
  
  // Métodos de consulta
  obterPermissoesPadrao: PermissoesController.obterPermissoesPadrao,
  
  // Métodos de atualização
  atualizarPermissoes: PermissoesController.atualizarPermissoes,
  sincronizarPermissoes: PermissoesController.sincronizarPermissoes
};
