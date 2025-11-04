/**
 * Controller de Exportação de Formas de Pagamento
 * Responsável por gerar relatórios em XLSX e PDF
 */

const { executeQuery } = require('../../config/database');

class FormasPagamentoExportController {
  /**
   * Exportar formas de pagamento para XLSX
   */
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Formas de Pagamento');

      // Definir cabeçalhos
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Descrição', key: 'descricao', width: 50 },
        { header: 'Prazo Padrão', key: 'prazo_padrao', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      // Estilizar cabeçalhos
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };

      // Buscar formas de pagamento com filtros
      const { search, ativo, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (fp.nome LIKE ? OR fp.descricao LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (ativo !== undefined && ativo !== '') {
        whereClause += ' AND fp.ativo = ?';
        params.push(ativo);
      }

      const query = `
        SELECT 
          fp.id,
          fp.nome,
          fp.descricao,
          fp.prazo_padrao,
          fp.ativo
        FROM formas_pagamento fp
        ${whereClause}
        ORDER BY fp.nome ASC
        LIMIT ${parseInt(limit)}
      `;
      
      const formasPagamento = await executeQuery(query, params);

      // Adicionar dados à planilha
      formasPagamento.forEach(forma => {
        worksheet.addRow({
          id: forma.id,
          nome: forma.nome,
          descricao: forma.descricao || '',
          prazo_padrao: forma.prazo_padrao || '',
          status: forma.ativo === 1 ? 'Ativo' : 'Inativo'
        });
      });

      // Configurar headers de resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=formas_pagamento_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Erro ao exportar formas de pagamento:', error);
      res.status(500).json({ success: false, error: 'Erro interno ao exportar dados' });
    }
  }

  /**
   * Exportar formas de pagamento para PDF
   */
  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=formas_pagamento_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      // Cabeçalho do relatório
      doc.fontSize(20).text('Relatório de Formas de Pagamento', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Buscar formas de pagamento com filtros
      const { search, ativo, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (fp.nome LIKE ? OR fp.descricao LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (ativo !== undefined && ativo !== '') {
        whereClause += ' AND fp.ativo = ?';
        params.push(ativo);
      }

      const query = `
        SELECT 
          fp.id,
          fp.nome,
          fp.descricao,
          fp.prazo_padrao,
          fp.ativo
        FROM formas_pagamento fp
        ${whereClause}
        ORDER BY fp.nome ASC
        LIMIT ${parseInt(limit)}
      `;
      
      const formasPagamento = await executeQuery(query, params);

      // Adicionar dados ao PDF
      formasPagamento.forEach((forma, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(forma.nome);
        doc.fontSize(10).font('Helvetica');
        
        if (forma.descricao) {
          doc.text(`Descrição: ${forma.descricao}`);
        }
        
        if (forma.prazo_padrao) {
          doc.text(`Prazo Padrão: ${forma.prazo_padrao}`);
        }
        
        doc.text(`Status: ${forma.ativo === 1 ? 'Ativo' : 'Inativo'}`);
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      doc.end();
    } catch (error) {
      console.error('Erro ao exportar formas de pagamento:', error);
      res.status(500).json({ success: false, error: 'Erro interno ao exportar dados' });
    }
  }
}

module.exports = FormasPagamentoExportController;

