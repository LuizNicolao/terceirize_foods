const { executeQuery } = require('../../config/database');

class ProdutoOrigemExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Produtos Origem');

      // Colunas com as mesmas informações da tela
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
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
          po.id,
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
          id: produto.id,
          codigo: produto.codigo || '-',
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
      const doc = new PDFDocument({ 
        margin: 30,
        size: 'A4',
        layout: 'landscape' // Modo paisagem para caber mais colunas
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=produto_origem_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      doc.fontSize(16).font('Helvetica-Bold').text('Relatório de Produtos Origem', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(1.5);

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
          po.id,
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

      // Definir posições das colunas (modo paisagem A4 = ~842 pontos de largura)
      const cols = {
        id: 30,
        codigo: 75,
        nome: 130,
        unidade: 305,
        grupo: 360,
        subgrupo: 485,
        classe: 610,
        status: 735,
        ref: 795
      };

      // Cabeçalho da tabela
      doc.fontSize(9).font('Helvetica-Bold');
      const headerY = doc.y;
      doc.text('ID', cols.id, headerY, { width: 35 });
      doc.text('Código', cols.codigo, headerY, { width: 45 });
      doc.text('Nome', cols.nome, headerY, { width: 170 });
      doc.text('Unid.', cols.unidade, headerY, { width: 50 });
      doc.text('Grupo', cols.grupo, headerY, { width: 120 });
      doc.text('Subgrupo', cols.subgrupo, headerY, { width: 120 });
      doc.text('Classe', cols.classe, headerY, { width: 120 });
      doc.text('Status', cols.status, headerY, { width: 55 });
      doc.text('Ref.', cols.ref, headerY, { width: 50 });
      
      // Linha separadora do cabeçalho
      doc.moveTo(30, headerY + 12).lineTo(810, headerY + 12).stroke();
      doc.y = headerY + 16;

      // Dados em formato de tabela
      produtos.forEach((produto) => {
        // Nova página se necessário (modo paisagem A4 = ~595 pontos de altura)
        if (doc.y > 530) {
          doc.addPage();
          doc.y = 30;
          
          // Repetir cabeçalho na nova página
          doc.fontSize(9).font('Helvetica-Bold');
          const newHeaderY = doc.y;
          doc.text('ID', cols.id, newHeaderY, { width: 35 });
          doc.text('Código', cols.codigo, newHeaderY, { width: 45 });
          doc.text('Nome', cols.nome, newHeaderY, { width: 170 });
          doc.text('Unid.', cols.unidade, newHeaderY, { width: 50 });
          doc.text('Grupo', cols.grupo, newHeaderY, { width: 120 });
          doc.text('Subgrupo', cols.subgrupo, newHeaderY, { width: 120 });
          doc.text('Classe', cols.classe, newHeaderY, { width: 120 });
          doc.text('Status', cols.status, newHeaderY, { width: 55 });
          doc.text('Ref.', cols.ref, newHeaderY, { width: 50 });
          doc.moveTo(30, newHeaderY + 12).lineTo(810, newHeaderY + 12).stroke();
          doc.y = newHeaderY + 16;
        }

        doc.fontSize(8).font('Helvetica');
        const currentY = doc.y;
        
        // Truncar textos longos
        const nome = produto.nome.length > 30 ? produto.nome.substring(0, 27) + '...' : produto.nome;
        const grupo = (produto.grupo_nome || '-').length > 20 ? (produto.grupo_nome || '-').substring(0, 17) + '...' : (produto.grupo_nome || '-');
        const subgrupo = (produto.subgrupo_nome || '-').length > 20 ? (produto.subgrupo_nome || '-').substring(0, 17) + '...' : (produto.subgrupo_nome || '-');
        const classe = (produto.classe_nome || '-').length > 20 ? (produto.classe_nome || '-').substring(0, 17) + '...' : (produto.classe_nome || '-');
        const ref = (produto.referencia_mercado || '-').length > 12 ? (produto.referencia_mercado || '-').substring(0, 9) + '...' : (produto.referencia_mercado || '-');

        doc.text(String(produto.id || '-'), cols.id, currentY, { width: 35 });
        doc.text(produto.codigo || '-', cols.codigo, currentY, { width: 45 });
        doc.text(nome, cols.nome, currentY, { width: 170 });
        doc.text(produto.unidade_sigla || '-', cols.unidade, currentY, { width: 50 });
        doc.text(grupo, cols.grupo, currentY, { width: 120 });
        doc.text(subgrupo, cols.subgrupo, currentY, { width: 120 });
        doc.text(classe, cols.classe, currentY, { width: 120 });
        doc.text(produto.status === 1 ? 'Ativo' : 'Inativo', cols.status, currentY, { width: 55 });
        doc.text(ref, cols.ref, currentY, { width: 50 });

        // Linha separadora entre registros (mais sutil)
        doc.strokeColor('#CCCCCC').moveTo(30, currentY + 10).lineTo(810, currentY + 10).stroke();
        doc.strokeColor('#000000'); // Voltar cor padrão
        doc.y = currentY + 13;
      });

      // Rodapé com total de registros
      doc.fontSize(8).font('Helvetica-Oblique');
      doc.text(`Total de registros: ${produtos.length}`, 30, doc.page.height - 40, { align: 'right' });

      doc.end();
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }
}

module.exports = ProdutoOrigemExportController;
