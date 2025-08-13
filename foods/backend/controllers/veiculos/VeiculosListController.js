/**
 * Controller de Listagem de Veículos
 * Responsável por listar e buscar veículos
 */

const { executeQuery } = require('../../config/database');

class VeiculosListController {
  // Listar veículos com paginação, busca e filtros
  static async listarVeiculos(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        tipo_veiculo,
        categoria,
        filial_id,
        motorista_id
      } = req.query;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(v.placa LIKE ? OR v.modelo LIKE ? OR v.marca LIKE ? OR v.numero_frota LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('v.status = ?');
        params.push(status);
      }

      // Filtro por tipo de veículo
      if (tipo_veiculo) {
        whereConditions.push('v.tipo_veiculo = ?');
        params.push(tipo_veiculo);
      }

      // Filtro por categoria
      if (categoria) {
        whereConditions.push('v.categoria = ?');
        params.push(categoria);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('v.filial_id = ?');
        params.push(filial_id);
      }

      // Filtro por motorista
      if (motorista_id) {
        whereConditions.push('v.motorista_id = ?');
        params.push(motorista_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        LEFT JOIN motoristas m ON v.motorista_id = m.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          v.*,
          f.filial as filial_nome,
          m.nome as motorista_nome
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        LEFT JOIN motoristas m ON v.motorista_id = m.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY v.placa ASC
        LIMIT ${limitNum} OFFSET ${offset}
      `;

      const veiculos = await executeQuery(query, params);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.json({
        success: true,
        data: veiculos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search: search || null,
          status: status !== undefined && status !== '' ? status : null,
          tipo_veiculo: tipo_veiculo || null,
          categoria: categoria || null,
          filial_id: filial_id || null,
          motorista_id: motorista_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar veículos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os veículos'
      });
    }
  }

  // Buscar veículo por ID
  static async buscarVeiculoPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          v.*,
          f.filial as filial_nome,
          m.nome as motorista_nome
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        LEFT JOIN motoristas m ON v.motorista_id = m.id
        WHERE v.id = ?
      `;

      const veiculos = await executeQuery(query, [id]);

      if (veiculos.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Veículo não encontrado',
          message: 'O veículo especificado não foi encontrado no sistema'
        });
      }

      // Log para debug das datas
      const veiculo = veiculos[0];
      console.log('🔍 DEBUG - Datas do veículo:', {
        id: veiculo.id,
        placa: veiculo.placa,
        data_emplacamento: veiculo.data_emplacamento,
        vencimento_licenciamento: veiculo.vencimento_licenciamento,
        vencimento_ipva: veiculo.vencimento_ipva,
        vencimento_dpvat: veiculo.vencimento_dpvat,
        data_ultima_revisao: veiculo.data_ultima_revisao,
        data_ultima_troca_oleo: veiculo.data_ultima_troca_oleo,
        vencimento_alinhamento_balanceamento: veiculo.vencimento_alinhamento_balanceamento,
        proxima_inspecao_veicular: veiculo.proxima_inspecao_veicular,
        data_aquisicao: veiculo.data_aquisicao
      });

      res.json({
        success: true,
        data: veiculo
      });

    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o veículo'
      });
    }
  }
}

module.exports = VeiculosListController;
