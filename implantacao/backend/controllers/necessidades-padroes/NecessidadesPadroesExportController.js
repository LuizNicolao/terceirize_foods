const { executeQuery } = require('../../config/database');
const { errorResponse } = require('../../middleware/responseHandler');

const buildWhereClause = (filters = {}) => {
  const conditions = ['np.ativo = 1'];
  const params = [];

  if (filters.escola_id) {
    conditions.push('np.escola_id = ?');
    params.push(filters.escola_id);
  }

  if (filters.grupo_id) {
    conditions.push('np.grupo_id = ?');
    params.push(filters.grupo_id);
  }

  if (filters.produto_id) {
    conditions.push('np.produto_id = ?');
    params.push(filters.produto_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return { whereClause, params };
};

const carregarDados = async (filters = {}) => {
  const { whereClause, params } = buildWhereClause(filters);

  const query = `
    SELECT
      np.id,
      np.escola_id,
      np.escola_nome,
      np.grupo_id,
      np.grupo_nome,
      np.produto_id,
      np.produto_nome,
      np.unidade_medida_sigla AS unidade_medida,
      np.quantidade,
      np.data_criacao,
      np.data_atualizacao,
      u.nome AS usuario_nome
    FROM necessidades_padroes np
    LEFT JOIN usuarios u ON np.usuario_id = u.id
    ${whereClause}
    ORDER BY np.escola_nome, np.grupo_nome, np.produto_nome
  `;

  const resultados = await executeQuery(query, params);
  return resultados || [];
};

const formatarNumero = (valor) => {
  if (valor === null || valor === undefined) {
    return '';
  }
  const numero = Number(valor);
  if (Number.isNaN(numero)) {
    return '';
  }
  return numero;
};

class NecessidadesPadroesExportController {
  static async exportarXLSX(req, res) {
    try {
      let ExcelJS;
      try {
        ExcelJS = require('exceljs');
      } catch (error) {
        console.error('[NecessidadesPadroesExportController] exceljs não instalado.');
        return res.status(500).json({
          success: false,
          error: 'Biblioteca exceljs não instalada',
          message: 'Execute: npm install exceljs'
        });
      }

      const filtros = {
        escola_id: req.query.escola_id,
        grupo_id: req.query.grupo_id,
        produto_id: req.query.produto_id
      };

      const registros = await carregarDados(filtros);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pedido Mensal');

      worksheet.columns = [
        { header: 'Escola ID', key: 'escola_id', width: 12 },
        { header: 'Escola', key: 'escola_nome', width: 40 },
        { header: 'Grupo ID', key: 'grupo_id', width: 12 },
        { header: 'Grupo', key: 'grupo_nome', width: 30 },
        { header: 'Produto ID', key: 'produto_id', width: 12 },
        { header: 'Produto', key: 'produto_nome', width: 40 },
        { header: 'Unidade', key: 'unidade_medida', width: 12 },
        { header: 'Quantidade', key: 'quantidade', width: 15 },
        { header: 'Criado em', key: 'data_criacao', width: 20 },
        { header: 'Atualizado em', key: 'data_atualizacao', width: 20 },
        { header: 'Usuário', key: 'usuario_nome', width: 30 }
      ];

      worksheet.getRow(1).font = { bold: true };

      registros.forEach((registro) => {
        worksheet.addRow({
          escola_id: registro.escola_id,
          escola_nome: registro.escola_nome || '',
          grupo_id: registro.grupo_id,
          grupo_nome: registro.grupo_nome || '',
          produto_id: registro.produto_id,
          produto_nome: registro.produto_nome || '',
          unidade_medida: registro.unidade_medida || '',
          quantidade: formatarNumero(registro.quantidade),
          data_criacao: registro.data_criacao
            ? new Date(registro.data_criacao).toLocaleString('pt-BR')
            : '',
          data_atualizacao: registro.data_atualizacao
            ? new Date(registro.data_atualizacao).toLocaleString('pt-BR')
            : '',
          usuario_nome: registro.usuario_nome || ''
        });
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      const filename = `necessidades_padroes_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('[NecessidadesPadroesExportController] Erro ao exportar XLSX:', error);
      return errorResponse(res, 'Erro ao exportar padrões para XLSX', 500);
    }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');

      const filtros = {
        escola_id: req.query.escola_id,
        grupo_id: req.query.grupo_id,
        produto_id: req.query.produto_id
      };

      const registros = await carregarDados(filtros);

      const doc = new PDFDocument({
        margin: 40,
        layout: 'landscape',
        size: 'A4'
      });

      res.setHeader('Content-Type', 'application/pdf');
      const filename = `necessidades_padroes_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc.pipe(res);

      doc.fontSize(18).font('Helvetica-Bold').text('Relatório - Pedido Mensal (Necessidades Padrões)', {
        align: 'center'
      });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
        align: 'center'
      });
      doc.moveDown(1.5);

      const tableTop = doc.y;
      const columnWidths = [120, 80, 160, 70, 70, 120];

      const drawRow = (y, row) => {
        doc.fontSize(9).font('Helvetica');
        row.forEach((cell, index) => {
          doc.text(cell, 40 + columnWidths.slice(0, index).reduce((acc, cur) => acc + cur, 0), y, {
            width: columnWidths[index],
            align: index === 5 ? 'right' : 'left'
          });
        });
      };

      doc.font('Helvetica-Bold');
      drawRow(tableTop, [
        'Escola',
        'Grupo',
        'Produto',
        'Unidade',
        'Quantidade',
        'Atualizado por'
      ]);

      doc.moveTo(40, tableTop + 15)
        .lineTo(40 + columnWidths.reduce((acc, cur) => acc + cur, 0), tableTop + 15)
        .stroke();

      let currentY = tableTop + 25;
      doc.font('Helvetica');

      registros.forEach((registro) => {
        if (currentY > doc.page.height - 60) {
          doc.addPage();
          currentY = 50;
          doc.font('Helvetica-Bold');
          drawRow(currentY, [
            'Escola',
            'Grupo',
            'Produto',
            'Unidade',
            'Quantidade',
            'Atualizado por'
          ]);
          doc.moveTo(40, currentY + 15)
            .lineTo(40 + columnWidths.reduce((acc, cur) => acc + cur, 0), currentY + 15)
            .stroke();
          currentY += 25;
          doc.font('Helvetica');
        }

        drawRow(currentY, [
          registro.escola_nome || `Escola #${registro.escola_id}`,
          registro.grupo_nome || `Grupo #${registro.grupo_id}`,
          registro.produto_nome || `Produto #${registro.produto_id}`,
          registro.unidade_medida || '-',
          formatarNumero(registro.quantidade),
          registro.usuario_nome || 'N/I'
        ]);

        currentY += 18;
      });

      doc.end();
    } catch (error) {
      console.error('[NecessidadesPadroesExportController] Erro ao exportar PDF:', error);
      return errorResponse(res, 'Erro ao exportar padrões para PDF', 500);
    }
  }
}

module.exports = NecessidadesPadroesExportController;

