/**
 * Controller de Exportação de Prazos de Pagamento
 * Responsável por gerar relatórios em XLSX e PDF
 */

const { executeQuery } = require('../../config/database');

class PrazosPagamentoExportController {
  /**
   * Exportar prazos de pagamento para XLSX
   */
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Prazos de Pagamento');

      // Definir cabeçalhos
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Dias (1ª Parcela)', key: 'dias', width: 18 },
        { header: 'Parcelas', key: 'parcelas', width: 12 },
        { header: 'Intervalo (dias)', key: 'intervalo_dias', width: 18 },
        { header: 'Vencimentos', key: 'vencimentos', width: 50 },
        { header: 'Descrição', key: 'descricao', width: 50 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      // Estilizar cabeçalhos
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };

      // Buscar prazos de pagamento com filtros
      const { search, ativo, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (pp.nome LIKE ? OR pp.descricao LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (ativo !== undefined && ativo !== '') {
        whereClause += ' AND pp.ativo = ?';
        params.push(ativo);
      }

      const query = `
        SELECT 
          pp.id,
          pp.nome,
          pp.dias,
          pp.parcelas,
          pp.intervalo_dias,
          pp.descricao,
          pp.ativo
        FROM prazos_pagamento pp
        ${whereClause}
        ORDER BY pp.dias ASC, pp.parcelas ASC
        LIMIT ${parseInt(limit)}
      `;
      
      const prazosPagamento = await executeQuery(query, params);

      // Função para calcular vencimentos
      const calcularVencimentos = (dias, parcelas, intervalo) => {
        if (dias === 0) return 'À vista';
        if (parcelas === 1) return `${dias} dias`;
        
        const vencimentos = [];
        for (let i = 0; i < Math.min(parcelas, 5); i++) {
          const diasVenc = dias + (i * intervalo);
          vencimentos.push(`${diasVenc}d`);
        }
        const resultado = vencimentos.join(' / ');
        return parcelas > 5 ? `${resultado} ...` : resultado;
      };

      // Adicionar dados à planilha
      prazosPagamento.forEach(prazo => {
        const vencimentos = calcularVencimentos(
          prazo.dias, 
          prazo.parcelas || 1, 
          prazo.intervalo_dias || 0
        );

        worksheet.addRow({
          id: prazo.id,
          nome: prazo.nome,
          dias: prazo.dias,
          parcelas: prazo.parcelas || 1,
          intervalo_dias: prazo.intervalo_dias || '-',
          vencimentos: vencimentos,
          descricao: prazo.descricao || '',
          status: prazo.ativo === 1 ? 'Ativo' : 'Inativo'
        });
      });

      // Configurar headers de resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=prazos_pagamento_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Erro ao exportar prazos de pagamento:', error);
      res.status(500).json({ success: false, error: 'Erro interno ao exportar dados' });
    }
  }

  /**
   * Exportar prazos de pagamento para PDF
   */
  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=prazos_pagamento_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      // Cabeçalho do relatório
      doc.fontSize(20).text('Relatório de Prazos de Pagamento', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Buscar prazos de pagamento com filtros
      const { search, ativo, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (pp.nome LIKE ? OR pp.descricao LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (ativo !== undefined && ativo !== '') {
        whereClause += ' AND pp.ativo = ?';
        params.push(ativo);
      }

      const query = `
        SELECT 
          pp.id,
          pp.nome,
          pp.dias,
          pp.parcelas,
          pp.intervalo_dias,
          pp.descricao,
          pp.ativo
        FROM prazos_pagamento pp
        ${whereClause}
        ORDER BY pp.dias ASC, pp.parcelas ASC
        LIMIT ${parseInt(limit)}
      `;
      
      const prazosPagamento = await executeQuery(query, params);

      // Função para calcular vencimentos
      const calcularVencimentos = (dias, parcelas, intervalo) => {
        if (dias === 0) return 'À vista';
        if (parcelas === 1) return `${dias} dias`;
        
        const vencimentos = [];
        for (let i = 0; i < parcelas; i++) {
          const diasVenc = dias + (i * intervalo);
          vencimentos.push(`${diasVenc} dias`);
        }
        return vencimentos.join(' | ');
      };

      // Adicionar dados ao PDF
      prazosPagamento.forEach((prazo, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(prazo.nome);
        doc.fontSize(10).font('Helvetica');
        
        doc.text(`Dias (1ª Parcela): ${prazo.dias} dias`);
        doc.text(`Parcelas: ${prazo.parcelas || 1}x`);
        
        if (prazo.parcelas > 1 && prazo.intervalo_dias) {
          doc.text(`Intervalo: ${prazo.intervalo_dias} dias`);
          const vencimentos = calcularVencimentos(prazo.dias, prazo.parcelas, prazo.intervalo_dias);
          doc.text(`Vencimentos: ${vencimentos}`);
        }
        
        if (prazo.descricao) {
          doc.text(`Descrição: ${prazo.descricao}`);
        }
        
        doc.text(`Status: ${prazo.ativo === 1 ? 'Ativo' : 'Inativo'}`);
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      doc.end();
    } catch (error) {
      console.error('Erro ao exportar prazos de pagamento:', error);
      res.status(500).json({ success: false, error: 'Erro interno ao exportar dados' });
    }
  }
}

module.exports = PrazosPagamentoExportController;

