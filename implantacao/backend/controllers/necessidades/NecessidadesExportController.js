const { executeQuery } = require('../../config/database');

class NecessidadesExportController {
  /**
   * Exportar necessidades para XLSX
   */
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
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

      // Lista de necessidades (simplificada para PDF)
      doc.fontSize(9).font('Helvetica');
      necessidades.forEach((nec, index) => {
        if (index > 0 && index % 3 === 0) {
          doc.addPage();
        }
        
        doc.fontSize(11).font('Helvetica-Bold')
          .text(`${nec.escola} - ${nec.produto}`, { underline: true });
        doc.fontSize(9).font('Helvetica');
        doc.text(`Rota: ${nec.escola_rota || 'N/A'}`);
        doc.text(`Quantidade Gerada: ${nec.ajuste || 0} ${nec.produto_unidade}`);
        doc.text(`Ajuste Nutricionista: ${nec.ajuste_nutricionista || 0} ${nec.produto_unidade}`);
        if (isCoordenacao) {
          doc.text(`Ajuste Coordenação: ${nec.ajuste_coordenacao || 0} ${nec.produto_unidade}`);
        }
        doc.text(`Semana Consumo: ${nec.semana_consumo || 'N/A'}`);
        doc.text(`Semana Abastecimento: ${nec.semana_abastecimento || 'N/A'}`);
        doc.text(`Status: ${nec.status}`);
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(50, doc.y).lineTo(750, doc.y).stroke();
        doc.moveDown(0.5);
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
