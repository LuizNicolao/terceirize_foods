const { executeQuery } = require('../../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Controller para exportação de substituições
 */
class SubstituicoesExportController {
  /**
   * Exportar para PDF
   */
  static async exportarPDF(req, res) {
    try {
      const { necessidades, tipo = 'nutricionista' } = req.body;

      if (!necessidades || !Array.isArray(necessidades)) {
        return res.status(400).json({
          success: false,
          message: 'Necessidades são obrigatórias'
        });
      }

      // Criar documento PDF
      const doc = new PDFDocument({ 
        size: 'A4', 
        layout: 'landscape',
        margin: 50 
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="substituicoes_${tipo}_${new Date().toISOString().split('T')[0]}.pdf"`);

      // Pipe para resposta
      doc.pipe(res);

      // Cabeçalho
      doc.fontSize(16).font('Helvetica-Bold')
         .text(`Relatório de Substituições - ${tipo === 'nutricionista' ? 'Nutricionista' : 'Coordenação'}`, 50, 50);
      
      doc.fontSize(10).font('Helvetica')
         .text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 50, 80)
         .text(`Total: ${necessidades.length} necessidade(s)`, 50, 95);

      // Tabela
      let y = 120;
      const colWidths = [60, 120, 60, 80, 100, 100, 60, 120, 60, 80, 80];
      const headers = [
        'Código', 'Produto Origem', 'Unid.', 'Qtd Origem', 
        'Semana Abast.', 'Semana Consumo', 'Código', 'Produto Genérico', 
        'Unid. Med.', 'Qtd Genérico', 'Status'
      ];

      // Cabeçalho da tabela
      doc.fontSize(8).font('Helvetica-Bold');
      let x = 50;
      headers.forEach((header, index) => {
        doc.text(header, x, y, { width: colWidths[index], align: 'center' });
        x += colWidths[index];
      });
      y += 20;

      // Linha separadora
      doc.moveTo(50, y).lineTo(50 + colWidths.reduce((a, b) => a + b, 0), y).stroke();
      y += 10;

      // Dados
      doc.fontSize(7).font('Helvetica');
      necessidades.forEach(necessidade => {
        // Verificar se há espaço na página
        if (y > 500) {
          doc.addPage();
          y = 50;
        }

        x = 50;
        const rowData = [
          necessidade.codigo_origem,
          necessidade.produto_origem_nome,
          necessidade.produto_origem_unidade,
          parseFloat(necessidade.quantidade_total_origem).toFixed(3).replace('.', ','),
          necessidade.semana_abastecimento || '-',
          necessidade.semana_consumo || '-',
          necessidade.produto_generico_codigo || '-',
          necessidade.produto_generico_nome || '-',
          necessidade.produto_generico_unidade || '-',
          '0,000', // Quantidade genérica será calculada
          'Pendente'
        ];

        rowData.forEach((data, index) => {
          doc.text(data, x, y, { width: colWidths[index], align: 'left' });
          x += colWidths[index];
        });
        y += 15;

        // Detalhes das escolas (se houver)
        if (necessidade.escolas && necessidade.escolas.length > 0) {
          doc.fontSize(6).font('Helvetica-Oblique');
          doc.text('Escolas:', 70, y);
          y += 10;

          necessidade.escolas.forEach(escola => {
            if (y > 500) {
              doc.addPage();
              y = 50;
            }

            doc.text(`• ${escola.escola_nome} (ID: ${escola.escola_id}) - Qtd: ${parseFloat(escola.quantidade_origem).toFixed(3).replace('.', ',')}`, 70, y);
            y += 10;
          });
          y += 10;
        }
      });

      // Finalizar documento
      doc.end();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao exportar PDF'
      });
    }
  }

  /**
   * Exportar para XLSX
   */
  static async exportarXLSX(req, res) {
    try {
      const { necessidades, tipo = 'nutricionista' } = req.body;

      if (!necessidades || !Array.isArray(necessidades)) {
        return res.status(400).json({
          success: false,
          message: 'Necessidades são obrigatórias'
        });
      }

      // Criar workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Substituições ${tipo === 'nutricionista' ? 'Nutricionista' : 'Coordenação'}`);

      // Configurar colunas
      worksheet.columns = [
        { header: 'Código', key: 'codigo', width: 10 },
        { header: 'Produto Origem', key: 'produto_origem', width: 30 },
        { header: 'Unid.', key: 'unidade_origem', width: 10 },
        { header: 'Qtd Origem', key: 'quantidade_origem', width: 15 },
        { header: 'Semana Abast.', key: 'semana_abastecimento', width: 20 },
        { header: 'Semana Consumo', key: 'semana_consumo', width: 20 },
        { header: 'Código Genérico', key: 'codigo_generico', width: 15 },
        { header: 'Produto Genérico', key: 'produto_generico', width: 30 },
        { header: 'Unid. Med.', key: 'unidade_generico', width: 10 },
        { header: 'Qtd Genérico', key: 'quantidade_generico', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      // Estilizar cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Adicionar dados
      necessidades.forEach(necessidade => {
        const row = worksheet.addRow({
          codigo: necessidade.codigo_origem,
          produto_origem: necessidade.produto_origem_nome,
          unidade_origem: necessidade.produto_origem_unidade,
          quantidade_origem: parseFloat(necessidade.quantidade_total_origem).toFixed(3).replace('.', ','),
          semana_abastecimento: necessidade.semana_abastecimento || '-',
          semana_consumo: necessidade.semana_consumo || '-',
          codigo_generico: necessidade.produto_generico_codigo || '-',
          produto_generico: necessidade.produto_generico_nome || '-',
          unidade_generico: necessidade.produto_generico_unidade || '-',
          quantidade_generico: '0,000',
          status: 'Pendente'
        });

        // Adicionar detalhes das escolas se houver
        if (necessidade.escolas && necessidade.escolas.length > 0) {
          necessidade.escolas.forEach(escola => {
            const escolaRow = worksheet.addRow({
              codigo: '',
              produto_origem: `  • ${escola.escola_nome} (ID: ${escola.escola_id})`,
              unidade_origem: '',
              quantidade_origem: parseFloat(escola.quantidade_origem).toFixed(3).replace('.', ','),
              semana_abastecimento: '',
              semana_consumo: '',
              codigo_generico: '',
              produto_generico: '',
              unidade_generico: '',
              quantidade_generico: '',
              status: ''
            });

            // Estilizar linha da escola
            escolaRow.font = { italic: true };
            escolaRow.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8F8F8' }
            };
          });
        }
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="substituicoes_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx"`);

      // Enviar arquivo
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao exportar XLSX'
      });
    }
  }
}

module.exports = SubstituicoesExportController;
