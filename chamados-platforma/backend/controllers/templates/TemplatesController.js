/**
 * Controller de Templates
 * Responsável por gerenciar templates de resposta
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class TemplatesController {
  
  /**
   * Listar templates
   */
  static listarTemplates = asyncHandler(async (req, res) => {
    const { tipo_chamado, categoria, ativo } = req.query;
    
    let query = `
      SELECT 
        t.id,
        t.nome,
        t.conteudo,
        t.tipo_chamado,
        t.categoria,
        t.ativo,
        t.data_criacao,
        u.nome as usuario_criador_nome
      FROM chamados_templates t
      LEFT JOIN usuarios u ON t.usuario_criador_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (tipo_chamado && tipo_chamado !== 'todos') {
      query += ' AND (t.tipo_chamado = ? OR t.tipo_chamado = "todos")';
      params.push(tipo_chamado);
    }
    
    if (categoria) {
      query += ' AND t.categoria = ?';
      params.push(categoria);
    }
    
    if (ativo !== undefined) {
      query += ' AND t.ativo = ?';
      params.push(ativo === 'true' || ativo === '1' ? 1 : 0);
    } else {
      query += ' AND t.ativo = 1';
    }
    
    query += ' ORDER BY t.nome ASC';
    
    const templates = await executeQuery(query, params);
    
    return successResponse(res, templates, 'Templates listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar template por ID
   */
  static buscarTemplatePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const templates = await executeQuery(
      'SELECT * FROM chamados_templates WHERE id = ? AND ativo = 1',
      [id]
    );
    
    if (templates.length === 0) {
      return notFoundResponse(res, 'Template não encontrado');
    }
    
    return successResponse(res, templates[0], 'Template encontrado', STATUS_CODES.OK);
  });

  /**
   * Criar template
   */
  static criarTemplate = asyncHandler(async (req, res) => {
    const { nome, conteudo, tipo_chamado, categoria } = req.body;
    const usuario_id = req.user.id;
    
    if (!nome || !conteudo) {
      return errorResponse(res, 'Nome e conteúdo são obrigatórios', STATUS_CODES.BAD_REQUEST);
    }
    
    const result = await executeQuery(
      `INSERT INTO chamados_templates 
        (nome, conteudo, tipo_chamado, categoria, usuario_criador_id) 
      VALUES (?, ?, ?, ?, ?)`,
      [nome, conteudo, tipo_chamado || 'todos', categoria || null, usuario_id]
    );
    
    const template = await executeQuery(
      'SELECT * FROM chamados_templates WHERE id = ?',
      [result.insertId]
    );
    
    return successResponse(res, template[0], 'Template criado com sucesso', STATUS_CODES.CREATED);
  });

  /**
   * Atualizar template
   */
  static atualizarTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, conteudo, tipo_chamado, categoria, ativo } = req.body;
    
    const existing = await executeQuery(
      'SELECT id FROM chamados_templates WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return notFoundResponse(res, 'Template não encontrado');
    }
    
    const updates = [];
    const params = [];
    
    if (nome !== undefined) {
      updates.push('nome = ?');
      params.push(nome);
    }
    if (conteudo !== undefined) {
      updates.push('conteudo = ?');
      params.push(conteudo);
    }
    if (tipo_chamado !== undefined) {
      updates.push('tipo_chamado = ?');
      params.push(tipo_chamado);
    }
    if (categoria !== undefined) {
      updates.push('categoria = ?');
      params.push(categoria);
    }
    if (ativo !== undefined) {
      updates.push('ativo = ?');
      params.push(ativo ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }
    
    params.push(id);
    await executeQuery(
      `UPDATE chamados_templates SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    const template = await executeQuery(
      'SELECT * FROM chamados_templates WHERE id = ?',
      [id]
    );
    
    return successResponse(res, template[0], 'Template atualizado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Excluir template (soft delete)
   */
  static excluirTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const existing = await executeQuery(
      'SELECT id FROM chamados_templates WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return notFoundResponse(res, 'Template não encontrado');
    }
    
    await executeQuery(
      'UPDATE chamados_templates SET ativo = 0 WHERE id = ?',
      [id]
    );
    
    return successResponse(res, null, 'Template excluído com sucesso', STATUS_CODES.OK);
  });
}

module.exports = TemplatesController;

