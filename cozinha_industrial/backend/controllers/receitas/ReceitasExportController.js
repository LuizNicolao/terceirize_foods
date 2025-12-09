const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

/**
 * Controller para exportação de Receitas
 * Implementa exportação XLSX e PDF com todas as informações cadastradas
 */
class ReceitasExportController {
  /**
   * Exportar receitas para XLSX
   */
  static exportarXLSX = asyncHandler(async (req, res) => {
    const { 
      search = '', 
      tipo_receita = '',
      filial = '',
      centro_custo = ''
    } = req.query;

    // Query para buscar receitas com todas as informações
    let baseQuery = `
      SELECT DISTINCT
        r.id,
        r.codigo,
        r.nome,
        r.descricao,
        r.tipo_receita_id,
        r.tipo_receita_nome as tipo_receita,
        r.status,
        r.data_cadastro,
        r.data_atualizacao
      FROM receitas r
      LEFT JOIN receitas_filiais rf ON r.id = rf.receita_id
      LEFT JOIN receitas_centros_custo rcc ON r.id = rcc.receita_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        r.codigo LIKE ? OR 
        r.nome LIKE ? OR 
        r.descricao LIKE ? OR
        rf.filial_nome LIKE ? OR
        rcc.centro_custo_nome LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (tipo_receita) {
      baseQuery += ' AND r.tipo_receita_nome LIKE ?';
      params.push(`%${tipo_receita}%`);
    }

    if (filial) {
      if (!isNaN(filial) && filial !== '') {
        baseQuery += ' AND rf.filial_id = ?';
        params.push(parseInt(filial));
      } else {
        baseQuery += ' AND rf.filial_nome LIKE ?';
        params.push(`%${filial}%`);
      }
    }

    if (centro_custo) {
      if (!isNaN(centro_custo) && centro_custo !== '') {
        baseQuery += ' AND rcc.centro_custo_id = ?';
        params.push(parseInt(centro_custo));
      } else {
        baseQuery += ' AND rcc.centro_custo_nome LIKE ?';
        params.push(`%${centro_custo}%`);
      }
    }

    baseQuery += ' ORDER BY r.codigo';

    // Buscar receitas
    const receitas = await executeQuery(baseQuery, params);

    // Para cada receita, buscar informações completas
    const receitasCompletas = [];
    for (const receita of receitas) {
      // Buscar filiais
      const filiais = await executeQuery(
        'SELECT filial_id as id, filial_nome as nome FROM receitas_filiais WHERE receita_id = ?',
        [receita.id]
      );
      
      // Buscar centros de custo
      const centrosCusto = await executeQuery(
        'SELECT centro_custo_id as id, centro_custo_nome as nome, filial_id, filial_nome FROM receitas_centros_custo WHERE receita_id = ?',
        [receita.id]
      );
      
      // Buscar produtos
      const produtos = await executeQuery(
        `SELECT 
          id,
          produto_origem,
          produto_origem_id,
          unidade_medida_id,
          unidade_medida_sigla,
          grupo_id,
          grupo_nome,
          subgrupo_id,
          subgrupo_nome,
          classe_id,
          classe_nome,
          percapta_sugerida
        FROM receitas_produtos
        WHERE receita_id = ?
        ORDER BY produto_origem`,
        [receita.id]
      );

      receitasCompletas.push({
        ...receita,
        filiais: filiais.map(f => f.nome).join(', '),
        centros_custo: centrosCusto.map(cc => cc.nome).join(', '),
        total_produtos: produtos.length,
        produtos: produtos
      });
    }

    // Criar workbook Excel
    const wb = XLSX.utils.book_new();

    // Única planilha com todas as informações (Receita + Produtos)
    // Cada linha representa um produto, mas repete os dados da receita
    const dadosCompletos = [];
    receitasCompletas.forEach(receita => {
      if (receita.produtos && receita.produtos.length > 0) {
        receita.produtos.forEach(produto => {
          dadosCompletos.push({
            // Dados da Receita
            'Código Receita': receita.codigo || '',
            'Nome Receita': receita.nome || '',
            'Descrição Receita': receita.descricao || '',
            'Tipo de Receita': receita.tipo_receita || '',
            'Filiais': receita.filiais || '',
            'Centros de Custo': receita.centros_custo || '',
            'Status Receita': receita.status === 1 ? 'Ativo' : 'Inativo',
            // Dados do Produto
            'Código Produto': produto.produto_origem_id || '',
            'Produto': produto.produto_origem || '',
            'Unidade': produto.unidade_medida_sigla || '',
            'Grupo': produto.grupo_nome || '',
            'Subgrupo': produto.subgrupo_nome || '',
            'Classe': produto.classe_nome || '',
            'Percapta Sugerida': produto.percapta_sugerida 
              ? parseFloat(produto.percapta_sugerida).toFixed(3).replace('.', ',')
              : ''
          });
        });
      } else {
        // Incluir receita mesmo sem produtos
        dadosCompletos.push({
          // Dados da Receita
          'Código Receita': receita.codigo || '',
          'Nome Receita': receita.nome || '',
          'Descrição Receita': receita.descricao || '',
          'Tipo de Receita': receita.tipo_receita || '',
          'Filiais': receita.filiais || '',
          'Centros de Custo': receita.centros_custo || '',
          'Status Receita': receita.status === 1 ? 'Ativo' : 'Inativo',
          // Dados do Produto (vazios)
          'Código Produto': '',
          'Produto': 'Nenhum produto cadastrado',
          'Unidade': '',
          'Grupo': '',
          'Subgrupo': '',
          'Classe': '',
          'Percapta Sugerida': ''
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(dadosCompletos);
    XLSX.utils.book_append_sheet(wb, ws, 'Receitas');

    // Gerar buffer do arquivo
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers
    const fileName = `receitas_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Enviar arquivo
    res.send(excelBuffer);
  });

  /**
   * Exportar receitas para PDF
   */
  static exportarPDF = asyncHandler(async (req, res) => {
    const { 
      search = '', 
      tipo_receita = '',
      filial = '',
      centro_custo = ''
    } = req.query;

    // Query para buscar receitas com todas as informações
    let baseQuery = `
      SELECT DISTINCT
        r.id,
        r.codigo,
        r.nome,
        r.descricao,
        r.tipo_receita_id,
        r.tipo_receita_nome as tipo_receita,
        r.status,
        r.data_cadastro,
        r.data_atualizacao
      FROM receitas r
      LEFT JOIN receitas_filiais rf ON r.id = rf.receita_id
      LEFT JOIN receitas_centros_custo rcc ON r.id = rcc.receita_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros (mesma lógica do XLSX)
    if (search) {
      baseQuery += ` AND (
        r.codigo LIKE ? OR 
        r.nome LIKE ? OR 
        r.descricao LIKE ? OR
        rf.filial_nome LIKE ? OR
        rcc.centro_custo_nome LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (tipo_receita) {
      baseQuery += ' AND r.tipo_receita_nome LIKE ?';
      params.push(`%${tipo_receita}%`);
    }

    if (filial) {
      if (!isNaN(filial) && filial !== '') {
        baseQuery += ' AND rf.filial_id = ?';
        params.push(parseInt(filial));
      } else {
        baseQuery += ' AND rf.filial_nome LIKE ?';
        params.push(`%${filial}%`);
      }
    }

    if (centro_custo) {
      if (!isNaN(centro_custo) && centro_custo !== '') {
        baseQuery += ' AND rcc.centro_custo_id = ?';
        params.push(parseInt(centro_custo));
      } else {
        baseQuery += ' AND rcc.centro_custo_nome LIKE ?';
        params.push(`%${centro_custo}%`);
      }
    }

    baseQuery += ' ORDER BY r.codigo';

    // Buscar receitas
    const receitas = await executeQuery(baseQuery, params);

    // Para cada receita, buscar informações completas
    const receitasCompletas = [];
    for (const receita of receitas) {
      // Buscar filiais
      const filiais = await executeQuery(
        'SELECT filial_id as id, filial_nome as nome FROM receitas_filiais WHERE receita_id = ?',
        [receita.id]
      );
      
      // Buscar centros de custo
      const centrosCusto = await executeQuery(
        'SELECT centro_custo_id as id, centro_custo_nome as nome, filial_id, filial_nome FROM receitas_centros_custo WHERE receita_id = ?',
        [receita.id]
      );
      
      // Buscar produtos
      const produtos = await executeQuery(
        `SELECT 
          id,
          produto_origem,
          produto_origem_id,
          unidade_medida_id,
          unidade_medida_sigla,
          grupo_id,
          grupo_nome,
          subgrupo_id,
          subgrupo_nome,
          classe_id,
          classe_nome,
          percapta_sugerida
        FROM receitas_produtos
        WHERE receita_id = ?
        ORDER BY produto_origem`,
        [receita.id]
      );

      receitasCompletas.push({
        ...receita,
        filiais: filiais,
        centros_custo: centrosCusto,
        produtos: produtos
      });
    }

    // Criar documento PDF
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });

    // Configurar headers
    const fileName = `receitas_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('Relatório de Receitas', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' });
    
    doc.moveDown(2);

    // Conteúdo
    receitasCompletas.forEach((receita, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // Informações básicas
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text(`${receita.codigo} - ${receita.nome}`, { underline: true });
      
      doc.moveDown(0.5);
      doc.fontSize(11)
         .font('Helvetica');

      if (receita.descricao) {
        doc.text(`Descrição: ${receita.descricao}`);
      }

      doc.text(`Tipo de Receita: ${receita.tipo_receita || 'Não informado'}`);
      doc.text(`Status: ${receita.status === 1 ? 'Ativo' : 'Inativo'}`);

      // Filiais
      if (receita.filiais && receita.filiais.length > 0) {
        const filiaisNomes = receita.filiais.map(f => f.nome).join(', ');
        doc.text(`Filiais: ${filiaisNomes}`);
      } else {
        doc.text('Filiais: Nenhuma filial vinculada');
      }

      // Centros de Custo
      if (receita.centros_custo && receita.centros_custo.length > 0) {
        const centrosCustoNomes = receita.centros_custo.map(cc => cc.nome).join(', ');
        doc.text(`Centros de Custo: ${centrosCustoNomes}`);
      } else {
        doc.text('Centros de Custo: Nenhum centro de custo vinculado');
      }

      doc.moveDown();

      // Produtos
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Produtos da Receita:');
      
      doc.moveDown(0.3);
      doc.fontSize(10)
         .font('Helvetica');

      if (receita.produtos && receita.produtos.length > 0) {
        // Cabeçalho da tabela
        const startY = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Produto', 50, doc.y);
        doc.text('Unidade', 250, doc.y);
        doc.text('Grupo', 320, doc.y);
        doc.text('Percapta', 450, doc.y);
        
        doc.moveDown(0.5);
        doc.font('Helvetica');
        
        // Linha separadora
        doc.moveTo(50, doc.y - 5)
           .lineTo(550, doc.y - 5)
           .stroke();

        // Produtos
        receita.produtos.forEach((produto, prodIndex) => {
          if (doc.y > 700) {
            doc.addPage();
            doc.font('Helvetica-Bold');
            doc.text('Produto', 50, doc.y);
            doc.text('Unidade', 250, doc.y);
            doc.text('Grupo', 320, doc.y);
            doc.text('Percapta', 450, doc.y);
            doc.moveDown(0.5);
            doc.font('Helvetica');
            doc.moveTo(50, doc.y - 5)
               .lineTo(550, doc.y - 5)
               .stroke();
          }

          const produtoNome = produto.produto_origem || 'Sem nome';
          const unidade = produto.unidade_medida_sigla || '-';
          const grupo = produto.grupo_nome || '-';
          const percapta = produto.percapta_sugerida 
            ? parseFloat(produto.percapta_sugerida).toFixed(3).replace('.', ',')
            : '-';

          doc.text(produtoNome.substring(0, 30), 50, doc.y);
          doc.text(unidade, 250, doc.y);
          doc.text(grupo.substring(0, 15), 320, doc.y);
          doc.text(percapta, 450, doc.y);
          
          doc.moveDown(0.5);
        });
      } else {
        doc.text('Nenhum produto cadastrado para esta receita.');
      }

      // Data de cadastro e atualização
      doc.moveDown();
      doc.fontSize(9)
         .fillColor('gray');
      
      if (receita.data_cadastro) {
        doc.text(`Cadastrado em: ${new Date(receita.data_cadastro).toLocaleDateString('pt-BR')}`, { align: 'left' });
      }
      if (receita.data_atualizacao) {
        doc.text(`Atualizado em: ${new Date(receita.data_atualizacao).toLocaleDateString('pt-BR')}`, { align: 'left' });
      }
      
      doc.fillColor('black');
    });

    // Finalizar documento
    doc.end();
  });
}

module.exports = ReceitasExportController;

