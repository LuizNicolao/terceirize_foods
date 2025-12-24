/**
 * Índice dos Controllers de Chamados
 * Centraliza a exportação de todos os controllers organizados
 */

const ChamadosListController = require('./ChamadosListController');
const ChamadosCRUDController = require('./ChamadosCRUDController');
const ChamadosComentariosController = require('./ChamadosComentariosController');
const ChamadosAnexosController = require('./ChamadosAnexosController');
const ChamadosHistoricoController = require('./ChamadosHistoricoController');

module.exports = {
  // Métodos de Listagem
  listarChamados: ChamadosListController.listarChamados,
  buscarChamadoPorId: ChamadosListController.buscarChamadoPorId,
  buscarChamadosPorSistema: ChamadosListController.buscarChamadosPorSistema,
  
  // Métodos CRUD
  criarChamado: ChamadosCRUDController.criarChamado,
  atualizarChamado: ChamadosCRUDController.atualizarChamado,
  excluirChamado: ChamadosCRUDController.excluirChamado,
  
  // Métodos de Comentários
  listarComentarios: ChamadosComentariosController.listarComentarios,
  criarComentario: ChamadosComentariosController.criarComentario,
  atualizarComentario: ChamadosComentariosController.atualizarComentario,
  excluirComentario: ChamadosComentariosController.excluirComentario,
  
  // Métodos de Anexos
  listarAnexos: ChamadosAnexosController.listarAnexos,
  uploadAnexo: ChamadosAnexosController.uploadAnexo,
  downloadAnexo: ChamadosAnexosController.downloadAnexo,
  excluirAnexo: ChamadosAnexosController.excluirAnexo,
  
  // Métodos de Histórico
  listarHistorico: ChamadosHistoricoController.listarHistorico
};
