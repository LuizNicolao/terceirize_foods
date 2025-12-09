const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

/**
 * Controller para exportação de Tipos de Receitas
 * Implementa exportação XLSX e PDF com todas as informações cadastradas
 */
class TiposReceitasExportController {
  /**
   * Exportar tipos de receitas para XLSX
   */
  static exportarXLSX = asyncHandler(async (req, res) => {
    const { search = '' } = req.query;

    // Query para buscar tipos de receitas
    let baseQuery = `
      SELECT 
        id,
        codigo,
        tipo_receita,
        descricao,
        status
      FROM tipos_receitas
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        codigo LIKE ? OR 
        tipo_receita LIKE ? OR 
        descricao LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    baseQuery += ' ORDER BY codigo';

    // Buscar tipos de receitas
    const tiposReceitas = await executeQuery(baseQuery, params);

    // Criar workbook Excel
    const wb = XLSX.utils.book_new();

    // Planilha com todos os dados
    const dadosCompletos = tiposReceitas.map(tipo => ({
      'Código': tipo.codigo || '',
      'Tipo de Receita': tipo.tipo_receita || '',
      'Descrição': tipo.descricao || '',
      'Status': tipo.status === 1 ? 'Ativo' : 'Inativo'
    }));

    const ws = XLSX.utils.json_to_sheet(dadosCompletos);
    XLSX.utils.book_append_sheet(wb, ws, 'Tipos de Receitas');

    // Gerar buffer do arquivo
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers
    const fileName = `tipos_receitas_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Enviar arquivo
    res.send(excelBuffer);
  });

  /**
   * Exportar tipos de receitas para PDF
   */
  static exportarPDF = asyncHandler(async (req, res) => {
    const { search = '' } = req.query;

    // Query para buscar tipos de receitas
    let baseQuery = `
      SELECT 
        id,
        codigo,
        tipo_receita,
        descricao,
        status
      FROM tipos_receitas
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        codigo LIKE ? OR 
        tipo_receita LIKE ? OR 
        descricao LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    baseQuery += ' ORDER BY codigo';

    // Buscar tipos de receitas
    const tiposReceitas = await executeQuery(baseQuery, params);

    // Criar documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Configurar headers
    const fileName = `tipos_receitas_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Pipe para response
    doc.pipe(res);

    // Título
    doc.fontSize(20).font('Helvetica-Bold').text('Relatório de Tipos de Receitas', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(2);

    if (tiposReceitas.length === 0) {
      doc.fontSize(14).font('Helvetica').text('Nenhum tipo de receita encontrado.', { align: 'center' });
      doc.end();
      return;
    }

    // Cabeçalho da tabela
    const startY = doc.y;
    let currentY = startY;

    // Desenhar cabeçalho
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Código', 50, currentY);
    doc.text('Tipo de Receita', 120, currentY);
    doc.text('Descrição', 280, currentY);
    doc.text('Status', 450, currentY);

    // Linha separadora
    currentY += 15;
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();

    // Dados
    doc.fontSize(9).font('Helvetica');
    tiposReceitas.forEach((tipo, index) => {
      // Verificar se precisa de nova página
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
        
        // Redesenhar cabeçalho
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Código', 50, currentY);
        doc.text('Tipo de Receita', 120, currentY);
        doc.text('Descrição', 280, currentY);
        doc.text('Status', 450, currentY);
        currentY += 15;
        doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
        currentY += 5;
        doc.fontSize(9).font('Helvetica');
      }

      currentY += 5;
      
      const codigo = tipo.codigo || '-';
      const tipoReceita = (tipo.tipo_receita || '-').substring(0, 30);
      const descricao = (tipo.descricao || '-').substring(0, 50);
      const status = tipo.status === 1 ? 'Ativo' : 'Inativo';

      doc.text(codigo, 50, currentY);
      doc.text(tipoReceita, 120, currentY);
      doc.text(descricao, 280, currentY);
      doc.text(status, 450, currentY);

      currentY += 15;
    });

    // Rodapé
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total de registros: ${tiposReceitas.length}`, 50, doc.page.height - 50, { align: 'left' });

    // Finalizar documento
    doc.end();
  });
}

module.exports = TiposReceitasExportController;

