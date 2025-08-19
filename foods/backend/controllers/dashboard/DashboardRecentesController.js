/**
 * Controller de Dados Recentes do Dashboard
 * Responsável por buscar dados recentes para exibição no dashboard
 */

const { executeQuery } = require('../../config/database');

class DashboardRecentesController {
  // Obter dados recentes para o dashboard
  static async obterDadosRecentes(req, res) {
    try {
      console.log('Iniciando busca de dados recentes da dashboard...');

      const recentes = {
        produtos: [],
        fornecedores: [],
        clientes: [],
        grupos: [],
        usuarios: [],
        filiais: [],
        rotas: [],
        unidades_escolares: [],
        motoristas: [],
        ajudantes: [],
        veiculos: []
      };

      // ===== DADOS RECENTES =====

      try {
        // Produtos recentes
        const produtosRecentes = await executeQuery(`
          SELECT id, nome, codigo_barras, preco_custo, estoque_atual, created_at
          FROM produtos 
          WHERE status = 1 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.produtos = produtosRecentes;
      } catch (error) {
        console.error('Erro ao buscar produtos recentes:', error.message);
      }

      try {
        // Fornecedores recentes
        const fornecedoresRecentes = await executeQuery(`
          SELECT id, razao_social, nome_fantasia, cnpj, cidade, uf, created_at
          FROM fornecedores 
          WHERE status = 1 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.fornecedores = fornecedoresRecentes;
      } catch (error) {
        console.error('Erro ao buscar fornecedores recentes:', error.message);
      }

      try {
        // Clientes recentes
        const clientesRecentes = await executeQuery(`
          SELECT id, razao_social, nome_fantasia, cnpj, cidade, uf, created_at
          FROM clientes 
          WHERE status = 1 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.clientes = clientesRecentes;
      } catch (error) {
        console.error('Erro ao buscar clientes recentes:', error.message);
      }

      try {
        // Grupos recentes
        const gruposRecentes = await executeQuery(`
          SELECT id, nome, descricao, created_at
          FROM grupos 
          WHERE status = 1 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.grupos = gruposRecentes;
      } catch (error) {
        console.error('Erro ao buscar grupos recentes:', error.message);
      }

      try {
        // Usuários recentes
        const usuariosRecentes = await executeQuery(`
          SELECT id, nome, email, tipo_de_acesso, nivel_de_acesso, created_at
          FROM usuarios 
          WHERE status = "ativo" 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.usuarios = usuariosRecentes;
      } catch (error) {
        console.error('Erro ao buscar usuários recentes:', error.message);
      }

      try {
        // Filiais recentes
        const filiaisRecentes = await executeQuery(`
          SELECT id, nome, endereco, cidade, uf, created_at
          FROM filiais 
          WHERE status = 1 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.filiais = filiaisRecentes;
      } catch (error) {
        console.error('Erro ao buscar filiais recentes:', error.message);
      }

      try {
        // Rotas recentes
        const rotasRecentes = await executeQuery(`
          SELECT id, nome, descricao, created_at
          FROM rotas 
          WHERE status = 1 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.rotas = rotasRecentes;
      } catch (error) {
        console.error('Erro ao buscar rotas recentes:', error.message);
      }

      try {
        // Unidades escolares recentes
        const unidadesEscolaresRecentes = await executeQuery(`
          SELECT id, nome, endereco, cidade, uf, created_at
          FROM unidades_escolares 
          WHERE status = 1 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.unidades_escolares = unidadesEscolaresRecentes;
      } catch (error) {
        console.error('Erro ao buscar unidades escolares recentes:', error.message);
      }

      try {
        // Motoristas recentes
        const motoristasRecentes = await executeQuery(`
          SELECT id, nome, cpf, cnh, categoria_cnh, created_at
          FROM motoristas 
          WHERE status = 1 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.motoristas = motoristasRecentes;
      } catch (error) {
        console.error('Erro ao buscar motoristas recentes:', error.message);
      }

      try {
        // Ajudantes recentes
        const ajudantesRecentes = await executeQuery(`
          SELECT id, nome, cpf, telefone, created_at
          FROM ajudantes 
          WHERE status = 1 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.ajudantes = ajudantesRecentes;
      } catch (error) {
        console.error('Erro ao buscar ajudantes recentes:', error.message);
      }

      try {
        // Veículos recentes
        const veiculosRecentes = await executeQuery(`
          SELECT id, placa, modelo, marca, ano, created_at
          FROM veiculos 
          WHERE status = 1 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        recentes.veiculos = veiculosRecentes;
      } catch (error) {
        console.error('Erro ao buscar veículos recentes:', error.message);
      }

      res.json({
        success: true,
        data: recentes
      });

    } catch (error) {
      console.error('Erro ao obter dados recentes da dashboard:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível carregar os dados recentes da dashboard'
      });
    }
  }
}

module.exports = DashboardRecentesController;
