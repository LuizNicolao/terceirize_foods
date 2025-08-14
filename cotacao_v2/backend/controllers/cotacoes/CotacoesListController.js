/**
 * Controller de Listagem para Cotações
 * Responsável pelas operações de listagem e busca por ID
 */

const { executeQuery } = require('../../config/database');

class CotacoesListController {
  // GET /api/cotacoes - Listar todas as cotações
  static async listarCotacoes(req, res) {
    try {
      // Buscar o usuário no banco (incluindo role)
      const [users] = await executeQuery(`
        SELECT name, role FROM users WHERE id = ?
      `, [req.user.id]);
      
      const userName = users.length > 0 ? users[0].name : 'Administrador';
      const userRole = users.length > 0 ? users[0].role : 'comprador';
      
      // Determinar se o usuário pode ver todas as cotações (apenas gestor e administrador)
      const canViewAllCotacoes = ['gestor', 'administrador'].includes(userRole);
      
      // Buscar cotações - gestor/admin vê todas, supervisor/comprador vê apenas as próprias
      let rows;
      if (canViewAllCotacoes) {
        [rows] = await executeQuery(`
          SELECT 
            c.id,
            c.comprador,
            c.local_entrega,
            c.tipo_compra,
            c.motivo_emergencial,
            c.justificativa,
            c.motivo_final,
            c.status,
            c.data_criacao,
            c.data_atualizacao,
            c.usuario_id,
            u.name as usuario_nome
          FROM cotacoes c
          LEFT JOIN users u ON c.usuario_id = u.id
          ORDER BY c.data_criacao DESC
        `);
      } else {
        [rows] = await executeQuery(`
          SELECT 
            c.id,
            c.comprador,
            c.local_entrega,
            c.tipo_compra,
            c.motivo_emergencial,
            c.justificativa,
            c.motivo_final,
            c.status,
            c.data_criacao,
            c.data_atualizacao,
            c.usuario_id,
            u.name as usuario_nome
          FROM cotacoes c
          LEFT JOIN users u ON c.usuario_id = u.id
          WHERE c.usuario_id = ?
          ORDER BY c.data_criacao DESC
        `, [req.user.id]);
      }
      
      res.success(rows, 'Cotações listadas com sucesso');
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      res.internalError('Erro ao buscar cotações', error);
    }
  }

  // GET /api/cotacoes/:id - Buscar cotação por ID
  static async buscarCotacaoPorId(req, res) {
    try {
      const { id } = req.params;
      
      // Buscar cotação
      const [cotacoes] = await executeQuery(`
        SELECT 
          c.*,
          u.name as usuario_nome
        FROM cotacoes c
        LEFT JOIN users u ON c.usuario_id = u.id
        WHERE c.id = ?
      `, [id]);
      
      if (cotacoes.length === 0) {
        return res.notFound('Cotação não encontrada');
      }
      
      const cotacao = cotacoes[0];
      
      // Buscar produtos da cotação
      const [produtos] = await executeQuery(`
        SELECT * FROM produtos_cotacao WHERE cotacao_id = ?
      `, [id]);
      
      // Sanitizar dados dos produtos
      const produtosSanitizados = produtos.map(produto => ({
        id: produto.id,
        nome: produto.nome || '',
        qtde: produto.qtde || 0,
        un: produto.un || '',
        prazoEntrega: produto.prazo_entrega,
        ultValorAprovado: produto.ult_valor_aprovado,
        ultFornecedorAprovado: produto.ult_fornecedor_aprovado,
        valorAnterior: produto.valor_anterior || 0,
        valorUnitario: produto.valor_unitario || 0,
        difal: produto.difal || 0,
        ipi: produto.ipi || 0,
        dataEntregaFn: produto.data_entrega_fn,
        total: produto.total || 0
      }));
      
      res.json({
        ...cotacao,
        produtos: produtosSanitizados
      });
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      res.internalError('Erro ao buscar cotação', error);
    }
  }

  // GET /api/cotacoes/pendentes-supervisor - Cotações pendentes para supervisor
  static async listarPendentesSupervisor(req, res) {
    try {
      const [rows] = await executeQuery(`
        SELECT 
          c.*,
          u.name as usuario_nome
        FROM cotacoes c
        LEFT JOIN users u ON c.usuario_id = u.id
        WHERE c.status = 'aguardando_aprovacao'
        ORDER BY c.data_criacao DESC
      `);
      
      res.json(rows);
    } catch (error) {
      console.error('Erro ao buscar cotações pendentes:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // GET /api/cotacoes/aprovacoes - Aprovações
  static async listarAprovacoes(req, res) {
    try {
      const [rows] = await executeQuery(`
        SELECT 
          c.*,
          u.name as usuario_nome
        FROM cotacoes c
        LEFT JOIN users u ON c.usuario_id = u.id
        WHERE c.status IN ('aprovada', 'rejeitada')
        ORDER BY c.data_atualizacao DESC
      `);
      
      res.json(rows);
    } catch (error) {
      console.error('Erro ao buscar aprovações:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }
}

module.exports = CotacoesListController;
