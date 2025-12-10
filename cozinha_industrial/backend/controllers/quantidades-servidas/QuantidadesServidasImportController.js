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

class QuantidadesServidasImportController {
  /**
   * Gerar e baixar modelo de planilha para importação
   * Adaptado para períodos dinâmicos
   */
  static async baixarModelo(req, res) {
    try {
      // Buscar algumas unidades para exemplo
      const unidadesQuery = `
        SELECT id, nome_escola 
        FROM foods_db.unidades_escolares 
        LIMIT 5
      `;
      const unidades = await executeQuery(unidadesQuery);

      // Buscar todos os períodos ativos para gerar colunas dinamicamente
      const periodosQuery = `
        SELECT id, nome, codigo 
        FROM periodos_atendimento 
        WHERE status = 'ativo' 
        ORDER BY nome
      `;
      const periodos = await executeQuery(periodosQuery);

      // Criar workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Quantidades Servidas');

      // Definir colunas dinamicamente: Unidade, Data, e depois cada período
      const colunas = [
        { header: 'Unidade', key: 'unidade', width: 30 },
        { header: 'Data', key: 'data', width: 15 }
      ];
      
      // Adicionar coluna para cada período
      periodos.forEach(periodo => {
        colunas.push({
          header: periodo.nome,
          key: `periodo_${periodo.id}`,
          width: 15
        });
      });

      worksheet.columns = colunas;

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

      const exemplos = unidades.slice(0, 2).map((unidade, index) => {
        const exemplo = {
          unidade: unidade.nome_escola,
          data: dataExemplo
        };
        
        // Adicionar valores de exemplo para cada período
        periodos.forEach((periodo, pIndex) => {
          exemplo[`periodo_${periodo.id}`] = (index + 1) * 100 + (pIndex + 1) * 10;
        });
        
        return exemplo;
      });

      exemplos.forEach(exemplo => {
        worksheet.addRow(exemplo);
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="modelo_quantidades_servidas.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao gerar modelo:', error);
      return errorResponse(res, 'Erro ao gerar modelo de planilha', 500);
    }
  }

  /**
   * Importar quantidades servidas via Excel
   * Adaptado para períodos dinâmicos
   */
  static async importar(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'Nenhum arquivo enviado', 400);
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        return errorResponse(res, 'Planilha não encontrada', 400);
      }

      // Buscar todos os períodos ativos para mapear colunas
      const periodosQuery = `
        SELECT id, nome, codigo 
        FROM periodos_atendimento 
        WHERE status = 'ativo' 
        ORDER BY nome
      `;
      const periodos = await executeQuery(periodosQuery);

      // Mapear cabeçalhos da planilha para IDs de períodos
      const headerRow = worksheet.getRow(1);
      const headerMap = {};
      headerRow.eachCell((cell, colNumber) => {
        const headerValue = cell.value?.toString().trim();
        if (headerValue && headerValue !== 'Unidade' && headerValue !== 'Data') {
          // Buscar período pelo nome
          const periodo = periodos.find(p => p.nome === headerValue);
          if (periodo) {
            headerMap[colNumber] = periodo.id;
          }
        }
      });

      const registros = [];
      const erros = [];
      let linha = 2; // Começar da linha 2 (pular cabeçalho)

      // Processar cada linha
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Pular cabeçalho

        const valores = row.values;
        if (!valores || valores.length < 3) return; // Mínimo: Unidade, Data, e pelo menos um período

        const registro = {
          unidade: valores[1]?.toString().trim(),
          data: valores[2]?.toString().trim(),
          quantidades: {}
        };

        // Extrair valores de cada período
        Object.keys(headerMap).forEach(colNumber => {
          const periodoId = headerMap[colNumber];
          const valor = parseInt(valores[colNumber]) || 0;
          if (valor > 0) {
            registro.quantidades[periodoId] = valor;
          }
        });

        // Validações básicas
        if (!registro.unidade || !registro.data) {
          erros.push(`Linha ${linha}: Unidade e Data são obrigatórios`);
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
        const temQuantidade = Object.values(registro.quantidades).some(valor => valor > 0);
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

      // Processar cada registro
      let importados = 0;
      let atualizados = 0;

      for (const registro of registros) {
        try {
          // Buscar unidade pelo nome
          const unidadeQuery = `
            SELECT id, nome_escola 
            FROM foods_db.unidades_escolares 
            WHERE nome_escola = ?
            LIMIT 1
          `;
          const unidades = await executeQuery(unidadeQuery, [registro.unidade]);
          
          if (unidades.length === 0) {
            erros.push(`Unidade "${registro.unidade}" não encontrada`);
            continue;
          }

          const unidade = unidades[0];
          const nutricionistaId = req.user?.id || 1; // Usar ID do usuário logado

          // Buscar períodos vinculados a esta unidade
          const periodosVinculadosQuery = `
            SELECT pa.id, pa.nome, pa.codigo
            FROM periodos_atendimento pa
            INNER JOIN cozinha_industrial_periodos_atendimento cipa 
              ON pa.id = cipa.periodo_atendimento_id
            WHERE cipa.cozinha_industrial_id = ? 
              AND cipa.status = 'ativo'
              AND pa.status = 'ativo'
          `;
          const periodosVinculados = await executeQuery(periodosVinculadosQuery, [unidade.id]);

          // Processar cada período presente no registro
          for (const periodoId of Object.keys(registro.quantidades)) {
            const valor = registro.quantidades[periodoId];
            
            // Verificar se o período está vinculado à unidade
            const periodoVinculado = periodosVinculados.find(p => p.id === parseInt(periodoId));
            if (!periodoVinculado) {
              erros.push(`Linha ${linha}: Período ID ${periodoId} não está vinculado à unidade "${registro.unidade}"`);
              continue;
            }

            // Verificar se já existe registro para esta unidade/data/período
            const existeQuery = `
              SELECT id FROM quantidades_servidas 
              WHERE unidade_id = ? AND data = ? AND periodo_atendimento_id = ? AND ativo = 1
              LIMIT 1
            `;
            const existentes = await executeQuery(existeQuery, [
              unidade.id,
              registro.data,
              periodoId
            ]);

            if (existentes.length > 0) {
              // Atualizar registro existente usando INSERT ... ON DUPLICATE KEY UPDATE
              const updateQuery = `
                INSERT INTO quantidades_servidas (
                  unidade_id, unidade_nome, periodo_atendimento_id, nutricionista_id, data, valor, ativo
                ) VALUES (?, ?, ?, ?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE
                  valor = VALUES(valor),
                  ativo = 1,
                  atualizado_em = NOW()
              `;
              await executeQuery(updateQuery, [
                unidade.id,
                unidade.nome_escola,
                periodoId,
                nutricionistaId,
                registro.data,
                valor
              ]);
              atualizados++;
            } else {
              // Inserir novo registro
              const insertQuery = `
                INSERT INTO quantidades_servidas (
                  unidade_id, unidade_nome, periodo_atendimento_id, nutricionista_id, data, valor, ativo
                ) VALUES (?, ?, ?, ?, ?, ?, 1)
              `;
              await executeQuery(insertQuery, [
                unidade.id,
                unidade.nome_escola,
                periodoId,
                nutricionistaId,
                registro.data,
                valor
              ]);
              importados++;
            }
          }

        } catch (error) {
          console.error(`Erro ao processar registro da linha ${linha}:`, error);
          erros.push(`Linha ${linha}: Erro interno - ${error.message}`);
        }
      }

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
  QuantidadesServidasImportController,
  upload
};
