/**
 * Controller CRUD de Motoristas
 * Responsável por criar, atualizar e excluir motoristas
 */

const { executeQuery } = require('../../config/database');

class MotoristasCRUDController {
  // Criar motorista
  static async criarMotorista(req, res) {
    try {
      const {
        nome,
        cpf,
        cnh,
        categoria_cnh,
        telefone,
        email,
        endereco,
        status = 'ativo',
        data_admissao,
        observacoes,
        filial_id,
        cnh_validade
      } = req.body;

      // Validações específicas
      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Verificar se CPF já existe (se fornecido)
      if (cpf) {
        const existingCpf = await executeQuery(
          'SELECT id FROM motoristas WHERE cpf = ?',
          [cpf.trim()]
        );

        if (existingCpf.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'CPF já cadastrado',
            message: 'Já existe um motorista com este CPF'
          });
        }
      }

      // Verificar se CNH já existe (se fornecida)
      if (cnh) {
        const existingCnh = await executeQuery(
          'SELECT id FROM motoristas WHERE cnh = ?',
          [cnh.trim()]
        );

        if (existingCnh.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'CNH já cadastrada',
            message: 'Já existe um motorista com esta CNH'
          });
        }
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

      // Inserir motorista
      const insertQuery = `
        INSERT INTO motoristas (
          nome, cpf, cnh, categoria_cnh, telefone, email, endereco, 
          status, data_admissao, observacoes, filial_id, cnh_validade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        nome.trim(),
        cpf && cpf.trim() ? cpf.trim() : null,
        cnh && cnh.trim() ? cnh.trim() : null,
        categoria_cnh && categoria_cnh.trim() ? categoria_cnh.trim() : null,
        telefone && telefone.trim() ? telefone.trim() : null,
        email && email.trim() ? email.trim() : null,
        endereco && endereco.trim() ? endereco.trim() : null,
        status || 'ativo',
        data_admissao ? data_admissao.split('T')[0] : null,
        observacoes && observacoes.trim() ? observacoes.trim() : null,
        filial_id || null,
        cnh_validade ? cnh_validade.split('T')[0] : null
      ]);

      // Buscar motorista criado
      const newMotorista = await executeQuery(
        'SELECT m.*, f.filial as filial_nome FROM motoristas m LEFT JOIN filiais f ON m.filial_id = f.id WHERE m.id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Motorista criado com sucesso',
        data: newMotorista[0]
      });

    } catch (error) {
      console.error('Erro ao criar motorista:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar o motorista'
      });
    }
  }

  // Atualizar motorista
  static async atualizarMotorista(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        cpf,
        cnh,
        categoria_cnh,
        telefone,
        email,
        endereco,
        status,
        data_admissao,
        observacoes,
        filial_id,
        cnh_validade
      } = req.body;

      // Verificar se o motorista existe
      const existingMotorista = await executeQuery(
        'SELECT * FROM motoristas WHERE id = ?',
        [id]
      );

      if (existingMotorista.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Motorista não encontrado',
          message: 'O motorista especificado não foi encontrado'
        });
      }

      // Validações específicas
      if (nome && nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Verificar se CPF já existe (se estiver sendo alterado)
      if (cpf) {
        const cpfCheck = await executeQuery(
          'SELECT id FROM motoristas WHERE cpf = ? AND id != ?',
          [cpf.trim(), id]
        );

        if (cpfCheck.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'CPF já cadastrado',
            message: 'Já existe outro motorista com este CPF'
          });
        }
      }

      // Verificar se CNH já existe (se estiver sendo alterada)
      if (cnh) {
        const cnhCheck = await executeQuery(
          'SELECT id FROM motoristas WHERE cnh = ? AND id != ?',
          [cnh.trim(), id]
        );

        if (cnhCheck.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'CNH já cadastrada',
            message: 'Já existe outro motorista com esta CNH'
          });
        }
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

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateParams = [];

      if (nome !== undefined) {
        updateFields.push('nome = ?');
        updateParams.push(nome.trim());
      }
      if (cpf !== undefined) {
        updateFields.push('cpf = ?');
        updateParams.push(cpf ? cpf.trim() : null);
      }
      if (cnh !== undefined) {
        updateFields.push('cnh = ?');
        updateParams.push(cnh ? cnh.trim() : null);
      }
      if (categoria_cnh !== undefined) {
        updateFields.push('categoria_cnh = ?');
        updateParams.push(categoria_cnh ? categoria_cnh.trim() : null);
      }
      if (telefone !== undefined) {
        updateFields.push('telefone = ?');
        updateParams.push(telefone ? telefone.trim() : null);
      }
      if (email !== undefined) {
        updateFields.push('email = ?');
        updateParams.push(email ? email.trim() : null);
      }
      if (endereco !== undefined) {
        updateFields.push('endereco = ?');
        updateParams.push(endereco ? endereco.trim() : null);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }
      if (data_admissao !== undefined) {
        updateFields.push('data_admissao = ?');
        updateParams.push(data_admissao ? data_admissao.split('T')[0] : null);
      }
      if (observacoes !== undefined) {
        updateFields.push('observacoes = ?');
        updateParams.push(observacoes ? observacoes.trim() : null);
      }
      if (filial_id !== undefined) {
        updateFields.push('filial_id = ?');
        updateParams.push(filial_id);
      }
      if (cnh_validade !== undefined) {
        updateFields.push('cnh_validade = ?');
        updateParams.push(cnh_validade ? cnh_validade.split('T')[0] : null);
      }

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
        `UPDATE motoristas SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Buscar motorista atualizado
      const updatedMotorista = await executeQuery(
        'SELECT m.*, f.filial as filial_nome FROM motoristas m LEFT JOIN filiais f ON m.filial_id = f.id WHERE m.id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Motorista atualizado com sucesso',
        data: updatedMotorista[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar motorista:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar o motorista'
      });
    }
  }

  // Excluir motorista
  static async excluirMotorista(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o motorista existe
      const motorista = await executeQuery(
        'SELECT * FROM motoristas WHERE id = ?',
        [id]
      );

      if (motorista.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Motorista não encontrado',
          message: 'O motorista especificado não foi encontrado'
        });
      }

      // Verificar se há veículos vinculados
      const veiculosVinculados = await executeQuery(
        'SELECT id FROM veiculos WHERE motorista_id = ?',
        [id]
      );

      if (veiculosVinculados.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Motorista possui veículos vinculados',
          message: 'Não é possível excluir o motorista pois existem veículos vinculados a ele'
        });
      }

      // Excluir motorista
      await executeQuery('DELETE FROM motoristas WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Motorista excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o motorista'
      });
    }
  }
}

module.exports = MotoristasCRUDController;
