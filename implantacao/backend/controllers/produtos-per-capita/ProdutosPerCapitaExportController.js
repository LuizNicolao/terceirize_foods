const { executeQuery } = require('../../config/database');

class ProdutosPerCapitaExportController {
  /**
   * Exportar produtos per capita para XLSX
   */
  static async exportarXLSX(req, res) {
    try {
      // Verificar se ExcelJS está instalado
      let ExcelJS;
      try {
        ExcelJS = require('exceljs');
      } catch (err) {
        console.error('ExcelJS não está instalado. Instale com: npm install exceljs');
        return res.status(500).json({
          success: false,
          error: 'Biblioteca ExcelJS não instalada',
          message: 'Execute: npm install exceljs'
        });
      }
      
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Produtos Per Capita');

      ws.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Produto ID', key: 'produto_id', width: 12 },
        { header: 'Produto', key: 'produto_nome', width: 40 },
        { header: 'Código', key: 'produto_codigo', width: 15 },
        { header: 'Unidade', key: 'unidade_medida', width: 12 },
        { header: 'Grupo', key: 'grupo', width: 20 },
        { header: 'Subgrupo', key: 'subgrupo', width: 20 },
        { header: 'Classe', key: 'classe', width: 20 },
        { header: 'Parcial', key: 'per_capita_parcial', width: 12 },
        { header: 'Lanche Manhã', key: 'per_capita_lanche_manha', width: 12 },
        { header: 'Almoço', key: 'per_capita_almoco', width: 12 },
        { header: 'Lanche Tarde', key: 'per_capita_lanche_tarde', width: 12 },
        { header: 'EJA', key: 'per_capita_eja', width: 12 },
        { header: 'Status', key: 'ativo', width: 10 }
      ];

      // Estilizar cabeçalho
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      // Query para buscar produtos per capita
      const query = `
        SELECT 
          id,
          produto_id,
          produto_nome,
          produto_codigo,
          unidade_medida,
          grupo,
          subgrupo,
          classe,
          per_capita_parcial,
          per_capita_lanche_manha,
          per_capita_almoco,
          per_capita_lanche_tarde,
          per_capita_eja,
          ativo
        FROM produtos_per_capita
        ORDER BY produto_nome
      `;

      const produtos = await executeQuery(query);

      // Adicionar dados ao worksheet
      produtos.forEach(prod => {
        ws.addRow({
          id: prod.id,
          produto_id: prod.produto_id,
          produto_nome: prod.produto_nome,
          produto_codigo: prod.produto_codigo,
          unidade_medida: prod.unidade_medida,
          grupo: prod.grupo,
          subgrupo: prod.subgrupo,
          classe: prod.classe,
          per_capita_parcial: prod.per_capita_parcial || 0,
          per_capita_lanche_manha: prod.per_capita_lanche_manha || 0,
          per_capita_almoco: prod.per_capita_almoco || 0,
          per_capita_lanche_tarde: prod.per_capita_lanche_tarde || 0,
          per_capita_eja: prod.per_capita_eja || 0,
          ativo: prod.ativo ? 'Ativo' : 'Inativo'
        });
      });

      // Configurar headers
      const filename = `produtos_per_capita_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      await wb.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao exportar produtos per capita para XLSX'
      });
    }
  }

  /**
   * Exportar produtos per capita para PDF
   */
  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        layout: 'landscape'
      });

      res.setHeader('Content-Type', 'application/pdf');
      const filename = `produtos_per_capita_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      doc.pipe(res);

      // Cabeçalho
      doc.fontSize(20).font('Helvetica-Bold')
        .text('Relatório de Produtos Per Capita', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica')
        .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(1);

      // Query
      const query = `
        SELECT 
          id,
          produto_id,
          produto_nome,
          produto_codigo,
          unidade_medida,
          grupo,
          subgrupo,
          classe,
          per_capita_parcial,
          per_capita_lanche_manha,
          per_capita_almoco,
          per_capita_lanche_tarde,
          per_capita_eja,
          ativo
        FROM produtos_per_capita
        ORDER BY produto_nome
      `;

      const produtos = await executeQuery(query);

      // Definir larguras das colunas
      const colWidths = [30, 40, 120, 50, 40, 50, 50, 50, 50, 50, 50, 50, 40, 40];
      const startX = 50;
      const startY = doc.y;
      const rowHeight = 15;
      let currentY = startY;

      // Desenhar cabeçalho
      const headers = ['ID', 'Prod. ID', 'Produto', 'Código', 'Un.', 'Grupo', 'Subgrupo', 'Classe', 'Parcial', 'Lan. Manhã', 'Almoço', 'Lan. Tarde', 'EJA', 'Status'];

      doc.fontSize(7).font('Helvetica-Bold');
      let currentX = startX;
      
      headers.forEach((header, index) => {
        doc.rect(currentX, currentY, colWidths[index], rowHeight).fillAndStroke('#4CAF50', '#000000');
        doc.fillColor('#FFFFFF');
        doc.text(header, currentX + 2, currentY + 4, { width: colWidths[index] - 4, height: rowHeight - 2 });
        doc.fillColor('#000000');
        currentX += colWidths[index];
      });

      currentY += rowHeight;

      // Desenhar dados
      doc.fontSize(6).font('Helvetica');
      
      produtos.forEach((prod, index) => {
        if (index > 0 && index % 20 === 0) {
          doc.addPage();
          currentY = 50;
          
          doc.fontSize(7).font('Helvetica-Bold');
          currentX = startX;
          headers.forEach((header, i) => {
            doc.rect(currentX, currentY, colWidths[i], rowHeight).fillAndStroke('#4CAF50', '#000000');
            doc.fillColor('#FFFFFF');
            doc.text(header, currentX + 2, currentY + 4, { width: colWidths[i] - 4, height: rowHeight - 2 });
            doc.fillColor('#000000');
            currentX += colWidths[i];
          });
          currentY += rowHeight;
          doc.fontSize(6).font('Helvetica');
        }

        currentX = startX;
        const data = [
          prod.id,
          prod.produto_id,
          prod.produto_nome || 'N/A',
          prod.produto_codigo || 'N/A',
          prod.unidade_medida || 'N/A',
          prod.grupo || 'N/A',
          prod.subgrupo || 'N/A',
          prod.classe || 'N/A',
          parseFloat(prod.per_capita_parcial || 0).toFixed(3),
          parseFloat(prod.per_capita_lanche_manha || 0).toFixed(3),
          parseFloat(prod.per_capita_almoco || 0).toFixed(3),
          parseFloat(prod.per_capita_lanche_tarde || 0).toFixed(3),
          parseFloat(prod.per_capita_eja || 0).toFixed(3),
          prod.ativo ? 'Ativo' : 'Inativo'
        ];

        data.forEach((value, i) => {
          doc.rect(currentX, currentY, colWidths[i], rowHeight).stroke();
          doc.text(String(value), currentX + 2, currentY + 4, { 
            width: colWidths[i] - 4, 
            height: rowHeight - 2,
            ellipsis: true
          });
          currentX += colWidths[i];
        });

        currentY += rowHeight;
      });

      doc.end();

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao exportar produtos per capita para PDF'
      });
    }
  }
}

module.exports = ProdutosPerCapitaExportController;
