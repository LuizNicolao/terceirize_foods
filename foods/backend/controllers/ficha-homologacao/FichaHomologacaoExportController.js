const { executeQuery } = require('../../config/database');

class FichaHomologacaoExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Fichas de Homologação');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Tipo', key: 'tipo', width: 15 },
        { header: 'Data Análise', key: 'data_analise', width: 15 },
        { header: 'Nome Genérico', key: 'nome_generico', width: 40 },
        { header: 'Marca', key: 'marca', width: 25 },
        { header: 'Fornecedor', key: 'fornecedor', width: 30 },
        { header: 'Fabricante', key: 'fabricante', width: 25 },
        { header: 'Lote', key: 'lote', width: 15 },
        { header: 'Validade', key: 'validade', width: 15 },
        { header: 'Unidade Medida', key: 'unidade_medida', width: 15 },
        { header: 'Peso', key: 'peso', width: 10 },
        { header: 'Peso Cru', key: 'peso_cru', width: 10 },
        { header: 'Peso Cozido', key: 'peso_cozido', width: 12 },
        { header: 'Fator Cocção', key: 'fator_coccao', width: 12 },
        { header: 'Cor', key: 'cor', width: 10 },
        { header: 'Odor', key: 'odor', width: 10 },
        { header: 'Sabor', key: 'sabor', width: 10 },
        { header: 'Aparência', key: 'aparencia', width: 12 },
        { header: 'Avaliador', key: 'avaliador', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Criado Em', key: 'criado_em', width: 20 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, tipo, produto_generico_id, fornecedor_id, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (ng.nome LIKE ? OR ng.codigo LIKE ? OR f.razao_social LIKE ? OR f.nome_fantasia LIKE ? OR fh.marca LIKE ? OR fh.fabricante LIKE ? OR fh.lote LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND fh.status = ?';
        params.push(status);
      }

      if (tipo) {
        whereClause += ' AND fh.tipo = ?';
        params.push(tipo);
      }

      if (produto_generico_id) {
        whereClause += ' AND fh.produto_generico_id = ?';
        params.push(parseInt(produto_generico_id));
      }

      if (fornecedor_id) {
        whereClause += ' AND fh.fornecedor_id = ?';
        params.push(parseInt(fornecedor_id));
      }

      const query = `
        SELECT 
          fh.*,
          ng.nome as nome_generico_nome,
          ng.codigo as nome_generico_codigo,
          f.razao_social as fornecedor_nome,
          f.nome_fantasia as fornecedor_nome_fantasia,
          um.sigla as unidade_medida_sigla,
          um.nome as unidade_medida_nome,
          u.nome as avaliador_nome
        FROM ficha_homologacao fh
        LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
        LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
        LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
        LEFT JOIN usuarios u ON fh.avaliador_id = u.id
        ${whereClause}
        ORDER BY fh.data_analise DESC
        LIMIT ${parseInt(limit)}
      `;

      const fichasHomologacao = await executeQuery(query, params);

      fichasHomologacao.forEach(ficha => {
        worksheet.addRow({
          id: ficha.id,
          tipo: ficha.tipo === 'NOVO_PRODUTO' ? 'Novo Produto' : 'Reavaliação',
          data_analise: ficha.data_analise ? new Date(ficha.data_analise).toLocaleDateString('pt-BR') : '',
          nome_generico: ficha.nome_generico_nome || '',
          marca: ficha.marca_nome || '',
          fornecedor: ficha.fornecedor_nome || '',
          fabricante: ficha.fabricante || '',
          lote: ficha.lote || '',
          validade: ficha.validade ? new Date(ficha.validade).toLocaleDateString('pt-BR') : '',
          unidade_medida: ficha.unidade_medida_sigla || ficha.unidade_medida_nome || '',
          peso: ficha.peso || '',
          peso_cru: ficha.peso_cru || '',
          peso_cozido: ficha.peso_cozido || '',
          fator_coccao: ficha.fator_coccao || '',
          cor: ficha.cor || '',
          odor: ficha.odor || '',
          sabor: ficha.sabor || '',
          aparencia: ficha.aparencia || '',
          avaliador: ficha.avaliador_nome || '',
          status: ficha.status === 'ativo' ? 'Ativo' : 'Inativo',
          criado_em: ficha.criado_em ? new Date(ficha.criado_em).toLocaleString('pt-BR') : ''
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=ficha_homologacao_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      res.setHeader('Content-Disposition', `attachment; filename=ficha_homologacao_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Relatório de Fichas de Homologação', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      const { search, status, tipo, produto_generico_id, fornecedor_id, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (ng.nome LIKE ? OR ng.codigo LIKE ? OR f.razao_social LIKE ? OR f.nome_fantasia LIKE ? OR fh.marca LIKE ? OR fh.fabricante LIKE ? OR fh.lote LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND fh.status = ?';
        params.push(status);
      }

      if (tipo) {
        whereClause += ' AND fh.tipo = ?';
        params.push(tipo);
      }

      if (produto_generico_id) {
        whereClause += ' AND fh.produto_generico_id = ?';
        params.push(parseInt(produto_generico_id));
      }

      if (fornecedor_id) {
        whereClause += ' AND fh.fornecedor_id = ?';
        params.push(parseInt(fornecedor_id));
      }

      const query = `
        SELECT 
          fh.*,
          ng.nome as nome_generico_nome,
          ng.codigo as nome_generico_codigo,
          f.razao_social as fornecedor_nome,
          f.nome_fantasia as fornecedor_nome_fantasia,
          um.sigla as unidade_medida_sigla,
          um.nome as unidade_medida_nome,
          u.nome as avaliador_nome
        FROM ficha_homologacao fh
        LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
        LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
        LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
        LEFT JOIN usuarios u ON fh.avaliador_id = u.id
        ${whereClause}
        ORDER BY fh.data_analise DESC
        LIMIT ${parseInt(limit)}
      `;

      const fichasHomologacao = await executeQuery(query, params);

      fichasHomologacao.forEach((ficha, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(`Ficha #${ficha.id} - ${ficha.tipo === 'NOVO_PRODUTO' ? 'Novo Produto' : 'Reavaliação'}`);
        doc.fontSize(10).font('Helvetica');
        
        if (ficha.nome_generico_nome) doc.text(`Nome Genérico: ${ficha.nome_generico_nome}`);
        if (ficha.marca_nome) doc.text(`Marca: ${ficha.marca_nome}`);
        if (ficha.fornecedor_nome) doc.text(`Fornecedor: ${ficha.fornecedor_nome}`);
        if (ficha.fabricante) doc.text(`Fabricante: ${ficha.fabricante}`);
        if (ficha.data_analise) doc.text(`Data Análise: ${new Date(ficha.data_analise).toLocaleDateString('pt-BR')}`);
        if (ficha.lote) doc.text(`Lote: ${ficha.lote}`);
        if (ficha.validade) doc.text(`Validade: ${new Date(ficha.validade).toLocaleDateString('pt-BR')}`);
        if (ficha.unidade_medida_sigla || ficha.unidade_medida_nome) doc.text(`Unidade Medida: ${ficha.unidade_medida_sigla || ficha.unidade_medida_nome}`);
        if (ficha.peso) doc.text(`Peso: ${ficha.peso}`);
        if (ficha.peso_cru) doc.text(`Peso Cru: ${ficha.peso_cru}`);
        if (ficha.peso_cozido) doc.text(`Peso Cozido: ${ficha.peso_cozido}`);
        if (ficha.fator_coccao) doc.text(`Fator Cocção: ${ficha.fator_coccao}`);
        if (ficha.cor) doc.text(`Cor: ${ficha.cor}`);
        if (ficha.odor) doc.text(`Odor: ${ficha.odor}`);
        if (ficha.sabor) doc.text(`Sabor: ${ficha.sabor}`);
        if (ficha.aparencia) doc.text(`Aparência: ${ficha.aparencia}`);
        if (ficha.avaliador_nome) doc.text(`Avaliador: ${ficha.avaliador_nome}`);
        doc.text(`Status: ${ficha.status === 'ativo' ? 'Ativo' : 'Inativo'}`);
        
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

module.exports = FichaHomologacaoExportController;

