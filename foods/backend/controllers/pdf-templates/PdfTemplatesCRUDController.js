/**
 * Controller CRUD de PDF Templates
 * Implementa operações de criação, atualização e exclusão de templates de PDF
 */

class PdfTemplatesCRUDController {
  /**
   * Criar novo template
   */
  static async criar(req, res) {
    try {
      const dados = req.body;
      const template = await PdfTemplatesCRUDController.criarTemplate(dados);

      res.status(201).json({
        success: true,
        data: template,
        message: 'Template criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar template:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar template
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;
      
      const template = await PdfTemplatesCRUDController.atualizarTemplate(parseInt(id), dados);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template não encontrado'
        });
      }

      res.json({
        success: true,
        data: template,
        message: 'Template atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Excluir template
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;
      const sucesso = await PdfTemplatesCRUDController.excluirTemplate(parseInt(id));

      if (!sucesso) {
        return res.status(404).json({
          success: false,
          error: 'Template não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Template excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // ===== MÉTODOS DE LÓGICA DE NEGÓCIO =====

  /**
   * Criar novo template
   */
  static async criarTemplate(dados) {
    try {
      const { executeQuery } = require('../../config/database');
      
      // Preparar variaveis_disponiveis - converter array para JSON string se necessário
      let variaveisJson = null;
      if (dados.variaveis_disponiveis !== undefined && dados.variaveis_disponiveis !== null) {
        if (Array.isArray(dados.variaveis_disponiveis)) {
          variaveisJson = JSON.stringify(dados.variaveis_disponiveis);
        } else if (typeof dados.variaveis_disponiveis === 'string') {
          // Se já é string, verificar se é JSON válido
          try {
            const parsed = JSON.parse(dados.variaveis_disponiveis);
            // Se o parse foi bem-sucedido, usar a string original
            variaveisJson = dados.variaveis_disponiveis;
          } catch (e) {
            // Se não for JSON válido, tratar como array simples
            variaveisJson = JSON.stringify([dados.variaveis_disponiveis]);
          }
        } else {
          // Se for objeto, converter para JSON
          variaveisJson = JSON.stringify(dados.variaveis_disponiveis);
        }
      }
      
      // Se outro template for marcado como padrão, remover o padrão anterior
      if (dados.padrao) {
        await executeQuery(
          'UPDATE pdf_templates SET padrao = 0 WHERE tela_vinculada = ?',
          [dados.tela_vinculada]
        );
      }
      
      const query = `
        INSERT INTO pdf_templates (
          nome, descricao, tela_vinculada, html_template, css_styles,
          ativo, padrao, variaveis_disponiveis
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        dados.nome || null,
        dados.descricao || null,
        dados.tela_vinculada || null,
        dados.html_template || null,
        dados.css_styles || null,
        dados.ativo ? 1 : 0,
        dados.padrao ? 1 : 0,
        variaveisJson
      ];
      
      const result = await executeQuery(query, params);
      
      // Buscar o template criado
      const templateCriado = await PdfTemplatesCRUDController.buscarTemplatePorId(result.insertId);
      
      return templateCriado;
    } catch (error) {
      console.error('Erro no service de criar template:', error);
      throw error;
    }
  }

  /**
   * Atualizar template
   */
  static async atualizarTemplate(id, dados) {
    try {
      const { executeQuery } = require('../../config/database');
      
      // Verificar se o template existe
      const templateExistente = await PdfTemplatesCRUDController.buscarTemplatePorId(id);
      if (!templateExistente) {
        return null;
      }
      
      // Preparar variaveis_disponiveis - converter array para JSON string se necessário
      let variaveisJson = undefined;
      if (dados.variaveis_disponiveis !== undefined) {
        if (Array.isArray(dados.variaveis_disponiveis)) {
          variaveisJson = JSON.stringify(dados.variaveis_disponiveis);
        } else if (typeof dados.variaveis_disponiveis === 'string') {
          // Se já é string, verificar se é JSON válido
          try {
            const parsed = JSON.parse(dados.variaveis_disponiveis);
            // Se o parse foi bem-sucedido, usar a string original
            variaveisJson = dados.variaveis_disponiveis;
          } catch (e) {
            // Se não for JSON válido, tratar como array simples
            variaveisJson = JSON.stringify([dados.variaveis_disponiveis]);
          }
        } else if (dados.variaveis_disponiveis !== null) {
          // Se for objeto, converter para JSON
          variaveisJson = JSON.stringify(dados.variaveis_disponiveis);
        } else {
          variaveisJson = null;
        }
      } else {
        // Manter o valor existente se não foi fornecido
        variaveisJson = templateExistente.variaveis_disponiveis 
          ? (Array.isArray(templateExistente.variaveis_disponiveis)
              ? JSON.stringify(templateExistente.variaveis_disponiveis)
              : (typeof templateExistente.variaveis_disponiveis === 'string'
                  ? templateExistente.variaveis_disponiveis
                  : JSON.stringify(templateExistente.variaveis_disponiveis)))
          : null;
      }
      
      // Se outro template for marcado como padrão, remover o padrão anterior
      if (dados.padrao && dados.tela_vinculada) {
        await executeQuery(
          'UPDATE pdf_templates SET padrao = 0 WHERE tela_vinculada = ? AND id != ?',
          [dados.tela_vinculada, id]
        );
      }
      
      const camposAtualizar = [];
      const valores = [];
      
      if (dados.nome !== undefined) {
        camposAtualizar.push('nome = ?');
        valores.push(dados.nome);
      }
      
      if (dados.descricao !== undefined) {
        camposAtualizar.push('descricao = ?');
        valores.push(dados.descricao);
      }
      
      if (dados.tela_vinculada !== undefined) {
        camposAtualizar.push('tela_vinculada = ?');
        valores.push(dados.tela_vinculada);
      }
      
      if (dados.html_template !== undefined) {
        camposAtualizar.push('html_template = ?');
        valores.push(dados.html_template);
      }
      
      if (dados.css_styles !== undefined) {
        camposAtualizar.push('css_styles = ?');
        valores.push(dados.css_styles);
      }
      
      if (dados.ativo !== undefined) {
        camposAtualizar.push('ativo = ?');
        valores.push(dados.ativo ? 1 : 0);
      }
      
      if (dados.padrao !== undefined) {
        camposAtualizar.push('padrao = ?');
        valores.push(dados.padrao ? 1 : 0);
      }
      
      if (variaveisJson !== undefined) {
        camposAtualizar.push('variaveis_disponiveis = ?');
        valores.push(variaveisJson);
      }
      
      if (camposAtualizar.length === 0) {
        return templateExistente;
      }
      
      valores.push(id);
      
      const query = `
        UPDATE pdf_templates
        SET ${camposAtualizar.join(', ')}, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await executeQuery(query, valores);
      
      // Buscar o template atualizado
      const templateAtualizado = await PdfTemplatesCRUDController.buscarTemplatePorId(id);
      
      return templateAtualizado;
    } catch (error) {
      console.error('Erro no service de atualizar template:', error);
      throw error;
    }
  }

  /**
   * Excluir template
   */
  static async excluirTemplate(id) {
    try {
      const { executeQuery } = require('../../config/database');
      
      // Verificar se o template existe
      const template = await PdfTemplatesCRUDController.buscarTemplatePorId(id);
      if (!template) {
        return false;
      }
      
      const query = 'DELETE FROM pdf_templates WHERE id = ?';
      await executeQuery(query, [id]);
      
      return true;
    } catch (error) {
      console.error('Erro no service de excluir template:', error);
      throw error;
    }
  }

  /**
   * Buscar template por ID (helper)
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
}

module.exports = PdfTemplatesCRUDController;

