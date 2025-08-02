const { executeQuery } = require('../config/database');

class MotoristasController {
  // Listar motoristas com paginação, busca e filtros
  async listarMotoristas(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        categoria_cnh,
        filial_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(m.nome LIKE ? OR m.cpf LIKE ? OR m.cnh LIKE ? OR m.email LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('m.status = ?');
        params.push(status);
      }

      // Filtro por categoria CNH
      if (categoria_cnh) {
        whereConditions.push('m.categoria_cnh = ?');
        params.push(categoria_cnh);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('m.filial_id = ?');
        params.push(filial_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.endereco, m.status, m.data_admissao, m.observacoes, 
          m.criado_em, m.atualizado_em, m.filial_id, m.cnh_validade,
          f.filial as filial_nome
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY m.nome ASC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      const motoristas = await executeQuery(query, params);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: motoristas,
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
          categoria_cnh: categoria_cnh || null,
          filial_id: filial_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar motoristas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os motoristas'
      });
    }
  }

  // Buscar motorista por ID
  async buscarMotoristaPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.endereco, m.status, m.data_admissao, m.observacoes, 
          m.criado_em, m.atualizado_em, m.filial_id, m.cnh_validade,
          f.filial as filial_nome
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE m.id = ?
      `;

      const motoristas = await executeQuery(query, [id]);

      if (motoristas.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Motorista não encontrado',
          message: 'O motorista especificado não foi encontrado no sistema'
        });
      }

      res.json({
        success: true,
        data: motoristas[0]
      });

    } catch (error) {
      console.error('Erro ao buscar motorista:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o motorista'
      });
    }
  }

  // Criar motorista
  async criarMotorista(req, res) {
    try {
      console.log('Dados recebidos para criar motorista:', req.body);
      
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
        console.log('Erro: Nome inválido -', nome);
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
          console.log('Erro: CPF já cadastrado -', cpf);
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
          console.log('Erro: CNH já cadastrada -', cnh);
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
          console.log('Erro: Filial não encontrada -', filial_id);
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
  async atualizarMotorista(req, res) {
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
  async excluirMotorista(req, res) {
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

  // Buscar motoristas ativos
  async buscarMotoristasAtivos(req, res) {
    try {
      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.status, m.filial_id, m.cnh_validade,
          f.filial as filial_nome
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE m.status = 'ativo'
        ORDER BY m.nome ASC
      `;

      const motoristas = await executeQuery(query);

      res.json({
        success: true,
        data: motoristas
      });

    } catch (error) {
      console.error('Erro ao buscar motoristas ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os motoristas ativos'
      });
    }
  }

  // Buscar motoristas por filial
  async buscarMotoristasPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.status, m.filial_id, m.cnh_validade,
          f.filial as filial_nome
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE m.filial_id = ? AND m.status = 'ativo'
        ORDER BY m.nome ASC
      `;

      const motoristas = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: motoristas
      });

    } catch (error) {
      console.error('Erro ao buscar motoristas por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os motoristas por filial'
      });
    }
  }

  // Buscar motoristas por categoria CNH
  async buscarMotoristasPorCategoriaCnh(req, res) {
    try {
      const { categoria } = req.params;

      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.status, m.filial_id, m.cnh_validade,
          f.filial as filial_nome
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE m.categoria_cnh = ? AND m.status = 'ativo'
        ORDER BY m.nome ASC
      `;

      const motoristas = await executeQuery(query, [categoria]);

      res.json({
        success: true,
        data: motoristas
      });

    } catch (error) {
      console.error('Erro ao buscar motoristas por categoria CNH:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os motoristas por categoria CNH'
      });
    }
  }

  // Listar categorias CNH disponíveis
  async listarCategoriasCnh(req, res) {
    try {
      const query = `
        SELECT DISTINCT categoria_cnh 
        FROM motoristas 
        WHERE categoria_cnh IS NOT NULL AND categoria_cnh != '' AND status = 'ativo'
        ORDER BY categoria_cnh ASC
      `;

      const categorias = await executeQuery(query);

      res.json({
        success: true,
        data: categorias.map(item => item.categoria_cnh)
      });

    } catch (error) {
      console.error('Erro ao listar categorias CNH:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as categorias CNH'
      });
    }
  }

  // Buscar motoristas com CNH vencendo em breve
  async buscarMotoristasCnhVencendo(req, res) {
    try {
      const { dias = 30 } = req.query;
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + parseInt(dias));

      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.status, m.filial_id, m.cnh_validade,
          f.filial as filial_nome,
          DATEDIFF(m.cnh_validade, CURDATE()) as dias_para_vencimento
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE m.cnh_validade IS NOT NULL 
          AND m.cnh_validade <= ? 
          AND m.cnh_validade >= CURDATE()
          AND m.status = 'ativo'
        ORDER BY m.cnh_validade ASC
      `;

      const motoristas = await executeQuery(query, [dataLimite]);

      res.json({
        success: true,
        data: motoristas
      });

    } catch (error) {
      console.error('Erro ao buscar motoristas com CNH vencendo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os motoristas com CNH vencendo'
      });
    }
  }
}

module.exports = new MotoristasController(); 