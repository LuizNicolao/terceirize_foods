const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

/**
 * Controller para exportação de Tipos de Cardápio
 * Implementa exportação XLSX e PDF com todas as informações cadastradas
 */
class TiposCardapioExportController {
  /**
   * Exportar tipos de cardápio para XLSX
   */
  static exportarXLSX = asyncHandler(async (req, res) => {
    const { 
      search = '',
      filial = '',
      centro_custo = '',
      contrato = ''
    } = req.query;

    // Query para buscar tipos de cardápio
    let baseQuery = `
      SELECT 
        tc.id,
        tc.filial_id,
        tc.filial_nome,
        tc.centro_custo_id,
        tc.centro_custo_nome,
        tc.contrato_id,
        tc.contrato_nome,
        tc.usuario_criador_id,
        tc.usuario_atualizador_id,
        tc.criado_em,
        tc.atualizado_em,
        GROUP_CONCAT(DISTINCT CONCAT(pc.produto_comercial_id, ':', pc.produto_comercial_nome) SEPARATOR '; ') as produtos_comerciais
      FROM tipos_cardapio tc
      LEFT JOIN tipos_cardapio_produtos pc ON tc.id = pc.tipo_cardapio_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        tc.filial_nome LIKE ? OR 
        tc.centro_custo_nome LIKE ? OR 
        tc.contrato_nome LIKE ? OR
        pc.produto_comercial_nome LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (filial) {
      if (!isNaN(filial) && filial !== '') {
        baseQuery += ' AND tc.filial_id = ?';
        params.push(parseInt(filial));
      } else {
        baseQuery += ' AND tc.filial_nome LIKE ?';
        params.push(`%${filial}%`);
      }
    }

    if (centro_custo) {
      if (!isNaN(centro_custo) && centro_custo !== '') {
        baseQuery += ' AND tc.centro_custo_id = ?';
        params.push(parseInt(centro_custo));
      } else {
        baseQuery += ' AND tc.centro_custo_nome LIKE ?';
        params.push(`%${centro_custo}%`);
      }
    }

    if (contrato) {
      if (!isNaN(contrato) && contrato !== '') {
        baseQuery += ' AND tc.contrato_id = ?';
        params.push(parseInt(contrato));
      } else {
        baseQuery += ' AND tc.contrato_nome LIKE ?';
        params.push(`%${contrato}%`);
      }
    }

    baseQuery += ' GROUP BY tc.id ORDER BY tc.filial_nome, tc.contrato_nome';

    // Buscar tipos de cardápio
    const tiposCardapio = await executeQuery(baseQuery, params);

    // Buscar unidades vinculadas para cada tipo de cardápio
    const tiposCardapioCompletos = await Promise.all(
      tiposCardapio.map(async (tipo) => {
        const unidades = await executeQuery(
          `SELECT 
            tcu.unidade_id,
            tcu.unidade_nome as nome
          FROM tipos_cardapio_unidades tcu
          WHERE tcu.tipo_cardapio_id = ?
          ORDER BY tcu.unidade_nome`,
          [tipo.id]
        );

        return {
          ...tipo,
          unidades: unidades.map(u => u.nome).join('; ') || 'Nenhuma unidade vinculada'
        };
      })
    );

    // Criar workbook Excel
    const wb = XLSX.utils.book_new();

    // Planilha com todos os dados
    const dadosCompletos = tiposCardapioCompletos.map(tipo => ({
      'ID': tipo.id || '',
      'Filial': tipo.filial_nome || '',
      'Centro de Custo': tipo.centro_custo_nome || '',
      'Contrato': tipo.contrato_nome || '',
      'Produtos Comerciais': tipo.produtos_comerciais || 'Nenhum produto vinculado',
      'Unidades Escolares': tipo.unidades || 'Nenhuma unidade vinculada',
      'Data de Criação': tipo.criado_em ? new Date(tipo.criado_em).toLocaleDateString('pt-BR') : '',
      'Data de Atualização': tipo.atualizado_em ? new Date(tipo.atualizado_em).toLocaleDateString('pt-BR') : ''
    }));

    const ws = XLSX.utils.json_to_sheet(dadosCompletos);
    XLSX.utils.book_append_sheet(wb, ws, 'Tipos de Cardápio');

    // Gerar buffer do arquivo
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers
    const fileName = `tipos_cardapio_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Enviar arquivo
    res.send(excelBuffer);
  });

  /**
   * Exportar tipos de cardápio para PDF
   */
  static exportarPDF = asyncHandler(async (req, res) => {
    const { 
      search = '',
      filial = '',
      centro_custo = '',
      contrato = ''
    } = req.query;

    // Query para buscar tipos de cardápio (mesma lógica do XLSX)
    let baseQuery = `
      SELECT 
        tc.id,
        tc.filial_id,
        tc.filial_nome,
        tc.centro_custo_id,
        tc.centro_custo_nome,
        tc.contrato_id,
        tc.contrato_nome,
        tc.usuario_criador_id,
        tc.usuario_atualizador_id,
        tc.criado_em,
        tc.atualizado_em,
        GROUP_CONCAT(DISTINCT CONCAT(pc.produto_comercial_id, ':', pc.produto_comercial_nome) SEPARATOR '; ') as produtos_comerciais
      FROM tipos_cardapio tc
      LEFT JOIN tipos_cardapio_produtos pc ON tc.id = pc.tipo_cardapio_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros (mesma lógica do XLSX)
    if (search) {
      baseQuery += ` AND (
        tc.filial_nome LIKE ? OR 
        tc.centro_custo_nome LIKE ? OR 
        tc.contrato_nome LIKE ? OR
        pc.produto_comercial_nome LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (filial) {
      if (!isNaN(filial) && filial !== '') {
        baseQuery += ' AND tc.filial_id = ?';
        params.push(parseInt(filial));
      } else {
        baseQuery += ' AND tc.filial_nome LIKE ?';
        params.push(`%${filial}%`);
      }
    }

    if (centro_custo) {
      if (!isNaN(centro_custo) && centro_custo !== '') {
        baseQuery += ' AND tc.centro_custo_id = ?';
        params.push(parseInt(centro_custo));
      } else {
        baseQuery += ' AND tc.centro_custo_nome LIKE ?';
        params.push(`%${centro_custo}%`);
      }
    }

    if (contrato) {
      if (!isNaN(contrato) && contrato !== '') {
        baseQuery += ' AND tc.contrato_id = ?';
        params.push(parseInt(contrato));
      } else {
        baseQuery += ' AND tc.contrato_nome LIKE ?';
        params.push(`%${contrato}%`);
      }
    }

    baseQuery += ' GROUP BY tc.id ORDER BY tc.filial_nome, tc.contrato_nome';

    // Buscar tipos de cardápio
    const tiposCardapio = await executeQuery(baseQuery, params);

    // Buscar unidades vinculadas para cada tipo de cardápio
    const tiposCardapioCompletos = await Promise.all(
      tiposCardapio.map(async (tipo) => {
        const unidades = await executeQuery(
          `SELECT 
            tcu.unidade_id,
            tcu.unidade_nome as nome
          FROM tipos_cardapio_unidades tcu
          WHERE tcu.tipo_cardapio_id = ?
          ORDER BY tcu.unidade_nome`,
          [tipo.id]
        );

        return {
          ...tipo,
          unidades: unidades.map(u => u.nome).join('; ') || 'Nenhuma unidade vinculada'
        };
      })
    );

    // Criar documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Configurar headers
    const fileName = `tipos_cardapio_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Pipe para response
    doc.pipe(res);

    // Título
    doc.fontSize(20).font('Helvetica-Bold').text('Relatório de Tipos de Cardápio', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(2);

    if (tiposCardapioCompletos.length === 0) {
      doc.fontSize(14).font('Helvetica').text('Nenhum tipo de cardápio encontrado.', { align: 'center' });
      doc.end();
      return;
    }

    // Dados
    doc.fontSize(9).font('Helvetica');
    tiposCardapioCompletos.forEach((tipo, index) => {
      // Verificar se precisa de nova página
      if (doc.y > 750) {
        doc.addPage();
      }

      // Título do tipo de cardápio
      doc.fontSize(11).font('Helvetica-Bold');
      const titulo = `${tipo.filial_nome || 'N/A'} - ${tipo.contrato_nome || 'N/A'}`;
      doc.text(`Tipo de Cardápio ${index + 1}: ${titulo}`, { underline: true });
      doc.moveDown(0.5);

      // Detalhes
      doc.fontSize(9).font('Helvetica');
      doc.text(`ID: ${tipo.id || 'N/A'}`);
      doc.text(`Filial: ${tipo.filial_nome || 'N/A'}`);
      doc.text(`Centro de Custo: ${tipo.centro_custo_nome || 'N/A'}`);
      doc.text(`Contrato: ${tipo.contrato_nome || 'N/A'}`);
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Produtos Comerciais:');
      doc.font('Helvetica');
      const produtos = tipo.produtos_comerciais || 'Nenhum produto vinculado';
      doc.text(produtos, { indent: 20 });
      doc.moveDown(0.3);
      
      doc.font('Helvetica-Bold').text('Unidades Escolares:');
      doc.font('Helvetica');
      doc.text(tipo.unidades, { indent: 20 });
      doc.moveDown(0.3);
      
      doc.text(`Data de Criação: ${tipo.criado_em ? new Date(tipo.criado_em).toLocaleDateString('pt-BR') : 'N/A'}`);
      doc.text(`Data de Atualização: ${tipo.atualizado_em ? new Date(tipo.atualizado_em).toLocaleDateString('pt-BR') : 'N/A'}`);
      
      doc.moveDown(1);
      
      // Linha separadora
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
    });

    // Rodapé
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total de registros: ${tiposCardapioCompletos.length}`, 50, doc.page.height - 50, { align: 'left' });

    // Finalizar documento
    doc.end();
  });
}

module.exports = TiposCardapioExportController;

