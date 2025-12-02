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
      const columnMapping = UnidadesEscolaresImportController.mapColumns(headers);
      
      // Validar se as colunas obrigatórias estão presentes
      const requiredColumns = ['nome_escola', 'cidade'];
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
          const unidade = UnidadesEscolaresImportController.extractUnidadeFromRow(row, columnMapping, rowIndex);
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
      const validationErrors = await UnidadesEscolaresImportController.validarUnidades(unidades);
      if (validationErrors.length > 0) {
        // Agrupar erros por linha para melhor visualização
        const errorsByRow = {};
        validationErrors.forEach(error => {
          if (!errorsByRow[error.row]) {
            errorsByRow[error.row] = [];
          }
          errorsByRow[error.row].push({
            field: error.field,
            value: error.value,
            error: error.error
          });
        });

        // Criar mensagem detalhada
        const errorDetails = Object.keys(errorsByRow).map(row => {
          const rowErrors = errorsByRow[row];
          const errorList = rowErrors.map(e => `• ${e.field}: ${e.error} (valor: "${e.value || 'vazio'}")`).join('\n');
          return `Linha ${row}:\n${errorList}`;
        }).join('\n\n');

        return res.status(400).json({
          success: false,
          error: 'Erros de validação',
          message: `Encontrados ${validationErrors.length} erros de validação em ${Object.keys(errorsByRow).length} linha(s)`,
          details: errorDetails,
          errorsByRow,
          validationErrors,
          totalErrors: validationErrors.length,
          affectedRows: Object.keys(errorsByRow).length
        });
      }

      // Inserir unidades no banco
      const insertedCount = await UnidadesEscolaresImportController.inserirUnidades(unidades);
      
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
        'estado': 'estado',
        'pais': 'pais',
        'país': 'pais',
        'brasil': 'pais',
        
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
        'rota nome': 'rota_nome',
        'rota_nome': 'rota_nome',
        'rota codigo': 'rota_codigo',
        'rota_codigo': 'rota_codigo',
        'rota código': 'rota_codigo',
        'regional': 'regional',
        
        // Centro de Custo e Senior
        'centro de custo': 'centro_custo_id',
        'centro_custo_id': 'centro_custo_id',
        'centro_custo': 'centro_custo_id',
        'centro de custo codigo': 'centro_custo_codigo',
        'centro_custo_codigo': 'centro_custo_codigo',
        'centro de custo código': 'centro_custo_codigo',
        'centro de custo nome': 'centro_custo_nome',
        'centro_custo_nome': 'centro_custo_nome',
        'lot': 'centro_custo_id', // Mantém compatibilidade com importações antigas
        'lote': 'centro_custo_id', // Mantém compatibilidade com importações antigas
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
        'ordem de entrega': 'ordem_entrega',
        
        // Status e Observações
        'status': 'status',
        'observacoes': 'observacoes',
        'observações': 'observacoes',
        
        // Novos campos
        'atendimento': 'atendimento',
        'horario': 'horario',
        'horário': 'horario',
        
        // Campos adicionais
        'supervisão': 'supervisao',
        'supervisao': 'supervisao',
        'coordenação': 'coordenacao',
        'coordenacao': 'coordenacao',
        'latitude': 'lat',
        'lat': 'lat',
        'longitude': 'long',
        'long': 'long',
        
        // Filial
        'filial id': 'filial_id',
        'filial_id': 'filial_id',
        'filial nome': 'filial_nome',
        'filial_nome': 'filial_nome',
        'filial codigo': 'filial_codigo',
        'filial_codigo': 'filial_codigo',
        'filial código': 'filial_codigo',
        
        // Rota Nutricionista
        'rota nutricionista id': 'rota_nutricionista_id',
        'rota_nutricionista_id': 'rota_nutricionista_id',
        'rota nutricionista codigo': 'rota_nutricionista_codigo',
        'rota_nutricionista_codigo': 'rota_nutricionista_codigo',
        'rota nutricionista código': 'rota_nutricionista_codigo',
        'nutricionista nome': 'nutricionista_nome',
        'nutricionista_nome': 'nutricionista_nome',
        'nutricionista email': 'nutricionista_email',
        'nutricionista_email': 'nutricionista_email',
        
        // Almoxarifado
        'almoxarifado id': 'almoxarifado_id',
        'almoxarifado_id': 'almoxarifado_id',
        'almoxarifado codigo': 'almoxarifado_codigo',
        'almoxarifado_codigo': 'almoxarifado_codigo',
        'almoxarifado código': 'almoxarifado_codigo',
        'almoxarifado nome': 'almoxarifado_nome',
        'almoxarifado_nome': 'almoxarifado_nome'
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
      unidade.codigo_teknisa = UnidadesEscolaresImportController.getCellValue(row, columnMapping.codigo_teknisa);
      if (!unidade.codigo_teknisa) {
        throw new Error(`Código Teknisa é obrigatório na linha ${rowIndex}`);
      }
    }

    if (columnMapping.nome_escola !== undefined) {
      unidade.nome_escola = UnidadesEscolaresImportController.getCellValue(row, columnMapping.nome_escola);
      if (!unidade.nome_escola) {
        throw new Error(`Nome da escola é obrigatório na linha ${rowIndex}`);
      }
    }

    if (columnMapping.cidade !== undefined) {
      unidade.cidade = UnidadesEscolaresImportController.getCellValue(row, columnMapping.cidade);
      if (!unidade.cidade) {
        throw new Error(`Cidade é obrigatória na linha ${rowIndex}`);
      }
    }

    if (columnMapping.estado !== undefined) {
      unidade.estado = UnidadesEscolaresImportController.getCellValue(row, columnMapping.estado);
      // Estado é opcional agora
    }

    // Campos opcionais
    if (columnMapping.pais !== undefined) {
      unidade.pais = UnidadesEscolaresImportController.getCellValue(row, columnMapping.pais) || 'Brasil';
    }

    if (columnMapping.endereco !== undefined) {
      unidade.endereco = UnidadesEscolaresImportController.getCellValue(row, columnMapping.endereco) || '';
    }

    if (columnMapping.numero !== undefined) {
      unidade.numero = UnidadesEscolaresImportController.getCellValue(row, columnMapping.numero);
    }

    if (columnMapping.bairro !== undefined) {
      unidade.bairro = UnidadesEscolaresImportController.getCellValue(row, columnMapping.bairro);
    }

    if (columnMapping.cep !== undefined) {
      unidade.cep = UnidadesEscolaresImportController.getCellValue(row, columnMapping.cep);
    }

    if (columnMapping.centro_distribuicao !== undefined) {
      unidade.centro_distribuicao = UnidadesEscolaresImportController.getCellValue(row, columnMapping.centro_distribuicao);
    }

    if (columnMapping.rota_id !== undefined) {
      const rotaValue = UnidadesEscolaresImportController.getCellValue(row, columnMapping.rota_id);
      unidade.rota_id = rotaValue ? parseInt(rotaValue) : null;
    }

    if (columnMapping.regional !== undefined) {
      unidade.regional = UnidadesEscolaresImportController.getCellValue(row, columnMapping.regional);
    }

    if (columnMapping.centro_custo_id !== undefined) {
      const centroCustoValue = UnidadesEscolaresImportController.getCellValue(row, columnMapping.centro_custo_id);
      // Se for um número, usar diretamente; se for texto, buscar pelo código ou nome
      if (centroCustoValue) {
        const centroCustoId = parseInt(centroCustoValue);
        if (!isNaN(centroCustoId)) {
          unidade.centro_custo_id = centroCustoId;
        } else {
          // Se for texto, tentar buscar pelo código ou nome (será tratado depois)
          unidade.centro_custo_nome_ou_codigo = centroCustoValue.trim();
        }
      }
    }

    if (columnMapping.cc_senior !== undefined) {
      unidade.cc_senior = UnidadesEscolaresImportController.getCellValue(row, columnMapping.cc_senior);
    }

    if (columnMapping.codigo_senior !== undefined) {
      unidade.codigo_senior = UnidadesEscolaresImportController.getCellValue(row, columnMapping.codigo_senior);
    }

    if (columnMapping.abastecimento !== undefined) {
      unidade.abastecimento = UnidadesEscolaresImportController.getCellValue(row, columnMapping.abastecimento);
    }

    if (columnMapping.ordem_entrega !== undefined) {
      const ordemValue = UnidadesEscolaresImportController.getCellValue(row, columnMapping.ordem_entrega);
      unidade.ordem_entrega = ordemValue ? parseInt(ordemValue) : 0;
    }

    if (columnMapping.status !== undefined) {
      const statusValue = UnidadesEscolaresImportController.getCellValue(row, columnMapping.status);
      unidade.status = statusValue && ['ativo', 'inativo'].includes(statusValue.toLowerCase()) 
        ? statusValue.toLowerCase() 
        : 'ativo';
    }

    if (columnMapping.observacoes !== undefined) {
      unidade.observacoes = UnidadesEscolaresImportController.getCellValue(row, columnMapping.observacoes);
    }

    if (columnMapping.atendimento !== undefined) {
      unidade.atendimento = UnidadesEscolaresImportController.getCellValue(row, columnMapping.atendimento);
    }

    if (columnMapping.horario !== undefined) {
      unidade.horario = UnidadesEscolaresImportController.getCellValue(row, columnMapping.horario);
    }

    if (columnMapping.supervisao !== undefined) {
      unidade.supervisao = UnidadesEscolaresImportController.getCellValue(row, columnMapping.supervisao);
    }

    if (columnMapping.coordenacao !== undefined) {
      unidade.coordenacao = UnidadesEscolaresImportController.getCellValue(row, columnMapping.coordenacao);
    }

    if (columnMapping.lat !== undefined) {
      const latValue = UnidadesEscolaresImportController.getCellValue(row, columnMapping.lat);
      // Converter para número (o banco vai arredondar para 10 casas decimais)
      unidade.lat = latValue ? parseFloat(latValue) : null;
    }

    if (columnMapping.long !== undefined) {
      const longValue = UnidadesEscolaresImportController.getCellValue(row, columnMapping.long);
      // Converter para número (o banco vai arredondar para 10 casas decimais)
      unidade.long = longValue ? parseFloat(longValue) : null;
    }

    // Filial
    if (columnMapping.filial_id !== undefined) {
      const filialValue = UnidadesEscolaresImportController.getCellValue(row, columnMapping.filial_id);
      unidade.filial_id = filialValue ? parseInt(filialValue) : null;
    }

    // Rota Nutricionista
    if (columnMapping.rota_nutricionista_id !== undefined) {
      const rotaNutricionistaValue = UnidadesEscolaresImportController.getCellValue(row, columnMapping.rota_nutricionista_id);
      unidade.rota_nutricionista_id = rotaNutricionistaValue ? parseInt(rotaNutricionistaValue) : null;
    }

    // Almoxarifado
    if (columnMapping.almoxarifado_id !== undefined) {
      const almoxarifadoValue = UnidadesEscolaresImportController.getCellValue(row, columnMapping.almoxarifado_id);
      unidade.almoxarifado_id = almoxarifadoValue ? parseInt(almoxarifadoValue) : null;
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
      
      // Verificar se código teknisa já existe (apenas se fornecido)
      if (unidade.codigo_teknisa && unidade.codigo_teknisa.trim() !== '') {
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
        // Se centro_custo_nome_ou_codigo foi definido, buscar o ID do centro de custo
        let centroCustoId = unidade.centro_custo_id;
        if (unidade.centro_custo_nome_ou_codigo && !centroCustoId) {
          const centroCustoSearch = await executeQuery(
            'SELECT id FROM centro_custo WHERE (codigo = ? OR nome LIKE ?) AND status = 1 LIMIT 1',
            [unidade.centro_custo_nome_ou_codigo, `%${unidade.centro_custo_nome_ou_codigo}%`]
          );
          if (centroCustoSearch.length > 0) {
            centroCustoId = centroCustoSearch[0].id;
          }
        }

        const insertQuery = `
          INSERT INTO unidades_escolares (
            codigo_teknisa, nome_escola, cidade, estado, pais, endereco, numero, bairro, cep,
            centro_distribuicao, rota_id, regional, centro_custo_id, cc_senior, codigo_senior, abastecimento,
            ordem_entrega, status, observacoes, filial_id, atendimento, horario, supervisao, coordenacao, lat, \`long\`,
            rota_nutricionista_id, almoxarifado_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Função helper para converter undefined para null
        const nullIfUndefined = (value, defaultValue = null) => {
          return value !== undefined ? value : defaultValue;
        };

        const insertParams = [
          nullIfUndefined(unidade.codigo_teknisa),
          nullIfUndefined(unidade.nome_escola),
          nullIfUndefined(unidade.cidade),
          nullIfUndefined(unidade.estado),
          nullIfUndefined(unidade.pais, 'Brasil'),
          nullIfUndefined(unidade.endereco, ''),
          nullIfUndefined(unidade.numero),
          nullIfUndefined(unidade.bairro),
          nullIfUndefined(unidade.cep),
          nullIfUndefined(unidade.centro_distribuicao),
          nullIfUndefined(unidade.rota_id), // rota_id pode ser importado ou relacionado depois
          nullIfUndefined(unidade.regional),
          centroCustoId || null,
          nullIfUndefined(unidade.cc_senior),
          nullIfUndefined(unidade.codigo_senior),
          nullIfUndefined(unidade.abastecimento),
          nullIfUndefined(unidade.ordem_entrega, 0),
          nullIfUndefined(unidade.status, 'ativo'),
          nullIfUndefined(unidade.observacoes),
          nullIfUndefined(unidade.filial_id), // filial_id pode ser importado ou relacionado depois
          nullIfUndefined(unidade.atendimento),
          nullIfUndefined(unidade.horario),
          nullIfUndefined(unidade.supervisao),
          nullIfUndefined(unidade.coordenacao),
          // lat e long já são números (convertidos acima)
          unidade.lat !== null && unidade.lat !== undefined ? unidade.lat : null,
          unidade.long !== null && unidade.long !== undefined ? unidade.long : null,
          // Novos campos
          nullIfUndefined(unidade.rota_nutricionista_id),
          nullIfUndefined(unidade.almoxarifado_id)
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
      
      // Definir cabeçalhos seguindo a mesma ordem do export
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
        'Rota Nome',
        'Rota Código',
        'Regional',
        'Centro de Custo ID',
        'Centro de Custo Código',
        'Centro de Custo Nome',
        'CC Senior',
        'Código Senior',
        'Abastecimento',
        'Ordem Entrega',
        'Status',
        'Observações',
        'Atendimento',
        'Horário',
        'Supervisão',
        'Coordenação',
        'Latitude',
        'Longitude',
        'Filial ID',
        'Filial Nome',
        'Filial Código',
        'Rota Nutricionista ID',
        'Rota Nutricionista Código',
        'Nutricionista Nome',
        'Nutricionista Email',
        'Almoxarifado ID',
        'Almoxarifado Código',
        'Almoxarifado Nome'
      ];
      
      // Adicionar cabeçalhos
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      // Adicionar algumas linhas de exemplo
      const exemplos = [
        [
          '001',
          'Escola Exemplo 1',
          'São Paulo',
          'SP',
          'Brasil',
          'Rua das Flores',
          '123',
          'Centro',
          '01234-567',
          'CD São Paulo',
          '1',
          'Rota Centro',
          'ROTA-001',
          'São Paulo',
          '1',
          'CC001',
          'Centro de Custo Exemplo',
          '001',
          '001001',
          'SEMANAL',
          '1',
          'ativo',
          'Observações da escola',
          'Integral',
          '07:00 às 17:00',
          'João Silva',
          'Maria Santos',
          '-23.550519',
          '-46.633309',
          '1',
          'Filial São Paulo',
          'FIL-001',
          '1',
          'RN-001',
          'Nutricionista Exemplo',
          'nutricionista@exemplo.com',
          '1',
          'ALM-001',
          'Almoxarifado Central'
        ],
        [
          '002',
          'Escola Exemplo 2',
          'Rio de Janeiro',
          'RJ',
          'Brasil',
          'Av. Copacabana',
          '456',
          'Copacabana',
          '22070-001',
          'CD Rio de Janeiro',
          '2',
          'Rota Zona Sul',
          'ROTA-002',
          'Rio de Janeiro',
          '2',
          'CC002',
          'Centro de Custo Zona Sul',
          '002',
          '002002',
          'MENSAL',
          '2',
          'ativo',
          '',
          'Manhã',
          '07:00 às 12:00',
          'Pedro Costa',
          'Ana Lima',
          '-22.906847',
          '-43.172896',
          '2',
          'Filial Rio de Janeiro',
          'FIL-002',
          '',
          '',
          '',
          '',
          '',
          '',
          ''
        ]
      ];
      
      exemplos.forEach(exemplo => {
        worksheet.addRow(exemplo);
      });
      
      // Definir largura das colunas (similar ao export)
      worksheet.columns = [
        { header: 'Código Teknisa', width: 15 },
        { header: 'Nome da Escola', width: 40 },
        { header: 'Cidade', width: 25 },
        { header: 'Estado', width: 10 },
        { header: 'País', width: 15 },
        { header: 'Endereço', width: 40 },
        { header: 'Número', width: 15 },
        { header: 'Bairro', width: 25 },
        { header: 'CEP', width: 15 },
        { header: 'Centro de Distribuição', width: 30 },
        { header: 'Rota ID', width: 10 },
        { header: 'Rota Nome', width: 30 },
        { header: 'Rota Código', width: 15 },
        { header: 'Regional', width: 20 },
        { header: 'Centro de Custo ID', width: 15 },
        { header: 'Centro de Custo Código', width: 20 },
        { header: 'Centro de Custo Nome', width: 30 },
        { header: 'CC Senior', width: 20 },
        { header: 'Código Senior', width: 20 },
        { header: 'Abastecimento', width: 20 },
        { header: 'Ordem Entrega', width: 15 },
        { header: 'Status', width: 15 },
        { header: 'Observações', width: 50 },
        { header: 'Atendimento', width: 20 },
        { header: 'Horário', width: 20 },
        { header: 'Supervisão', width: 30 },
        { header: 'Coordenação', width: 30 },
        { header: 'Latitude', width: 15 },
        { header: 'Longitude', width: 15 },
        { header: 'Filial ID', width: 10 },
        { header: 'Filial Nome', width: 30 },
        { header: 'Filial Código', width: 15 },
        { header: 'Rota Nutricionista ID', width: 20 },
        { header: 'Rota Nutricionista Código', width: 25 },
        { header: 'Nutricionista Nome', width: 30 },
        { header: 'Nutricionista Email', width: 30 },
        { header: 'Almoxarifado ID', width: 15 },
        { header: 'Almoxarifado Código', width: 20 },
        { header: 'Almoxarifado Nome', width: 30 }
      ];
      
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
