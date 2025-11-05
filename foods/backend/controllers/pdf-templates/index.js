/**
 * Controllers de PDF Templates
 * Exporta todos os controllers relacionados a templates de PDF
 */

const PdfTemplatesListController = require('./PdfTemplatesListController');
const PdfTemplatesCRUDController = require('./PdfTemplatesCRUDController');

module.exports = {
  listar: PdfTemplatesListController.listar.bind(PdfTemplatesListController),
  buscarPorId: PdfTemplatesListController.buscarPorId.bind(PdfTemplatesListController),
  listarTelasDisponiveis: PdfTemplatesListController.listarTelasDisponiveis.bind(PdfTemplatesListController),
  buscarTemplatePadrao: PdfTemplatesListController.buscarTemplatePadrao.bind(PdfTemplatesListController),
  criar: PdfTemplatesCRUDController.criar.bind(PdfTemplatesCRUDController),
  atualizar: PdfTemplatesCRUDController.atualizar.bind(PdfTemplatesCRUDController),
  excluir: PdfTemplatesCRUDController.excluir.bind(PdfTemplatesCRUDController)
};

