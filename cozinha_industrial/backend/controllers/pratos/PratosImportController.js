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
 * Controller para importação de Pratos
 * Implementa importação via planilha Excel seguindo padrão do sistema
 */
class PratosImportController {
  /**
   * Gerar e baixar modelo de planilha para importação
   */
  static baixarModelo = asyncHandler(async (req, res) => {
    try {
      // Buscar alguns dados de referência para exemplo
      const tiposPratos = await executeQuery('SELECT id, tipo_prato FROM tipos_pratos WHERE status = 1 LIMIT 5');
      
      // Buscar filiais diretamente do foods_db ou das tabelas relacionais
      let filiaisExistentes = [];
      try {
        filiaisExistentes = await executeQuery('SELECT id, filial as nome FROM foods_db.filiais WHERE status = 1 LIMIT 5');
      } catch (error) {
        filiaisExistentes = await executeQuery('SELECT DISTINCT filial_id as id, filial_nome as nome FROM pratos_filiais LIMIT 5');
      }
      
      // Buscar centros de custo diretamente do foods_db ou das tabelas relacionais
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
          LIMIT 5
        `);
      } catch (error) {
        centrosCustoExistentes = await executeQuery('SELECT DISTINCT centro_custo_id as id, centro_custo_nome as nome FROM pratos_centros_custo LIMIT 5');
      }
      
      // Buscar receitas existentes
      const receitasExistentes = await executeQuery('SELECT id, codigo, nome FROM receitas WHERE status = 1 LIMIT 5');
      
      // Buscar produtos diretamente do foods_db
      let produtosExistentes = [];
      try {
        produtosExistentes = await executeQuery('SELECT id, nome, codigo FROM foods_db.produto_origem WHERE status = 1 LIMIT 5');
      } catch (error) {
        produtosExistentes = await executeQuery('SELECT DISTINCT produto_origem_id as id, produto_origem_nome as nome FROM produtos_pratos LIMIT 5');
      }

      // Criar workbook
      const workbook = new ExcelJS.Workbook();
      
      // Única aba com todas as informações (Prato + Receitas + Produtos)
      const worksheet = workbook.addWorksheet('Pratos');
      
      // Definir colunas: dados do prato + dados das receitas + dados dos produtos
      worksheet.columns = [
        // Dados do Prato
        { header: 'Nome Prato', key: 'nome_prato', width: 30 },
        { header: 'Descrição Prato', key: 'descricao_prato', width: 40 },
        { header: 'Tipo de Prato', key: 'tipo_prato', width: 25 },
        { header: 'Filiais (separadas por vírgula)', key: 'filiais', width: 40 },
        { header: 'Centros de Custo (separados por vírgula)', key: 'centros_custo', width: 40 },
        { header: 'Status (Ativo/Inativo)', key: 'status', width: 15 },
        // Dados da Receita
        { header: 'Código Receita', key: 'codigo_receita', width: 20 },
        { header: 'Nome Receita', key: 'nome_receita', width: 40 },
        // Dados do Produto
        { header: 'Código Produto', key: 'codigo_produto', width: 20 },
        { header: 'Nome Produto', key: 'nome_produto', width: 40 },
        { header: 'Centro de Custo do Produto', key: 'centro_custo_produto', width: 30 },
        { header: 'Percapta', key: 'percapta', width: 18 }
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
          nome_prato: 'PRATO EXEMPLO 1',
          descricao_prato: 'Descrição do prato exemplo',
          tipo_prato: tiposPratos[0]?.tipo_prato || 'TIPO EXEMPLO',
          filiais: filiaisExistentes[0]?.nome || 'FILIAL EXEMPLO',
          centros_custo: centrosCustoExistentes[0]?.nome || 'CENTRO DE CUSTO EXEMPLO',
          status: 'Ativo',
          codigo_receita: receitasExistentes[0]?.codigo || 'R001',
          nome_receita: receitasExistentes[0]?.nome || 'RECEITA EXEMPLO',
          codigo_produto: produtosExistentes[0]?.codigo || produtosExistentes[0]?.id?.toString() || '',
          nome_produto: produtosExistentes[0]?.nome || 'Produto Exemplo 1',
          centro_custo_produto: centrosCustoExistentes[0]?.nome || 'CENTRO DE CUSTO EXEMPLO',
          percapta: '0,050'
        },
        {
          nome_prato: 'PRATO EXEMPLO 1',
          descricao_prato: 'Descrição do prato exemplo',
          tipo_prato: tiposPratos[0]?.tipo_prato || 'TIPO EXEMPLO',
          filiais: filiaisExistentes[0]?.nome || 'FILIAL EXEMPLO',
          centros_custo: centrosCustoExistentes[0]?.nome || 'CENTRO DE CUSTO EXEMPLO',
          status: 'Ativo',
          codigo_receita: receitasExistentes[0]?.codigo || 'R001',
          nome_receita: receitasExistentes[0]?.nome || 'RECEITA EXEMPLO',
          codigo_produto: produtosExistentes[1]?.codigo || produtosExistentes[1]?.id?.toString() || '',
          nome_produto: produtosExistentes[1]?.nome || 'Produto Exemplo 2',
          centro_custo_produto: centrosCustoExistentes[0]?.nome || 'CENTRO DE CUSTO EXEMPLO',
          percapta: '0,030'
        }
      ];

      exemploLinhas.forEach(linha => {
        worksheet.addRow(linha);
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="modelo_pratos.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao gerar modelo:', error);
      return errorResponse(res, 'Erro ao gerar modelo de planilha', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  });

  /**
   * Importar pratos via Excel
   */
  static importar = asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return errorResponse(res, 'Nenhum arquivo enviado', STATUS_CODES.BAD_REQUEST);
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      
      // Ler única aba
      let worksheet = workbook.getWorksheet('Pratos');
      if (!worksheet) {
        // Tentar usar a primeira aba se "Pratos" não existir
        const firstWorksheet = workbook.worksheets[0];
        if (!firstWorksheet) {
          return errorResponse(res, 'Nenhuma aba encontrada na planilha', STATUS_CODES.BAD_REQUEST);
        }
        worksheet = firstWorksheet;
      }

      const pratosMap = {}; // Agrupar por nome do prato
      const erros = [];

      // Buscar dados de referência
      const tiposPratos = await executeQuery('SELECT id, tipo_prato FROM tipos_pratos WHERE status = 1');
      
      // Buscar filiais diretamente do foods_db
      let filiaisExistentes = [];
      try {
        filiaisExistentes = await executeQuery('SELECT id, filial as nome FROM foods_db.filiais WHERE status = 1');
      } catch (error) {
        filiaisExistentes = await executeQuery('SELECT DISTINCT filial_id as id, filial_nome as nome FROM pratos_filiais');
      }
      
      // Buscar centros de custo diretamente do foods_db
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
        centrosCustoExistentes = await executeQuery('SELECT DISTINCT centro_custo_id as id, centro_custo_nome as nome, filial_id, filial_nome FROM pratos_centros_custo');
      }

      // Buscar receitas existentes
      const receitasExistentes = await executeQuery('SELECT id, codigo, nome FROM receitas WHERE status = 1');

      // Buscar produtos do foods_db
      let produtosExistentes = [];
      try {
        produtosExistentes = await executeQuery('SELECT id, nome, codigo FROM foods_db.produto_origem WHERE status = 1');
      } catch (error) {
        produtosExistentes = await executeQuery('SELECT DISTINCT produto_origem_id as id, produto_origem_nome as nome FROM produtos_pratos');
      }

      // Criar maps para busca rápida
      const tipoPratoMap = new Map(tiposPratos.map(tp => [tp.tipo_prato.toLowerCase(), tp.id]));
      
      const filialMap = new Map(filiaisExistentes.map(f => [f.nome.toLowerCase(), { id: f.id, nome: f.nome }]));
      
      const centroCustoMap = new Map();
      centrosCustoExistentes.forEach(cc => {
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
      
      // Mapa de receitas (por código e nome)
      const receitaMap = new Map();
      receitasExistentes.forEach(r => {
        if (r.codigo) receitaMap.set(r.codigo.toLowerCase(), { id: r.id, codigo: r.codigo, nome: r.nome });
        if (r.nome) receitaMap.set(r.nome.toLowerCase(), { id: r.id, codigo: r.codigo, nome: r.nome });
      });
      
      // Mapa de produtos
      const produtoMap = new Map();
      produtosExistentes.forEach(p => {
        if (p.id) produtoMap.set(p.id.toString().toLowerCase(), { id: p.id, nome: p.nome || p.produto_origem_nome, codigo: p.codigo });
        if (p.codigo) produtoMap.set(p.codigo.toString().toLowerCase(), { id: p.id, nome: p.nome || p.produto_origem_nome, codigo: p.codigo });
        if (p.nome) produtoMap.set(p.nome.toLowerCase(), { id: p.id, nome: p.nome, codigo: p.codigo });
        if (p.produto_origem_nome && p.produto_origem_nome !== p.nome) {
          produtoMap.set(p.produto_origem_nome.toLowerCase(), { id: p.id, nome: p.produto_origem_nome, codigo: p.codigo });
        }
      });

      // Processar cada linha da planilha
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        if (!row || !row.values) {
          continue;
        }

        const valores = row.values;
        if (!valores || valores.length < 12) {
          continue;
        }
        
        // Dados do Prato
        const nomePrato = valores[1]?.toString().trim();
        const descricaoPrato = valores[2]?.toString().trim() || null;
        const tipoPratoNome = valores[3]?.toString().trim();
        const filiaisStr = valores[4]?.toString().trim() || '';
        const centrosCustoStr = valores[5]?.toString().trim() || '';
        const statusStr = valores[6]?.toString().trim() || 'Ativo';
        // Dados da Receita
        const codigoReceita = valores[7]?.toString().trim();
        const nomeReceita = valores[8]?.toString().trim();
        // Dados do Produto
        const codigoProduto = valores[9]?.toString().trim();
        const nomeProduto = valores[10]?.toString().trim();
        const centroCustoProdutoNome = valores[11]?.toString().trim();
        const percaptaStr = valores[12]?.toString().trim() || '0';

        // Validações básicas
        if (!nomePrato) {
          erros.push(`Linha ${rowNumber}: Nome do prato é obrigatório`);
          continue;
        }

        if (!codigoReceita && !nomeReceita) {
          erros.push(`Linha ${rowNumber}: Código ou Nome da receita é obrigatório`);
          continue;
        }

        if (!codigoProduto && !nomeProduto) {
          erros.push(`Linha ${rowNumber}: Código ou Nome do produto é obrigatório`);
          continue;
        }

        // Buscar receita
        const receita = receitaMap.get(codigoReceita?.toLowerCase()) || 
                       receitaMap.get(nomeReceita?.toLowerCase());
        
        if (!receita) {
          erros.push(`Linha ${rowNumber}: Receita "${codigoReceita || nomeReceita}" não encontrada no sistema`);
          continue;
        }

        // Buscar produto
        const produto = produtoMap.get(codigoProduto?.toLowerCase()) || 
                       produtoMap.get(nomeProduto?.toLowerCase());
        
        if (!produto) {
          erros.push(`Linha ${rowNumber}: Produto "${codigoProduto || nomeProduto}" não encontrado no sistema`);
          continue;
        }

        // Buscar tipo de prato
        const tipoPratoId = tipoPratoNome ? tipoPratoMap.get(tipoPratoNome.toLowerCase()) : null;
        if (tipoPratoNome && !tipoPratoId) {
          erros.push(`Linha ${rowNumber}: Tipo de prato "${tipoPratoNome}" não encontrado no sistema`);
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

        // Buscar centro de custo do produto
        let centroCustoProduto = null;
        if (centroCustoProdutoNome) {
          centroCustoProduto = centroCustoMap.get(centroCustoProdutoNome.toLowerCase());
          if (!centroCustoProduto) {
            erros.push(`Linha ${rowNumber}: Centro de custo do produto "${centroCustoProdutoNome}" não encontrado no sistema`);
            continue;
          }
        }

        // Processar percapita (trocar vírgula por ponto)
        const percapta = parseFloat(percaptaStr.replace(',', '.')) || 0;

        // Status
        const status = statusStr.toLowerCase() === 'inativo' ? 0 : 1;

        // Agrupar por nome do prato
        if (!pratosMap[nomePrato]) {
          pratosMap[nomePrato] = {
            nome: nomePrato,
            descricao: descricaoPrato,
            tipo_prato_id: tipoPratoId,
            tipo_prato_nome: tipoPratoNome,
            filiais: filiaisArray,
            centros_custo: centrosCustoArray,
            status: status,
            receitas: [],
            produtos: []
          };
        }

        // Adicionar receita se ainda não existe
        const receitaExiste = pratosMap[nomePrato].receitas.find(r => r.id === receita.id);
        if (!receitaExiste) {
          pratosMap[nomePrato].receitas.push({
            id: receita.id,
            codigo: receita.codigo,
            nome: receita.nome
          });
        }

        // Adicionar produto à receita e centro de custo
        pratosMap[nomePrato].produtos.push({
          receita_id: receita.id,
          produto_origem_id: produto.id,
          produto_origem_nome: produto.nome,
          centro_custo_id: centroCustoProduto?.id || null,
          centro_custo_nome: centroCustoProduto?.nome || null,
          percapta: percapta
        });
      }

      if (erros.length > 0 && Object.keys(pratosMap).length === 0) {
        return errorResponse(res, {
          message: 'Erros encontrados na planilha',
          erros: erros
        }, STATUS_CODES.BAD_REQUEST);
      }

      // Processar importação dos pratos
      const resultados = {
        importados: 0,
        atualizados: 0,
        erros: [...erros]
      };

      // Buscar informações completas dos produtos do foods_db
      const produtosIds = Array.from(new Set(
        Object.values(pratosMap).flatMap(p => p.produtos.map(prod => prod.produto_origem_id))
      ));
      
      if (produtosIds.length > 0) {
        try {
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
            if (produto.nome) produtoMap.set(produto.nome.toLowerCase(), produto);
          });
        } catch (error) {
          try {
            const produtosExistentes = await executeQuery(
              `SELECT DISTINCT
                produto_origem_id as id,
                produto_origem_nome as nome,
                grupo_id,
                grupo_nome,
                subgrupo_id,
                subgrupo_nome,
                classe_id,
                classe_nome,
                unidade_medida_id,
                unidade_medida_sigla
              FROM produtos_pratos
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

      // Importar cada prato
      for (const nomePrato in pratosMap) {
        const pratoData = pratosMap[nomePrato];
        
        try {
          // Verificar se prato já existe (por nome)
          const pratoExistente = await executeQuery(
            'SELECT id FROM pratos WHERE nome = ? LIMIT 1',
            [pratoData.nome]
          );

          if (pratoExistente.length > 0) {
            // Atualizar prato existente
            const pratoId = pratoExistente[0].id;
            
            // Atualizar dados básicos
            await executeQuery(
              `UPDATE pratos SET 
                descricao = ?,
                tipo_prato_id = ?,
                tipo_prato_nome = ?,
                status = ?
              WHERE id = ?`,
              [
                pratoData.descricao,
                pratoData.tipo_prato_id,
                pratoData.tipo_prato_nome,
                pratoData.status,
                pratoId
              ]
            );

            // Limpar relacionamentos existentes
            await executeQuery('DELETE FROM pratos_filiais WHERE prato_id = ?', [pratoId]);
            await executeQuery('DELETE FROM pratos_centros_custo WHERE prato_id = ?', [pratoId]);
            await executeQuery('DELETE FROM pratos_receitas WHERE prato_id = ?', [pratoId]);
            await executeQuery('DELETE FROM produtos_pratos WHERE prato_id = ?', [pratoId]);

            // Inserir novos relacionamentos
            if (pratoData.filiais && pratoData.filiais.length > 0) {
              const filiaisQueries = pratoData.filiais.map(filial => ({
                sql: `INSERT INTO pratos_filiais (prato_id, filial_id, filial_nome) VALUES (?, ?, ?)`,
                params: [pratoId, filial.id, filial.nome || '']
              }));
              await executeTransaction(filiaisQueries);
            }

            if (pratoData.centros_custo && pratoData.centros_custo.length > 0) {
              const centrosCustoQueries = pratoData.centros_custo.map(centro => ({
                sql: `INSERT INTO pratos_centros_custo (prato_id, centro_custo_id, centro_custo_nome, filial_id, filial_nome) VALUES (?, ?, ?, ?, ?)`,
                params: [pratoId, centro.id, centro.nome || '', centro.filial_id || null, centro.filial_nome || null]
              }));
              await executeTransaction(centrosCustoQueries);
            }

            if (pratoData.receitas && pratoData.receitas.length > 0) {
              const receitasQueries = pratoData.receitas.map(receita => ({
                sql: `INSERT INTO pratos_receitas (prato_id, receita_id, receita_codigo, receita_nome) VALUES (?, ?, ?, ?)`,
                params: [pratoId, receita.id, receita.codigo || null, receita.nome || null]
              }));
              await executeTransaction(receitasQueries);
            }

            // Inserir produtos
            if (pratoData.produtos.length > 0) {
              const produtosQueries = pratoData.produtos.map(produto => {
                const produtoCompleto = produtoMap.get(produto.produto_origem_id) || 
                                       produtoMap.get(produto.produto_origem_nome?.toLowerCase());
                return {
                  sql: `INSERT INTO produtos_pratos (
                    prato_id,
                    receita_id,
                    produto_origem_id,
                    produto_origem_nome,
                    grupo_id,
                    grupo_nome,
                    subgrupo_id,
                    subgrupo_nome,
                    classe_id,
                    classe_nome,
                    unidade_medida_id,
                    unidade_medida_sigla,
                    centro_custo_id,
                    centro_custo_nome,
                    percapta
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  params: [
                    pratoId,
                    produto.receita_id,
                    produto.produto_origem_id,
                    produto.produto_origem_nome || produtoCompleto?.nome || null,
                    produtoCompleto?.grupo_id || null,
                    produtoCompleto?.grupo_nome || null,
                    produtoCompleto?.subgrupo_id || null,
                    produtoCompleto?.subgrupo_nome || null,
                    produtoCompleto?.classe_id || null,
                    produtoCompleto?.classe_nome || null,
                    produtoCompleto?.unidade_medida_id || null,
                    produtoCompleto?.unidade_medida_sigla || null,
                    produto.centro_custo_id,
                    produto.centro_custo_nome,
                    produto.percapta
                  ]
                };
              });
              await executeTransaction(produtosQueries);
            }

            resultados.atualizados++;
          } else {
            // Criar novo prato
            // Gerar código
            const ultimoPrato = await executeQuery(
              'SELECT codigo FROM pratos ORDER BY id DESC LIMIT 1'
            );

            let proximoNumero = 1;
            if (ultimoPrato.length > 0) {
              const ultimoCodigo = ultimoPrato[0].codigo;
              if (ultimoCodigo && ultimoCodigo.startsWith('P')) {
                const numero = parseInt(ultimoCodigo.substring(1));
                if (!isNaN(numero)) {
                  proximoNumero = numero + 1;
                }
              }
            }

            const codigo = `P${proximoNumero.toString().padStart(3, '0')}`;

            // Inserir prato
            const result = await executeQuery(
              `INSERT INTO pratos (
                codigo, nome, descricao, tipo_prato_id, tipo_prato_nome, status
              ) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                codigo,
                pratoData.nome,
                pratoData.descricao,
                pratoData.tipo_prato_id,
                pratoData.tipo_prato_nome,
                pratoData.status
              ]
            );

            const pratoId = result.insertId;

            // Inserir relacionamentos
            if (pratoData.filiais && pratoData.filiais.length > 0) {
              const filiaisQueries = pratoData.filiais.map(filial => ({
                sql: `INSERT INTO pratos_filiais (prato_id, filial_id, filial_nome) VALUES (?, ?, ?)`,
                params: [pratoId, filial.id, filial.nome || '']
              }));
              await executeTransaction(filiaisQueries);
            }

            if (pratoData.centros_custo && pratoData.centros_custo.length > 0) {
              const centrosCustoQueries = pratoData.centros_custo.map(centro => ({
                sql: `INSERT INTO pratos_centros_custo (prato_id, centro_custo_id, centro_custo_nome, filial_id, filial_nome) VALUES (?, ?, ?, ?, ?)`,
                params: [pratoId, centro.id, centro.nome || '', centro.filial_id || null, centro.filial_nome || null]
              }));
              await executeTransaction(centrosCustoQueries);
            }

            if (pratoData.receitas && pratoData.receitas.length > 0) {
              const receitasQueries = pratoData.receitas.map(receita => ({
                sql: `INSERT INTO pratos_receitas (prato_id, receita_id, receita_codigo, receita_nome) VALUES (?, ?, ?, ?)`,
                params: [pratoId, receita.id, receita.codigo || null, receita.nome || null]
              }));
              await executeTransaction(receitasQueries);
            }

            // Inserir produtos
            if (pratoData.produtos.length > 0) {
              const produtosQueries = pratoData.produtos.map(produto => {
                const produtoCompleto = produtoMap.get(produto.produto_origem_id) || 
                                       produtoMap.get(produto.produto_origem_nome?.toLowerCase());
                return {
                  sql: `INSERT INTO produtos_pratos (
                    prato_id,
                    receita_id,
                    produto_origem_id,
                    produto_origem_nome,
                    grupo_id,
                    grupo_nome,
                    subgrupo_id,
                    subgrupo_nome,
                    classe_id,
                    classe_nome,
                    unidade_medida_id,
                    unidade_medida_sigla,
                    centro_custo_id,
                    centro_custo_nome,
                    percapta
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  params: [
                    pratoId,
                    produto.receita_id,
                    produto.produto_origem_id,
                    produto.produto_origem_nome || produtoCompleto?.nome || null,
                    produtoCompleto?.grupo_id || null,
                    produtoCompleto?.grupo_nome || null,
                    produtoCompleto?.subgrupo_id || null,
                    produtoCompleto?.subgrupo_nome || null,
                    produtoCompleto?.classe_id || null,
                    produtoCompleto?.classe_nome || null,
                    produtoCompleto?.unidade_medida_id || null,
                    produtoCompleto?.unidade_medida_sigla || null,
                    produto.centro_custo_id,
                    produto.centro_custo_nome,
                    produto.percapta
                  ]
                };
              });
              await executeTransaction(produtosQueries);
            }

            resultados.importados++;
          }
        } catch (error) {
          console.error(`Erro ao processar prato "${nomePrato}":`, error);
          resultados.erros.push(`Prato "${nomePrato}": ${error.message}`);
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
  PratosImportController,
  upload: upload.single('file')
};

