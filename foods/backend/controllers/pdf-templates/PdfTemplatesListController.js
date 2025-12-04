/**
 * Controller de Listagem de PDF Templates
 * Implementa operações de listagem e busca de templates de PDF
 */

class PdfTemplatesListController {
  /**
   * Listar templates com paginação e filtros
   */
  static async listar(req, res) {
    try {
      const { page, limit, search, tela_vinculada, ativo } = req.query;
      
      const filtros = {
        search,
        tela_vinculada,
        ativo: ativo !== undefined ? ativo === 'true' || ativo === '1' : undefined
      };

      const resultado = await PdfTemplatesListController.listarTemplates({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        filtros
      });

      res.json({
        success: true,
        data: resultado.templates,
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Erro ao listar templates:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar template por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const template = await PdfTemplatesListController.buscarTemplatePorId(parseInt(id));

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template não encontrado'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar telas disponíveis
   */
  static async listarTelasDisponiveis(req, res) {
    try {
      const telas = [
        { value: 'solicitacoes-compras', label: 'Solicitações de Compras' },
        { value: 'pedidos-compras', label: 'Pedidos de Compras' },
        { value: 'relatorio-inspecao', label: 'Relatório de Inspeção' }
      ];

      res.json({
        success: true,
        data: telas
      });
    } catch (error) {
      console.error('Erro ao listar telas disponíveis:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar template padrão por tela
   */
  static async buscarTemplatePadrao(req, res) {
    try {
      const { tela } = req.params;
      const template = await PdfTemplatesListController.buscarTemplatePadraoPorTela(tela);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template padrão não encontrado para esta tela'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Erro ao buscar template padrão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // ===== MÉTODOS DE LÓGICA DE NEGÓCIO =====

  /**
   * Listar templates com paginação e filtros
   */
  static async listarTemplates({ page = 1, limit = 20, filtros = {} }) {
    try {
      const { executeQuery } = require('../../config/database');
      
      let whereConditions = ['1=1'];
      let params = [];
      
      if (filtros.search) {
        whereConditions.push('(nome LIKE ? OR descricao LIKE ?)');
        params.push(`%${filtros.search}%`, `%${filtros.search}%`);
      }
      
      if (filtros.tela_vinculada) {
        whereConditions.push('tela_vinculada = ?');
        params.push(filtros.tela_vinculada);
      }
      
      if (filtros.ativo !== undefined) {
        whereConditions.push('ativo = ?');
        params.push(filtros.ativo ? 1 : 0);
      }
      
      const whereClause = whereConditions.join(' AND ');
      const offset = (page - 1) * limit;
      
      // Contar total de registros
      const countQuery = `SELECT COUNT(*) as total FROM pdf_templates WHERE ${whereClause}`;
      const countResult = await executeQuery(countQuery, params);
      const totalItems = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalItems / limit);
      
      // Buscar registros
      // Nota: LIMIT e OFFSET devem ser interpolados diretamente, não como placeholders
      const query = `
        SELECT 
          id, nome, descricao, tela_vinculada, html_template, css_styles,
          ativo, padrao, variaveis_disponiveis, criado_em, atualizado_em
        FROM pdf_templates
        WHERE ${whereClause}
        ORDER BY criado_em DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;
      
      const templates = await executeQuery(query, params);
      
      // Processar variaveis_disponiveis (JSON para array)
      const templatesProcessados = templates.map(template => ({
        ...template,
        variaveis_disponiveis: template.variaveis_disponiveis 
          ? (typeof template.variaveis_disponiveis === 'string' 
              ? JSON.parse(template.variaveis_disponiveis) 
              : template.variaveis_disponiveis)
          : []
      }));
      
      return {
        templates: templatesProcessados,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages
        }
      };
    } catch (error) {
      console.error('Erro no service de listar templates:', error);
      throw error;
    }
  }

  /**
   * Buscar template por ID
   */
  static async buscarTemplatePorId(id) {
    try {
      const { executeQuery } = require('../../config/database');
      
      const query = `
        SELECT 
          id, nome, descricao, tela_vinculada, html_template, css_styles,
          ativo, padrao, variaveis_disponiveis, criado_em, atualizado_em
        FROM pdf_templates
        WHERE id = ?
      `;
      
      const result = await executeQuery(query, [id]);
      
      if (result.length === 0) {
        return null;
      }
      
      const template = result[0];
      
      // Processar variaveis_disponiveis (JSON para array)
      template.variaveis_disponiveis = template.variaveis_disponiveis 
        ? (typeof template.variaveis_disponiveis === 'string' 
            ? JSON.parse(template.variaveis_disponiveis) 
            : template.variaveis_disponiveis)
        : [];
      
      return template;
    } catch (error) {
      console.error('Erro no service de buscar template:', error);
      throw error;
    }
  }

  /**
   * Buscar template padrão por tela
   */
  static async buscarTemplatePadraoPorTela(tela) {
    try {
      const { executeQuery } = require('../../config/database');
      
      const query = `
        SELECT 
          id, nome, descricao, tela_vinculada, html_template, css_styles,
          ativo, padrao, variaveis_disponiveis, criado_em, atualizado_em
        FROM pdf_templates
        WHERE tela_vinculada = ? AND padrao = 1 AND ativo = 1
        LIMIT 1
      `;
      
      const result = await executeQuery(query, [tela]);
      
      if (result.length === 0) {
        return null;
      }
      
      const template = result[0];
      
      // Processar variaveis_disponiveis (JSON para array)
      template.variaveis_disponiveis = template.variaveis_disponiveis 
        ? (typeof template.variaveis_disponiveis === 'string' 
            ? JSON.parse(template.variaveis_disponiveis) 
            : template.variaveis_disponiveis)
        : [];
      
      return template;
    } catch (error) {
      console.error('Erro no service de buscar template padrão:', error);
      throw error;
    }
  }
}

module.exports = PdfTemplatesListController;

