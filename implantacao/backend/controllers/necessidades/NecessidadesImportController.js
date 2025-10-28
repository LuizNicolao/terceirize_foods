const multer = require('multer');
const ExcelJS = require('exceljs');
const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse } = require('../../utils/responseUtils');

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel são permitidos'), false);
    }
  }
});

/**
 * Middleware para upload de arquivo
 */
const uploadMiddleware = upload.single('planilha');

/**
 * Baixar modelo de planilha para importação
 */
const baixarModelo = async (req, res) => {
  try {
    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Necessidades');

    // Definir colunas
    worksheet.columns = [
      { header: 'escola_id', key: 'escola_id', width: 15 },
      { header: 'escola_nome', key: 'escola_nome', width: 30 },
      { header: 'produto_id', key: 'produto_id', width: 15 },
      { header: 'produto_nome', key: 'produto_nome', width: 40 },
      { header: 'quantidade', key: 'quantidade', width: 15 },
      { header: 'semana_abastecimento', key: 'semana_abastecimento', width: 20 },
      { header: 'semana_consumo', key: 'semana_consumo', width: 20 },
      { header: 'observacoes', key: 'observacoes', width: 30 }
    ];

    // Adicionar linha de exemplo
    worksheet.addRow({
      escola_id: 1,
      escola_nome: 'Exemplo: Escola Municipal João Silva',
      produto_id: 1,
      produto_nome: 'Exemplo: Arroz Integral 1kg',
      quantidade: 10.500,
      semana_abastecimento: '2024-01-01 a 2024-01-07',
      semana_consumo: '2024-01-08 a 2024-01-14',
      observacoes: 'Exemplo: Observações sobre a necessidade'
    });

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Configurar resposta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=modelo_necessidades.xlsx');

    // Enviar arquivo
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Erro ao gerar modelo de planilha:', error);
    res.status(500).json(errorResponse('Erro ao gerar modelo de planilha', error.message));
  }
};

/**
 * Importar necessidades via Excel
 */
const importarExcel = async (req, res) => {
  try {
    // Verificar se arquivo foi enviado
    if (!req.file) {
      return res.status(400).json(errorResponse('Nenhum arquivo foi enviado'));
    }

    // Processar arquivo Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return res.status(400).json(errorResponse('Planilha não encontrada no arquivo'));
    }

    const necessidades = [];
    const erros = [];
    let linha = 1;

    // Pular cabeçalho (linha 1)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Pular cabeçalho
      
      linha = rowNumber;
      const rowData = row.values;

      try {
        // Validar dados obrigatórios
        const escolaId = rowData[1]; // escola_id
        const escolaNome = rowData[2]; // escola_nome
        const produtoId = rowData[3]; // produto_id
        const produtoNome = rowData[4]; // produto_nome
        const quantidade = rowData[5]; // quantidade

        if (!escolaId || !produtoId || !quantidade) {
          erros.push({
            linha: linha,
            erro: 'Campos obrigatórios não preenchidos (escola_id, produto_id, quantidade)',
            dados: { escolaId, produtoId, quantidade }
          });
          return;
        }

        // Validar se escola existe
        const escolaExiste = true; // TODO: Implementar verificação no banco
        if (!escolaExiste) {
          erros.push({
            linha: linha,
            erro: `Escola com ID ${escolaId} não encontrada`,
            dados: { escolaId, escolaNome }
          });
          return;
        }

        // Validar se produto existe
        const produtoExiste = true; // TODO: Implementar verificação no banco
        if (!produtoExiste) {
          erros.push({
            linha: linha,
            erro: `Produto com ID ${produtoId} não encontrado`,
            dados: { produtoId, produtoNome }
          });
          return;
        }

        // Validar quantidade
        const qtd = parseFloat(quantidade);
        if (isNaN(qtd) || qtd <= 0) {
          erros.push({
            linha: linha,
            erro: 'Quantidade deve ser um número positivo',
            dados: { quantidade }
          });
          return;
        }

        // Adicionar à lista de necessidades válidas
        necessidades.push({
          escola_id: parseInt(escolaId),
          escola_nome: escolaNome,
          produto_id: parseInt(produtoId),
          produto_nome: produtoNome,
          quantidade: qtd,
          semana_abastecimento: rowData[6] || null,
          semana_consumo: rowData[7] || null,
          observacoes: rowData[8] || null,
          status: 'NEC', // Status padrão para necessidades importadas
          usuario_id: req.user.id,
          usuario_email: req.user.email
        });

      } catch (error) {
        erros.push({
          linha: linha,
          erro: `Erro ao processar linha: ${error.message}`,
          dados: rowData
        });
      }
    });

    // Inserir necessidades no banco de dados
    const sucesso = [];
    for (const necessidade of necessidades) {
      try {
        const query = `
          INSERT INTO necessidades (
            usuario_id, usuario_email, escola_id, escola, produto_id, produto,
            ajuste, semana_abastecimento, semana_consumo, status, observacoes,
            data_preenchimento, data_atualizacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const params = [
          necessidade.usuario_id,
          necessidade.usuario_email,
          necessidade.escola_id,
          necessidade.escola_nome,
          necessidade.produto_id,
          necessidade.produto_nome,
          necessidade.quantidade,
          necessidade.semana_abastecimento,
          necessidade.semana_consumo,
          necessidade.status,
          necessidade.observacoes
        ];

        const result = await executeQuery(query, params);
        
        sucesso.push({
          id: result.insertId,
          linha: linha,
          escola_nome: necessidade.escola_nome,
          produto_nome: necessidade.produto_nome,
          quantidade: necessidade.quantidade
        });

      } catch (error) {
        erros.push({
          linha: linha,
          erro: `Erro ao inserir no banco: ${error.message}`,
          dados: necessidade
        });
      }
    }

    // Resposta
    res.json(successResponse({
      total: necessidades.length + erros.length,
      sucesso: sucesso,
      erros: erros
    }, `Importação concluída: ${sucesso.length} necessidades criadas, ${erros.length} erros`));

  } catch (error) {
    console.error('Erro ao importar necessidades:', error);
    res.status(500).json(errorResponse('Erro ao processar arquivo Excel', error.message));
  }
};

module.exports = {
  baixarModelo,
  importarExcel,
  uploadMiddleware
};
