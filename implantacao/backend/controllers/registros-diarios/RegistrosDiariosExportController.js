const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { executeQuery } = require('../../config/database');
const { buscarEscolasIdsDaNutricionista } = require('../necessidades/utils/ajusteUtils');

/**
 * Monta cláusulas de filtro compartilhadas entre os exports.
 */
const buildFilters = async (req) => {
  const { escola_id, data_inicio, data_fim } = req.query;
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

  return { whereClause, params };
};

/**
 * Busca os registros aplicando os filtros padronizados.
 * Para exportação, busca TODOS os registros (não apenas os mais recentes).
 */
const buscarRegistros = async (req) => {
  const { whereClause, params } = await buildFilters(req);

  // Para exportação, não limitamos aos registros mais recentes
  // Buscamos todos os registros agrupados por escola e data
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
    ${whereClause}
    GROUP BY rd.escola_id, rd.data
    ORDER BY rd.data DESC, escola_nome ASC
  `;

  return executeQuery(query, params);
};

/**
 * Busca as médias aplicando os filtros padronizados.
 */
const buscarMedias = async (req) => {
  const { escola_id } = req.query;
  const { tipo_de_acesso: userType, email } = req.user;

  let whereClause = 'WHERE me.ativo = 1';
  const params = [];

  if (userType === 'nutricionista') {
    try {
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      const escolasIds = await buscarEscolasIdsDaNutricionista(email, authToken);

      if (escolasIds.length > 0) {
        const placeholders = escolasIds.map(() => '?').join(',');
        whereClause += ` AND me.escola_id IN (${placeholders})`;
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
    whereClause += ' AND me.escola_id = ?';
    params.push(escola_id);
  }

  const query = `
    SELECT 
      me.escola_id,
      me.escola_nome,
      me.media_lanche_manha as lanche_manha,
      me.media_parcial_manha as parcial_manha,
      me.media_almoco as almoco,
      me.media_lanche_tarde as lanche_tarde,
      me.media_parcial_tarde as parcial_tarde,
      me.media_eja as eja,
      me.data_atualizacao
    FROM media_escolas me
    ${whereClause}
    ORDER BY me.escola_nome ASC
  `;

  return executeQuery(query, params);
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
    const { tipo = 'registros' } = req.query;
    
    let dados, worksheetName, filename;
    
    if (tipo === 'medias') {
      dados = await buscarMedias(req);
      worksheetName = 'Médias';
      filename = `medias_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else {
      dados = await buscarRegistros(req);
      worksheetName = 'Registros Diários';
      filename = `registros_diarios_${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(worksheetName);

    if (tipo === 'medias') {
      // Colunas para médias
      worksheet.columns = [
        { header: 'Escola', key: 'escola', width: 40 },
        { header: 'Lanche Manhã', key: 'lanche_manha', width: 18 },
        { header: 'Parcial Manhã', key: 'parcial_manha', width: 18 },
        { header: 'Almoço', key: 'almoco', width: 15 },
        { header: 'Lanche Tarde', key: 'lanche_tarde', width: 18 },
        { header: 'Parcial Tarde', key: 'parcial_tarde', width: 18 },
        { header: 'EJA', key: 'eja', width: 10 },
        { header: 'Atualizado em', key: 'data_atualizacao', width: 18 }
      ];

      worksheet.getRow(1).font = { bold: true };

      dados.forEach((media) => {
        worksheet.addRow({
          escola: media.escola_nome || `Escola ID ${media.escola_id}`,
          lanche_manha: formatNumber(media.lanche_manha),
          parcial_manha: formatNumber(media.parcial_manha),
          almoco: formatNumber(media.almoco),
          lanche_tarde: formatNumber(media.lanche_tarde),
          parcial_tarde: formatNumber(media.parcial_tarde),
          eja: formatNumber(media.eja),
          data_atualizacao: formatDate(media.data_atualizacao)
        });
      });
    } else {
      // Colunas para registros diários
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

      dados.forEach((registro) => {
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
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Erro ao exportar (XLSX):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao exportar em XLSX'
    });
  }
};

/**
 * Exporta registros diários em PDF.
 */
const exportarPDF = async (req, res) => {
  try {
    const { tipo = 'registros' } = req.query;
    
    let dados, titulo, filename;
    
    if (tipo === 'medias') {
      dados = await buscarMedias(req);
      titulo = 'Relatório de Médias';
      filename = `medias_${new Date().toISOString().split('T')[0]}.pdf`;
    } else {
      dados = await buscarRegistros(req);
      titulo = 'Relatório de Registros Diários';
      filename = `registros_diarios_${new Date().toISOString().split('T')[0]}.pdf`;
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(18).text(titulo, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(1.5);

    if (tipo === 'medias') {
      // Layout para médias
      const cols = {
        escola: 40,
        lancheManha: 200,
        parcialManha: 280,
        almoco: 360,
        lancheTarde: 440,
        parcialTarde: 520,
        eja: 600,
        atualizacao: 680
      };

      const headerY = doc.y;
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Escola', cols.escola, headerY, { width: 150 });
      doc.text('Lanche Manhã', cols.lancheManha, headerY, { width: 70 });
      doc.text('Parcial Manhã', cols.parcialManha, headerY, { width: 70 });
      doc.text('Almoço', cols.almoco, headerY, { width: 70 });
      doc.text('Lanche Tarde', cols.lancheTarde, headerY, { width: 70 });
      doc.text('Parcial Tarde', cols.parcialTarde, headerY, { width: 70 });
      doc.text('EJA', cols.eja, headerY, { width: 50 });
      doc.text('Atualizado em', cols.atualizacao, headerY, { width: 100 });

      doc.moveTo(40, headerY + 14).lineTo(820, headerY + 14).stroke();
      doc.y = headerY + 18;
      doc.font('Helvetica').fontSize(8);

      dados.forEach((media) => {
        if (doc.y > 520) {
          doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
          doc.fontSize(9).font('Helvetica-Bold');
          const newHeaderY = doc.y;
          doc.text('Escola', cols.escola, newHeaderY, { width: 150 });
          doc.text('Lanche Manhã', cols.lancheManha, newHeaderY, { width: 70 });
          doc.text('Parcial Manhã', cols.parcialManha, newHeaderY, { width: 70 });
          doc.text('Almoço', cols.almoco, newHeaderY, { width: 70 });
          doc.text('Lanche Tarde', cols.lancheTarde, newHeaderY, { width: 70 });
          doc.text('Parcial Tarde', cols.parcialTarde, newHeaderY, { width: 70 });
          doc.text('EJA', cols.eja, newHeaderY, { width: 50 });
          doc.text('Atualizado em', cols.atualizacao, newHeaderY, { width: 100 });
          doc.moveTo(40, newHeaderY + 14).lineTo(820, newHeaderY + 14).stroke();
          doc.y = newHeaderY + 18;
          doc.font('Helvetica').fontSize(8);
        }

        doc.text((media.escola_nome || `Escola ID ${media.escola_id}`).slice(0, 50), cols.escola, doc.y, { width: 150 });
        doc.text(formatNumber(media.lanche_manha)?.toString() || '-', cols.lancheManha, doc.y, { width: 70 });
        doc.text(formatNumber(media.parcial_manha)?.toString() || '-', cols.parcialManha, doc.y, { width: 70 });
        doc.text(formatNumber(media.almoco)?.toString() || '-', cols.almoco, doc.y, { width: 70 });
        doc.text(formatNumber(media.lanche_tarde)?.toString() || '-', cols.lancheTarde, doc.y, { width: 70 });
        doc.text(formatNumber(media.parcial_tarde)?.toString() || '-', cols.parcialTarde, doc.y, { width: 70 });
        doc.text(formatNumber(media.eja)?.toString() || '-', cols.eja, doc.y, { width: 50 });
        doc.text(formatDate(media.data_atualizacao) || '-', cols.atualizacao, doc.y, { width: 100 });

        doc.moveTo(40, doc.y + 12).lineTo(820, doc.y + 12).strokeColor('#E5E7EB');
        doc.strokeColor('#000000');
        doc.y += 16;
      });

      doc.fontSize(9).font('Helvetica-Oblique');
      doc.text(`Total de escolas: ${dados.length}`, 40, doc.page.height - 40);
    } else {
      // Layout para registros diários
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

      dados.forEach((registro) => {
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
      doc.text(`Total de registros: ${dados.length}`, 40, doc.page.height - 40);
    }

    doc.end();
  } catch (error) {
    console.error('Erro ao exportar (PDF):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao exportar em PDF'
    });
  }
};

module.exports = {
  exportarXLSX,
  exportarPDF
};

