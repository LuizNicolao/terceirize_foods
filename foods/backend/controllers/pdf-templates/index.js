/**
 * Índice de Controllers de Templates de PDF
 * Exporta todos os controllers para uso nas rotas
 */

const PdfTemplatesListController = require('./PdfTemplatesListController');
const PdfTemplatesCRUDController = require('./PdfTemplatesCRUDController');
const PdfTemplatesPDFController = require('./PdfTemplatesPDFController');

module.exports = {
  // Métodos de Listagem
  listarTemplates: PdfTemplatesListController.listarTemplates,
  buscarTemplatePorId: PdfTemplatesListController.buscarTemplatePorId,
  buscarTemplatePadrao: PdfTemplatesListController.buscarTemplatePadrao,
  listarTelasDisponiveis: PdfTemplatesListController.listarTelasDisponiveis,
  
  // Métodos CRUD
  criarTemplate: PdfTemplatesCRUDController.criarTemplate,
  atualizarTemplate: PdfTemplatesCRUDController.atualizarTemplate,
  excluirTemplate: PdfTemplatesCRUDController.excluirTemplate,
  
  // Métodos de PDF
  gerarPDFComTemplate: PdfTemplatesPDFController.gerarPDFComTemplate
};

