/**
 * Índice dos Controllers de Permissões,
 * Centraliza a exportação de todos os controllers organizados,
 */

const PermissoesController = require('./PermissoesController');

// Métodos de exportação (opcionais - podem ser removidos se não usar)
const PermissoesExportController = require('./PermissoesExportController');

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
  sincronizarPermissoes: PermissoesController.sincronizarPermissoes,
  
  // Métodos de Exportação (opcionais)
  exportarXLSX: PermissoesExportController?.exportarXLSX || (() => {}),
  exportarPDF: PermissoesExportController?.exportarPDF || (() => {})
};
