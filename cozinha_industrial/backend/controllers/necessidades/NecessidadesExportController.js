const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

/**
 * Controller para exportação de Necessidades
 * Exporta os itens das necessidades com todas as colunas detalhadas
 */
class NecessidadesExportController {
  /**
   * Exportar itens de necessidades para XLSX
   */
  static exportarXLSX = asyncHandler(async (req, res) => {
    const {
      filial_id,
      centro_custo_id,
      contrato_id,
      cardapio_id,
      mes_ref,
      ano,
      status
    } = req.query;

    // Construir WHERE clause
    let whereConditions = ['1=1'];
    const params = [];

    if (filial_id) {
      whereConditions.push('n.filial_id = ?');
      params.push(filial_id);
    }

    if (centro_custo_id) {
      whereConditions.push('n.centro_custo_id = ?');
      params.push(centro_custo_id);
    }

    if (contrato_id) {
      whereConditions.push('n.contrato_id = ?');
      params.push(contrato_id);
    }

    if (cardapio_id) {
      whereConditions.push('n.cardapio_id = ?');
      params.push(cardapio_id);
    }

    if (mes_ref) {
      whereConditions.push('n.mes_ref = ?');
      params.push(mes_ref);
    }

    if (ano) {
      whereConditions.push('n.ano = ?');
      params.push(ano);
    }

    if (status) {
      whereConditions.push('n.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Buscar todos os itens das necessidades que correspondem aos filtros
    const itens = await executeQuery(
      `SELECT 
        ni.nome_docardapio AS 'Nome do Cardápio',
        ni.mes_ref AS 'Mês Ref',
        ni.ano AS 'Ano',
        ni.filial_nome AS 'Filial',
        ni.centro_custo_nome AS 'Centro de Custo',
        ni.contrato_nome AS 'Contrato',
        ni.tipo_de_cardapio AS 'Tipo de Cardápio',
        ni.cozinha_industrial_nome AS 'Cozinha Industrial',
        ni.periodo_nome AS 'Período',
        ni.data_consumo AS 'Data Consumo',
        ni.prato_nome AS 'Prato',
        ni.produto_nome AS 'Produto',
        ni.percapta AS 'Percapta',
        ni.media_efetivos AS 'Média/Efetivos',
        ni.quantidade AS 'Quantidade',
        ni.ordem AS 'Ordem'
      FROM necessidades_itens ni
      INNER JOIN necessidades n ON n.id = ni.necessidade_id
      WHERE ${whereClause}
      ORDER BY ni.data_consumo, ni.cozinha_industrial_nome, ni.periodo_nome, ni.ordem, ni.prato_nome`,
      params
    );

    // Formatando os dados para o Excel
    const mesesAbreviados = {
      1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
      7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
    };

    const dadosFormatados = itens.map(item => ({
      'Nome do Cardápio': item['Nome do Cardápio'] || '',
      'Mês Ref': item['Mês Ref'] ? mesesAbreviados[item['Mês Ref']] || item['Mês Ref'] : '',
      'Ano': item['Ano'] || '',
      'Filial': item['Filial'] || '',
      'Centro de Custo': item['Centro de Custo'] || '',
      'Contrato': item['Contrato'] || '',
      'Tipo de Cardápio': item['Tipo de Cardápio'] || '',
      'Cozinha Industrial': item['Cozinha Industrial'] || '',
      'Período': item['Período'] || '',
      'Data Consumo': item['Data Consumo'] ? new Date(item['Data Consumo']).toLocaleDateString('pt-BR') : '',
      'Prato': item['Prato'] || '',
      'Produto': item['Produto'] || '',
      'Percapta': item['Percapta'] ? parseFloat(item['Percapta']).toFixed(6).replace('.', ',') : '0,000000',
      'Média/Efetivos': item['Média/Efetivos'] || 0,
      'Quantidade': item['Quantidade'] ? parseFloat(item['Quantidade']).toFixed(3).replace('.', ',') : '0,000',
      'Ordem': item['Ordem'] || 0
    }));

    // Criar workbook Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 25 }, // Nome do Cardápio
      { wch: 10 }, // Mês Ref
      { wch: 8 },  // Ano
      { wch: 20 }, // Filial
      { wch: 25 }, // Centro de Custo
      { wch: 25 }, // Contrato
      { wch: 25 }, // Tipo de Cardápio
      { wch: 25 }, // Cozinha Industrial
      { wch: 15 }, // Período
      { wch: 15 }, // Data Consumo
      { wch: 30 }, // Prato
      { wch: 30 }, // Produto
      { wch: 12 }, // Percapta
      { wch: 15 }, // Média/Efetivos
      { wch: 15 }, // Quantidade
      { wch: 8 }   // Ordem
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Necessidades');

    // Gerar buffer do arquivo
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers
    const fileName = `necessidades_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Enviar arquivo
    res.send(excelBuffer);
  });

  /**
   * Exportar itens de necessidades para PDF
   */
  static exportarPDF = asyncHandler(async (req, res) => {
    const {
      filial_id,
      centro_custo_id,
      contrato_id,
      cardapio_id,
      mes_ref,
      ano,
      status
    } = req.query;

    // Construir WHERE clause (mesma lógica do XLSX)
    let whereConditions = ['1=1'];
    const params = [];

    if (filial_id) {
      whereConditions.push('n.filial_id = ?');
      params.push(filial_id);
    }

    if (centro_custo_id) {
      whereConditions.push('n.centro_custo_id = ?');
      params.push(centro_custo_id);
    }

    if (contrato_id) {
      whereConditions.push('n.contrato_id = ?');
      params.push(contrato_id);
    }

    if (cardapio_id) {
      whereConditions.push('n.cardapio_id = ?');
      params.push(cardapio_id);
    }

    if (mes_ref) {
      whereConditions.push('n.mes_ref = ?');
      params.push(mes_ref);
    }

    if (ano) {
      whereConditions.push('n.ano = ?');
      params.push(ano);
    }

    if (status) {
      whereConditions.push('n.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Buscar todos os itens
    const itens = await executeQuery(
      `SELECT 
        ni.nome_docardapio,
        ni.mes_ref,
        ni.ano,
        ni.filial_nome,
        ni.centro_custo_nome,
        ni.contrato_nome,
        ni.tipo_de_cardapio,
        ni.cozinha_industrial_nome,
        ni.periodo_nome,
        ni.data_consumo,
        ni.prato_nome,
        ni.produto_nome,
        ni.percapta,
        ni.media_efetivos,
        ni.quantidade,
        ni.ordem
      FROM necessidades_itens ni
      INNER JOIN necessidades n ON n.id = ni.necessidade_id
      WHERE ${whereClause}
      ORDER BY ni.data_consumo, ni.cozinha_industrial_nome, ni.periodo_nome, ni.ordem, ni.prato_nome`,
      params
    );

    // Criar documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });

    // Configurar headers
    res.setHeader('Content-Type', 'application/pdf');
    const fileName = `necessidades_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Pipe do documento para a resposta
    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(16).font('Helvetica-Bold').text('Relatório de Necessidades', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(2);

    // Tabela
    const mesesAbreviados = {
      1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
      7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
    };

    // Cabeçalhos da tabela
    const headers = [
      'Cardápio', 'Mês', 'Ano', 'Filial', 'Centro Custo', 'Contrato',
      'Tipo', 'Cozinha', 'Período', 'Data', 'Prato', 'Produto',
      'Percapta', 'Média', 'Quantidade', 'Ordem'
    ];

    const colWidths = [70, 30, 30, 60, 70, 70, 60, 60, 50, 50, 80, 80, 50, 40, 50, 30];
    const startX = 50;
    let y = doc.y;

    // Desenhar cabeçalhos
    doc.fontSize(8).font('Helvetica-Bold');
    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x, y, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
    y += 20;

    // Linha separadora
    doc.moveTo(startX, y).lineTo(x, y).stroke();
    y += 10;

    // Dados
    doc.fontSize(7).font('Helvetica');
    let itemsPerPage = 0;
    const maxItemsPerPage = 15;

    for (const item of itens) {
      if (itemsPerPage >= maxItemsPerPage) {
        doc.addPage();
        y = 50;
        itemsPerPage = 0;

        // Redesenhar cabeçalhos
        doc.fontSize(8).font('Helvetica-Bold');
        x = startX;
        headers.forEach((header, i) => {
          doc.text(header, x, y, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });
        y += 20;
        doc.moveTo(startX, y).lineTo(x, y).stroke();
        y += 10;
        doc.fontSize(7).font('Helvetica');
      }

      const rowData = [
        item.nome_docardapio || '',
        item.mes_ref ? mesesAbreviados[item.mes_ref] || item.mes_ref : '',
        item.ano || '',
        item.filial_nome || '',
        item.centro_custo_nome || '',
        item.contrato_nome || '',
        item.tipo_de_cardapio || '',
        item.cozinha_industrial_nome || '',
        item.periodo_nome || '',
        item.data_consumo ? new Date(item.data_consumo).toLocaleDateString('pt-BR') : '',
        item.prato_nome || '',
        item.produto_nome || '',
        item.percapta ? parseFloat(item.percapta).toFixed(6) : '0.000000',
        item.media_efetivos || 0,
        item.quantidade ? parseFloat(item.quantidade).toFixed(3) : '0.000',
        item.ordem || 0
      ];

      x = startX;
      rowData.forEach((data, i) => {
        doc.text(String(data).substring(0, 20), x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      y += 15;
      itemsPerPage++;
    }

    // Finalizar documento
    doc.end();
  });
}

module.exports = NecessidadesExportController;
