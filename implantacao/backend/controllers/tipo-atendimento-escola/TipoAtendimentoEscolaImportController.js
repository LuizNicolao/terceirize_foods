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

    // Ler cabeçalhos para mapear colunas
    const headers = {};
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const headerName = cell.value?.toString()?.toLowerCase()?.trim();
      if (headerName) {
        headers[headerName] = colNumber;
      }
    });

    // Coletar todas as linhas primeiro (pular vazias)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Pular cabeçalho
      
      // Verificar se a linha tem pelo menos uma célula com valor
      let temValor = false;
      row.eachCell((cell) => {
        if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
          temValor = true;
        }
      });
      
      if (temValor) {
      linhas.push({ row, rowNumber });
      }
    });

    // Processar cada linha sequencialmente
    for (const { row, rowNumber } of linhas) {
      const linha = rowNumber;
      
      // Declarar variáveis fora do try para estarem disponíveis no catch
      let escola_id = null;
      let escola_nome = '';
      let tipos_atendimento_str = '';
      let ativo = 1;

      try {
        // Função auxiliar para ler valor da célula por nome do cabeçalho
        const getValueByHeader = (headerName) => {
          const colNumber = headers[headerName];
          if (!colNumber) return null;
          const cell = row.getCell(colNumber);
          return cell.value;
        };

        // Extrair valores das colunas usando cabeçalhos
        const escola_id_raw = getValueByHeader('escola_id') || row.values[headers['escola_id']] || row.values[1];
        escola_id = escola_id_raw ? parseInt(escola_id_raw) : null;
        
        const escola_nome_raw = getValueByHeader('escola_nome') || row.values[headers['escola_nome']] || row.values[2];
        escola_nome = escola_nome_raw ? escola_nome_raw.toString().trim() : '';
        
        const tipos_atendimento_raw = getValueByHeader('tipos_atendimento') || row.values[headers['tipos_atendimento']] || row.values[3];
        tipos_atendimento_str = tipos_atendimento_raw ? tipos_atendimento_raw.toString().trim() : '';
        
        const ativo_raw = getValueByHeader('ativo') || row.values[headers['ativo']] || row.values[4];
        ativo = ativo_raw !== undefined && ativo_raw !== null 
          ? (ativo_raw === 1 || ativo_raw === '1' || ativo_raw.toString().toLowerCase() === 'sim' || ativo_raw.toString().toLowerCase() === 'true')
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
             SET tipos_atendimento = ?, ativo = ?, atualizado_por = ?, atualizado_em = NOW() 
             WHERE id = ?`,
            [tiposJson, ativo, userId, vinculoId]
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
             (escola_id, tipos_atendimento, ativo, criado_por, criado_em) 
             VALUES (?, ?, ?, ?, NOW())`,
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
        console.error(`❌ Erro na linha ${linha}:`, error);
        erros.push({
          linha,
          erro: `Erro ao processar linha: ${error.message}`,
          dados: {
            escola_id: escola_id || null,
            escola_nome: escola_nome || '',
            tipos_atendimento_str: tipos_atendimento_str || ''
          }
        });
      }
    }

    return successResponse(
      res,
      {
        total: linhas.length,
        sucesso,
        erros
      },
      `Importação concluída: ${sucesso.length} sucesso, ${erros.length} erros`,
      200
    );

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

