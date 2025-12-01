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
      
      // Aba 1: Dados da Nota Fiscal
      const worksheetNF = workbook.addWorksheet('Notas Fiscais');
      
      // Definir colunas da nota fiscal
      worksheetNF.columns = [
        { header: 'Tipo Nota', key: 'tipo_nota', width: 15 },
        { header: 'Número Nota', key: 'numero_nota', width: 15 },
        { header: 'Série', key: 'serie', width: 10 },
        { header: 'Chave Acesso', key: 'chave_acesso', width: 50 },
        { header: 'Fornecedor (Razão Social)', key: 'fornecedor', width: 40 },
        { header: 'Filial', key: 'filial', width: 30 },
        { header: 'Almoxarifado (Código)', key: 'almoxarifado', width: 20 },
        { header: 'Data Emissão (YYYY-MM-DD)', key: 'data_emissao', width: 20 },
        { header: 'Data Saída (YYYY-MM-DD)', key: 'data_saida', width: 20 },
        { header: 'Valor Produtos', key: 'valor_produtos', width: 15 },
        { header: 'Valor Frete', key: 'valor_frete', width: 15 },
        { header: 'Valor Desconto', key: 'valor_desconto', width: 15 },
        { header: 'Valor IPI', key: 'valor_ipi', width: 15 },
        { header: 'Valor ICMS', key: 'valor_icms', width: 15 },
        { header: 'Natureza Operação', key: 'natureza_operacao', width: 30 },
        { header: 'CFOP', key: 'cfop', width: 10 },
        { header: 'Observações', key: 'observacoes', width: 40 }
      ];

      // Estilizar cabeçalho
      worksheetNF.getRow(1).font = { bold: true };
      worksheetNF.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      };

      // Adicionar dados de exemplo
      const dataAtual = new Date();
      const dataExemplo = dataAtual.toISOString().split('T')[0]; // YYYY-MM-DD

      const exemploNF = {
        tipo_nota: 'ENTRADA',
        numero_nota: '12345',
        serie: '1',
        chave_acesso: '',
        fornecedor: fornecedores[0]?.razao_social || 'FORNECEDOR EXEMPLO LTDA',
        filial: filiais[0]?.filial || 'FILIAL EXEMPLO',
        almoxarifado: '001',
        data_emissao: dataExemplo,
        data_saida: dataExemplo,
        valor_produtos: 1000.00,
        valor_frete: 50.00,
        valor_desconto: 0.00,
        valor_ipi: 0.00,
        valor_icms: 0.00,
        natureza_operacao: 'COMPRA',
        cfop: '5102',
        observacoes: 'Nota fiscal de exemplo'
      };

      worksheetNF.addRow(exemploNF);

      // Aba 2: Itens da Nota Fiscal
      const worksheetItens = workbook.addWorksheet('Itens');
      
      // Definir colunas dos itens
      worksheetItens.columns = [
        { header: 'Número Nota', key: 'numero_nota', width: 15 },
        { header: 'Série', key: 'serie', width: 10 },
        { header: 'Número Item', key: 'numero_item', width: 15 },
        { header: 'Código Produto', key: 'codigo_produto', width: 20 },
        { header: 'Descrição', key: 'descricao', width: 50 },
        { header: 'NCM', key: 'ncm', width: 15 },
        { header: 'CFOP', key: 'cfop', width: 10 },
        { header: 'Unidade Comercial', key: 'unidade_comercial', width: 15 },
        { header: 'Quantidade', key: 'quantidade', width: 15 },
        { header: 'Valor Unitário', key: 'valor_unitario', width: 15 },
        { header: 'Valor Total', key: 'valor_total', width: 15 },
        { header: 'Valor Desconto', key: 'valor_desconto', width: 15 },
        { header: 'Valor IPI', key: 'valor_ipi', width: 15 },
        { header: 'Alíquota IPI', key: 'aliquota_ipi', width: 15 },
        { header: 'Valor ICMS', key: 'valor_icms', width: 15 },
        { header: 'Alíquota ICMS', key: 'aliquota_icms', width: 15 },
        { header: 'Valor PIS', key: 'valor_pis', width: 15 },
        { header: 'Alíquota PIS', key: 'aliquota_pis', width: 15 },
        { header: 'Valor COFINS', key: 'valor_cofins', width: 15 },
        { header: 'Alíquota COFINS', key: 'aliquota_cofins', width: 15 }
      ];

      // Estilizar cabeçalho
      worksheetItens.getRow(1).font = { bold: true };
      worksheetItens.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      };

      // Adicionar itens de exemplo
      const exemploItens = [
        {
          numero_nota: '12345',
          serie: '1',
          numero_item: 1,
          codigo_produto: 'PROD001',
          descricao: 'Produto Exemplo 1',
          ncm: '12345678',
          cfop: '5102',
          unidade_comercial: 'UN',
          quantidade: 10,
          valor_unitario: 50.00,
          valor_total: 500.00,
          valor_desconto: 0.00,
          valor_ipi: 0.00,
          aliquota_ipi: 0.00,
          valor_icms: 0.00,
          aliquota_icms: 0.00,
          valor_pis: 0.00,
          aliquota_pis: 0.00,
          valor_cofins: 0.00,
          aliquota_cofins: 0.00
        },
        {
          numero_nota: '12345',
          serie: '1',
          numero_item: 2,
          codigo_produto: 'PROD002',
          descricao: 'Produto Exemplo 2',
          ncm: '87654321',
          cfop: '5102',
          unidade_comercial: 'UN',
          quantidade: 5,
          valor_unitario: 100.00,
          valor_total: 500.00,
          valor_desconto: 0.00,
          valor_ipi: 0.00,
          aliquota_ipi: 0.00,
          valor_icms: 0.00,
          aliquota_icms: 0.00,
          valor_pis: 0.00,
          aliquota_pis: 0.00,
          valor_cofins: 0.00,
          aliquota_cofins: 0.00
        }
      ];

      exemploItens.forEach(item => {
        worksheetItens.addRow(item);
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="modelo_notas_fiscais.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao gerar modelo:', error);
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
      
      // Ler aba de Notas Fiscais
      const worksheetNF = workbook.getWorksheet('Notas Fiscais');
      if (!worksheetNF) {
        return errorResponse(res, 'Aba "Notas Fiscais" não encontrada na planilha', 400);
      }

      // Ler aba de Itens
      const worksheetItens = workbook.getWorksheet('Itens');
      if (!worksheetItens) {
        return errorResponse(res, 'Aba "Itens" não encontrada na planilha', 400);
      }

      const notasFiscais = [];
      const erros = [];
      let linhaNF = 2; // Começar da linha 2 (pular cabeçalho)

      // Processar cada linha da aba de Notas Fiscais
      worksheetNF.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Pular cabeçalho

        const valores = row.values;
        if (!valores || valores.length < 10) return;

        const notaFiscal = {
          tipo_nota: valores[1]?.toString().trim() || 'ENTRADA',
          numero_nota: valores[2]?.toString().trim(),
          serie: valores[3]?.toString().trim() || '',
          chave_acesso: valores[4]?.toString().trim() || null,
          fornecedor: valores[5]?.toString().trim(),
          filial: valores[6]?.toString().trim(),
          almoxarifado: valores[7]?.toString().trim(),
          data_emissao: valores[8]?.toString().trim(),
          data_saida: valores[9]?.toString().trim(),
          valor_produtos: parseFloat(valores[10]) || 0.00,
          valor_frete: parseFloat(valores[11]) || 0.00,
          valor_desconto: parseFloat(valores[12]) || 0.00,
          valor_ipi: parseFloat(valores[13]) || 0.00,
          valor_icms: parseFloat(valores[14]) || 0.00,
          natureza_operacao: valores[15]?.toString().trim() || null,
          cfop: valores[16]?.toString().trim() || null,
          observacoes: valores[17]?.toString().trim() || null
        };

        // Validações básicas
        if (!notaFiscal.numero_nota) {
          erros.push(`Linha ${linhaNF}: Número da nota é obrigatório`);
          linhaNF++;
          return;
        }

        if (!notaFiscal.fornecedor) {
          erros.push(`Linha ${linhaNF}: Fornecedor é obrigatório`);
          linhaNF++;
          return;
        }

        if (!notaFiscal.filial) {
          erros.push(`Linha ${linhaNF}: Filial é obrigatória`);
          linhaNF++;
          return;
        }

        if (!notaFiscal.almoxarifado) {
          erros.push(`Linha ${linhaNF}: Almoxarifado é obrigatório`);
          linhaNF++;
          return;
        }

        if (!notaFiscal.data_emissao) {
          erros.push(`Linha ${linhaNF}: Data de emissão é obrigatória`);
          linhaNF++;
          return;
        }

        if (!notaFiscal.data_saida) {
          erros.push(`Linha ${linhaNF}: Data de saída é obrigatória`);
          linhaNF++;
          return;
        }

        // Validar formato da data
        const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dataRegex.test(notaFiscal.data_emissao)) {
          erros.push(`Linha ${linhaNF}: Data de emissão deve estar no formato YYYY-MM-DD`);
          linhaNF++;
          return;
        }

        if (!dataRegex.test(notaFiscal.data_saida)) {
          erros.push(`Linha ${linhaNF}: Data de saída deve estar no formato YYYY-MM-DD`);
          linhaNF++;
          return;
        }

        notasFiscais.push(notaFiscal);
        linhaNF++;
      });

      // Processar itens
      const itensPorNota = {};
      let linhaItem = 2;

      worksheetItens.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Pular cabeçalho

        const valores = row.values;
        if (!valores || valores.length < 10) return;

        const numeroNota = valores[1]?.toString().trim();
        const serie = valores[2]?.toString().trim() || '';

        if (!numeroNota) {
          erros.push(`Linha ${linhaItem} (Itens): Número da nota é obrigatório`);
          linhaItem++;
          return;
        }

        const chaveNota = `${numeroNota}_${serie}`;

        if (!itensPorNota[chaveNota]) {
          itensPorNota[chaveNota] = [];
        }

        const item = {
          numero_nota: numeroNota,
          serie: serie,
          numero_item: parseInt(valores[3]) || 0,
          codigo_produto: valores[4]?.toString().trim() || '',
          descricao: valores[5]?.toString().trim() || '',
          ncm: valores[6]?.toString().trim() || null,
          cfop: valores[7]?.toString().trim() || null,
          unidade_comercial: valores[8]?.toString().trim() || null,
          quantidade: parseFloat(valores[9]) || 0,
          valor_unitario: parseFloat(valores[10]) || 0.00,
          valor_total: parseFloat(valores[11]) || 0.00,
          valor_desconto: parseFloat(valores[12]) || 0.00,
          valor_ipi: parseFloat(valores[13]) || 0.00,
          aliquota_ipi: parseFloat(valores[14]) || 0.00,
          valor_icms: parseFloat(valores[15]) || 0.00,
          aliquota_icms: parseFloat(valores[16]) || 0.00,
          valor_pis: parseFloat(valores[17]) || 0.00,
          aliquota_pis: parseFloat(valores[18]) || 0.00,
          valor_cofins: parseFloat(valores[19]) || 0.00,
          aliquota_cofins: parseFloat(valores[20]) || 0.00
        };

        // Validações básicas do item
        if (!item.descricao) {
          erros.push(`Linha ${linhaItem} (Itens): Descrição do produto é obrigatória`);
          linhaItem++;
          return;
        }

        if (item.quantidade <= 0) {
          erros.push(`Linha ${linhaItem} (Itens): Quantidade deve ser maior que zero`);
          linhaItem++;
          return;
        }

        if (item.valor_unitario < 0) {
          erros.push(`Linha ${linhaItem} (Itens): Valor unitário não pode ser negativo`);
          linhaItem++;
          return;
        }

        itensPorNota[chaveNota].push(item);
        linhaItem++;
      });

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

          // Buscar almoxarifado
          const almoxarifadoQuery = `
            SELECT id FROM almoxarifado 
            WHERE codigo = ? AND status = 1
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

          // Calcular valor total
          const valor_total = parseFloat(notaFiscal.valor_produtos) +
            parseFloat(notaFiscal.valor_frete || 0) +
            parseFloat(notaFiscal.valor_ipi || 0) +
            parseFloat(notaFiscal.valor_icms || 0) -
            parseFloat(notaFiscal.valor_desconto || 0);

          // Converter datas para formato MySQL
          const dataEmissaoMySQL = `${notaFiscal.data_emissao} 00:00:00`;
          const dataSaidaMySQL = `${notaFiscal.data_saida} 00:00:00`;
          const dataLancamentoMySQL = new Date().toISOString().slice(0, 19).replace('T', ' ');

          const usuarioId = req.user?.id || null;

          // Verificar se há itens para esta nota antes de processar
          const itens = itensPorNota[chaveNota] || [];
          
          if (itens.length === 0) {
            erros.push(`Nota ${notaFiscal.numero_nota}: A nota fiscal deve ter pelo menos um item`);
            continue;
          }

          let notaFiscalId;

          if (existentes.length > 0) {
            // Atualizar nota fiscal existente
            notaFiscalId = existentes[0].id;
            
            const updateQuery = `
              UPDATE notas_fiscais SET
                tipo_nota = ?,
                chave_acesso = ?,
                filial_id = ?,
                almoxarifado_id = ?,
                data_emissao = ?,
                data_saida = ?,
                data_lancamento = ?,
                valor_produtos = ?,
                valor_frete = ?,
                valor_desconto = ?,
                valor_ipi = ?,
                valor_icms = ?,
                valor_total = ?,
                natureza_operacao = ?,
                cfop = ?,
                observacoes = ?,
                status = 'LANCADA',
                atualizado_em = NOW()
              WHERE id = ?
            `;

            await executeQuery(updateQuery, [
              notaFiscal.tipo_nota,
              notaFiscal.chave_acesso,
              filialId,
              almoxarifadoId,
              dataEmissaoMySQL,
              dataSaidaMySQL,
              dataLancamentoMySQL,
              notaFiscal.valor_produtos,
              notaFiscal.valor_frete,
              notaFiscal.valor_desconto,
              notaFiscal.valor_ipi,
              notaFiscal.valor_icms,
              valor_total,
              notaFiscal.natureza_operacao,
              notaFiscal.cfop,
              notaFiscal.observacoes,
              notaFiscalId
            ]);

            // Excluir itens antigos
            await executeQuery('DELETE FROM notas_fiscais_itens WHERE nota_fiscal_id = ?', [notaFiscalId]);
            
            atualizados++;
          } else {
            // Inserir nova nota fiscal
            const insertQuery = `
              INSERT INTO notas_fiscais (
                tipo_nota, numero_nota, serie, chave_acesso, fornecedor_id, filial_id, almoxarifado_id,
                data_emissao, data_saida, data_lancamento, valor_produtos, valor_frete,
                valor_desconto, valor_ipi, valor_icms, valor_total, natureza_operacao, cfop,
                observacoes, status, usuario_cadastro_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LANCADA', ?)
            `;

            const resultado = await executeQuery(insertQuery, [
              notaFiscal.tipo_nota,
              notaFiscal.numero_nota,
              notaFiscal.serie || '',
              notaFiscal.chave_acesso,
              fornecedorId,
              filialId,
              almoxarifadoId,
              dataEmissaoMySQL,
              dataSaidaMySQL,
              dataLancamentoMySQL,
              notaFiscal.valor_produtos,
              notaFiscal.valor_frete,
              notaFiscal.valor_desconto,
              notaFiscal.valor_ipi,
              notaFiscal.valor_icms,
              valor_total,
              notaFiscal.natureza_operacao,
              notaFiscal.cfop,
              notaFiscal.observacoes,
              usuarioId
            ]);

            notaFiscalId = resultado.insertId;
            importados++;
          }

          // Inserir itens da nota fiscal
          
          for (const item of itens) {
            const valor_total_item = (item.quantidade * item.valor_unitario) - (item.valor_desconto || 0);

            const itemQuery = `
              INSERT INTO notas_fiscais_itens (
                nota_fiscal_id, numero_item, codigo_produto, descricao,
                ncm, cfop, unidade_comercial, quantidade, valor_unitario, valor_total,
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
              item.unidade_comercial,
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
          }

        } catch (error) {
          console.error(`Erro ao processar nota fiscal ${notaFiscal.numero_nota}:`, error);
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
      console.error('Erro na importação:', error);
      return errorResponse(res, 'Erro interno na importação', 500);
    }
  }
}

module.exports = {
  NotaFiscalImportController,
  upload
};

