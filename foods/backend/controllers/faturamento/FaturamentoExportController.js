/**
 * Controller de Exportação de Faturamento
 * Responsável por exportar dados de faturamento para XLSX e PDF
 */

const { executeQuery } = require('../../config/database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class FaturamentoExportController {
  /**
   * Exportar faturamentos para XLSX
   */
  static async exportarXLSX(req, res) {
    try {
      const { search, mes, ano, unidade_escolar_id } = req.query;

      // Construir query base
      let query = `
        SELECT 
          f.id,
          f.unidade_escolar_id,
          f.mes,
          f.ano,
          f.observacoes,
          f.criado_em,
          f.atualizado_em,
          ue.nome_escola,
          ue.codigo_teknisa,
          ue.cidade,
          ue.estado,
          fil.filial as filial_nome
        FROM faturamento f
        INNER JOIN unidades_escolares ue ON f.unidade_escolar_id = ue.id
        LEFT JOIN filiais fil ON ue.filial_id = fil.id
        WHERE 1=1
      `;

      let params = [];

      // Aplicar filtros
      if (search) {
        query += ` AND (ue.nome_escola LIKE ? OR ue.codigo_teknisa LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      if (mes) {
        query += ` AND f.mes = ?`;
        params.push(parseInt(mes));
      }

      if (ano) {
        query += ` AND f.ano = ?`;
        params.push(parseInt(ano));
      }

      if (unidade_escolar_id) {
        query += ` AND f.unidade_escolar_id = ?`;
        params.push(parseInt(unidade_escolar_id));
      }

      query += ` ORDER BY f.ano DESC, f.mes DESC, ue.nome_escola ASC`;

      const faturamentos = await executeQuery(query, params);

      // Buscar totais de refeições para cada faturamento
      const faturamentosComTotais = await Promise.all(
        faturamentos.map(async (faturamento) => {
          const [totalResult] = await executeQuery(
            `SELECT 
               SUM(desjejum + lanche_matutino + almoco + lanche_vespertino + noturno) as total_refeicoes
             FROM faturamento_detalhes 
             WHERE faturamento_id = ?`,
            [faturamento.id]
          );
          
          return {
            ...faturamento,
            total_refeicoes: totalResult.total_refeicoes || 0
          };
        })
      );

      // Criar workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Faturamentos');

      // Definir colunas
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Unidade Escolar', key: 'nome_escola', width: 40 },
        { header: 'Código', key: 'codigo_teknisa', width: 15 },
        { header: 'Mês', key: 'mes', width: 10 },
        { header: 'Ano', key: 'ano', width: 10 },
        { header: 'Total Refeições', key: 'total_refeicoes', width: 15 },
        { header: 'Cidade', key: 'cidade', width: 20 },
        { header: 'Estado', key: 'estado', width: 10 },
        { header: 'Filial', key: 'filial_nome', width: 20 },
        { header: 'Observações', key: 'observacoes', width: 30 },
        { header: 'Criado em', key: 'criado_em', width: 20 }
      ];

      // Estilizar cabeçalhos
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      };

      // Adicionar dados
      faturamentosComTotais.forEach(faturamento => {
        worksheet.addRow({
          id: faturamento.id,
          nome_escola: faturamento.nome_escola,
          codigo_teknisa: faturamento.codigo_teknisa,
          mes: faturamento.mes,
          ano: faturamento.ano,
          total_refeicoes: faturamento.total_refeicoes,
          cidade: faturamento.cidade,
          estado: faturamento.estado,
          filial_nome: faturamento.filial_nome,
          observacoes: faturamento.observacoes,
          criado_em: new Date(faturamento.criado_em).toLocaleDateString('pt-BR')
        });
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=faturamentos_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar faturamentos para XLSX:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Exportar faturamentos para PDF
   */
  static async exportarPDF(req, res) {
    try {
      const { search, mes, ano, unidade_escolar_id } = req.query;

      // Construir query base (mesma do XLSX)
      let query = `
        SELECT 
          f.id,
          f.unidade_escolar_id,
          f.mes,
          f.ano,
          f.observacoes,
          f.criado_em,
          f.atualizado_em,
          ue.nome_escola,
          ue.codigo_teknisa,
          ue.cidade,
          ue.estado,
          fil.filial as filial_nome
        FROM faturamento f
        INNER JOIN unidades_escolares ue ON f.unidade_escolar_id = ue.id
        LEFT JOIN filiais fil ON ue.filial_id = fil.id
        WHERE 1=1
      `;

      let params = [];

      // Aplicar filtros
      if (search) {
        query += ` AND (ue.nome_escola LIKE ? OR ue.codigo_teknisa LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      if (mes) {
        query += ` AND f.mes = ?`;
        params.push(parseInt(mes));
      }

      if (ano) {
        query += ` AND f.ano = ?`;
        params.push(parseInt(ano));
      }

      if (unidade_escolar_id) {
        query += ` AND f.unidade_escolar_id = ?`;
        params.push(parseInt(unidade_escolar_id));
      }

      query += ` ORDER BY f.ano DESC, f.mes DESC, ue.nome_escola ASC`;

      const faturamentos = await executeQuery(query, params);

      // Buscar totais de refeições para cada faturamento
      const faturamentosComTotais = await Promise.all(
        faturamentos.map(async (faturamento) => {
          const [totalResult] = await executeQuery(
            `SELECT 
               SUM(desjejum + lanche_matutino + almoco + lanche_vespertino + noturno) as total_refeicoes
             FROM faturamento_detalhes 
             WHERE faturamento_id = ?`,
            [faturamento.id]
          );
          
          return {
            ...faturamento,
            total_refeicoes: totalResult.total_refeicoes || 0
          };
        })
      );

      // Criar documento PDF
      const doc = new PDFDocument();
      
      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=faturamentos_${new Date().toISOString().split('T')[0]}.pdf`);

      doc.pipe(res);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Faturamentos', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Dados dos faturamentos
      faturamentosComTotais.forEach((faturamento, index) => {
        if (index > 0) {
          doc.addPage();
        }

        doc.fontSize(16).text(`Faturamento #${faturamento.id}`, { underline: true });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Unidade Escolar: ${faturamento.nome_escola}`);
        doc.text(`Código: ${faturamento.codigo_teknisa}`);
        doc.text(`Período: ${faturamento.mes}/${faturamento.ano}`);
        doc.text(`Total de Refeições: ${faturamento.total_refeicoes.toLocaleString('pt-BR')}`);
        doc.text(`Cidade: ${faturamento.cidade} - ${faturamento.estado}`);
        
        if (faturamento.filial_nome) {
          doc.text(`Filial: ${faturamento.filial_nome}`);
        }
        
        if (faturamento.observacoes) {
          doc.text(`Observações: ${faturamento.observacoes}`);
        }
        
        doc.text(`Criado em: ${new Date(faturamento.criado_em).toLocaleDateString('pt-BR')}`);
      });

      doc.end();

    } catch (error) {
      console.error('Erro ao exportar faturamentos para PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

}

module.exports = FaturamentoExportController;
