const { executeQuery } = require('../../config/database');

class EfetivosListController {


  static async listarEfetivos(req, res) {
    try {
      const { unidade_escolar_id } = req.params;
      const { search, status } = req.query;
      const pagination = req.pagination;

      // Query base - Agrupar efetivos por tipo, intolerância e período de refeição
      let baseQuery = `
        SELECT 
          e.id,
          e.tipo_efetivo,
          e.quantidade,
          e.intolerancia_id,
          e.periodo_refeicao_id,
          i.nome as intolerancia_nome,
          pr.nome as periodo_refeicao_nome
        FROM efetivos e
        LEFT JOIN intolerancias i ON e.intolerancia_id = i.id
        LEFT JOIN periodos_refeicao pr ON e.periodo_refeicao_id = pr.id
        WHERE e.unidade_escolar_id = ?
      `;
      
      let params = [unidade_escolar_id];

      // Aplicar filtros
      if (search) {
        baseQuery += ' AND (e.tipo_efetivo LIKE ? OR i.nome LIKE ? OR pr.nome LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status && status !== 'todos') {
        baseQuery += ' AND e.tipo_efetivo = ?';
        params.push(status);
      }

      baseQuery += ' ORDER BY pr.nome ASC, e.tipo_efetivo ASC, i.nome ASC';

      // Aplicar paginação manualmente
      const limit = pagination.limit;
      const offset = pagination.offset;
      const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
      
      // Executar query paginada
      const efetivos = await executeQuery(query, params);

      // Contar total de efetivos
      let countQuery = `
        SELECT COUNT(*) as total
        FROM efetivos e
        LEFT JOIN intolerancias i ON e.intolerancia_id = i.id
        LEFT JOIN periodos_refeicao pr ON e.periodo_refeicao_id = pr.id
        WHERE e.unidade_escolar_id = ?
      `;
      let countParams = [unidade_escolar_id];
      
      if (search) {
        countQuery += ' AND (e.tipo_efetivo LIKE ? OR i.nome LIKE ? OR pr.nome LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      
      if (status && status !== 'todos') {
        countQuery += ' AND e.tipo_efetivo = ?';
        countParams.push(status);
      }
      
      
      const totalResult = await executeQuery(countQuery, countParams);
      const totalItems = totalResult[0].total;

      // Gerar metadados de paginação
      const queryParams = { ...req.query };
      delete queryParams.page;
      delete queryParams.limit;
      
      const meta = pagination.generateMeta(totalItems, `/api/unidades-escolares/${unidade_escolar_id}/efetivos`, queryParams);

      // Adicionar links HATEOAS
      const efetivosComLinks = efetivos.map(efetivo => ({
        ...efetivo,
        links: [
          { rel: 'self', href: `/efetivos/${efetivo.id}`, method: 'GET' },
          { rel: 'update', href: `/efetivos/${efetivo.id}`, method: 'PUT' },
          { rel: 'delete', href: `/efetivos/${efetivo.id}`, method: 'DELETE' }
        ]
      }));

      res.json({
        success: true,
        data: efetivosComLinks,
        pagination: meta
      });
    } catch (error) {
      console.error('Erro ao listar efetivos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar efetivos agrupados por período (para aba Efetivos da unidade escolar)
  static async listarEfetivosAgrupados(req, res) {
    try {
      const { unidade_escolar_id } = req.params;
      const { search, status } = req.query;

      // Query para buscar dados da tabela unidades_escolares_periodos_refeicao
      let baseQuery = `
        SELECT 
          pr.id,
          pr.codigo,
          pr.nome as periodo_refeicao_nome,
          uepr.quantidade_efetivos_padrao,
          uepr.quantidade_efetivos_nae,
          uepr.id as vinculo_id
        FROM periodos_refeicao pr
        INNER JOIN unidades_escolares_periodos_refeicao uepr ON pr.id = uepr.periodo_refeicao_id
        WHERE uepr.unidade_escolar_id = ?
      `;
      
      let params = [unidade_escolar_id];

      // Aplicar filtros
      if (search) {
        baseQuery += ' AND (pr.nome LIKE ? OR pr.codigo LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      baseQuery += ' ORDER BY pr.nome ASC';

      // Executar query
      const periodos = await executeQuery(baseQuery, params);

      // Transformar dados para o formato esperado pelo frontend
      const efetivosAgrupados = [];

      // Adicionar efetivos PADRÃO
      periodos.forEach(periodo => {
        if (periodo.quantidade_efetivos_padrao > 0) {
          efetivosAgrupados.push({
            id: `padrao_${periodo.id}`,
            tipo_efetivo: 'PADRAO',
            quantidade: periodo.quantidade_efetivos_padrao,
            intolerancia_id: null,
            intolerancia_nome: null,
            periodo_refeicao_id: periodo.id,
            periodo_refeicao_nome: periodo.periodo_refeicao_nome,
            periodo_refeicao_codigo: periodo.codigo
          });
        }
      });

      // Adicionar efetivos NAE
      periodos.forEach(periodo => {
        if (periodo.quantidade_efetivos_nae > 0) {
          efetivosAgrupados.push({
            id: `nae_${periodo.id}`,
            tipo_efetivo: 'NAE',
            quantidade: periodo.quantidade_efetivos_nae,
            intolerancia_id: null,
            intolerancia_nome: 'NAE',
            periodo_refeicao_id: periodo.id,
            periodo_refeicao_nome: periodo.periodo_refeicao_nome,
            periodo_refeicao_codigo: periodo.codigo
          });
        }
      });

      // Aplicar filtro de status se necessário
      let efetivosFiltrados = efetivosAgrupados;
      if (status && status !== 'todos') {
        efetivosFiltrados = efetivosAgrupados.filter(efetivo => efetivo.tipo_efetivo === status);
      }

      res.json({
        success: true,
        data: efetivosFiltrados,
        pagination: {
          totalItems: efetivosFiltrados.length,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: efetivosFiltrados.length
        }
      });

    } catch (error) {
      console.error('Erro ao listar efetivos agrupados:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async buscarEfetivoPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          e.id,
          e.unidade_escolar_id,
          e.tipo_efetivo,
          e.quantidade,
          e.intolerancia_id,
          e.periodo_refeicao_id,
          e.criado_em,
          e.atualizado_em,
          i.nome as intolerancia_nome,
          ue.nome_escola as unidade_escolar_nome,
          pr.nome as periodo_refeicao_nome
        FROM efetivos e
        LEFT JOIN intolerancias i ON e.intolerancia_id = i.id
        LEFT JOIN unidades_escolares ue ON e.unidade_escolar_id = ue.id
        LEFT JOIN periodos_refeicao pr ON e.periodo_refeicao_id = pr.id
        WHERE e.id = ?
      `;

      const [efetivo] = await executeQuery(query, [parseInt(id)]);

      if (!efetivo) {
        return res.status(404).json({
          success: false,
          message: 'Efetivo não encontrado'
        });
      }

      // Adicionar links HATEOAS
      efetivo.links = [
        { rel: 'self', href: `/efetivos/${efetivo.id}`, method: 'GET' },
        { rel: 'update', href: `/efetivos/${efetivo.id}`, method: 'PUT' },
        { rel: 'delete', href: `/efetivos/${efetivo.id}`, method: 'DELETE' }
      ];

      res.json({
        success: true,
        data: efetivo
      });
    } catch (error) {
      console.error('Erro ao buscar efetivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }


}

module.exports = EfetivosListController;
