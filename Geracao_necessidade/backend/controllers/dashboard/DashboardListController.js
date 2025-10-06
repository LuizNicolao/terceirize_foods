const { query } = require('../../config/database');

const obterDadosRecentes = async (req, res) => {
  try {
    const [
      escolasRecentes,
      produtosRecentes,
      necessidadesRecentes,
      recebimentosRecentes
    ] = await Promise.all([
      query(`
        SELECT id, nome_escola as nome, data_cadastro as created_at 
        FROM escolas 
        WHERE ativo = 1 
        ORDER BY data_cadastro DESC 
        LIMIT 5
      `),
      query(`
        SELECT id, nome, data_cadastro as created_at 
        FROM produtos 
        WHERE ativo = 1 
        ORDER BY data_cadastro DESC 
        LIMIT 5
      `),
      query(`
        SELECT id, produto as descricao, data_preenchimento as created_at 
        FROM necessidades 
        ORDER BY data_preenchimento DESC 
        LIMIT 5
      `),
      query(`
        SELECT id, observacoes, data_cadastro as created_at 
        FROM recebimentos_escolas 
        WHERE ativo = 1 
        ORDER BY data_cadastro DESC 
        LIMIT 5
      `)
    ]);

    const recentes = {
      escolas: escolasRecentes?.[0] || [],
      produtos: produtosRecentes?.[0] || [],
      necessidades: necessidadesRecentes?.[0] || [],
      recebimentos: recebimentosRecentes?.[0] || []
    };

    res.json({
      success: true,
      message: 'Dados recentes carregados com sucesso',
      data: { recentes }
    });
  } catch (error) {
    console.error('Erro ao obter dados recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const obterAtividadesRecentes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Por enquanto, retornar atividades de exemplo
    // Em uma implementação real, você teria uma tabela de auditoria
    const atividades = [
      {
        id: 1,
        tipo: 'escola',
        descricao: 'Nova escola cadastrada: Escola Municipal ABC',
        usuario: 'Admin',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        tipo: 'produto',
        descricao: 'Produto atualizado: Arroz Integral',
        usuario: 'Nutricionista',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        tipo: 'necessidade',
        descricao: 'Nova necessidade registrada',
        usuario: 'Coordenador',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    res.json({
      success: true,
      message: 'Atividades recentes carregadas com sucesso',
      data: { items: atividades.slice(0, limit) }
    });
  } catch (error) {
    console.error('Erro ao obter atividades recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const obterAlertas = async (req, res) => {
  try {
    // Função auxiliar para extrair total de forma segura
    const getTotal = (result) => {
      try {
        return result?.[0]?.[0]?.total || 0;
      } catch (error) {
        console.error('Erro ao extrair total:', error);
        return 0;
      }
    };

    // Consultar necessidades pendentes (necessidades de hoje)
    const [necessidadesPendentes] = await query(`
      SELECT COUNT(*) as total 
      FROM necessidades 
      WHERE DATE(data_preenchimento) = CURDATE()
    `);

    // Consultar recebimentos pendentes (atrasados)
    const [recebimentosPendentes] = await query(`
      SELECT COUNT(*) as total 
      FROM recebimentos_escolas 
      WHERE status_entrega = 'Atrasado' AND ativo = 1
    `);

    const alertas = [];
    const necessidadesTotal = getTotal(necessidadesPendentes);
    const recebimentosTotal = getTotal(recebimentosPendentes);

    if (necessidadesTotal > 0) {
      alertas.push({
        id: 1,
        tipo: 'warning',
        titulo: 'Necessidades Pendentes',
        descricao: `${necessidadesTotal} necessidades aguardando processamento`,
        route: '/necessidades?status=pendente',
        timestamp: new Date().toISOString()
      });
    }

    if (recebimentosTotal > 0) {
      alertas.push({
        id: 2,
        tipo: 'info',
        titulo: 'Recebimentos Pendentes',
        descricao: `${recebimentosTotal} recebimentos aguardando confirmação`,
        route: '/recebimentos-escolas?status=pendente',
        timestamp: new Date().toISOString()
      });
    }

    // Se não há alertas, adicionar um alerta de sucesso
    if (alertas.length === 0) {
      alertas.push({
        id: 3,
        tipo: 'success',
        titulo: 'Sistema Funcionando',
        descricao: 'Todos os processos estão em dia',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Alertas carregados com sucesso',
      data: { items: alertas }
    });
  } catch (error) {
    console.error('Erro ao obter alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  obterDadosRecentes,
  obterAtividadesRecentes,
  obterAlertas
};
