const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse } = require('../../middleware/responseHandler');
const ExcelJS = require('exceljs');
const multer = require('multer');

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx) são permitidos'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

class RegistrosDiariosImportController {
  /**
   * Gerar e baixar modelo de planilha para importação
   */
  static async baixarModelo(req, res) {
    try {
      console.log('🚀 GERANDO MODELO DE REGISTROS DIÁRIOS');

      // Buscar algumas escolas para exemplo
      const escolasQuery = `
        SELECT id, nome_escola 
        FROM foods_db.unidades_escolares 
        WHERE ativo = 1 
        LIMIT 5
      `;
      const escolas = await executeQuery(escolasQuery);

      // Criar workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Registros Diários');

      // Definir colunas
      worksheet.columns = [
        { header: 'Escola', key: 'escola', width: 30 },
        { header: 'Data', key: 'data', width: 15 },
        { header: 'Lanche Manhã', key: 'lanche_manha', width: 15 },
        { header: 'Almoço', key: 'almoco', width: 15 },
        { header: 'Lanche Tarde', key: 'lanche_tarde', width: 15 },
        { header: 'Parcial', key: 'parcial', width: 15 },
        { header: 'EJA', key: 'eja', width: 15 }
      ];

      // Estilizar cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      };

      // Adicionar dados de exemplo
      const dataAtual = new Date();
      const dataExemplo = dataAtual.toISOString().split('T')[0]; // YYYY-MM-DD

      const exemplos = [
        {
          escola: escolas[0]?.nome_escola || 'EMEI João Silva',
          data: dataExemplo,
          lanche_manha: 150,
          almoco: 200,
          lanche_tarde: 120,
          parcial: 0,
          eja: 30
        },
        {
          escola: escolas[1]?.nome_escola || 'EMEF Maria Santos',
          data: dataExemplo,
          lanche_manha: 300,
          almoco: 400,
          lanche_tarde: 250,
          parcial: 50,
          eja: 60
        }
      ];

      exemplos.forEach(exemplo => {
        worksheet.addRow(exemplo);
      });

      // Adicionar instruções
      worksheet.addRow([]);
      worksheet.addRow(['INSTRUÇÕES:']);
      worksheet.addRow(['1. Use o nome exato da escola conforme cadastrado no sistema']);
      worksheet.addRow(['2. Data deve estar no formato YYYY-MM-DD (ex: 2025-01-15)']);
      worksheet.addRow(['3. Quantidades devem ser números inteiros (ex: 150, 200)']);
      worksheet.addRow(['4. Deixe 0 para refeições não servidas']);
      worksheet.addRow(['5. Registros duplicados (mesma escola/data) serão atualizados']);

      // Estilizar instruções
      const instrucoesRow = worksheet.rowCount;
      for (let i = instrucoesRow - 5; i <= instrucoesRow; i++) {
        worksheet.getRow(i).font = { italic: true, size: 10 };
        worksheet.getRow(i).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F8FF' }
        };
      }

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="modelo_registros_diarios.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao gerar modelo:', error);
      return errorResponse(res, 'Erro ao gerar modelo de planilha', 500);
    }
  }

  /**
   * Importar registros diários via Excel
   */
  static async importar(req, res) {
    try {
      console.log('🚀 INICIANDO IMPORTAÇÃO DE REGISTROS DIÁRIOS');

      if (!req.file) {
        return errorResponse(res, 'Nenhum arquivo enviado', 400);
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        return errorResponse(res, 'Planilha não encontrada', 400);
      }

      const registros = [];
      const erros = [];
      let linha = 2; // Começar da linha 2 (pular cabeçalho)

      // Processar cada linha
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Pular cabeçalho

        const valores = row.values;
        if (!valores || valores.length < 8) return;

        const registro = {
          escola: valores[1]?.toString().trim(),
          data: valores[2]?.toString().trim(),
          lanche_manha: parseInt(valores[3]) || 0,
          almoco: parseInt(valores[4]) || 0,
          lanche_tarde: parseInt(valores[5]) || 0,
          parcial: parseInt(valores[6]) || 0,
          eja: parseInt(valores[7]) || 0
        };

        // Validações básicas
        if (!registro.escola || !registro.data) {
          erros.push(`Linha ${linha}: Escola e Data são obrigatórios`);
          linha++;
          return;
        }

        // Validar formato da data
        const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dataRegex.test(registro.data)) {
          erros.push(`Linha ${linha}: Data deve estar no formato YYYY-MM-DD`);
          linha++;
          return;
        }

        // Validar se pelo menos uma quantidade é maior que 0
        const temQuantidade = Object.values(registro).some(valor => 
          typeof valor === 'number' && valor > 0
        );
        if (!temQuantidade) {
          erros.push(`Linha ${linha}: Pelo menos uma quantidade deve ser maior que 0`);
          linha++;
          return;
        }

        registros.push(registro);
        linha++;
      });

      if (erros.length > 0) {
        return errorResponse(res, 'Erros de validação encontrados', 400, { erros });
      }

      if (registros.length === 0) {
        return errorResponse(res, 'Nenhum registro válido encontrado', 400);
      }

      console.log(`📊 Processando ${registros.length} registros`);

      // Processar cada registro
      let importados = 0;
      let atualizados = 0;

      for (const registro of registros) {
        try {
          // Buscar escola pelo nome
          const escolaQuery = `
            SELECT id, nome_escola 
            FROM foods_db.unidades_escolares 
            WHERE nome_escola = ? AND ativo = 1
            LIMIT 1
          `;
          const escolas = await executeQuery(escolaQuery, [registro.escola]);
          
          if (escolas.length === 0) {
            erros.push(`Escola "${registro.escola}" não encontrada`);
            continue;
          }

          const escola = escolas[0];
          const nutricionistaId = req.user?.id || 1; // Usar ID do usuário logado

          // Verificar se já existe registro para esta escola/data
          const existeQuery = `
            SELECT id FROM registros_diarios 
            WHERE escola_id = ? AND data = ? AND ativo = 1
            LIMIT 1
          `;
          const existentes = await executeQuery(existeQuery, [escola.id, registro.data]);

          if (existentes.length > 0) {
            // Atualizar registro existente
            const updateQuery = `
              UPDATE registros_diarios 
              SET 
                lanche_manha = ?,
                almoco = ?,
                lanche_tarde = ?,
                parcial = ?,
                eja = ?,
                data_atualizacao = NOW()
              WHERE escola_id = ? AND data = ? AND ativo = 1
            `;
            await executeQuery(updateQuery, [
              registro.lanche_manha,
              registro.almoco,
              registro.lanche_tarde,
              registro.parcial,
              registro.eja,
              escola.id,
              registro.data
            ]);
            atualizados++;
          } else {
            // Inserir novo registro
            const insertQuery = `
              INSERT INTO registros_diarios (
                escola_id, escola_nome, nutricionista_id, data,
                lanche_manha, almoco, lanche_tarde, parcial, eja,
                data_criacao, data_atualizacao, ativo
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 1)
            `;
            await executeQuery(insertQuery, [
              escola.id,
              escola.nome_escola,
              nutricionistaId,
              registro.data,
              registro.lanche_manha,
              registro.almoco,
              registro.lanche_tarde,
              registro.parcial,
              registro.eja
            ]);
            importados++;
          }

          // Chamar procedimento para calcular médias
          const calcularMediasQuery = `CALL CalcularMediaEscola(?)`;
          await executeQuery(calcularMediasQuery, [escola.id]);

        } catch (error) {
          console.error(`Erro ao processar registro da linha ${linha}:`, error);
          erros.push(`Linha ${linha}: Erro interno - ${error.message}`);
        }
      }

      console.log(`✅ Importação concluída: ${importados} novos, ${atualizados} atualizados`);

      return successResponse(res, {
        message: 'Importação realizada com sucesso',
        importados,
        atualizados,
        erros: erros.length > 0 ? erros : null
      });

    } catch (error) {
      console.error('Erro na importação:', error);
      return errorResponse(res, 'Erro interno na importação', 500);
    }
  }
}

module.exports = {
  RegistrosDiariosImportController,
  upload
};
