const { executeQuery } = require('../../config/database');
const {
  getStatusPermitidosPorAba,
  aplicarFiltroNutricionista
} = require('./utils/ajusteUtils');

/**
 * Controller para funções de busca/filtros de ajuste de necessidades
 */

// Buscar semanas de consumo disponíveis na tabela necessidades
const buscarSemanasConsumoDisponiveis = async (req, res) => {
  try {
    const { escola_id, aba } = req.query;
    const tipo_usuario = req.user.tipo_de_acesso;

    // Se aba não for fornecido, não filtrar por status (todos os status)
    const statusPermitidos = aba ? getStatusPermitidosPorAba(aba) : null;

    let query = `
      SELECT DISTINCT 
        n.semana_consumo,
        n.semana_abastecimento
      FROM necessidades n
      WHERE n.semana_consumo IS NOT NULL 
        AND n.semana_consumo != ''
    `;

    let params = [];
    
    // Filtrar por status apenas se aba foi fornecido
    if (statusPermitidos && statusPermitidos.length > 0) {
      query += ` AND n.status IN (${statusPermitidos.map(() => '?').join(',')})`;
      params.push(...statusPermitidos);
    }

    // Aplicar filtro de nutricionista se necessário
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const result = await aplicarFiltroNutricionista(
      tipo_usuario,
      req.user.email,
      authToken,
      query,
      params
    );
    query = result.query;
    params = result.params;

    // Filtro opcional por escola
    if (escola_id) {
      query += ` AND n.escola_id = ?`;
      params.push(escola_id);
    }

    query += ` ORDER BY n.semana_consumo DESC`;

    const semanas = await executeQuery(query, params);

    // Extrair semanas de consumo únicas e ordenadas
    const semanasUnicas = [...new Set(semanas.map(s => s.semana_consumo).filter(s => s))];

    res.json({
      success: true,
      data: semanasUnicas.map(semana => ({
        semana_consumo: semana
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar semanas de consumo disponíveis:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar semanas de consumo disponíveis'
    });
  }
};

// Buscar grupos disponíveis na tabela necessidades
const buscarGruposDisponiveis = async (req, res) => {
  try {
    const { escola_id, aba } = req.query;
    const tipo_usuario = req.user.tipo_de_acesso;

    // Se aba não for fornecido, não filtrar por status (todos os status)
    const statusPermitidos = aba ? getStatusPermitidosPorAba(aba) : null;

    let query = `
      SELECT DISTINCT 
        n.grupo,
        n.grupo_id
      FROM necessidades n
      WHERE n.grupo IS NOT NULL 
        AND n.grupo != ''
    `;

    let params = [];
    
    // Filtrar por status apenas se aba foi fornecido
    if (statusPermitidos && statusPermitidos.length > 0) {
      query += ` AND n.status IN (${statusPermitidos.map(() => '?').join(',')})`;
      params.push(...statusPermitidos);
    }

    // Aplicar filtro de nutricionista se necessário
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const result = await aplicarFiltroNutricionista(
      tipo_usuario,
      req.user.email,
      authToken,
      query,
      params
    );
    query = result.query;
    params = result.params;

    // Filtro opcional por escola
    if (escola_id) {
      query += ` AND n.escola_id = ?`;
      params.push(escola_id);
    }

    query += ` ORDER BY n.grupo ASC`;

    const grupos = await executeQuery(query, params);

    // Buscar informações completas dos grupos no Foods DB
    const gruposUnicos = [...new Set(grupos.map(g => g.grupo).filter(g => g))];
    const gruposComInfo = [];

    if (gruposUnicos.length > 0) {
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
        const response = await axios.get(`${foodsApiUrl}/grupos?status=ativo`, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
          },
          timeout: 5000
        });

        if (response.data && response.data.success) {
          const todosGrupos = response.data.data || [];
          gruposUnicos.forEach(nomeGrupo => {
            const grupoInfo = todosGrupos.find(g => g.nome === nomeGrupo);
            if (grupoInfo) {
              gruposComInfo.push({
                id: grupoInfo.id,
                nome: grupoInfo.nome,
                status: grupoInfo.status
              });
            }
          });
        }
      } catch (apiError) {
        console.error('Erro ao buscar grupos do foods:', apiError);
        // Fallback: retornar apenas com nome
        gruposUnicos.forEach(nomeGrupo => {
          if (nomeGrupo && !gruposComInfo.find(g => g.nome === nomeGrupo)) {
            gruposComInfo.push({
              id: null,
              nome: nomeGrupo,
              status: 'ativo'
            });
          }
        });
      }
    }
    
    // Se ainda não tiver dados, usar dados da query inicial
    if (gruposComInfo.length === 0 && grupos.length > 0) {
      grupos.forEach(grupo => {
        if (grupo.grupo && !gruposComInfo.find(g => g.nome === grupo.grupo)) {
          gruposComInfo.push({
            id: grupo.grupo_id || null,
            nome: grupo.grupo,
            status: 'ativo'
          });
        }
      });
    }

    res.json({
      success: true,
      data: gruposComInfo
    });
  } catch (error) {
    console.error('Erro ao buscar grupos disponíveis:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar grupos disponíveis'
    });
  }
};

// Buscar semana de abastecimento por semana de consumo (da tabela necessidades)
const buscarSemanaAbastecimentoPorConsumo = async (req, res) => {
  try {
    const { semana_consumo, aba } = req.query;
    const tipo_usuario = req.user.tipo_de_acesso;

    if (!semana_consumo) {
      return res.status(400).json({
        success: false,
        message: 'Semana de consumo é obrigatória'
      });
    }

    // Se aba não for fornecido, não filtrar por status (todos os status)
    const statusPermitidos = aba ? getStatusPermitidosPorAba(aba) : null;

    let query = `
      SELECT DISTINCT 
        n.semana_abastecimento
      FROM necessidades n
      WHERE n.semana_consumo = ?
        AND n.semana_abastecimento IS NOT NULL 
        AND n.semana_abastecimento != ''
    `;

    let params = [semana_consumo];
    
    // Filtrar por status apenas se aba foi fornecido
    if (statusPermitidos && statusPermitidos.length > 0) {
      query += ` AND n.status IN (${statusPermitidos.map(() => '?').join(',')})`;
      params.push(...statusPermitidos);
    }
    
    query += ` LIMIT 1`;

    // Aplicar filtro de nutricionista se necessário
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const result = await aplicarFiltroNutricionista(
      tipo_usuario,
      req.user.email,
      authToken,
      query,
      params
    );
    query = result.query;
    params = result.params;

    const resultQuery = await executeQuery(query, params);

    if (resultQuery.length > 0 && resultQuery[0].semana_abastecimento) {
      res.json({
        success: true,
        data: {
          semana_consumo: semana_consumo,
          semana_abastecimento: resultQuery[0].semana_abastecimento
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Semana de abastecimento não encontrada para esta semana de consumo'
      });
    }
  } catch (error) {
    console.error('Erro ao buscar semana de abastecimento por consumo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar semana de abastecimento por consumo'
    });
  }
};

// Buscar escolas disponíveis na tabela necessidades
const buscarEscolasDisponiveis = async (req, res) => {
  try {
    const { grupo, aba } = req.query;
    const tipo_usuario = req.user.tipo_de_acesso;

    // Se aba não for fornecido, não filtrar por status (todos os status)
    const statusPermitidos = aba ? getStatusPermitidosPorAba(aba) : null;

    let query = `
      SELECT DISTINCT 
        n.escola_id,
        n.escola
      FROM necessidades n
      WHERE n.escola_id IS NOT NULL 
        AND n.escola IS NOT NULL
        AND n.escola != ''
    `;

    let params = [];
    
    // Filtrar por status apenas se aba foi fornecido
    if (statusPermitidos && statusPermitidos.length > 0) {
      query += ` AND n.status IN (${statusPermitidos.map(() => '?').join(',')})`;
      params.push(...statusPermitidos);
    }

    // Aplicar filtro de nutricionista se necessário
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const result = await aplicarFiltroNutricionista(
      tipo_usuario,
      req.user.email,
      authToken,
      query,
      params
    );
    query = result.query;
    params = result.params;

    // Filtro opcional por grupo
    if (grupo) {
      query += ` AND n.grupo = ?`;
      params.push(grupo);
    }

    query += ` ORDER BY n.escola ASC`;

    const escolas = await executeQuery(query, params);

    // Retornar diretamente da tabela necessidades (sem buscar no Foods DB)
    const escolasUnicas = new Map();

    escolas.forEach(escola => {
      if (escola.escola_id && escola.escola && !escolasUnicas.has(escola.escola_id)) {
        escolasUnicas.set(escola.escola_id, {
          id: escola.escola_id,
          nome: escola.escola,
          codigo: null,
          status: 'ativo'
        });
      }
    });

    const escolasComInfo = Array.from(escolasUnicas.values());

    res.json({
      success: true,
      data: escolasComInfo.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    });
  } catch (error) {
    console.error('Erro ao buscar escolas disponíveis:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar escolas disponíveis'
    });
  }
};

// Buscar produtos para modal (excluindo já incluídos)
const buscarProdutosParaModal = async (req, res) => {
  try {
    const { grupo, escola_id, search, consumo_de, consumo_ate, semana_consumo } = req.query;

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

    // Excluir produtos já incluídos na necessidade (se escola_id e período fornecidos)
    // IMPORTANTE: Não excluir produtos com status 'EXCLUÍDO', pois eles podem ser reativados
    let produtosIncluidos = [];
    
    if (escola_id && semana_consumo) {
      // Primeiro, vamos verificar quais produtos estão incluídos (não excluídos)
      produtosIncluidos = await executeQuery(`
        SELECT DISTINCT n.produto_id, n.status, n.produto
        FROM necessidades n
        WHERE n.escola_id = ? 
          AND n.semana_consumo = ? 
          AND n.status != 'EXCLUÍDO'
      `, [escola_id, semana_consumo]);

      // Usar semana_consumo diretamente - comparar produto_id da necessidades com produto_id da produtos_per_capita
      // Excluir apenas produtos com status ativos (não excluídos)
      // IMPORTANTE: Produtos com status 'EXCLUÍDO' devem aparecer no modal para poderem ser reativados
      query += ` AND ppc.produto_id NOT IN (
        SELECT DISTINCT n.produto_id 
        FROM necessidades n
        WHERE n.escola_id = ? 
          AND n.semana_consumo = ? 
          AND n.status != 'EXCLUÍDO'
      )`;
      params.push(escola_id, semana_consumo);
    } else if (escola_id && consumo_de && consumo_ate) {
      // Fallback para consumo_de e consumo_ate
      produtosIncluidos = await executeQuery(`
        SELECT DISTINCT n.produto_id, n.status, n.produto
        FROM necessidades n
        WHERE n.escola_id = ? 
          AND n.semana_consumo BETWEEN ? AND ? 
          AND n.status != 'EXCLUÍDO'
      `, [escola_id, consumo_de, consumo_ate]);

      // Excluir apenas produtos com status ativos (não excluídos)
      // IMPORTANTE: Produtos com status 'EXCLUÍDO' devem aparecer no modal para poderem ser reativados
      query += ` AND ppc.produto_id NOT IN (
        SELECT DISTINCT n.produto_id 
        FROM necessidades n
        WHERE n.escola_id = ? 
          AND n.semana_consumo BETWEEN ? AND ? 
          AND n.status != 'EXCLUÍDO'
      )`;
      params.push(escola_id, consumo_de, consumo_ate);
    }

    query += ` ORDER BY ppc.produto_nome ASC`;

    const produtos = await executeQuery(query, params);

    // Buscar produtos excluídos da tabela necessidades que não estão em produtos_per_capita
    // Esses produtos devem aparecer no modal para poderem ser reativados
    let produtosExcluidos = [];
    if (escola_id && semana_consumo) {
      produtosExcluidos = await executeQuery(`
        SELECT DISTINCT 
          n.produto_id,
          n.produto as produto_nome,
          n.produto_unidade as unidade_medida,
          COALESCE(ppc.produto_codigo, po.codigo, '') as produto_codigo
        FROM necessidades n
        LEFT JOIN produtos_per_capita ppc ON ppc.produto_id = n.produto_id 
          AND ppc.grupo COLLATE utf8mb4_unicode_ci = n.grupo COLLATE utf8mb4_unicode_ci
        LEFT JOIN foods_db.produto_origem po ON po.id = n.produto_id
        WHERE n.escola_id = ? 
          AND n.semana_consumo = ? 
          AND n.status = 'EXCLUÍDO'
          AND n.grupo = ?
          AND n.produto_id NOT IN (
            SELECT DISTINCT ppc2.produto_id 
            FROM produtos_per_capita ppc2 
            WHERE ppc2.grupo COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci 
              AND ppc2.ativo = true
          )
      `, [escola_id, semana_consumo, grupo, grupo]);
    } else if (escola_id && consumo_de && consumo_ate) {
      produtosExcluidos = await executeQuery(`
        SELECT DISTINCT 
          n.produto_id,
          n.produto as produto_nome,
          n.produto_unidade as unidade_medida,
          COALESCE(ppc.produto_codigo, po.codigo, '') as produto_codigo
        FROM necessidades n
        LEFT JOIN produtos_per_capita ppc ON ppc.produto_id = n.produto_id 
          AND ppc.grupo COLLATE utf8mb4_unicode_ci = n.grupo COLLATE utf8mb4_unicode_ci
        LEFT JOIN foods_db.produto_origem po ON po.id = n.produto_id
        WHERE n.escola_id = ? 
          AND n.semana_consumo BETWEEN ? AND ? 
          AND n.status = 'EXCLUÍDO'
          AND n.grupo = ?
          AND n.produto_id NOT IN (
            SELECT DISTINCT ppc2.produto_id 
            FROM produtos_per_capita ppc2 
            WHERE ppc2.grupo COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci 
              AND ppc2.ativo = true
          )
      `, [escola_id, consumo_de, consumo_ate, grupo, grupo]);
    }

    // Combinar produtos de produtos_per_capita com produtos excluídos
    const produtosCombinados = [...produtos];
    
    // Adicionar produtos excluídos que não estão na lista
    produtosExcluidos.forEach(prodExcluido => {
      if (!produtosCombinados.find(p => p.produto_id === prodExcluido.produto_id)) {
        produtosCombinados.push({
          produto_id: prodExcluido.produto_id,
          produto_codigo: prodExcluido.produto_codigo || null,
          produto_nome: prodExcluido.produto_nome,
          unidade_medida: prodExcluido.unidade_medida || 'UN'
        });
      }
    });

    res.json({
      success: true,
      data: produtosCombinados
    });
  } catch (error) {
    console.error('[buscarProdutosParaModal] ❌ Erro ao buscar produtos para modal:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos para modal'
    });
  }
};

module.exports = {
  buscarSemanasConsumoDisponiveis,
  buscarGruposDisponiveis,
  buscarSemanaAbastecimentoPorConsumo,
  buscarEscolasDisponiveis,
  buscarProdutosParaModal
};

