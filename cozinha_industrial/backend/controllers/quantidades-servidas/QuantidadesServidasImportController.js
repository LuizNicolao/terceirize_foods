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

      // Buscar produtos comerciais para exemplo
      const produtosQuery = `
        SELECT DISTINCT
          tcp.produto_comercial_id as id,
          tcp.produto_comercial_nome as nome
        FROM tipos_cardapio_produtos tcp
        LIMIT 5
      `;
      const produtosComerciais = await executeQuery(produtosQuery);

      // Definir colunas: Unidade, Data, Tipo de Cardápio, Período, Quantidade
      const colunas = [
        { header: 'Unidade', key: 'unidade', width: 30 },
        { header: 'Data', key: 'data', width: 15 },
        { header: 'Tipo de Cardápio', key: 'produto_comercial', width: 30 },
        { header: 'Período', key: 'periodo', width: 20 },
        { header: 'Quantidade', key: 'quantidade', width: 15 }
      ];

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
      // Formatar data no formato DD/MM/YYYY para o exemplo
      const dia = String(dataAtual.getDate()).padStart(2, '0');
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const ano = dataAtual.getFullYear();
      const dataExemplo = `${dia}/${mes}/${ano}`; // DD/MM/YYYY

      // Criar exemplos: uma linha por período para cada unidade
      const exemplos = [];
      unidades.slice(0, 2).forEach((unidade, uIndex) => {
        periodos.slice(0, 3).forEach((periodo, pIndex) => {
          exemplos.push({
            unidade: unidade.nome_escola,
            data: dataExemplo,
            produto_comercial: produtosComerciais[0]?.nome || '',
            periodo: periodo.nome,
            quantidade: (uIndex + 1) * 100 + (pIndex + 1) * 10
          });
        });
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

      // Buscar todos os períodos ativos para mapear nomes
      const periodosQuery = `
        SELECT id, nome, codigo 
        FROM periodos_atendimento 
        WHERE status = 'ativo' 
        ORDER BY nome
      `;
      const periodos = await executeQuery(periodosQuery);
      const periodosMap = new Map(periodos.map(p => [p.nome.toLowerCase().trim(), p.id]));

      // Mapear cabeçalhos da planilha
      const headerRow = worksheet.getRow(1);
      const headerMap = {
        unidade: null,
        data: null,
        produto_comercial: null,
        periodo: null,
        quantidade: null
      };
      
      headerRow.eachCell((cell, colNumber) => {
        const headerValue = cell.value?.toString().trim();
        if (!headerValue) return;
        
        if (headerValue === 'Unidade') {
          headerMap.unidade = colNumber;
        } else if (headerValue === 'Data') {
          headerMap.data = colNumber;
        } else if (headerValue === 'Tipo de Cardápio') {
          headerMap.produto_comercial = colNumber;
        } else if (headerValue === 'Período') {
          headerMap.periodo = colNumber;
        } else if (headerValue === 'Quantidade') {
          headerMap.quantidade = colNumber;
        }
      });

      // Validar se todos os cabeçalhos necessários foram encontrados
      if (!headerMap.unidade || !headerMap.data || !headerMap.periodo || !headerMap.quantidade) {
        return errorResponse(res, 'Cabeçalhos obrigatórios não encontrados. Verifique se a planilha contém: Unidade, Data, Período, Quantidade', 400);
      }

      const registros = [];
      const erros = [];
      let linha = 2; // Começar da linha 2 (pular cabeçalho)

      // Processar cada linha (cada linha = um período)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Pular cabeçalho

        const valores = row.values;
        if (!valores || valores.length < 4) return; // Mínimo: Unidade, Data, Período, Quantidade

        const unidade = valores[headerMap.unidade]?.toString().trim();
        const data = valores[headerMap.data]?.toString().trim();
        const periodoNome = valores[headerMap.periodo]?.toString().trim();
        const quantidadeStr = valores[headerMap.quantidade]?.toString().trim();
        const produtoComercial = headerMap.produto_comercial ? valores[headerMap.produto_comercial]?.toString().trim() : null;

        // Validações básicas
        if (!unidade || !data || !periodoNome || !quantidadeStr) {
          erros.push(`Linha ${linha}: Unidade, Data, Período e Quantidade são obrigatórios`);
          linha++;
          return;
        }

        // Validar formato da data (DD/MM/YYYY) e converter para YYYY-MM-DD
        const dataRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = data.match(dataRegex);
        if (!match) {
          erros.push(`Linha ${linha}: Data deve estar no formato DD/MM/YYYY (ex: 15/01/2025)`);
          linha++;
          return;
        }

        // Converter DD/MM/YYYY para YYYY-MM-DD
        const [, dia, mes, ano] = match;
        const diaNum = parseInt(dia, 10);
        const mesNum = parseInt(mes, 10);
        const anoNum = parseInt(ano, 10);

        // Validar se a data é válida
        if (diaNum < 1 || diaNum > 31 || mesNum < 1 || mesNum > 12 || anoNum < 1900 || anoNum > 2100) {
          erros.push(`Linha ${linha}: Data inválida (${data})`);
          linha++;
          return;
        }

        const dataFormatada = `${ano}-${mes}-${dia}`;

        // Buscar ID do período pelo nome
        const periodoId = periodosMap.get(periodoNome.toLowerCase().trim());
        if (!periodoId) {
          erros.push(`Linha ${linha}: Período "${periodoNome}" não encontrado`);
          linha++;
          return;
        }

        // Validar quantidade
        const quantidade = parseInt(quantidadeStr);
        if (isNaN(quantidade) || quantidade < 0) {
          erros.push(`Linha ${linha}: Quantidade deve ser um número não-negativo`);
          linha++;
          return;
        }

        if (quantidade === 0) {
          // Pular linhas com quantidade zero
          linha++;
          return;
        }

        // Criar registro (uma linha = um período)
        registros.push({
          linha,
          unidade,
          data: dataFormatada,
          produto_comercial: produtoComercial || null,
          periodo_id: periodoId,
          quantidade
        });

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
      const unidadesProcessadas = new Set(); // Para rastrear unidades que precisam recalcular médias

      for (const registro of registros) {
        try {
          // Buscar unidade pelo nome (incluindo filial_id e filial_nome)
          const unidadeQuery = `
            SELECT id, nome_escola, filial_id, filial_nome 
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
          const filialId = unidade.filial_id || null;
          const filialNome = unidade.filial_nome || null;

          // Buscar produto comercial e tipo de cardápio se informado
          let produtoComercialId = null;
          let tipoCardapioId = null;
          
          if (registro.produto_comercial) {
            // Buscar produto comercial e verificar se está vinculado à unidade através de algum tipo de cardápio
            try {
              const produtoVinculadoQuery = `
                SELECT 
                  tcp.produto_comercial_id,
                  tcp.tipo_cardapio_id
                FROM tipos_cardapio_produtos tcp
                INNER JOIN cozinha_industrial_tipos_cardapio ctc 
                  ON tcp.tipo_cardapio_id = ctc.tipo_cardapio_id
                WHERE tcp.produto_comercial_nome = ?
                  AND ctc.cozinha_industrial_id = ?
                  AND ctc.status = 'ativo'
                LIMIT 1
              `;
              const produtos = await executeQuery(produtoVinculadoQuery, [registro.produto_comercial, unidade.id]);
              
              if (produtos.length > 0) {
                produtoComercialId = produtos[0].produto_comercial_id;
                tipoCardapioId = produtos[0].tipo_cardapio_id;
              } else {
                // Tentar buscar o produto sem verificar vínculo (para dar mensagem mais específica)
                const produtoQuery = `
                  SELECT 
                    tcp.produto_comercial_id,
                    tcp.tipo_cardapio_id
                  FROM tipos_cardapio_produtos tcp
                  WHERE tcp.produto_comercial_nome = ?
                  LIMIT 1
                `;
                const produtoSemVinculo = await executeQuery(produtoQuery, [registro.produto_comercial]);
                
                if (produtoSemVinculo.length > 0) {
                  erros.push(`Linha ${registro.linha}: Tipo de Cardápio "${registro.produto_comercial}" não está vinculado à unidade "${registro.unidade}"`);
                } else {
                  erros.push(`Linha ${registro.linha}: Tipo de Cardápio "${registro.produto_comercial}" não encontrado`);
                }
                // Limpar os IDs para não processar este registro
                produtoComercialId = null;
                tipoCardapioId = null;
              }
            } catch (error) {
              // Se a tabela não existir ainda, apenas logar um aviso mas continuar
              if (error.code === 'ER_NO_SUCH_TABLE' && error.sqlMessage?.includes('cozinha_industrial_tipos_cardapio')) {
                console.warn('Tabela cozinha_industrial_tipos_cardapio não existe ainda. Validação de vínculo ignorada.');
                // Se a tabela não existe, buscar apenas o produto sem verificar vínculo
                const produtoQuery = `
                  SELECT 
                    tcp.produto_comercial_id,
                    tcp.tipo_cardapio_id
                  FROM tipos_cardapio_produtos tcp
                  WHERE tcp.produto_comercial_nome = ?
                  LIMIT 1
                `;
                const produtos = await executeQuery(produtoQuery, [registro.produto_comercial]);
                if (produtos.length > 0) {
                  produtoComercialId = produtos[0].produto_comercial_id;
                  tipoCardapioId = produtos[0].tipo_cardapio_id;
                } else {
                  erros.push(`Linha ${registro.linha}: Tipo de Cardápio "${registro.produto_comercial}" não encontrado`);
                }
              } else {
                throw error;
              }
            }
          }

          // Se o tipo de cardápio não está vinculado, pular o processamento
          if (registro.produto_comercial && !tipoCardapioId) {
            continue;
          }

          // Verificar se o período está vinculado à unidade
          const periodosVinculadosQuery = `
            SELECT pa.id, pa.nome, pa.codigo
            FROM periodos_atendimento pa
            INNER JOIN cozinha_industrial_periodos_atendimento cipa 
              ON pa.id = cipa.periodo_atendimento_id
            WHERE cipa.cozinha_industrial_id = ? 
              AND cipa.status = 'ativo'
              AND pa.status = 'ativo'
              AND pa.id = ?
          `;
          const periodosVinculados = await executeQuery(periodosVinculadosQuery, [unidade.id, registro.periodo_id]);
          
          if (periodosVinculados.length === 0) {
            const periodoNome = periodos.find(p => p.id === registro.periodo_id)?.nome || registro.periodo_id;
            erros.push(`Período "${periodoNome}" não está vinculado à unidade "${registro.unidade}"`);
            continue;
          }

          // Verificar se já existe registro para esta unidade/data/período/tipo_cardapio/produto_comercial
          const existeQuery = `
            SELECT id FROM quantidades_servidas 
            WHERE unidade_id = ? 
              AND data = ? 
              AND periodo_atendimento_id = ? 
              AND COALESCE(tipo_cardapio_id, 0) = COALESCE(?, 0)
              AND COALESCE(produto_comercial_id, 0) = COALESCE(?, 0)
              AND ativo = 1
            LIMIT 1
          `;
          const existentes = await executeQuery(existeQuery, [
            unidade.id,
            registro.data,
            registro.periodo_id,
            tipoCardapioId,
            produtoComercialId
          ]);

          if (existentes.length > 0) {
            // Atualizar registro existente usando INSERT ... ON DUPLICATE KEY UPDATE
            const updateQuery = `
              INSERT INTO quantidades_servidas (
                unidade_id, filial_id, filial_nome, unidade_nome, periodo_atendimento_id, tipo_cardapio_id, produto_comercial_id, nutricionista_id, data, valor, ativo
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
              ON DUPLICATE KEY UPDATE
                filial_id = VALUES(filial_id),
                filial_nome = VALUES(filial_nome),
                valor = VALUES(valor),
                ativo = 1,
                atualizado_em = NOW()
            `;
            await executeQuery(updateQuery, [
              unidade.id,
              filialId,
              filialNome,
              unidade.nome_escola,
              registro.periodo_id,
              tipoCardapioId,
              produtoComercialId,
              nutricionistaId,
              registro.data,
              registro.quantidade
            ]);
            atualizados++;
          } else {
            // Inserir novo registro
            const insertQuery = `
              INSERT INTO quantidades_servidas (
                unidade_id, filial_id, filial_nome, unidade_nome, periodo_atendimento_id, tipo_cardapio_id, produto_comercial_id, nutricionista_id, data, valor, ativo
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `;
            await executeQuery(insertQuery, [
              unidade.id,
              filialId,
              filialNome,
              unidade.nome_escola,
              registro.periodo_id,
              tipoCardapioId,
              produtoComercialId,
              nutricionistaId,
              registro.data,
              registro.quantidade
            ]);
            importados++;
          }
          
          // Adicionar unidade à lista de unidades que precisam recalcular médias
          unidadesProcessadas.add(unidade.id);

        } catch (error) {
          console.error(`Erro ao processar registro da linha ${registro.linha}:`, error);
          erros.push(`Linha ${registro.linha}: Erro interno - ${error.message}`);
        }
      }

      // Recalcular médias para todas as unidades processadas
      // Isso garante que as médias sejam atualizadas mesmo se os triggers não estiverem configurados
      for (const unidadeId of unidadesProcessadas) {
        try {
          await executeQuery('CALL recalcular_media_quantidades_servidas(?)', [unidadeId]);
        } catch (error) {
          // Se a procedure não existir ou houver erro, apenas logar (não falhar a importação)
          console.warn(`Erro ao recalcular média para unidade ${unidadeId}:`, error.message);
          // Não adicionar ao array de erros para não confundir o usuário
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
