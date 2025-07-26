const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/veiculos/export/xlsx - Exportar veículos para XLSX
router.get('/export/xlsx', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.*,
        f.nome as filial_nome
      FROM veiculos v
      LEFT JOIN filiais f ON v.filial_id = f.id
      ORDER BY v.placa
    `;
    
    const veiculos = await executeQuery(query);
    
    // Aqui você implementaria a lógica de exportação para XLSX
    // Por enquanto, retornamos um JSON
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=veiculos.xlsx');
    res.json(veiculos);
  } catch (error) {
    console.error('Erro ao exportar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/veiculos/export/pdf - Exportar veículos para PDF
router.get('/export/pdf', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.*,
        f.nome as filial_nome
      FROM veiculos v
      LEFT JOIN filiais f ON v.filial_id = f.id
      ORDER BY v.placa
    `;
    
    const veiculos = await executeQuery(query);
    
    // Aqui você implementaria a lógica de exportação para PDF
    // Por enquanto, retornamos um JSON
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=veiculos.pdf');
    res.json(veiculos);
  } catch (error) {
    console.error('Erro ao exportar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/veiculos - Listar todos os veículos
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.*,
        f.nome as filial_nome
      FROM veiculos v
      LEFT JOIN filiais f ON v.filial_id = f.id
      ORDER BY v.placa
    `;
    
    const veiculos = await executeQuery(query);
    res.json(veiculos);
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/veiculos/:id - Buscar veículo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        v.*,
        f.nome as filial_nome
      FROM veiculos v
      LEFT JOIN filiais f ON v.filial_id = f.id
      WHERE v.id = ?
    `;
    
    const veiculos = await executeQuery(query, [id]);
    
    if (veiculos.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }
    
    res.json(veiculos[0]);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/veiculos - Criar novo veículo
router.post('/', async (req, res) => {
  try {
    const {
      placa, renavam, chassi, modelo, marca, fabricante, ano_fabricacao,
      tipo_veiculo, carroceria, combustivel, categoria, capacidade_carga,
      capacidade_volume, numero_eixos, tara, peso_bruto_total, potencia_motor,
      tipo_tracao, quilometragem_atual, data_emplacamento, vencimento_licenciamento,
      vencimento_ipva, vencimento_dpvat, numero_apolice_seguro, situacao_documental,
      data_ultima_revisao, quilometragem_proxima_revisao, data_ultima_troca_oleo,
      vencimento_alinhamento_balanceamento, proxima_inspecao_veicular, status,
      status_detalhado, data_aquisicao, valor_compra, fornecedor, numero_frota,
      situacao_financeira, observacoes, filial_id, motorista_id
    } = req.body;

    // Verificar se a placa já existe
    const existingVeiculo = await executeQuery(
      'SELECT id FROM veiculos WHERE placa = ?',
      [placa]
    );

    if (existingVeiculo.length > 0) {
      return res.status(400).json({ error: 'Placa já cadastrada' });
    }

    const query = `
      INSERT INTO veiculos (
        placa, renavam, chassi, modelo, marca, fabricante, ano_fabricacao,
        tipo_veiculo, carroceria, combustivel, categoria, capacidade_carga,
        capacidade_volume, numero_eixos, tara, peso_bruto_total, potencia_motor,
        tipo_tracao, quilometragem_atual, data_emplacamento, vencimento_licenciamento,
        vencimento_ipva, vencimento_dpvat, numero_apolice_seguro, situacao_documental,
        data_ultima_revisao, quilometragem_proxima_revisao, data_ultima_troca_oleo,
        vencimento_alinhamento_balanceamento, proxima_inspecao_veicular, status,
        status_detalhado, data_aquisicao, valor_compra, fornecedor, numero_frota,
        situacao_financeira, observacoes, filial_id, motorista_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      placa, renavam, chassi, modelo, marca, fabricante, ano_fabricacao,
      tipo_veiculo, carroceria, combustivel, categoria, capacidade_carga,
      capacidade_volume, numero_eixos, tara, peso_bruto_total, potencia_motor,
      tipo_tracao, quilometragem_atual, data_emplacamento, vencimento_licenciamento,
      vencimento_ipva, vencimento_dpvat, numero_apolice_seguro, situacao_documental,
      data_ultima_revisao, quilometragem_proxima_revisao, data_ultima_troca_oleo,
      vencimento_alinhamento_balanceamento, proxima_inspecao_veicular, status,
      status_detalhado, data_aquisicao, valor_compra, fornecedor, numero_frota,
      situacao_financeira, observacoes, filial_id, motorista_id
    ]);

    // Log de auditoria
    await logAction(req.user.id, 'CREATE', 'veiculos', {
      requestBody: req.body,
      resourceId: result.insertId
    });

    res.status(201).json({ 
      id: result.insertId,
      message: 'Veículo criado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/veiculos/:id - Atualizar veículo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      placa, renavam, chassi, modelo, marca, fabricante, ano_fabricacao,
      tipo_veiculo, carroceria, combustivel, categoria, capacidade_carga,
      capacidade_volume, numero_eixos, tara, peso_bruto_total, potencia_motor,
      tipo_tracao, quilometragem_atual, data_emplacamento, vencimento_licenciamento,
      vencimento_ipva, vencimento_dpvat, numero_apolice_seguro, situacao_documental,
      data_ultima_revisao, quilometragem_proxima_revisao, data_ultima_troca_oleo,
      vencimento_alinhamento_balanceamento, proxima_inspecao_veicular, status,
      status_detalhado, data_aquisicao, valor_compra, fornecedor, numero_frota,
      situacao_financeira, observacoes, filial_id, motorista_id
    } = req.body;

    // Verificar se o veículo existe
    const existingVeiculo = await executeQuery(
      'SELECT * FROM veiculos WHERE id = ?',
      [id]
    );

    if (existingVeiculo.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Verificar se a placa já existe em outro veículo
    const duplicatePlaca = await executeQuery(
      'SELECT id FROM veiculos WHERE placa = ? AND id != ?',
      [placa, id]
    );

    if (duplicatePlaca.length > 0) {
      return res.status(400).json({ error: 'Placa já cadastrada em outro veículo' });
    }

    // Capturar dados antigos para auditoria
    const oldData = existingVeiculo[0];

    const query = `
      UPDATE veiculos SET
        placa = ?, renavam = ?, chassi = ?, modelo = ?, marca = ?, fabricante = ?, ano_fabricacao = ?,
        tipo_veiculo = ?, carroceria = ?, combustivel = ?, categoria = ?, capacidade_carga = ?,
        capacidade_volume = ?, numero_eixos = ?, tara = ?, peso_bruto_total = ?, potencia_motor = ?,
        tipo_tracao = ?, quilometragem_atual = ?, data_emplacamento = ?, vencimento_licenciamento = ?,
        vencimento_ipva = ?, vencimento_dpvat = ?, numero_apolice_seguro = ?, situacao_documental = ?,
        data_ultima_revisao = ?, quilometragem_proxima_revisao = ?, data_ultima_troca_oleo = ?,
        vencimento_alinhamento_balanceamento = ?, proxima_inspecao_veicular = ?, status = ?,
        status_detalhado = ?, data_aquisicao = ?, valor_compra = ?, fornecedor = ?, numero_frota = ?,
        situacao_financeira = ?, observacoes = ?, filial_id = ?, motorista_id = ?
      WHERE id = ?
    `;

    await executeQuery(query, [
      placa, renavam, chassi, modelo, marca, fabricante, ano_fabricacao,
      tipo_veiculo, carroceria, combustivel, categoria, capacidade_carga,
      capacidade_volume, numero_eixos, tara, peso_bruto_total, potencia_motor,
      tipo_tracao, quilometragem_atual, data_emplacamento, vencimento_licenciamento,
      vencimento_ipva, vencimento_dpvat, numero_apolice_seguro, situacao_documental,
      data_ultima_revisao, quilometragem_proxima_revisao, data_ultima_troca_oleo,
      vencimento_alinhamento_balanceamento, proxima_inspecao_veicular, status,
      status_detalhado, data_aquisicao, valor_compra, fornecedor, numero_frota,
      situacao_financeira, observacoes, filial_id, motorista_id, id
    ]);

    // Preparar dados para auditoria
    const changes = {};
    const newData = req.body;
    
    Object.keys(newData).forEach(key => {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          from: oldData[key],
          to: newData[key]
        };
      }
    });

    // Log de auditoria
    if (Object.keys(changes).length > 0) {
      await logAction(req.user.id, 'UPDATE', 'veiculos', {
        changes: changes,
        resourceId: id
      });
    }

    res.json({ message: 'Veículo atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/veiculos/:id - Excluir veículo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o veículo existe
    const existingVeiculo = await executeQuery(
      'SELECT * FROM veiculos WHERE id = ?',
      [id]
    );

    if (existingVeiculo.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Excluir o veículo
    await executeQuery('DELETE FROM veiculos WHERE id = ?', [id]);

    // Log de auditoria
    await logAction(req.user.id, 'DELETE', 'veiculos', {
      deletedData: existingVeiculo[0],
      resourceId: id
    });

    res.json({ message: 'Veículo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 