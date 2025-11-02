const { executeQuery } = require('../../config/database');

// Buscar semanas de consumo disponíveis na tabela necessidades
const buscarSemanasConsumoDisponiveis = async (req, res) => {
  try {
    const { escola_id, aba } = req.query;
    const usuario_id = req.user.id;
    const tipo_usuario = req.user.tipo_de_acesso;

    // Definir status permitidos baseado na aba
    let statusPermitidos = [];
    if (aba === 'nutricionista') {
      statusPermitidos = ['NEC', 'NEC NUTRI', 'CONF NUTRI'];
    } else if (aba === 'coordenacao') {
      statusPermitidos = ['NEC COORD', 'CONF COORD'];
    } else if (aba === 'logistica') {
      statusPermitidos = ['NEC LOG'];
    } else {
      // Se não especificar aba, usar todos os status (comportamento padrão)
      statusPermitidos = ['NEC', 'NEC NUTRI', 'CONF NUTRI', 'NEC COORD', 'CONF COORD', 'NEC LOG'];
    }

    let query = `
      SELECT DISTINCT 
        n.semana_consumo,
        n.semana_abastecimento
      FROM necessidades n
      WHERE n.semana_consumo IS NOT NULL 
        AND n.semana_consumo != ''
        AND n.status IN (${statusPermitidos.map(() => '?').join(',')})
    `;

    const params = [...statusPermitidos];

    // Se for nutricionista, filtrar apenas pelas escolas da rota dela
    if (tipo_usuario === 'nutricionista') {
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        const userEmail = req.user.email;
        
        const response = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${encodeURIComponent(userEmail)}&status=ativo`, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
          },
          timeout: 5000
        });

        if (response.data && response.data.success) {
          let rotas = response.data.data?.rotas || response.data.data || response.data || [];
          if (!Array.isArray(rotas)) {
            rotas = rotas.rotas || [];
          }
          
          const escolasIds = [];
          rotas.forEach(rota => {
            if (rota.escolas_responsaveis) {
              const ids = rota.escolas_responsaveis.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
              escolasIds.push(...ids);
            }
          });

          if (escolasIds.length > 0) {
            query += ` AND n.escola_id IN (${escolasIds.map(() => '?').join(',')})`;
            params.push(...escolasIds);
          } else {
            query += ' AND 1=0';
          }
        } else {
          query += ' AND 1=0';
        }
      } catch (apiError) {
        console.error('Erro ao buscar rotas do foods:', apiError);
        query += ' AND 1=0';
      }
    }

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
        n.ajuste_coordenacao,
        n.ajuste_logistica,
        n.ajuste_conf_nutri,
        n.ajuste_conf_coord,
        n.necessidade_id,
        n.escola_id,
        n.escola,
        n.semana_consumo,
        n.semana_abastecimento,
        n.status,
        n.data_preenchimento
      FROM necessidades n
      WHERE n.status IN ('NEC', 'NEC NUTRI', 'CONF NUTRI')
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
      // Usar LIKE para comparação flexível, pois a formatação pode ter pequenas variações
      query += ` AND (n.semana_abastecimento = ? OR n.semana_abastecimento LIKE ?)`;
      params.push(semana_abastecimento, `%${semana_abastecimento.replace(/[()]/g, '')}%`);
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

      // Buscar registro atual incluindo o status
      const currentRecord = await executeQuery(`
        SELECT ajuste_nutricionista, ajuste, status FROM necessidades 
        WHERE id = ? AND escola_id = ? AND status IN ('NEC', 'NEC NUTRI', 'CONF NUTRI')
      `, [necessidade_id, escola_id]);

      if (currentRecord.length > 0) {
        const currentValue = currentRecord[0].ajuste_nutricionista;
        const newValue = ajuste_nutricionista || null;
        const currentStatus = currentRecord[0].status;
        
        // Se status for CONF NUTRI, atualizar ajuste_conf_nutri também
        if (currentStatus === 'CONF NUTRI') {
          // Para CONF NUTRI, replicar apenas em ajuste_conf_nutri
          // Usar newValue se digitado, senão manter currentValue
          const valorFinal = newValue !== null ? newValue : currentValue;
          await executeQuery(`
            UPDATE necessidades 
            SET ajuste_conf_nutri = ?,
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = ? AND escola_id = ? AND status = 'CONF NUTRI'
          `, [valorFinal, necessidade_id, escola_id]);
        } else {
          // Se status for NEC ou NEC NUTRI, atualizar apenas ajuste_nutricionista
          await executeQuery(`
            UPDATE necessidades 
            SET ajuste_nutricionista = COALESCE(?, ajuste_nutricionista),
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = ? AND escola_id = ? AND status IN ('NEC', 'NEC NUTRI')
          `, [newValue, necessidade_id, escola_id]);
        }
        
        updatedCount++;
      }
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
    const { escola_id, grupo, periodo, produto_id, quantidade } = req.body;

    // Validar dados obrigatórios
    if (!escola_id || !grupo || !produto_id) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios',
        message: 'escola_id, grupo e produto_id são obrigatórios'
      });
    }

    // Verificar se o produto pertence ao grupo e buscar grupo_id
    const produtoGrupo = await executeQuery(`
      SELECT ppc.produto_id, ppc.produto_nome, ppc.unidade_medida, ppc.produto_codigo, ppc.grupo, ppc.grupo_id
      FROM produtos_per_capita ppc
      WHERE ppc.produto_id = ? AND ppc.grupo = ? AND ppc.ativo = true
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

    // Buscar dados da escola e necessidade_id das necessidades existentes
    // IMPORTANTE: Buscar também usuario_email e usuario_id para manter consistência
    // Usar semana_consumo e semana_abastecimento enviados pelo frontend
    const { semana_consumo, semana_abastecimento } = req.body;
    
    const escolaExistente = await executeQuery(`
      SELECT escola, escola_rota, codigo_teknisa, necessidade_id, semana_consumo as semana_consumo_existente, semana_abastecimento as semana_abastecimento_existente, usuario_email, usuario_id
      FROM necessidades 
      WHERE escola_id = ? 
      LIMIT 1
    `, [escola_id]);

    if (escolaExistente.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Escola não encontrada',
        message: 'Escola não encontrada'
      });
    }

    // Garantir que valores undefined sejam null (requisito do mysql2)
    const semanaConsumoFinal = semana_consumo || escolaExistente[0].semana_consumo_existente || null;
    const semanaAbastecimentoFinal = semana_abastecimento || escolaExistente[0].semana_abastecimento_existente || null;

    const escolaData = {
      nome_escola: escolaExistente[0].escola,
      rota: escolaExistente[0].escola_rota,
      codigo_teknisa: escolaExistente[0].codigo_teknisa,
      necessidade_id: escolaExistente[0].necessidade_id,
      semana_consumo: semanaConsumoFinal,
      semana_abastecimento: semanaAbastecimentoFinal,
      usuario_email: escolaExistente[0].usuario_email,
      usuario_id: escolaExistente[0].usuario_id
    };

    // Determinar status baseado no status atual do conjunto
    const statusConjunto = await executeQuery(`
      SELECT DISTINCT status FROM necessidades 
      WHERE escola_id = ? AND status IN ('NEC', 'NEC NUTRI', 'CONF NUTRI')
      LIMIT 1
    `, [escola_id]);

    // Manter o status atual ou usar NEC como padrão
    let novoStatus = 'NEC';
    if (statusConjunto.length > 0) {
      const statusAtual = statusConjunto[0].status;
      if (statusAtual === 'NEC NUTRI' || statusAtual === 'CONF NUTRI') {
        novoStatus = statusAtual;
      }
    }

    // Determinar em qual coluna salvar baseado no status
    const qtdFinal = quantidade || 0;
    let ajuste = 0;  // ajuste sempre deve ter um valor (NOT NULL)
    let ajuste_nutricionista = null;
    let ajuste_conf_nutri = null;

    if (novoStatus === 'NEC') {
      ajuste = qtdFinal;
    } else if (novoStatus === 'NEC NUTRI') {
      ajuste_nutricionista = qtdFinal;
    } else if (novoStatus === 'CONF NUTRI') {
      ajuste_conf_nutri = qtdFinal;
    }

    // Criar nova necessidade com o mesmo necessidade_id
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
        grupo,
        grupo_id,
        status,
        observacoes,
        necessidade_id,
        ajuste_nutricionista,
        ajuste_conf_nutri,
        ajuste_conf_coord
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      escolaData.usuario_email,
      escolaData.usuario_id,
      produto_id,
      produto.produto_nome,
      produto.unidade_medida,
      escola_id,
      escolaData.nome_escola,
      escolaData.rota || '',
      escolaData.codigo_teknisa || '',
      ajuste,
      escolaData.semana_consumo,
      escolaData.semana_abastecimento,
      produto.grupo,
      produto.grupo_id,
      novoStatus,
      'Produto extra incluído pela nutricionista',
      escolaData.necessidade_id, // Usar o mesmo necessidade_id
      ajuste_nutricionista,
      ajuste_conf_nutri,
      null // ajuste_conf_coord inicialmente null
    ]);

    res.status(201).json({
      success: true,
      message: 'Produto extra incluído com sucesso',
      data: {
        id: result.insertId,
        produto_id: produto_id,
        produto: produto.produto_nome,
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

  // Atualizar status conforme fluxo:
  // NEC > NEC NUTRI > NEC COORD > NEC LOG > CONF NUTRI > CONF COORD > CONF
  // - De NEC -> NEC COORD: copiar ajuste para ajuste_nutricionista
  // - De NEC NUTRI -> NEC COORD: manter ajuste_nutricionista (já existe)
  // - De CONF NUTRI -> CONF COORD: manter ajuste_conf_nutri (já existe)
  // IMPORTANTE: Fazer em duas etapas para garantir que ajuste_nutricionista seja copiado ANTES de mudar o status
  // Primeiro: copiar ajuste para ajuste_nutricionista quando status = 'NEC'
  await executeQuery(`
      UPDATE necessidades 
      SET ajuste_nutricionista = ajuste
      WHERE escola_id = ? 
        AND status = 'NEC'
        AND produto_id IN (
          SELECT DISTINCT ppc.produto_id 
          FROM produtos_per_capita ppc
          WHERE ppc.grupo = ?
        )
    `, [escola_id, grupo]);

  // Segundo: atualizar status
  let query = `
      UPDATE necessidades 
      SET status = CASE 
          WHEN status = 'NEC' THEN 'NEC COORD'
          WHEN status = 'NEC NUTRI' THEN 'NEC COORD'
          WHEN status = 'CONF NUTRI' THEN 'CONF COORD'
          ELSE status
        END,
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE escola_id = ? 
        AND status IN ('NEC', 'NEC NUTRI', 'CONF NUTRI')
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
    if (escola_id && semana_consumo) {
      // Usar semana_consumo diretamente - comparar produto_id da necessidades com produto_id da produtos_per_capita
      query += ` AND ppc.produto_id NOT IN (
        SELECT DISTINCT n.produto_id 
        FROM necessidades n
        WHERE n.escola_id = ? AND n.semana_consumo = ? AND n.status IN ('NEC', 'NEC NUTRI', 'CONF NUTRI')
      )`;
      params.push(escola_id, semana_consumo);
    } else if (escola_id && consumo_de && consumo_ate) {
      // Fallback para consumo_de e consumo_ate
      query += ` AND ppc.produto_id NOT IN (
        SELECT DISTINCT n.produto_id 
        FROM necessidades n
        WHERE n.escola_id = ? AND n.semana_consumo BETWEEN ? AND ? AND n.status IN ('NEC', 'NEC NUTRI', 'CONF NUTRI')
      )`;
      params.push(escola_id, consumo_de, consumo_ate);
    }

    query += ` ORDER BY ppc.produto_nome ASC`;

    const produtos = await executeQuery(query, params);


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

// Excluir produto de necessidade em ajuste
const excluirProdutoAjuste = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;
    const tipo_usuario = req.user.tipo_de_acesso;

    // Verificar se o produto existe e tem status apropriado para exclusão
    const produto = await executeQuery(`
      SELECT 
        id, 
        status, 
        escola_id, 
        usuario_id, 
        produto,
        semana_consumo
      FROM necessidades 
      WHERE id = ? AND status NOT IN ('EXCLUÍDO', 'CONF')
    `, [id]);

    if (produto.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado',
        message: 'Produto não encontrado ou não pode ser excluído'
      });
    }

    const produtoData = produto[0];

    // Verificar permissões baseado no tipo de usuário
    if (tipo_usuario === 'nutricionista') {
      // Nutricionista só pode excluir se:
      // 1. O produto tem status 'NEC' (ainda não ajustado pela nutricionista)
      // 2. OU pertence à rota da nutricionista
      
      if (produtoData.status === 'NEC') {
        // Qualquer nutricionista pode excluir produtos não ajustados
      } else if (['NEC NUTRI', 'CONF NUTRI'].includes(produtoData.status)) {
        // Verificar se a nutricionista tem acesso à escola
        const temAcesso = await executeQuery(`
          SELECT 1 FROM rotas_nutricionistas 
          WHERE usuario_id = ? AND escola_id = ? AND ativo = 1
          LIMIT 1
        `, [usuario_id, produtoData.escola_id]);

        if (temAcesso.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'Sem permissão',
            message: 'Você não tem permissão para excluir este produto'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão',
          message: 'Produto não pode ser excluído neste status'
        });
      }
    } else if (tipo_usuario === 'coordenador' || tipo_usuario === 'supervisor' || tipo_usuario === 'administrador') {
      // Coordenador/supervisor/admin pode excluir produtos em NEC COORD, CONF COORD, etc.
      if (!['NEC', 'NEC NUTRI', 'NEC COORD', 'CONF NUTRI', 'CONF COORD'].includes(produtoData.status)) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão',
          message: 'Produto não pode ser excluído neste status'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
        message: 'Você não tem permissão para excluir produtos'
      });
    }

    // Alterar status para EXCLUÍDO (não deletar fisicamente)
    await executeQuery(`
      UPDATE necessidades 
      SET status = 'EXCLUÍDO', data_atualizacao = NOW()
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Produto excluído com sucesso',
      data: {
        produto: produtoData.produto
      }
    });
  } catch (error) {
    console.error('Erro ao excluir produto em ajuste:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir produto'
    });
  }
};

module.exports = {
  buscarSemanasConsumoDisponiveis,
  listarParaAjuste,
  salvarAjustes,
  incluirProdutoExtra,
  liberarCoordenacao,
  buscarProdutosParaModal,
  excluirProdutoAjuste
};
