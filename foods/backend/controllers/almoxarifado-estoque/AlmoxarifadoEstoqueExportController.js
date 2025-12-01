/**
 * Controller de Exportação de Almoxarifado Estoque
 * Responsável por exportar estoques para XLSX e PDF
 */

const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');

class AlmoxarifadoEstoqueExportController {
  
  /**
   * Exportar estoques para XLSX
   * GET /api/almoxarifado-estoque/export/xlsx
   */
  static exportarXLSX = asyncHandler(async (req, res) => {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Estoques');

      // Definir cabeçalhos (mesmas colunas da grid)
      worksheet.columns = [
        { header: 'Código Produto', key: 'produto_generico_codigo', width: 15 },
        { header: 'Nome Produto', key: 'produto_generico_nome', width: 40 },
        { header: 'Unidade de Medida', key: 'unidade_medida', width: 15 },
        { header: 'Quantidade em Estoque', key: 'quantidade_atual', width: 20 },
        { header: 'Valor Unitário', key: 'valor_unitario_medio', width: 15 },
        { header: 'Valor Total', key: 'valor_total', width: 15 }
      ];

      // Estilizar cabeçalhos
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF22C55E' } // Verde
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Aplicar filtros (mesmos da listagem)
      const { search = '', status, almoxarifado_id, produto_generico_id, filial_id, grupo_id, subgrupo_id, limit = 10000 } = req.query;

      let baseQuery = `
        SELECT 
          pg.id as produto_generico_id,
          pg.nome as produto_generico_nome,
          pg.codigo as produto_generico_codigo,
          COALESCE(ae.grupo_id, pg.grupo_id) as grupo_id,
          COALESCE(ae.grupo_nome, g.nome) as grupo_nome,
          pg.subgrupo_id,
          sg.nome as subgrupo_nome,
          um.sigla as unidade_medida_sigla,
          um.nome as unidade_medida_nome,
          SUM(ae.quantidade_atual) as quantidade_atual,
          SUM(ae.quantidade_reservada) as quantidade_reservada,
          SUM(ae.quantidade_disponivel) as quantidade_disponivel,
          AVG(ae.valor_unitario_medio) as valor_unitario_medio,
          SUM(ae.valor_total) as valor_total,
          MIN(ae.estoque_minimo) as estoque_minimo,
          MAX(ae.estoque_maximo) as estoque_maximo
        FROM almoxarifado_estoque ae
        LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
        LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
        LEFT JOIN grupos g ON COALESCE(ae.grupo_id, pg.grupo_id) = g.id
        LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
        LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
        WHERE 1=1
      `;
      
      let params = [];

      // Aplicar filtros
      if (search) {
        baseQuery += ' AND (LOWER(pg.nome) LIKE ? OR LOWER(pg.codigo) LIKE ? OR LOWER(a.nome) LIKE ? OR LOWER(ae.lote) LIKE ?)';
        const searchTerm = `%${search.toLowerCase()}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (status && status !== '') {
        baseQuery += ' AND ae.status = ?';
        params.push(status);
      }

      if (almoxarifado_id) {
        baseQuery += ' AND ae.almoxarifado_id = ?';
        params.push(almoxarifado_id);
      }

      if (produto_generico_id) {
        baseQuery += ' AND ae.produto_generico_id = ?';
        params.push(produto_generico_id);
      }

      if (filial_id) {
        baseQuery += ' AND a.filial_id = ?';
        params.push(filial_id);
      }

      if (grupo_id) {
        baseQuery += ' AND COALESCE(ae.grupo_id, pg.grupo_id) = ?';
        params.push(grupo_id);
      }

      if (subgrupo_id) {
        baseQuery += ' AND pg.subgrupo_id = ?';
        params.push(subgrupo_id);
      }

      baseQuery += ' GROUP BY pg.id, pg.nome, pg.codigo, COALESCE(ae.grupo_id, pg.grupo_id), COALESCE(ae.grupo_nome, g.nome), pg.subgrupo_id, sg.nome, um.sigla, um.nome';
      baseQuery += ' ORDER BY pg.nome ASC';
      baseQuery += ` LIMIT ${parseInt(limit)}`;

      const estoques = await executeQuery(baseQuery, params);

      // Adicionar dados
      estoques.forEach(estoque => {
        worksheet.addRow({
          produto_generico_codigo: estoque.produto_generico_codigo || '-',
          produto_generico_nome: estoque.produto_generico_nome || '-',
          unidade_medida: estoque.unidade_medida_sigla || estoque.unidade_medida_nome || '-',
          quantidade_atual: parseFloat(estoque.quantidade_atual) || 0,
          valor_unitario_medio: parseFloat(estoque.valor_unitario_medio) || 0,
          valor_total: parseFloat(estoque.valor_total) || 0
        });
      });

      // Formatar colunas numéricas
      worksheet.getColumn('quantidade_atual').numFmt = '#,##0.000';
      worksheet.getColumn('valor_unitario_medio').numFmt = 'R$ #,##0.00';
      worksheet.getColumn('valor_total').numFmt = 'R$ #,##0.00';

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=estoques_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar estoques para XLSX:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar os estoques'
      });
    }
  });
  
  /**
   * Exportar estoques para PDF
   * GET /api/almoxarifado-estoque/export/pdf
   */
  static exportarPDF = asyncHandler(async (req, res) => {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=estoques_${new Date().toISOString().split('T')[0]}.pdf`);

      doc.pipe(res);

      // Título
      doc.fontSize(20).text('Relatório de Estoques', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Aplicar filtros (mesmos da listagem)
      const { search = '', status, almoxarifado_id, produto_generico_id, filial_id, grupo_id, subgrupo_id, limit = 1000 } = req.query;

      let baseQuery = `
        SELECT 
          pg.id as produto_generico_id,
          pg.nome as produto_generico_nome,
          pg.codigo as produto_generico_codigo,
          COALESCE(ae.grupo_id, pg.grupo_id) as grupo_id,
          COALESCE(ae.grupo_nome, g.nome) as grupo_nome,
          pg.subgrupo_id,
          sg.nome as subgrupo_nome,
          um.sigla as unidade_medida_sigla,
          um.nome as unidade_medida_nome,
          SUM(ae.quantidade_atual) as quantidade_atual,
          SUM(ae.quantidade_reservada) as quantidade_reservada,
          SUM(ae.quantidade_disponivel) as quantidade_disponivel,
          AVG(ae.valor_unitario_medio) as valor_unitario_medio,
          SUM(ae.valor_total) as valor_total,
          MIN(ae.estoque_minimo) as estoque_minimo,
          MAX(ae.estoque_maximo) as estoque_maximo
        FROM almoxarifado_estoque ae
        LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
        LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
        LEFT JOIN grupos g ON COALESCE(ae.grupo_id, pg.grupo_id) = g.id
        LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
        LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
        WHERE 1=1
      `;
      
      let params = [];

      // Aplicar filtros
      if (search) {
        baseQuery += ' AND (LOWER(pg.nome) LIKE ? OR LOWER(pg.codigo) LIKE ? OR LOWER(a.nome) LIKE ? OR LOWER(ae.lote) LIKE ?)';
        const searchTerm = `%${search.toLowerCase()}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (status && status !== '') {
        baseQuery += ' AND ae.status = ?';
        params.push(status);
      }

      if (almoxarifado_id) {
        baseQuery += ' AND ae.almoxarifado_id = ?';
        params.push(almoxarifado_id);
      }

      if (produto_generico_id) {
        baseQuery += ' AND ae.produto_generico_id = ?';
        params.push(produto_generico_id);
      }

      if (filial_id) {
        baseQuery += ' AND a.filial_id = ?';
        params.push(filial_id);
      }

      if (grupo_id) {
        baseQuery += ' AND COALESCE(ae.grupo_id, pg.grupo_id) = ?';
        params.push(grupo_id);
      }

      if (subgrupo_id) {
        baseQuery += ' AND pg.subgrupo_id = ?';
        params.push(subgrupo_id);
      }

      baseQuery += ' GROUP BY pg.id, pg.nome, pg.codigo, COALESCE(ae.grupo_id, pg.grupo_id), COALESCE(ae.grupo_nome, g.nome), pg.subgrupo_id, sg.nome, um.sigla, um.nome';
      baseQuery += ' ORDER BY pg.nome ASC';
      baseQuery += ` LIMIT ${parseInt(limit)}`;

      const estoques = await executeQuery(baseQuery, params);

      // Adicionar estoques ao PDF
      estoques.forEach((estoque, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(`${estoque.produto_generico_codigo || '-'} - ${estoque.produto_generico_nome || '-'}`);
        doc.fontSize(10).font('Helvetica');
        
        doc.text(`Unidade de Medida: ${estoque.unidade_medida_sigla || estoque.unidade_medida_nome || '-'}`);
        doc.text(`Quantidade em Estoque: ${(parseFloat(estoque.quantidade_atual) || 0).toFixed(3)}`);
        doc.text(`Valor Unitário: R$ ${(parseFloat(estoque.valor_unitario_medio) || 0).toFixed(2)}`);
        doc.text(`Valor Total: R$ ${(parseFloat(estoque.valor_total) || 0).toFixed(2)}`);
        
        // Linha separadora
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      // Finalizar documento
      doc.end();

    } catch (error) {
      console.error('Erro ao exportar estoques para PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar os estoques'
      });
    }
  });
  
  /**
   * Exportar variações de um produto para PDF
   * GET /api/almoxarifado-estoque/produto/:produto_generico_id/export/pdf
   */
  static exportarVariacoesPDF = asyncHandler(async (req, res) => {
    try {
      const { produto_generico_id } = req.params;
      const PDFDocument = require('pdfkit');
      
      // Buscar informações do produto
      const produtoQuery = `
        SELECT 
          pg.id,
          pg.codigo,
          pg.nome,
          um.sigla as unidade_medida_sigla,
          um.nome as unidade_medida_nome
        FROM produto_generico pg
        LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
        WHERE pg.id = ?
      `;
      
      const produtos = await executeQuery(produtoQuery, [produto_generico_id]);
      
      if (!produtos || produtos.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
      
      const produto = produtos[0];
      
      // Buscar variações do produto
      const variacoesQuery = `
        SELECT 
          ae.id,
          ae.produto_generico_id,
          pg.codigo as produto_generico_codigo,
          pg.nome as produto_generico_nome,
          um.sigla as unidade_medida_sigla,
          um.nome as unidade_medida_nome,
          ae.lote,
          ae.data_validade,
          ae.quantidade_atual,
          ae.valor_unitario_medio,
          ae.valor_total,
          a.codigo as almoxarifado_codigo,
          a.nome as almoxarifado_nome
        FROM almoxarifado_estoque ae
        LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
        LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
        LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
        WHERE ae.produto_generico_id = ?
        ORDER BY ae.lote ASC, ae.data_validade ASC
      `;
      
      const variacoes = await executeQuery(variacoesQuery, [produto_generico_id]);
      
      // Criar documento PDF em modo paisagem
      const doc = new PDFDocument({ 
        margin: 30,
        size: 'A4',
        layout: 'landscape'
      });
      
      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      const nomeArquivo = `estoque_${produto.codigo || produto.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}`);
      
      doc.pipe(res);
      
      // Título
      doc.fontSize(16).font('Helvetica-Bold').text('Visualização de Estoque', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(1);
      
      // Informações do Produto
      doc.fontSize(12).font('Helvetica-Bold').text('Informações do Produto', 30, doc.y);
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Código: ${produto.codigo || '-'}`, 30, doc.y);
      doc.text(`Nome: ${produto.nome || '-'}`, 30, doc.y);
      doc.text(`Unidade de Medida: ${produto.unidade_medida_sigla || produto.unidade_medida_nome || '-'}`, 30, doc.y);
      
      // Calcular totais
      const quantidadeTotal = variacoes.reduce((sum, v) => sum + (parseFloat(v.quantidade_atual) || 0), 0);
      const valorTotal = variacoes.reduce((sum, v) => sum + (parseFloat(v.valor_total) || 0), 0);
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold');
      doc.text(`Quantidade Total: ${quantidadeTotal.toFixed(3)}`, 30, doc.y);
      doc.text(`Valor Total do Estoque: R$ ${valorTotal.toFixed(2)}`, 30, doc.y);
      doc.font('Helvetica');
      
      doc.moveDown(1);
      
      // Tabela de variações
      if (variacoes && variacoes.length > 0) {
        const tableTop = doc.y;
        const itemHeight = 20;
        const startX = 30;
        const colWidths = [60, 120, 40, 50, 50, 60, 60, 60]; // Larguras das colunas
        let currentY = tableTop;
        
        // Cabeçalho da tabela
        doc.fontSize(9).font('Helvetica-Bold');
        const headers = ['Código', 'Nome Produto', 'Unidade', 'Lote', 'Validade', 'Quantidade', 'Valor Unit.', 'Valor Total'];
        let xPos = startX;
        
        headers.forEach((header, index) => {
          doc.text(header, xPos, currentY);
          xPos += colWidths[index];
        });
        
        // Linha abaixo do cabeçalho
        currentY += itemHeight;
        doc.strokeColor('#22c55e').lineWidth(2).moveTo(startX, currentY).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY).stroke();
        currentY += 5;
        
        // Dados da tabela
        doc.fontSize(8).font('Helvetica');
        variacoes.forEach((variacao, index) => {
          // Verificar se precisa de nova página
          if (currentY > 500) {
            doc.addPage();
            currentY = 30;
          }
          
          xPos = startX;
          
          // Código Produto
          doc.text(variacao.produto_generico_codigo || '-', xPos, currentY);
          xPos += colWidths[0];
          
          // Nome Produto
          const nomeProduto = (variacao.produto_generico_nome || '-').substring(0, 25);
          doc.text(nomeProduto, xPos, currentY);
          xPos += colWidths[1];
          
          // Unidade de Medida
          doc.text(variacao.unidade_medida_sigla || variacao.unidade_medida_nome || '-', xPos, currentY);
          xPos += colWidths[2];
          
          // Lote
          doc.text(variacao.lote || '-', xPos, currentY);
          xPos += colWidths[3];
          
          // Validade
          const validade = variacao.data_validade 
            ? new Date(variacao.data_validade).toLocaleDateString('pt-BR')
            : '-';
          doc.text(validade, xPos, currentY);
          xPos += colWidths[4];
          
          // Quantidade
          doc.text((parseFloat(variacao.quantidade_atual) || 0).toFixed(3), xPos, currentY);
          xPos += colWidths[5];
          
          // Valor Unitário
          doc.text(`R$ ${(parseFloat(variacao.valor_unitario_medio) || 0).toFixed(2)}`, xPos, currentY);
          xPos += colWidths[6];
          
          // Valor Total
          doc.text(`R$ ${(parseFloat(variacao.valor_total) || 0).toFixed(2)}`, xPos, currentY);
          
          currentY += itemHeight;
          
          // Linha separadora
          if (index < variacoes.length - 1) {
            doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(startX, currentY - 5).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY - 5).stroke();
          }
        });
        
        // Linha final
        currentY += 5;
        doc.strokeColor('#22c55e').lineWidth(2).moveTo(startX, currentY).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY).stroke();
      } else {
        doc.fontSize(10).text('Nenhuma variação encontrada.', 30, doc.y);
      }
      
      // Finalizar documento
      doc.end();
      
    } catch (error) {
      console.error('Erro ao exportar variações para PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar as variações'
      });
    }
  });
}

module.exports = AlmoxarifadoEstoqueExportController;

