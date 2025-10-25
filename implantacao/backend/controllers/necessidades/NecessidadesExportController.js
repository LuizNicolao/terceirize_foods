const { executeQuery } = require('../../config/database');

class NecessidadesExportController {
  /**
   * Exportar necessidades para XLSX
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
      const ws = wb.addWorksheet('Necessidades');

      // Definir colunas baseado na aba ativa
      const isCoordenacao = req.query.aba === 'coordenacao';
      
      ws.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Escola', key: 'escola', width: 40 },
        { header: 'Rota', key: 'escola_rota', width: 30 },
        { header: 'Produto ID', key: 'produto_id', width: 12 },
        { header: 'Produto', key: 'produto', width: 40 },
        { header: 'Unidade', key: 'produto_unidade', width: 12 },
        { header: 'Quantidade Gerada', key: 'ajuste', width: 18 },
        ...(isCoordenacao ? [
          { header: 'Ajuste Nutricionista', key: 'ajuste_nutricionista', width: 18 },
          { header: 'Ajuste Coordenação', key: 'ajuste_coordenacao', width: 18 }
        ] : [
          { header: 'Ajuste Nutricionista', key: 'ajuste_nutricionista', width: 18 }
        ]),
        { header: 'Semana Consumo', key: 'semana_consumo', width: 20 },
        { header: 'Semana Abastecimento', key: 'semana_abastecimento', width: 22 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      // Estilizar cabeçalho
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      // Aplicar filtros
      const { escola_id, grupo, semana_consumo, semana_abastecimento, nutricionista_id, status } = req.query;
      let whereConditions = [];
      let params = [];

      if (escola_id) {
        whereConditions.push('n.escola_id = ?');
        params.push(escola_id);
      }

      if (status) {
        whereConditions.push('n.status = ?');
        params.push(status);
      }

      if (semana_consumo) {
        whereConditions.push('n.semana_consumo = ?');
        params.push(semana_consumo);
      }

      if (semana_abastecimento) {
        whereConditions.push('n.semana_abastecimento = ?');
        params.push(semana_abastecimento);
      }

      if (nutricionista_id) {
        whereConditions.push('n.usuario_id = ?');
        params.push(nutricionista_id);
      }

      // Filtro por grupo (se aplicável via produtos_per_capita)
      if (grupo) {
        whereConditions.push(`n.produto_id IN (
          SELECT ppc.produto_id 
          FROM produtos_per_capita ppc 
          WHERE ppc.grupo = ?
        )`);
        params.push(grupo);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Query para buscar necessidades
      const query = `
        SELECT 
          n.id,
          n.escola,
          n.escola_rota,
          n.produto_id,
          n.produto,
          n.produto_unidade,
          n.ajuste,
          n.ajuste_nutricionista,
          n.ajuste_coordenacao,
          n.semana_consumo,
          n.semana_abastecimento,
          n.status
        FROM necessidades n
        ${whereClause}
        ORDER BY n.escola, n.produto
      `;

      const necessidades = await executeQuery(query, params);

      // Adicionar dados ao worksheet
      necessidades.forEach(nec => {
        ws.addRow({
          id: nec.id,
          escola: nec.escola,
          escola_rota: nec.escola_rota,
          produto_id: nec.produto_id,
          produto: nec.produto,
          produto_unidade: nec.produto_unidade,
          ajuste: nec.ajuste || 0,
          ajuste_nutricionista: nec.ajuste_nutricionista || 0,
          ajuste_coordenacao: nec.ajuste_coordenacao || 0,
          semana_consumo: nec.semana_consumo,
          semana_abastecimento: nec.semana_abastecimento,
          status: nec.status
        });
      });

      // Configurar headers
      const filename = `necessidades_${isCoordenacao ? 'coordenacao' : 'nutricionista'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      await wb.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao exportar necessidades para XLSX'
      });
    }
  }

  /**
   * Exportar necessidades para PDF
   */
  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        layout: 'landscape'
      });

      const isCoordenacao = req.query.aba === 'coordenacao';

      res.setHeader('Content-Type', 'application/pdf');
      const filename = `necessidades_${isCoordenacao ? 'coordenacao' : 'nutricionista'}_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      doc.pipe(res);

      // Cabeçalho
      doc.fontSize(20).font('Helvetica-Bold')
        .text(`Relatório de Necessidades - ${isCoordenacao ? 'Coordenação' : 'Nutricionista'}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica')
        .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(1);

      // Aplicar filtros
      const { escola_id, grupo, semana_consumo, semana_abastecimento, nutricionista_id, status } = req.query;
      let whereConditions = [];
      let params = [];

      if (escola_id) {
        whereConditions.push('n.escola_id = ?');
        params.push(escola_id);
      }

      if (status) {
        whereConditions.push('n.status = ?');
        params.push(status);
      }

      if (semana_consumo) {
        whereConditions.push('n.semana_consumo = ?');
        params.push(semana_consumo);
      }

      if (semana_abastecimento) {
        whereConditions.push('n.semana_abastecimento = ?');
        params.push(semana_abastecimento);
      }

      if (nutricionista_id) {
        whereConditions.push('n.usuario_id = ?');
        params.push(nutricionista_id);
      }

      if (grupo) {
        whereConditions.push(`n.produto_id IN (
          SELECT ppc.produto_id 
          FROM produtos_per_capita ppc 
          WHERE ppc.grupo = ?
        )`);
        params.push(grupo);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const query = `
        SELECT 
          n.id,
          n.escola,
          n.escola_rota,
          n.produto_id,
          n.produto,
          n.produto_unidade,
          n.ajuste,
          n.ajuste_nutricionista,
          n.ajuste_coordenacao,
          n.semana_consumo,
          n.semana_abastecimento,
          n.status
        FROM necessidades n
        ${whereClause}
        ORDER BY n.escola, n.produto
      `;

      const necessidades = await executeQuery(query, params);

      // Informações filtradas
      if (whereConditions.length > 0) {
        doc.fontSize(10).font('Helvetica').text('Filtros aplicados:', { underline: true });
        doc.fontSize(9);
        if (escola_id) doc.text(`Escola ID: ${escola_id}`);
        if (status) doc.text(`Status: ${status}`);
        if (semana_consumo) doc.text(`Semana Consumo: ${semana_consumo}`);
        if (semana_abastecimento) doc.text(`Semana Abastecimento: ${semana_abastecimento}`);
        if (nutricionista_id) doc.text(`Nutricionista ID: ${nutricionista_id}`);
        if (grupo) doc.text(`Grupo: ${grupo}`);
        doc.moveDown(1);
      }

      // Definir larguras das colunas (ajustadas para paisagem)
      const colWidths = isCoordenacao 
        ? [40, 120, 100, 50, 150, 40, 50, 50, 50, 70, 70, 40] // Com ajuste coordenação
        : [40, 120, 100, 50, 150, 40, 50, 50, 70, 70, 40]; // Sem ajuste coordenação
      
      const startX = 50;
      const startY = doc.y;
      const rowHeight = 15;
      let currentY = startY;

      // Desenhar cabeçalho
      const headers = isCoordenacao
        ? ['ID', 'Escola', 'Rota', 'Prod. ID', 'Produto', 'Un.', 'Qtd Gerada', 'Aj. Nutri', 'Aj. Coord', 'Sem. Consumo', 'Sem. Abast', 'Status']
        : ['ID', 'Escola', 'Rota', 'Prod. ID', 'Produto', 'Un.', 'Qtd Gerada', 'Aj. Nutri', 'Sem. Consumo', 'Sem. Abast', 'Status'];

      doc.fontSize(8).font('Helvetica-Bold');
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
      doc.fontSize(7).font('Helvetica');
      
      necessidades.forEach((nec, index) => {
        // Nova página a cada 25 linhas
        if (index > 0 && index % 25 === 0) {
          doc.addPage();
          currentY = 50;
          
          // Redesenhar cabeçalho
          doc.fontSize(8).font('Helvetica-Bold');
          currentX = startX;
          headers.forEach((header, i) => {
            doc.rect(currentX, currentY, colWidths[i], rowHeight).fillAndStroke('#4CAF50', '#000000');
            doc.fillColor('#FFFFFF');
            doc.text(header, currentX + 2, currentY + 4, { width: colWidths[i] - 4, height: rowHeight - 2 });
            doc.fillColor('#000000');
            currentX += colWidths[i];
          });
          currentY += rowHeight;
          doc.fontSize(7).font('Helvetica');
        }

        currentX = startX;
        const data = isCoordenacao
          ? [
              nec.id,
              nec.escola || 'N/A',
              nec.escola_rota || 'N/A',
              nec.produto_id,
              nec.produto || 'N/A',
              nec.produto_unidade || 'N/A',
              typeof nec.ajuste === 'number' ? nec.ajuste.toFixed(3) : '0.000',
              typeof nec.ajuste_nutricionista === 'number' ? nec.ajuste_nutricionista.toFixed(3) : '0.000',
              typeof nec.ajuste_coordenacao === 'number' ? nec.ajuste_coordenacao.toFixed(3) : '0.000',
              nec.semana_consumo || 'N/A',
              nec.semana_abastecimento || 'N/A',
              nec.status || 'N/A'
            ]
          : [
              nec.id,
              nec.escola || 'N/A',
              nec.escola_rota || 'N/A',
              nec.produto_id,
              nec.produto || 'N/A',
              nec.produto_unidade || 'N/A',
              typeof nec.ajuste === 'number' ? nec.ajuste.toFixed(3) : '0.000',
              typeof nec.ajuste_nutricionista === 'number' ? nec.ajuste_nutricionista.toFixed(3) : '0.000',
              nec.semana_consumo || 'N/A',
              nec.semana_abastecimento || 'N/A',
              nec.status || 'N/A'
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
        message: 'Erro ao exportar necessidades para PDF'
      });
    }
  }
}

module.exports = NecessidadesExportController;
