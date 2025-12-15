const { executeQuery } = require('../../config/database');
const { successResponse, STATUS_CODES, asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller para listagem de Tipos de Cardápio
 * Segue padrão de excelência do sistema
 */
class TiposCardapioListController {
  /**
   * Listar tipos de cardápio com filtros e paginação
   */
  static listar = asyncHandler(async (req, res) => {
    const { search, filial_id, centro_custo_id, contrato_id } = req.query;
    const pagination = req.pagination;

    let baseQuery = `
      SELECT 
        id,
        filial_id,
        filial_nome,
        centro_custo_id,
        centro_custo_nome,
        contrato_id,
        contrato_nome,
        usuario_criador_id,
        usuario_atualizador_id,
        criado_em,
        atualizado_em
      FROM tipos_cardapio
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        filial_nome LIKE ? OR
        centro_custo_nome LIKE ? OR
        contrato_nome LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (filial_id) {
      baseQuery += ` AND filial_id = ?`;
      params.push(filial_id);
    }

    if (centro_custo_id) {
      baseQuery += ` AND centro_custo_id = ?`;
      params.push(centro_custo_id);
    }

    if (contrato_id) {
      baseQuery += ` AND contrato_id = ?`;
      params.push(contrato_id);
    }

    // Buscar TODOS os tipos de cardápio (sem paginação) para poder agrupar
    // A paginação será aplicada após o agrupamento
    const tiposCardapio = await executeQuery(baseQuery, params);

    // Buscar todos os vínculos de tipos de cardápio com unidades
    const todosVinculosUnidades = await executeQuery(
      `SELECT 
        tcu.tipo_cardapio_id,
        tcu.unidade_id,
        tcu.unidade_nome
      FROM tipos_cardapio_unidades tcu`
    );

    // Buscar todos os vínculos de tipos de cardápio com produtos
    const todosVinculosProdutos = await executeQuery(
      `SELECT 
        tcp.tipo_cardapio_id,
        tcp.produto_comercial_id,
        tcp.produto_comercial_nome
      FROM tipos_cardapio_produtos tcp`
    );

    // Agrupar tipos de cardápio por Filial + Centro de Custo + Contrato
    const tiposPorGrupo = new Map();
    
    for (const tipoCardapio of tiposCardapio) {
      // Criar chave única: filial_id + centro_custo_id + contrato_id
      const key = `${tipoCardapio.filial_id || 'sem'}-${tipoCardapio.centro_custo_id || 'sem'}-${tipoCardapio.contrato_id || 'sem'}`;
      
      if (!tiposPorGrupo.has(key)) {
        tiposPorGrupo.set(key, {
          filial_id: tipoCardapio.filial_id,
          filial_nome: tipoCardapio.filial_nome,
          centro_custo_id: tipoCardapio.centro_custo_id,
          centro_custo_nome: tipoCardapio.centro_custo_nome,
          contrato_id: tipoCardapio.contrato_id,
          contrato_nome: tipoCardapio.contrato_nome,
          unidades: new Set(),
          produtos: new Map(),
          primaryRecord: null
        });
      }
      
      const entry = tiposPorGrupo.get(key);
      
      // Adicionar unidades vinculadas a este tipo de cardápio
      const vinculosUnidades = todosVinculosUnidades.filter(v => v.tipo_cardapio_id === tipoCardapio.id);
      vinculosUnidades.forEach(v => {
        entry.unidades.add(v.unidade_id);
      });
      
      // Adicionar produtos vinculados a este tipo de cardápio
      const vinculosProdutos = todosVinculosProdutos.filter(v => v.tipo_cardapio_id === tipoCardapio.id);
      vinculosProdutos.forEach(v => {
        if (!entry.produtos.has(v.produto_comercial_id)) {
          entry.produtos.set(v.produto_comercial_id, {
            id: v.produto_comercial_id,
            nome: v.produto_comercial_nome
          });
        }
      });
      
      // Guardar o primeiro registro como primaryRecord para ações
      if (!entry.primaryRecord) {
        entry.primaryRecord = tipoCardapio;
      }
    }

    // Converter para array e formatar
    let agregadosPorGrupo = Array.from(tiposPorGrupo.values()).map(entry => ({
      filial_id: entry.filial_id,
      filial_nome: entry.filial_nome,
      centro_custo_id: entry.centro_custo_id,
      centro_custo_nome: entry.centro_custo_nome,
      contrato_id: entry.contrato_id,
      contrato_nome: entry.contrato_nome,
      total_unidades: entry.unidades.size,
      produtos: Array.from(entry.produtos.values()),
      primaryRecord: entry.primaryRecord
    }));

    // Aplicar filtro de busca nos agregados (se houver)
    if (search) {
      const searchLower = search.toLowerCase();
      agregadosPorGrupo = agregadosPorGrupo.filter(item => 
        item.filial_nome?.toLowerCase().includes(searchLower) ||
        item.centro_custo_nome?.toLowerCase().includes(searchLower) ||
        item.contrato_nome?.toLowerCase().includes(searchLower) ||
        item.produtos.some(p => 
          p.nome?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Ordenação
    const sortBy = req.query.sortBy || 'filial_nome';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    agregadosPorGrupo.sort((a, b) => {
      if (sortBy === 'filial_nome') {
        return sortOrder === 'ASC' 
          ? (a.filial_nome || '').localeCompare(b.filial_nome || '')
          : (b.filial_nome || '').localeCompare(a.filial_nome || '');
      }
      if (sortBy === 'centro_custo_nome') {
        return sortOrder === 'ASC' 
          ? (a.centro_custo_nome || '').localeCompare(b.centro_custo_nome || '')
          : (b.centro_custo_nome || '').localeCompare(a.centro_custo_nome || '');
      }
      if (sortBy === 'contrato_nome') {
        return sortOrder === 'ASC' 
          ? (a.contrato_nome || '').localeCompare(b.contrato_nome || '')
          : (b.contrato_nome || '').localeCompare(a.contrato_nome || '');
      }
      // Ordenação padrão por nome da filial
      return (a.filial_nome || '').localeCompare(b.filial_nome || '');
    });

    // Aplicar paginação nos agregados
    const total = agregadosPorGrupo.length;
    const limit = pagination.limit;
    const offset = pagination.offset;
    const agregadosPaginados = agregadosPorGrupo.slice(offset, offset + limit);

    // Preparar resposta com paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(total, '/api/tipos-cardapio', queryParams);
    
    const response = {
      items: agregadosPaginados,
      pagination: meta.pagination
    };

    return successResponse(res, response, 'Tipos de cardápio listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Exportar tipos de cardápio em JSON
   */
  static exportarJSON = asyncHandler(async (req, res) => {
    const tiposCardapio = await executeQuery(
      `SELECT 
        id,
        nome,
        filial_id,
        filial_nome,
        centro_custo_id,
        centro_custo_nome,
        contrato_id,
        contrato_nome,
        criado_em,
        atualizado_em
      FROM tipos_cardapio
      ORDER BY criado_em DESC`
    );

    // Adicionar contagem de unidades e produtos vinculados
    for (const tipoCardapio of tiposCardapio) {
      const countUnidades = await executeQuery(
        'SELECT COUNT(*) as total FROM tipos_cardapio_unidades WHERE tipo_cardapio_id = ?',
        [tipoCardapio.id]
      );
      tipoCardapio.total_unidades_vinculadas = countUnidades[0]?.total || 0;

      const countProdutos = await executeQuery(
        'SELECT COUNT(*) as total FROM tipos_cardapio_produtos WHERE tipo_cardapio_id = ?',
        [tipoCardapio.id]
      );
      tipoCardapio.total_produtos_vinculados = countProdutos[0]?.total || 0;
    }

    return successResponse(res, tiposCardapio, 'Tipos de cardápio exportados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar unidades vinculadas a um tipo de cardápio
   */
  static buscarUnidadesVinculadas = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar vínculos
    const vinculos = await executeQuery(
      `SELECT 
        id,
        unidade_id,
        unidade_nome,
        criado_em
      FROM tipos_cardapio_unidades
      WHERE tipo_cardapio_id = ?
      ORDER BY criado_em DESC`,
      [id]
    );

    return successResponse(
      res,
      vinculos,
      'Unidades vinculadas encontradas com sucesso',
      STATUS_CODES.OK
    );
  });

  /**
   * Buscar produtos vinculados a um tipo de cardápio
   */
  static buscarProdutosVinculados = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar vínculos
    const vinculos = await executeQuery(
      `SELECT 
        id,
        produto_comercial_id,
        produto_comercial_nome,
        criado_em
      FROM tipos_cardapio_produtos
      WHERE tipo_cardapio_id = ?
      ORDER BY criado_em DESC`,
      [id]
    );

    return successResponse(
      res,
      vinculos,
      'Produtos vinculados encontrados com sucesso',
      STATUS_CODES.OK
    );
  });

  /**
   * Buscar todos os tipos de cardápio vinculados a uma lista de unidades
   */
  static buscarTiposCardapioPorUnidades = asyncHandler(async (req, res) => {
    let unidades_ids = req.query.unidades_ids || req.query['unidades_ids[]'];
    
    // Se não encontrou, tentar buscar todos os parâmetros que começam com unidades_ids
    if (!unidades_ids) {
      const allKeys = Object.keys(req.query);
      unidades_ids = allKeys
        .filter(key => key.startsWith('unidades_ids'))
        .map(key => req.query[key])
        .flat();
    }
    
    // Se for string, tentar parsear como JSON ou dividir por vírgula
    if (typeof unidades_ids === 'string') {
      try {
        unidades_ids = JSON.parse(unidades_ids);
      } catch {
        unidades_ids = unidades_ids.split(',').map(id => id.trim());
      }
    }
    
    // Se não for array, tentar converter
    if (!Array.isArray(unidades_ids)) {
      unidades_ids = [unidades_ids].filter(Boolean);
    }

    if (!unidades_ids || unidades_ids.length === 0) {
      return successResponse(res, { vinculos: {}, tipos_cardapio: [] }, 'Nenhuma unidade informada', STATUS_CODES.OK);
    }

    // Converter para números
    const unidadesIds = unidades_ids.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);

    if (unidadesIds.length === 0) {
      return successResponse(res, {}, 'IDs de unidades inválidos', STATUS_CODES.OK);
    }

    // Verificar se deve incluir vínculos inativos (para edição)
    const includeInactive = req.query.include_inactive === 'true' || req.query.include_inactive === '1';
    
    // Buscar todos os tipos de cardápio vinculados a essas unidades
    const placeholders = unidadesIds.map(() => '?').join(',');
    const statusFilter = includeInactive ? '' : "AND ctc.status = 'ativo'";
    
    let vinculos = [];
    try {
      vinculos = await executeQuery(
        `SELECT DISTINCT
          ctc.tipo_cardapio_id,
          ctc.cozinha_industrial_id,
          ctc.status as vinculo_status
        FROM cozinha_industrial_tipos_cardapio ctc
        WHERE ctc.cozinha_industrial_id IN (${placeholders})
          ${statusFilter}
        ORDER BY ctc.tipo_cardapio_id`,
        unidadesIds
      );
    } catch (error) {
      // Se a tabela não existir ainda, retornar vazio
      if (error.code === 'ER_NO_SUCH_TABLE' && error.sqlMessage?.includes('cozinha_industrial_tipos_cardapio')) {
        return successResponse(res, { vinculos: {}, tipos_cardapio: [] }, 'Tabela de vínculos não existe ainda', STATUS_CODES.OK);
      }
      throw error;
    }

    // Buscar informações dos tipos de cardápio
    const tipoCardapioIds = [...new Set(vinculos.map(v => v.tipo_cardapio_id))];
    
    if (tipoCardapioIds.length === 0) {
      return successResponse(res, { vinculos: {}, tipos_cardapio: [] }, 'Nenhum tipo de cardápio encontrado', STATUS_CODES.OK);
    }

    const tiposCardapioPlaceholders = tipoCardapioIds.map(() => '?').join(',');
    const tiposCardapio = await executeQuery(
      `SELECT id, filial_nome, centro_custo_nome, contrato_nome
       FROM tipos_cardapio
       WHERE id IN (${tiposCardapioPlaceholders})
       ORDER BY filial_nome, contrato_nome`,
      tipoCardapioIds
    );

    // Criar um nome descritivo para cada tipo de cardápio
    const tiposCardapioComNome = tiposCardapio.map(tc => ({
      ...tc,
      nome: `${tc.filial_nome || 'N/A'} - ${tc.contrato_nome || 'N/A'}`
    }));

    // Agrupar vínculos por unidade: { unidade_id: [tipo_cardapio_id1, tipo_cardapio_id2, ...] }
    // Incluir apenas vínculos ativos no agrupamento
    const vinculosPorUnidade = {};
    vinculos.forEach(vinculo => {
      // Incluir apenas se o vínculo estiver ativo
      if (vinculo.vinculo_status === 'ativo') {
        const unidadeId = String(vinculo.cozinha_industrial_id);
        if (!vinculosPorUnidade[unidadeId]) {
          vinculosPorUnidade[unidadeId] = [];
        }
        if (!vinculosPorUnidade[unidadeId].includes(vinculo.tipo_cardapio_id)) {
          vinculosPorUnidade[unidadeId].push(vinculo.tipo_cardapio_id);
        }
      }
    });

    return successResponse(
      res,
      {
        vinculos: vinculosPorUnidade,
        tipos_cardapio: tiposCardapioComNome
      },
      'Tipos de cardápio vinculados encontrados com sucesso',
      STATUS_CODES.OK
    );
  });
}

module.exports = TiposCardapioListController;

