const multer = require('multer');
const ExcelJS = require('exceljs');
const { pool } = require('../../config/database');
const { successResponse, errorResponse } = require('../../middleware/responseHandler');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.match(/\.(xlsx|xls)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'), false);
    }
  }
});

const uploadMiddleware = upload.single('arquivo');

const REQUIRED_HEADERS = [
  'escola_id',
  'grupo_id',
  'produto_id',
  'quantidade'
];

const normalizeHeader = (value) => {
  if (!value) return '';
  return value.toString().trim().toLowerCase();
};

const getCellValue = (row, headerMap, header) => {
  const column = headerMap[header];
  if (!column) return null;
  const cell = row.getCell(column);
  if (!cell) return null;
  if (cell.type === ExcelJS.ValueType.RichText) {
    return cell.value.richText.map(part => part.text).join('');
  }
  if (cell.type === ExcelJS.ValueType.Hyperlink) {
    return cell.value?.text || cell.value?.hyperlink || null;
  }
  if (cell.type === ExcelJS.ValueType.Number) {
    return cell.value;
  }
  if (cell.type === ExcelJS.ValueType.Date) {
    return cell.value;
  }
  if (cell.result !== undefined && cell.result !== null) {
    return cell.result;
  }
  return cell.value;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const number = Number(
    typeof value === 'string' ? value.replace(',', '.').replace(/\s/g, '') : value
  );
  if (Number.isNaN(number)) {
    return null;
  }
  return number;
};

const baixarModelo = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedido Mensal');

    worksheet.columns = [
      { header: 'escola_id', key: 'escola_id', width: 15 },
      { header: 'escola_nome', key: 'escola_nome', width: 40 },
      { header: 'grupo_id', key: 'grupo_id', width: 12 },
      { header: 'grupo_nome', key: 'grupo_nome', width: 30 },
      { header: 'produto_id', key: 'produto_id', width: 15 },
      { header: 'produto_nome', key: 'produto_nome', width: 40 },
      { header: 'unidade_medida', key: 'unidade_medida', width: 15 },
      { header: 'quantidade', key: 'quantidade', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };

    worksheet.addRow({
      escola_id: 1,
      escola_nome: 'Exemplo - Escola Municipal Primavera',
      grupo_id: 10,
      grupo_nome: 'Carnes',
      produto_id: 120,
      produto_nome: 'Carne Bovina em Cubos 1kg',
      unidade_medida: 'KG',
      quantidade: 25.5
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=modelo_pedido_mensal.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('[NecessidadesPadroesImportController] Erro ao gerar modelo:', error);
    return errorResponse(res, 'Erro ao gerar modelo de importação', 500);
  }
};

const importarExcel = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    if (!req.file) {
      return errorResponse(res, 'Nenhum arquivo foi enviado', 400);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return errorResponse(res, 'Planilha não encontrada no arquivo', 400);
    }

    const headerRow = worksheet.getRow(1);
    const headerMap = {};
    headerRow.eachCell((cell, colNumber) => {
      const headerName = normalizeHeader(cell.value);
      if (headerName) {
        headerMap[headerName] = colNumber;
      }
    });

    const missingHeaders = REQUIRED_HEADERS.filter((header) => !headerMap[header]);
    if (missingHeaders.length > 0) {
      return errorResponse(
        res,
        `Colunas obrigatórias não encontradas: ${missingHeaders.join(', ')}`,
        400
      );
    }

    await connection.beginTransaction();

    const sucesso = [];
    const erros = [];
    const usuarioId = req.user?.id || null;

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const escolaId = getCellValue(row, headerMap, 'escola_id');
      const grupoId = getCellValue(row, headerMap, 'grupo_id');
      const produtoId = getCellValue(row, headerMap, 'produto_id');
      const quantidadeRaw = getCellValue(row, headerMap, 'quantidade');

      if (!escolaId || !grupoId || !produtoId) {
        erros.push({
          linha: rowNumber,
          erro: 'Campos obrigatórios (escola_id, grupo_id, produto_id) não preenchidos',
          dados: { escolaId, grupoId, produtoId }
        });
        continue;
      }

      const quantidade = toNumber(quantidadeRaw);
      if (quantidade === null || quantidade < 0) {
        erros.push({
          linha: rowNumber,
          erro: 'Quantidade inválida',
          dados: { quantidade: quantidadeRaw }
        });
        continue;
      }

      const escolaNome = getCellValue(row, headerMap, 'escola_nome') || null;
      const grupoNome = getCellValue(row, headerMap, 'grupo_nome') || null;
      const produtoNome = getCellValue(row, headerMap, 'produto_nome') || null;
      const unidadeMedida = getCellValue(row, headerMap, 'unidade_medida') || null;

      try {
        const [existente] = await connection.execute(
          `
            SELECT id FROM necessidades_padroes
            WHERE escola_id = ? AND grupo_id = ? AND produto_id = ? AND ativo = 1
          `,
          [escolaId, grupoId, produtoId]
        );

        if (existente.length > 0) {
          await connection.execute(
            `
              UPDATE necessidades_padroes
              SET quantidade = ?, 
                  escola_nome = COALESCE(?, escola_nome),
                  grupo_nome = COALESCE(?, grupo_nome),
                  produto_nome = COALESCE(?, produto_nome),
                  unidade_medida_sigla = COALESCE(?, unidade_medida_sigla),
                  usuario_id = COALESCE(?, usuario_id),
                  data_atualizacao = CURRENT_TIMESTAMP
              WHERE id = ?
            `,
            [
              quantidade,
              escolaNome,
              grupoNome,
              produtoNome,
              unidadeMedida,
              usuarioId,
              existente[0].id
            ]
          );

          sucesso.push({
            linha: rowNumber,
            tipo: 'atualizado',
            escola_id: escolaId,
            grupo_id: grupoId,
            produto_id: produtoId,
            quantidade
          });
        } else {
          await connection.execute(
            `
              INSERT INTO necessidades_padroes
                (escola_id, grupo_id, produto_id, quantidade, escola_nome, grupo_nome, produto_nome, unidade_medida_sigla, usuario_id, ativo)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `,
            [
              escolaId,
              grupoId,
              produtoId,
              quantidade,
              escolaNome,
              grupoNome,
              produtoNome,
              unidadeMedida,
              usuarioId
            ]
          );

          sucesso.push({
            linha: rowNumber,
            tipo: 'inserido',
            escola_id: escolaId,
            grupo_id: grupoId,
            produto_id: produtoId,
            quantidade
          });
        }
      } catch (err) {
        console.error('[NecessidadesPadroesImportController] Erro ao processar linha:', err);
        erros.push({
          linha: rowNumber,
          erro: err.message || 'Erro ao inserir/atualizar registro',
          dados: { escolaId, grupoId, produtoId, quantidade }
        });
      }
    }

    await connection.commit();

    return successResponse(res, {
      total: worksheet.rowCount - 1,
      sucesso,
      erros
    }, 'Importação processada');
  } catch (error) {
    console.error('[NecessidadesPadroesImportController] Erro ao importar planilha:', error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('[NecessidadesPadroesImportController] Erro ao realizar rollback:', rollbackError);
      }
    }
    return errorResponse(res, 'Erro ao importar planilha', 500, error.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  uploadMiddleware,
  baixarModelo,
  importarExcel
};

