const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Obter estatísticas da dashboard
router.get('/stats', checkPermission('visualizar'), async (req, res) => {
  try {
    console.log('Iniciando busca de estatísticas da dashboard...');

    // Contar usuários ativos
    const usuariosAtivos = await executeQuery(
      'SELECT COUNT(*) as total FROM usuarios WHERE status = "ativo"'
    );
    console.log('Usuários ativos:', usuariosAtivos[0].total);

    // Contar fornecedores ativos
    const fornecedoresAtivos = await executeQuery(
      'SELECT COUNT(*) as total FROM fornecedores WHERE status = 1'
    );
    console.log('Fornecedores ativos:', fornecedoresAtivos[0].total);

    // Contar produtos ativos
    const produtosAtivos = await executeQuery(
      'SELECT COUNT(*) as total FROM produtos WHERE status = 1'
    );
    console.log('Produtos ativos:', produtosAtivos[0].total);

    // Contar grupos ativos
    const gruposAtivos = await executeQuery(
      'SELECT COUNT(*) as total FROM grupos WHERE status = 1'
    );
    console.log('Grupos ativos:', gruposAtivos[0].total);

    // Contar unidades ativas
    const unidadesAtivas = await executeQuery(
      'SELECT COUNT(*) as total FROM unidades_medida WHERE status = 1'
    );
    console.log('Unidades ativas:', unidadesAtivas[0].total);

    // Calcular valor total do estoque
    const valorEstoque = await executeQuery(
      'SELECT COALESCE(SUM(preco_custo * estoque_atual), 0) as total FROM produtos WHERE status = 1'
    );
    console.log('Valor estoque:', valorEstoque[0].total);

    // Produtos com estoque baixo
    const produtosEstoqueBaixo = await executeQuery(
      `SELECT COUNT(*) as total FROM produtos 
       WHERE status = 1 AND estoque_atual <= estoque_minimo AND estoque_minimo > 0`
    );
    console.log('Produtos estoque baixo:', produtosEstoqueBaixo[0].total);

    // Últimos produtos criados
    const ultimosProdutos = await executeQuery(
      `SELECT p.nome, p.criado_em, f.razao_social as fornecedor
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       WHERE p.status = 1
       ORDER BY p.criado_em DESC
       LIMIT 5`
    );
    console.log('Últimos produtos:', ultimosProdutos.length);

    // Últimos fornecedores criados
    const ultimosFornecedores = await executeQuery(
      `SELECT razao_social, criado_em
       FROM fornecedores
       WHERE status = 1
       ORDER BY criado_em DESC
       LIMIT 5`
    );
    console.log('Últimos fornecedores:', ultimosFornecedores.length);

    // Últimos grupos criados
    const ultimosGrupos = await executeQuery(
      `SELECT nome, criado_em
       FROM grupos
       WHERE status = 1
       ORDER BY criado_em DESC
       LIMIT 5`
    );
    console.log('Últimos grupos:', ultimosGrupos.length);

    // Últimos usuários criados
    const ultimosUsuarios = await executeQuery(
      `SELECT nome, criado_em
       FROM usuarios
       WHERE status = "ativo"
       ORDER BY criado_em DESC
       LIMIT 5`
    );
    console.log('Últimos usuários:', ultimosUsuarios.length);

    // Atividades recentes (combinação de todas as entidades)
    const atividadesRecentes = await executeQuery(
      `(SELECT 'produto' as tipo, nome as titulo, criado_em as data, 'Produto criado' as acao
        FROM produtos 
        WHERE status = 1
        ORDER BY criado_em DESC 
        LIMIT 3)
       UNION ALL
       (SELECT 'fornecedor' as tipo, razao_social as titulo, criado_em as data, 'Fornecedor criado' as acao
        FROM fornecedores 
        WHERE status = 1
        ORDER BY criado_em DESC 
        LIMIT 3)
       UNION ALL
       (SELECT 'grupo' as tipo, nome as titulo, criado_em as data, 'Grupo criado' as acao
        FROM grupos 
        WHERE status = 1
        ORDER BY criado_em DESC 
        LIMIT 3)
       UNION ALL
       (SELECT 'usuario' as tipo, nome as titulo, criado_em as data, 'Usuário criado' as acao
        FROM usuarios 
        WHERE status = 'ativo'
        ORDER BY criado_em DESC 
        LIMIT 3)
       ORDER BY data DESC
       LIMIT 10`
    );
    console.log('Atividades recentes:', atividadesRecentes.length);

    res.json({
      stats: {
        usuarios: usuariosAtivos[0].total,
        fornecedores: fornecedoresAtivos[0].total,
        produtos: produtosAtivos[0].total,
        grupos: gruposAtivos[0].total,
        unidades: unidadesAtivas[0].total,
        valorEstoque: valorEstoque[0].total || 0,
        produtosEstoqueBaixo: produtosEstoqueBaixo[0].total
      },
      recentes: {
        produtos: ultimosProdutos,
        fornecedores: ultimosFornecedores,
        grupos: ultimosGrupos,
        usuarios: ultimosUsuarios
      },
      atividades: atividadesRecentes
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas da dashboard:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

module.exports = router; 