const { executeQuery } = require('../../config/database');

class ProdutoOrigemExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Produtos Origem');

      // Colunas com as mesmas informações da tela
      worksheet.columns = [
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Unidade', key: 'unidade_sigla', width: 10 },
        { header: 'Grupo', key: 'grupo_nome', width: 25 },
        { header: 'Subgrupo', key: 'subgrupo_nome', width: 25 },
        { header: 'Classe', key: 'classe_nome', width: 25 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Ref. Mercado', key: 'referencia_mercado', width: 30 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, grupo_id, subgrupo_id, classe_id, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (po.codigo LIKE ? OR po.nome LIKE ? OR po.referencia_mercado LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND po.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      if (grupo_id && grupo_id !== 'todos') {
        whereClause += ' AND po.grupo_id = ?';
        params.push(parseInt(grupo_id));
      }

      if (subgrupo_id && subgrupo_id !== 'todos') {
        whereClause += ' AND po.subgrupo_id = ?';
        params.push(parseInt(subgrupo_id));
      }

      if (classe_id && classe_id !== 'todos') {
        whereClause += ' AND po.classe_id = ?';
        params.push(parseInt(classe_id));
      }

      // Query com todas as informações da tela
      const query = `
        SELECT 
          po.codigo,
          po.nome,
          um.sigla as unidade_sigla,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          po.status,
          po.referencia_mercado
        FROM produto_origem po
        LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
        LEFT JOIN grupos g ON po.grupo_id = g.id
        LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
        LEFT JOIN classes c ON po.classe_id = c.id
        ${whereClause}
        ORDER BY po.codigo ASC
        LIMIT ${parseInt(limit)}
      `;

      const produtos = await executeQuery(query, params);

      produtos.forEach(produto => {
        worksheet.addRow({
          codigo: produto.codigo,
          nome: produto.nome,
          unidade_sigla: produto.unidade_sigla || '-',
          grupo_nome: produto.grupo_nome || '-',
          subgrupo_nome: produto.subgrupo_nome || '-',
          classe_nome: produto.classe_nome || '-',
          status: produto.status === 1 ? 'Ativo' : 'Inativo',
          referencia_mercado: produto.referencia_mercado || '-'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=produto_origem_${new Date().toISOString().split('T')[0]}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=produto_origem_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Relatório de Produtos Origem', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      const { search, status, grupo_id, subgrupo_id, classe_id, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (po.codigo LIKE ? OR po.nome LIKE ? OR po.referencia_mercado LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND po.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      if (grupo_id && grupo_id !== 'todos') {
        whereClause += ' AND po.grupo_id = ?';
        params.push(parseInt(grupo_id));
      }

      if (subgrupo_id && subgrupo_id !== 'todos') {
        whereClause += ' AND po.subgrupo_id = ?';
        params.push(parseInt(subgrupo_id));
      }

      if (classe_id && classe_id !== 'todos') {
        whereClause += ' AND po.classe_id = ?';
        params.push(parseInt(classe_id));
      }

      // Query com todas as informações da tela
      const query = `
        SELECT 
          po.codigo,
          po.nome,
          um.sigla as unidade_sigla,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          po.status,
          po.referencia_mercado
        FROM produto_origem po
        LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
        LEFT JOIN grupos g ON po.grupo_id = g.id
        LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
        LEFT JOIN classes c ON po.classe_id = c.id
        ${whereClause}
        ORDER BY po.codigo ASC
        LIMIT ${parseInt(limit)}
      `;

      const produtos = await executeQuery(query, params);

      // Cabeçalho da tabela
      doc.fontSize(10).font('Helvetica-Bold');
      const headerY = doc.y;
      doc.text('Código', 50, headerY);
      doc.text('Nome', 100, headerY);
      doc.text('Unidade', 250, headerY);
      doc.text('Grupo', 300, headerY);
      doc.text('Subgrupo', 380, headerY);
      doc.text('Classe', 460, headerY);
      doc.text('Status', 520, headerY);
      
      // Linha separadora do cabeçalho
      doc.moveTo(50, headerY + 15).lineTo(570, headerY + 15).stroke();
      doc.y = headerY + 20;

      // Dados em formato de tabela (linha por linha)
      produtos.forEach((produto, index) => {
        if (doc.y > 700) { // Nova página se necessário
          doc.addPage();
          doc.y = 50;
        }

        doc.fontSize(9).font('Helvetica');
        
        // Truncar textos longos para caber na página
        const nome = produto.nome.length > 20 ? produto.nome.substring(0, 17) + '...' : produto.nome;
        const grupo = (produto.grupo_nome || '-').length > 15 ? (produto.grupo_nome || '-').substring(0, 12) + '...' : (produto.grupo_nome || '-');
        const subgrupo = (produto.subgrupo_nome || '-').length > 15 ? (produto.subgrupo_nome || '-').substring(0, 12) + '...' : (produto.subgrupo_nome || '-');
        const classe = (produto.classe_nome || '-').length > 15 ? (produto.classe_nome || '-').substring(0, 12) + '...' : (produto.classe_nome || '-');

        doc.text(produto.codigo, 50, doc.y);
        doc.text(nome, 100, doc.y);
        doc.text(produto.unidade_sigla || '-', 250, doc.y);
        doc.text(grupo, 300, doc.y);
        doc.text(subgrupo, 380, doc.y);
        doc.text(classe, 460, doc.y);
        doc.text(produto.status === 1 ? 'Ativo' : 'Inativo', 520, doc.y);

        // Linha separadora entre registros
        doc.moveTo(50, doc.y + 12).lineTo(570, doc.y + 12).stroke();
        doc.y += 15;
      });

      doc.end();
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }
}

module.exports = ProdutoOrigemExportController;
