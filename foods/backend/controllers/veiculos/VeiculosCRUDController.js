/**
 * Controller CRUD de Veículos
 * Responsável por criar, atualizar e excluir veículos
 */

const { executeQuery } = require('../../config/database');

class VeiculosCRUDController {
  // Criar veículo
  static async criarVeiculo(req, res) {
    try {
      const {
        placa,
        renavam,
        chassi,
        modelo,
        marca,
        fabricante,
        ano_fabricacao,
        tipo_veiculo,
        carroceria,
        combustivel,
        categoria,
        capacidade_carga,
        capacidade_volume,
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
        numero_apolice_seguro,
        situacao_documental,
        data_ultima_revisao,
        quilometragem_proxima_revisao,
        data_ultima_troca_oleo,
        vencimento_alinhamento_balanceamento,
        status,
        status_detalhado,
        data_aquisicao,
        valor_compra,
        fornecedor,
        numero_frota,
        situacao_financeira,
        crlv_digitalizado,
        foto_frente,
        foto_traseira,
        foto_lateral,
        foto_interior,
        contrato_seguro,
        observacoes,
        filial_id,
        motorista_id
      } = req.body;

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
          placa, renavam, chassi, modelo, marca, fabricante, ano_fabricacao, tipo_veiculo,
          carroceria, combustivel, categoria, capacidade_carga, capacidade_volume, numero_eixos,
          tara, peso_bruto_total, potencia_motor, tipo_tracao, quilometragem_atual,
          data_emplacamento, vencimento_licenciamento, proxima_inspecao_veicular,
          vencimento_ipva, vencimento_dpvat, numero_apolice_seguro, situacao_documental,
          data_ultima_revisao, quilometragem_proxima_revisao, data_ultima_troca_oleo,
          vencimento_alinhamento_balanceamento, status, status_detalhado, data_aquisicao,
          valor_compra, fornecedor, numero_frota, situacao_financeira, crlv_digitalizado,
          foto_frente, foto_traseira, foto_lateral, foto_interior, contrato_seguro,
          observacoes, filial_id, motorista_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // Função auxiliar para converter string vazia em null
      const toNullIfEmpty = (value) => {
        if (value === '' || value === undefined || value === null) return null;
        return value;
      };

      // Função auxiliar para converter string vazia em null para números
      const toNullIfEmptyNumber = (value) => {
        if (value === '' || value === undefined || value === null || value === 0) return null;
        return value;
      };

      const result = await executeQuery(insertQuery, [
        placa.trim().toUpperCase(),
        toNullIfEmpty(renavam),
        toNullIfEmpty(chassi),
        toNullIfEmpty(modelo),
        toNullIfEmpty(marca),
        toNullIfEmpty(fabricante),
        toNullIfEmptyNumber(ano_fabricacao),
        toNullIfEmpty(tipo_veiculo),
        toNullIfEmpty(carroceria),
        toNullIfEmpty(combustivel),
        toNullIfEmpty(categoria),
        toNullIfEmptyNumber(capacidade_carga),
        toNullIfEmptyNumber(capacidade_volume),
        toNullIfEmptyNumber(numero_eixos),
        toNullIfEmptyNumber(tara),
        toNullIfEmptyNumber(peso_bruto_total),
        toNullIfEmptyNumber(potencia_motor),
        toNullIfEmpty(tipo_tracao),
        toNullIfEmptyNumber(quilometragem_atual),
        toNullIfEmpty(data_emplacamento),
        toNullIfEmpty(vencimento_licenciamento),
        toNullIfEmpty(proxima_inspecao_veicular),
        toNullIfEmpty(vencimento_ipva),
        toNullIfEmpty(vencimento_dpvat),
        toNullIfEmpty(numero_apolice_seguro),
        toNullIfEmpty(situacao_documental),
        toNullIfEmpty(data_ultima_revisao),
        toNullIfEmptyNumber(quilometragem_proxima_revisao),
        toNullIfEmpty(data_ultima_troca_oleo),
        toNullIfEmpty(vencimento_alinhamento_balanceamento),
        toNullIfEmpty(status) || 'ativo',
        toNullIfEmpty(status_detalhado),
        toNullIfEmpty(data_aquisicao),
        toNullIfEmptyNumber(valor_compra),
        toNullIfEmpty(fornecedor),
        toNullIfEmpty(numero_frota),
        toNullIfEmpty(situacao_financeira),
        toNullIfEmpty(crlv_digitalizado),
        toNullIfEmpty(foto_frente),
        toNullIfEmpty(foto_traseira),
        toNullIfEmpty(foto_lateral),
        toNullIfEmpty(foto_interior),
        toNullIfEmpty(contrato_seguro),
        toNullIfEmpty(observacoes),
        toNullIfEmptyNumber(filial_id),
        toNullIfEmptyNumber(motorista_id)
      ]);

      // Buscar veículo criado
      const newVeiculo = await executeQuery(
        'SELECT v.*, f.filial as filial_nome, m.nome as motorista_nome FROM veiculos v LEFT JOIN filiais f ON v.filial_id = f.id LEFT JOIN motoristas m ON v.motorista_id = m.id WHERE v.id = ?',
        [result.insertId]
      );

      // Log para debug das datas salvas
      console.log('💾 DEBUG - Datas salvas no veículo:', {
        id: newVeiculo[0].id,
        placa: newVeiculo[0].placa,
        data_emplacamento: newVeiculo[0].data_emplacamento,
        vencimento_licenciamento: newVeiculo[0].vencimento_licenciamento,
        vencimento_ipva: newVeiculo[0].vencimento_ipva,
        vencimento_dpvat: newVeiculo[0].vencimento_dpvat,
        data_ultima_revisao: newVeiculo[0].data_ultima_revisao,
        data_ultima_troca_oleo: newVeiculo[0].data_ultima_troca_oleo,
        vencimento_alinhamento_balanceamento: newVeiculo[0].vencimento_alinhamento_balanceamento,
        proxima_inspecao_veicular: newVeiculo[0].proxima_inspecao_veicular,
        data_aquisicao: newVeiculo[0].data_aquisicao
      });

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
  static async atualizarVeiculo(req, res) {
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
        'placa', 'renavam', 'chassi', 'modelo', 'marca', 'fabricante', 'ano_fabricacao',
        'tipo_veiculo', 'carroceria', 'combustivel', 'categoria',
        'capacidade_carga', 'capacidade_volume', 'numero_eixos', 'tara', 'peso_bruto_total',
        'potencia_motor', 'tipo_tracao', 'quilometragem_atual',
        'data_emplacamento', 'vencimento_licenciamento',
        'proxima_inspecao_veicular', 'vencimento_ipva', 'vencimento_dpvat',
        'numero_apolice_seguro', 'situacao_documental', 'data_ultima_revisao',
        'quilometragem_proxima_revisao', 'data_ultima_troca_oleo',
        'vencimento_alinhamento_balanceamento', 'status', 'status_detalhado',
        'data_aquisicao', 'valor_compra', 'fornecedor', 'numero_frota',
        'situacao_financeira', 'crlv_digitalizado', 'foto_frente', 'foto_traseira',
        'foto_lateral', 'foto_interior', 'contrato_seguro', 'observacoes',
        'filial_id', 'motorista_id'
      ];

      // Função auxiliar para converter string vazia em null
      const toNullIfEmpty = (value) => {
        if (value === '' || value === undefined || value === null) return null;
        return value;
      };

      // Função auxiliar para converter string vazia em null para números
      const toNullIfEmptyNumber = (value) => {
        if (value === '' || value === undefined || value === null || value === 0) return null;
        return value;
      };

      // Processar cada campo permitido
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          
          // Tratamento especial para placa (sempre maiúscula)
          if (field === 'placa') {
            updateParams.push(updateData[field].trim().toUpperCase());
          }
          // Tratamento especial para campos numéricos
          else if (['ano_fabricacao', 'numero_eixos', 'filial_id', 'motorista_id'].includes(field)) {
            updateParams.push(toNullIfEmptyNumber(updateData[field]));
          }
          // Tratamento especial para campos de valor decimal
          else if (['capacidade_carga', 'capacidade_volume', 'tara', 'peso_bruto_total', 'potencia_motor', 'quilometragem_atual', 'quilometragem_proxima_revisao', 'valor_compra'].includes(field)) {
            updateParams.push(toNullIfEmptyNumber(updateData[field]));
          }
          // Tratamento para outros campos
          else {
            updateParams.push(toNullIfEmpty(updateData[field]));
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
  static async excluirVeiculo(req, res) {
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
}

module.exports = VeiculosCRUDController;
