const { executeQuery } = require('../config/database');

class AjudantesController {
  // Listar ajudantes com paginação, busca e filtros
  async listarAjudantes(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        filial_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(a.nome LIKE ? OR a.cpf LIKE ? OR a.email LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('a.status = ?');
        params.push(status);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('a.filial_id = ?');
        params.push(filial_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, a.endereco, 
          a.status, a.data_admissao, a.observacoes, 
          a.criado_em, a.atualizado_em, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY a.nome ASC
        LIMIT ? OFFSET ?
      `;

      const ajudantes = await executeQuery(query, [...params, Number(limit), Number(offset)]);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: ajudantes,
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
          filial_id: filial_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar ajudantes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os ajudantes'
      });
    }
  }

  // Buscar ajudante por ID
  async buscarAjudantePorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, a.endereco, 
          a.status, a.data_admissao, a.observacoes, 
          a.criado_em, a.atualizado_em, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.id = ?
      `;

      const ajudantes = await executeQuery(query, [id]);

      if (ajudantes.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Ajudante não encontrado',
          message: 'O ajudante especificado não foi encontrado no sistema'
        });
      }

      res.json({
        success: true,
        data: ajudantes[0]
      });

    } catch (error) {
      console.error('Erro ao buscar ajudante:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o ajudante'
      });
    }
  }

  // Criar ajudante
  async criarAjudante(req, res) {
    try {
      const {
        nome,
        cpf,
        telefone,
        email,
        endereco,
        status = 'ativo',
        data_admissao,
        observacoes,
        filial_id
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
          'SELECT id FROM ajudantes WHERE cpf = ?',
          [cpf.trim()]
        );

        if (existingCpf.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'CPF já cadastrado',
            message: 'Já existe um ajudante com este CPF'
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

      // Inserir ajudante
      const insertQuery = `
        INSERT INTO ajudantes (
          nome, cpf, telefone, email, endereco, 
          status, data_admissao, observacoes, filial_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        nome.trim(),
        cpf && cpf.trim() ? cpf.trim() : null,
        telefone && telefone.trim() ? telefone.trim() : null,
        email && email.trim() ? email.trim() : null,
        endereco && endereco.trim() ? endereco.trim() : null,
        status,
        data_admissao ? data_admissao.split('T')[0] : null,
        observacoes && observacoes.trim() ? observacoes.trim() : null,
        filial_id
      ]);

      // Buscar ajudante criado
      const newAjudante = await executeQuery(
        'SELECT a.*, f.filial as filial_nome FROM ajudantes a LEFT JOIN filiais f ON a.filial_id = f.id WHERE a.id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Ajudante criado com sucesso',
        data: newAjudante[0]
      });

    } catch (error) {
      console.error('Erro ao criar ajudante:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar o ajudante'
      });
    }
  }

  // Atualizar ajudante
  async atualizarAjudante(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        cpf,
        telefone,
        email,
        endereco,
        status,
        data_admissao,
        observacoes,
        filial_id
      } = req.body;

      // Verificar se o ajudante existe
      const existingAjudante = await executeQuery(
        'SELECT * FROM ajudantes WHERE id = ?',
        [id]
      );

      if (existingAjudante.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Ajudante não encontrado',
          message: 'O ajudante especificado não foi encontrado'
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
          'SELECT id FROM ajudantes WHERE cpf = ? AND id != ?',
          [cpf.trim(), id]
        );

        if (cpfCheck.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'CPF já cadastrado',
            message: 'Já existe outro ajudante com este CPF'
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
        updateParams.push(cpf && cpf.trim() ? cpf.trim() : null);
      }
      if (telefone !== undefined) {
        updateFields.push('telefone = ?');
        updateParams.push(telefone && telefone.trim() ? telefone.trim() : null);
      }
      if (email !== undefined) {
        updateFields.push('email = ?');
        updateParams.push(email && email.trim() ? email.trim() : null);
      }
      if (endereco !== undefined) {
        updateFields.push('endereco = ?');
        updateParams.push(endereco && endereco.trim() ? endereco.trim() : null);
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
        updateParams.push(observacoes && observacoes.trim() ? observacoes.trim() : null);
      }
      if (filial_id !== undefined) {
        updateFields.push('filial_id = ?');
        updateParams.push(filial_id);
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
        `UPDATE ajudantes SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Buscar ajudante atualizado
      const updatedAjudante = await executeQuery(
        'SELECT a.*, f.filial as filial_nome FROM ajudantes a LEFT JOIN filiais f ON a.filial_id = f.id WHERE a.id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Ajudante atualizado com sucesso',
        data: updatedAjudante[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar ajudante:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar o ajudante'
      });
    }
  }

  // Excluir ajudante
  async excluirAjudante(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o ajudante existe
      const ajudante = await executeQuery(
        'SELECT * FROM ajudantes WHERE id = ?',
        [id]
      );

      if (ajudante.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Ajudante não encontrado',
          message: 'O ajudante especificado não foi encontrado'
        });
      }

      // Excluir ajudante
      await executeQuery('DELETE FROM ajudantes WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Ajudante excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir ajudante:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o ajudante'
      });
    }
  }

  // Buscar ajudantes ativos
  async buscarAjudantesAtivos(req, res) {
    try {
      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, 
          a.status, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.status = 'ativo'
        ORDER BY a.nome ASC
      `;

      const ajudantes = await executeQuery(query);

      res.json({
        success: true,
        data: ajudantes
      });

    } catch (error) {
      console.error('Erro ao buscar ajudantes ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os ajudantes ativos'
      });
    }
  }

  // Buscar ajudantes por filial
  async buscarAjudantesPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, 
          a.status, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.filial_id = ? AND a.status = 'ativo'
        ORDER BY a.nome ASC
      `;

      const ajudantes = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: ajudantes
      });

    } catch (error) {
      console.error('Erro ao buscar ajudantes por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os ajudantes por filial'
      });
    }
  }

  // Buscar ajudantes por status
  async buscarAjudantesPorStatus(req, res) {
    try {
      const { status } = req.params;

      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, 
          a.status, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.status = ?
        ORDER BY a.nome ASC
      `;

      const ajudantes = await executeQuery(query, [status]);

      res.json({
        success: true,
        data: ajudantes
      });

    } catch (error) {
      console.error('Erro ao buscar ajudantes por status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os ajudantes por status'
      });
    }
  }

  // Listar status disponíveis
  async listarStatus(req, res) {
    try {
      const query = `
        SELECT DISTINCT status 
        FROM ajudantes 
        WHERE status IS NOT NULL AND status != ''
        ORDER BY status ASC
      `;

      const status = await executeQuery(query);

      res.json({
        success: true,
        data: status.map(item => item.status)
      });

    } catch (error) {
      console.error('Erro ao listar status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os status'
      });
    }
  }

  // Buscar ajudantes disponíveis (ativos e não em férias/licença)
  async buscarAjudantesDisponiveis(req, res) {
    try {
      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, 
          a.status, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.status = 'ativo'
        ORDER BY a.nome ASC
      `;

      const ajudantes = await executeQuery(query);

      res.json({
        success: true,
        data: ajudantes
      });

    } catch (error) {
      console.error('Erro ao buscar ajudantes disponíveis:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os ajudantes disponíveis'
      });
    }
  }
}

module.exports = new AjudantesController(); 