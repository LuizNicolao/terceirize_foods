const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { executeQuery } = require('../../config/database');
const axios = require('axios');

/**
 * Busca os IDs das unidades escolares vinculadas a uma nutricionista
 */
const buscarUnidadesIdsDaNutricionista = async (email, authToken) => {
  try {
    const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
    
    // Buscar rotas da nutricionista por email
    const response = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${encodeURIComponent(email)}&status=ativo`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data && response.data.success) {
      const rotas = response.data.data || [];
      const unidadesIds = [];
      
      // Extrair IDs das unidades das rotas
      rotas.forEach(rota => {
        if (rota.escolas_responsaveis) {
          const ids = rota.escolas_responsaveis.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          unidadesIds.push(...ids);
        }
      });

      return [...new Set(unidadesIds)]; // Remove duplicatas
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar unidades da nutricionista:', error);
    return [];
  }
};

/**
 * Monta cláusulas de filtro compartilhadas entre os exports.
 */
const buildFilters = async (req) => {
  const { unidade_id, data_inicio, data_fim } = req.query;
  const { tipo_de_acesso: userType, email } = req.user;

  let whereClause = 'WHERE qs.ativo = 1';
  const params = [];

  if (userType === 'nutricionista') {
    try {
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      const unidadesIds = await buscarUnidadesIdsDaNutricionista(email, authToken);

      if (unidadesIds.length > 0) {
        const placeholders = unidadesIds.map(() => '?').join(',');
        whereClause += ` AND qs.unidade_id IN (${placeholders})`;
        params.push(...unidadesIds);
      } else {
        whereClause += ' AND 1=0';
      }
    } catch (error) {
      console.error('Erro ao buscar unidades da nutricionista:', error);
      whereClause += ' AND 1=0';
    }
  }

  if (unidade_id) {
    whereClause += ' AND qs.unidade_id = ?';
    params.push(unidade_id);
  }

  if (data_inicio) {
    whereClause += ' AND qs.data >= ?';
    params.push(data_inicio);
  }

  if (data_fim) {
    whereClause += ' AND qs.data <= ?';
    params.push(data_fim);
  }

  return { whereClause, params };
};

/**
 * Busca os registros aplicando os filtros padronizados.
 * Para exportação, busca TODOS os registros (não apenas os mais recentes).
 * Adaptado para períodos dinâmicos - retorna dados em formato JSON para flexibilidade
 */
const buscarRegistros = async (req) => {
  const { whereClause, params } = await buildFilters(req);

  // Para exportação, buscamos todos os registros agrupados por unidade e data
  // Os períodos são dinâmicos, então retornamos em formato JSON
  const query = `
    SELECT 
      qs.unidade_id,
      MAX(qs.unidade_nome) as unidade_nome,
      qs.data,
      MAX(qs.nutricionista_id) as nutricionista_id,
      GROUP_CONCAT(
        CONCAT(qs.periodo_atendimento_id, ':', qs.valor)
        ORDER BY qs.periodo_atendimento_id
        SEPARATOR ','
      ) as periodos_valores,
      MIN(qs.criado_em) as data_cadastro,
      MAX(qs.atualizado_em) as data_atualizacao
    FROM quantidades_servidas qs
    ${whereClause}
    GROUP BY qs.unidade_id, qs.data
    ORDER BY qs.data DESC, unidade_nome ASC
  `;

  const registros = await executeQuery(query, params);
  
  // Processar os registros para incluir informações dos períodos
  // periodos_valores vem como string "1:150,2:200" - converter para objeto
  const registrosProcessados = registros.map(registro => {
    const quantidades = {};
    if (registro.periodos_valores) {
      registro.periodos_valores.split(',').forEach(item => {
        const [periodoId, valor] = item.split(':');
        if (periodoId && valor) {
          quantidades[periodoId] = parseInt(valor) || 0;
        }
      });
    }
    return {
      ...registro,
      quantidades
    };
  });
  
  return registrosProcessados;
};

/**
 * Busca as médias aplicando os filtros padronizados.
 * Adaptado para períodos dinâmicos
 */
const buscarMedias = async (req) => {
  const { unidade_id } = req.query;
  const { tipo_de_acesso: userType, email } = req.user;

  let whereClause = 'WHERE mqs.ativo = 1';
  const params = [];

  if (userType === 'nutricionista') {
    try {
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      const unidadesIds = await buscarUnidadesIdsDaNutricionista(email, authToken);

      if (unidadesIds.length > 0) {
        const placeholders = unidadesIds.map(() => '?').join(',');
        whereClause += ` AND mqs.unidade_id IN (${placeholders})`;
        params.push(...unidadesIds);
      } else {
        whereClause += ' AND 1=0';
      }
    } catch (error) {
      console.error('Erro ao buscar unidades da nutricionista:', error);
      whereClause += ' AND 1=0';
    }
  }

  if (unidade_id) {
    whereClause += ' AND mqs.unidade_id = ?';
    params.push(unidade_id);
  }

  // Buscar médias com períodos dinâmicos
  const query = `
    SELECT 
      mqs.unidade_id,
      mqs.unidade_nome,
      mqs.periodo_atendimento_id,
      mqs.media,
      mqs.quantidade_lancamentos,
      mqs.data_calculo
    FROM medias_quantidades_servidas mqs
    ${whereClause}
    ORDER BY mqs.unidade_nome ASC, mqs.periodo_atendimento_id ASC
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
 * Busca períodos ativos para exportação
 */
const buscarPeriodosParaExportacao = async (req) => {
  // Buscar todos os períodos ativos
  const periodosQuery = `
    SELECT id, nome, codigo 
    FROM periodos_atendimento 
    WHERE status = 'ativo' 
    ORDER BY nome
  `;
  return await executeQuery(periodosQuery);
};

/**
 * Exporta quantidades servidas em XLSX.
 * Adaptado para períodos dinâmicos
 */
const exportarXLSX = async (req, res) => {
  try {
    const { tipo = 'registros' } = req.query;
    
    let dados, worksheetName, filename;
    
    if (tipo === 'medias') {
      dados = await buscarMedias(req);
      worksheetName = 'Médias';
      filename = `medias_quantidades_servidas_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else {
      dados = await buscarRegistros(req);
      worksheetName = 'Quantidades Servidas';
      filename = `quantidades_servidas_${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(worksheetName);

    if (tipo === 'medias') {
      // Para médias, buscar períodos e criar colunas dinamicamente
      const periodos = await buscarPeriodosParaExportacao(req);
      
      const colunas = [
        { header: 'Unidade', key: 'unidade', width: 40 }
      ];
      
      periodos.forEach(periodo => {
        colunas.push({
          header: periodo.nome,
          key: `periodo_${periodo.id}`,
          width: 18
        });
      });
      
      colunas.push({ header: 'Atualizado em', key: 'data_atualizacao', width: 18 });
      
      worksheet.columns = colunas;
      worksheet.getRow(1).font = { bold: true };

      // Agrupar médias por unidade
      const mediasPorUnidade = {};
      dados.forEach(media => {
        if (!mediasPorUnidade[media.unidade_id]) {
          mediasPorUnidade[media.unidade_id] = {
            unidade_id: media.unidade_id,
            unidade_nome: media.unidade_nome,
            periodos: {},
            data_atualizacao: media.data_atualizacao
          };
        }
        mediasPorUnidade[media.unidade_id].periodos[media.periodo_atendimento_id] = media.media;
      });

      Object.values(mediasPorUnidade).forEach(media => {
        const row = {
          unidade: media.unidade_nome || `Unidade ID ${media.unidade_id}`,
          data_atualizacao: formatDate(media.data_atualizacao)
        };
        
        periodos.forEach(periodo => {
          row[`periodo_${periodo.id}`] = formatNumber(media.periodos[periodo.id]);
        });
        
        worksheet.addRow(row);
      });
    } else {
      // Para registros, buscar períodos e criar colunas dinamicamente
      const periodos = await buscarPeriodosParaExportacao(req);
      
      const colunas = [
        { header: 'Unidade', key: 'unidade', width: 40 },
        { header: 'Data', key: 'data', width: 15 }
      ];
      
      periodos.forEach(periodo => {
        colunas.push({
          header: periodo.nome,
          key: `periodo_${periodo.id}`,
          width: 18
        });
      });
      
      colunas.push(
        { header: 'Cadastrado em', key: 'data_cadastro', width: 18 },
        { header: 'Atualizado em', key: 'data_atualizacao', width: 18 }
      );
      
      worksheet.columns = colunas;
      worksheet.getRow(1).font = { bold: true };

      dados.forEach((registro) => {
        const row = {
          unidade: registro.unidade_nome || `Unidade ID ${registro.unidade_id}`,
          data: formatDate(registro.data),
          data_cadastro: formatDate(registro.data_cadastro),
          data_atualizacao: formatDate(registro.data_atualizacao)
        };
        
        periodos.forEach(periodo => {
          row[`periodo_${periodo.id}`] = formatNumber(registro.quantidades[periodo.id]);
        });
        
        worksheet.addRow(row);
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
 * Exporta quantidades servidas em PDF.
 * Adaptado para períodos dinâmicos
 */
const exportarPDF = async (req, res) => {
  try {
    const { tipo = 'registros' } = req.query;
    
    let dados, titulo, filename;
    
    if (tipo === 'medias') {
      dados = await buscarMedias(req);
      titulo = 'Relatório de Médias - Quantidades Servidas';
      filename = `medias_quantidades_servidas_${new Date().toISOString().split('T')[0]}.pdf`;
    } else {
      dados = await buscarRegistros(req);
      titulo = 'Relatório de Quantidades Servidas';
      filename = `quantidades_servidas_${new Date().toISOString().split('T')[0]}.pdf`;
    }

    // Buscar períodos para layout dinâmico
    const periodos = await buscarPeriodosParaExportacao(req);
    
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(18).text(titulo, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(1.5);

    // Calcular posições das colunas dinamicamente
    const calcularColunas = (periodos) => {
      const cols = {
        unidade: 40,
        data: tipo === 'medias' ? null : 200
      };
      
      let xPos = tipo === 'medias' ? 200 : 280;
      const colWidth = 70;
      
      periodos.forEach(periodo => {
        cols[`periodo_${periodo.id}`] = xPos;
        xPos += colWidth;
      });
      
      if (tipo === 'medias') {
        cols.atualizacao = xPos;
      } else {
        cols.cadastro = xPos;
        cols.atualizacao = xPos + 80;
      }
      
      return cols;
    };

    const cols = calcularColunas(periodos);
    const maxWidth = tipo === 'medias' ? cols.atualizacao + 100 : cols.atualizacao + 100;

    const renderHeader = (y) => {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Unidade', cols.unidade, y, { width: tipo === 'medias' ? 150 : 150 });
      
      if (tipo !== 'medias') {
        doc.text('Data', cols.data, y, { width: 60 });
      }
      
      periodos.forEach(periodo => {
        const x = cols[`periodo_${periodo.id}`];
        const nome = periodo.nome.length > 12 ? periodo.nome.substring(0, 12) : periodo.nome;
        doc.text(nome, x, y, { width: 60 });
      });
      
      if (tipo === 'medias') {
        doc.text('Atualizado em', cols.atualizacao, y, { width: 100 });
      } else {
        doc.text('Cadastrado em', cols.cadastro, y, { width: 70 });
        doc.text('Atualizado em', cols.atualizacao, y, { width: 70 });
      }
    };

    if (tipo === 'medias') {
      // Agrupar médias por unidade
      const mediasPorUnidade = {};
      dados.forEach(media => {
        if (!mediasPorUnidade[media.unidade_id]) {
          mediasPorUnidade[media.unidade_id] = {
            unidade_id: media.unidade_id,
            unidade_nome: media.unidade_nome,
            periodos: {},
            data_atualizacao: media.data_atualizacao
          };
        }
        mediasPorUnidade[media.unidade_id].periodos[media.periodo_atendimento_id] = media.media;
      });

      const headerY = doc.y;
      renderHeader(headerY);
      doc.moveTo(40, headerY + 14).lineTo(maxWidth, headerY + 14).stroke();
      doc.y = headerY + 18;
      doc.font('Helvetica').fontSize(8);

      Object.values(mediasPorUnidade).forEach((media) => {
        if (doc.y > 520) {
          doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
          const newHeaderY = doc.y;
          renderHeader(newHeaderY);
          doc.moveTo(40, newHeaderY + 14).lineTo(maxWidth, newHeaderY + 14).stroke();
          doc.y = newHeaderY + 18;
          doc.font('Helvetica').fontSize(8);
        }

        doc.text((media.unidade_nome || `Unidade ID ${media.unidade_id}`).slice(0, 50), cols.unidade, doc.y, { width: 150 });
        
        periodos.forEach(periodo => {
          const x = cols[`periodo_${periodo.id}`];
          const valor = formatNumber(media.periodos[periodo.id])?.toString() || '-';
          doc.text(valor, x, doc.y, { width: 60 });
        });
        
        doc.text(formatDate(media.data_atualizacao) || '-', cols.atualizacao, doc.y, { width: 100 });

        doc.moveTo(40, doc.y + 12).lineTo(maxWidth, doc.y + 12).strokeColor('#E5E7EB');
        doc.strokeColor('#000000');
        doc.y += 16;
      });

      doc.fontSize(9).font('Helvetica-Oblique');
      doc.text(`Total de unidades: ${Object.keys(mediasPorUnidade).length}`, 40, doc.page.height - 40);
    } else {
      const headerY = doc.y;
      renderHeader(headerY);
      doc.moveTo(40, headerY + 14).lineTo(maxWidth, headerY + 14).stroke();
      doc.y = headerY + 18;
      doc.font('Helvetica').fontSize(8);

      dados.forEach((registro) => {
        if (doc.y > 520) {
          doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
          const newHeaderY = doc.y;
          renderHeader(newHeaderY);
          doc.moveTo(40, newHeaderY + 14).lineTo(maxWidth, newHeaderY + 14).stroke();
          doc.y = newHeaderY + 18;
          doc.font('Helvetica').fontSize(8);
        }

        doc.text((registro.unidade_nome || `Unidade ID ${registro.unidade_id}`).slice(0, 60), cols.unidade, doc.y, { width: 150 });
        doc.text(formatDate(registro.data), cols.data, doc.y, { width: 60 });
        
        periodos.forEach(periodo => {
          const x = cols[`periodo_${periodo.id}`];
          const valor = formatNumber(registro.quantidades[periodo.id])?.toString() || '-';
          doc.text(valor, x, doc.y, { width: 60 });
        });
        
        doc.text(formatDate(registro.data_cadastro) || '-', cols.cadastro, doc.y, { width: 70 });
        doc.text(formatDate(registro.data_atualizacao) || '-', cols.atualizacao, doc.y, { width: 70 });

        doc.moveTo(40, doc.y + 12).lineTo(maxWidth, doc.y + 12).strokeColor('#E5E7EB');
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

