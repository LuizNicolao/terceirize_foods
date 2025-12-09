const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

/**
 * Controller para exportação de Pratos
 * Implementa exportação XLSX e PDF com todas as informações cadastradas
 */
class PratosExportController {
  /**
   * Exportar pratos para XLSX
   */
  static exportarXLSX = asyncHandler(async (req, res) => {
    const { 
      search = '', 
      tipo_prato = '',
      filial = '',
      centro_custo = ''
    } = req.query;

    // Query para buscar pratos
    let baseQuery = `
      SELECT DISTINCT
        p.id,
        p.codigo,
        p.nome,
        p.descricao,
        p.tipo_prato_id,
        p.tipo_prato_nome as tipo_prato,
        p.status
      FROM pratos p
      LEFT JOIN pratos_filiais pf ON p.id = pf.prato_id
      LEFT JOIN pratos_centros_custo pcc ON p.id = pcc.prato_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        p.codigo LIKE ? OR 
        p.nome LIKE ? OR 
        p.descricao LIKE ? OR
        pf.filial_nome LIKE ? OR
        pcc.centro_custo_nome LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (tipo_prato) {
      baseQuery += ' AND p.tipo_prato_nome LIKE ?';
      params.push(`%${tipo_prato}%`);
    }

    if (filial) {
      if (!isNaN(filial) && filial !== '') {
        baseQuery += ' AND pf.filial_id = ?';
        params.push(parseInt(filial));
      } else {
        baseQuery += ' AND pf.filial_nome LIKE ?';
        params.push(`%${filial}%`);
      }
    }

    if (centro_custo) {
      if (!isNaN(centro_custo) && centro_custo !== '') {
        baseQuery += ' AND pcc.centro_custo_id = ?';
        params.push(parseInt(centro_custo));
      } else {
        baseQuery += ' AND pcc.centro_custo_nome LIKE ?';
        params.push(`%${centro_custo}%`);
      }
    }

    baseQuery += ' ORDER BY p.codigo';

    // Buscar pratos
    const pratos = await executeQuery(baseQuery, params);

    // Para cada prato, buscar informações completas
    const pratosCompletos = [];
    for (const prato of pratos) {
      // Buscar filiais
      const filiais = await executeQuery(
        'SELECT filial_id as id, filial_nome as nome FROM pratos_filiais WHERE prato_id = ?',
        [prato.id]
      );
      
      // Buscar centros de custo
      const centrosCusto = await executeQuery(
        'SELECT centro_custo_id as id, centro_custo_nome as nome, filial_id, filial_nome FROM pratos_centros_custo WHERE prato_id = ?',
        [prato.id]
      );
      
      // Buscar receitas
      const receitas = await executeQuery(
        'SELECT receita_id as id, receita_codigo as codigo, receita_nome as nome FROM pratos_receitas WHERE prato_id = ?',
        [prato.id]
      );
      
      // Buscar produtos
      const produtos = await executeQuery(
        `SELECT 
          id,
          receita_id,
          produto_origem_id,
          produto_origem_nome,
          grupo_nome,
          subgrupo_nome,
          classe_nome,
          unidade_medida_sigla,
          centro_custo_id,
          centro_custo_nome,
          percapta
        FROM produtos_pratos
        WHERE prato_id = ?
        ORDER BY produto_origem_nome`,
        [prato.id]
      );

      pratosCompletos.push({
        ...prato,
        filiais: filiais.map(f => f.nome).join(', '),
        centros_custo: centrosCusto.map(cc => cc.nome).join(', '),
        receitas: receitas.map(r => `${r.codigo} - ${r.nome}`).join(', '),
        produtos: produtos
      });
    }

    // Criar workbook Excel
    const wb = XLSX.utils.book_new();

    // Única planilha com todas as informações (Prato + Produtos)
    // Cada linha representa um produto, mas repete os dados do prato
    const dadosCompletos = [];
    pratosCompletos.forEach(prato => {
      if (prato.produtos && prato.produtos.length > 0) {
        prato.produtos.forEach(produto => {
          dadosCompletos.push({
            // Dados do Prato
            'Código Prato': prato.codigo || '',
            'Nome Prato': prato.nome || '',
            'Descrição Prato': prato.descricao || '',
            'Tipo de Prato': prato.tipo_prato || '',
            'Filiais': prato.filiais || '',
            'Centros de Custo': prato.centros_custo || '',
            'Receitas': prato.receitas || '',
            'Status Prato': prato.status === 1 ? 'Ativo' : 'Inativo',
            // Dados do Produto
            'Código Produto': produto.produto_origem_id || '',
            'Produto': produto.produto_origem_nome || '',
            'Unidade': produto.unidade_medida_sigla || '',
            'Grupo': produto.grupo_nome || '',
            'Subgrupo': produto.subgrupo_nome || '',
            'Classe': produto.classe_nome || '',
            'Centro de Custo Produto': produto.centro_custo_nome || '',
            'Percapta': produto.percapta 
              ? parseFloat(produto.percapta).toFixed(3).replace('.', ',')
              : ''
          });
        });
      } else {
        // Incluir prato mesmo sem produtos
        dadosCompletos.push({
          // Dados do Prato
          'Código Prato': prato.codigo || '',
          'Nome Prato': prato.nome || '',
          'Descrição Prato': prato.descricao || '',
          'Tipo de Prato': prato.tipo_prato || '',
          'Filiais': prato.filiais || '',
          'Centros de Custo': prato.centros_custo || '',
          'Receitas': prato.receitas || '',
          'Status Prato': prato.status === 1 ? 'Ativo' : 'Inativo',
          // Dados do Produto (vazios)
          'Código Produto': '',
          'Produto': 'Nenhum produto cadastrado',
          'Unidade': '',
          'Grupo': '',
          'Subgrupo': '',
          'Classe': '',
          'Centro de Custo Produto': '',
          'Percapta': ''
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(dadosCompletos);
    XLSX.utils.book_append_sheet(wb, ws, 'Pratos');

    // Gerar buffer do arquivo
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers
    const fileName = `pratos_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Enviar arquivo
    res.send(excelBuffer);
  });

  /**
   * Exportar pratos para PDF
   */
  static exportarPDF = asyncHandler(async (req, res) => {
    const { 
      search = '', 
      tipo_prato = '',
      filial = '',
      centro_custo = ''
    } = req.query;

    // Query para buscar pratos (mesma lógica do XLSX)
    let baseQuery = `
      SELECT DISTINCT
        p.id,
        p.codigo,
        p.nome,
        p.descricao,
        p.tipo_prato_id,
        p.tipo_prato_nome as tipo_prato,
        p.status
      FROM pratos p
      LEFT JOIN pratos_filiais pf ON p.id = pf.prato_id
      LEFT JOIN pratos_centros_custo pcc ON p.id = pcc.prato_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros (mesma lógica do XLSX)
    if (search) {
      baseQuery += ` AND (
        p.codigo LIKE ? OR 
        p.nome LIKE ? OR 
        p.descricao LIKE ? OR
        pf.filial_nome LIKE ? OR
        pcc.centro_custo_nome LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (tipo_prato) {
      baseQuery += ' AND p.tipo_prato_nome LIKE ?';
      params.push(`%${tipo_prato}%`);
    }

    if (filial) {
      if (!isNaN(filial) && filial !== '') {
        baseQuery += ' AND pf.filial_id = ?';
        params.push(parseInt(filial));
      } else {
        baseQuery += ' AND pf.filial_nome LIKE ?';
        params.push(`%${filial}%`);
      }
    }

    if (centro_custo) {
      if (!isNaN(centro_custo) && centro_custo !== '') {
        baseQuery += ' AND pcc.centro_custo_id = ?';
        params.push(parseInt(centro_custo));
      } else {
        baseQuery += ' AND pcc.centro_custo_nome LIKE ?';
        params.push(`%${centro_custo}%`);
      }
    }

    baseQuery += ' ORDER BY p.codigo';

    // Buscar pratos
    const pratos = await executeQuery(baseQuery, params);

    // Para cada prato, buscar informações completas
    const pratosCompletos = [];
    for (const prato of pratos) {
      // Buscar filiais
      const filiais = await executeQuery(
        'SELECT filial_id as id, filial_nome as nome FROM pratos_filiais WHERE prato_id = ?',
        [prato.id]
      );
      
      // Buscar centros de custo
      const centrosCusto = await executeQuery(
        'SELECT centro_custo_id as id, centro_custo_nome as nome, filial_id, filial_nome FROM pratos_centros_custo WHERE prato_id = ?',
        [prato.id]
      );
      
      // Buscar receitas
      const receitas = await executeQuery(
        'SELECT receita_id as id, receita_codigo as codigo, receita_nome as nome FROM pratos_receitas WHERE prato_id = ?',
        [prato.id]
      );
      
      // Buscar produtos
      const produtos = await executeQuery(
        `SELECT 
          id,
          receita_id,
          produto_origem_id,
          produto_origem_nome,
          grupo_nome,
          subgrupo_nome,
          classe_nome,
          unidade_medida_sigla,
          centro_custo_id,
          centro_custo_nome,
          percapta
        FROM produtos_pratos
        WHERE prato_id = ?
        ORDER BY produto_origem_nome`,
        [prato.id]
      );

      pratosCompletos.push({
        ...prato,
        filiais: filiais.map(f => f.nome).join(', '),
        centros_custo: centrosCusto.map(cc => cc.nome).join(', '),
        receitas: receitas.map(r => `${r.codigo} - ${r.nome}`).join(', '),
        produtos: produtos
      });
    }

    // Criar documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Configurar headers
    const fileName = `pratos_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Pipe para response
    doc.pipe(res);

    // Título
    doc.fontSize(20).font('Helvetica-Bold').text('Relatório de Pratos', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(2);

    if (pratosCompletos.length === 0) {
      doc.fontSize(14).font('Helvetica').text('Nenhum prato encontrado.', { align: 'center' });
      doc.end();
      return;
    }

    // Para cada prato, criar uma seção
    pratosCompletos.forEach((prato, pratoIndex) => {
      if (pratoIndex > 0) {
        doc.addPage();
      }

      // Informações do prato
      doc.fontSize(16).font('Helvetica-Bold').text(`${prato.codigo} - ${prato.nome}`, { align: 'left' });
      doc.moveDown(0.5);
      
      doc.fontSize(10).font('Helvetica');
      doc.text(`Descrição: ${prato.descricao || '-'}`, { align: 'left' });
      doc.text(`Tipo de Prato: ${prato.tipo_prato || '-'}`, { align: 'left' });
      doc.text(`Filiais: ${prato.filiais || '-'}`, { align: 'left' });
      doc.text(`Centros de Custo: ${prato.centros_custo || '-'}`, { align: 'left' });
      doc.text(`Receitas: ${prato.receitas || '-'}`, { align: 'left' });
      doc.text(`Status: ${prato.status === 1 ? 'Ativo' : 'Inativo'}`, { align: 'left' });
      doc.moveDown();

      // Tabela de produtos
      if (prato.produtos && prato.produtos.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Produtos:', { align: 'left' });
        doc.moveDown(0.5);

        // Cabeçalho da tabela
        let currentY = doc.y;
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Produto', 50, currentY);
        doc.text('Código', 200, currentY);
        doc.text('Unidade', 280, currentY);
        doc.text('Grupo', 340, currentY);
        doc.text('Centro Custo', 420, currentY);
        doc.text('Percapta', 520, currentY);

        // Linha separadora
        currentY += 12;
        doc.moveTo(50, currentY).lineTo(570, currentY).stroke();

        // Dados dos produtos
        doc.fontSize(8).font('Helvetica');
        prato.produtos.forEach((produto, produtoIndex) => {
          // Verificar se precisa de nova página
          if (currentY > 750) {
            doc.addPage();
            currentY = 50;
            
            // Redesenhar cabeçalho
            doc.fontSize(9).font('Helvetica-Bold');
            doc.text('Produto', 50, currentY);
            doc.text('Código', 200, currentY);
            doc.text('Unidade', 280, currentY);
            doc.text('Grupo', 340, currentY);
            doc.text('Centro Custo', 420, currentY);
            doc.text('Percapta', 520, currentY);
            currentY += 12;
            doc.moveTo(50, currentY).lineTo(570, currentY).stroke();
            currentY += 5;
            doc.fontSize(8).font('Helvetica');
          }

          currentY += 5;
          
          const produtoNome = (produto.produto_origem_nome || '-').substring(0, 25);
          const codigo = produto.produto_origem_id || '-';
          const unidade = produto.unidade_medida_sigla || '-';
          const grupo = (produto.grupo_nome || '-').substring(0, 15);
          const centroCusto = (produto.centro_custo_nome || '-').substring(0, 15);
          const percapta = produto.percapta 
            ? parseFloat(produto.percapta).toFixed(3).replace('.', ',')
            : '-';

          doc.text(produtoNome, 50, currentY);
          doc.text(codigo, 200, currentY);
          doc.text(unidade, 280, currentY);
          doc.text(grupo, 340, currentY);
          doc.text(centroCusto, 420, currentY);
          doc.text(percapta, 520, currentY);

          currentY += 12;
        });
      } else {
        doc.fontSize(10).font('Helvetica').text('Nenhum produto cadastrado.', { align: 'left' });
      }
    });

    // Rodapé
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total de pratos: ${pratosCompletos.length}`, 50, doc.page.height - 50, { align: 'left' });

    // Finalizar documento
    doc.end();
  });
}

module.exports = PratosExportController;

