const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { executeQuery } = require('../../config/database');
const { buscarEscolasIdsDaNutricionista } = require('../necessidades/utils/ajusteUtils');

/**
 * Monta cláusulas de filtro compartilhadas entre os exports.
 */
const buildFilters = async (req) => {
  const { escola_id, data_inicio, data_fim, limit = 1000 } = req.query;
  const { tipo_de_acesso: userType, email } = req.user;

  let whereClause = 'WHERE rd.ativo = 1';
  const params = [];

  if (userType === 'nutricionista') {
    try {
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      const escolasIds = await buscarEscolasIdsDaNutricionista(email, authToken);

      if (escolasIds.length > 0) {
        const placeholders = escolasIds.map(() => '?').join(',');
        whereClause += ` AND rd.escola_id IN (${placeholders})`;
        params.push(...escolasIds);
      } else {
        whereClause += ' AND 1=0';
      }
    } catch (error) {
      console.error('Erro ao buscar escolas da nutricionista:', error);
      whereClause += ' AND 1=0';
    }
  }

  if (escola_id) {
    whereClause += ' AND rd.escola_id = ?';
    params.push(escola_id);
  }

  if (data_inicio) {
    whereClause += ' AND rd.data >= ?';
    params.push(data_inicio);
  }

  if (data_fim) {
    whereClause += ' AND rd.data <= ?';
    params.push(data_fim);
  }

  const limitNum = Math.max(1, Math.min(5000, parseInt(limit, 10) || 1000));

  return { whereClause, params, limitNum };
};

/**
 * Busca os registros aplicando os filtros padronizados.
 */
const buscarRegistros = async (req) => {
  const { whereClause, params, limitNum } = await buildFilters(req);

  const subqueryWhere = whereClause.replace(/rd\./g, 'registros_diarios.');

  const query = `
    SELECT 
      rd.escola_id,
      MAX(rd.escola_nome) as escola_nome,
      rd.data,
      MAX(rd.nutricionista_id) as nutricionista_id,
      MAX(CASE WHEN rd.tipo_refeicao = 'lanche_manha' THEN rd.valor ELSE 0 END) as lanche_manha,
      MAX(CASE WHEN rd.tipo_refeicao IN ('parcial_manha','parcial') THEN rd.valor ELSE 0 END) as parcial_manha,
      MAX(CASE WHEN rd.tipo_refeicao = 'almoco' THEN rd.valor ELSE 0 END) as almoco,
      MAX(CASE WHEN rd.tipo_refeicao = 'lanche_tarde' THEN rd.valor ELSE 0 END) as lanche_tarde,
      MAX(CASE WHEN rd.tipo_refeicao = 'parcial_tarde' THEN rd.valor ELSE 0 END) as parcial_tarde,
      MAX(CASE WHEN rd.tipo_refeicao = 'parcial' THEN rd.valor ELSE 0 END) as parcial,
      MAX(CASE WHEN rd.tipo_refeicao = 'eja' THEN rd.valor ELSE 0 END) as eja,
      MIN(rd.data_cadastro) as data_cadastro,
      MAX(rd.data_atualizacao) as data_atualizacao
    FROM registros_diarios rd
    INNER JOIN (
      SELECT escola_id, MAX(data) as max_data
      FROM registros_diarios
      ${subqueryWhere}
      GROUP BY escola_id
    ) rd_recente ON rd.escola_id = rd_recente.escola_id AND rd.data = rd_recente.max_data
    ${whereClause}
    GROUP BY rd.escola_id, rd.data
    ORDER BY rd.data DESC, escola_nome ASC
    LIMIT ${limitNum}
  `;

  return executeQuery(query, params.concat(params));
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('pt-BR');
};

const formatNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : '';
};

/**
 * Exporta registros diários em XLSX.
 */
const exportarXLSX = async (req, res) => {
  try {
    const registros = await buscarRegistros(req);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registros Diários');

    worksheet.columns = [
      { header: 'Escola', key: 'escola', width: 40 },
      { header: 'Data', key: 'data', width: 15 },
      { header: 'Lanche Manhã', key: 'lanche_manha', width: 18 },
      { header: 'Parcial Manhã', key: 'parcial_manha', width: 18 },
      { header: 'Almoço', key: 'almoco', width: 15 },
      { header: 'Lanche Tarde', key: 'lanche_tarde', width: 18 },
      { header: 'Parcial Tarde', key: 'parcial_tarde', width: 18 },
      { header: 'EJA', key: 'eja', width: 10 },
      { header: 'Cadastrado em', key: 'data_cadastro', width: 18 },
      { header: 'Atualizado em', key: 'data_atualizacao', width: 18 }
    ];

    worksheet.getRow(1).font = { bold: true };

    registros.forEach((registro) => {
      worksheet.addRow({
        escola: registro.escola_nome || `Escola ID ${registro.escola_id}`,
        data: formatDate(registro.data),
        lanche_manha: formatNumber(registro.lanche_manha),
        parcial_manha: formatNumber(registro.parcial_manha ?? registro.parcial),
        almoco: formatNumber(registro.almoco),
        lanche_tarde: formatNumber(registro.lanche_tarde),
        parcial_tarde: formatNumber(registro.parcial_tarde),
        eja: formatNumber(registro.eja),
        data_cadastro: formatDate(registro.data_cadastro),
        data_atualizacao: formatDate(registro.data_atualizacao)
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `registros_diarios_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Erro ao exportar registros diários (XLSX):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao exportar registros diários em XLSX'
    });
  }
};

/**
 * Exporta registros diários em PDF.
 */
const exportarPDF = async (req, res) => {
  try {
    const registros = await buscarRegistros(req);

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const filename = `registros_diarios_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(18).text('Relatório de Registros Diários', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(1.5);

    const cols = {
      escola: 40,
      data: 230,
      lancheManha: 300,
      parcialManha: 370,
      almoco: 440,
      lancheTarde: 510,
      parcialTarde: 590,
      eja: 660,
      cadastro: 720,
      atualizacao: 805
    };

    const headerY = doc.y;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Escola', cols.escola, headerY, { width: 180 });
    doc.text('Data', cols.data, headerY, { width: 60 });
    doc.text('Lanche Manhã', cols.lancheManha, headerY, { width: 60 });
    doc.text('Parcial Manhã', cols.parcialManha, headerY, { width: 60 });
    doc.text('Almoço', cols.almoco, headerY, { width: 60 });
    doc.text('Lanche Tarde', cols.lancheTarde, headerY, { width: 60 });
    doc.text('Parcial Tarde', cols.parcialTarde, headerY, { width: 60 });
    doc.text('EJA', cols.eja, headerY, { width: 40 });
    doc.text('Cadastrado em', cols.cadastro, headerY, { width: 70 });
    doc.text('Atualizado em', cols.atualizacao, headerY, { width: 70 });

    doc.moveTo(40, headerY + 14).lineTo(820, headerY + 14).stroke();
    doc.y = headerY + 18;
    doc.font('Helvetica').fontSize(8);

    registros.forEach((registro) => {
      if (doc.y > 520) {
        doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
        doc.fontSize(9).font('Helvetica-Bold');
        const newHeaderY = doc.y;
        doc.text('Escola', cols.escola, newHeaderY, { width: 180 });
        doc.text('Data', cols.data, newHeaderY, { width: 60 });
        doc.text('Lanche Manhã', cols.lancheManha, newHeaderY, { width: 60 });
        doc.text('Parcial Manhã', cols.parcialManha, newHeaderY, { width: 60 });
        doc.text('Almoço', cols.almoco, newHeaderY, { width: 60 });
        doc.text('Lanche Tarde', cols.lancheTarde, newHeaderY, { width: 60 });
        doc.text('Parcial Tarde', cols.parcialTarde, newHeaderY, { width: 60 });
        doc.text('EJA', cols.eja, newHeaderY, { width: 40 });
        doc.text('Cadastrado em', cols.cadastro, newHeaderY, { width: 70 });
        doc.text('Atualizado em', cols.atualizacao, newHeaderY, { width: 70 });
        doc.moveTo(40, newHeaderY + 14).lineTo(820, newHeaderY + 14).stroke();
        doc.y = newHeaderY + 18;
        doc.font('Helvetica').fontSize(8);
      }

      doc.text((registro.escola_nome || `Escola ID ${registro.escola_id}`).slice(0, 60), cols.escola, doc.y, { width: 180 });
      doc.text(formatDate(registro.data), cols.data, doc.y, { width: 60 });
      doc.text(formatNumber(registro.lanche_manha)?.toString() || '-', cols.lancheManha, doc.y, { width: 60 });
      doc.text(formatNumber(registro.parcial_manha ?? registro.parcial)?.toString() || '-', cols.parcialManha, doc.y, { width: 60 });
      doc.text(formatNumber(registro.almoco)?.toString() || '-', cols.almoco, doc.y, { width: 60 });
      doc.text(formatNumber(registro.lanche_tarde)?.toString() || '-', cols.lancheTarde, doc.y, { width: 60 });
      doc.text(formatNumber(registro.parcial_tarde)?.toString() || '-', cols.parcialTarde, doc.y, { width: 60 });
      doc.text(formatNumber(registro.eja)?.toString() || '-', cols.eja, doc.y, { width: 40 });
      doc.text(formatDate(registro.data_cadastro) || '-', cols.cadastro, doc.y, { width: 70 });
      doc.text(formatDate(registro.data_atualizacao) || '-', cols.atualizacao, doc.y, { width: 70 });

      doc.moveTo(40, doc.y + 12).lineTo(820, doc.y + 12).strokeColor('#E5E7EB');
      doc.strokeColor('#000000');
      doc.y += 16;
    });

    doc.fontSize(9).font('Helvetica-Oblique');
    doc.text(`Total de registros: ${registros.length}`, 40, doc.page.height - 40);

    doc.end();
  } catch (error) {
    console.error('Erro ao exportar registros diários (PDF):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao exportar registros diários em PDF'
    });
  }
};

module.exports = {
  exportarXLSX,
  exportarPDF
};

