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
    const worksheet = workbook.addWorksheet('Tipo Atendimento por Escola');

    // Definir colunas
    worksheet.columns = [
      { header: 'escola_id', key: 'escola_id', width: 15 },
      { header: 'escola_nome', key: 'escola_nome', width: 40 },
      { header: 'tipos_atendimento', key: 'tipos_atendimento', width: 50 },
      { header: 'ativo', key: 'ativo', width: 10 }
    ];

    // Adicionar linha de exemplo
    worksheet.addRow({
      escola_id: 1,
      escola_nome: 'Exemplo: Escola Municipal João Silva',
      tipos_atendimento: 'lanche_manha,almoco,lanche_tarde',
      ativo: 1
    });

    // Adicionar segunda linha de exemplo
    worksheet.addRow({
      escola_id: 2,
      escola_nome: 'Exemplo: Escola Estadual Maria Santos',
      tipos_atendimento: 'parcial_manha,parcial_tarde,eja',
      ativo: 1
    });

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Adicionar nota explicativa
    worksheet.addRow([]);
    worksheet.addRow(['NOTA: Os tipos de atendimento válidos são:']);
    worksheet.addRow(['- lanche_manha']);
    worksheet.addRow(['- almoco']);
    worksheet.addRow(['- lanche_tarde']);
    worksheet.addRow(['- parcial_manha']);
    worksheet.addRow(['- parcial_tarde']);
    worksheet.addRow(['- eja']);
    worksheet.addRow([]);
    worksheet.addRow(['Você pode informar múltiplos tipos separados por vírgula.']);
    worksheet.addRow(['O campo ativo deve ser 1 (ativo) ou 0 (inativo).']);

    // Configurar resposta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=modelo_tipo_atendimento_escola.xlsx');

    // Enviar arquivo
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Erro ao gerar modelo de planilha:', error);
    return errorResponse(res, 'Erro ao gerar modelo de planilha', 500, error.message);
  }
};

/**
 * Importar tipo de atendimento por escola via Excel
 */
const importarExcel = async (req, res) => {
  console.log('🚀 INICIANDO IMPORTAÇÃO DE TIPO DE ATENDIMENTO POR ESCOLA');
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

    const sucesso = [];
    const erros = [];
    const linhas = [];

    // Tipos válidos
    const tiposValidos = ['lanche_manha', 'almoco', 'lanche_tarde', 'parcial_manha', 'eja', 'parcial_tarde'];

    // Coletar todas as linhas primeiro
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Pular cabeçalho
      linhas.push({ row, rowNumber });
    });

    // Processar cada linha sequencialmente
    for (const { row, rowNumber } of linhas) {
      const linha = rowNumber;
      const rowData = row.values;

      try {
        // Extrair valores das colunas
        const escola_id = rowData[1] ? parseInt(rowData[1]) : null;
        const escola_nome = rowData[2] ? rowData[2].toString().trim() : '';
        const tipos_atendimento_str = rowData[3] ? rowData[3].toString().trim() : '';
        const ativo = rowData[4] !== undefined && rowData[4] !== null 
          ? (rowData[4] === 1 || rowData[4] === '1' || rowData[4].toString().toLowerCase() === 'sim' || rowData[4].toString().toLowerCase() === 'true')
          : 1;

        // Validações
        if (!escola_id || isNaN(escola_id)) {
          erros.push({
            linha,
            erro: 'escola_id é obrigatório e deve ser um número válido',
            dados: { escola_id, escola_nome, tipos_atendimento_str }
          });
          continue;
        }

        if (!tipos_atendimento_str) {
          erros.push({
            linha,
            erro: 'tipos_atendimento é obrigatório',
            dados: { escola_id, escola_nome, tipos_atendimento_str }
          });
          continue;
        }

        // Processar tipos de atendimento (separados por vírgula)
        const tiposArray = tipos_atendimento_str
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);

        if (tiposArray.length === 0) {
          erros.push({
            linha,
            erro: 'Ao menos um tipo de atendimento deve ser informado',
            dados: { escola_id, escola_nome, tipos_atendimento_str }
          });
          continue;
        }

        // Validar tipos
        const tiposInvalidos = tiposArray.filter(t => !tiposValidos.includes(t));
        if (tiposInvalidos.length > 0) {
          erros.push({
            linha,
            erro: `Tipos inválidos: ${tiposInvalidos.join(', ')}. Tipos válidos: ${tiposValidos.join(', ')}`,
            dados: { escola_id, escola_nome, tipos_atendimento_str }
          });
          continue;
        }

        // Remover duplicatas
        const tiposUnicos = [...new Set(tiposArray)];
        const tiposJson = JSON.stringify(tiposUnicos);
        const userId = req.user?.id || null;

        // Verificar se já existe registro para esta escola
        const vinculosExistentes = await executeQuery(
          'SELECT id, tipos_atendimento FROM tipos_atendimento_escola WHERE escola_id = ?',
          [escola_id]
        );

        if (vinculosExistentes && vinculosExistentes.length > 0) {
          // Atualizar registro existente
          const vinculoId = vinculosExistentes[0].id;
          
          await executeQuery(
            `UPDATE tipos_atendimento_escola 
             SET tipos_atendimento = ?, ativo = ?, data_atualizacao = NOW() 
             WHERE id = ?`,
            [tiposJson, ativo, vinculoId]
          );

          sucesso.push({
            linha,
            escola_id,
            escola_nome: escola_nome || `Escola ID ${escola_id}`,
            tipos_atendimento: tiposUnicos,
            acao: 'atualizado'
          });
        } else {
          // Criar novo registro
          const result = await executeQuery(
            `INSERT INTO tipos_atendimento_escola 
             (escola_id, tipos_atendimento, ativo, usuario_criador_id, data_cadastro, data_atualizacao) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [escola_id, tiposJson, ativo, userId]
          );

          sucesso.push({
            linha,
            escola_id,
            escola_nome: escola_nome || `Escola ID ${escola_id}`,
            tipos_atendimento: tiposUnicos,
            acao: 'criado',
            id: result.insertId
          });
        }

      } catch (error) {
        console.error(`Erro na linha ${linha}:`, error);
        erros.push({
          linha,
          erro: `Erro ao processar linha: ${error.message}`,
          dados: rowData
        });
      }
    }

    return successResponse(res, {
      message: `Importação concluída: ${sucesso.length} sucesso, ${erros.length} erros`,
      data: {
        total: linhas.length,
        sucesso,
        erros
      }
    }, 200);

  } catch (error) {
    console.error('Erro ao importar planilha:', error);
    return errorResponse(res, 'Erro ao processar importação', 500, error.message);
  }
};

module.exports = {
  baixarModelo,
  importarExcel,
  uploadMiddleware
};

