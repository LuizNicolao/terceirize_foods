const { executeQuery } = require('../../config/database');

class ProdutoGenericoExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Produtos Genéricos');

      worksheet.columns = [
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Grupo', key: 'grupo', width: 25 },
        { header: 'Subgrupo', key: 'subgrupo', width: 25 },
        { header: 'Classe', key: 'classe', width: 25 },
        { header: 'Padrão', key: 'padrao', width: 10 },
        { header: 'Origem', key: 'origem', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Produtos Vinculados', key: 'total_produtos', width: 20 },
        { header: 'Unidade Medida', key: 'unidade_medida', width: 20 },
        { header: 'Fator Conversão', key: 'fator_conversao', width: 20 },
        { header: 'Referência Mercado', key: 'referencia_mercado', width: 25 },
        { header: 'Referência Interna', key: 'referencia_interna', width: 25 },
        { header: 'Referência Externa', key: 'referencia_externa', width: 25 },
        { header: 'Peso Líquido', key: 'peso_liquido', width: 15 },
        { header: 'Peso Bruto', key: 'peso_bruto', width: 15 },
        { header: 'Regra Palet', key: 'regra_palet', width: 15 },
        { header: 'Prazo Validade Padrão', key: 'prazo_validade_padrao', width: 25 },
        { header: 'Unidade Validade', key: 'unidade_validade', width: 20 },
        { header: 'Criado Em', key: 'criado_em', width: 20 },
        { header: 'Atualizado Em', key: 'atualizado_em', width: 20 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, classe_id, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND pg.nome LIKE ?';
        params.push(`%${search}%`);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND pg.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      if (classe_id && classe_id !== 'todos') {
        whereClause += ' AND pg.classe_id = ?';
        params.push(classe_id);
      }

      const query = `
        SELECT 
          pg.*,
          po.nome as produto_origem_nome,
          po.codigo as produto_origem_codigo,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          um.nome as unidade_medida_nome,
          um.sigla as unidade_medida_sigla,
          COUNT(p.id) as total_produtos
        FROM produto_generico pg
        LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
        LEFT JOIN grupos g ON pg.grupo_id = g.id
        LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
        LEFT JOIN classes c ON pg.classe_id = c.id
        LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
        LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
        ${whereClause}
        GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.peso_liquido, pg.peso_bruto, pg.regra_palet, pg.prazo_validade_padrao, pg.unidade_validade, pg.status, pg.criado_em, pg.atualizado_em, po.nome, po.codigo, g.nome, sg.nome, c.nome, um.nome, um.sigla
        ORDER BY pg.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const produtos = await executeQuery(query, params);

      produtos.forEach(produto => {
        worksheet.addRow({
          codigo: produto.codigo || '',
          nome: produto.nome || '',
          grupo: produto.grupo_nome || '',
          subgrupo: produto.subgrupo_nome || '',
          classe: produto.classe_nome || '',
          padrao: produto.produto_padrao === 'Sim' ? 'Sim' : 'Não',
          origem: produto.produto_origem_codigo && produto.produto_origem_nome ? 
            `${produto.produto_origem_codigo} - ${produto.produto_origem_nome}` : 
            (produto.produto_origem_nome || ''),
          status: produto.status === 1 ? 'Ativo' : 'Inativo',
          total_produtos: produto.total_produtos || 0,
          unidade_medida: produto.unidade_medida_nome || '',
          fator_conversao: produto.fator_conversao || '',
          referencia_mercado: produto.referencia_mercado || '',
          referencia_interna: produto.referencia_interna || '',
          referencia_externa: produto.referencia_externa || '',
          peso_liquido: produto.peso_liquido || '',
          peso_bruto: produto.peso_bruto || '',
          regra_palet: produto.regra_palet || '',
          prazo_validade_padrao: produto.prazo_validade_padrao || '',
          unidade_validade: produto.unidade_validade || '',
          criado_em: produto.criado_em ? new Date(produto.criado_em).toLocaleString('pt-BR') : '',
          atualizado_em: produto.atualizado_em ? new Date(produto.atualizado_em).toLocaleString('pt-BR') : ''
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=produto_generico_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      res.setHeader('Content-Disposition', `attachment; filename=produto_generico_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Relatório de Produtos Genéricos', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      const { search, status, classe_id, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND pg.nome LIKE ?';
        params.push(`%${search}%`);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND pg.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      if (classe_id && classe_id !== 'todos') {
        whereClause += ' AND pg.classe_id = ?';
        params.push(classe_id);
      }

      const query = `
        SELECT 
          pg.*,
          po.nome as produto_origem_nome,
          po.codigo as produto_origem_codigo,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          um.nome as unidade_medida_nome,
          um.sigla as unidade_medida_sigla,
          COUNT(p.id) as total_produtos
        FROM produto_generico pg
        LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
        LEFT JOIN grupos g ON pg.grupo_id = g.id
        LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
        LEFT JOIN classes c ON pg.classe_id = c.id
        LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
        LEFT JOIN produtos p ON pg.id = p.nome_generico_id AND p.status = 1
        ${whereClause}
        GROUP BY pg.id, pg.codigo, pg.nome, pg.referencia_mercado, pg.referencia_interna, pg.referencia_externa, pg.produto_origem_id, pg.grupo_id, pg.subgrupo_id, pg.classe_id, pg.unidade_medida_id, pg.produto_padrao, pg.fator_conversao, pg.peso_liquido, pg.peso_bruto, pg.regra_palet, pg.prazo_validade_padrao, pg.unidade_validade, pg.status, pg.criado_em, pg.atualizado_em, po.nome, po.codigo, g.nome, sg.nome, c.nome, um.nome, um.sigla
        ORDER BY pg.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const produtos = await executeQuery(query, params);

      produtos.forEach((produto, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(`${produto.codigo || ''} - ${produto.nome || ''}`);
        doc.fontSize(10).font('Helvetica');
        
        if (produto.grupo_nome) doc.text(`Grupo: ${produto.grupo_nome}`);
        if (produto.subgrupo_nome) doc.text(`Subgrupo: ${produto.subgrupo_nome}`);
        if (produto.classe_nome) doc.text(`Classe: ${produto.classe_nome}`);
        if (produto.produto_padrao === 'Sim') doc.text(`Padrão: Sim`);
        if (produto.produto_origem_codigo && produto.produto_origem_nome) {
          doc.text(`Origem: ${produto.produto_origem_codigo} - ${produto.produto_origem_nome}`);
        }
        doc.text(`Status: ${produto.status === 1 ? 'Ativo' : 'Inativo'}`);
        doc.text(`Produtos Vinculados: ${produto.total_produtos || 0}`);
        if (produto.unidade_medida_nome) doc.text(`Unidade Medida: ${produto.unidade_medida_nome}`);
        if (produto.fator_conversao) doc.text(`Fator Conversão: ${produto.fator_conversao}`);
        if (produto.referencia_mercado) doc.text(`Ref. Mercado: ${produto.referencia_mercado}`);
        if (produto.referencia_interna) doc.text(`Ref. Interna: ${produto.referencia_interna}`);
        if (produto.referencia_externa) doc.text(`Ref. Externa: ${produto.referencia_externa}`);
        if (produto.peso_liquido) doc.text(`Peso Líquido: ${produto.peso_liquido}`);
        if (produto.peso_bruto) doc.text(`Peso Bruto: ${produto.peso_bruto}`);
        if (produto.regra_palet) doc.text(`Regra Palet: ${produto.regra_palet}`);
        if (produto.prazo_validade_padrao) doc.text(`Prazo Validade: ${produto.prazo_validade_padrao}`);
        if (produto.unidade_validade) doc.text(`Unidade Validade: ${produto.unidade_validade}`);
        
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      doc.end();
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }
}

module.exports = ProdutoGenericoExportController;
