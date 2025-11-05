/**
 * Controller para geração de PDF usando templates
 * Usa Puppeteer para converter HTML em PDF
 */

const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');
const { notFoundResponse } = require('../../middleware/responseHandler');

class PdfTemplatesPDFController {
  /**
   * Substituir variáveis no template HTML
   */
  static substituirVariaveis(html, variaveis) {
    let htmlProcessado = html;
    
    // Substituir todas as variáveis {{variavel}}
    Object.keys(variaveis).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      const valor = variaveis[key] !== null && variaveis[key] !== undefined ? variaveis[key] : '';
      htmlProcessado = htmlProcessado.replace(regex, valor);
    });

    // Remover variáveis não substituídas
    htmlProcessado = htmlProcessado.replace(/\{\{[^}]+\}\}/g, '');

    return htmlProcessado;
  }

  /**
   * Gerar PDF usando template
   */
  static gerarPDFComTemplate = asyncHandler(async (req, res) => {
    const { tela_vinculada, template_id, dados } = req.body;

    if (!tela_vinculada || !dados) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: tela_vinculada, dados'
      });
    }

    // Buscar template
    let template;
    if (template_id) {
      // Buscar template específico
      const [templateEncontrado] = await executeQuery(
        'SELECT * FROM pdf_templates WHERE id = ? AND ativo = 1',
        [template_id]
      );
      
      if (!templateEncontrado) {
        return notFoundResponse(res, 'Template não encontrado ou inativo');
      }
      
      template = templateEncontrado;
    } else {
      // Buscar template padrão da tela
      const [templatePadrao] = await executeQuery(
        'SELECT * FROM pdf_templates WHERE tela_vinculada = ? AND ativo = 1 ORDER BY padrao DESC, criado_em DESC LIMIT 1',
        [tela_vinculada]
      );

      if (!templatePadrao) {
        return notFoundResponse(res, 'Nenhum template encontrado para esta tela');
      }

      template = templatePadrao;
    }

    // Parse JSON se existir
    if (template.variaveis_disponiveis) {
      try {
        template.variaveis_disponiveis = JSON.parse(template.variaveis_disponiveis);
      } catch (e) {
        template.variaveis_disponiveis = null;
      }
    }

    // Substituir variáveis no HTML
    let htmlProcessado = this.substituirVariaveis(template.html_template, dados);

    // Adicionar CSS se existir
    if (template.css_styles) {
      htmlProcessado = `
        <style>
          ${template.css_styles}
        </style>
        ${htmlProcessado}
      `;
    }

    // Gerar PDF usando Puppeteer
    const puppeteer = require('puppeteer');
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Configurar conteúdo HTML
      await page.setContent(htmlProcessado, {
        waitUntil: 'networkidle0'
      });

      // Gerar PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0.5cm',
          right: '0.5cm',
          bottom: '0.5cm',
          left: '0.5cm'
        },
        printBackground: true
      });

      await browser.close();

      // Retornar PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=documento_${Date.now()}.pdf`);
      res.send(pdfBuffer);

    } catch (error) {
      if (browser) {
        await browser.close();
      }
      console.error('Erro ao gerar PDF:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar PDF',
        error: error.message
      });
    }
  });
}

module.exports = PdfTemplatesPDFController;

