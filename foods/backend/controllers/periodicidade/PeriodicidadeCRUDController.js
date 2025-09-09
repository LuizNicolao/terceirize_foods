/**
 * Controller de CRUD de Periodicidade
 * Responsável por criar, atualizar e excluir agrupamentos de periodicidade
 */

const { executeQuery } = require('../../config/database');


/**
 * Criar novo agrupamento de periodicidade
 */
const criarAgrupamento = async (req, res) => {
  try {
    const { nome, descricao, tipo_id, regras_calendario, ativo = true, unidades_escolares = [], grupos_produtos = [], produtos_individuais = [] } = req.body;

    // Validar dados obrigatórios
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    
    if (!tipo_id) {
      return res.status(400).json({ error: 'Tipo de periodicidade é obrigatório' });
    }

    // Verificar se o tipo existe
    const tipo = await executeQuery(
      'SELECT id FROM tipos_periodicidade WHERE id = ? AND ativo = TRUE',
      [tipo_id]
    );
    
    if (tipo.length === 0) {
      return res.status(400).json({ error: 'Tipo de periodicidade não encontrado' });
    }

    // Verificar se já existe agrupamento com o mesmo nome
    const existente = await executeQuery(
      'SELECT id FROM agrupamentos_periodicidade WHERE nome = ?',
      [nome]
    );
    
    if (existente.length > 0) {
      return res.status(400).json({ error: 'Já existe um agrupamento com este nome' });
    }

    // Inserir agrupamento
    const result = await executeQuery(
      'INSERT INTO agrupamentos_periodicidade (nome, descricao, tipo_id, regras_calendario, ativo) VALUES (?, ?, ?, ?, ?)',
      [nome, descricao, tipo_id, regras_calendario ? JSON.stringify(regras_calendario) : null, ativo === 'true' || ativo === true ? 1 : 0]
    );

    const agrupamentoId = result.insertId;

    // Vincular unidades escolares se fornecidas
    if (unidades_escolares && unidades_escolares.length > 0) {
      const insertEscolasQuery = `
        INSERT INTO agrupamentos_escolas (agrupamento_id, unidade_escolar_id, ativo)
        VALUES ${unidades_escolares.map(() => '(?, ?, TRUE)').join(', ')}
      `;
      
      const valoresEscolas = [];
      unidades_escolares.forEach(unidadeId => {
        valoresEscolas.push(agrupamentoId, unidadeId);
      });
      
      await executeQuery(insertEscolasQuery, valoresEscolas);
    }

    // NOVA LÓGICA: Processar produtos de forma inteligente
    const produtosFinais = new Set();
    
    // 1. Adicionar produtos de grupos completos
    if (grupos_produtos && grupos_produtos.length > 0) {
      const produtosGruposQuery = `
        SELECT p.id, p.nome, p.codigo_produto, p.grupo_id
        FROM produtos p
        WHERE p.grupo_id IN (${grupos_produtos.map(() => '?').join(', ')})
        AND p.status = 1
      `;
      
      const produtosGrupos = await executeQuery(produtosGruposQuery, grupos_produtos);
      produtosGrupos.forEach(produto => produtosFinais.add(produto.id));
    }

    // 2. Adicionar produtos individuais (apenas se não estiverem em grupos completos)
    if (produtos_individuais && produtos_individuais.length > 0) {
      // Verificar se os produtos existem e estão ativos
      const produtosIndQuery = `
        SELECT p.id, p.nome, p.codigo_produto, p.grupo_id
        FROM produtos p
        WHERE p.id IN (${produtos_individuais.map(() => '?').join(', ')})
        AND p.status = 1
      `;
      
      const produtosIndividuaisResult = await executeQuery(produtosIndQuery, produtos_individuais);
      
      // Adicionar apenas produtos que não estão em grupos completos
      produtosIndividuaisResult.forEach(produto => {
        if (!grupos_produtos || !grupos_produtos.includes(produto.grupo_id)) {
          produtosFinais.add(produto.id);
        }
      });
    }

    // 3. Inserir todos os produtos finais na tabela agrupamentos_produtos
    if (produtosFinais.size > 0) {
      const produtosParaInserir = Array.from(produtosFinais);
      const insertProdutosQuery = `
        INSERT INTO agrupamentos_produtos (agrupamento_id, produto_id, quantidade, unidade_medida, ativo)
        VALUES ${produtosParaInserir.map(() => '(?, ?, 1.00, "un", TRUE)').join(', ')}
      `;
      
      const valoresProdutos = [];
      produtosParaInserir.forEach(produtoId => {
        valoresProdutos.push(agrupamentoId, produtoId);
      });
      
      await executeQuery(insertProdutosQuery, valoresProdutos);
    }

    // Buscar o agrupamento criado
    const agrupamento = await executeQuery(`
      SELECT 
        a.id,
        a.nome,
        a.descricao,
        a.tipo_id,
        t.nome as tipo_nome,
        t.descricao as tipo_descricao,
        a.regras_calendario,
        a.ativo,
        a.criado_em,
        a.atualizado_em
      FROM agrupamentos_periodicidade a
      LEFT JOIN tipos_periodicidade t ON a.tipo_id = t.id
      WHERE a.id = ?
    `, [agrupamentoId]);

    res.status(201).json({
      success: true,
      data: agrupamento[0],
      message: 'Agrupamento criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar agrupamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar agrupamento por ID
 */
const buscarAgrupamentoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const agrupamentos = await executeQuery(`
      SELECT 
        a.id,
        a.nome,
        a.descricao,
        a.tipo_id,
        a.regras_calendario,
        a.ativo,
        a.criado_em,
        a.atualizado_em
      FROM agrupamentos_periodicidade a
      WHERE a.id = ? AND a.ativo = TRUE
    `, [id]);

    if (agrupamentos.length === 0) {
      return res.status(404).json({ error: 'Agrupamento não encontrado' });
    }

    const agrupamento = agrupamentos[0];
    
    // Parse das regras do calendário
    if (agrupamento.regras_calendario) {
      try {
        // Se já é um objeto, usar diretamente; se é string, fazer parse
        if (typeof agrupamento.regras_calendario === 'string') {
          agrupamento.regras_calendario = JSON.parse(agrupamento.regras_calendario);
        }
        // Se já é um objeto, não precisa fazer nada
      } catch (e) {
        agrupamento.regras_calendario = null;
      }
    }

    // Buscar unidades escolares vinculadas
    const unidadesVinculadas = await executeQuery(`
      SELECT ue.id, ue.nome_escola, ue.cidade, ue.estado, ue.endereco, ue.filial_id
      FROM agrupamentos_escolas ae
      JOIN unidades_escolares ue ON ae.unidade_escolar_id = ue.id
      WHERE ae.agrupamento_id = ? AND ae.ativo = TRUE
    `, [id]);

    // Buscar produtos vinculados (através dos grupos)
    const produtosVinculados = await executeQuery(`
      SELECT DISTINCT p.id, p.nome, p.codigo_produto, p.informacoes_adicionais, p.grupo_id, g.nome as grupo_nome
      FROM agrupamentos_produtos ap
      JOIN produtos p ON ap.produto_id = p.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      WHERE ap.agrupamento_id = ? AND ap.ativo = TRUE
    `, [id]);

    // Adicionar vinculações ao agrupamento
    agrupamento.unidades_escolares = unidadesVinculadas;
    agrupamento.produtos_vinculados = produtosVinculados;

    res.json({
      success: true,
      data: agrupamento,
      message: 'Agrupamento encontrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar agrupamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar agrupamento
 */
const atualizarAgrupamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidades_escolares, grupos_produtos, produtos_individuais, ...updateData } = req.body;

    // Verificar se o agrupamento existe
    const existente = await executeQuery(
      'SELECT id FROM agrupamentos_periodicidade WHERE id = ? AND ativo = TRUE',
      [id]
    );
    
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Agrupamento não encontrado' });
    }

    // Verificar se o tipo existe (se fornecido)
    if (updateData.tipo_id) {
      const tipo = await executeQuery(
        'SELECT id FROM tipos_periodicidade WHERE id = ? AND ativo = TRUE',
        [updateData.tipo_id]
      );
      
      if (tipo.length === 0) {
        return res.status(400).json({ error: 'Tipo de periodicidade não encontrado' });
      }
    }

    // Verificar se já existe outro agrupamento com o mesmo nome (se fornecido)
    if (updateData.nome) {
      const nomeExistente = await executeQuery(
        'SELECT id FROM agrupamentos_periodicidade WHERE nome = ? AND id != ? AND ativo = TRUE',
        [updateData.nome, id]
      );
      
      if (nomeExistente.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Já existe outro agrupamento com este nome'
        });
      }
    }

    // Construir query de atualização dinamicamente
    const fields = [];
    const values = [];

    // Campos válidos da tabela agrupamentos_periodicidade
    const validFields = ['nome', 'descricao', 'tipo_id', 'ativo', 'regras_calendario'];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key] !== undefined && validFields.includes(key)) {
        if (key === 'regras_calendario') {
          fields.push(`${key} = ?`);
          values.push(updateData[key] ? JSON.stringify(updateData[key]) : null);
        } else if (key === 'ativo') {
          // Converter string 'true'/'false' para boolean
          fields.push(`${key} = ?`);
          values.push(updateData[key] === 'true' || updateData[key] === true ? 1 : 0);
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });

    // Atualizar dados básicos do agrupamento se houver campos para atualizar
    if (fields.length > 0) {
      fields.push('atualizado_em = NOW()');
      values.push(id);

      const updateQuery = `UPDATE agrupamentos_periodicidade SET ${fields.join(', ')} WHERE id = ?`;
      await executeQuery(updateQuery, values);
    }

    // Atualizar vínculos de unidades escolares se fornecidos
    if (unidades_escolares !== undefined) {
      // Remover vinculações existentes
      await executeQuery(
        'UPDATE agrupamentos_escolas SET ativo = FALSE, atualizado_em = NOW() WHERE agrupamento_id = ?',
        [id]
      );

      // Inserir novas vinculações (usando INSERT ... ON DUPLICATE KEY UPDATE para evitar duplicatas)
      if (unidades_escolares.length > 0) {
        for (const unidadeId of unidades_escolares) {
          await executeQuery(`
            INSERT INTO agrupamentos_escolas (agrupamento_id, unidade_escolar_id, ativo, criado_em, atualizado_em)
            VALUES (?, ?, TRUE, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
              ativo = TRUE, 
              atualizado_em = NOW()
          `, [id, unidadeId]);
        }
      }
    }

    // NOVA LÓGICA: Atualizar vínculos de produtos de forma inteligente
    if (grupos_produtos !== undefined || produtos_individuais !== undefined) {
      // Remover vinculações existentes
      await executeQuery(
        'UPDATE agrupamentos_produtos SET ativo = FALSE, atualizado_em = NOW() WHERE agrupamento_id = ?',
        [id]
      );

      const produtosFinais = new Set();
      
      // 1. Adicionar produtos de grupos completos
      if (grupos_produtos && grupos_produtos.length > 0) {
        const produtosGruposQuery = `
          SELECT p.id, p.nome, p.codigo_produto, p.grupo_id
          FROM produtos p
          WHERE p.grupo_id IN (${grupos_produtos.map(() => '?').join(', ')})
          AND p.status = 1
        `;
        
        const produtosGrupos = await executeQuery(produtosGruposQuery, grupos_produtos);
        produtosGrupos.forEach(produto => produtosFinais.add(produto.id));
      }

      // 2. Adicionar produtos individuais (apenas se não estiverem em grupos completos)
      if (produtos_individuais && produtos_individuais.length > 0) {
        const produtosIndQuery = `
          SELECT p.id, p.nome, p.codigo_produto, p.grupo_id
          FROM produtos p
          WHERE p.id IN (${produtos_individuais.map(() => '?').join(', ')})
          AND p.status = 1
        `;
        
        const produtosIndividuaisResult = await executeQuery(produtosIndQuery, produtos_individuais);
        
        // Adicionar apenas produtos que não estão em grupos completos
        produtosIndividuaisResult.forEach(produto => {
          if (!grupos_produtos || !grupos_produtos.includes(produto.grupo_id)) {
            produtosFinais.add(produto.id);
          }
        });
      }

      // 3. Inserir todos os produtos finais
      if (produtosFinais.size > 0) {
        for (const produtoId of produtosFinais) {
          await executeQuery(`
            INSERT INTO agrupamentos_produtos (agrupamento_id, produto_id, quantidade, unidade_medida, ativo, criado_em, atualizado_em)
            VALUES (?, ?, 1.00, "un", TRUE, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
              ativo = TRUE, 
              atualizado_em = NOW()
          `, [id, produtoId]);
        }
      }
    }

    // Buscar o agrupamento atualizado
    const agrupamento = await executeQuery(`
      SELECT 
        a.id,
        a.nome,
        a.descricao,
        a.tipo_id,
        t.nome as tipo_nome,
        t.descricao as tipo_descricao,
        a.regras_calendario,
        a.ativo,
        a.criado_em,
        a.atualizado_em
      FROM agrupamentos_periodicidade a
      LEFT JOIN tipos_periodicidade t ON a.tipo_id = t.id
      WHERE a.id = ?
    `, [id]);

    const agrupamentoAtualizado = agrupamento[0];

    // Parse das regras do calendário
    if (agrupamentoAtualizado.regras_calendario) {
      try {
        agrupamentoAtualizado.regras_calendario = JSON.parse(agrupamentoAtualizado.regras_calendario);
      } catch (e) {
        agrupamentoAtualizado.regras_calendario = null;
      }
    }

    // Buscar unidades escolares vinculadas
    const unidadesVinculadas = await executeQuery(`
      SELECT ue.id, ue.nome_escola, ue.cidade, ue.estado, ue.endereco, ue.filial_id
      FROM agrupamentos_escolas ae
      JOIN unidades_escolares ue ON ae.unidade_escolar_id = ue.id
      WHERE ae.agrupamento_id = ? AND ae.ativo = TRUE
    `, [id]);

    // Buscar produtos vinculados (através dos grupos)
    const produtosVinculados = await executeQuery(`
      SELECT DISTINCT p.id, p.nome, p.informacoes_adicionais, g.nome as grupo_nome
      FROM agrupamentos_produtos ap
      JOIN produtos p ON ap.produto_id = p.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      WHERE ap.agrupamento_id = ? AND ap.ativo = TRUE
    `, [id]);

    // Adicionar vinculações ao agrupamento
    agrupamentoAtualizado.unidades_escolares = unidadesVinculadas;
    agrupamentoAtualizado.produtos_vinculados = produtosVinculados;

    res.json({
      success: true,
      data: agrupamentoAtualizado,
      message: 'Agrupamento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar agrupamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Excluir agrupamento (soft delete)
 */
const excluirAgrupamento = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o agrupamento existe
    const existente = await executeQuery(
      'SELECT id FROM agrupamentos_periodicidade WHERE id = ? AND ativo = TRUE',
      [id]
    );
    
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Agrupamento não encontrado' });
    }

    // Soft delete do agrupamento
    await executeQuery(
      'UPDATE agrupamentos_periodicidade SET ativo = FALSE, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    // Soft delete das vinculações relacionadas
    await Promise.all([
      executeQuery(
        'UPDATE agrupamentos_escolas SET ativo = FALSE, atualizado_em = NOW() WHERE agrupamento_id = ?',
        [id]
      ),
      executeQuery(
        'UPDATE agrupamentos_produtos SET ativo = FALSE, atualizado_em = NOW() WHERE agrupamento_id = ?',
        [id]
      )
    ]);

    res.json({
      success: true,
      message: 'Agrupamento excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir agrupamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Vincular escolas ao agrupamento
 */
const vincularEscolas = async (req, res) => {
  try {
    const { id } = req.params;
    const { escolas } = req.body;

    if (!escolas || !Array.isArray(escolas)) {
      return res.status(400).json({ error: 'Lista de escolas é obrigatória'
      });
    }

    // Verificar se o agrupamento existe
    const agrupamento = await executeQuery(
      'SELECT id FROM agrupamentos_periodicidade WHERE id = ? AND ativo = TRUE',
      [id]
    );
    
    if (agrupamento.length === 0) {
      return res.status(404).json({ error: 'Agrupamento não encontrado' });
    }

    // Verificar se as escolas existem
    const escolasIds = escolas.map(escola => escola.id || escola);
    const escolasExistentes = await executeQuery(
      `SELECT id FROM unidades_escolares WHERE id IN (${escolasIds.map(() => '?').join(',')}) AND ativo = TRUE`,
      escolasIds
    );
    
    if (escolasExistentes.length !== escolasIds.length) {
      return res.status(400).json({ error: 'Uma ou mais escolas não foram encontradas'
      });
    }

    // Remover vinculações existentes
    await executeQuery(
      'UPDATE agrupamentos_escolas SET ativo = FALSE, atualizado_em = NOW() WHERE agrupamento_id = ?',
      [id]
    );

    // Inserir novas vinculações
    if (escolasIds.length > 0) {
      const insertQuery = `
        INSERT INTO agrupamentos_escolas (agrupamento_id, unidade_escolar_id, ativo)
        VALUES ${escolasIds.map(() => '(?, ?, TRUE)').join(', ')}
      `;
      
      const valores = [];
      escolasIds.forEach(escolaId => {
        valores.push(id, escolaId);
      });
      
      await executeQuery(insertQuery, valores);
    }

    res.json({
      success: true,
      message: 'Escolas vinculadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao vincular escolas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar escolas vinculadas ao agrupamento
 */
const buscarEscolasVinculadas = async (req, res) => {
  try {
    const { id } = req.params;

    const escolas = await executeQuery(`
      SELECT 
        ae.id,
        ae.agrupamento_id,
        ae.unidade_escolar_id,
        ue.nome as escola_nome,
        ue.codigo as escola_codigo,
        ue.endereco as escola_endereco,
        ae.ativo,
        ae.criado_em
      FROM agrupamentos_escolas ae
      LEFT JOIN unidades_escolares ue ON ae.unidade_escolar_id = ue.id
      WHERE ae.agrupamento_id = ? AND ae.ativo = TRUE
      ORDER BY ue.nome ASC
    `, [id]);

    res.json({
      success: true,
      data: escolas,
      message: 'Escolas vinculadas listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar escolas vinculadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar agrupamentos vinculados a uma unidade escolar
 */
const buscarAgrupamentosPorUnidade = async (req, res) => {
  try {
    const { unidadeEscolarId } = req.params;

    const agrupamentos = await executeQuery(`
      SELECT 
        a.id,
        a.nome,
        a.descricao,
        a.tipo_id,
        t.nome as tipo_nome,
        t.descricao as tipo_descricao,
        a.regras_calendario,
        a.ativo,
        a.criado_em,
        a.atualizado_em
      FROM agrupamentos_periodicidade a
      LEFT JOIN tipos_periodicidade t ON a.tipo_id = t.id
      INNER JOIN agrupamentos_escolas ae ON a.id = ae.agrupamento_id
      WHERE ae.unidade_escolar_id = ? AND ae.ativo = TRUE AND a.ativo = TRUE
      ORDER BY a.nome ASC
    `, [unidadeEscolarId]);

    // Parse das regras do calendário
    agrupamentos.forEach(agrupamento => {
      if (agrupamento.regras_calendario) {
        try {
          agrupamento.regras_calendario = JSON.parse(agrupamento.regras_calendario);
        } catch (e) {
          agrupamento.regras_calendario = null;
        }
      }
    });

    res.json({
      success: true,
      data: agrupamentos,
      message: 'Agrupamentos da unidade escolar listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar agrupamentos da unidade escolar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  criarAgrupamento,
  buscarAgrupamentoPorId,
  atualizarAgrupamento,
  excluirAgrupamento,
  vincularEscolas,
  buscarEscolasVinculadas,
  buscarAgrupamentosPorUnidade
};