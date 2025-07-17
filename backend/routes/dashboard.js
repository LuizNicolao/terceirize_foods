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

    // Testar cada query individualmente
    let stats = {
      usuarios: 0,
      fornecedores: 0,
      produtos: 0,
      grupos: 0,
      unidades: 0,
      valorEstoque: 0,
      produtosEstoqueBaixo: 0
    };

    let recentes = {
      produtos: [],
      fornecedores: [],
      grupos: [],
      usuarios: []
    };

    let atividades = [];

    try {
      // Contar usuários ativos
      const usuariosAtivos = await executeQuery(
        'SELECT COUNT(*) as total FROM usuarios WHERE status = "ativo"'
      );
      stats.usuarios = usuariosAtivos[0].total;
      console.log('Usuários ativos:', stats.usuarios);
    } catch (error) {
      console.error('Erro ao contar usuários:', error.message);
    }

    try {
      // Contar fornecedores ativos
      const fornecedoresAtivos = await executeQuery(
        'SELECT COUNT(*) as total FROM fornecedores WHERE status = 1'
      );
      stats.fornecedores = fornecedoresAtivos[0].total;
      console.log('Fornecedores ativos:', stats.fornecedores);
    } catch (error) {
      console.error('Erro ao contar fornecedores:', error.message);
    }

    try {
      // Contar produtos ativos
      const produtosAtivos = await executeQuery(
        'SELECT COUNT(*) as total FROM produtos WHERE status = 1'
      );
      stats.produtos = produtosAtivos[0].total;
      console.log('Produtos ativos:', stats.produtos);
    } catch (error) {
      console.error('Erro ao contar produtos:', error.message);
    }

    try {
      // Contar grupos ativos
      const gruposAtivos = await executeQuery(
        'SELECT COUNT(*) as total FROM grupos WHERE status = 1'
      );
      stats.grupos = gruposAtivos[0].total;
      console.log('Grupos ativos:', stats.grupos);
    } catch (error) {
      console.error('Erro ao contar grupos:', error.message);
    }

    try {
      // Contar unidades ativas
      const unidadesAtivas = await executeQuery(
        'SELECT COUNT(*) as total FROM unidades_medida WHERE status = 1'
      );
      stats.unidades = unidadesAtivas[0].total;
      console.log('Unidades ativas:', stats.unidades);
    } catch (error) {
      console.error('Erro ao contar unidades:', error.message);
    }

    try {
      // Calcular valor total do estoque
      const valorEstoque = await executeQuery(
        'SELECT COALESCE(SUM(preco_custo * estoque_atual), 0) as total FROM produtos WHERE status = 1'
      );
      stats.valorEstoque = valorEstoque[0].total;
      console.log('Valor estoque:', stats.valorEstoque);
    } catch (error) {
      console.error('Erro ao calcular valor estoque:', error.message);
    }

    try {
      // Produtos com estoque baixo
      const produtosEstoqueBaixo = await executeQuery(
        `SELECT COUNT(*) as total FROM produtos 
         WHERE status = 1 AND estoque_atual <= estoque_minimo AND estoque_minimo > 0`
      );
      stats.produtosEstoqueBaixo = produtosEstoqueBaixo[0].total;
      console.log('Produtos estoque baixo:', stats.produtosEstoqueBaixo);
    } catch (error) {
      console.error('Erro ao contar produtos estoque baixo:', error.message);
    }

    try {
      // Últimos produtos criados
      const ultimosProdutos = await executeQuery(
        `SELECT p.nome, p.criado_em, f.razao_social as fornecedor
         FROM produtos p
         LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
         WHERE p.status = 1
         ORDER BY p.criado_em DESC
         LIMIT 5`
      );
      recentes.produtos = ultimosProdutos;
      console.log('Últimos produtos:', recentes.produtos.length);
    } catch (error) {
      console.error('Erro ao buscar últimos produtos:', error.message);
    }

    try {
      // Últimos fornecedores criados
      const ultimosFornecedores = await executeQuery(
        `SELECT razao_social, criado_em
         FROM fornecedores
         WHERE status = 1
         ORDER BY criado_em DESC
         LIMIT 5`
      );
      recentes.fornecedores = ultimosFornecedores;
      console.log('Últimos fornecedores:', recentes.fornecedores.length);
    } catch (error) {
      console.error('Erro ao buscar últimos fornecedores:', error.message);
    }

    try {
      // Últimos grupos criados
      const ultimosGrupos = await executeQuery(
        `SELECT nome, criado_em
         FROM grupos
         WHERE status = 1
         ORDER BY criado_em DESC
         LIMIT 5`
      );
      recentes.grupos = ultimosGrupos;
      console.log('Últimos grupos:', recentes.grupos.length);
    } catch (error) {
      console.error('Erro ao buscar últimos grupos:', error.message);
    }

    try {
      // Últimos usuários criados
      const ultimosUsuarios = await executeQuery(
        `SELECT nome, criado_em
         FROM usuarios
         WHERE status = "ativo"
         ORDER BY criado_em DESC
         LIMIT 5`
      );
      recentes.usuarios = ultimosUsuarios;
      console.log('Últimos usuários:', recentes.usuarios.length);
    } catch (error) {
      console.error('Erro ao buscar últimos usuários:', error.message);
    }

    try {
      // Atividades recentes (simplificada)
      const atividadesRecentes = await executeQuery(
        `SELECT 'produto' as tipo, nome as titulo, criado_em as data, 'Produto criado' as acao
         FROM produtos 
         WHERE status = 1
         ORDER BY criado_em DESC 
         LIMIT 5`
      );
      atividades = atividadesRecentes;
      console.log('Atividades recentes:', atividades.length);
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error.message);
    }

    res.json({
      stats,
      recentes,
      atividades
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas da dashboard:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

module.exports = router; 