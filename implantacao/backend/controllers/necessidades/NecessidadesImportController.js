const multer = require('multer');
const ExcelJS = require('exceljs');
const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse } = require('../../middleware/responseHandler');

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
    return errorResponse(res, 'Erro ao gerar modelo de planilha', 500, error.message);
  }
};

/**
 * Importar necessidades via Excel
 */
const importarExcel = async (req, res) => {
  try {
    // Verificar se arquivo foi enviado
    if (!req.file) {
      return errorResponse(res, 'Nenhum arquivo foi enviado', 400);
    }

    // Processar arquivo Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return errorResponse(res, 'Planilha não encontrada no arquivo', 400);
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
        // Verificar se já existe necessidade duplicada
        const existing = await executeQuery(`
          SELECT id FROM necessidades 
          WHERE usuario_id = ? AND escola_id = ? AND produto_id = ? AND semana_consumo = ?
        `, [necessidade.usuario_id, necessidade.escola_id, necessidade.produto_id, necessidade.semana_consumo]);

        if (existing.length > 0) {
          erros.push({
            linha: linha,
            erro: `Necessidade já existe para esta escola, produto e semana`,
            dados: {
              escola: necessidade.escola_nome,
              produto: necessidade.produto_nome,
              semana: necessidade.semana_consumo
            }
          });
          continue;
        }

        // Buscar informações adicionais do produto no banco foods
        let produto = { unidade_medida: 'UN', grupo: null, grupo_id: null };
        try {
          const produtoInfo = await executeQuery(`
            SELECT 
              po.unidade_medida_nome as unidade_medida,
              g.nome as grupo,
              g.id as grupo_id
            FROM foods_db.produto_origem po
            LEFT JOIN foods_db.grupos g ON po.grupo_id = g.id
            WHERE po.id = ?
          `, [necessidade.produto_id]);
          
          if (produtoInfo.length > 0) {
            produto = produtoInfo[0];
          }
        } catch (error) {
          console.log('Erro ao buscar dados do produto, usando valores padrão:', error.message);
        }
        
        // Buscar informações da escola no banco foods
        let escola = { rota: null, codigo_teknisa: null };
        try {
          const escolaInfo = await executeQuery(`
            SELECT 
              r.nome as rota,
              ue.codigo_teknisa
            FROM foods_db.unidades_escolares ue
            LEFT JOIN foods_db.rotas r ON ue.rota_id = r.id
            WHERE ue.id = ?
          `, [necessidade.escola_id]);
          
          if (escolaInfo.length > 0) {
            escola = escolaInfo[0];
          }
        } catch (error) {
          console.log('Erro ao buscar dados da escola, usando valores padrão:', error.message);
        }
        
        // Gerar ID sequencial para esta necessidade
        const ultimoId = await executeQuery(`
          SELECT COALESCE(MAX(CAST(necessidade_id AS UNSIGNED)), 0) as ultimo_id 
          FROM necessidades 
          WHERE necessidade_id REGEXP '^[0-9]+$'
        `);
        
        const proximoId = (ultimoId[0]?.ultimo_id || 0) + 1;
        const necessidadeId = proximoId.toString();

        const query = `
          INSERT INTO necessidades (
            usuario_id, usuario_email, escola_id, escola, escola_rota, codigo_teknisa,
            produto_id, produto, produto_unidade, ajuste, semana_abastecimento, 
            semana_consumo, status, observacoes, necessidade_id, ajuste_nutricionista,
            ajuste_coordenacao, substituicao_processada, grupo, grupo_id,
            data_preenchimento, data_atualizacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const params = [
          necessidade.usuario_id,
          necessidade.usuario_email,
          necessidade.escola_id,
          necessidade.escola_nome,
          escola.rota || null, // escola_rota da tabela unidades_escolares
          escola.codigo_teknisa || null, // codigo_teknisa da tabela unidades_escolares
          necessidade.produto_id,
          necessidade.produto_nome,
          produto.unidade_medida || null,
          necessidade.quantidade,
          necessidade.semana_abastecimento,
          necessidade.semana_consumo,
          necessidade.status,
          necessidade.observacoes,
          necessidadeId,
          necessidade.quantidade, // ajuste_nutricionista = quantidade
          necessidade.quantidade, // ajuste_coordenacao = quantidade
          0, // substituicao_processada = 0 (não processada)
          produto.grupo || null,
          produto.grupo_id || null
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
    return successResponse(res, {
      total: necessidades.length + erros.length,
      sucesso: sucesso,
      erros: erros
    }, `Importação concluída: ${sucesso.length} necessidades criadas, ${erros.length} erros`);

  } catch (error) {
    console.error('Erro ao importar necessidades:', error);
    return errorResponse(res, 'Erro ao processar arquivo Excel', 500, error.message);
  }
};

module.exports = {
  baixarModelo,
  importarExcel,
  uploadMiddleware
};
