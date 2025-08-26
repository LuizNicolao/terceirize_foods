const { executeQuery } = require('../../config/database');
const CotacoesAnaliseController = require('./CotacoesAnaliseController');
const CotacoesExportController = require('./CotacoesExportController');
const CotacoesStatsController = require('./CotacoesStatsController');
const { AnexosController } = require('./AnexosController');

class CotacoesController {
  // GET /api/cotacoes - Listar cotações
  static async getCotacoes(req, res) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let params = [];

      // Filtro baseado no papel do usuário
      if (req.user.role !== 'administrador') {
        whereConditions.push('c.comprador = ?');
        params.push(req.user.name);
      }

      if (search) {
        whereConditions.push('(c.comprador LIKE ? OR c.local_entrega LIKE ? OR c.justificativa LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status && status !== 'todos') {
        whereConditions.push('c.status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Query para buscar cotações
      const query = `
        SELECT 
          c.id as numero,
          c.local_entrega as titulo,
          c.comprador as solicitante,
          c.tipo_compra,
          c.motivo_emergencial,
          c.justificativa,
          c.motivo_final,
          c.status,
          c.data_criacao,
          c.data_atualizacao,
          c.total_produtos,
          c.produtos_duplicados,
          c.total_quantidade,
          c.total_fornecedores
        FROM cotacoes c
        ${whereClause}
        ORDER BY c.data_criacao DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;

      const cotacoes = await executeQuery(query, params);

      // Contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total
        FROM cotacoes c
        ${whereClause}
      `;

      const [{ total }] = await executeQuery(countQuery, params);

      res.json(cotacoes);
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }

  // GET /api/cotacoes/:id - Buscar cotação por ID
  static async getCotacao(req, res) {
    try {
      const { id } = req.params;

      // Primeiro, verificar se a cotação existe e qual seu status
      let cotacaoQuery = `
        SELECT 
          c.*
        FROM cotacoes c
        WHERE c.id = ?
      `;
      let queryParams = [id];

      // Adicionar filtro de segurança para usuários não administradores
      if (req.user.role !== 'administrador') {
        cotacaoQuery += ' AND c.comprador = ?';
        queryParams.push(req.user.name);
      }

      const [cotacao] = await executeQuery(cotacaoQuery, queryParams);

      if (!cotacao) {
        // Se não encontrar na tabela cotacoes, verificar se está na tabela saving (aprovada)
        const savingQuery = `
          SELECT 
            s.cotacao_id as id,
            s.usuario_id,
            s.data_registro as data_criacao,
            s.data_aprovacao as data_atualizacao,
            s.valor_total_inicial,
            s.valor_total_final,
            s.economia,
            s.economia_percentual,
            s.rodadas,
            s.status,
            s.observacoes as justificativa,
            s.tipo as tipo_compra,
            s.motivo_emergencial,
            s.centro_distribuicao as local_entrega,
            u.name as comprador
          FROM saving s
          JOIN users u ON s.usuario_id = u.id
          WHERE s.cotacao_id = ?
        `;
        
        const [savingCotacao] = await executeQuery(savingQuery, [id]);
        
        if (savingCotacao) {
          // Cotação aprovada - buscar dados da tabela saving
          return await this.getCotacaoAprovada(req, res, savingCotacao);
        }
        
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }

      // Buscar produtos únicos da cotação (baseado nos produtos dos fornecedores)
      const produtosQuery = `
        SELECT DISTINCT
          fp.nome,
          fp.qtde,
          fp.un,
          fp.prazo_entrega,
          fp.produto_id as id
        FROM produtos_fornecedores fp
        INNER JOIN fornecedores f ON fp.fornecedor_id = f.id
        WHERE f.cotacao_id = ?
        ORDER BY fp.nome
      `;

      const produtos = await executeQuery(produtosQuery, [id]);

      // Buscar fornecedores da cotação
      const fornecedoresQuery = `
        SELECT 
          f.id,
          f.nome,
          f.fornecedor_id,
          f.tipo_frete,
          f.valor_frete,
          f.prazo_pagamento,
          f.frete
        FROM fornecedores f
        WHERE f.cotacao_id = ?
        ORDER BY f.nome
      `;

      const fornecedores = await executeQuery(fornecedoresQuery, [id]);

      // Para cada fornecedor, buscar seus produtos
      for (let fornecedor of fornecedores) {
        const produtosFornecedorQuery = `
          SELECT 
            pf.id,
            pf.nome as produto_nome,
            pf.qtde as quantidade,
            pf.un as unidade,
            pf.prazo_entrega,
            pf.ult_valor_aprovado,
            pf.ult_fornecedor_aprovado,
            pf.valor_anterior,
            pf.valor_unitario,
            pf.primeiro_valor,
            pf.difal,
            pf.ipi,
            pf.data_entrega_fn,
            pf.total
          FROM produtos_fornecedores pf
          WHERE pf.fornecedor_id = ?
          ORDER BY pf.nome
        `;

        fornecedor.produtos = await executeQuery(produtosFornecedorQuery, [fornecedor.id]);
      }

      // Montar resposta
      const response = {
        cotacao,
        produtos,
        fornecedores
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Método auxiliar para buscar cotação aprovada da tabela saving
  static async getCotacaoAprovada(req, res, savingCotacao) {
    try {
      // Buscar itens da cotação aprovada
      const itensQuery = `
        SELECT 
          si.id,
          si.descricao as produto_nome,
          si.quantidade,
          si.unidade,
          si.prazo_entrega,
          si.valor_unitario_inicial,
          si.valor_unitario_final,
          si.economia,
          si.economia_percentual,
          si.fornecedor,
          si.status,
          si.prazo_entrega,
          si.data_entrega_fn,
          si.frete,
          si.difal,
          si.prazo_pagamento
        FROM saving_itens si
        WHERE si.saving_id = (SELECT id FROM saving WHERE cotacao_id = ?)
        ORDER BY si.descricao
      `;

      const itens = await executeQuery(itensQuery, [savingCotacao.id]);

      // Agrupar itens por fornecedor
      const fornecedores = {};
      itens.forEach(item => {
        if (!fornecedores[item.fornecedor]) {
          fornecedores[item.fornecedor] = {
            id: null,
            nome: item.fornecedor,
            fornecedor_id: null,
            tipo_frete: null,
            valor_frete: item.frete || 0,
            prazo_pagamento: item.prazo_pagamento,
            frete: item.frete || 0,
            produtos: []
          };
        }
        fornecedores[item.fornecedor].produtos.push(item);
      });

      // Montar resposta para cotação aprovada
      const response = {
        cotacao: {
          ...savingCotacao,
          status: 'aprovada' // Garantir que o status seja aprovada
        },
        produtos: itens.map(item => ({
          nome: item.produto_nome,
          qtde: item.quantidade,
          un: item.unidade,
          prazo_entrega: item.prazo_entrega,
          id: item.id
        })),
        fornecedores: Object.values(fornecedores)
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao buscar cotação aprovada:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // POST /api/cotacoes - Criar cotação
  static async createCotacao(req, res) {
    try {
      const { 
        comprador, 
        local_entrega, 
        tipo_compra, 
        motivo_emergencial, 
        justificativa,
        fornecedores,
        produtos
      } = req.body;

      const query = `
        INSERT INTO cotacoes (
          comprador, local_entrega, tipo_compra, motivo_emergencial,
          justificativa, status, data_criacao
        ) VALUES (?, ?, ?, ?, ?, 'pendente', NOW())
      `;

      const result = await executeQuery(query, [
        comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa
      ]);

      const cotacaoId = result.insertId;

      // Processar fornecedores se fornecidos
      if (fornecedores && Array.isArray(fornecedores)) {
        for (const fornecedor of fornecedores) {
          // Inserir fornecedor
          const fornecedorQuery = `
            INSERT INTO fornecedores (
              cotacao_id, fornecedor_id, nome, tipo_frete, valor_frete, prazo_pagamento, frete
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          

          
          const fornecedorResult = await executeQuery(fornecedorQuery, [
            cotacaoId, 
            fornecedor.fornecedor_id || fornecedor.cnpj || fornecedor.id, 
            fornecedor.nome || 'Fornecedor',
            fornecedor.tipoFrete || null, 
            fornecedor.valorFrete || 0,
            fornecedor.prazoPagamento || null, 
            fornecedor.frete || null
          ]);
          
          const fornecedorDbId = fornecedorResult.insertId;
          
          // Inserir produtos do fornecedor
          if (fornecedor.produtos && Array.isArray(fornecedor.produtos)) {
            for (const produto of fornecedor.produtos) {
              const produtoQuery = `
                INSERT INTO produtos_fornecedores (
                  fornecedor_id, produto_id, nome, qtde, un, prazo_entrega,
                  ult_valor_aprovado, ult_fornecedor_aprovado, valor_anterior,
                  valor_unitario, primeiro_valor, difal, ipi, data_entrega_fn, total
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              
              await executeQuery(produtoQuery, [
                fornecedorDbId, 
                produto.produto_id || produto.id, 
                produto.nome || '', 
                produto.qtde || 0,
                produto.un || '', 
                produto.prazoEntrega || produto.prazo_entrega || null, 
                produto.ultimoValorAprovado || produto.ult_valor_aprovado || null,
                produto.ultimoFornecedorAprovado || produto.ult_fornecedor_aprovado || null,
                produto.valorAnterior || produto.valor_anterior || null,
                produto.valorUnitario || produto.valor_unitario || 0,
                produto.primeiroValor || produto.primeiro_valor || produto.valorUnitario || produto.valor_unitario || 0,
                produto.difal || 0,
                produto.ipi || 0,
                produto.dataEntregaFn || produto.data_entrega_fn || null,
                produto.total || 0
              ]);
            }
          }
        }
      }

      res.status(201).json({
        message: 'Cotação criada com sucesso',
        data: { id: cotacaoId }
      });
    } catch (error) {
      console.error('Erro ao criar cotação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // PUT /api/cotacoes/:id - Atualizar cotação
  static async updateCotacao(req, res) {
    try {
      const { id } = req.params;
      const { 
        comprador, 
        localEntrega, 
        tipoCompra, 
        motivoEmergencial, 
        justificativa, 
        motivoFinal,
        status,
        fornecedores 
      } = req.body;

      // Verificar se a cotação existe e se o usuário tem permissão para editá-la
      let cotacaoQuery = `
        SELECT id, comprador FROM cotacoes WHERE id = ?
      `;
      let queryParams = [id];

      // Adicionar filtro de segurança para usuários não administradores
      if (req.user.role !== 'administrador') {
        cotacaoQuery += ' AND comprador = ?';
        queryParams.push(req.user.name);
      }

      const [cotacao] = await executeQuery(cotacaoQuery, queryParams);

      if (!cotacao) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }

      // Atualizar dados básicos da cotação
      const updateCotacaoQuery = `
        UPDATE cotacoes 
        SET comprador = ?, local_entrega = ?, tipo_compra = ?, 
            motivo_emergencial = ?, justificativa = ?, motivo_final = ?,
            status = COALESCE(?, status), data_atualizacao = NOW()
        WHERE id = ?
      `;

      const cotacaoResult = await executeQuery(updateCotacaoQuery, [
        comprador || '', 
        localEntrega || '', 
        tipoCompra || '', 
        motivoEmergencial || '',
        justificativa || '', 
        motivoFinal || '',
        status || null,
        id
      ]);

      if (cotacaoResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }

      // Processar fornecedores se fornecidos
      if (fornecedores && Array.isArray(fornecedores)) {
        for (const fornecedor of fornecedores) {
          // Verificar se é um fornecedor novo (sem ID numérico) ou existente
          const isNewFornecedor = !fornecedor.id || fornecedor.id.toString().startsWith('forn_');
          
          let fornecedorDbId;
          
          if (isNewFornecedor) {
            // Inserir novo fornecedor
            const fornecedorQuery = `
              INSERT INTO fornecedores (
                cotacao_id, fornecedor_id, nome, tipo_frete, valor_frete, prazo_pagamento, frete
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const fornecedorResult = await executeQuery(fornecedorQuery, [
              id, 
              fornecedor.fornecedor_id || null, 
              fornecedor.nome || '',
              fornecedor.tipoFrete || null, 
              fornecedor.valorFrete || 0,
              fornecedor.prazoPagamento || null, 
              fornecedor.frete || null
            ]);
            
            fornecedorDbId = fornecedorResult.insertId;
            
            // Inserir produtos do novo fornecedor
            if (fornecedor.produtos && Array.isArray(fornecedor.produtos)) {
              for (const produto of fornecedor.produtos) {
                const produtoQuery = `
                  INSERT INTO produtos_fornecedores (
                    fornecedor_id, produto_id, nome, qtde, un, prazo_entrega,
                    ult_valor_aprovado, ult_fornecedor_aprovado, valor_anterior,
                    valor_unitario, primeiro_valor, difal, ipi, data_entrega_fn, total
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                const produtoResult = await executeQuery(produtoQuery, [
                  fornecedorDbId, 
                  produto.produto_id || produto.id, 
                  produto.nome || '', 
                  produto.qtde || 0,
                  produto.un || '', 
                  produto.prazoEntrega || produto.prazo_entrega || null, 
                  produto.ultValorAprovado || produto.ult_valor_aprovado || null,
                  produto.ultFornecedorAprovado || produto.ult_fornecedor_aprovado || null, 
                  produto.valorAnterior || produto.valor_anterior || 0,
                  produto.valorUnitario || produto.valor_unitario || 0, 
                  produto.valorUnitario || produto.valor_unitario || 0,
                  produto.difal || 0, 
                  produto.ipi || 0,
                  produto.dataEntregaFn || produto.data_entrega_fn || null, 
                  produto.total || 0
                ]);

                // Validar anexo obrigatório para novo fornecedor
                await AnexosController.validarAnexos({
                  params: { id },
                  body: {
                    fornecedor_id: fornecedorDbId,
                    produto_id: produtoResult.insertId,
                    valor_anterior: 0,
                    valor_novo: produto.valorUnitario || produto.valor_unitario || 0
                  }
                }, { json: () => {} });
              }
            }
          } else {
            // Atualizar fornecedor existente
            const updateFornecedorQuery = `
              UPDATE fornecedores SET
                nome = ?,
                tipo_frete = ?,
                valor_frete = ?,
                prazo_pagamento = ?,
                frete = ?
              WHERE id = ?
            `;
            
            const updateResult = await executeQuery(updateFornecedorQuery, [
              fornecedor.nome || '',
              fornecedor.tipoFrete || null,
              fornecedor.valorFrete || 0,
              fornecedor.prazoPagamento || null,
              fornecedor.frete || null,
              fornecedor.id
            ]);

            fornecedorDbId = fornecedor.id;
            
            // Atualizar produtos do fornecedor existente
            if (fornecedor.produtos && Array.isArray(fornecedor.produtos)) {
              for (const produto of fornecedor.produtos) {
                const produtoFornecedorId = produto.id;
                
                if (produtoFornecedorId) {
                  // Verificar se o produto existe
                  const produtoExisteQuery = `
                    SELECT id, valor_unitario FROM produtos_fornecedores WHERE id = ?
                  `;
                  const [produtoExistente] = await executeQuery(produtoExisteQuery, [produtoFornecedorId]);
                  
                  if (!produtoExistente) {
                    continue;
                  }
                  
                  // Buscar valor anterior para comparação
                  const valorAnterior = produtoExistente.valor_unitario || 0;
                  const valorNovo = produto.valorUnitario || produto.valor_unitario || 0;

                  const updateProdutoQuery = `
                    UPDATE produtos_fornecedores SET
                      valor_unitario = ?,
                      valor_anterior = ?,
                      primeiro_valor = ?,
                      difal = ?,
                      ipi = ?,
                      data_entrega_fn = ?,
                      total = ?
                    WHERE id = ?
                  `;
                  
                  await executeQuery(updateProdutoQuery, [
                    valorNovo,
                    produto.valorAnterior || produto.valor_anterior || 0,
                    produto.primeiroValor || produto.primeiro_valor || valorNovo,
                    produto.difal || 0,
                    produto.ipi || 0,
                    produto.dataEntregaFn || produto.data_entrega_fn || null,
                    produto.total || 0,
                    produtoFornecedorId
                  ]);

                  // Validar anexo obrigatório (sempre para cada fornecedor)
                  await AnexosController.validarAnexos({
                    params: { id },
                    body: {
                      fornecedor_id: fornecedorDbId,
                      produto_id: produtoFornecedorId,
                      valor_anterior: valorAnterior,
                      valor_novo: valorNovo
                    }
                  }, { json: () => {} });
                }
              }
            }
          }
        }
      }

      res.json({ message: 'Cotação atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar cotação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // DELETE /api/cotacoes/:id - Excluir cotação
  static async deleteCotacao(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a cotação existe e se o usuário tem permissão para excluí-la
      let cotacaoQuery = `
        SELECT id, comprador FROM cotacoes WHERE id = ?
      `;
      let queryParams = [id];

      // Adicionar filtro de segurança para usuários não administradores
      if (req.user.role !== 'administrador') {
        cotacaoQuery += ' AND comprador = ?';
        queryParams.push(req.user.name);
      }

      const [cotacao] = await executeQuery(cotacaoQuery, queryParams);

      if (!cotacao) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }

      const query = 'DELETE FROM cotacoes WHERE id = ?';
      const result = await executeQuery(query, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }

      res.json({ message: 'Cotação excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir cotação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // POST /api/cotacoes/:id/enviar-supervisor - Enviar para supervisor
  static async sendToSupervisor(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a cotação existe e se o usuário tem permissão para enviá-la
      let cotacaoQuery = `
        SELECT id, comprador FROM cotacoes WHERE id = ?
      `;
      let queryParams = [id];

      // Adicionar filtro de segurança para usuários não administradores
      if (req.user.role !== 'administrador') {
        cotacaoQuery += ' AND comprador = ?';
        queryParams.push(req.user.name);
      }

      const [cotacao] = await executeQuery(cotacaoQuery, queryParams);

      if (!cotacao) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }

      // Verificar se há produtos com valor zerado
      const produtosQuery = `
        SELECT 
          pf.nome as produto_nome,
          f.nome as fornecedor_nome,
          pf.valor_unitario
        FROM produtos_fornecedores pf
        JOIN fornecedores f ON pf.fornecedor_id = f.id
        WHERE f.cotacao_id = ? AND (pf.valor_unitario IS NULL OR pf.valor_unitario = 0)
      `;
      
      const produtosZerados = await executeQuery(produtosQuery, [id]);

      if (produtosZerados && produtosZerados.length > 0) {
        return res.status(400).json({
          message: 'Não é possível enviar cotação com produtos zerados',
          produtosZerados: produtosZerados.map(p => ({
            produto: p.produto_nome,
            fornecedor: p.fornecedor_nome
          }))
        });
      }

      const query = 'UPDATE cotacoes SET status = "em_analise" WHERE id = ?';
      const result = await executeQuery(query, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }

      res.json({ message: 'Cotação enviada para análise do supervisor' });
    } catch (error) {
      console.error('Erro ao enviar para supervisor:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // POST /api/cotacoes/:id/upload - Upload de arquivo
  static async uploadFile(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a cotação existe e se o usuário tem permissão para acessá-la
      let cotacaoQuery = `
        SELECT id, comprador FROM cotacoes WHERE id = ?
      `;
      let queryParams = [id];

      // Adicionar filtro de segurança para usuários não administradores
      if (req.user.role !== 'administrador') {
        cotacaoQuery += ' AND comprador = ?';
        queryParams.push(req.user.name);
      }

      const [cotacao] = await executeQuery(cotacaoQuery, queryParams);

      if (!cotacao) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }

      // Implementar lógica de upload de arquivo
      res.json({ message: 'Arquivo enviado com sucesso' });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // POST /api/cotacoes/:id/importar-produtos - Importar produtos
  static async importarProdutos(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' });
      }

      // Processar arquivo Excel e importar produtos
      // Implementação específica para importação de produtos
      
      res.json({ message: 'Produtos importados com sucesso' });
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }

  // GET /api/cotacoes/compradores - Buscar compradores
  static async getCompradores(req, res) {
    try {
      // Verificar se o usuário é administrador
      if (req.user.role !== 'administrador') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' });
      }

      const query = `
        SELECT DISTINCT 
          c.comprador as nome
        FROM cotacoes c
        WHERE c.comprador IS NOT NULL AND c.comprador != ''
        ORDER BY c.comprador
      `;

      const compradores = await executeQuery(query);

      res.json(compradores);
    } catch (error) {
      console.error('Erro ao buscar compradores:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }

  // Métodos delegados para controllers específicos
  static analisarCotacao = CotacoesAnaliseController.analisarCotacao;
  static getStatsOverview = CotacoesStatsController.getStatsOverview;
  static exportXLSX = CotacoesExportController.exportXLSX;
  static exportPDF = CotacoesExportController.exportPDF;
}

module.exports = CotacoesController;
