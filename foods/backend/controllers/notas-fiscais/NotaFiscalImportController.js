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

class NotaFiscalImportController {
  /**
   * Gerar e baixar modelo de planilha para importação
   */
  static async baixarModelo(req, res) {
    try {
      // Buscar alguns fornecedores e filiais para exemplo
      const fornecedoresQuery = `
        SELECT id, razao_social 
        FROM fornecedores 
        WHERE status = 1
        LIMIT 5
      `;
      const fornecedores = await executeQuery(fornecedoresQuery);

      const filiaisQuery = `
        SELECT id, filial 
        FROM filiais 
        WHERE status = 1
        LIMIT 5
      `;
      const filiais = await executeQuery(filiaisQuery);

      // Criar workbook
      const workbook = new ExcelJS.Workbook();
      
      // Única aba com todas as informações (Nota Fiscal + Itens)
      const worksheet = workbook.addWorksheet('Notas Fiscais');
      
      // Definir colunas: dados da nota fiscal + dados dos itens
      worksheet.columns = [
        // Dados da Nota Fiscal
        { header: 'Tipo Nota', key: 'tipo_nota', width: 15 },
        { header: 'Número Nota', key: 'numero_nota', width: 15 },
        { header: 'Série', key: 'serie', width: 10 },
        { header: 'CNPJ', key: 'cnpj', width: 20 },
        { header: 'Fornecedor (Razão Social)', key: 'fornecedor', width: 40 },
        { header: 'Filial', key: 'filial', width: 30 },
        { header: 'Almoxarifado (Nome)', key: 'almoxarifado', width: 30 },
        { header: 'Data Emissão (DD/MM/YYYY)', key: 'data_emissao', width: 20 },
        { header: 'Data Saída (DD/MM/YYYY)', key: 'data_saida', width: 20 },
        { header: 'Valor Produtos', key: 'valor_produtos', width: 15 },
        { header: 'Valor Frete', key: 'valor_frete', width: 15 },
        { header: 'Valor Desconto', key: 'valor_desconto', width: 15 },
        { header: 'Natureza Operação', key: 'natureza_operacao', width: 30 },
        { header: 'Observações', key: 'observacoes', width: 40 },
        // Dados dos Itens
        { header: 'Número Item', key: 'numero_item', width: 15 },
        { header: 'Produto Nome', key: 'produto_nome', width: 40 },
        { header: 'Unidade de Medida', key: 'unidade_medida', width: 20 },
        { header: 'Quantidade', key: 'quantidade', width: 15 },
        { header: 'Valor Unitário', key: 'valor_unitario', width: 15 },
        { header: 'Valor Total Item', key: 'valor_total_item', width: 15 },
        { header: 'Valor Desconto Item', key: 'valor_desconto_item', width: 15 }
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
      const dia = String(dataAtual.getDate()).padStart(2, '0');
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const ano = dataAtual.getFullYear();
      const dataExemplo = `${dia}/${mes}/${ano}`; // DD/MM/YYYY

      // Exemplo: uma nota fiscal com 2 itens
      const exemploLinhas = [
        {
          tipo_nota: 'ENTRADA',
          numero_nota: '12345',
          serie: '1',
          cnpj: '12.345.678/0001-90',
          fornecedor: fornecedores[0]?.razao_social || 'FORNECEDOR EXEMPLO LTDA',
          filial: filiais[0]?.filial || 'FILIAL EXEMPLO',
          almoxarifado: 'Almoxarifado Exemplo',
          data_emissao: dataExemplo,
          data_saida: dataExemplo,
          valor_produtos: 1000.00,
          valor_frete: 50.00,
          valor_desconto: 0.00,
          natureza_operacao: 'COMPRA',
          observacoes: 'Nota fiscal de exemplo',
          numero_item: 1,
          produto_nome: 'Produto Exemplo 1',
          unidade_medida: 'UN',
          quantidade: 10,
          valor_unitario: 50.00,
          valor_total_item: 500.00,
          valor_desconto_item: 0.00
        },
        {
          tipo_nota: 'ENTRADA',
          numero_nota: '12345',
          serie: '1',
          cnpj: '12.345.678/0001-90',
          fornecedor: fornecedores[0]?.razao_social || 'FORNECEDOR EXEMPLO LTDA',
          filial: filiais[0]?.filial || 'FILIAL EXEMPLO',
          almoxarifado: 'Almoxarifado Exemplo',
          data_emissao: dataExemplo,
          data_saida: dataExemplo,
          valor_produtos: 1000.00,
          valor_frete: 50.00,
          valor_desconto: 0.00,
          natureza_operacao: 'COMPRA',
          observacoes: 'Nota fiscal de exemplo',
          numero_item: 2,
          produto_nome: 'Produto Exemplo 2',
          unidade_medida: 'UN',
          quantidade: 5,
          valor_unitario: 100.00,
          valor_total_item: 500.00,
          valor_desconto_item: 0.00
        }
      ];

      exemploLinhas.forEach(linha => {
        worksheet.addRow(linha);
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="modelo_notas_fiscais.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      return errorResponse(res, 'Erro ao gerar modelo de planilha', 500);
    }
  }

  /**
   * Importar notas fiscais via Excel
   */
  static async importar(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'Nenhum arquivo enviado', 400);
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      
      // Ler única aba
      const worksheet = workbook.getWorksheet('Notas Fiscais');
      if (!worksheet) {
        return errorResponse(res, 'Aba "Notas Fiscais" não encontrada na planilha', 400);
      }

      const notasFiscaisMap = {}; // Agrupar por chave da nota (numero_nota + serie)
      const erros = [];
      let linhaAtual = 2; // Começar da linha 2 (pular cabeçalho)

      // Processar cada linha da planilha
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Pular cabeçalho

        const valores = row.values;
        if (!valores || valores.length < 10) return;

        // Dados da Nota Fiscal (colunas 1-17)
        const tipo_nota = valores[1]?.toString().trim() || 'ENTRADA';
        const numero_nota = valores[2]?.toString().trim();
        const serie = valores[3]?.toString().trim() || '';
        const cnpj = valores[4]?.toString().trim() || null;
        const fornecedor = valores[5]?.toString().trim();
        const filial = valores[6]?.toString().trim();
        const almoxarifado = valores[7]?.toString().trim();
        
        // Tratar datas que podem vir como objeto Date do ExcelJS
        let data_emissao_raw = valores[8];
        let data_saida_raw = valores[9];
        
        // Se for um objeto Date, converter para DD/MM/YYYY
        if (data_emissao_raw instanceof Date) {
          const dia = String(data_emissao_raw.getDate()).padStart(2, '0');
          const mes = String(data_emissao_raw.getMonth() + 1).padStart(2, '0');
          const ano = data_emissao_raw.getFullYear();
          data_emissao_raw = `${dia}/${mes}/${ano}`;
        }
        
        if (data_saida_raw instanceof Date) {
          const dia = String(data_saida_raw.getDate()).padStart(2, '0');
          const mes = String(data_saida_raw.getMonth() + 1).padStart(2, '0');
          const ano = data_saida_raw.getFullYear();
          data_saida_raw = `${dia}/${mes}/${ano}`;
        }
        
        const data_emissao = data_emissao_raw?.toString().trim() || '';
        const data_saida = data_saida_raw?.toString().trim() || '';
        const valor_produtos = parseFloat(valores[10]) || 0.00;
        const valor_frete = parseFloat(valores[11]) || 0.00;
        const valor_desconto = parseFloat(valores[12]) || 0.00;
        const natureza_operacao = valores[13]?.toString().trim() || null;
        const observacoes = valores[14]?.toString().trim() || null;

        // Dados do Item (colunas 15-21)
        const numero_item = parseInt(valores[15]) || 0;
        const produto_nome = valores[16]?.toString().trim() || '';
        const unidade_medida = valores[17]?.toString().trim() || '';
        const quantidade = parseFloat(valores[18]) || 0;
        const valor_unitario = parseFloat(valores[19]) || 0.00;
        const valor_total_item = parseFloat(valores[20]) || 0.00;
        const valor_desconto_item = parseFloat(valores[21]) || 0.00;

        // Validações básicas da nota fiscal (apenas na primeira linha de cada nota)
        const chaveNota = `${numero_nota}_${serie}`;
        
        if (!notasFiscaisMap[chaveNota]) {
          // Primeira vez que encontramos esta nota, validar dados da nota
          if (!numero_nota) {
            erros.push(`Linha ${linhaAtual}: Número da nota é obrigatório`);
            linhaAtual++;
            return;
          }

          if (!fornecedor) {
            erros.push(`Linha ${linhaAtual}: Fornecedor é obrigatório`);
            linhaAtual++;
            return;
          }

          if (!filial) {
            erros.push(`Linha ${linhaAtual}: Filial é obrigatória`);
            linhaAtual++;
            return;
          }

          if (!almoxarifado) {
            erros.push(`Linha ${linhaAtual}: Almoxarifado é obrigatório`);
            linhaAtual++;
            return;
          }

          if (!data_emissao) {
            erros.push(`Linha ${linhaAtual}: Data de emissão é obrigatória`);
            linhaAtual++;
            return;
          }

          if (!data_saida) {
            erros.push(`Linha ${linhaAtual}: Data de saída é obrigatória`);
            linhaAtual++;
            return;
          }

          // Validar formato da data (aceita D/M/YYYY, DD/MM/YYYY, D-M-YYYY, DD-MM-YYYY)
          // Aceita com ou sem zero à esquerda
          // Também aceita datas que podem vir como número do Excel (ex: 45321 = 14/02/2024)
          let data_emissao_validada = data_emissao;
          let data_saida_validada = data_saida;
          
          // Se a data vier como número do Excel, converter
          if (!isNaN(data_emissao) && data_emissao.toString().indexOf('/') === -1 && data_emissao.toString().indexOf('-') === -1) {
            const dataExcel = new Date((parseFloat(data_emissao) - 25569) * 86400 * 1000);
            const dia = String(dataExcel.getDate()).padStart(2, '0');
            const mes = String(dataExcel.getMonth() + 1).padStart(2, '0');
            const ano = dataExcel.getFullYear();
            data_emissao_validada = `${dia}/${mes}/${ano}`;
          }
          
          if (!isNaN(data_saida) && data_saida.toString().indexOf('/') === -1 && data_saida.toString().indexOf('-') === -1) {
            const dataExcel = new Date((parseFloat(data_saida) - 25569) * 86400 * 1000);
            const dia = String(dataExcel.getDate()).padStart(2, '0');
            const mes = String(dataExcel.getMonth() + 1).padStart(2, '0');
            const ano = dataExcel.getFullYear();
            data_saida_validada = `${dia}/${mes}/${ano}`;
          }
          
          const dataRegex = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/;
          if (!dataRegex.test(data_emissao_validada)) {
            erros.push(`Linha ${linhaAtual}: Data de emissão deve estar no formato DD/MM/YYYY (ex: 15/01/2025 ou 14/2/2024). Valor recebido: "${data_emissao}"`);
            linhaAtual++;
            return;
          }

          if (!dataRegex.test(data_saida_validada)) {
            erros.push(`Linha ${linhaAtual}: Data de saída deve estar no formato DD/MM/YYYY (ex: 15/01/2025 ou 14/2/2024). Valor recebido: "${data_saida}"`);
            linhaAtual++;
            return;
          }

          // Converter DD/MM/YYYY ou DD-MM-YYYY para YYYY-MM-DD para salvar no banco
          // Aceita datas com ou sem zero à esquerda (ex: 14/2/2024 ou 14/02/2024)
          const converterData = (dataDDMMYYYY) => {
            try {
              // Aceitar tanto / quanto - como separador
              const separador = dataDDMMYYYY.includes('/') ? '/' : '-';
              const [dia, mes, ano] = dataDDMMYYYY.split(separador);
              if (!dia || !mes || !ano) {
                throw new Error('Formato de data inválido');
              }
              // Adicionar zero à esquerda se necessário
              const diaFormatado = dia.padStart(2, '0');
              const mesFormatado = mes.padStart(2, '0');
              return `${ano}-${mesFormatado}-${diaFormatado}`;
            } catch (error) {
              throw new Error(`Erro ao converter data: ${dataDDMMYYYY}`);
            }
          };
          
          let data_emissao_convertida, data_saida_convertida;
          try {
            data_emissao_convertida = converterData(data_emissao_validada);
            data_saida_convertida = converterData(data_saida_validada);
          } catch (error) {
            erros.push(`Linha ${linhaAtual}: ${error.message}`);
            linhaAtual++;
            return;
          }

          // Criar objeto da nota fiscal
          notasFiscaisMap[chaveNota] = {
            tipo_nota,
            numero_nota,
            serie,
            cnpj,
            fornecedor,
            filial,
            almoxarifado,
            data_emissao: data_emissao_convertida,
            data_saida: data_saida_convertida,
            valor_produtos,
            valor_frete,
            valor_desconto,
            natureza_operacao,
            observacoes,
            itens: []
          };
        }

        // Validações do item
        if (!produto_nome) {
          erros.push(`Linha ${linhaAtual}: Produto Nome é obrigatório`);
          linhaAtual++;
          return;
        }

        if (!unidade_medida) {
          erros.push(`Linha ${linhaAtual}: Unidade de Medida é obrigatória`);
          linhaAtual++;
          return;
        }

        if (quantidade <= 0) {
          erros.push(`Linha ${linhaAtual}: Quantidade deve ser maior que zero`);
          linhaAtual++;
          return;
        }

        if (valor_unitario < 0) {
          erros.push(`Linha ${linhaAtual}: Valor unitário não pode ser negativo`);
          linhaAtual++;
          return;
        }

        // Processar dados do produto
        const descricao = produto_nome;

        if (!notasFiscaisMap[chaveNota]) {
          erros.push(`Linha ${linhaAtual}: Erro interno - nota fiscal não encontrada`);
          linhaAtual++;
          return;
        }

        // Adicionar item à nota fiscal
        const itemData = {
          numero_item,
          codigo_produto: '',
          descricao,
          ncm: null,
          cfop: null,
          unidade_medida: unidade_medida,
          quantidade,
          valor_unitario,
          valor_total: valor_total_item,
          valor_desconto: valor_desconto_item,
          valor_ipi: 0.00,
          aliquota_ipi: 0.00,
          valor_icms: 0.00,
          aliquota_icms: 0.00,
          valor_pis: 0.00,
          aliquota_pis: 0.00,
          valor_cofins: 0.00,
          aliquota_cofins: 0.00
        };

        notasFiscaisMap[chaveNota].itens.push(itemData);

        linhaAtual++;
      });

      // Converter map em array
      const notasFiscais = Object.values(notasFiscaisMap);

      if (erros.length > 0) {
        return errorResponse(res, 'Erros de validação encontrados', 400, { erros });
      }

      if (notasFiscais.length === 0) {
        return errorResponse(res, 'Nenhuma nota fiscal válida encontrada', 400);
      }

      // Processar cada nota fiscal
      let importados = 0;
      let atualizados = 0;

      for (const notaFiscal of notasFiscais) {
        try {
          // Buscar fornecedor
          const fornecedorQuery = `
            SELECT id FROM fornecedores 
            WHERE razao_social = ? AND status = 1
            LIMIT 1
          `;
          const fornecedores = await executeQuery(fornecedorQuery, [notaFiscal.fornecedor]);
          
          if (fornecedores.length === 0) {
            erros.push(`Fornecedor "${notaFiscal.fornecedor}" não encontrado`);
            continue;
          }

          const fornecedorId = fornecedores[0].id;

          // Buscar filial
          const filialQuery = `
            SELECT id FROM filiais 
            WHERE filial = ? AND status = 1
            LIMIT 1
          `;
          const filiais = await executeQuery(filialQuery, [notaFiscal.filial]);
          
          if (filiais.length === 0) {
            erros.push(`Filial "${notaFiscal.filial}" não encontrada`);
            continue;
          }

          const filialId = filiais[0].id;

          // Buscar almoxarifado por nome
          const almoxarifadoQuery = `
            SELECT id FROM almoxarifado 
            WHERE nome = ? AND status = 1
            LIMIT 1
          `;
          const almoxarifados = await executeQuery(almoxarifadoQuery, [notaFiscal.almoxarifado]);
          
          if (almoxarifados.length === 0) {
            erros.push(`Almoxarifado "${notaFiscal.almoxarifado}" não encontrado`);
            continue;
          }

          const almoxarifadoId = almoxarifados[0].id;

          // Verificar se já existe nota fiscal
          const chaveNota = `${notaFiscal.numero_nota}_${notaFiscal.serie}`;
          const existeQuery = `
            SELECT id FROM notas_fiscais 
            WHERE numero_nota = ? AND serie = ? AND fornecedor_id = ?
            LIMIT 1
          `;
          const existentes = await executeQuery(existeQuery, [
            notaFiscal.numero_nota,
            notaFiscal.serie || '',
            fornecedorId
          ]);

          // Converter datas para formato MySQL
          const dataEmissaoMySQL = `${notaFiscal.data_emissao} 00:00:00`;
          const dataSaidaMySQL = `${notaFiscal.data_saida} 00:00:00`;
          const dataLancamentoMySQL = new Date().toISOString().slice(0, 19).replace('T', ' ');

          const usuarioId = req.user?.id || null;

          // Verificar se há itens para esta nota antes de processar
          const itens = notaFiscal.itens || [];
          
          if (itens.length === 0) {
            erros.push(`Nota ${notaFiscal.numero_nota}: A nota fiscal deve ter pelo menos um item`);
            continue;
          }

          // Calcular valor_produtos e valor_total baseado na soma dos itens
          const valor_produtos_calculado = itens.reduce((sum, item) => {
            return sum + (parseFloat(item.valor_total) || 0);
          }, 0);
          
          // Usar valor_produtos calculado dos itens (mais preciso) ou o valor da planilha como fallback
          const valor_produtos = valor_produtos_calculado > 0 ? valor_produtos_calculado : parseFloat(notaFiscal.valor_produtos || 0);
          
          // Calcular valor_total: produtos + frete - desconto
          const valor_total = valor_produtos +
            parseFloat(notaFiscal.valor_frete || 0) -
            parseFloat(notaFiscal.valor_desconto || 0);

          let notaFiscalId;

          if (existentes.length > 0) {
            // Atualizar nota fiscal existente
            notaFiscalId = existentes[0].id;
            
            // Buscar fornecedor por CNPJ se fornecido, caso contrário usar razao_social
            let fornecedorIdFinal = fornecedorId;
            if (notaFiscal.cnpj) {
              const fornecedorCnpjQuery = `
                SELECT id FROM fornecedores 
                WHERE cnpj = ? AND status = 1
                LIMIT 1
              `;
              const fornecedoresCnpj = await executeQuery(fornecedorCnpjQuery, [notaFiscal.cnpj.replace(/[^\d]/g, '')]);
              if (fornecedoresCnpj.length > 0) {
                fornecedorIdFinal = fornecedoresCnpj[0].id;
              }
            }

            const updateQuery = `
              UPDATE notas_fiscais SET
                tipo_nota = ?,
                fornecedor_id = ?,
                filial_id = ?,
                almoxarifado_id = ?,
                data_emissao = ?,
                data_saida = ?,
                data_lancamento = ?,
                valor_produtos = ?,
                valor_frete = ?,
                valor_desconto = ?,
                valor_ipi = 0.00,
                valor_icms = 0.00,
                valor_total = ?,
                natureza_operacao = ?,
                cfop = NULL,
                observacoes = ?,
                status = 'LANCADA',
                atualizado_em = NOW()
              WHERE id = ?
            `;

            await executeQuery(updateQuery, [
              notaFiscal.tipo_nota,
              fornecedorIdFinal,
              filialId,
              almoxarifadoId,
              dataEmissaoMySQL,
              dataSaidaMySQL,
              dataLancamentoMySQL,
              valor_produtos,
              notaFiscal.valor_frete,
              notaFiscal.valor_desconto,
              valor_total,
              notaFiscal.natureza_operacao,
              notaFiscal.observacoes,
              notaFiscalId
            ]);

            // Excluir itens antigos
            await executeQuery('DELETE FROM notas_fiscais_itens WHERE nota_fiscal_id = ?', [notaFiscalId]);
            
            atualizados++;
          } else {
            // Buscar fornecedor por CNPJ se fornecido, caso contrário usar razao_social
            let fornecedorIdFinal = fornecedorId;
            if (notaFiscal.cnpj) {
              const fornecedorCnpjQuery = `
                SELECT id FROM fornecedores 
                WHERE cnpj = ? AND status = 1
                LIMIT 1
              `;
              const fornecedoresCnpj = await executeQuery(fornecedorCnpjQuery, [notaFiscal.cnpj.replace(/[^\d]/g, '')]);
              if (fornecedoresCnpj.length > 0) {
                fornecedorIdFinal = fornecedoresCnpj[0].id;
              }
            }

            // Inserir nova nota fiscal
            const insertQuery = `
              INSERT INTO notas_fiscais (
                tipo_nota, numero_nota, serie, fornecedor_id, filial_id, almoxarifado_id,
                data_emissao, data_saida, data_lancamento, valor_produtos, valor_frete,
                valor_desconto, valor_ipi, valor_icms, valor_total, natureza_operacao, cfop,
                observacoes, status, usuario_cadastro_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, 0.00, ?, ?, NULL, ?, 'LANCADA', ?)
            `;

            const resultado = await executeQuery(insertQuery, [
              notaFiscal.tipo_nota,
              notaFiscal.numero_nota,
              notaFiscal.serie || '',
              fornecedorIdFinal,
              filialId,
              almoxarifadoId,
              dataEmissaoMySQL,
              dataSaidaMySQL,
              dataLancamentoMySQL,
              valor_produtos,
              notaFiscal.valor_frete,
              notaFiscal.valor_desconto,
              valor_total,
              notaFiscal.natureza_operacao,
              notaFiscal.observacoes,
              usuarioId
            ]);

            notaFiscalId = resultado.insertId;
            importados++;
          }

          // Inserir itens da nota fiscal
          for (const item of itens) {
            try {
              const valor_total_item = (item.quantidade * item.valor_unitario) - (item.valor_desconto || 0);

              const itemQuery = `
                INSERT INTO notas_fiscais_itens (
                  nota_fiscal_id, numero_item, codigo_produto, descricao,
                  ncm, cfop, unidade_medida, quantidade, valor_unitario, valor_total,
                  valor_desconto, valor_ipi, aliquota_ipi, valor_icms, aliquota_icms,
                  valor_pis, aliquota_pis, valor_cofins, aliquota_cofins
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;

              await executeQuery(itemQuery, [
                notaFiscalId,
                item.numero_item,
                item.codigo_produto,
                item.descricao,
                item.ncm,
                item.cfop,
                item.unidade_medida,
                item.quantidade,
                item.valor_unitario,
                valor_total_item,
                item.valor_desconto,
                item.valor_ipi,
                item.aliquota_ipi,
                item.valor_icms,
                item.aliquota_icms,
                item.valor_pis,
                item.aliquota_pis,
                item.valor_cofins,
                item.aliquota_cofins
              ]);
            } catch (itemError) {
              erros.push(`Nota ${notaFiscal.numero_nota}, Item ${item.numero_item}: Erro ao inserir - ${itemError.message}`);
            }
          }

        } catch (error) {
          erros.push(`Nota ${notaFiscal.numero_nota}: Erro interno - ${error.message}`);
        }
      }

      return successResponse(res, {
        message: 'Importação realizada com sucesso',
        importados,
        atualizados,
        erros: erros.length > 0 ? erros : null
      });

    } catch (error) {
      return errorResponse(res, `Erro interno na importação: ${error.message}`, 500);
    }
  }
}

module.exports = {
  NotaFiscalImportController,
  upload
};

