const { executeQuery } = require('../../config/database');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

/**
 * Controller para exportação de Recebimentos Escolas
 * Implementa exportação XLSX e PDF seguindo padrões do sistema
 */

/**
 * Exportar dados para XLSX
 */
const exportarXLSX = async (req, res) => {
  try {
    const { user } = req;
    const filtros = req.query;

    // Construir query base
    let query = `
      SELECT 
        re.id,
        re.escola_nome,
        re.escola_rota,
        re.escola_cidade,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.observacoes,
        re.status,
        re.created_at,
        re.updated_at,
        u.nome as nutricionista_nome,
        u.email as nutricionista_email
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Aplicar filtros
    if (filtros.escola_id) {
      query += ' AND re.escola_id = ?';
      params.push(filtros.escola_id);
    }

    if (filtros.tipo_recebimento) {
      query += ' AND re.tipo_recebimento = ?';
      params.push(filtros.tipo_recebimento);
    }

    if (filtros.tipo_entrega) {
      query += ' AND re.tipo_entrega = ?';
      params.push(filtros.tipo_entrega);
    }

    if (filtros.data_inicio) {
      query += ' AND re.data_recebimento >= ?';
      params.push(filtros.data_inicio);
    }

    if (filtros.data_fim) {
      query += ' AND re.data_recebimento <= ?';
      params.push(filtros.data_fim);
    }

    if (filtros.semana_abastecimento) {
      query += ' AND re.semana_abastecimento = ?';
      params.push(filtros.semana_abastecimento);
    }

    // Filtro específico para nutricionistas
    if (user.tipo_de_acesso === 'nutricionista') {
      // Buscar escolas do nutricionista via Foods API
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001/api';
        
        const response = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${user.email}`);
        const rotas = response.data.data || [];
        
        if (rotas.length > 0) {
          const escolasResponsaveis = rotas.flatMap(rota => rota.escolas_responsaveis || []);
          if (escolasResponsaveis.length > 0) {
            const placeholders = escolasResponsaveis.map(() => '?').join(',');
            query += ` AND re.escola_id IN (${placeholders})`;
            params.push(...escolasResponsaveis);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar rotas do nutricionista:', error);
        // Se não conseguir buscar as rotas, não retorna dados
        query += ' AND 1=0';
      }
    }

    query += ' ORDER BY re.data_recebimento DESC, re.escola_nome';

    // Executar query
    const recebimentos = await executeQuery(query, params);

    // Buscar produtos para recebimentos parciais
    for (const recebimento of recebimentos) {
      if (recebimento.tipo_recebimento === 'Parcial') {
        const produtos = await executeQuery(
          'SELECT * FROM recebimentos_produtos WHERE recebimento_id = ?',
          [recebimento.id]
        );
        recebimento.produtos = produtos;
      }
    }

    // Preparar dados para XLSX
    const dadosXLSX = recebimentos.map(recebimento => ({
      'ID': recebimento.id,
      'Escola': recebimento.escola_nome,
      'Rota': recebimento.escola_rota,
      'Cidade': recebimento.escola_cidade,
      'Data Recebimento': recebimento.data_recebimento ? new Date(recebimento.data_recebimento).toLocaleDateString('pt-BR') : '',
      'Tipo Recebimento': recebimento.tipo_recebimento,
      'Tipo Entrega': recebimento.tipo_entrega,
      'Status': recebimento.status,
      'Nutricionista': recebimento.nutricionista_nome,
      'Email Nutricionista': recebimento.nutricionista_email,
      'Observações': recebimento.observacoes || '',
      'Data Criação': recebimento.created_at ? new Date(recebimento.created_at).toLocaleDateString('pt-BR') : '',
      'Data Atualização': recebimento.updated_at ? new Date(recebimento.updated_at).toLocaleDateString('pt-BR') : ''
    }));

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dadosXLSX);

    // Definir larguras das colunas
    const colWidths = [
      { wch: 8 },   // ID
      { wch: 30 },  // Escola
      { wch: 20 },  // Rota
      { wch: 20 },  // Cidade
      { wch: 15 },  // Data Recebimento
      { wch: 15 },  // Tipo Recebimento
      { wch: 15 },  // Tipo Entrega
      { wch: 12 },  // Status
      { wch: 25 },  // Nutricionista
      { wch: 30 },  // Email Nutricionista
      { wch: 40 },  // Observações
      { wch: 15 },  // Data Criação
      { wch: 15 }   // Data Atualização
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recebimentos Escolas');

    // Gerar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers para download
    const filename = `recebimentos_escolas_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);

  } catch (error) {
    console.error('Erro ao exportar XLSX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao exportar XLSX',
      error: error.message
    });
  }
};

/**
 * Exportar dados para PDF
 */
const exportarPDF = async (req, res) => {
  try {
    const { user } = req;
    const filtros = req.query;

    // Construir query base (mesma lógica do XLSX)
    let query = `
      SELECT 
        re.id,
        re.escola_nome,
        re.escola_rota,
        re.escola_cidade,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.observacoes,
        re.status,
        re.created_at,
        re.updated_at,
        u.nome as nutricionista_nome,
        u.email as nutricionista_email
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Aplicar filtros (mesma lógica do XLSX)
    if (filtros.escola_id) {
      query += ' AND re.escola_id = ?';
      params.push(filtros.escola_id);
    }

    if (filtros.tipo_recebimento) {
      query += ' AND re.tipo_recebimento = ?';
      params.push(filtros.tipo_recebimento);
    }

    if (filtros.tipo_entrega) {
      query += ' AND re.tipo_entrega = ?';
      params.push(filtros.tipo_entrega);
    }

    if (filtros.data_inicio) {
      query += ' AND re.data_recebimento >= ?';
      params.push(filtros.data_inicio);
    }

    if (filtros.data_fim) {
      query += ' AND re.data_recebimento <= ?';
      params.push(filtros.data_fim);
    }

    if (filtros.semana_abastecimento) {
      query += ' AND re.semana_abastecimento = ?';
      params.push(filtros.semana_abastecimento);
    }

    // Filtro específico para nutricionistas
    if (user.tipo_de_acesso === 'nutricionista') {
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001/api';
        
        const response = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${user.email}`);
        const rotas = response.data.data || [];
        
        if (rotas.length > 0) {
          const escolasResponsaveis = rotas.flatMap(rota => rota.escolas_responsaveis || []);
          if (escolasResponsaveis.length > 0) {
            const placeholders = escolasResponsaveis.map(() => '?').join(',');
            query += ` AND re.escola_id IN (${placeholders})`;
            params.push(...escolasResponsaveis);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar rotas do nutricionista:', error);
        query += ' AND 1=0';
      }
    }

    query += ' ORDER BY re.data_recebimento DESC, re.escola_nome';

    // Executar query
    const recebimentos = await executeQuery(query, params);

    // Criar documento PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurar headers para download
    const filename = `recebimentos_escolas_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe do documento para a resposta
    doc.pipe(res);

    // Cabeçalho do relatório
    doc.fontSize(20).text('Relatório de Recebimentos Escolas', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
    doc.moveDown(2);

    // Informações do filtro
    if (Object.keys(filtros).length > 0) {
      doc.fontSize(14).text('Filtros Aplicados:', { underline: true });
      doc.moveDown(0.5);
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          doc.fontSize(10).text(`${label}: ${value}`);
        }
      });
      doc.moveDown(2);
    }

    // Tabela de dados
    if (recebimentos.length > 0) {
      doc.fontSize(14).text(`Total de Registros: ${recebimentos.length}`, { underline: true });
      doc.moveDown(1);

      // Cabeçalho da tabela
      const tableTop = doc.y;
      const itemHeight = 20;
      const pageHeight = doc.page.height - 100;
      
      // Verificar se cabe na página
      if (tableTop + (recebimentos.length * itemHeight) > pageHeight) {
        doc.addPage();
      }

      // Cabeçalhos das colunas
      doc.fontSize(10).text('ID', 50, doc.y);
      doc.text('Escola', 80, doc.y);
      doc.text('Rota', 200, doc.y);
      doc.text('Data', 280, doc.y);
      doc.text('Tipo', 350, doc.y);
      doc.text('Status', 420, doc.y);
      
      // Linha separadora
      doc.moveTo(50, doc.y + 15).lineTo(500, doc.y + 15).stroke();
      doc.y += 20;

      // Dados da tabela
      recebimentos.forEach((recebimento, index) => {
        // Verificar se precisa de nova página
        if (doc.y + itemHeight > pageHeight) {
          doc.addPage();
        }

        doc.fontSize(8).text(recebimento.id.toString(), 50, doc.y);
        doc.text(recebimento.escola_nome || '', 80, doc.y, { width: 110, ellipsis: true });
        doc.text(recebimento.escola_rota || '', 200, doc.y, { width: 70, ellipsis: true });
        doc.text(recebimento.data_recebimento ? new Date(recebimento.data_recebimento).toLocaleDateString('pt-BR') : '', 280, doc.y);
        doc.text(recebimento.tipo_recebimento || '', 350, doc.y, { width: 60, ellipsis: true });
        doc.text(recebimento.status || '', 420, doc.y, { width: 60, ellipsis: true });
        
        doc.y += itemHeight;
      });
    } else {
      doc.fontSize(12).text('Nenhum registro encontrado com os filtros aplicados.', { align: 'center' });
    }

    // Finalizar documento
    doc.end();

  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao exportar PDF',
      error: error.message
    });
  }
};

module.exports = {
  exportarXLSX,
  exportarPDF
};
