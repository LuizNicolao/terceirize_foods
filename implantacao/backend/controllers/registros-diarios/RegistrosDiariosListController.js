const { executeQuery } = require('../../config/database');
const { calcularPeriodoDiasUteis } = require('../../utils/diasUteisUtils');

/**
 * Controller de Listagem de Registros Diários
 */
class RegistrosDiariosListController {
  
  /**
   * Listar registros diários agrupados por data
   */
  static async listar(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;
      const { 
        escola_id,
        data_inicio,
        data_fim,
        page = 1,
        limit = 20
      } = req.query;
      
      let whereClause = 'WHERE rd.ativo = 1';
      let params = [];
      
      // Filtro por tipo de usuário (nutricionista vê apenas suas escolas)
      if (userType === 'nutricionista') {
        whereClause += ' AND rd.nutricionista_id = ?';
        params.push(userId);
      }
      
      // Filtro por escola
      if (escola_id) {
        whereClause += ' AND rd.escola_id = ?';
        params.push(escola_id);
      }
      
      // Filtro por período
      if (data_inicio) {
        whereClause += ' AND rd.data >= ?';
        params.push(data_inicio);
      }
      
      if (data_fim) {
        whereClause += ' AND rd.data <= ?';
        params.push(data_fim);
      }
      
      // Converter para números inteiros ANTES de usar na query
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
      const offsetNum = (pageNum - 1) * limitNum;
      
      // Buscar registros agrupados por escola (apenas o mais recente de cada escola)
      // Pivotear os tipos de refeição em colunas
      // IMPORTANTE: LIMIT e OFFSET interpolados diretamente (números seguros)
      
      // Criar whereClause para subquery (substituir rd. por alias correto)
      const subqueryWhere = whereClause.replace(/rd\./g, 'registros_diarios.');
      
      const query = `
        SELECT 
          rd.escola_id,
          MAX(rd.escola_nome) as escola_nome,
          rd.data,
          rd.nutricionista_id,
          MAX(CASE WHEN rd.tipo_refeicao = 'lanche_manha' THEN rd.valor ELSE 0 END) as lanche_manha,
          MAX(CASE WHEN rd.tipo_refeicao IN ('parcial_manha','parcial') THEN rd.valor ELSE 0 END) as parcial_manha,
          MAX(CASE WHEN rd.tipo_refeicao = 'almoco' THEN rd.valor ELSE 0 END) as almoco,
          MAX(CASE WHEN rd.tipo_refeicao = 'lanche_tarde' THEN rd.valor ELSE 0 END) as lanche_tarde,
          MAX(CASE WHEN rd.tipo_refeicao = 'parcial_tarde' THEN rd.valor ELSE 0 END) as parcial_tarde,
          MAX(CASE WHEN rd.tipo_refeicao = 'parcial' THEN rd.valor ELSE 0 END) as parcial,
          MAX(CASE WHEN rd.tipo_refeicao = 'eja' THEN rd.valor ELSE 0 END) as eja,
          MIN(rd.data_cadastro) as data_cadastro,
          MAX(rd.data_atualizacao) as data_atualizacao
        FROM registros_diarios rd
        INNER JOIN (
          SELECT escola_id, MAX(data) as max_data
          FROM registros_diarios
          ${subqueryWhere}
          GROUP BY escola_id
        ) rd_recente ON rd.escola_id = rd_recente.escola_id AND rd.data = rd_recente.max_data
        ${whereClause}
        GROUP BY rd.escola_id, rd.data, rd.nutricionista_id
        ORDER BY rd.data DESC, rd.escola_id ASC
        LIMIT ${limitNum} OFFSET ${offsetNum}
      `;
      
      const registros = await executeQuery(query, params.concat(params));
      
      // Contar total (apenas escolas únicas)
      const countQuery = `
        SELECT COUNT(DISTINCT rd.escola_id) as total
        FROM registros_diarios rd
        ${whereClause}
      `;
      const countResult = await executeQuery(countQuery, params);
      const totalItems = countResult[0].total;
      
      res.json({
        success: true,
        data: registros,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / parseInt(limit)),
          totalItems: totalItems,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar registros diários:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar registros diários'
      });
    }
  }
  
  /**
   * Listar médias por escola
   */
  static async listarMedias(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;
      const { escola_id } = req.query;
      
      let whereClause = 'WHERE me.ativo = 1';
      let params = [];
      
      // Filtro por tipo de usuário
      if (userType === 'nutricionista') {
        whereClause += ' AND me.nutricionista_id = ?';
        params.push(userId);
      }
      
      // Filtro por escola
      if (escola_id) {
        whereClause += ' AND me.escola_id = ?';
        params.push(escola_id);
      }
      
      const medias = await executeQuery(
        `SELECT me.* FROM media_escolas me ${whereClause} ORDER BY me.escola_id ASC`,
        params
      );
      
      res.json({
        success: true,
        data: medias
      });
    } catch (error) {
      console.error('Erro ao listar médias:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar médias'
      });
    }
  }
  
  /**
   * Listar histórico completo de uma escola (todos os registros)
   */
  static async listarHistorico(req, res) {
    try {
      const { escola_id } = req.query;
      
      if (!escola_id) {
        return res.status(400).json({
          success: false,
          error: 'escola_id é obrigatório'
        });
      }
      
      const historico = await executeQuery(
        `SELECT 
          rd.escola_id,
          MAX(rd.escola_nome) as escola_nome,
          rd.data,
          rd.nutricionista_id,
          MAX(CASE WHEN rd.tipo_refeicao = 'lanche_manha' THEN rd.valor ELSE 0 END) as lanche_manha,
          MAX(CASE WHEN rd.tipo_refeicao IN ('parcial_manha','parcial') THEN rd.valor ELSE 0 END) as parcial_manha,
          MAX(CASE WHEN rd.tipo_refeicao = 'almoco' THEN rd.valor ELSE 0 END) as almoco,
          MAX(CASE WHEN rd.tipo_refeicao = 'lanche_tarde' THEN rd.valor ELSE 0 END) as lanche_tarde,
          MAX(CASE WHEN rd.tipo_refeicao = 'parcial_tarde' THEN rd.valor ELSE 0 END) as parcial_tarde,
          MAX(CASE WHEN rd.tipo_refeicao = 'parcial' THEN rd.valor ELSE 0 END) as parcial,
          MAX(CASE WHEN rd.tipo_refeicao = 'eja' THEN rd.valor ELSE 0 END) as eja,
          MIN(rd.data_cadastro) as data_cadastro,
          MAX(rd.data_atualizacao) as data_atualizacao
        FROM registros_diarios rd
        WHERE rd.escola_id = ? AND rd.ativo = 1
        GROUP BY rd.escola_id, rd.data, rd.nutricionista_id
        ORDER BY rd.data DESC`,
        [escola_id]
      );
      
      res.json({
        success: true,
        data: historico
      });
    } catch (error) {
      console.error('Erro ao listar histórico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar histórico'
      });
    }
  }
  
  /**
   * Calcular médias por período (últimos 20 dias úteis)
   * Usado pela funcionalidade de Gerar Necessidades
   */
  static async calcularMediasPorPeriodo(req, res) {
    try {
      const { escola_id, data } = req.query;
      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;

      if (!escola_id || !data) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros obrigatórios',
          message: 'Escola e data são obrigatórios'
        });
      }

      // Calcular período dos últimos 20 dias úteis
      // IMPORTANTE: Usar a data da semana de consumo, não a data atual
      const dataReferencia = new Date(data);
      
      // Se a data for muito antiga (antes de outubro 2025), usar uma data mais recente
      // que inclua os registros existentes (outubro 2025)
      const dataLimite = new Date('2025-10-01');
      let dataInicio, dataFim;
      
      if (dataReferencia < dataLimite) {
        const dataReferenciaAjustada = new Date('2025-10-16'); // Data dos registros existentes
        const periodoAjustado = calcularPeriodoDiasUteis(dataReferenciaAjustada, 20);
        dataInicio = periodoAjustado.dataInicio;
        dataFim = periodoAjustado.dataFim;
      } else {
        const periodoNormal = calcularPeriodoDiasUteis(dataReferencia, 20);
        dataInicio = periodoNormal.dataInicio;
        dataFim = periodoNormal.dataFim;
      }
      

      let whereClause = 'WHERE rd.ativo = 1 AND rd.escola_id = ? AND rd.data >= ? AND rd.data <= ?';
      let params = [escola_id, dataInicio, dataFim];

      // Se for nutricionista, filtrar apenas escolas associadas
      if (userType === 'nutricionista') {
        whereClause += ' AND rd.nutricionista_id = ?';
        params.push(userId);
      }

      // Buscar registros dos últimos 20 dias úteis e calcular média
      const medias = await executeQuery(`
        SELECT 
          rd.tipo_refeicao,
          SUM(rd.valor) as soma_total,
          COUNT(*) as quantidade_registros,
          COUNT(DISTINCT rd.data) as dias_com_registro,
          CEIL(SUM(rd.valor) / COUNT(*)) as media_correta
        FROM registros_diarios rd
        ${whereClause}
        GROUP BY rd.tipo_refeicao
      `, params);
      
      // Organizar as médias por tipo
      const tiposPermitidos = ['lanche_manha', 'parcial_manha', 'almoco', 'lanche_tarde', 'parcial_tarde', 'eja', 'parcial'];
      const mediasOrganizadas = {};
      
      // Inicializar todos os tipos com valores padrão
      tiposPermitidos.forEach(tipo => {
        mediasOrganizadas[tipo] = {
          media: 0,
          quantidade_registros: 0,
          dias_com_registro: 0
        };
      });

      // Preencher com os dados encontrados
      medias.forEach(media => {
        const tipoOriginal = media.tipo_refeicao;
        let tipoRef = tipoOriginal;

        // Mapear registros legados "parcial" para parcial_manha
        if (tipoOriginal === 'parcial') {
          tipoRef = 'parcial_manha';
        }

        if (tiposPermitidos.includes(tipoRef)) {
          mediasOrganizadas[tipoRef] = {
            media: parseInt(media.media_correta) || 0,
            quantidade_registros: media.quantidade_registros,
            dias_com_registro: media.dias_com_registro
          };
        }
      });

      // Remover chave legada 'parcial' se não houver necessidade
      delete mediasOrganizadas.parcial;

      const temMediaReal = Object.values(mediasOrganizadas).some(
        item => item && typeof item.media === 'number' && item.media > 0
      );

      if (!temMediaReal) {
        const mediasLegadas = await executeQuery(
          `SELECT 
            media_lanche_manha,
            media_parcial_manha,
            media_parcial,
            media_parcial_tarde,
            media_almoco,
            media_lanche_tarde,
            media_eja
          FROM media_escolas
          WHERE escola_id = ?
          ORDER BY data_atualizacao DESC
          LIMIT 1`,
          [escola_id]
        );

        if (mediasLegadas.length > 0) {
          const legada = mediasLegadas[0];
          const obterMedia = (valor, fallback = 0) => {
            const numero = parseInt(valor);
            return Number.isFinite(numero) ? numero : fallback;
          };

          mediasOrganizadas.lanche_manha.media = obterMedia(legada.media_lanche_manha);
          mediasOrganizadas.parcial_manha.media = obterMedia(
            legada.media_parcial_manha,
            legada.media_parcial
          );
          mediasOrganizadas.almoco.media = obterMedia(legada.media_almoco);
          mediasOrganizadas.lanche_tarde.media = obterMedia(legada.media_lanche_tarde);
          mediasOrganizadas.parcial_tarde.media = obterMedia(
            legada.media_parcial_tarde,
            legada.media_parcial
          );
          mediasOrganizadas.eja.media = obterMedia(legada.media_eja);
        }
      }

      res.json({
        success: true,
        data: mediasOrganizadas
      });
    } catch (error) {
      console.error('Erro ao calcular médias por período:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao calcular médias por período'
      });
    }
  }
}

module.exports = RegistrosDiariosListController;

