/**
 * Controller para geração de PDF de Fichas de Homologação
 */

const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');
const { notFoundResponse } = require('../../middleware/responseHandler');
const fs = require('fs');
const path = require('path');

class FichaHomologacaoPDFController {
  /**
   * Gerar PDF da ficha de homologação
   */
  static gerarPDF = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { template_id } = req.query; // Template ID opcional

    // Buscar dados completos da ficha de homologação
    const [ficha] = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_nome_fantasia,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome,
        u.email as avaliador_email,
        u2.nome as aprovador_nome,
        u2.email as aprovador_email
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      LEFT JOIN usuarios u2 ON fh.aprovador_id = u2.id
      WHERE fh.id = ?`,
      [id]
    );

    if (!ficha) {
      return notFoundResponse(res, 'Ficha de homologação não encontrada');
    }

    // Verificar se foi solicitado uso de template personalizado
    if (template_id) {
      const PdfTemplatesPDFController = require('../pdf-templates/PdfTemplatesPDFController');
      
      // Buscar template
      const [template] = await executeQuery(
        `SELECT id, nome, html_template, css_styles, variaveis_disponiveis
         FROM pdf_templates
         WHERE id = ? AND tela_vinculada = 'ficha-homologacao' AND ativo = 1`,
        [template_id]
      );

      if (template) {
        // Processar variaveis_disponiveis
        const variaveisDisponiveis = template.variaveis_disponiveis 
          ? (typeof template.variaveis_disponiveis === 'string' 
              ? JSON.parse(template.variaveis_disponiveis) 
              : template.variaveis_disponiveis)
          : [];

        // Preparar dados para substituição
        const dados = PdfTemplatesPDFController.prepararDados(
          'ficha-homologacao',
          ficha,
          null,
          null
        );

        // Renderizar template
        const htmlRenderizado = PdfTemplatesPDFController.renderizarTemplate(
          template.html_template,
          dados,
          variaveisDisponiveis
        );

        // Gerar HTML completo com CSS
        const htmlCompleto = PdfTemplatesPDFController.gerarHTMLCompleto(
          htmlRenderizado,
          template.css_styles
        );

        // Gerar PDF usando Puppeteer
        const pdfBuffer = await PdfTemplatesPDFController.gerarPDFDeHTML(htmlCompleto);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=ficha_homologacao_${ficha.id}.pdf`);
        res.send(pdfBuffer);
        return;
      }
    }

    // Se não houver template_id ou template não encontrado, usar geração padrão com PDFKit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ 
      margin: 30,
      size: 'A4'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=ficha_homologacao_${ficha.id}.pdf`);
    doc.pipe(res);

    // Função auxiliar para formatar data
    const formatDate = (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('pt-BR');
    };

    // Função auxiliar para formatar número
    const formatNumber = (num) => {
      if (num === null || num === undefined) return '-';
      const valor = parseFloat(num);
      if (isNaN(valor)) return '-';
      // Se for número inteiro, mostrar sem decimais; caso contrário, mostrar até 3 casas decimais
      return valor % 1 === 0 ? valor.toString() : valor.toFixed(3).replace(/\.?0+$/, '');
    };

    const leftMargin = 30;
    const rightMargin = 30;
    const pageWidth = 595; // A4 width
    const usableWidth = pageWidth - leftMargin - rightMargin;
    const tablePadding = 6;
    const cellPadding = 8;
    const fontSize = 8;
    const sectionTitleFontSize = 8;
    const headerFontSize = 8;

    // ========== CABEÇALHO ==========
    const headerY = 30;
    doc.fontSize(headerFontSize).font('Helvetica-Bold').fillColor('black');
    const headerText = 'FICHA DE HOMOLOGAÇÃO';
    const headerWidth = doc.widthOfString(headerText);
    doc.text(headerText, (pageWidth - headerWidth) / 2, headerY);
    
    // Linha inferior do cabeçalho
    doc.moveTo(leftMargin, headerY + 15)
       .lineTo(pageWidth - rightMargin, headerY + 15)
       .lineWidth(2)
       .stroke();
    
    doc.y = headerY + 35;

    // ========== SEÇÃO A: INFORMAÇÕES BÁSICAS ==========
    if (doc.y > 750) {
      doc.addPage();
      doc.y = 30;
    }

    // Título da seção
    const sectionAY = doc.y;
    doc.rect(leftMargin, sectionAY, usableWidth, 20)
       .fillColor('#f0f0f0')
       .fill()
       .fillColor('black');
    
    // Borda esquerda verde
    doc.rect(leftMargin, sectionAY, 4, 20)
       .fillColor('#16a34a')
       .fill()
       .fillColor('black');
    
    doc.fontSize(sectionTitleFontSize).font('Helvetica-Bold');
    doc.text('A) Informações Básicas', leftMargin + 12, sectionAY + 6);
    doc.y = sectionAY + 28;

    // Tabela de informações básicas
    const tableAY = doc.y;
    const tableAWidth = usableWidth;
    const colWidthA = tableAWidth / 4; // 4 colunas

    // Desenhar tabela
    const drawTableRow = (y, label1, value1, label2, value2) => {
      // Linha superior
      doc.moveTo(leftMargin, y).lineTo(leftMargin + tableAWidth, y).stroke();
      
      // Coluna 1 (Label)
      doc.rect(leftMargin, y, colWidthA, 18)
         .fillColor('#f5f5f5')
         .fill()
         .fillColor('black');
      doc.fontSize(fontSize).font('Helvetica-Bold');
      doc.text(label1, leftMargin + cellPadding, y + 6, { width: colWidthA - (cellPadding * 2) });
      
      // Coluna 2 (Value)
      doc.rect(leftMargin + colWidthA, y, colWidthA, 18)
         .fillColor('#ffffff')
         .fill()
         .fillColor('black');
      doc.font('Helvetica');
      doc.text(value1 || '-', leftMargin + colWidthA + cellPadding, y + 6, { width: colWidthA - (cellPadding * 2) });
      
      // Coluna 3 (Label)
      doc.rect(leftMargin + (colWidthA * 2), y, colWidthA, 18)
         .fillColor('#f5f5f5')
         .fill()
         .fillColor('black');
      doc.font('Helvetica-Bold');
      doc.text(label2, leftMargin + (colWidthA * 2) + cellPadding, y + 6, { width: colWidthA - (cellPadding * 2) });
      
      // Coluna 4 (Value)
      doc.rect(leftMargin + (colWidthA * 3), y, colWidthA, 18)
         .fillColor('#ffffff')
         .fill()
         .fillColor('black');
      doc.font('Helvetica');
      doc.text(value2 || '-', leftMargin + (colWidthA * 3) + cellPadding, y + 6, { width: colWidthA - (cellPadding * 2) });
      
      // Linha inferior
      doc.moveTo(leftMargin, y + 18).lineTo(leftMargin + tableAWidth, y + 18).stroke();
    };

    const tipoText = ficha.tipo === 'NOVO_PRODUTO' ? 'Novo Produto' : 'Reavaliação';
    drawTableRow(tableAY, 'ID', ficha.id?.toString(), 'Tipo', tipoText);
    
    drawTableRow(tableAY + 18, 'Data da Análise', formatDate(ficha.data_analise), 'Avaliador', ficha.avaliador_nome);
    
    const nomeGenericoText = ficha.nome_generico_codigo && ficha.nome_generico_nome
      ? `${ficha.nome_generico_codigo} - ${ficha.nome_generico_nome}`
      : (ficha.nome_generico_nome || '-');
    
    const unidadeMedidaText = ficha.unidade_medida_sigla || ficha.unidade_medida_nome || '-';
    
    // Linha com Nome Genérico e Unidade de Medida lado a lado (usando 5 colunas)
    const colWidth5 = tableAWidth / 5;
    doc.moveTo(leftMargin, tableAY + 36).lineTo(leftMargin + tableAWidth, tableAY + 36).stroke();
    
    // Nome Genérico - Label
    doc.rect(leftMargin, tableAY + 36, colWidth5, 18).fillColor('#f5f5f5').fill().fillColor('black');
    doc.fontSize(fontSize).font('Helvetica-Bold');
    doc.text('Nome Genérico', leftMargin + cellPadding, tableAY + 42, { width: colWidth5 - (cellPadding * 2) });
    
    // Nome Genérico - Valor (2 colunas)
    doc.rect(leftMargin + colWidth5, tableAY + 36, colWidth5 * 2, 18).fillColor('#ffffff').fill().fillColor('black');
    doc.font('Helvetica');
    doc.text(nomeGenericoText, leftMargin + colWidth5 + cellPadding, tableAY + 42, { width: (colWidth5 * 2) - (cellPadding * 2) });
    
    // Unidade de Medida - Label
    doc.rect(leftMargin + (colWidth5 * 3), tableAY + 36, colWidth5, 18).fillColor('#f5f5f5').fill().fillColor('black');
    doc.font('Helvetica-Bold');
    doc.text('Unidade', leftMargin + (colWidth5 * 3) + cellPadding, tableAY + 42, { width: colWidth5 - (cellPadding * 2) });
    
    // Unidade de Medida - Valor
    doc.rect(leftMargin + (colWidth5 * 4), tableAY + 36, colWidth5, 18).fillColor('#ffffff').fill().fillColor('black');
    doc.font('Helvetica');
    doc.text(unidadeMedidaText, leftMargin + (colWidth5 * 4) + cellPadding, tableAY + 42, { width: colWidth5 - (cellPadding * 2) });
    doc.moveTo(leftMargin, tableAY + 54).lineTo(leftMargin + tableAWidth, tableAY + 54).stroke();

    // PDF da Avaliação Antiga (se for reavaliação)
    if (ficha.tipo === 'REAVALIACAO' && ficha.pdf_avaliacao_antiga) {
      doc.moveTo(leftMargin, tableAY + 54).lineTo(leftMargin + tableAWidth, tableAY + 54).stroke();
      doc.rect(leftMargin, tableAY + 54, colWidthA, 18).fillColor('#f5f5f5').fill().fillColor('black');
      doc.fontSize(fontSize).font('Helvetica-Bold');
      doc.text('PDF da Avaliação Antiga', leftMargin + cellPadding, tableAY + 60, { width: colWidthA - (cellPadding * 2) });
      doc.rect(leftMargin + colWidthA, tableAY + 54, colWidthA * 3, 18).fillColor('#ffffff').fill().fillColor('black');
      doc.font('Helvetica');
      doc.text(ficha.pdf_avaliacao_antiga, leftMargin + colWidthA + cellPadding, tableAY + 60, { width: (colWidthA * 3) - (cellPadding * 2) });
      doc.moveTo(leftMargin, tableAY + 72).lineTo(leftMargin + tableAWidth, tableAY + 72).stroke();
      doc.y = tableAY + 90;
    } else {
      doc.y = tableAY + 72;
    }

    doc.moveDown(0.5);

    // ========== SEÇÃO B: INFORMAÇÕES DO PRODUTO ==========
    if (doc.y > 750) {
      doc.addPage();
      doc.y = 30;
    }

    const sectionBY = doc.y;
    doc.rect(leftMargin, sectionBY, usableWidth, 20)
       .fillColor('#f0f0f0')
       .fill()
       .fillColor('black');
    
    doc.rect(leftMargin, sectionBY, 4, 20)
       .fillColor('#16a34a')
       .fill()
       .fillColor('black');
    
    doc.fontSize(sectionTitleFontSize).font('Helvetica-Bold');
    doc.text('B) Informações do Produto', leftMargin + 12, sectionBY + 6);
    doc.y = sectionBY + 28;

    const tableBY = doc.y;
    
    drawTableRow(tableBY, 'Marca', ficha.marca, 'Fabricante', ficha.fabricante);
    drawTableRow(tableBY + 18, 'Fornecedor', ficha.fornecedor_nome || ficha.fornecedor_nome_fantasia, '', '');
    
    // Composição (colspan)
    doc.moveTo(leftMargin, tableBY + 36).lineTo(leftMargin + tableAWidth, tableBY + 36).stroke();
    doc.rect(leftMargin, tableBY + 36, colWidthA, 18).fillColor('#f5f5f5').fill().fillColor('black');
    doc.fontSize(fontSize).font('Helvetica-Bold');
    doc.text('Composição', leftMargin + cellPadding, tableBY + 42, { width: colWidthA - (cellPadding * 2) });
    doc.rect(leftMargin + colWidthA, tableBY + 36, colWidthA * 3, 18).fillColor('#ffffff').fill().fillColor('black');
    doc.font('Helvetica');
    const composicaoText = ficha.composicao || '-';
    doc.text(composicaoText.substring(0, 100) + (composicaoText.length > 100 ? '...' : ''), leftMargin + colWidthA + cellPadding, tableBY + 42, { width: (colWidthA * 3) - (cellPadding * 2) });
    doc.moveTo(leftMargin, tableBY + 54).lineTo(leftMargin + tableAWidth, tableBY + 54).stroke();
    
    // Lote, Fabricação, Validade (3 colunas na mesma linha)
    const colWidth3 = tableAWidth / 3;
    doc.moveTo(leftMargin, tableBY + 54).lineTo(leftMargin + tableAWidth, tableBY + 54).stroke();
    
    // Lote
    doc.rect(leftMargin, tableBY + 54, colWidth3, 18).fillColor('#f5f5f5').fill().fillColor('black');
    doc.fontSize(fontSize).font('Helvetica-Bold');
    doc.text('Lote', leftMargin + cellPadding, tableBY + 60, { width: colWidth3 - (cellPadding * 2) });
    doc.rect(leftMargin, tableBY + 72, colWidth3, 18).fillColor('#ffffff').fill().fillColor('black');
    doc.font('Helvetica');
    doc.text(ficha.lote || '-', leftMargin + cellPadding, tableBY + 78, { width: colWidth3 - (cellPadding * 2) });
    
    // Data de Fabricação
    doc.rect(leftMargin + colWidth3, tableBY + 54, colWidth3, 18).fillColor('#f5f5f5').fill().fillColor('black');
    doc.font('Helvetica-Bold');
    doc.text('Data de Fabricação', leftMargin + colWidth3 + cellPadding, tableBY + 60, { width: colWidth3 - (cellPadding * 2) });
    doc.rect(leftMargin + colWidth3, tableBY + 72, colWidth3, 18).fillColor('#ffffff').fill().fillColor('black');
    doc.font('Helvetica');
    doc.text(formatDate(ficha.fabricacao), leftMargin + colWidth3 + cellPadding, tableBY + 78, { width: colWidth3 - (cellPadding * 2) });
    
    // Data de Validade
    doc.rect(leftMargin + (colWidth3 * 2), tableBY + 54, colWidth3, 18).fillColor('#f5f5f5').fill().fillColor('black');
    doc.font('Helvetica-Bold');
    doc.text('Data de Validade', leftMargin + (colWidth3 * 2) + cellPadding, tableBY + 60, { width: colWidth3 - (cellPadding * 2) });
    doc.rect(leftMargin + (colWidth3 * 2), tableBY + 72, colWidth3, 18).fillColor('#ffffff').fill().fillColor('black');
    doc.font('Helvetica');
    doc.text(formatDate(ficha.validade), leftMargin + (colWidth3 * 2) + cellPadding, tableBY + 78, { width: colWidth3 - (cellPadding * 2) });
    
    doc.moveTo(leftMargin, tableBY + 72).lineTo(leftMargin + tableAWidth, tableBY + 72).stroke();
    doc.moveTo(leftMargin, tableBY + 90).lineTo(leftMargin + tableAWidth, tableBY + 90).stroke();

    doc.y = tableBY + 108;
    doc.moveDown(0.5);

    // ========== SEÇÃO C: AVALIAÇÕES DE QUALIDADE ==========
    if (doc.y > 750) {
      doc.addPage();
      doc.y = 30;
    }

    const sectionCY = doc.y;
    doc.rect(leftMargin, sectionCY, usableWidth, 20)
       .fillColor('#f0f0f0')
       .fill()
       .fillColor('black');
    
    doc.rect(leftMargin, sectionCY, 4, 20)
       .fillColor('#16a34a')
       .fill()
       .fillColor('black');
    
    doc.fontSize(sectionTitleFontSize).font('Helvetica-Bold');
    doc.text('C) Avaliações de Qualidade', leftMargin + 12, sectionCY + 6);
    doc.y = sectionCY + 28;

    // Tabela de Avaliações
    const tableCY = doc.y;
    const tableCWidth = usableWidth;
    const colWidthsC = {
      criterio: tableCWidth * 0.20,
      bom: tableCWidth * 0.12,
      regular: tableCWidth * 0.12,
      ruim: tableCWidth * 0.12,
      valorObs: tableCWidth * 0.44
    };

    // Cabeçalho da tabela
    const headerCY = tableCY;
    doc.rect(leftMargin, headerCY, colWidthsC.criterio, 18)
       .fillColor('#f5f5f5')
       .fill()
       .fillColor('black');
    doc.fontSize(fontSize).font('Helvetica-Bold');
    doc.text('Critério', leftMargin + cellPadding, headerCY + 6, { width: colWidthsC.criterio - (cellPadding * 2) });
    
    doc.rect(leftMargin + colWidthsC.criterio, headerCY, colWidthsC.bom, 18)
       .fillColor('#f5f5f5')
       .fill()
       .fillColor('black');
    doc.text('Bom', leftMargin + colWidthsC.criterio, headerCY + 6, { width: colWidthsC.bom, align: 'center' });
    
    doc.rect(leftMargin + colWidthsC.criterio + colWidthsC.bom, headerCY, colWidthsC.regular, 18)
       .fillColor('#f5f5f5')
       .fill()
       .fillColor('black');
    doc.text('Regular', leftMargin + colWidthsC.criterio + colWidthsC.bom, headerCY + 6, { width: colWidthsC.regular, align: 'center' });
    
    doc.rect(leftMargin + colWidthsC.criterio + colWidthsC.bom + colWidthsC.regular, headerCY, colWidthsC.ruim, 18)
       .fillColor('#f5f5f5')
       .fill()
       .fillColor('black');
    doc.text('Ruim', leftMargin + colWidthsC.criterio + colWidthsC.bom + colWidthsC.regular, headerCY + 6, { width: colWidthsC.ruim, align: 'center' });
    
    doc.rect(leftMargin + colWidthsC.criterio + colWidthsC.bom + colWidthsC.regular + colWidthsC.ruim, headerCY, colWidthsC.valorObs, 18)
       .fillColor('#f5f5f5')
       .fill()
       .fillColor('black');
    doc.text('Valor (kg) / Observação', leftMargin + colWidthsC.criterio + colWidthsC.bom + colWidthsC.regular + colWidthsC.ruim + cellPadding, headerCY + 6, { width: colWidthsC.valorObs - (cellPadding * 2) });

    // Linha separadora
    doc.moveTo(leftMargin, headerCY + 18).lineTo(leftMargin + tableCWidth, headerCY + 18).stroke();

    // Dados da tabela
    const avaliacoes = [
      { criterio: 'Peso', valor: ficha.peso, valorNum: ficha.peso_valor, observacao: null, unidade: 'KG' },
      { criterio: 'Peso Cru', valor: ficha.peso_cru, valorNum: ficha.peso_cru_valor, observacao: null, unidade: 'KG' },
      { criterio: 'Peso Cozido', valor: ficha.peso_cozido, valorNum: ficha.peso_cozido_valor, observacao: null, unidade: 'KG' },
      { criterio: 'Fator de Cocção', valor: ficha.fator_coccao, valorNum: ficha.fator_coccao_valor, observacao: null },
      { criterio: 'Cor', valor: ficha.cor, valorNum: null, observacao: ficha.cor_observacao },
      { criterio: 'Odor', valor: ficha.odor, valorNum: null, observacao: ficha.odor_observacao },
      { criterio: 'Sabor', valor: ficha.sabor, valorNum: null, observacao: ficha.sabor_observacao },
      { criterio: 'Aparência', valor: ficha.aparencia, valorNum: null, observacao: ficha.aparencia_observacao }
    ];

    let rowY = headerCY + 18;
    const rowHeight = 18;

    avaliacoes.forEach((avaliacao) => {
      if (rowY > 750) {
        doc.addPage();
        rowY = 30;
        // Reimprimir cabeçalho
        doc.rect(leftMargin, rowY, colWidthsC.criterio, 18).fillColor('#f5f5f5').fill().fillColor('black');
        doc.fontSize(fontSize).font('Helvetica-Bold');
        doc.text('Critério', leftMargin + cellPadding, rowY + 6, { width: colWidthsC.criterio - (cellPadding * 2) });
        doc.rect(leftMargin + colWidthsC.criterio, rowY, colWidthsC.bom, 18).fillColor('#f5f5f5').fill().fillColor('black');
        doc.text('Bom', leftMargin + colWidthsC.criterio, rowY + 6, { width: colWidthsC.bom, align: 'center' });
        doc.rect(leftMargin + colWidthsC.criterio + colWidthsC.bom, rowY, colWidthsC.regular, 18).fillColor('#f5f5f5').fill().fillColor('black');
        doc.text('Regular', leftMargin + colWidthsC.criterio + colWidthsC.bom, rowY + 6, { width: colWidthsC.regular, align: 'center' });
        doc.rect(leftMargin + colWidthsC.criterio + colWidthsC.bom + colWidthsC.regular, rowY, colWidthsC.ruim, 18).fillColor('#f5f5f5').fill().fillColor('black');
        doc.text('Ruim', leftMargin + colWidthsC.criterio + colWidthsC.bom + colWidthsC.regular, rowY + 6, { width: colWidthsC.ruim, align: 'center' });
        doc.rect(leftMargin + colWidthsC.criterio + colWidthsC.bom + colWidthsC.regular + colWidthsC.ruim, rowY, colWidthsC.valorObs, 18).fillColor('#f5f5f5').fill().fillColor('black');
        doc.text('Valor (kg) / Observação', leftMargin + colWidthsC.criterio + colWidthsC.bom + colWidthsC.regular + colWidthsC.ruim + cellPadding, rowY + 6, { width: colWidthsC.valorObs - (cellPadding * 2) });
        doc.moveTo(leftMargin, rowY + 18).lineTo(leftMargin + tableCWidth, rowY + 18).stroke();
        rowY += 18;
      }

      // Linha da tabela
      doc.rect(leftMargin, rowY, tableCWidth, rowHeight)
         .fillColor('#ffffff')
         .fill()
         .fillColor('black');
      
      // Linha separadora
      doc.moveTo(leftMargin, rowY + rowHeight).lineTo(leftMargin + tableCWidth, rowY + rowHeight).stroke();

      // Critério
      doc.fontSize(fontSize).font('Helvetica');
      doc.text(avaliacao.criterio, leftMargin + cellPadding, rowY + 6, { width: colWidthsC.criterio - (cellPadding * 2) });

      // Marcar avaliação (Bom/Regular/Ruim) com X centralizado abaixo do texto
      let x = leftMargin + colWidthsC.criterio;
      const textY = rowY + 6; // Posição do texto "Bom", "Regular", "Ruim"
      const markY = rowY + 12; // Posição do X (abaixo do texto)
      
      if (avaliacao.valor === 'BOM') {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#10B981');
        const bomCenterX = x + (colWidthsC.bom / 2);
        const bomTextWidth = doc.widthOfString('X');
        doc.text('X', bomCenterX - (bomTextWidth / 2), markY);
      } else if (avaliacao.valor === 'REGULAR') {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#F59E0B');
        const regularCenterX = x + colWidthsC.bom + (colWidthsC.regular / 2);
        const regularTextWidth = doc.widthOfString('X');
        doc.text('X', regularCenterX - (regularTextWidth / 2), markY);
      } else if (avaliacao.valor === 'RUIM') {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#EF4444');
        const ruimCenterX = x + colWidthsC.bom + colWidthsC.regular + (colWidthsC.ruim / 2);
        const ruimTextWidth = doc.widthOfString('X');
        doc.text('X', ruimCenterX - (ruimTextWidth / 2), markY);
      }
      doc.fillColor('black');

      // Valor ou Observação
      x = leftMargin + colWidthsC.criterio + colWidthsC.bom + colWidthsC.regular + colWidthsC.ruim;
      let valorObsText = '-';
      
      if (avaliacao.valorNum !== null && avaliacao.valorNum !== undefined) {
        valorObsText = formatNumber(avaliacao.valorNum);
        if (avaliacao.unidade) {
          valorObsText += ` ${avaliacao.unidade}`;
        }
      } else if (avaliacao.observacao) {
        valorObsText = avaliacao.observacao;
      }
      
      doc.fontSize(fontSize).font('Helvetica');
      doc.text(valorObsText, x + cellPadding, rowY + 6, { width: colWidthsC.valorObs - (cellPadding * 2) });

      rowY += rowHeight;
    });

    doc.y = rowY + 10;
    doc.moveDown(0.5);

    // ========== SEÇÃO D: CONCLUSÃO E DOCUMENTAÇÃO ==========
    if (doc.y > 750) {
      doc.addPage();
      doc.y = 30;
    }

    const sectionDY = doc.y;
    doc.rect(leftMargin, sectionDY, usableWidth, 20)
       .fillColor('#f0f0f0')
       .fill()
       .fillColor('black');
    
    doc.rect(leftMargin, sectionDY, 4, 20)
       .fillColor('#16a34a')
       .fill()
       .fillColor('black');
    
    doc.fontSize(sectionTitleFontSize).font('Helvetica-Bold');
    doc.text('D) Conclusão e Documentação', leftMargin + 12, sectionDY + 6);
    doc.y = sectionDY + 28;

    const tableDY = doc.y;
    
    // Documentação Fotográfica - Título
    doc.moveTo(leftMargin, tableDY).lineTo(leftMargin + tableAWidth, tableDY).stroke();
    doc.rect(leftMargin, tableDY, tableAWidth, 18).fillColor('#f5f5f5').fill().fillColor('black');
    doc.fontSize(fontSize).font('Helvetica-Bold');
    doc.text('Documentação Fotográfica', leftMargin + cellPadding, tableDY + 6, { width: tableAWidth - (cellPadding * 2) });
    doc.moveTo(leftMargin, tableDY + 18).lineTo(leftMargin + tableAWidth, tableDY + 18).stroke();
    
    // Adicionar imagens
    doc.y = tableDY + 28;
    const imageHeight = 80; // Altura de cada imagem
    const imageWidth = (usableWidth - 20) / 3; // Largura de cada imagem (3 colunas com espaçamento)
    const imageSpacing = 10;
    const foodsRoot = path.join(__dirname, '../..');
    
    // Função auxiliar para adicionar imagem
    const addImageIfExists = (imagePath, label, x, y) => {
      if (!imagePath) return false;
      
      try {
        const caminhoCompleto = path.join(foodsRoot, imagePath);
        if (fs.existsSync(caminhoCompleto)) {
          // Adicionar label acima da imagem
          doc.fontSize(7).font('Helvetica-Bold').fillColor('black');
          doc.text(label, x, y, { width: imageWidth, align: 'center' });
          
          // Adicionar imagem (redimensionar para caber no espaço)
          doc.image(caminhoCompleto, x, y + 10, {
            width: imageWidth,
            height: imageHeight,
            fit: [imageWidth, imageHeight],
            align: 'center'
          });
          
          // Borda ao redor da imagem
          doc.rect(x, y + 10, imageWidth, imageHeight)
             .lineWidth(0.5)
             .stroke();
          
          return true;
        }
      } catch (error) {
        // Se houver erro ao carregar imagem, apenas não adicionar
      }
      return false;
    };
    
    // Adicionar as três fotos lado a lado
    let currentX = leftMargin;
    const startY = doc.y;
    
    if (ficha.foto_embalagem) {
      addImageIfExists(ficha.foto_embalagem, 'Foto da Embalagem', currentX, startY);
      currentX += imageWidth + imageSpacing;
    }
    
    if (ficha.foto_produto_cru) {
      addImageIfExists(ficha.foto_produto_cru, 'Foto do Produto Cru', currentX, startY);
      currentX += imageWidth + imageSpacing;
    }
    
    if (ficha.foto_produto_cozido) {
      addImageIfExists(ficha.foto_produto_cozido, 'Foto do Produto Cozido', currentX, startY);
    }
    
    // Se não houver fotos, mostrar mensagem
    if (!ficha.foto_embalagem && !ficha.foto_produto_cru && !ficha.foto_produto_cozido) {
      doc.fontSize(fontSize).font('Helvetica').fillColor('black');
      doc.text('Nenhuma foto disponível', leftMargin + cellPadding, startY + 20, { width: tableAWidth - (cellPadding * 2) });
      doc.y = startY + 40;
    } else {
      doc.y = startY + imageHeight + 30;
    }
    
    doc.moveDown(0.5);

    // Conclusão
    doc.moveTo(leftMargin, tableDY + 18).lineTo(leftMargin + tableAWidth, tableDY + 18).stroke();
    doc.rect(leftMargin, tableDY + 18, colWidthA, 18).fillColor('#f5f5f5').fill().fillColor('black');
    doc.fontSize(fontSize).font('Helvetica-Bold');
    doc.text('Conclusão', leftMargin + cellPadding, tableDY + 24, { width: colWidthA - (cellPadding * 2) });
    doc.rect(leftMargin + colWidthA, tableDY + 18, colWidthA * 3, 18).fillColor('#ffffff').fill().fillColor('black');
    doc.font('Helvetica');
    const conclusaoText = ficha.conclusao || '-';
    doc.text(conclusaoText.substring(0, 150) + (conclusaoText.length > 150 ? '...' : ''), leftMargin + colWidthA + cellPadding, tableDY + 24, { width: (colWidthA * 3) - (cellPadding * 2) });
    doc.moveTo(leftMargin, tableDY + 36).lineTo(leftMargin + tableAWidth, tableDY + 36).stroke();

    // Resultado Final
    const resultadoLabels = {
      'APROVADO': 'Aprovado',
      'APROVADO_COM_RESSALVAS': 'Aprovado com Ressalvas',
      'REPROVADO': 'Reprovado'
    };
    
    doc.moveTo(leftMargin, tableDY + 36).lineTo(leftMargin + tableAWidth, tableDY + 36).stroke();
    doc.rect(leftMargin, tableDY + 36, colWidthA, 18).fillColor('#f5f5f5').fill().fillColor('black');
    doc.fontSize(fontSize).font('Helvetica-Bold');
    doc.text('Resultado Final', leftMargin + cellPadding, tableDY + 42, { width: colWidthA - (cellPadding * 2) });
    doc.rect(leftMargin + colWidthA, tableDY + 36, colWidthA * 3, 18).fillColor('#ffffff').fill().fillColor('black');
    doc.font('Helvetica');
    doc.text(ficha.resultado_final ? resultadoLabels[ficha.resultado_final] || ficha.resultado_final : '-', leftMargin + colWidthA + cellPadding, tableDY + 42, { width: (colWidthA * 3) - (cellPadding * 2) });
    doc.moveTo(leftMargin, tableDY + 54).lineTo(leftMargin + tableAWidth, tableDY + 54).stroke();

    // Aprovador
    doc.moveTo(leftMargin, tableDY + 54).lineTo(leftMargin + tableAWidth, tableDY + 54).stroke();
    doc.rect(leftMargin, tableDY + 54, colWidthA, 18).fillColor('#f5f5f5').fill().fillColor('black');
    doc.fontSize(fontSize).font('Helvetica-Bold');
    doc.text('Aprovador', leftMargin + cellPadding, tableDY + 60, { width: colWidthA - (cellPadding * 2) });
    doc.rect(leftMargin + colWidthA, tableDY + 54, colWidthA * 3, 18).fillColor('#ffffff').fill().fillColor('black');
    doc.font('Helvetica');
    doc.text(ficha.aprovador_nome || '-', leftMargin + colWidthA + cellPadding, tableDY + 60, { width: (colWidthA * 3) - (cellPadding * 2) });
    doc.moveTo(leftMargin, tableDY + 72).lineTo(leftMargin + tableAWidth, tableDY + 72).stroke();

    // Finalizar PDF
    doc.end();
  });
}

module.exports = FichaHomologacaoPDFController;
