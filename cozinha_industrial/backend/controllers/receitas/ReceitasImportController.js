const { executeQuery, executeTransaction } = require('../../config/database');
const { successResponse, errorResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const ExcelJS = require('exceljs');
const multer = require('multer');

// Configurar multer para upload de arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx ou .xls) são permitidos'), false);
    }
  }
});

/**
 * Controller para importação de Receitas
 * Implementa importação via planilha Excel seguindo padrão do sistema
 */
class ReceitasImportController {
  /**
   * Gerar e baixar modelo de planilha para importação
   */
  static baixarModelo = asyncHandler(async (req, res) => {
    try {
      // Buscar alguns dados de referência para exemplo
      // Buscar tipos de receitas do próprio banco
      const tiposReceitas = await executeQuery('SELECT id, tipo_receita FROM tipos_receitas WHERE status = 1 LIMIT 5');
      
      // Buscar filiais e centros de custo das tabelas relacionais existentes
      const filiaisExistentes = await executeQuery('SELECT DISTINCT filial_id as id, filial_nome as nome FROM receitas_filiais LIMIT 5');
      const centrosCustoExistentes = await executeQuery('SELECT DISTINCT centro_custo_id as id, centro_custo_nome as nome FROM receitas_centros_custo LIMIT 5');
      
      // Buscar produtos da tabela receitas_produtos ou usar valores de exemplo
      const produtosExistentes = await executeQuery('SELECT DISTINCT produto_origem_id as id, produto_origem as nome FROM receitas_produtos LIMIT 5');

      // Criar workbook
      const workbook = new ExcelJS.Workbook();
      
      // Única aba com todas as informações (Receita + Produtos)
      const worksheet = workbook.addWorksheet('Receitas');
      
      // Definir colunas: dados da receita + dados dos produtos
      worksheet.columns = [
        // Dados da Receita
        { header: 'Nome Receita', key: 'nome_receita', width: 30 },
        { header: 'Descrição Receita', key: 'descricao_receita', width: 40 },
        { header: 'Tipo de Receita', key: 'tipo_receita', width: 25 },
        { header: 'Filiais (separadas por vírgula)', key: 'filiais', width: 40 },
        { header: 'Centros de Custo (separados por vírgula)', key: 'centros_custo', width: 40 },
        { header: 'Status (Ativo/Inativo)', key: 'status', width: 15 },
        // Dados do Produto
        { header: 'Código Produto', key: 'codigo_produto', width: 20 },
        { header: 'Nome Produto', key: 'nome_produto', width: 40 },
        { header: 'Percapta Sugerida', key: 'percapta_sugerida', width: 18 }
      ];

      // Estilizar cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      };

      // Adicionar dados de exemplo
      const exemploLinhas = [
        {
          nome_receita: 'ARROZ BRANCO',
          descricao_receita: 'Receita de arroz branco tradicional',
          tipo_receita: tiposReceitas[0]?.tipo_receita || 'ARROZ',
          filiais: filiaisExistentes[0]?.nome || 'FILIAL EXEMPLO',
          centros_custo: centrosCustoExistentes[0]?.nome || 'CENTRO DE CUSTO EXEMPLO',
          status: 'Ativo',
          codigo_produto: produtosExistentes[0]?.id?.toString() || '',
          nome_produto: produtosExistentes[0]?.nome || 'Produto Exemplo 1',
          percapta_sugerida: '0,050'
        },
        {
          nome_receita: 'ARROZ BRANCO',
          descricao_receita: 'Receita de arroz branco tradicional',
          tipo_receita: tiposReceitas[0]?.tipo_receita || 'ARROZ',
          filiais: filiaisExistentes[0]?.nome || 'FILIAL EXEMPLO',
          centros_custo: centrosCustoExistentes[0]?.nome || 'CENTRO DE CUSTO EXEMPLO',
          status: 'Ativo',
          codigo_produto: produtosExistentes[1]?.id?.toString() || '',
          nome_produto: produtosExistentes[1]?.nome || 'Produto Exemplo 2',
          percapta_sugerida: '0,030'
        }
      ];

      exemploLinhas.forEach(linha => {
        worksheet.addRow(linha);
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="modelo_receitas.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao gerar modelo:', error);
      return errorResponse(res, 'Erro ao gerar modelo de planilha', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  });

  /**
   * Importar receitas via Excel
   */
  static importar = asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return errorResponse(res, 'Nenhum arquivo enviado', STATUS_CODES.BAD_REQUEST);
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      
      // Ler única aba
      let worksheet = workbook.getWorksheet('Receitas');
      if (!worksheet) {
        // Tentar usar a primeira aba se "Receitas" não existir
        const firstWorksheet = workbook.worksheets[0];
        if (!firstWorksheet) {
          return errorResponse(res, 'Nenhuma aba encontrada na planilha', STATUS_CODES.BAD_REQUEST);
        }
        worksheet = firstWorksheet;
      }

      const receitasMap = {}; // Agrupar por nome da receita
      const erros = [];

      // Buscar dados de referência
      // O usuário deve usar os nomes exatos conforme cadastrados no sistema Foods
      const tiposReceitas = await executeQuery('SELECT id, tipo_receita FROM tipos_receitas WHERE status = 1');
      
      // Buscar filiais diretamente do foods_db (não apenas das receitas existentes)
      let filiaisExistentes = [];
      try {
        filiaisExistentes = await executeQuery('SELECT id, filial as nome FROM foods_db.filiais WHERE status = 1');
      } catch (error) {
        // Fallback: buscar apenas das receitas já cadastradas
        filiaisExistentes = await executeQuery('SELECT DISTINCT filial_id as id, filial_nome as nome FROM receitas_filiais');
      }
      
      // Buscar centros de custo diretamente do foods_db (não apenas das receitas existentes)
      let centrosCustoExistentes = [];
      try {
        centrosCustoExistentes = await executeQuery(`
          SELECT 
            cc.id, 
            cc.nome, 
            cc.filial_id,
            f.filial as filial_nome
          FROM foods_db.centro_custo cc
          LEFT JOIN foods_db.filiais f ON cc.filial_id = f.id
          WHERE cc.status = 1
        `);
      } catch (error) {
        // Fallback: buscar apenas das receitas já cadastradas
        centrosCustoExistentes = await executeQuery('SELECT DISTINCT centro_custo_id as id, centro_custo_nome as nome, filial_id, filial_nome FROM receitas_centros_custo');
      }
      
      // Buscar produtos diretamente do banco foods_db (não apenas das receitas existentes)
      // Isso permite importar receitas mesmo sem ter receitas pré-existentes
      let produtosExistentes = [];
      try {
        produtosExistentes = await executeQuery('SELECT id, nome, codigo FROM foods_db.produto_origem WHERE status = 1');
      } catch (error) {
        // Fallback: buscar apenas das receitas já cadastradas
        produtosExistentes = await executeQuery('SELECT DISTINCT produto_origem_id as id, produto_origem as nome FROM receitas_produtos');
      }

      // Criar maps para busca rápida
      const tipoReceitaMap = new Map(tiposReceitas.map(tr => [tr.tipo_receita.toLowerCase(), tr.id]));
      
      // Mapa de filiais (usar dados das receitas existentes)
      const filialMap = new Map(filiaisExistentes.map(f => [f.nome.toLowerCase(), { id: f.id, nome: f.nome }]));
      
      // Mapa de centros de custo (usar dados do foods_db ou receitas existentes)
      const centroCustoMap = new Map();
      centrosCustoExistentes.forEach(cc => {
        // O campo pode ser 'nome' (do foods_db) ou 'nome' (da tabela receitas_centros_custo que usa centro_custo_nome)
        const nome = cc.nome || cc.centro_custo_nome || '';
        if (nome) {
          centroCustoMap.set(nome.toLowerCase(), {
            id: cc.id,
            nome: nome,
            filial_id: cc.filial_id || null,
            filial_nome: cc.filial_nome || null
          });
        }
      });
      
      // Mapa de produtos (buscar do foods_db ou receitas existentes)
      // Nota: produtos podem ser identificados por ID, código ou nome
      const produtoMap = new Map();
      produtosExistentes.forEach(p => {
        if (p.id) produtoMap.set(p.id.toString().toLowerCase(), { id: p.id, nome: p.nome || p.produto_origem, codigo: p.codigo });
        if (p.codigo) produtoMap.set(p.codigo.toString().toLowerCase(), { id: p.id, nome: p.nome || p.produto_origem, codigo: p.codigo });
        if (p.nome) produtoMap.set(p.nome.toLowerCase(), { id: p.id, nome: p.nome, codigo: p.codigo });
        // Também tentar com produto_origem (caso venha das receitas existentes)
        if (p.produto_origem && p.produto_origem !== p.nome) {
          produtoMap.set(p.produto_origem.toLowerCase(), { id: p.id, nome: p.produto_origem, codigo: p.codigo });
        }
      });

      // Processar cada linha da planilha
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        if (!row || !row.values) {
          continue;
        }

        const valores = row.values;
        if (!valores || valores.length < 9) {
          continue;
        }

        // Dados da Receita
        const nomeReceita = valores[1]?.toString().trim();
        const descricaoReceita = valores[2]?.toString().trim() || null;
        const tipoReceitaNome = valores[3]?.toString().trim();
        const filiaisStr = valores[4]?.toString().trim() || '';
        const centrosCustoStr = valores[5]?.toString().trim() || '';
        const statusStr = valores[6]?.toString().trim() || 'Ativo';
        // Dados do Produto
        const codigoProduto = valores[7]?.toString().trim();
        const nomeProduto = valores[8]?.toString().trim();
        const percaptaStr = valores[9]?.toString().trim() || '0';

        // Validações básicas
        if (!nomeReceita) {
          erros.push(`Linha ${rowNumber}: Nome da receita é obrigatório`);
          continue;
        }

        if (!codigoProduto && !nomeProduto) {
          erros.push(`Linha ${rowNumber}: Código ou Nome do produto é obrigatório`);
          continue;
        }

        // Buscar produto
        const produto = produtoMap.get(codigoProduto?.toLowerCase()) || 
                       produtoMap.get(nomeProduto?.toLowerCase());
        
        if (!produto) {
          erros.push(`Linha ${rowNumber}: Produto "${codigoProduto || nomeProduto}" não encontrado no sistema`);
          continue;
        }

        // Buscar tipo de receita
        const tipoReceitaId = tipoReceitaNome ? tipoReceitaMap.get(tipoReceitaNome.toLowerCase()) : null;
        if (tipoReceitaNome && !tipoReceitaId) {
          erros.push(`Linha ${rowNumber}: Tipo de receita "${tipoReceitaNome}" não encontrado no sistema`);
          continue;
        }

        // Processar filiais
        const filiaisArray = [];
        if (filiaisStr) {
          const filiaisList = filiaisStr.split(',').map(f => f.trim());
          for (const filialNome of filiaisList) {
            const filial = filialMap.get(filialNome.toLowerCase());
            if (filial) {
              filiaisArray.push(filial);
            } else {
              erros.push(`Linha ${rowNumber}: Filial "${filialNome}" não encontrada no sistema`);
            }
          }
        }

        // Processar centros de custo
        const centrosCustoArray = [];
        if (centrosCustoStr) {
          const centrosCustoList = centrosCustoStr.split(',').map(cc => cc.trim());
          for (const centroCustoNome of centrosCustoList) {
            const centroCusto = centroCustoMap.get(centroCustoNome.toLowerCase());
            if (centroCusto) {
              centrosCustoArray.push({
                id: centroCusto.id,
                nome: centroCusto.nome,
                filial_id: centroCusto.filial_id || null,
                filial_nome: centroCusto.filial_nome || null
              });
            } else {
              erros.push(`Linha ${rowNumber}: Centro de custo "${centroCustoNome}" não encontrado no sistema`);
            }
          }
        }

        // Processar percapita (trocar vírgula por ponto)
        const percapta = parseFloat(percaptaStr.replace(',', '.')) || 0;

        // Status
        const status = statusStr.toLowerCase() === 'inativo' ? 0 : 1;

        // Agrupar por nome da receita
        if (!receitasMap[nomeReceita]) {
          receitasMap[nomeReceita] = {
            nome: nomeReceita,
            descricao: descricaoReceita,
            tipo_receita_id: tipoReceitaId,
            tipo_receita_nome: tipoReceitaNome,
            filiais: filiaisArray,
            centros_custo: centrosCustoArray,
            status: status,
            produtos: []
          };
        }

        // Adicionar produto à receita
        receitasMap[nomeReceita].produtos.push({
          produto_origem_id: produto.id,
          produto_origem: produto.nome,
          percapta_sugerida: percapta
        });
      }

      if (erros.length > 0 && Object.keys(receitasMap).length === 0) {
        return errorResponse(res, {
          message: 'Erros encontrados na planilha',
          erros: erros
        }, STATUS_CODES.BAD_REQUEST);
      }

      // Processar importação das receitas
      const resultados = {
        importados: 0,
        atualizados: 0,
        erros: [...erros]
      };

      // Buscar informações completas dos produtos do foods_db
      const produtosIds = Array.from(new Set(
        Object.values(receitasMap).flatMap(r => r.produtos.map(p => p.produto_origem_id))
      ));
      
      if (produtosIds.length > 0) {
        try {
          // Buscar informações completas dos produtos do foods_db
          const produtosCompletos = await executeQuery(
            `SELECT 
              po.id,
              po.nome,
              po.codigo,
              g.id as grupo_id,
              g.nome as grupo_nome,
              sg.id as subgrupo_id,
              sg.nome as subgrupo_nome,
              c.id as classe_id,
              c.nome as classe_nome,
              um.id as unidade_medida_id,
              um.sigla as unidade_medida_sigla
            FROM foods_db.produto_origem po
            LEFT JOIN foods_db.grupos g ON po.grupo_id = g.id
            LEFT JOIN foods_db.subgrupos sg ON po.subgrupo_id = sg.id
            LEFT JOIN foods_db.classes c ON po.classe_id = c.id
            LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id
            WHERE po.id IN (${produtosIds.map(() => '?').join(',')})`,
            produtosIds
          );
          
          // Atualizar mapa com informações completas
          produtosCompletos.forEach(produto => {
            produtoMap.set(produto.id.toString().toLowerCase(), produto);
            if (produto.codigo) produtoMap.set(produto.codigo.toString().toLowerCase(), produto);
            if (produto.nome)             produtoMap.set(produto.nome.toLowerCase(), produto);
          });
        } catch (error) {
          // Se não conseguir buscar do foods_db, tentar das receitas existentes
          try {
            const produtosExistentes = await executeQuery(
              `SELECT DISTINCT
                produto_origem_id as id,
                produto_origem as nome,
                grupo_id,
                grupo_nome,
                subgrupo_id,
                subgrupo_nome,
                classe_id,
                classe_nome,
                unidade_medida_id,
                unidade_medida_sigla
              FROM receitas_produtos
              WHERE produto_origem_id IN (${produtosIds.map(() => '?').join(',')})`,
              produtosIds
            );
            
            produtosExistentes.forEach(produto => {
              if (!produtoMap.has(produto.id)) {
                produtoMap.set(produto.id.toString().toLowerCase(), produto);
              }
            });
          } catch (error2) {
            // Ignorar erro silenciosamente
          }
        }
      }

      // Importar cada receita
      for (const nomeReceita in receitasMap) {
        const receitaData = receitasMap[nomeReceita];
        
        try {
          // Verificar se receita já existe (por nome)
          const receitaExistente = await executeQuery(
            'SELECT id FROM receitas WHERE nome = ? LIMIT 1',
            [receitaData.nome]
          );

          if (receitaExistente.length > 0) {
            // Atualizar receita existente
            const receitaId = receitaExistente[0].id;
            
            // Atualizar dados básicos
            await executeQuery(
              `UPDATE receitas SET 
                descricao = ?,
                tipo_receita_id = ?,
                tipo_receita_nome = ?,
                status = ?
              WHERE id = ?`,
              [
                receitaData.descricao,
                receitaData.tipo_receita_id,
                receitaData.tipo_receita_nome,
                receitaData.status,
                receitaId
              ]
            );

            // Limpar relacionamentos existentes
            await executeQuery('DELETE FROM receitas_filiais WHERE receita_id = ?', [receitaId]);
            await executeQuery('DELETE FROM receitas_centros_custo WHERE receita_id = ?', [receitaId]);
            await executeQuery('DELETE FROM receitas_produtos WHERE receita_id = ?', [receitaId]);

            // Inserir novos relacionamentos
            if (receitaData.filiais && receitaData.filiais.length > 0) {
              const filiaisQueries = receitaData.filiais.map(filial => ({
                sql: `INSERT INTO receitas_filiais (receita_id, filial_id, filial_nome) VALUES (?, ?, ?)`,
                params: [receitaId, filial.id, filial.nome || '']
              }));
              await executeTransaction(filiaisQueries);
            }

            if (receitaData.centros_custo && receitaData.centros_custo.length > 0) {
              const centrosCustoQueries = receitaData.centros_custo.map(centro => ({
                sql: `INSERT INTO receitas_centros_custo (receita_id, centro_custo_id, centro_custo_nome, filial_id, filial_nome) VALUES (?, ?, ?, ?, ?)`,
                params: [receitaId, centro.id, centro.nome || '', centro.filial_id || null, centro.filial_nome || null]
              }));
              await executeTransaction(centrosCustoQueries);
            }

            // Inserir produtos
            if (receitaData.produtos.length > 0) {
              const produtosQueries = receitaData.produtos.map(produto => {
                // Buscar informações completas do produto se disponível
                const produtoCompleto = produtoMap.get(produto.produto_origem_id) || 
                                       produtoMap.get(produto.produto_origem?.toLowerCase());
                return {
                  sql: `INSERT INTO receitas_produtos (
                    receita_id,
                    produto_origem,
                    produto_origem_id,
                    grupo_id,
                    grupo_nome,
                    subgrupo_id,
                    subgrupo_nome,
                    classe_id,
                    classe_nome,
                    unidade_medida_id,
                    unidade_medida_sigla,
                    percapta_sugerida
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  params: [
                    receitaId,
                    produto.produto_origem || produtoCompleto?.nome || null,
                    produto.produto_origem_id,
                    produtoCompleto?.grupo_id || null,
                    produtoCompleto?.grupo_nome || null,
                    produtoCompleto?.subgrupo_id || null,
                    produtoCompleto?.subgrupo_nome || null,
                    produtoCompleto?.classe_id || null,
                    produtoCompleto?.classe_nome || null,
                    produtoCompleto?.unidade_medida_id || null,
                    produtoCompleto?.unidade_medida_sigla || null,
                    produto.percapta_sugerida
                  ]
                };
              });
              await executeTransaction(produtosQueries);
            }

            resultados.atualizados++;
          } else {
            // Criar nova receita
            // Gerar código
            const ultimaReceita = await executeQuery(
              'SELECT codigo FROM receitas ORDER BY id DESC LIMIT 1'
            );

            let proximoNumero = 1;
            if (ultimaReceita.length > 0) {
              const ultimoCodigo = ultimaReceita[0].codigo;
              if (ultimoCodigo && ultimoCodigo.startsWith('R')) {
                const numero = parseInt(ultimoCodigo.substring(1));
                if (!isNaN(numero)) {
                  proximoNumero = numero + 1;
                }
              }
            }

            const codigo = `R${proximoNumero.toString().padStart(3, '0')}`;

            // Inserir receita
            const result = await executeQuery(
              `INSERT INTO receitas (
                codigo, nome, descricao, tipo_receita_id, tipo_receita_nome, status
              ) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                codigo,
                receitaData.nome,
                receitaData.descricao,
                receitaData.tipo_receita_id,
                receitaData.tipo_receita_nome,
                receitaData.status
              ]
            );

            const receitaId = result.insertId;

            // Inserir relacionamentos
            if (receitaData.filiais && receitaData.filiais.length > 0) {
              const filiaisQueries = receitaData.filiais.map(filial => ({
                sql: `INSERT INTO receitas_filiais (receita_id, filial_id, filial_nome) VALUES (?, ?, ?)`,
                params: [receitaId, filial.id, filial.nome || '']
              }));
              await executeTransaction(filiaisQueries);
            }

            if (receitaData.centros_custo && receitaData.centros_custo.length > 0) {
              const centrosCustoQueries = receitaData.centros_custo.map(centro => ({
                sql: `INSERT INTO receitas_centros_custo (receita_id, centro_custo_id, centro_custo_nome, filial_id, filial_nome) VALUES (?, ?, ?, ?, ?)`,
                params: [receitaId, centro.id, centro.nome || '', centro.filial_id || null, centro.filial_nome || null]
              }));
              await executeTransaction(centrosCustoQueries);
            }

            // Inserir produtos
            if (receitaData.produtos.length > 0) {
              const produtosQueries = receitaData.produtos.map(produto => {
                // Buscar informações completas do produto se disponível
                const produtoCompleto = produtoMap.get(produto.produto_origem_id) || 
                                       produtoMap.get(produto.produto_origem?.toLowerCase());
                return {
                  sql: `INSERT INTO receitas_produtos (
                    receita_id,
                    produto_origem,
                    produto_origem_id,
                    grupo_id,
                    grupo_nome,
                    subgrupo_id,
                    subgrupo_nome,
                    classe_id,
                    classe_nome,
                    unidade_medida_id,
                    unidade_medida_sigla,
                    percapta_sugerida
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  params: [
                    receitaId,
                    produto.produto_origem || produtoCompleto?.nome || null,
                    produto.produto_origem_id,
                    produtoCompleto?.grupo_id || null,
                    produtoCompleto?.grupo_nome || null,
                    produtoCompleto?.subgrupo_id || null,
                    produtoCompleto?.subgrupo_nome || null,
                    produtoCompleto?.classe_id || null,
                    produtoCompleto?.classe_nome || null,
                    produtoCompleto?.unidade_medida_id || null,
                    produtoCompleto?.unidade_medida_sigla || null,
                    produto.percapta_sugerida
                  ]
                };
              });
              await executeTransaction(produtosQueries);
            }

            resultados.importados++;
          }
        } catch (error) {
          console.error(`Erro ao processar receita "${nomeReceita}":`, error);
          resultados.erros.push(`Receita "${nomeReceita}": ${error.message}`);
        }
      }

      return successResponse(res, resultados, 'Importação concluída', STATUS_CODES.OK);

    } catch (error) {
      console.error('Erro na importação:', error);
      return errorResponse(res, `Erro na importação: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  });
}

module.exports = {
  ReceitasImportController,
  upload: upload.single('file')
};

