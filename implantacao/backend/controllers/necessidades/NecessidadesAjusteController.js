const { executeQuery } = require('../../config/database');

// Listar necessidades para ajuste (status = 'NEC')
const listarParaAjuste = async (req, res) => {
  try {
    const { escola_id, grupo, semana_consumo, semana_abastecimento } = req.query;
    const usuario_id = req.user.id;
    const tipo_usuario = req.user.tipo_de_acesso;


    // Construir query baseada no tipo de usuário
    let query = `
      SELECT 
        n.id,
        n.produto_id,
        n.codigo_teknisa,
        n.produto,
        n.produto_unidade,
        n.ajuste,
        n.ajuste_nutricionista,
        n.necessidade_id,
        n.escola_id,
        n.escola,
        n.semana_consumo,
        n.semana_abastecimento,
        n.status,
        n.data_preenchimento
      FROM necessidades n
      WHERE n.status = 'NEC'
    `;

    const params = [];

    // Se for nutricionista, filtrar apenas pelas escolas da rota dela
    if (tipo_usuario === 'nutricionista') {
      // Para nutricionista, filtrar apenas escolas das rotas nutricionistas
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
        // Buscar email do usuário logado
        const userEmail = req.user.email;
        
        // Buscar rotas da nutricionista por email
        const response = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${encodeURIComponent(userEmail)}&status=ativo`, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
          },
          timeout: 5000 // Timeout de 5 segundos
        });

        if (response.data && response.data.success) {
          // Extrair array de rotas corretamente
          let rotas = response.data.data?.rotas || response.data.data || response.data || [];
          // Garantir que é um array
          if (!Array.isArray(rotas)) {
            rotas = rotas.rotas || [];
          }
          
          const escolasIds = [];
          
          // Extrair IDs das escolas das rotas
          rotas.forEach(rota => {
            if (rota.escolas_responsaveis) {
              const ids = rota.escolas_responsaveis.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
              escolasIds.push(...ids);
            }
          });

          // Se a nutricionista tem escolas vinculadas, filtrar por elas
          if (escolasIds.length > 0) {
            query += ` AND n.escola_id IN (${escolasIds.map(() => '?').join(',')})`;
            params.push(...escolasIds);
          } else {
            // Se não tem escolas vinculadas, não mostrar nenhuma necessidade
            query += ' AND 1=0';
          }
        } else {
          // Se não conseguir buscar as rotas, não mostrar nenhuma necessidade
          query += ' AND 1=0';
        }
      } catch (apiError) {
        console.error('Erro ao buscar rotas do foods:', apiError);
        // Se houver erro na API, não mostrar nenhuma necessidade
        query += ' AND 1=0';
      }
    }

    // Aplicar filtros opcionais se fornecidos
    if (escola_id) {
      query += ` AND n.escola_id = ?`;
      params.push(escola_id);
    }

    if (grupo) {
      query += ` AND n.produto_id IN (
        SELECT DISTINCT ppc.produto_id 
        FROM produtos_per_capita ppc
        WHERE ppc.grupo = ?
      )`;
      params.push(grupo);
    }

    // Filtros opcionais por período
    if (semana_consumo) {
      query += ` AND n.semana_consumo = ?`;
      params.push(semana_consumo);
    }

    if (semana_abastecimento) {
      query += ` AND n.semana_abastecimento = ?`;
      params.push(semana_abastecimento);
    }

    query += ` ORDER BY n.produto ASC`;

    const necessidades = await executeQuery(query, params);

    res.json({
      success: true,
      data: necessidades
    });
  } catch (error) {
    console.error('Erro ao listar necessidades para ajuste:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao listar necessidades para ajuste'
    });
  }
};

// Salvar ajustes da nutricionista
const salvarAjustes = async (req, res) => {
  try {
    const { escola_id, grupo, periodo, itens } = req.body;

    // Validar dados obrigatórios
    if (!escola_id || !grupo || !itens || !Array.isArray(itens)) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios',
        message: 'escola_id, grupo e itens são obrigatórios'
      });
    }

    let updatedCount = 0;

    // Atualizar cada item
    for (const item of itens) {
      const { necessidade_id, ajuste_nutricionista } = item;

      if (!necessidade_id) continue;

      await executeQuery(`
        UPDATE necessidades 
        SET ajuste_nutricionista = ?, data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ? AND escola_id = ? AND status = 'NEC'
      `, [ajuste_nutricionista || null, necessidade_id, escola_id]);

      updatedCount++;
    }

    // Atualizar status do conjunto para 'NEC NUTRI' se houve atualizações
    if (updatedCount > 0) {
      await executeQuery(`
        UPDATE necessidades 
        SET status = 'NEC NUTRI', data_atualizacao = CURRENT_TIMESTAMP
        WHERE escola_id = ? 
          AND status = 'NEC'
          AND produto_id IN (
            SELECT DISTINCT ppc.produto_id 
            FROM produtos_per_capita ppc
            WHERE ppc.grupo = ?
          )
      `, [escola_id, grupo]);

      // Aplicar filtros de período se fornecidos
      if (periodo && periodo.consumo_de && periodo.consumo_ate) {
        await executeQuery(`
          UPDATE necessidades 
          SET status = 'NEC NUTRI', data_atualizacao = CURRENT_TIMESTAMP
          WHERE escola_id = ? 
            AND status = 'NEC'
            AND semana_consumo BETWEEN ? AND ?
        `, [escola_id, periodo.consumo_de, periodo.consumo_ate]);
      }
    }

    res.json({
      success: true,
      message: 'Ajustes salvos com sucesso',
      data: {
        updated: updatedCount,
        status: 'NEC NUTRI'
      }
    });
  } catch (error) {
    console.error('Erro ao salvar ajustes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao salvar ajustes'
    });
  }
};

// Incluir produto extra
const incluirProdutoExtra = async (req, res) => {
  try {
    const { escola_id, grupo, periodo, produto_id } = req.body;

    // Validar dados obrigatórios
    if (!escola_id || !grupo || !produto_id) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios',
        message: 'escola_id, grupo e produto_id são obrigatórios'
      });
    }

    // Verificar se o produto pertence ao grupo
    const produtoGrupo = await executeQuery(`
      SELECT ppc.produto_id, p.nome, p.unidade_medida, p.codigo_teknisa
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      WHERE ppc.produto_id = ? AND ppc.grupo = ?
    `, [produto_id, grupo]);

    if (produtoGrupo.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Produto inválido',
        message: 'Produto não pertence ao grupo especificado'
      });
    }

    const produto = produtoGrupo[0];

    // Verificar se já existe necessidade para este produto/escola/período
    let whereClause = `escola_id = ? AND produto_id = ?`;
    const params = [escola_id, produto_id];

    if (periodo && periodo.consumo_de && periodo.consumo_ate) {
      whereClause += ` AND semana_consumo BETWEEN ? AND ?`;
      params.push(periodo.consumo_de, periodo.consumo_ate);
    }

    const existing = await executeQuery(`
      SELECT id FROM necessidades WHERE ${whereClause}
    `, params);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Produto já incluído',
        message: 'Este produto já está incluído na necessidade'
      });
    }

    // Buscar dados da escola
    const escola = await executeQuery(`
      SELECT nome_escola, rota, codigo_teknisa 
      FROM escolas 
      WHERE id = ?
    `, [escola_id]);

    if (escola.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Escola não encontrada',
        message: 'Escola não encontrada'
      });
    }

    const escolaData = escola[0];

    // Determinar status (NEC se conjunto ainda não foi ajustado, senão manter NEC NUTRI)
    const statusConjunto = await executeQuery(`
      SELECT DISTINCT status FROM necessidades 
      WHERE escola_id = ? AND status IN ('NEC', 'NEC NUTRI')
      LIMIT 1
    `, [escola_id]);

    const novoStatus = statusConjunto.length > 0 && statusConjunto[0].status === 'NEC NUTRI' ? 'NEC NUTRI' : 'NEC';

    // Criar nova necessidade
    const result = await executeQuery(`
      INSERT INTO necessidades (
        usuario_email,
        usuario_id,
        produto_id,
        produto,
        produto_unidade,
        escola_id,
        escola,
        escola_rota,
        codigo_teknisa,
        ajuste,
        semana_consumo,
        semana_abastecimento,
        status,
        observacoes,
        necessidade_id,
        ajuste_nutricionista
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.email,
      req.user.id,
      produto_id,
      produto.nome,
      produto.unidade_medida,
      escola_id,
      escolaData.nome_escola,
      escolaData.rota || '',
      produto.codigo_teknisa || '',
      0, // ajuste zerado para produtos extras
      periodo?.consumo_de || null,
      periodo?.consumo_ate || null,
      novoStatus,
      'Produto extra incluído pela nutricionista',
      null, // necessidade_id será gerado automaticamente
      null // ajuste_nutricionista inicialmente null
    ]);

    res.status(201).json({
      success: true,
      message: 'Produto extra incluído com sucesso',
      data: {
        id: result.insertId,
        produto_id: produto_id,
        produto: produto.nome,
        produto_unidade: produto.unidade_medida,
        ajuste: 0,
        ajuste_nutricionista: null,
        status: novoStatus
      }
    });
  } catch (error) {
    console.error('Erro ao incluir produto extra:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao incluir produto extra'
    });
  }
};

// Liberar para coordenação
const liberarCoordenacao = async (req, res) => {
  try {
    const { escola_id, grupo, periodo } = req.body;

    // Validar dados obrigatórios
    if (!escola_id || !grupo) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios',
        message: 'escola_id e grupo são obrigatórios'
      });
    }

    // Atualizar status para 'NEC COORD'
    let query = `
      UPDATE necessidades 
      SET status = 'NEC COORD', data_atualizacao = CURRENT_TIMESTAMP
      WHERE escola_id = ? 
        AND status IN ('NEC', 'NEC NUTRI')
        AND produto_id IN (
          SELECT DISTINCT ppc.produto_id 
          FROM produtos_per_capita ppc
          WHERE ppc.grupo = ?
        )
    `;

    const params = [escola_id, grupo];

    // Aplicar filtros de período se fornecidos
    if (periodo && periodo.consumo_de && periodo.consumo_ate) {
      query += ` AND semana_consumo BETWEEN ? AND ?`;
      params.push(periodo.consumo_de, periodo.consumo_ate);
    }

    const result = await executeQuery(query, params);

    res.json({
      success: true,
      message: 'Necessidades liberadas para coordenação',
      data: {
        affectedRows: result.affectedRows,
        status: 'NEC COORD'
      }
    });
  } catch (error) {
    console.error('Erro ao liberar para coordenação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao liberar para coordenação'
    });
  }
};

// Buscar produtos para modal (excluindo já incluídos)
const buscarProdutosParaModal = async (req, res) => {
  try {
    const { grupo, escola_id, search, semana_consumo, semana_abastecimento } = req.query;

    console.log('=== DEBUG PARÂMETROS RECEBIDOS ===');
    console.log('grupo:', grupo);
    console.log('escola_id:', escola_id);
    console.log('search:', search);
    console.log('semana_consumo:', semana_consumo);
    console.log('semana_abastecimento:', semana_abastecimento);
    console.log('===================================');

    // Validar parâmetros obrigatórios
    if (!grupo) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro obrigatório',
        message: 'grupo é obrigatório'
      });
    }

    let query = `
      SELECT DISTINCT ppc.produto_id, ppc.produto_codigo, ppc.produto_nome, ppc.unidade_medida
      FROM produtos_per_capita ppc
      WHERE ppc.grupo = ? AND ppc.ativo = true
    `;

    const params = [grupo];

    // Filtro de busca por nome/código
    if (search) {
      query += ` AND (ppc.produto_nome LIKE ? OR ppc.produto_codigo LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Excluir produtos já incluídos na necessidade (se escola_id e semana_consumo fornecidos)
    if (escola_id && semana_consumo) {
      query += ` AND ppc.produto_id NOT IN (
        SELECT DISTINCT produto_id 
        FROM necessidades 
        WHERE escola_id = ? AND semana_consumo = ?
      )`;
      params.push(escola_id, semana_consumo);
    }

    query += ` ORDER BY ppc.produto_nome ASC`;

    const produtos = await executeQuery(query, params);

    console.log('=== DEBUG EXCLUSÃO PRODUTOS ===');
    console.log('Query executada:', query);
    console.log('Parâmetros:', params);
    console.log('Produtos encontrados:', produtos.length);
    console.log('Primeiros produtos:', produtos.slice(0, 3));
    console.log('================================');

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos para modal:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos para modal'
    });
  }
};

module.exports = {
  listarParaAjuste,
  salvarAjustes,
  incluirProdutoExtra,
  liberarCoordenacao,
  buscarProdutosParaModal
};
