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

    // Buscar grupo do primeiro produto para validação e geração de ID (todos os produtos devem ser do mesmo grupo)
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

    // Validar se grupo foi encontrado (necessário para gerar ID)
    if (!grupoIdPrincipal) {
      return res.status(400).json({
        success: false,
        error: 'Grupo não encontrado',
        message: 'Não foi possível identificar o grupo do produto. Verifique se o produto está cadastrado corretamente.'
      });
    }

    // Buscar ID da semana na tabela calendario usando semana_consumo
    // Como cada dia tem um ID e a semana_consumo se repete, pegamos o primeiro ID daquela semana
    let semanaId = null;
    
    if (semana_consumo) {
      try {
        // Tentativa 1: Busca exata por semana_consumo - pegar o primeiro ID (menor ID daquela semana)
        const semanaCalendarioExata = await executeQuery(`
          SELECT id as semana_id
          FROM foods_db.calendario
          WHERE semana_consumo = ?
          ORDER BY id ASC
          LIMIT 1
        `, [semana_consumo]);
        
        if (semanaCalendarioExata.length > 0 && semanaCalendarioExata[0].semana_id) {
          semanaId = semanaCalendarioExata[0].semana_id;
        } else {
          // Tentativa 2: Busca com LIKE (caso haja diferenças de formatação)
          const semanaLimpa = semana_consumo.replace(/[()]/g, '').trim();
          const semanaCalendarioLike = await executeQuery(`
            SELECT id as semana_id
            FROM foods_db.calendario
            WHERE REPLACE(REPLACE(semana_consumo, '(', ''), ')', '') LIKE ?
            ORDER BY id ASC
            LIMIT 1
          `, [`%${semanaLimpa}%`]);
          
          if (semanaCalendarioLike.length > 0 && semanaCalendarioLike[0].semana_id) {
            semanaId = semanaCalendarioLike[0].semana_id;
          } else {
            // Tentativa 3: Buscar pela semana_consumo_inicio (mais confiável, usa data)
            // Extrair data do formato da semana_consumo se possível
            // Formato esperado: "(DD/MM a DD/MM/YY)" ou similar
            const dataMatch = semana_consumo.match(/(\d{2})\/(\d{2})/);
            if (dataMatch) {
              const dia = dataMatch[1];
              const mes = dataMatch[2];
              // Tentar buscar pelo ano atual ou próximo
              const anoAtual = new Date().getFullYear();
              for (let ano = anoAtual; ano >= anoAtual - 1; ano--) {
                try {
                  const dataInicio = `${ano}-${mes}-${dia}`;
                  const semanaPorData = await executeQuery(`
                    SELECT id as semana_id
                    FROM foods_db.calendario
                    WHERE semana_consumo_inicio = ?
                    ORDER BY id ASC
                    LIMIT 1
                  `, [dataInicio]);
                  
                  if (semanaPorData.length > 0 && semanaPorData[0].semana_id) {
                    semanaId = semanaPorData[0].semana_id;
                    break;
                  }
                } catch (err) {
                  // Continuar tentando
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar ID da semana no calendário:', error);
        // Continuar com hash de fallback se houver erro
      }
    }
    
    // Se ainda não encontrou, usar hash da semana_consumo como fallback
    // Mesmo padrão usado no roteamento
    if (!semanaId) {
      let hash = 0;
      const semanaParaHash = semana_consumo || '';
      for (let i = 0; i < semanaParaHash.length; i++) {
        const char = semanaParaHash.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      semanaId = Math.abs(hash) % 100000; // Limitar a 5 dígitos
    }
    
    // Gerar necessidade_id no formato: SEMANAID-ESCOLAID-GRUPOID
    // Exemplo: 12345-678-90
    const necessidadeId = `${semanaId}-${escola_id}-${grupoIdPrincipal}`;

    // Buscar a nutricionista vinculada à escola
    const nutricionistaEscola = await buscarNutricionistaDaEscola(escola_id);
    
    if (!nutricionistaEscola) {
      return res.status(400).json({
        success: false,
        error: 'Nutricionista não encontrada',
        message: `Nenhuma nutricionista vinculada à escola "${escola_nome}". Verifique as rotas nutricionistas.`
      });
    }

    // SEMPRE calcular semana_abastecimento programaticamente (semana anterior) quando temos semana_consumo
    // Ignorar o valor do frontend pois pode estar incorreto - usar apenas como fallback se cálculo falhar
    // Usando a mesma lógica do Gerar Pedido Padrão que funciona corretamente
    // Como os dados no banco podem estar incorretos, é melhor sempre calcular programaticamente
    let semanaAbastecimentoFinal = null;
    
    if (semana_consumo) {
      try {
        // Calcular semana de abastecimento (semana anterior) - mesma lógica do Gerar Pedido Padrão
        let data;
        
        // Se for uma string da semana (ex: "(09/02 a 13/02/26)"), converter para data
        if (typeof semana_consumo === 'string' && semana_consumo.includes(' a ')) {
          // Remover parênteses se existirem
          const dataLimpa = semana_consumo.replace(/[()]/g, '');
          // Extrair a primeira data da string (ex: "09/02" de "09/02 a 13/02/26")
          const primeiraData = dataLimpa.split(' a ')[0];
          const [dia, mes] = primeiraData.split('/');
          
          // Extrair ano da string original
          const anoMatch = semana_consumo.match(/\/(\d{2})[)]?$/);
          const ano2digitos = anoMatch ? anoMatch[1] : new Date().getFullYear().toString().slice(-2);
          const ano = parseInt(`20${ano2digitos}`);
          
          data = new Date(ano, parseInt(mes) - 1, parseInt(dia));
        } else {
          data = new Date(semana_consumo);
        }
        
        // Verificar se a data é válida
        if (isNaN(data.getTime())) {
          // Fallback: usar valor do frontend se cálculo falhou
          semanaAbastecimentoFinal = semana_abastecimento || null;
        } else {
          // Calcular o início da semana anterior (segunda-feira)
          const inicioSemanaAnterior = new Date(data);
          inicioSemanaAnterior.setDate(data.getDate() - 7 - data.getDay() + 1); // -7 dias + ajuste para segunda-feira
          
          // Calcular o fim da semana anterior (sexta-feira - apenas 5 dias úteis)
          const fimSemanaAnterior = new Date(inicioSemanaAnterior);
          fimSemanaAnterior.setDate(inicioSemanaAnterior.getDate() + 4);
          
          // Formatar as datas
          const formatarDataSemana = (data) => {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            return `${dia}/${mes}`;
          };
          
          const anoFormatado = fimSemanaAnterior.getFullYear().toString().slice(-2);
          semanaAbastecimentoFinal = `(${formatarDataSemana(inicioSemanaAnterior)} a ${formatarDataSemana(fimSemanaAnterior)}/${anoFormatado})`;
        }
      } catch (error) {
        console.error('Erro ao calcular semana de abastecimento:', error);
        // Em caso de erro, usar valor do frontend como fallback
        semanaAbastecimentoFinal = semana_abastecimento || null;
      }
    } else if (!semana_consumo && semana_abastecimento) {
      // Se não tem semana_consumo mas tem semana_abastecimento, usar o valor recebido
      semanaAbastecimentoFinal = semana_abastecimento;
    }

    // Verificar se já existe necessidade para esta escola/semana/grupo específico
    // Permite criar necessidades de grupos diferentes na mesma semana para a mesma escola
    // Necessidades excluídas já foram movidas para necessidades_excluidas, então não precisamos verificar status
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

      // Truncar escola_rota para evitar erro de tamanho (limite de 255 caracteres)
      const escolaRotaTruncada = escola_rota ? String(escola_rota).substring(0, 255) : '';

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
          escolaRotaTruncada,
          escola_codigo_teknisa || '',
          ajuste || 0, 
          total || 0, // Total calculado automaticamente pelo sistema
          semana_consumo,
          semanaAbastecimentoFinal || null,
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
