const { executeQuery } = require('../config/database');

class VeiculosController {
  // Listar veículos com paginação, busca e filtros
  async listarVeiculos(req, res) {
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

      const offset = (page - 1) * limit;
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
        LIMIT ? OFFSET ?
      `;

      const veiculos = await executeQuery(query, [...params, Number(limit), Number(offset)]);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: veiculos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
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
  async buscarVeiculoPorId(req, res) {
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

      res.json({
        success: true,
        data: veiculos[0]
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

  // Criar veículo
  async criarVeiculo(req, res) {
    try {
      const {
        placa,
        renavam,
        chassi,
        modelo,
        marca,
        ano_fabricacao,
        tipo_veiculo,
        carroceria,
        combustivel,
        categoria,
        capacidade_carga,
        numero_eixos,
        tara,
        peso_bruto_total,
        potencia_motor,
        tipo_tracao,
        quilometragem_atual,
        data_emplacamento,
        vencimento_licenciamento,
        proxima_inspecao_veicular,
        vencimento_ipva,
        vencimento_dpvat,
        status,
        status_detalhado,
        data_aquisicao,
        valor_compra,
        fornecedor,
        numero_frota,
        situacao_financeira,
        foto_veiculo,
        foto_documentacao,
        foto_inspecao,
        observacoes,
        filial_id,
        motorista_id
      } = req.body;

      // Validações específicas
      if (!placa || placa.trim().length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Placa inválida',
          message: 'A placa deve ter pelo menos 6 caracteres'
        });
      }

      // Verificar se placa já existe
      const existingPlaca = await executeQuery(
        'SELECT id FROM veiculos WHERE placa = ?',
        [placa.trim().toUpperCase()]
      );

      if (existingPlaca.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Placa já cadastrada',
          message: 'Já existe um veículo com esta placa'
        });
      }

      // Verificar se a filial existe (se fornecida)
      if (filial_id) {
        const filial = await executeQuery(
          'SELECT id FROM filiais WHERE id = ?',
          [filial_id]
        );

        if (filial.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Filial não encontrada',
            message: 'A filial especificada não foi encontrada'
          });
        }
      }

      // Verificar se o motorista existe (se fornecido)
      if (motorista_id) {
        const motorista = await executeQuery(
          'SELECT id FROM motoristas WHERE id = ?',
          [motorista_id]
        );

        if (motorista.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Motorista não encontrado',
            message: 'O motorista especificado não foi encontrado'
          });
        }
      }

      // Inserir veículo
      const insertQuery = `
        INSERT INTO veiculos (
          placa, renavam, chassi, modelo, marca, ano_fabricacao, tipo_veiculo,
          carroceria, combustivel, categoria, capacidade_carga, numero_eixos,
          tara, peso_bruto_total, potencia_motor, tipo_tracao, quilometragem_atual,
          data_emplacamento, vencimento_licenciamento, proxima_inspecao_veicular,
          vencimento_ipva, vencimento_dpvat, status,
          status_detalhado, data_aquisicao, valor_compra, fornecedor, numero_frota,
          situacao_financeira, foto_veiculo, foto_documentacao, foto_inspecao,
          observacoes, filial_id, motorista_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        placa.trim().toUpperCase(),
        renavam ? renavam.trim() : null,
        chassi ? chassi.trim() : null,
        modelo ? modelo.trim() : null,
        marca ? marca.trim() : null,
        ano_fabricacao,
        tipo_veiculo,
        carroceria ? carroceria.trim() : null,
        combustivel ? combustivel.trim() : null,
        categoria ? categoria.trim() : null,
        capacidade_carga,
        numero_eixos,
        tara,
        peso_bruto_total,
        potencia_motor,
        tipo_tracao ? tipo_tracao.trim() : null,
        quilometragem_atual,
        data_emplacamento,
        vencimento_licenciamento,
        proxima_inspecao_veicular,
        vencimento_ipva,
        vencimento_dpvat,
        status,
        status_detalhado ? status_detalhado.trim() : null,
        data_aquisicao,
        valor_compra,
        fornecedor ? fornecedor.trim() : null,
        numero_frota ? numero_frota.trim() : null,
        situacao_financeira ? situacao_financeira.trim() : null,
        foto_veiculo ? foto_veiculo.trim() : null,
        foto_documentacao ? foto_documentacao.trim() : null,
        foto_inspecao ? foto_inspecao.trim() : null,
        observacoes ? observacoes.trim() : null,
        filial_id,
        motorista_id
      ]);

      // Buscar veículo criado
      const newVeiculo = await executeQuery(
        'SELECT v.*, f.filial as filial_nome, m.nome as motorista_nome FROM veiculos v LEFT JOIN filiais f ON v.filial_id = f.id LEFT JOIN motoristas m ON v.motorista_id = m.id WHERE v.id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Veículo criado com sucesso',
        data: newVeiculo[0]
      });

    } catch (error) {
      console.error('Erro ao criar veículo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar o veículo'
      });
    }
  }

  // Atualizar veículo
  async atualizarVeiculo(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar se o veículo existe
      const existingVeiculo = await executeQuery(
        'SELECT * FROM veiculos WHERE id = ?',
        [id]
      );

      if (existingVeiculo.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Veículo não encontrado',
          message: 'O veículo especificado não foi encontrado'
        });
      }

      // Validações específicas
      if (updateData.placa && updateData.placa.trim().length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Placa inválida',
          message: 'A placa deve ter pelo menos 6 caracteres'
        });
      }

      // Verificar se placa já existe em outro veículo
      if (updateData.placa) {
        const placaCheck = await executeQuery(
          'SELECT id FROM veiculos WHERE placa = ? AND id != ?',
          [updateData.placa.trim().toUpperCase(), id]
        );

        if (placaCheck.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Placa já cadastrada',
            message: 'Já existe outro veículo com esta placa'
          });
        }
      }

      // Verificar se a filial existe (se fornecida)
      if (updateData.filial_id) {
        const filial = await executeQuery(
          'SELECT id FROM filiais WHERE id = ?',
          [updateData.filial_id]
        );

        if (filial.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Filial não encontrada',
            message: 'A filial especificada não foi encontrada'
          });
        }
      }

      // Verificar se o motorista existe (se fornecido)
      if (updateData.motorista_id) {
        const motorista = await executeQuery(
          'SELECT id FROM motoristas WHERE id = ?',
          [updateData.motorista_id]
        );

        if (motorista.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Motorista não encontrado',
            message: 'O motorista especificado não foi encontrado'
          });
        }
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateParams = [];

      // Lista de campos permitidos para atualização
      const allowedFields = [
        'placa', 'renavam', 'chassi', 'modelo', 'marca', 'ano_fabricacao',
        'tipo_veiculo', 'carroceria', 'combustivel', 'categoria',
        'capacidade_carga', 'numero_eixos', 'tara', 'peso_bruto_total',
        'potencia_motor', 'tipo_tracao', 'quilometragem_atual',
        'data_emplacamento', 'vencimento_licenciamento',
        'proxima_inspecao_veicular', 'vencimento_ipva',
        'vencimento_dpvat', 'status', 'status_detalhado',
        'data_aquisicao', 'valor_compra', 'fornecedor', 'numero_frota',
        'situacao_financeira', 'foto_veiculo', 'foto_documentacao',
        'foto_inspecao', 'observacoes', 'filial_id', 'motorista_id'
      ];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          if (field === 'placa') {
            updateParams.push(updateData[field].trim().toUpperCase());
          } else if (typeof updateData[field] === 'string') {
            updateParams.push(updateData[field].trim());
          } else {
            updateParams.push(updateData[field]);
          }
        }
      });

      // Sempre atualizar o timestamp
      updateFields.push('atualizado_em = CURRENT_TIMESTAMP');

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum campo para atualizar',
          message: 'Nenhum campo foi fornecido para atualização'
        });
      }

      updateParams.push(id);
      await executeQuery(
        `UPDATE veiculos SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Buscar veículo atualizado
      const updatedVeiculo = await executeQuery(
        'SELECT v.*, f.filial as filial_nome, m.nome as motorista_nome FROM veiculos v LEFT JOIN filiais f ON v.filial_id = f.id LEFT JOIN motoristas m ON v.motorista_id = m.id WHERE v.id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Veículo atualizado com sucesso',
        data: updatedVeiculo[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar o veículo'
      });
    }
  }

  // Excluir veículo
  async excluirVeiculo(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o veículo existe
      const veiculo = await executeQuery(
        'SELECT * FROM veiculos WHERE id = ?',
        [id]
      );

      if (veiculo.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Veículo não encontrado',
          message: 'O veículo especificado não foi encontrado'
        });
      }

      // Excluir veículo
      await executeQuery('DELETE FROM veiculos WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Veículo excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o veículo'
      });
    }
  }

  // Buscar veículos ativos
  async buscarVeiculosAtivos(req, res) {
    try {
      const query = `
        SELECT 
          v.id, v.placa, v.modelo, v.marca, v.tipo_veiculo, v.categoria,
          v.status, v.filial_id, v.motorista_id,
          f.filial as filial_nome,
          m.nome as motorista_nome
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        LEFT JOIN motoristas m ON v.motorista_id = m.id
        WHERE v.status = 'ativo'
        ORDER BY v.placa ASC
      `;

      const veiculos = await executeQuery(query);

      res.json({
        success: true,
        data: veiculos
      });

    } catch (error) {
      console.error('Erro ao buscar veículos ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os veículos ativos'
      });
    }
  }

  // Buscar veículos por filial
  async buscarVeiculosPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          v.id, v.placa, v.modelo, v.marca, v.tipo_veiculo, v.categoria,
          v.status, v.filial_id, v.motorista_id,
          f.filial as filial_nome,
          m.nome as motorista_nome
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        LEFT JOIN motoristas m ON v.motorista_id = m.id
        WHERE v.filial_id = ? AND v.status = 'ativo'
        ORDER BY v.placa ASC
      `;

      const veiculos = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: veiculos
      });

    } catch (error) {
      console.error('Erro ao buscar veículos por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os veículos por filial'
      });
    }
  }

  // Buscar veículos por tipo
  async buscarVeiculosPorTipo(req, res) {
    try {
      const { tipo } = req.params;

      const query = `
        SELECT 
          v.id, v.placa, v.modelo, v.marca, v.tipo_veiculo, v.categoria,
          v.status, v.filial_id, v.motorista_id,
          f.filial as filial_nome,
          m.nome as motorista_nome
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        LEFT JOIN motoristas m ON v.motorista_id = m.id
        WHERE v.tipo_veiculo = ?
        ORDER BY v.placa ASC
      `;

      const veiculos = await executeQuery(query, [tipo]);

      res.json({
        success: true,
        data: veiculos
      });

    } catch (error) {
      console.error('Erro ao buscar veículos por tipo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os veículos por tipo'
      });
    }
  }

  // Listar tipos de veículos
  async listarTiposVeiculos(req, res) {
    try {
      const query = `
        SELECT DISTINCT tipo_veiculo 
        FROM veiculos 
        WHERE tipo_veiculo IS NOT NULL AND tipo_veiculo != ''
        ORDER BY tipo_veiculo ASC
      `;

      const tipos = await executeQuery(query);

      res.json({
        success: true,
        data: tipos.map(item => item.tipo_veiculo)
      });

    } catch (error) {
      console.error('Erro ao listar tipos de veículos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os tipos de veículos'
      });
    }
  }

  // Listar categorias de veículos
  async listarCategoriasVeiculos(req, res) {
    try {
      const query = `
        SELECT DISTINCT categoria 
        FROM veiculos 
        WHERE categoria IS NOT NULL AND categoria != ''
        ORDER BY categoria ASC
      `;

      const categorias = await executeQuery(query);

      res.json({
        success: true,
        data: categorias.map(item => item.categoria)
      });

    } catch (error) {
      console.error('Erro ao listar categorias de veículos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as categorias de veículos'
      });
    }
  }

  // Buscar veículos com documentação vencendo
  async buscarVeiculosDocumentacaoVencendo(req, res) {
    try {
      const { dias = 30 } = req.query;

      const query = `
        SELECT 
          v.id, v.placa, v.modelo, v.marca, v.tipo_veiculo,
          v.vencimento_licenciamento, v.proxima_inspecao_veicular,
          v.vencimento_ipva, v.status,
          f.filial as filial_nome
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        WHERE (
          (v.vencimento_licenciamento IS NOT NULL AND v.vencimento_licenciamento <= DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
          (v.proxima_inspecao_veicular IS NOT NULL AND v.proxima_inspecao_veicular <= DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
          (v.vencimento_ipva IS NOT NULL AND v.vencimento_ipva <= DATE_ADD(CURDATE(), INTERVAL ? DAY))
        )
        ORDER BY v.vencimento_licenciamento ASC, v.proxima_inspecao_veicular ASC, v.vencimento_ipva ASC
      `;

      const veiculos = await executeQuery(query, [dias, dias, dias]);

      res.json({
        success: true,
        data: veiculos
      });

    } catch (error) {
      console.error('Erro ao buscar veículos com documentação vencendo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os veículos com documentação vencendo'
      });
    }
  }
}

module.exports = new VeiculosController(); 