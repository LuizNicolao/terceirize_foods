const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse, STATUS_CODES, asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller de Listagem de Cardápios
 * Responsável por operações de listagem, busca e exportação
 */
class CardapiosListController {
  /**
   * Listar cardápios com filtros e paginação
   */
  static listar = asyncHandler(async (req, res) => {
    const {
      search,
      mes_referencia,
      ano_referencia,
      status,
      filial_id,
      centro_custo_id,
      contrato_id,
      produto_comercial_id,
      periodo_atendimento_id
    } = req.query;

    const pagination = req.pagination || {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || pagination.limit || 20;
    const offset = (page - 1) * limit;
    
    const sortField = req.query.sortField || 'criado_em';
    const sortDirection = req.query.sortDirection || 'DESC';

    try {
      // Construir WHERE clause
      let whereConditions = ['1=1'];
      const params = [];

      if (search) {
        whereConditions.push('c.nome LIKE ?');
        params.push(`%${search}%`);
      }

      if (mes_referencia) {
        whereConditions.push('c.mes_referencia = ?');
        params.push(mes_referencia);
      }

      if (ano_referencia) {
        whereConditions.push('c.ano_referencia = ?');
        params.push(ano_referencia);
      }

      if (status) {
        whereConditions.push('c.status = ?');
        params.push(status);
      }

      // Filtros por vínculos (usando subqueries)
      if (filial_id) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM cardapios_filiais cf 
          WHERE cf.cardapio_id = c.id AND cf.filial_id = ?
        )`);
        params.push(filial_id);
      }

      if (centro_custo_id) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM cardapios_centros_custo cc 
          WHERE cc.cardapio_id = c.id AND cc.centro_custo_id = ?
        )`);
        params.push(centro_custo_id);
      }

      if (contrato_id) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM cardapios_contratos ct 
          WHERE ct.cardapio_id = c.id AND ct.contrato_id = ?
        )`);
        params.push(contrato_id);
      }

      if (produto_comercial_id) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM cardapios_produtos_comerciais pc 
          WHERE pc.cardapio_id = c.id AND pc.produto_comercial_id = ?
        )`);
        params.push(produto_comercial_id);
      }

      if (periodo_atendimento_id) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM cardapios_periodos_atendimento pa 
          WHERE pa.cardapio_id = c.id AND pa.periodo_atendimento_id = ?
        )`);
        params.push(periodo_atendimento_id);
      }

      const whereClause = whereConditions.join(' AND ');

      // Construir ORDER BY
      const sortBy = sortField || 'criado_em';
      const sortOrder = sortDirection || 'DESC';
      
      // Mapear campos permitidos
      const fieldMap = {
        nome: 'c.nome',
        mes_referencia: 'c.mes_referencia',
        ano_referencia: 'c.ano_referencia',
        status: 'c.status',
        criado_em: 'c.criado_em',
        atualizado_em: 'c.atualizado_em'
      };
      
      const orderByField = fieldMap[sortBy] || 'c.criado_em';
      const orderBy = `ORDER BY ${orderByField} ${sortOrder}`;

      // Contar total de registros
      const [countResult] = await executeQuery(
        `SELECT COUNT(DISTINCT c.id) as total
         FROM cardapios c
         WHERE ${whereClause}`,
        params
      );

      const total = countResult?.total || 0;

      // Buscar cardápios
      const limitInt = parseInt(limit) || 20;
      const offsetInt = parseInt(offset) || 0;
      const query = `SELECT 
          c.id,
          c.nome,
          c.mes_referencia,
          c.ano_referencia,
          c.numero_semanas,
          c.status,
          c.usuario_criador_id,
          c.usuario_atualizador_id,
          c.criado_em,
          c.atualizado_em
         FROM cardapios c
         WHERE ${whereClause}
         ${orderBy}
         LIMIT ${limitInt} OFFSET ${offsetInt}`;
      
      const cardapios = await executeQuery(query, params);

      // Buscar vínculos para cada cardápio (resumido)
      const cardapioIds = cardapios.map(c => c.id);
      if (cardapioIds.length > 0) {
        const placeholders = cardapioIds.map(() => '?').join(',');

        // Filiais
        const filiais = await executeQuery(
          `SELECT cf.cardapio_id, COUNT(*) as total
           FROM cardapios_filiais cf
           WHERE cf.cardapio_id IN (${placeholders})
           GROUP BY cf.cardapio_id`,
          cardapioIds
        );

        // Centros de custo
        const centrosCusto = await executeQuery(
          `SELECT cc.cardapio_id, COUNT(*) as total
           FROM cardapios_centros_custo cc
           WHERE cc.cardapio_id IN (${placeholders})
           GROUP BY cc.cardapio_id`,
          cardapioIds
        );

        // Contratos
        const contratos = await executeQuery(
          `SELECT ct.cardapio_id, COUNT(*) as total
           FROM cardapios_contratos ct
           WHERE ct.cardapio_id IN (${placeholders})
           GROUP BY ct.cardapio_id`,
          cardapioIds
        );

        // Produtos comerciais
        const produtosComerciais = await executeQuery(
          `SELECT pc.cardapio_id, COUNT(*) as total
           FROM cardapios_produtos_comerciais pc
           WHERE pc.cardapio_id IN (${placeholders})
           GROUP BY pc.cardapio_id`,
          cardapioIds
        );

        // Períodos de atendimento
        const periodosAtendimento = await executeQuery(
          `SELECT pa.cardapio_id, COUNT(*) as total
           FROM cardapios_periodos_atendimento pa
           WHERE pa.cardapio_id IN (${placeholders})
           GROUP BY pa.cardapio_id`,
          cardapioIds
        );

        // Pratos
        const pratos = await executeQuery(
          `SELECT cp.cardapio_id, COUNT(*) as total
           FROM cardapio_pratos cp
           WHERE cp.cardapio_id IN (${placeholders})
           GROUP BY cp.cardapio_id`,
          cardapioIds
        );

        // Adicionar contadores aos cardápios
        const filiaisMap = new Map(filiais.map(f => [f.cardapio_id, f.total]));
        const centrosCustoMap = new Map(centrosCusto.map(cc => [cc.cardapio_id, cc.total]));
        const contratosMap = new Map(contratos.map(ct => [ct.cardapio_id, ct.total]));
        const produtosComerciaisMap = new Map(produtosComerciais.map(pc => [pc.cardapio_id, pc.total]));
        const periodosAtendimentoMap = new Map(periodosAtendimento.map(pa => [pa.cardapio_id, pa.total]));
        const pratosMap = new Map(pratos.map(p => [p.cardapio_id, p.total]));

        cardapios.forEach(cardapio => {
          cardapio.total_filiais = filiaisMap.get(cardapio.id) || 0;
          cardapio.total_centros_custo = centrosCustoMap.get(cardapio.id) || 0;
          cardapio.total_contratos = contratosMap.get(cardapio.id) || 0;
          cardapio.total_produtos_comerciais = produtosComerciaisMap.get(cardapio.id) || 0;
          cardapio.total_periodos_atendimento = periodosAtendimentoMap.get(cardapio.id) || 0;
          cardapio.total_pratos = pratosMap.get(cardapio.id) || 0;
        });
      }

      const totalPages = Math.ceil(total / limit);

      return successResponse(
        res,
        {
          items: cardapios,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        },
        'Cardápios listados com sucesso',
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao listar cardápios:', error);
      return errorResponse(
        res,
        'Erro ao listar cardápios: ' + error.message,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });

  /**
   * Exportar cardápios em JSON
   */
  static exportarJSON = asyncHandler(async (req, res) => {
    const {
      search,
      mes_referencia,
      ano_referencia,
      status
    } = req.query;

    try {
      // Construir WHERE clause (mesma lógica do listar)
      let whereConditions = ['1=1'];
      const params = [];

      if (search) {
        whereConditions.push('c.nome LIKE ?');
        params.push(`%${search}%`);
      }

      if (mes_referencia) {
        whereConditions.push('c.mes_referencia = ?');
        params.push(mes_referencia);
      }

      if (ano_referencia) {
        whereConditions.push('c.ano_referencia = ?');
        params.push(ano_referencia);
      }

      if (status) {
        whereConditions.push('c.status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.join(' AND ');

      // Buscar todos os cardápios (sem paginação)
      const cardapios = await executeQuery(
        `SELECT 
          c.id,
          c.nome,
          c.mes_referencia,
          c.ano_referencia,
          c.numero_semanas,
          c.status,
          c.criado_em,
          c.atualizado_em
         FROM cardapios c
         WHERE ${whereClause}
         ORDER BY c.criado_em DESC`,
        params
      );

      return successResponse(
        res,
        cardapios,
        'Cardápios exportados com sucesso',
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao exportar cardápios:', error);
      return errorResponse(
        res,
        'Erro ao exportar cardápios: ' + error.message,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });
}

module.exports = CardapiosListController;

