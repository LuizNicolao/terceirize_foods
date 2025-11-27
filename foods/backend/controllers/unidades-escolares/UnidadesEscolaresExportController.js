/**
 * Controller de Exportação de Unidades Escolares
 * Responsável por gerar relatórios em XLSX e PDF
 */

const { executeQuery } = require('../../config/database');

class UnidadesEscolaresExportController {
  // Exportar unidades escolares para XLSX
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Unidades Escolares');

      // Buscar unidades escolares primeiro para determinar todas as colunas
      const { search, status, rota_id, filial_id, limit = 10000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (ue.codigo_teknisa LIKE ? OR ue.nome_escola LIKE ? OR ue.cidade LIKE ? OR ue.estado LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND ue.status = ?';
        params.push(status);
      }

      if (rota_id && rota_id !== 'todos') {
        whereClause += ' AND ue.rota_id = ?';
        params.push(rota_id);
      }

      if (filial_id && filial_id !== 'todos') {
        whereClause += ' AND r.filial_id = ?';
        params.push(filial_id);
      }

      const query = `
        SELECT 
          ue.*,
          r.nome as rota_nome,
          r.codigo as rota_codigo,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo,
          cc.codigo as centro_custo_codigo,
          cc.nome as centro_custo_nome,
          rn.codigo as rota_nutricionista_codigo,
          u.nome as nutricionista_nome,
          u.email as nutricionista_email,
          a.codigo as almoxarifado_codigo,
          a.nome as almoxarifado_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        LEFT JOIN centro_custo cc ON ue.centro_custo_id = cc.id
        LEFT JOIN rotas_nutricionistas rn ON ue.rota_nutricionista_id = rn.id
        LEFT JOIN usuarios u ON rn.usuario_id = u.id
        LEFT JOIN almoxarifado a ON ue.almoxarifado_id = a.id
        ${whereClause}
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
        LIMIT ${parseInt(limit)}
      `;

      const unidades = await executeQuery(query, params);

      // Se não houver unidades, retornar planilha vazia
      if (unidades.length === 0) {
        worksheet.addRow(['Nenhuma unidade escolar encontrada']);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=unidades_escolares_${new Date().toISOString().split('T')[0]}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
        return;
      }

      // Definir cabeçalhos com todas as colunas
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código Teknisa', key: 'codigo_teknisa', width: 15 },
        { header: 'Nome da Escola', key: 'nome_escola', width: 40 },
        { header: 'Cidade', key: 'cidade', width: 25 },
        { header: 'Estado', key: 'estado', width: 10 },
        { header: 'País', key: 'pais', width: 15 },
        { header: 'Endereço', key: 'endereco', width: 40 },
        { header: 'Número', key: 'numero', width: 15 },
        { header: 'Bairro', key: 'bairro', width: 25 },
        { header: 'CEP', key: 'cep', width: 15 },
        { header: 'Centro de Distribuição', key: 'centro_distribuicao', width: 30 },
        { header: 'Rota ID', key: 'rota_id', width: 10 },
        { header: 'Rota Nome', key: 'rota_nome', width: 30 },
        { header: 'Rota Código', key: 'rota_codigo', width: 15 },
        { header: 'Regional', key: 'regional', width: 20 },
        { header: 'Centro de Custo ID', key: 'centro_custo_id', width: 15 },
        { header: 'Centro de Custo Código', key: 'centro_custo_codigo', width: 20 },
        { header: 'Centro de Custo Nome', key: 'centro_custo_nome', width: 30 },
        { header: 'CC Senior', key: 'cc_senior', width: 20 },
        { header: 'Código Senior', key: 'codigo_senior', width: 20 },
        { header: 'Abastecimento', key: 'abastecimento', width: 20 },
        { header: 'Ordem Entrega', key: 'ordem_entrega', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Observações', key: 'observacoes', width: 50 },
        { header: 'Atendimento', key: 'atendimento', width: 20 },
        { header: 'Horário', key: 'horario', width: 20 },
        { header: 'Supervisão', key: 'supervisao', width: 30 },
        { header: 'Coordenação', key: 'coordenacao', width: 30 },
        { header: 'Latitude', key: 'lat', width: 15 },
        { header: 'Longitude', key: 'long', width: 15 },
        { header: 'Filial ID', key: 'filial_id', width: 10 },
        { header: 'Filial Nome', key: 'filial_nome', width: 30 },
        { header: 'Filial Código', key: 'filial_codigo', width: 15 },
        { header: 'Rota Nutricionista ID', key: 'rota_nutricionista_id', width: 20 },
        { header: 'Rota Nutricionista Código', key: 'rota_nutricionista_codigo', width: 25 },
        { header: 'Nutricionista Nome', key: 'nutricionista_nome', width: 30 },
        { header: 'Nutricionista Email', key: 'nutricionista_email', width: 30 },
        { header: 'Almoxarifado ID', key: 'almoxarifado_id', width: 15 },
        { header: 'Almoxarifado Código', key: 'almoxarifado_codigo', width: 20 },
        { header: 'Almoxarifado Nome', key: 'almoxarifado_nome', width: 30 },
        { header: 'Data Criação', key: 'created_at', width: 20 },
        { header: 'Data Atualização', key: 'updated_at', width: 20 }
      ];

      // Estilizar cabeçalhos
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Adicionar dados com todas as colunas
      unidades.forEach(unidade => {
        worksheet.addRow({
          id: unidade.id,
          codigo_teknisa: unidade.codigo_teknisa || '',
          nome_escola: unidade.nome_escola || '',
          cidade: unidade.cidade || '',
          estado: unidade.estado || '',
          pais: unidade.pais || 'Brasil',
          endereco: unidade.endereco || '',
          numero: unidade.numero || '',
          bairro: unidade.bairro || '',
          cep: unidade.cep || '',
          centro_distribuicao: unidade.centro_distribuicao || '',
          rota_id: unidade.rota_id || '',
          rota_nome: unidade.rota_nome || '',
          rota_codigo: unidade.rota_codigo || '',
          regional: unidade.regional || '',
          centro_custo_id: unidade.centro_custo_id || '',
          centro_custo_codigo: unidade.centro_custo_codigo || '',
          centro_custo_nome: unidade.centro_custo_nome || '',
          cc_senior: unidade.cc_senior || '',
          codigo_senior: unidade.codigo_senior || '',
          abastecimento: unidade.abastecimento || '',
          ordem_entrega: unidade.ordem_entrega || 0,
          status: unidade.status === 'ativo' ? 'Ativo' : 'Inativo',
          observacoes: unidade.observacoes || '',
          atendimento: unidade.atendimento || '',
          horario: unidade.horario || '',
          supervisao: unidade.supervisao || '',
          coordenacao: unidade.coordenacao || '',
          lat: unidade.lat || '',
          long: unidade.long || '',
          filial_id: unidade.filial_id || '',
          filial_nome: unidade.filial_nome || '',
          filial_codigo: unidade.filial_codigo || '',
          rota_nutricionista_id: unidade.rota_nutricionista_id || '',
          rota_nutricionista_codigo: unidade.rota_nutricionista_codigo || '',
          nutricionista_nome: unidade.nutricionista_nome || '',
          nutricionista_email: unidade.nutricionista_email || '',
          almoxarifado_id: unidade.almoxarifado_id || '',
          almoxarifado_codigo: unidade.almoxarifado_codigo || '',
          almoxarifado_nome: unidade.almoxarifado_nome || '',
          created_at: unidade.created_at ? new Date(unidade.created_at).toLocaleString('pt-BR') : '',
          updated_at: unidade.updated_at ? new Date(unidade.updated_at).toLocaleString('pt-BR') : ''
        });
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=unidades_escolares_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar unidades escolares para XLSX:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar as unidades escolares'
      });
    }
  }

  // Exportar unidades escolares para PDF
  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=unidades_escolares_${new Date().toISOString().split('T')[0]}.pdf`);

      // Pipe para response
      doc.pipe(res);

      // Título
      doc.fontSize(20).text('Relatório de Unidades Escolares', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Buscar unidades escolares
      const { search, status, rota_id, filial_id, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (ue.codigo_teknisa LIKE ? OR ue.nome_escola LIKE ? OR ue.cidade LIKE ? OR ue.estado LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND ue.status = ?';
        params.push(status);
      }

      if (rota_id && rota_id !== 'todos') {
        whereClause += ' AND ue.rota_id = ?';
        params.push(rota_id);
      }

      if (filial_id && filial_id !== 'todos') {
        whereClause += ' AND r.filial_id = ?';
        params.push(filial_id);
      }

      const query = `
        SELECT 
          ue.id,
          ue.codigo_teknisa,
          ue.nome_escola,
          ue.cidade,
          ue.estado,
          ue.ordem_entrega,
          ue.status,
          ue.created_at,
          r.nome as rota_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        ${whereClause}
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
        LIMIT ${parseInt(limit)}
      `;

      const unidades = await executeQuery(query, params);

      // Adicionar unidades ao PDF
      unidades.forEach((unidade, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(`${unidade.nome_escola}`);
        doc.fontSize(10).font('Helvetica');
        
        if (unidade.codigo_teknisa) {
          doc.text(`Código: ${unidade.codigo_teknisa}`);
        }
        
        doc.text(`Cidade/Estado: ${unidade.cidade} - ${unidade.estado}`);
        
        if (unidade.rota_nome) {
          doc.text(`Rota: ${unidade.rota_nome}`);
        }
        
        if (unidade.ordem_entrega) {
          doc.text(`Ordem de Entrega: ${unidade.ordem_entrega}`);
        }
        
        doc.text(`Status: ${unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}`);
        
        if (unidade.created_at) {
          doc.text(`Data Cadastro: ${new Date(unidade.created_at).toLocaleDateString('pt-BR')}`);
        }
        
        // Linha separadora
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      // Finalizar documento
      doc.end();

    } catch (error) {
      console.error('Erro ao exportar unidades escolares para PDF:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar as unidades escolares'
      });
    }
  }
}

module.exports = UnidadesEscolaresExportController;
