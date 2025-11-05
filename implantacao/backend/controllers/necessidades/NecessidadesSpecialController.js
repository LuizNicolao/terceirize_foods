const { executeQuery } = require('../../config/database');

// Função para buscar a nutricionista vinculada à escola
const buscarNutricionistaDaEscola = async (escola_id) => {
  try {
    // Buscar no banco foods_db
    const query = `
      SELECT DISTINCT 
        rn.usuario_id,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM foods_db.rotas_nutricionistas rn
      LEFT JOIN foods_db.usuarios u ON rn.usuario_id = u.id
      WHERE rn.status = 'ativo'
        AND rn.escolas_responsaveis IS NOT NULL 
        AND rn.escolas_responsaveis != ''
        AND FIND_IN_SET(?, rn.escolas_responsaveis) > 0
      LIMIT 1
    `;
    
    const result = await executeQuery(query, [escola_id]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Erro ao buscar nutricionista da escola:', error);
    return null;
  }
};

const gerarNecessidade = async (req, res) => {
  try {
    const { escola_id, escola_nome, escola_rota, escola_codigo_teknisa, semana_consumo, semana_abastecimento, produtos } = req.body;

    // Validar dados obrigatórios
    if (!escola_id || !escola_nome || !semana_consumo || !produtos || !Array.isArray(produtos)) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios',
        message: 'Escola (id e nome), semana de consumo e produtos são obrigatórios'
      });
    }

    // Validar se há produtos válidos
    if (produtos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum produto',
        message: 'Nenhum produto foi enviado para processar'
      });
    }

    // Gerar ID sequencial para esta necessidade
    const ultimoId = await executeQuery(`
      SELECT COALESCE(MAX(CAST(necessidade_id AS UNSIGNED)), 0) as ultimo_id 
      FROM necessidades 
      WHERE necessidade_id REGEXP '^[0-9]+$'
    `);
    
    const proximoId = (ultimoId[0]?.ultimo_id || 0) + 1;
    const necessidadeId = proximoId.toString();

    // Buscar a nutricionista vinculada à escola
    const nutricionistaEscola = await buscarNutricionistaDaEscola(escola_id);
    
    if (!nutricionistaEscola) {
      return res.status(400).json({
        success: false,
        error: 'Nutricionista não encontrada',
        message: `Nenhuma nutricionista vinculada à escola "${escola_nome}". Verifique as rotas nutricionistas.`
      });
    }

    // Buscar grupo do primeiro produto para validação (todos os produtos devem ser do mesmo grupo)
    let grupoPrincipal = null;
    let grupoIdPrincipal = null;
    
    if (produtos.length > 0 && produtos[0].produto_id) {
      const primeiroGrupoResult = await executeQuery(`
        SELECT ppc.grupo, ppc.grupo_id 
        FROM produtos_per_capita ppc 
        WHERE ppc.produto_id = ? 
        LIMIT 1
      `, [produtos[0].produto_id]);
      
      if (primeiroGrupoResult.length > 0) {
        grupoPrincipal = primeiroGrupoResult[0].grupo;
        grupoIdPrincipal = primeiroGrupoResult[0].grupo_id;
      }
    }

    // Verificar se já existe necessidade para esta escola/semana/grupo específico
    // Permite criar necessidades de grupos diferentes na mesma semana para a mesma escola
    if (grupoPrincipal) {
      const existing = await executeQuery(`
        SELECT DISTINCT necessidade_id FROM necessidades 
        WHERE escola_id = ? AND semana_consumo = ? AND grupo = ?
      `, [escola_id, semana_consumo, grupoPrincipal]);

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Necessidade já existe',
          message: `Necessidade para a escola "${escola_nome}" e grupo "${grupoPrincipal}" já gerada nessa semana selecionada, permitido realizar alterações na tela de Ajustes de Necessidade`
        });
      }
    }

    // Inserir necessidades para cada produto
    const necessidadesCriadas = [];
    
    for (const produto of produtos) {
      const { produto_id, produto_nome, produto_unidade, ajuste, total } = produto;

      // Validar dados do produto
      if (!produto_id || !produto_nome) {
        continue; // Pular produto sem dados completos
      }

      // Validar se o ajuste (PEDIDO) foi preenchido
      if (!ajuste || ajuste <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Ajuste obrigatório',
          message: `O produto "${produto_nome}" deve ter um ajuste (PEDIDO) maior que 0`
        });
      }

      // Buscar grupo e grupo_id do produto
      const grupoResult = await executeQuery(`
        SELECT ppc.grupo, ppc.grupo_id 
        FROM produtos_per_capita ppc 
        WHERE ppc.produto_id = ? 
        LIMIT 1
      `, [produto_id]);
      
      const grupo = grupoResult.length > 0 ? grupoResult[0].grupo : null;
      const grupo_id = grupoResult.length > 0 ? grupoResult[0].grupo_id : null;

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
            total,
            semana_consumo,
            semana_abastecimento,
            grupo,
            grupo_id,
            status,
            observacoes,
            necessidade_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          nutricionistaEscola.usuario_email, // Email da nutricionista vinculada à escola
          nutricionistaEscola.usuario_id,   // ID da nutricionista vinculada à escola
          produto_id,
          produto_nome,
          produto_unidade || '',
          escola_id,
          escola_nome,
          escola_rota || '',
          escola_codigo_teknisa || '',
          ajuste || 0, 
          total || 0, // Total calculado automaticamente pelo sistema
          semana_consumo,
          semana_abastecimento || null,
          grupo,
          grupo_id,
          'NEC',
          null,
          necessidadeId
        ]);

        necessidadesCriadas.push({
          id: result.insertId,
          produto: produto_nome,
          ajuste: ajuste || 0,
          status: 'criada'
        });
    }
    
    res.status(201).json({
      success: true,
      message: `Necessidade gerada com sucesso! ${necessidadesCriadas.length} produtos processados.`,
      data: {
        necessidade_id: necessidadeId,
        escola: escola_nome,
        semana_consumo,
        necessidades: necessidadesCriadas
      }
    });
  } catch (error) {
    console.error('Erro ao gerar necessidade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar necessidade'
    });
  }
};

module.exports = {
  gerarNecessidade
};
