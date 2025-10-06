/**
 * Controller de Exportação de Necessidades da Merenda
 * Responsável por exportar necessidades em diferentes formatos
 */

const { executeQuery } = require('../../config/database');
const { logAction } = require('../../utils/audit');

class NecessidadesMerendaExportController {
  // Exportar necessidades para Excel
  static async exportarParaExcel(req, res) {
    try {
      const { 
        filial_id,
        unidade_escolar_id,
        data_inicio,
        data_fim,
        formato = 'por_data' // por_data, por_produto, por_unidade
      } = req.query;

      let whereConditions = ['1=1'];
      let params = [];

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('ue.filial_id = ?');
        params.push(filial_id);
      }

      // Filtro por unidade escolar
      if (unidade_escolar_id) {
        whereConditions.push('nm.unidade_escolar_id = ?');
        params.push(unidade_escolar_id);
      }

      // Filtro por período
      if (data_inicio) {
        whereConditions.push('nm.data >= ?');
        params.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('nm.data <= ?');
        params.push(data_fim);
      }

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      if (isNutricionista) {
        whereConditions.push(`
          ue.filial_id IN (
            SELECT uf.filial_id 
            FROM usuarios_filiais uf 
            WHERE uf.usuario_id = ?
          )
        `);
        params.push(req.user.id);
      }

      const whereClause = whereConditions.join(' AND ');

      let query;
      let filename;

      switch (formato) {
        case 'por_data':
          query = `
            SELECT 
              nm.data,
              ue.nome_escola as unidade_escolar,
              f.nome as filial,
              p.nome as produto,
              p.unidade as produto_unidade,
              nm.quantidade_padrao,
              nm.quantidade_nae,
              nm.quantidade_total,
              nm.status
            FROM necessidades_cardapio nm
            LEFT JOIN unidades_escolares ue ON nm.unidade_escolar_id = ue.id
            LEFT JOIN filiais f ON ue.filial_id = f.id
            LEFT JOIN produtos p ON nm.produto_id = p.id
            WHERE ${whereClause}
            ORDER BY nm.data, ue.nome_escola, p.nome
          `;
          filename = `necessidades_por_data_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;

        case 'por_produto':
          query = `
            SELECT 
              p.nome as produto,
              p.unidade as produto_unidade,
              COUNT(DISTINCT nm.unidade_escolar_id) as total_unidades,
              COUNT(DISTINCT nm.data) as total_dias,
              SUM(nm.quantidade_padrao) as quantidade_padrao_total,
              SUM(nm.quantidade_nae) as quantidade_nae_total,
              SUM(nm.quantidade_total) as quantidade_total,
              AVG(nm.quantidade_total) as quantidade_media_por_dia
            FROM necessidades_cardapio nm
            LEFT JOIN unidades_escolares ue ON nm.unidade_escolar_id = ue.id
            LEFT JOIN filiais f ON ue.filial_id = f.id
            LEFT JOIN produtos p ON nm.produto_id = p.id
            WHERE ${whereClause}
            GROUP BY nm.produto_id, p.nome, p.unidade
            ORDER BY quantidade_total DESC
          `;
          filename = `necessidades_por_produto_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;

        case 'por_unidade':
          query = `
            SELECT 
              ue.nome_escola as unidade_escolar,
              f.nome as filial,
              COUNT(DISTINCT nm.produto_id) as total_produtos,
              COUNT(DISTINCT nm.data) as total_dias,
              SUM(nm.quantidade_padrao) as quantidade_padrao_total,
              SUM(nm.quantidade_nae) as quantidade_nae_total,
              SUM(nm.quantidade_total) as quantidade_total
            FROM necessidades_cardapio nm
            LEFT JOIN unidades_escolares ue ON nm.unidade_escolar_id = ue.id
            LEFT JOIN filiais f ON ue.filial_id = f.id
            WHERE ${whereClause}
            GROUP BY nm.unidade_escolar_id, ue.nome_escola, f.nome
            ORDER BY quantidade_total DESC
          `;
          filename = `necessidades_por_unidade_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Formato de exportação inválido. Use: por_data, por_produto ou por_unidade'
          });
      }

      const dados = await executeQuery(query, params);

      // Registrar auditoria
      await logAction(req.user?.id, 'export', 'necessidades_cardapio', {
        acao: 'exportar_excel',
        formato,
        total_registros: dados.length,
        filtros: {
          filial_id,
          unidade_escolar_id,
          data_inicio,
          data_fim
        }
      });

      // Por enquanto, retornar os dados em JSON
      // Em produção, implementar geração real do Excel
      res.json({
        success: true,
        message: 'Dados preparados para exportação',
        data: {
          filename,
          formato,
          total_registros: dados.length,
          dados
        }
      });

    } catch (error) {
      console.error('Erro ao exportar necessidades:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Exportar lista de compras
  static async exportarListaCompras(req, res) {
    try {
      const { 
        filial_id,
        unidade_escolar_id,
        data_inicio,
        data_fim,
        incluir_nae = true
      } = req.query;

      let whereConditions = ['1=1'];
      let params = [];

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('ue.filial_id = ?');
        params.push(filial_id);
      }

      // Filtro por unidade escolar
      if (unidade_escolar_id) {
        whereConditions.push('nm.unidade_escolar_id = ?');
        params.push(unidade_escolar_id);
      }

      // Filtro por período
      if (data_inicio) {
        whereConditions.push('nm.data >= ?');
        params.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('nm.data <= ?');
        params.push(data_fim);
      }

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      if (isNutricionista) {
        whereConditions.push(`
          ue.filial_id IN (
            SELECT uf.filial_id 
            FROM usuarios_filiais uf 
            WHERE uf.usuario_id = ?
          )
        `);
        params.push(req.user.id);
      }

      const whereClause = whereConditions.join(' AND ');

      // Query para lista de compras
      const query = `
        SELECT 
          p.nome as produto,
          p.unidade as produto_unidade,
          SUM(nm.quantidade_padrao) as quantidade_padrao_total,
          SUM(nm.quantidade_nae) as quantidade_nae_total,
          SUM(nm.quantidade_total) as quantidade_total,
          COUNT(DISTINCT nm.data) as dias_necessarios,
          COUNT(DISTINCT nm.unidade_escolar_id) as unidades_necessarias,
          GROUP_CONCAT(DISTINCT nm.data ORDER BY nm.data SEPARATOR ', ') as datas_necessarias
        FROM necessidades_cardapio nm
        LEFT JOIN unidades_escolares ue ON nm.unidade_escolar_id = ue.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        LEFT JOIN produtos p ON nm.produto_id = p.id
        WHERE ${whereClause}
        GROUP BY nm.produto_id, p.nome, p.unidade
        ORDER BY quantidade_total DESC
      `;

      const listaCompras = await executeQuery(query, params);

      // Calcular resumo
      const resumo = {
        total_produtos: listaCompras.length,
        quantidade_total_geral: listaCompras.reduce((sum, item) => sum + item.quantidade_total, 0),
        quantidade_padrao_total: listaCompras.reduce((sum, item) => sum + item.quantidade_padrao_total, 0),
        quantidade_nae_total: listaCompras.reduce((sum, item) => sum + item.quantidade_nae_total, 0),
        total_unidades: Math.max(...listaCompras.map(item => item.unidades_necessarias)),
        total_dias: Math.max(...listaCompras.map(item => item.dias_necessarios))
      };

      // Registrar auditoria
      await logAction(req.user?.id, 'export', 'necessidades_cardapio', {
        acao: 'exportar_lista_compras',
        total_produtos: resumo.total_produtos,
        incluir_nae,
        filtros: {
          filial_id,
          unidade_escolar_id,
          data_inicio,
          data_fim
        }
      });

      res.json({
        success: true,
        message: 'Lista de compras gerada com sucesso',
        data: {
          resumo,
          lista_compras: listaCompras,
          filtros_aplicados: {
            filial_id,
            unidade_escolar_id,
            data_inicio,
            data_fim,
            incluir_nae
          }
        }
      });

    } catch (error) {
      console.error('Erro ao exportar lista de compras:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Exportar relatório de custos
  static async exportarRelatorioCustos(req, res) {
    try {
      const { 
        filial_id,
        unidade_escolar_id,
        data_inicio,
        data_fim
      } = req.query;

      let whereConditions = ['1=1'];
      let params = [];

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('ue.filial_id = ?');
        params.push(filial_id);
      }

      // Filtro por unidade escolar
      if (unidade_escolar_id) {
        whereConditions.push('nm.unidade_escolar_id = ?');
        params.push(unidade_escolar_id);
      }

      // Filtro por período
      if (data_inicio) {
        whereConditions.push('nm.data >= ?');
        params.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('nm.data <= ?');
        params.push(data_fim);
      }

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      if (isNutricionista) {
        whereConditions.push(`
          ue.filial_id IN (
            SELECT uf.filial_id 
            FROM usuarios_filiais uf 
            WHERE uf.usuario_id = ?
          )
        `);
        params.push(req.user.id);
      }

      const whereClause = whereConditions.join(' AND ');

      // Query para relatório de custos
      const query = `
        SELECT 
          p.nome as produto,
          p.unidade as produto_unidade,
          p.preco_unitario,
          SUM(nm.quantidade_padrao) as quantidade_padrao_total,
          SUM(nm.quantidade_nae) as quantidade_nae_total,
          SUM(nm.quantidade_total) as quantidade_total,
          SUM(nm.quantidade_padrao * COALESCE(p.preco_unitario, 0)) as custo_padrao,
          SUM(nm.quantidade_nae * COALESCE(p.preco_unitario, 0)) as custo_nae,
          SUM(nm.quantidade_total * COALESCE(p.preco_unitario, 0)) as custo_total
        FROM necessidades_cardapio nm
        LEFT JOIN unidades_escolares ue ON nm.unidade_escolar_id = ue.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        LEFT JOIN produtos p ON nm.produto_id = p.id
        WHERE ${whereClause}
        GROUP BY nm.produto_id, p.nome, p.unidade, p.preco_unitario
        ORDER BY custo_total DESC
      `;

      const relatorioCustos = await executeQuery(query, params);

      // Calcular totais
      const totais = {
        custo_padrao_total: relatorioCustos.reduce((sum, item) => sum + (item.custo_padrao || 0), 0),
        custo_nae_total: relatorioCustos.reduce((sum, item) => sum + (item.custo_nae || 0), 0),
        custo_total_geral: relatorioCustos.reduce((sum, item) => sum + (item.custo_total || 0), 0),
        total_produtos: relatorioCustos.length
      };

      // Registrar auditoria
      await logAction(req.user?.id, 'export', 'necessidades_cardapio', {
        acao: 'exportar_relatorio_custos',
        custo_total: totais.custo_total_geral,
        filtros: {
          filial_id,
          unidade_escolar_id,
          data_inicio,
          data_fim
        }
      });

      res.json({
        success: true,
        message: 'Relatório de custos gerado com sucesso',
        data: {
          totais,
          relatorio_custos: relatorioCustos,
          filtros_aplicados: {
            filial_id,
            unidade_escolar_id,
            data_inicio,
            data_fim
          }
        }
      });

    } catch (error) {
      console.error('Erro ao exportar relatório de custos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = NecessidadesMerendaExportController;
