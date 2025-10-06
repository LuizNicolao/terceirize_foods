const { query } = require('../../config/database');

const criar = async (req, res) => {
  try {
    const {
      data_solicitacao,
      escola_id,
      cidade,
      fornecedor,
      nutricionista_email,
      manutencao_descricao,
      foto_equipamento,
      valor,
      data_servico,
      numero_ordem_servico,
      status = 'Pendente',
      observacoes
    } = req.body;

    // Validar dados obrigatórios
    if (!data_solicitacao || !escola_id || !cidade || !nutricionista_email || !manutencao_descricao) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Data da solicitação, escola, cidade, nutricionista e descrição da manutenção são obrigatórios'
      });
    }

    // Verificar se a escola existe
    const escola = await query('SELECT id FROM escolas WHERE id = ?', [escola_id]);
    if (escola.length === 0) {
      return res.status(404).json({
        error: 'Escola não encontrada',
        message: 'A escola especificada não existe'
      });
    }

    // Inserir nova solicitação
    const resultado = await query(`
      INSERT INTO solicitacoes_manutencao (
        data_solicitacao, escola_id, cidade, fornecedor, nutricionista_email,
        manutencao_descricao, foto_equipamento, valor, data_servico, numero_ordem_servico, status, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data_solicitacao, escola_id, cidade, fornecedor || null, nutricionista_email,
      manutencao_descricao, foto_equipamento || null, valor || null, data_servico || null, numero_ordem_servico || null, status, observacoes || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Solicitação de manutenção criada com sucesso',
      data: { id: resultado.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar solicitação de manutenção:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar solicitação de manutenção'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      data_solicitacao,
      escola_id,
      cidade,
      fornecedor,
      nutricionista_email,
      manutencao_descricao,
      foto_equipamento,
      valor,
      data_servico,
      numero_ordem_servico,
      status,
      observacoes
    } = req.body;


    // Verificar se a solicitação existe
    const existing = await query(`
      SELECT id, status FROM solicitacoes_manutencao WHERE id = ?
    `, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Solicitação não encontrada',
        message: 'Solicitação de manutenção não encontrada'
      });
    }

    // Validação especial para status "Concluido"
    if (status === 'Concluido') {
      // Verificar se fornecedor e valor estão sendo fornecidos na requisição atual
      const fornecedorFornecido = req.body.hasOwnProperty('fornecedor') && req.body.fornecedor && req.body.fornecedor.trim() !== '';
      const valorFornecido = req.body.hasOwnProperty('valor') && req.body.valor && req.body.valor.toString().trim() !== '';
      
      // Se os campos estão sendo enviados mas estão vazios, permitir (serão preenchidos posteriormente)
      if (req.body.hasOwnProperty('fornecedor') && req.body.hasOwnProperty('valor')) {
        // Campos estão sendo enviados, permitir mesmo que vazios
      } else if (!fornecedorFornecido || !valorFornecido) {
        return res.status(400).json({
          error: 'Dados obrigatórios para conclusão',
          message: 'Para concluir a manutenção, fornecedor e valor são obrigatórios'
        });
      }
    }

    // Atualizar solicitação
    await query(`
      UPDATE solicitacoes_manutencao SET
        data_solicitacao = COALESCE(?, data_solicitacao),
        escola_id = COALESCE(?, escola_id),
        cidade = COALESCE(?, cidade),
        fornecedor = COALESCE(?, fornecedor),
        nutricionista_email = COALESCE(?, nutricionista_email),
        manutencao_descricao = COALESCE(?, manutencao_descricao),
        foto_equipamento = COALESCE(?, foto_equipamento),
        valor = COALESCE(?, valor),
        data_servico = COALESCE(?, data_servico),
        numero_ordem_servico = COALESCE(?, numero_ordem_servico),
        status = COALESCE(?, status),
        observacoes = COALESCE(?, observacoes),
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      data_solicitacao || null, 
      escola_id || null, 
      cidade || null, 
      fornecedor || null, 
      nutricionista_email || null,
      manutencao_descricao || null, 
      foto_equipamento || null, 
      valor || null, 
      data_servico || null,
      numero_ordem_servico || null,
      status || null, 
      observacoes || null, 
      id
    ]);

    res.json({
      success: true,
      message: 'Solicitação de manutenção atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar solicitação de manutenção:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar solicitação de manutenção'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a solicitação existe
    const existing = await query('SELECT id FROM solicitacoes_manutencao WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Solicitação não encontrada',
        message: 'Solicitação de manutenção não encontrada'
      });
    }

    // Deletar solicitação
    await query('DELETE FROM solicitacoes_manutencao WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Solicitação de manutenção deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar solicitação de manutenção:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar solicitação de manutenção'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitacao = await query(`
      SELECT 
        sm.*,
        e.nome_escola,
        e.rota,
        e.codigo_teknisa,
        u.nome as nutricionista_nome
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      WHERE sm.id = ?
    `, [id]);

    if (solicitacao.length === 0) {
      return res.status(404).json({
        error: 'Solicitação não encontrada',
        message: 'Solicitação de manutenção não encontrada'
      });
    }

    res.json({
      success: true,
      data: solicitacao[0]
    });
  } catch (error) {
    console.error('Erro ao buscar solicitação de manutenção:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar solicitação de manutenção'
    });
  }
};

module.exports = {
  criar,
  atualizar,
  deletar,
  buscarPorId
};
