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
    const worksheet = workbook.addWorksheet('Produtos Per Capita');

    // Definir colunas
    worksheet.columns = [
      { header: 'produto_id', key: 'produto_id', width: 15 },
      { header: 'produto_nome', key: 'produto_nome', width: 40 },
      { header: 'produto_codigo', key: 'produto_codigo', width: 20 },
      { header: 'unidade_medida', key: 'unidade_medida', width: 15 },
      { header: 'grupo', key: 'grupo', width: 20 },
      { header: 'subgrupo', key: 'subgrupo', width: 20 },
      { header: 'classe', key: 'classe', width: 20 },
      { header: 'per_capita_parcial', key: 'per_capita_parcial', width: 18 },
      { header: 'per_capita_lanche_manha', key: 'per_capita_lanche_manha', width: 22 },
      { header: 'per_capita_lanche_tarde', key: 'per_capita_lanche_tarde', width: 22 },
      { header: 'per_capita_almoco', key: 'per_capita_almoco', width: 18 },
      { header: 'per_capita_eja', key: 'per_capita_eja', width: 15 },
      { header: 'descricao', key: 'descricao', width: 40 },
      { header: 'ativo', key: 'ativo', width: 10 }
    ];

    // Adicionar linha de exemplo
    worksheet.addRow({
      produto_id: 1,
      produto_nome: 'Exemplo: Arroz Integral 1kg',
      produto_codigo: 'EX001',
      unidade_medida: 'KG',
      grupo: 'SECOS',
      subgrupo: 'Grãos',
      classe: 'Cereais',
      per_capita_parcial: 0.100,
      per_capita_lanche_manha: 0.000,
      per_capita_lanche_tarde: 0.000,
      per_capita_almoco: 0.150,
      per_capita_eja: 0.000,
      descricao: 'Exemplo: Observações sobre o produto per capita',
      ativo: 1
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
    res.setHeader('Content-Disposition', 'attachment; filename=modelo_produtos_per_capita.xlsx');

    // Enviar arquivo
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Erro ao gerar modelo de planilha:', error);
    return errorResponse(res, 'Erro ao gerar modelo de planilha', 500, error.message);
  }
};

/**
 * Importar produtos per capita via Excel
 */
const importarExcel = async (req, res) => {
  console.log('🚀 INICIANDO IMPORTAÇÃO DE PRODUTOS PER CAPITA');
  try {
    // Verificar se arquivo foi enviado
    if (!req.file) {
      return errorResponse(res, 'Nenhum arquivo foi enviado', 400);
    }

    const userId = req.user?.id || null;

    // Processar arquivo Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return errorResponse(res, 'Planilha não encontrada no arquivo', 400);
    }

    const resultados = {
      sucesso: [],
      erros: [],
      total: 0
    };
    
    // Processar cada linha (pular cabeçalho)
    const totalRows = worksheet.rowCount;
    
    for (let rowNumber = 2; rowNumber <= totalRows; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      resultados.total++;

      try {
        const valores = {};
        row.eachCell((cell, colNumber) => {
          const headerCell = worksheet.getRow(1).getCell(colNumber);
          const header = headerCell.value?.toString()?.toLowerCase()?.trim();
          if (header) {
            valores[header] = cell.value;
          }
        });

        // Extrair valores
        const produto_id = valores.produto_id ? parseInt(valores.produto_id) : null;
        const produto_nome = valores.produto_nome?.toString()?.trim() || '';
        const produto_codigo = valores.produto_codigo?.toString()?.trim() || '';
        let unidade_medida = valores.unidade_medida?.toString()?.trim() || '';
        let grupo = valores.grupo?.toString()?.trim() || '';
        const subgrupo = valores.subgrupo?.toString()?.trim() || '';
        const classe = valores.classe?.toString()?.trim() || '';
        const per_capita_parcial = valores.per_capita_parcial ? parseFloat(valores.per_capita_parcial) : 0;
        const per_capita_lanche_manha = valores.per_capita_lanche_manha ? parseFloat(valores.per_capita_lanche_manha) : 0;
        const per_capita_lanche_tarde = valores.per_capita_lanche_tarde ? parseFloat(valores.per_capita_lanche_tarde) : 0;
        const per_capita_almoco = valores.per_capita_almoco ? parseFloat(valores.per_capita_almoco) : 0;
        const per_capita_eja = valores.per_capita_eja ? parseFloat(valores.per_capita_eja) : 0;
        const descricao = valores.descricao?.toString()?.trim() || null;
        const ativo = valores.ativo !== undefined ? (valores.ativo === 1 || valores.ativo === '1' || valores.ativo === true || valores.ativo?.toString()?.toLowerCase() === 'sim') ? 1 : 0 : 1;

        // Validações básicas
        if (!produto_id) {
          resultados.erros.push({
            linha: rowNumber,
            produto: produto_nome || 'N/A',
            erro: 'produto_id é obrigatório'
          });
          continue;
        }

        if (!produto_nome) {
          resultados.erros.push({
            linha: rowNumber,
            produto: produto_id.toString(),
            erro: 'produto_nome é obrigatório'
          });
          continue;
        }

        // Verificar se produto existe no foods_db
        const produtoExiste = await executeQuery(
          `SELECT id, nome, codigo, unidade_medida, grupo, subgrupo, classe, grupo_id
           FROM foods_db.produtos 
           WHERE id = ?`,
          [produto_id]
        );

        let produto_origem_id = null;
        let grupo_id = null;

        if (produtoExiste.length > 0) {
          produto_origem_id = produtoExiste[0].id;
          grupo_id = produtoExiste[0].grupo_id || null;
          
          // Atualizar dados do produto se necessário
          if (!unidade_medida && produtoExiste[0].unidade_medida) {
            unidade_medida = produtoExiste[0].unidade_medida;
          }
          if (!grupo && produtoExiste[0].grupo) {
            grupo = produtoExiste[0].grupo;
          }
        } else {
          // Tentar buscar por código
          if (produto_codigo) {
            const produtoPorCodigo = await executeQuery(
              `SELECT id, nome, codigo, unidade_medida, grupo, subgrupo, classe, grupo_id
               FROM foods_db.produtos 
               WHERE codigo = ?`,
              [produto_codigo]
            );
            
            if (produtoPorCodigo.length > 0) {
              produto_origem_id = produtoPorCodigo[0].id;
              grupo_id = produtoPorCodigo[0].grupo_id || null;
            }
          }
        }

        // Verificar se já existe per capita ativo para este produto
        const perCapitaExistente = await executeQuery(
          'SELECT id FROM produtos_per_capita WHERE produto_id = ? AND ativo = 1',
          [produto_id]
        );

        if (perCapitaExistente.length > 0) {
          // Atualizar existente
          await executeQuery(
            `UPDATE produtos_per_capita SET
              produto_origem_id = ?,
              produto_nome = ?,
              produto_codigo = ?,
              unidade_medida = ?,
              grupo = ?,
              subgrupo = ?,
              classe = ?,
              per_capita_parcial = ?,
              per_capita_lanche_manha = ?,
              per_capita_lanche_tarde = ?,
              per_capita_almoco = ?,
              per_capita_eja = ?,
              descricao = ?,
              ativo = ?,
              grupo_id = ?,
              data_atualizacao = NOW()
            WHERE id = ?`,
            [
              produto_origem_id,
              produto_nome,
              produto_codigo || null,
              unidade_medida || null,
              grupo || null,
              subgrupo || null,
              classe || null,
              per_capita_parcial,
              per_capita_lanche_manha,
              per_capita_lanche_tarde,
              per_capita_almoco,
              per_capita_eja,
              descricao,
              ativo,
              grupo_id,
              perCapitaExistente[0].id
            ]
          );

          resultados.sucesso.push({
            linha: rowNumber,
            produto: produto_nome,
            acao: 'atualizado'
          });
        } else {
          // Criar novo
          // Buscar próximo ID
          const maxIdResult = await executeQuery(
            'SELECT COALESCE(MAX(CAST(id AS UNSIGNED)), 0) as max_id FROM produtos_per_capita'
          );
          const novoId = (parseInt(maxIdResult[0].max_id) || 0) + 1;

          await executeQuery(
            `INSERT INTO produtos_per_capita (
              id, produto_id, produto_origem_id, produto_nome, produto_codigo,
              unidade_medida, grupo, subgrupo, classe,
              per_capita_parcial, per_capita_lanche_manha, per_capita_lanche_tarde,
              per_capita_almoco, per_capita_eja, descricao, ativo, grupo_id,
              data_cadastro, data_atualizacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              novoId,
              produto_id,
              produto_origem_id,
              produto_nome,
              produto_codigo || null,
              unidade_medida || null,
              grupo || null,
              subgrupo || null,
              classe || null,
              per_capita_parcial,
              per_capita_lanche_manha,
              per_capita_lanche_tarde,
              per_capita_almoco,
              per_capita_eja,
              descricao,
              ativo,
              grupo_id
            ]
          );

          resultados.sucesso.push({
            linha: rowNumber,
            produto: produto_nome,
            acao: 'criado'
          });
        }

      } catch (error) {
        console.error(`Erro na linha ${rowNumber}:`, error);
        resultados.erros.push({
          linha: rowNumber,
          produto: 'N/A',
          erro: error.message || 'Erro desconhecido'
        });
      }
    }

    console.log(`✅ IMPORTAÇÃO CONCLUÍDA: ${resultados.sucesso.length} sucesso, ${resultados.erros.length} erros`);

    return successResponse(res, {
      total: resultados.total,
      sucesso: resultados.sucesso.length,
      erros: resultados.erros.length,
      detalhes: resultados
    }, `Importação concluída: ${resultados.sucesso.length} produto(s) processado(s) com sucesso${resultados.erros.length > 0 ? `, ${resultados.erros.length} erro(s)` : ''}`);

  } catch (error) {
    console.error('Erro ao importar produtos per capita:', error);
    return errorResponse(res, 'Erro ao processar importação', 500, error.message);
  }
};

module.exports = {
  baixarModelo,
  importarExcel,
  uploadMiddleware
};

