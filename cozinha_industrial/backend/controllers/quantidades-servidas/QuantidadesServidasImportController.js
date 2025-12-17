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
        
        // Comparação case-insensitive e removendo acentos/variações
        const headerLower = headerValue.toLowerCase();
        
        if (headerLower === 'unidade' || headerLower.includes('unidade')) {
          headerMap.unidade = colNumber;
        } else if (headerLower === 'data') {
          headerMap.data = colNumber;
        } else if (headerLower.includes('tipo') && headerLower.includes('cardápio')) {
          headerMap.produto_comercial = colNumber;
        } else if (headerLower === 'período' || headerLower === 'periodo') {
          headerMap.periodo = colNumber;
        } else if (headerLower === 'quantidade') {
          headerMap.quantidade = colNumber;
        }
      });

      // Validar se todos os cabeçalhos necessários foram encontrados
      const cabeçalhosFaltando = [];
      if (!headerMap.unidade) cabeçalhosFaltando.push('Unidade');
      if (!headerMap.data) cabeçalhosFaltando.push('Data');
      if (!headerMap.periodo) cabeçalhosFaltando.push('Período');
      if (!headerMap.quantidade) cabeçalhosFaltando.push('Quantidade');
      
      if (cabeçalhosFaltando.length > 0) {
        return errorResponse(res, `Cabeçalhos obrigatórios não encontrados: ${cabeçalhosFaltando.join(', ')}. Verifique se a planilha contém: Unidade, Data, Período, Quantidade`, 400);
      }

      const registros = [];
      const erros = [];
      let linha = 2; // Começar da linha 2 (pular cabeçalho)
      let linhasVazias = 0;
      let linhasQuantidadeZero = 0;
      let linhasComErro = 0;

      // Processar cada linha (cada linha = um período)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Pular cabeçalho

        const valores = row.values;
        if (!valores || valores.length < 4) {
          // Linha vazia ou incompleta - apenas pular, não adicionar erro
          linhasVazias++;
          linha++;
          return;
        }

        const unidade = valores[headerMap.unidade]?.toString().trim();
        let dataRaw = valores[headerMap.data];
        const periodoNome = valores[headerMap.periodo]?.toString().trim();
        const quantidadeStr = valores[headerMap.quantidade]?.toString().trim();
        const produtoComercial = headerMap.produto_comercial ? valores[headerMap.produto_comercial]?.toString().trim() : null;

        // Validações básicas
        if (!unidade || !dataRaw || !periodoNome || !quantidadeStr) {
          erros.push(`Linha ${linha}: Unidade, Data, Período e Quantidade são obrigatórios`);
          linhasComErro++;
          linha++;
          return;
        }

        // Converter data: pode vir como objeto Date do Excel ou string
        let data = '';
        if (dataRaw instanceof Date) {
          // Se for objeto Date, converter para DD/MM/YYYY
          const dia = String(dataRaw.getDate()).padStart(2, '0');
          const mes = String(dataRaw.getMonth() + 1).padStart(2, '0');
          const ano = dataRaw.getFullYear();
          data = `${dia}/${mes}/${ano}`;
        } else {
          // Se for string, usar como está
          data = dataRaw.toString().trim();
        }

        // Validar formato da data (DD/MM/YYYY) e converter para YYYY-MM-DD
        const dataRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = data.match(dataRegex);
        if (!match) {
          erros.push(`Linha ${linha}: Data deve estar no formato DD/MM/YYYY (ex: 15/01/2025). Valor recebido: "${dataRaw}"`);
          linhasComErro++;
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
          linhasComErro++;
          linha++;
          return;
        }

        const dataFormatada = `${ano}-${mes}-${dia}`;

        // Buscar ID do período pelo nome
        const periodoId = periodosMap.get(periodoNome.toLowerCase().trim());
        if (!periodoId) {
          erros.push(`Linha ${linha}: Período "${periodoNome}" não encontrado`);
          linhasComErro++;
          linha++;
          return;
        }

        // Validar quantidade
        const quantidade = parseInt(quantidadeStr);
        if (isNaN(quantidade) || quantidade < 0) {
          erros.push(`Linha ${linha}: Quantidade deve ser um número não-negativo`);
          linhasComErro++;
          linha++;
          return;
        }

        if (quantidade === 0) {
          // Pular linhas com quantidade zero
          linhasQuantidadeZero++;
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

      const totalLinhas = linha - 2;
      console.log(`=== RESUMO DA VALIDAÇÃO ===`);
      console.log(`Total de linhas na planilha: ${totalLinhas}`);
      console.log(`Linhas vazias/incompletas: ${linhasVazias}`);
      console.log(`Linhas com quantidade zero: ${linhasQuantidadeZero}`);
      console.log(`Linhas com erro de validação: ${linhasComErro}`);
      console.log(`Registros válidos para processar: ${registros.length}`);
      console.log(`Total de erros de validação: ${erros.length}`);

      if (registros.length === 0) {
        return errorResponse(res, 'Nenhum registro válido encontrado. Verifique se há linhas com quantidade maior que zero e se os dados estão corretos', 400, { erros: erros.length > 0 ? erros : null });
      }

      // Processar registros em blocos para evitar problemas de memória e timeout
      const TAMANHO_BLOCO = 50; // Reduzir para 50 registros por vez para evitar timeout
      const MAX_ERROS_EXIBIR = 100; // Limitar número de erros retornados
      let importados = 0;
      let atualizados = 0;
      const unidadesProcessadas = new Set(); // Para rastrear unidades que precisam recalcular médias
      let totalErros = 0;

      console.log(`Iniciando processamento de ${registros.length} registros em blocos de ${TAMANHO_BLOCO}`);

      // Processar em blocos
      for (let i = 0; i < registros.length; i += TAMANHO_BLOCO) {
        const bloco = registros.slice(i, i + TAMANHO_BLOCO);
        const numeroBloco = Math.floor(i / TAMANHO_BLOCO) + 1;
        const totalBlocos = Math.ceil(registros.length / TAMANHO_BLOCO);
        
        console.log(`Processando bloco ${numeroBloco}/${totalBlocos} (linhas ${i + 1} a ${Math.min(i + TAMANHO_BLOCO, registros.length)})`);
        
        for (const registro of bloco) {
        try {
          // Buscar unidade pelo nome (incluindo filial_id e filial_nome via JOIN)
          const unidadeQuery = `
            SELECT 
              ue.id, 
              ue.nome_escola, 
              ue.filial_id, 
              f.filial as filial_nome
            FROM foods_db.unidades_escolares ue
            LEFT JOIN foods_db.filiais f ON ue.filial_id = f.id
            WHERE ue.nome_escola = ?
            LIMIT 1
          `;
          const unidades = await executeQuery(unidadeQuery, [registro.unidade]);
          
          if (unidades.length === 0) {
            erros.push(`Linha ${registro.linha}: Unidade "${registro.unidade}" não encontrada`);
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
          totalErros++;
          const mensagemErro = `Linha ${registro.linha}: Erro interno - ${error.message}`;
          console.error(mensagemErro, error);
          
          // Limitar número de erros retornados para não sobrecarregar a resposta
          if (erros.length < MAX_ERROS_EXIBIR) {
            erros.push(mensagemErro);
          } else if (erros.length === MAX_ERROS_EXIBIR) {
            erros.push(`... e mais ${totalErros - MAX_ERROS_EXIBIR} erros (total: ${totalErros} erros)`);
          }
          
          // Continuar processando mesmo com erros
          continue;
        }
        }
        
        console.log(`Bloco ${numeroBloco} concluído. Importados: ${importados}, Atualizados: ${atualizados}, Erros: ${totalErros}`);
        
        // Pequena pausa entre blocos para não sobrecarregar o banco
        if (i + TAMANHO_BLOCO < registros.length) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms de pausa
        }
      }
      
      console.log(`Processamento concluído. Total: ${importados} importados, ${atualizados} atualizados, ${totalErros} erros`);

      // Recalcular médias para todas as unidades processadas
      // Considerando apenas os últimos 20 registros por unidade/período, ordenados por data (mais recentes primeiro)
      let errosRecalculo = 0;
      let mediasRecalculadas = 0;
      const nutricionistaId = req.user?.id || 1; // Usar ID do usuário logado
      console.log(`Iniciando recálculo de médias para ${unidadesProcessadas.size} unidades (últimos 20 registros por período)`);
      
      for (const unidadeId of unidadesProcessadas) {
        try {
          // Buscar todos os períodos únicos para esta unidade
          const periodosQuery = `
            SELECT DISTINCT periodo_atendimento_id
            FROM quantidades_servidas
            WHERE unidade_id = ? AND ativo = 1
          `;
          const periodos = await executeQuery(periodosQuery, [unidadeId]);
          
          // Para cada período, calcular a média dos últimos 20 registros
          for (const periodo of periodos) {
            const periodoId = periodo.periodo_atendimento_id;
            
            // Buscar os últimos 20 registros deste período para esta unidade, ordenados por data DESC
            const ultimosRegistrosQuery = `
              SELECT valor, data
              FROM quantidades_servidas
              WHERE unidade_id = ? 
                AND periodo_atendimento_id = ?
                AND ativo = 1
              ORDER BY data DESC, id DESC
              LIMIT 20
            `;
            const registros = await executeQuery(ultimosRegistrosQuery, [unidadeId, periodoId]);
            
            if (registros.length > 0) {
              // Calcular a média dos valores
              const soma = registros.reduce((acc, reg) => acc + (parseFloat(reg.valor) || 0), 0);
              const media = soma / registros.length;
              const quantidadeLancamentos = registros.length;
              
              // Buscar nome da unidade
              const unidadeQuery = `
                SELECT nome_escola
                FROM foods_db.unidades_escolares
                WHERE id = ?
                LIMIT 1
              `;
              const unidades = await executeQuery(unidadeQuery, [unidadeId]);
              const unidadeNome = unidades.length > 0 ? unidades[0].nome_escola : 'Unidade Desconhecida';
              
              // Atualizar ou inserir média na tabela medias_quantidades_servidas
              const upsertMediaQuery = `
                INSERT INTO medias_quantidades_servidas (
                  unidade_id,
                  unidade_nome,
                  periodo_atendimento_id,
                  media,
                  quantidade_lancamentos,
                  data_calculo,
                  nutricionista_id
                ) VALUES (?, ?, ?, ?, ?, NOW(), ?)
                ON DUPLICATE KEY UPDATE
                  unidade_nome = VALUES(unidade_nome),
                  media = VALUES(media),
                  quantidade_lancamentos = VALUES(quantidade_lancamentos),
                  data_calculo = NOW(),
                  nutricionista_id = VALUES(nutricionista_id)
              `;
              
              await executeQuery(upsertMediaQuery, [
                unidadeId,
                unidadeNome,
                periodoId,
                media,
                quantidadeLancamentos,
                nutricionistaId
              ]);
              
              mediasRecalculadas++;
            }
          }
        } catch (error) {
          // Se houver erro, apenas logar (não falhar a importação)
          errosRecalculo++;
          console.warn(`Erro ao recalcular média para unidade ${unidadeId}:`, error.message);
          // Não adicionar ao array de erros para não confundir o usuário
        }
      }
      
      console.log(`Recálculo de médias concluído. ${mediasRecalculadas} médias recalculadas, ${errosRecalculo} erros`);

      // Preparar dados da resposta
      const MAX_ERROS_RETORNADOS = 100; // Limitar número de erros retornados na resposta
      const responseData = {
        importados,
        atualizados,
        total_erros: totalErros,
        erros: erros.length > 0 ? erros.slice(0, MAX_ERROS_RETORNADOS) : null, // Limitar erros retornados
        recalculos: {
          unidades_processadas: unidadesProcessadas.size,
          medias_recalculadas: mediasRecalculadas,
          erros: errosRecalculo
        }
      };
      
      const responseMessage = totalErros > 0 
        ? `Importação concluída com ${totalErros} erro(s). ${importados} registros importados, ${atualizados} atualizados.`
        : 'Importação realizada com sucesso';

      try {
        return successResponse(res, responseData, responseMessage);
      } catch (responseError) {
        console.error('Erro ao enviar resposta:', responseError);
        console.error('Stack trace:', responseError.stack);
        // Se houver erro ao enviar resposta, tentar enviar uma resposta simples
        try {
          return res.status(200).json({
            success: true,
            message: responseMessage,
            data: responseData
          });
        } catch (fallbackError) {
          console.error('Erro ao enviar resposta de fallback:', fallbackError);
          return res.status(200).json({
            success: true,
            message: 'Importação realizada com sucesso',
            importados,
            atualizados
          });
        }
      }

    } catch (error) {
      console.error('Erro na importação:', error);
      console.error('Stack trace:', error.stack);
      
      // Retornar informações sobre o que foi processado antes do erro
      return errorResponse(res, {
        message: 'Erro interno na importação',
        error: error.message,
        processados: {
          importados,
          atualizados,
          total_erros: totalErros || 0
        }
      }, 500);
    }
  }
}

module.exports = {
  QuantidadesServidasImportController,
  upload
};
