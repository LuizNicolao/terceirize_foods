/**
 * Controller CRUD de Necessidades da Merenda
 * Responsável por criar, atualizar e excluir necessidades
 */

const { executeQuery } = require('../../config/database');
const { logAction } = require('../../utils/audit');

class NecessidadesMerendaCRUDController {
  // Criar necessidade
  static async criarNecessidade(req, res) {
    try {
      const { 
        cardapio_id, 
        receita_id, 
        data, 
        produto_id, 
        quantidade_padrao, 
        quantidade_nae, 
        quantidade_total, 
        unidade 
      } = req.body;

      // Validações
      if (!cardapio_id || !receita_id || !data || !produto_id) {
        return res.status(400).json({
          success: false,
          message: 'Cardápio, receita, data e produto são obrigatórios'
        });
      }

      if (!quantidade_padrao && !quantidade_nae) {
        return res.status(400).json({
          success: false,
          message: 'Pelo menos uma quantidade (padrão ou NAE) deve ser informada'
        });
      }

      // Verificar se o cardápio existe
      const [cardapio] = await executeQuery(
        'SELECT id FROM cardapios_gerados WHERE id = ?',
        [cardapio_id]
      );

      if (!cardapio) {
        return res.status(404).json({
          success: false,
          message: 'Cardápio não encontrado'
        });
      }

      // Verificar se a receita existe
      const [receita] = await executeQuery(
        'SELECT id FROM receitas_processadas WHERE id = ?',
        [receita_id]
      );

      if (!receita) {
        return res.status(404).json({
          success: false,
          message: 'Receita não encontrada'
        });
      }

      // Verificar se o produto existe
      const [produto] = await executeQuery(
        'SELECT id FROM produtos WHERE id = ?',
        [produto_id]
      );

      if (!produto) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Verificar se já existe uma necessidade para a mesma combinação
      const [existente] = await executeQuery(
        'SELECT id FROM necessidades_cardapio WHERE cardapio_id = ? AND receita_id = ? AND data = ? AND produto_id = ?',
        [cardapio_id, receita_id, data, produto_id]
      );

      if (existente) {
        return res.status(422).json({
          success: false,
          message: 'Já existe uma necessidade para esta combinação de cardápio, receita, data e produto'
        });
      }

      // Inserir necessidade
      const insertQuery = `
        INSERT INTO necessidades_cardapio (
          cardapio_id, receita_id, data, produto_id, 
          quantidade_padrao, quantidade_nae, quantidade_total, unidade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        cardapio_id,
        receita_id,
        data,
        produto_id,
        quantidade_padrao || 0,
        quantidade_nae || 0,
        quantidade_total || (quantidade_padrao || 0) + (quantidade_nae || 0),
        unidade || 'un'
      ]);

      // Buscar necessidade criada
      const [necessidade] = await executeQuery(
        `SELECT 
          nm.id,
          nm.cardapio_id,
          nm.receita_id,
          nm.data,
          nm.produto_id,
          nm.quantidade_padrao,
          nm.quantidade_nae,
          nm.quantidade_total,
          nm.unidade,
          nm.status,
          nm.criado_em,
          ue.nome_escola as unidade_escolar_nome,
          p.nome as produto_nome,
          rp.nome as receita_nome
        FROM necessidades_cardapio nm
        LEFT JOIN cardapios_gerados cg ON nm.cardapio_id = cg.id
        LEFT JOIN unidades_escolares ue ON cg.unidade_id = ue.id
        LEFT JOIN produtos p ON nm.produto_id = p.id
        LEFT JOIN receitas_processadas rp ON nm.receita_id = rp.id
        WHERE nm.id = ?`,
        [result.insertId]
      );

      // Registrar auditoria
      await logAction(req.user?.id, 'create', 'necessidades_cardapio', {
        necessidade_id: result.insertId,
        cardapio_id,
        receita_id,
        data,
        produto_id
      });

      res.status(201).json({
        success: true,
        message: 'Necessidade criada com sucesso',
        data: necessidade
      });
    } catch (error) {
      console.error('Erro ao criar necessidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar necessidade
  static async atualizarNecessidade(req, res) {
    try {
      const { id } = req.params;
      const { 
        quantidade_padrao, 
        quantidade_nae, 
        quantidade_total, 
        unidade,
        status
      } = req.body;

      // Verificar se a necessidade existe
      const [necessidadeExistente] = await executeQuery(
        'SELECT * FROM necessidades_cardapio WHERE id = ?',
        [id]
      );

      if (!necessidadeExistente) {
        return res.status(404).json({
          success: false,
          message: 'Necessidade não encontrada'
        });
      }

      // Atualizar necessidade
      const updateQuery = `
        UPDATE necessidades_cardapio 
        SET quantidade_padrao = ?, quantidade_nae = ?, quantidade_total = ?, unidade = ?, status = ?
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [
        quantidade_padrao !== undefined ? quantidade_padrao : necessidadeExistente.quantidade_padrao,
        quantidade_nae !== undefined ? quantidade_nae : necessidadeExistente.quantidade_nae,
        quantidade_total !== undefined ? quantidade_total : necessidadeExistente.quantidade_total,
        unidade || necessidadeExistente.unidade,
        status || necessidadeExistente.status,
        id
      ]);

      // Buscar necessidade atualizada
      const [necessidade] = await executeQuery(
        `SELECT 
          nm.id,
          nm.cardapio_id,
          nm.receita_id,
          nm.data,
          nm.produto_id,
          nm.quantidade_padrao,
          nm.quantidade_nae,
          nm.quantidade_total,
          nm.unidade,
          nm.status,
          nm.criado_em,
          ue.nome_escola as unidade_escolar_nome,
          p.nome as produto_nome,
          rp.nome as receita_nome
        FROM necessidades_cardapio nm
        LEFT JOIN cardapios_gerados cg ON nm.cardapio_id = cg.id
        LEFT JOIN unidades_escolares ue ON cg.unidade_id = ue.id
        LEFT JOIN produtos p ON nm.produto_id = p.id
        LEFT JOIN receitas_processadas rp ON nm.receita_id = rp.id
        WHERE nm.id = ?`,
        [id]
      );

      // Registrar auditoria
      await logAction(req.user?.id, 'update', 'necessidades_cardapio', {
        necessidade_id: id,
        alteracoes: {
          quantidade_padrao,
          quantidade_nae,
          quantidade_total,
          unidade,
          status
        }
      });

      res.json({
        success: true,
        message: 'Necessidade atualizada com sucesso',
        data: necessidade
      });
    } catch (error) {
      console.error('Erro ao atualizar necessidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Excluir necessidade
  static async excluirNecessidade(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a necessidade existe
      const [necessidade] = await executeQuery(
        'SELECT * FROM necessidades_cardapio WHERE id = ?',
        [id]
      );

      if (!necessidade) {
        return res.status(404).json({
          success: false,
          message: 'Necessidade não encontrada'
        });
      }

      // Excluir necessidade
      await executeQuery('DELETE FROM necessidades_cardapio WHERE id = ?', [id]);

      // Registrar auditoria
      await logAction(req.user?.id, 'delete', 'necessidades_cardapio', {
        necessidade_id: id,
        necessidade_deletada: necessidade
      });

      res.json({
        success: true,
        message: 'Necessidade excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir necessidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar status de múltiplas necessidades
  static async atualizarStatusMultiplas(req, res) {
    try {
      const { ids, status } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de IDs é obrigatória'
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status é obrigatório'
        });
      }

      // Verificar se todas as necessidades existem
      const placeholders = ids.map(() => '?').join(',');
      const [necessidades] = await executeQuery(
        `SELECT id FROM necessidades_cardapio WHERE id IN (${placeholders})`,
        ids
      );

      if (necessidades.length !== ids.length) {
        return res.status(404).json({
          success: false,
          message: 'Uma ou mais necessidades não foram encontradas'
        });
      }

      // Atualizar status
      await executeQuery(
        `UPDATE necessidades_cardapio SET status = ? WHERE id IN (${placeholders})`,
        [status, ...ids]
      );

      // Registrar auditoria
      await logAction(req.user?.id, 'update', 'necessidades_cardapio', {
        acao: 'atualizar_status_multiplas',
        ids,
        status
      });

      res.json({
        success: true,
        message: `${ids.length} necessidades atualizadas com sucesso`,
        data: {
          ids_atualizados: ids,
          status
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar status múltiplas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = NecessidadesMerendaCRUDController;
