const { executeQuery } = require('../../config/database');

/**
 * Controller para exportação de substituições de necessidades
 */
class SubstituicoesExportController {
  /**
   * Exportar substituições para XLSX (Coordenação)
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
      const ws = wb.addWorksheet('Substituições');

      // Definir colunas
      ws.columns = [
        { header: 'Código Origem', key: 'codigo_origem', width: 15 },
        { header: 'Produto Origem', key: 'produto_origem_nome', width: 40 },
        { header: 'Unidade Origem', key: 'produto_origem_unidade', width: 15 },
        { header: 'Código Genérico', key: 'produto_generico_codigo', width: 15 },
        { header: 'Produto Genérico', key: 'produto_generico_nome', width: 40 },
        { header: 'Unidade Genérico', key: 'produto_generico_unidade', width: 15 },
        { header: 'Quantidade Origem', key: 'quantidade_origem', width: 18 },
        { header: 'Quantidade Genérico', key: 'quantidade_generico', width: 18 },
        { header: 'Escola ID', key: 'escola_id', width: 12 },
        { header: 'Escola', key: 'escola_nome', width: 40 },
        { header: 'Semana Abastecimento', key: 'semana_abastecimento', width: 22 },
        { header: 'Semana Consumo', key: 'semana_consumo', width: 20 },
        { header: 'Grupo', key: 'grupo', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      // Estilizar cabeçalho
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      // Aplicar filtros
      const { grupo, semana_abastecimento, semana_consumo, tipo_rota_id, rota_id } = req.query;
      
      let whereConditions = ['ns.ativo = 1', 'ns.status = "conf log"'];
      const params = [];

      // Filtro por tipo de rota
      if (tipo_rota_id) {
        whereConditions.push(`ns.escola_id IN (
          SELECT DISTINCT ue.id
          FROM foods_db.unidades_escolares ue
          INNER JOIN foods_db.rotas r ON FIND_IN_SET(r.id, ue.rota_id) > 0
          WHERE r.tipo_rota_id = ?
            AND ue.status = 'ativo'
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
        )`);
        params.push(tipo_rota_id);
      }

      // Filtro por rota específica
      if (rota_id) {
        whereConditions.push(`ns.escola_id IN (
          SELECT DISTINCT ue.id
          FROM foods_db.unidades_escolares ue
          WHERE FIND_IN_SET(?, ue.rota_id) > 0
            AND ue.status = 'ativo'
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
        )`);
        params.push(rota_id);
      }

      if (grupo) {
        whereConditions.push('ns.grupo = ?');
        params.push(grupo);
      }

      if (semana_abastecimento) {
        whereConditions.push('ns.semana_abastecimento = ?');
        params.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('ns.semana_consumo = ?');
        params.push(semana_consumo);
      }

      // Query para buscar substituições
      const query = `
        SELECT 
          ns.produto_origem_id as codigo_origem,
          ns.produto_origem_nome,
          ns.produto_origem_unidade,
          ns.produto_generico_id as produto_generico_codigo,
          ns.produto_generico_nome,
          ns.produto_generico_unidade,
          ns.quantidade_origem,
          ns.quantidade_generico,
          ns.escola_id,
          ns.escola_nome,
          ns.semana_abastecimento,
          ns.semana_consumo,
          ns.grupo,
          ns.status
        FROM necessidades_substituicoes ns
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ns.grupo ASC, ns.produto_origem_nome ASC, ns.escola_nome ASC
      `;

      const substituicoes = await executeQuery(query, params);

      // Função auxiliar para formatar número no padrão brasileiro
      const formatarNumeroBR = (valor) => {
        if (valor === null || valor === undefined || valor === '') {
          return '0';
        }
        const num = parseFloat(valor);
        if (isNaN(num)) {
          return '0';
        }
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
      };

      // Adicionar dados
      substituicoes.forEach(sub => {
        ws.addRow({
          codigo_origem: sub.codigo_origem,
          produto_origem_nome: sub.produto_origem_nome,
          produto_origem_unidade: sub.produto_origem_unidade,
          produto_generico_codigo: sub.produto_generico_codigo,
          produto_generico_nome: sub.produto_generico_nome,
          produto_generico_unidade: sub.produto_generico_unidade,
          quantidade_origem: formatarNumeroBR(sub.quantidade_origem),
          quantidade_generico: formatarNumeroBR(sub.quantidade_generico),
          escola_id: sub.escola_id,
          escola_nome: sub.escola_nome,
          semana_abastecimento: sub.semana_abastecimento,
          semana_consumo: sub.semana_consumo,
          grupo: sub.grupo,
          status: sub.status
        });
      });

      // Gerar buffer
      const buffer = await wb.xlsx.writeBuffer();

      // Definir nome do arquivo
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `substituicoes_coordenacao_${timestamp}.xlsx`;

      // Configurar headers para download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(buffer);

    } catch (error) {
      console.error('Erro ao exportar substituições para XLSX:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao exportar substituições para XLSX'
      });
    }
  }

  /**
   * Exportar substituições para PDF (Coordenação)
   */
  static async exportarPDF(req, res) {
    try {
      // Verificar se PDFKit está instalado
      let PDFDocument;
      try {
        PDFDocument = require('pdfkit');
      } catch (err) {
        console.error('PDFKit não está instalado. Instale com: npm install pdfkit');
        return res.status(500).json({
          success: false,
          error: 'Biblioteca PDFKit não instalada',
          message: 'Execute: npm install pdfkit'
        });
      }

      // Aplicar filtros
      const { grupo, semana_abastecimento, semana_consumo, tipo_rota_id, rota_id } = req.query;
      
      let whereConditions = ['ns.ativo = 1', 'ns.status = "conf log"'];
      const params = [];

      // Filtro por tipo de rota
      if (tipo_rota_id) {
        whereConditions.push(`ns.escola_id IN (
          SELECT DISTINCT ue.id
          FROM foods_db.unidades_escolares ue
          INNER JOIN foods_db.rotas r ON FIND_IN_SET(r.id, ue.rota_id) > 0
          WHERE r.tipo_rota_id = ?
            AND ue.status = 'ativo'
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
        )`);
        params.push(tipo_rota_id);
      }

      // Filtro por rota específica
      if (rota_id) {
        whereConditions.push(`ns.escola_id IN (
          SELECT DISTINCT ue.id
          FROM foods_db.unidades_escolares ue
          WHERE FIND_IN_SET(?, ue.rota_id) > 0
            AND ue.status = 'ativo'
            AND ue.rota_id IS NOT NULL
            AND ue.rota_id != ''
        )`);
        params.push(rota_id);
      }

      if (grupo) {
        whereConditions.push('ns.grupo = ?');
        params.push(grupo);
      }

      if (semana_abastecimento) {
        whereConditions.push('ns.semana_abastecimento = ?');
        params.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('ns.semana_consumo = ?');
        params.push(semana_consumo);
      }

      // Query para buscar substituições
      const query = `
        SELECT 
          ns.produto_origem_id as codigo_origem,
          ns.produto_origem_nome,
          ns.produto_origem_unidade,
          ns.produto_generico_id as produto_generico_codigo,
          ns.produto_generico_nome,
          ns.produto_generico_unidade,
          ns.quantidade_origem,
          ns.quantidade_generico,
          ns.escola_id,
          ns.escola_nome,
          ns.semana_abastecimento,
          ns.semana_consumo,
          ns.grupo,
          ns.status
        FROM necessidades_substituicoes ns
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ns.grupo ASC, ns.produto_origem_nome ASC, ns.escola_nome ASC
      `;

      const substituicoes = await executeQuery(query, params);

      // Criar documento PDF
      const doc = new PDFDocument({ margin: 50 });
      
      // Configurar headers para download
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `substituicoes_coordenacao_${timestamp}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Pipe para response
      doc.pipe(res);

      // Título
      doc.fontSize(18).text('Substituições de Necessidades - Coordenação', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Função auxiliar para formatar número no padrão brasileiro
      const formatarNumeroBR = (valor) => {
        if (valor === null || valor === undefined || valor === '') {
          return '0';
        }
        const num = parseFloat(valor);
        if (isNaN(num)) {
          return '0';
        }
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
      };

      // Adicionar dados
      substituicoes.forEach((sub, index) => {
        if (index > 0 && index % 20 === 0) {
          doc.addPage();
        }

        doc.fontSize(10);
        doc.text(`Produto Origem: ${sub.produto_origem_nome} (${sub.codigo_origem})`, { continued: false });
        doc.text(`Produto Genérico: ${sub.produto_generico_nome} (${sub.produto_generico_codigo})`, { continued: false });
        doc.text(`Escola: ${sub.escola_nome} (${sub.escola_id})`, { continued: false });
        doc.text(`Quantidade Origem: ${formatarNumeroBR(sub.quantidade_origem)} ${sub.produto_origem_unidade}`, { continued: false });
        doc.text(`Quantidade Genérico: ${formatarNumeroBR(sub.quantidade_generico)} ${sub.produto_generico_unidade}`, { continued: false });
        doc.text(`Semana Abastecimento: ${sub.semana_abastecimento}`, { continued: false });
        doc.text(`Semana Consumo: ${sub.semana_consumo}`, { continued: false });
        doc.text(`Grupo: ${sub.grupo}`, { continued: false });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
      });

      // Finalizar PDF
      doc.end();

    } catch (error) {
      console.error('Erro ao exportar substituições para PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao exportar substituições para PDF'
      });
    }
  }
}

module.exports = SubstituicoesExportController;

