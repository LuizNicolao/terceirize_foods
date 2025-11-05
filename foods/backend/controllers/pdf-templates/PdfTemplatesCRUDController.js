/**
 * Controller CRUD de Templates de PDF
 * Responsável por criar, atualizar e excluir templates
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

class PdfTemplatesCRUDController {
  
  /**
   * Criar novo template de PDF
   */
  static criarTemplate = asyncHandler(async (req, res) => {
    const {
      nome,
      descricao,
      tela_vinculada,
      html_template,
      css_styles,
      variaveis_disponiveis,
      ativo = 1,
      padrao = 0
    } = req.body;
    const usuario_id = req.user.id;

    // Validar campos obrigatórios
    if (!nome || !tela_vinculada || !html_template) {
      return errorResponse(res, 'Campos obrigatórios: nome, tela_vinculada, html_template', STATUS_CODES.BAD_REQUEST);
    }

    // Se for marcado como padrão, desmarcar outros padrões da mesma tela
    if (padrao) {
      await executeQuery(
        'UPDATE pdf_templates SET padrao = 0 WHERE tela_vinculada = ?',
        [tela_vinculada]
      );
    }

    // Inserir template
    const result = await executeQuery(
      `INSERT INTO pdf_templates (
        nome, descricao, tela_vinculada, html_template, css_styles,
        variaveis_disponiveis, ativo, padrao, criado_por, criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nome,
        descricao || null,
        tela_vinculada,
        html_template,
        css_styles || null,
        variaveis_disponiveis ? JSON.stringify(variaveis_disponiveis) : null,
        ativo ? 1 : 0,
        padrao ? 1 : 0,
        usuario_id
      ]
    );

    // Buscar template criado
    const [template] = await executeQuery(
      'SELECT * FROM pdf_templates WHERE id = ?',
      [result.insertId]
    );

    // Parse JSON se existir
    if (template.variaveis_disponiveis) {
      template.variaveis_disponiveis = JSON.parse(template.variaveis_disponiveis);
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(template);

    return successResponse(res, data, 'Template de PDF criado com sucesso', STATUS_CODES.CREATED);
  });

  /**
   * Atualizar template de PDF
   */
  static atualizarTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      nome,
      descricao,
      tela_vinculada,
      html_template,
      css_styles,
      variaveis_disponiveis,
      ativo,
      padrao
    } = req.body;
    const usuario_id = req.user.id;

    // Verificar se template existe
    const [templateExistente] = await executeQuery(
      'SELECT * FROM pdf_templates WHERE id = ?',
      [id]
    );

    if (!templateExistente) {
      return notFoundResponse(res, 'Template de PDF não encontrado');
    }

    // Se for marcado como padrão, desmarcar outros padrões da mesma tela
    if (padrao && templateExistente.tela_vinculada === tela_vinculada) {
      await executeQuery(
        'UPDATE pdf_templates SET padrao = 0 WHERE tela_vinculada = ? AND id != ?',
        [tela_vinculada, id]
      );
    }

    // Atualizar template
    await executeQuery(
      `UPDATE pdf_templates SET
        nome = ?,
        descricao = ?,
        tela_vinculada = ?,
        html_template = ?,
        css_styles = ?,
        variaveis_disponiveis = ?,
        ativo = ?,
        padrao = ?,
        atualizado_por = ?,
        atualizado_em = NOW()
      WHERE id = ?`,
      [
        nome || templateExistente.nome,
        descricao !== undefined ? descricao : templateExistente.descricao,
        tela_vinculada || templateExistente.tela_vinculada,
        html_template || templateExistente.html_template,
        css_styles !== undefined ? css_styles : templateExistente.css_styles,
        variaveis_disponiveis ? JSON.stringify(variaveis_disponiveis) : templateExistente.variaveis_disponiveis,
        ativo !== undefined ? (ativo ? 1 : 0) : templateExistente.ativo,
        padrao !== undefined ? (padrao ? 1 : 0) : templateExistente.padrao,
        usuario_id,
        id
      ]
    );

    // Buscar template atualizado
    const [template] = await executeQuery(
      'SELECT * FROM pdf_templates WHERE id = ?',
      [id]
    );

    // Parse JSON se existir
    if (template.variaveis_disponiveis) {
      template.variaveis_disponiveis = JSON.parse(template.variaveis_disponiveis);
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(template);

    return successResponse(res, data, 'Template de PDF atualizado com sucesso');
  });

  /**
   * Excluir template de PDF
   */
  static excluirTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se template existe
    const [template] = await executeQuery(
      'SELECT * FROM pdf_templates WHERE id = ?',
      [id]
    );

    if (!template) {
      return notFoundResponse(res, 'Template de PDF não encontrado');
    }

    // Excluir template
    await executeQuery(
      'DELETE FROM pdf_templates WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Template de PDF excluído com sucesso');
  });
}

module.exports = PdfTemplatesCRUDController;

