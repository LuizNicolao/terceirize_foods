/**
 * Controller de Importação de Unidades Escolares
 * Responsável por importar múltiplas unidades escolares de uma planilha Excel
 */

const { executeQuery } = require('../../config/database');
const ExcelJS = require('exceljs');

class UnidadesEscolaresImportController {
  // Importar unidades escolares de uma planilha Excel
  static async importarUnidadesEscolares(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado',
          message: 'Por favor, selecione uma planilha Excel para importar'
        });
      }

      // Processar o arquivo Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      
      const worksheet = workbook.getWorksheet(1); // Primeira planilha
      if (!worksheet) {
        return res.status(400).json({
          success: false,
          error: 'Planilha vazia',
          message: 'A planilha não contém dados válidos'
        });
      }

      // Extrair cabeçalhos da primeira linha
      const headers = [];
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value ? cell.value.toString().trim().toLowerCase() : '';
      });

      // Mapear colunas para campos do banco
      const columnMapping = this.mapColumns(headers);
      
      // Validar se as colunas obrigatórias estão presentes
      const requiredColumns = ['codigo_teknisa', 'nome_escola', 'cidade', 'estado'];
      const missingColumns = requiredColumns.filter(col => !columnMapping[col]);
      
      if (missingColumns.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Colunas obrigatórias ausentes',
          message: `As seguintes colunas são obrigatórias: ${missingColumns.join(', ')}`,
          requiredColumns,
          foundColumns: Object.keys(columnMapping)
        });
      }

      // Processar linhas de dados
      const unidades = [];
      const errors = [];
      let rowNumber = 2; // Começar da segunda linha (após cabeçalhos)

      worksheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) return; // Pular cabeçalhos
        
        try {
          const unidade = this.extractUnidadeFromRow(row, columnMapping, rowIndex);
          if (unidade) {
            unidades.push(unidade);
          }
        } catch (error) {
          errors.push({
            row: rowIndex,
            error: error.message,
            data: row.values
          });
        }
      });

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Erros na planilha',
          message: `Encontrados ${errors.length} erros na planilha`,
          errors,
          totalRows: unidades.length + errors.length
        });
      }

      if (unidades.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma unidade válida',
          message: 'A planilha não contém unidades escolares válidas para importar'
        });
      }

      // Validar dados antes de inserir
      const validationErrors = await this.validarUnidades(unidades);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Erros de validação',
          message: `Encontrados ${validationErrors.length} erros de validação`,
          validationErrors
        });
      }

      // Inserir unidades no banco
      const insertedCount = await this.inserirUnidades(unidades);
      
      res.status(200).json({
        success: true,
        message: `Importação realizada com sucesso! ${insertedCount} unidades escolares importadas.`,
        data: {
          totalProcessed: unidades.length,
          totalInserted: insertedCount,
          unidades: unidades.slice(0, 10) // Retornar apenas as primeiras 10 para preview
        }
      });

    } catch (error) {
      console.error('Erro ao importar unidades escolares:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro durante a importação. Tente novamente.'
      });
    }
  }

  // Mapear colunas da planilha para campos do banco
  static mapColumns(headers) {
    const mapping = {};
    
    headers.forEach((header, index) => {
      if (!header) return;
      
      // Mapeamentos diretos
      const directMappings = {
        // Código Teknisa
        'codigo teknisa': 'codigo_teknisa',
        'codigo_teknisa': 'codigo_teknisa',
        'código teknisa': 'codigo_teknisa',
        'código_teknisa': 'codigo_teknisa',
        
        // Nome da Escola
        'nome escola': 'nome_escola',
        'nome_escola': 'nome_escola',
        'nome da escola': 'nome_escola',
        
        // Localização
        'cidade': 'cidade',
        'estado': 'estado',
        'pais': 'pais',
        'país': 'pais',
        
        // Endereço
        'endereco': 'endereco',
        'endereço': 'endereco',
        'numero': 'numero',
        'número': 'numero',
        'bairro': 'bairro',
        'cep': 'cep',
        
        // Operacional
        'centro distribuicao': 'centro_distribuicao',
        'centro_distribuicao': 'centro_distribuicao',
        'centro de distribuição': 'centro_distribuicao',
        'rota': 'rota_id',
        'rota_id': 'rota_id',
        'regional': 'regional',
        
        // Lote e Senior
        'lot': 'lot',
        'lote': 'lot',
        'cc senior': 'cc_senior',
        'cc_senior': 'cc_senior',
        'c.c. senior': 'cc_senior',
        'codigo senior': 'codigo_senior',
        'codigo_senior': 'codigo_senior',
        'código senior': 'codigo_senior',
        
        // Abastecimento e Ordem
        'abastecimento': 'abastecimento',
        'ordem entrega': 'ordem_entrega',
        'ordem_entrega': 'ordem_entrega',
        
        // Status e Observações
        'status': 'status',
        'observacoes': 'observacoes',
        'observações': 'observacoes',
        
        // Novos campos
        'atendimento': 'atendimento',
        'horario': 'horario',
        'horário': 'horario'
      };

      if (directMappings[header]) {
        mapping[directMappings[header]] = index;
      }
    });

    return mapping;
  }

  // Extrair dados de uma linha da planilha
  static extractUnidadeFromRow(row, columnMapping, rowIndex) {
    const unidade = {};
    
    // Campos obrigatórios
    if (columnMapping.codigo_teknisa !== undefined) {
      unidade.codigo_teknisa = this.getCellValue(row, columnMapping.codigo_teknisa);
      if (!unidade.codigo_teknisa) {
        throw new Error(`Código Teknisa é obrigatório na linha ${rowIndex}`);
      }
    }

    if (columnMapping.nome_escola !== undefined) {
      unidade.nome_escola = this.getCellValue(row, columnMapping.nome_escola);
      if (!unidade.nome_escola) {
        throw new Error(`Nome da escola é obrigatório na linha ${rowIndex}`);
      }
    }

    if (columnMapping.cidade !== undefined) {
      unidade.cidade = this.getCellValue(row, columnMapping.cidade);
      if (!unidade.cidade) {
        throw new Error(`Cidade é obrigatória na linha ${rowIndex}`);
      }
    }

    if (columnMapping.estado !== undefined) {
      unidade.estado = this.getCellValue(row, columnMapping.estado);
      if (!unidade.estado) {
        throw new Error(`Estado é obrigatório na linha ${rowIndex}`);
      }
    }

    // Campos opcionais
    if (columnMapping.pais !== undefined) {
      unidade.pais = this.getCellValue(row, columnMapping.pais) || 'Brasil';
    }

    if (columnMapping.endereco !== undefined) {
      unidade.endereco = this.getCellValue(row, columnMapping.endereco) || '';
    }

    if (columnMapping.numero !== undefined) {
      unidade.numero = this.getCellValue(row, columnMapping.numero);
    }

    if (columnMapping.bairro !== undefined) {
      unidade.bairro = this.getCellValue(row, columnMapping.bairro);
    }

    if (columnMapping.cep !== undefined) {
      unidade.cep = this.getCellValue(row, columnMapping.cep);
    }

    if (columnMapping.centro_distribuicao !== undefined) {
      unidade.centro_distribuicao = this.getCellValue(row, columnMapping.centro_distribuicao);
    }

    if (columnMapping.rota_id !== undefined) {
      const rotaValue = this.getCellValue(row, columnMapping.rota_id);
      unidade.rota_id = rotaValue ? parseInt(rotaValue) : null;
    }

    if (columnMapping.regional !== undefined) {
      unidade.regional = this.getCellValue(row, columnMapping.regional);
    }

    if (columnMapping.lot !== undefined) {
      unidade.lot = this.getCellValue(row, columnMapping.lot);
    }

    if (columnMapping.cc_senior !== undefined) {
      unidade.cc_senior = this.getCellValue(row, columnMapping.cc_senior);
    }

    if (columnMapping.codigo_senior !== undefined) {
      unidade.codigo_senior = this.getCellValue(row, columnMapping.codigo_senior);
    }

    if (columnMapping.abastecimento !== undefined) {
      unidade.abastecimento = this.getCellValue(row, columnMapping.abastecimento);
    }

    if (columnMapping.ordem_entrega !== undefined) {
      const ordemValue = this.getCellValue(row, columnMapping.ordem_entrega);
      unidade.ordem_entrega = ordemValue ? parseInt(ordemValue) : 0;
    }

    if (columnMapping.status !== undefined) {
      const statusValue = this.getCellValue(row, columnMapping.status);
      unidade.status = statusValue && ['ativo', 'inativo'].includes(statusValue.toLowerCase()) 
        ? statusValue.toLowerCase() 
        : 'ativo';
    }

    if (columnMapping.observacoes !== undefined) {
      unidade.observacoes = this.getCellValue(row, columnMapping.observacoes);
    }

    if (columnMapping.atendimento !== undefined) {
      unidade.atendimento = this.getCellValue(row, columnMapping.atendimento);
    }

    if (columnMapping.horario !== undefined) {
      unidade.horario = this.getCellValue(row, columnMapping.horario);
    }

    return unidade;
  }

  // Obter valor de uma célula
  static getCellValue(row, columnIndex) {
    const cell = row.getCell(columnIndex + 1);
    if (!cell || !cell.value) return null;
    
    // Converter para string e remover espaços
    return cell.value.toString().trim();
  }

  // Validar unidades antes de inserir
  static async validarUnidades(unidades) {
    const errors = [];
    
    for (let i = 0; i < unidades.length; i++) {
      const unidade = unidades[i];
      const rowNumber = i + 2; // +2 porque começamos da linha 2
      
      // Verificar se código teknisa já existe
      try {
        const existingUnidade = await executeQuery(
          'SELECT id FROM unidades_escolares WHERE codigo_teknisa = ?',
          [unidade.codigo_teknisa]
        );
        
        if (existingUnidade.length > 0) {
          errors.push({
            row: rowNumber,
            field: 'codigo_teknisa',
            value: unidade.codigo_teknisa,
            error: 'Código Teknisa já existe no sistema'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar código teknisa:', error);
      }

      // Verificar se rota existe (se fornecida)
      if (unidade.rota_id) {
        try {
          const rota = await executeQuery(
            'SELECT id FROM rotas WHERE id = ?',
            [unidade.rota_id]
          );
          
          if (rota.length === 0) {
            errors.push({
              row: rowNumber,
              field: 'rota_id',
              value: unidade.rota_id,
              error: 'Rota não encontrada no sistema'
            });
          }
        } catch (error) {
          console.error('Erro ao verificar rota:', error);
        }
      }

      // Validar formato do CEP
      if (unidade.cep && !/^\d{5}-?\d{3}$/.test(unidade.cep)) {
        errors.push({
          row: rowNumber,
          field: 'cep',
          value: unidade.cep,
          error: 'Formato de CEP inválido (use 00000-000 ou 00000000)'
        });
      }

      // Validar status
      if (unidade.status && !['ativo', 'inativo'].includes(unidade.status)) {
        errors.push({
          row: rowNumber,
          field: 'status',
          value: unidade.status,
          error: 'Status deve ser "ativo" ou "inativo"'
        });
      }
    }
    
    return errors;
  }

  // Inserir unidades no banco
  static async inserirUnidades(unidades) {
    let insertedCount = 0;
    
    for (const unidade of unidades) {
      try {
        const insertQuery = `
          INSERT INTO unidades_escolares (
            codigo_teknisa, nome_escola, cidade, estado, pais, endereco, numero, bairro, cep,
            centro_distribuicao, rota_id, regional, lot, cc_senior, codigo_senior, abastecimento,
            ordem_entrega, status, observacoes, atendimento, horario
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams = [
          unidade.codigo_teknisa,
          unidade.nome_escola,
          unidade.cidade,
          unidade.estado,
          unidade.pais || 'Brasil',
          unidade.endereco || '',
          unidade.numero || null,
          unidade.bairro || null,
          unidade.cep || null,
          unidade.centro_distribuicao || null,
          unidade.rota_id || null,
          unidade.regional || null,
          unidade.lot || null,
          unidade.cc_senior || null,
          unidade.codigo_senior || null,
          unidade.abastecimento || null,
          unidade.ordem_entrega || 0,
          unidade.status || 'ativo',
          unidade.observacoes || null,
          unidade.atendimento || null,
          unidade.horario || null
        ];

        await executeQuery(insertQuery, insertParams);
        insertedCount++;
        
      } catch (error) {
        console.error('Erro ao inserir unidade escolar:', error);
        throw new Error(`Erro ao inserir unidade ${unidade.codigo_teknisa}: ${error.message}`);
      }
    }
    
    return insertedCount;
  }

  // Gerar template de planilha para download
  static async gerarTemplate(req, res) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Unidades Escolares');
      
      // Definir cabeçalhos
      const headers = [
        'Código Teknisa',
        'Nome da Escola',
        'Cidade',
        'Estado',
        'País',
        'Endereço',
        'Número',
        'Bairro',
        'CEP',
        'Centro de Distribuição',
        'Rota ID',
        'Regional',
        'Lote',
        'C.C. Senior',
        'Código Senior',
        'Abastecimento',
        'Ordem de Entrega',
        'Status',
        'Atendimento',
        'Horário',
        'Observações'
      ];
      
      // Adicionar cabeçalhos
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Adicionar algumas linhas de exemplo
      const exemplos = [
        ['001', 'Escola Exemplo 1', 'São Paulo', 'SP', 'Brasil', 'Rua das Flores', '123', 'Centro', '01234-567', 'CD São Paulo', '1', 'São Paulo', 'LOTE 01', '001', '001001', 'SEMANAL', '1', 'ativo', 'Integral', '07:00 às 17:00', 'Exemplo de unidade escolar'],
        ['002', 'Escola Exemplo 2', 'Rio de Janeiro', 'RJ', 'Brasil', 'Av. Copacabana', '456', 'Copacabana', '22070-001', 'CD Rio de Janeiro', '2', 'Rio de Janeiro', 'LOTE 02', '002', '002002', 'MENSAL', '2', 'ativo', 'Manhã', '07:00 às 12:00', 'Outro exemplo']
      ];
      
      exemplos.forEach(exemplo => {
        worksheet.addRow(exemplo);
      });
      
      // Ajustar largura das colunas
      worksheet.columns.forEach(column => {
        column.width = 20;
      });
      
      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=template_unidades_escolares.xlsx');
      
      // Enviar arquivo
      await workbook.xlsx.write(res);
      res.end();
      
    } catch (error) {
      console.error('Erro ao gerar template:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar template',
        message: 'Ocorreu um erro ao gerar o template da planilha'
      });
    }
  }
}

module.exports = UnidadesEscolaresImportController;
