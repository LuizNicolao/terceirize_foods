/**
 * Controller de Listagem de Tipo de Rota
 * Responsável por listar e buscar tipos de rota
 */

const { executeQuery } = require('../../config/database');

class TipoRotaListController {
  // Listar tipos de rota com paginação, busca e filtros
  static async listarTipoRotas(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        grupo_id,
        filial_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(tr.nome LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('tr.status = ?');
        params.push(status);
      }

      // Filtro por grupo
      if (grupo_id) {
        whereConditions.push('tr.grupo_id = ?');
        params.push(grupo_id);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('tr.filial_id = ?');
        params.push(filial_id);
      }

      // Query para contar total de registros únicos (nome + filial_id)
      // Como vamos agrupar depois, precisamos contar registros únicos
      const countQuery = `
        SELECT COUNT(DISTINCT CONCAT(tr.nome, '|', tr.filial_id)) as total 
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal - buscar todos os registros
      const query = `
        SELECT 
          tr.*,
          f.filial as filial_nome,
          g.nome as grupo_nome,
          g.id as grupo_id_valor,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.tipo_rota_id = tr.id AND ue.status = 'ativo') as total_unidades
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY tr.nome ASC, g.nome ASC
      `;

      const tipoRotasRaw = await executeQuery(query, params);

      // Agrupar por nome + filial_id para consolidar múltiplos grupos
      const tipoRotasAgrupados = {};
      
      tipoRotasRaw.forEach(tr => {
        const chave = `${tr.nome}|${tr.filial_id}`;
        
        if (!tipoRotasAgrupados[chave]) {
          tipoRotasAgrupados[chave] = {
            id: tr.id, // Primeiro ID (para compatibilidade)
            nome: tr.nome,
            filial_id: tr.filial_id,
            filial_nome: tr.filial_nome,
            status: tr.status,
            created_at: tr.created_at,
            updated_at: tr.updated_at,
            grupos: [],
            grupos_id: [],
            total_unidades: 0
          };
        }
        
        // Adicionar grupo se não existir
        const grupoJaExiste = tipoRotasAgrupados[chave].grupos.some(g => g.id === tr.grupo_id_valor);
        if (!grupoJaExiste && tr.grupo_id_valor) {
          tipoRotasAgrupados[chave].grupos.push({
            id: tr.grupo_id_valor,
            nome: tr.grupo_nome
          });
          tipoRotasAgrupados[chave].grupos_id.push(tr.grupo_id_valor);
        }
        
        // Somar total de unidades (pode haver duplicação, mas vamos manter o maior valor)
        tipoRotasAgrupados[chave].total_unidades = Math.max(
          tipoRotasAgrupados[chave].total_unidades,
          tr.total_unidades || 0
        );
      });

      // Converter objeto em array e ordenar
      const tipoRotas = Object.values(tipoRotasAgrupados)
        .sort((a, b) => a.nome.localeCompare(b.nome));

      // Aplicar paginação manualmente
      const totalAgrupado = tipoRotas.length;
      const tipoRotasPaginados = tipoRotas.slice(offset, offset + Number(limit));

      // Calcular metadados de paginação
      const totalPages = Math.ceil(totalAgrupado / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: tipoRotasPaginados,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalAgrupado,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search: search || null,
          status: status !== undefined && status !== '' ? status : null,
          grupo_id: grupo_id || null,
          filial_id: filial_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar tipos de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os tipos de rota'
      });
    }
  }

  // Buscar tipo de rota por ID (retorna todos os grupos vinculados)
  static async buscarTipoRotaPorId(req, res) {
    try {
      const { id } = req.params;

      // Buscar o registro específico
      const registroInicial = await executeQuery(
        'SELECT * FROM tipo_rota WHERE id = ?',
        [id]
      );

      if (registroInicial.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de rota não encontrado',
          message: 'O tipo de rota especificado não foi encontrado no sistema'
        });
      }

      const registro = registroInicial[0];

      // Buscar todos os registros relacionados (mesmo nome e filial)
      const query = `
        SELECT 
          tr.*,
          f.filial as filial_nome,
          g.nome as grupo_nome,
          g.id as grupo_id_valor,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.tipo_rota_id = tr.id AND ue.status = 'ativo') as total_unidades
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        WHERE tr.nome = ? AND tr.filial_id = ?
        ORDER BY g.nome ASC
      `;

      const tipoRotas = await executeQuery(query, [registro.nome, registro.filial_id]);

      // Consolidar grupos
      const grupos = tipoRotas
        .filter(tr => tr.grupo_id_valor)
        .map(tr => ({
          id: tr.grupo_id_valor,
          nome: tr.grupo_nome
        }));

      const grupos_id = grupos.map(g => g.id);
      const total_unidades = Math.max(...tipoRotas.map(tr => tr.total_unidades || 0), 0);

      const primeiroRegistro = tipoRotas[0];
      const data = {
        id: primeiroRegistro.id,
        nome: primeiroRegistro.nome,
        filial_id: primeiroRegistro.filial_id,
        filial_nome: primeiroRegistro.filial_nome,
        status: primeiroRegistro.status,
        created_at: primeiroRegistro.created_at,
        updated_at: primeiroRegistro.updated_at,
        grupos: grupos,
        grupos_id: grupos_id,
        total_unidades: total_unidades
      };

      res.json({
        success: true,
        data: data
      });

    } catch (error) {
      console.error('Erro ao buscar tipo de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o tipo de rota'
      });
    }
  }
}

module.exports = TipoRotaListController;

