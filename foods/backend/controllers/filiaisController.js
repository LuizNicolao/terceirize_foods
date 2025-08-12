const { executeQuery } = require('../config/database');
const axios = require('axios');

class FiliaisController {
  // Listar filiais com paginação, busca e filtros
  async listarFiliais(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        estado,
        supervisao,
        coordenacao 
      } = req.query;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(filial LIKE ? OR razao_social LIKE ? OR cidade LIKE ? OR estado LIKE ? OR supervisao LIKE ? OR coordenacao LIKE ? OR codigo_filial LIKE ? OR cnpj LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('status = ?');
        params.push(status);
      }

      // Filtro por estado
      if (estado) {
        whereConditions.push('estado = ?');
        params.push(estado);
      }

      // Filtro por supervisão
      if (supervisao) {
        whereConditions.push('supervisao LIKE ?');
        params.push(`%${supervisao}%`);
      }

      // Filtro por coordenação
      if (coordenacao) {
        whereConditions.push('coordenacao LIKE ?');
        params.push(`%${coordenacao}%`);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM filiais 
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal com LIMIT e OFFSET como valores diretos
      const query = `
        SELECT 
          id, codigo_filial, cnpj, filial, razao_social, 
          logradouro, numero, bairro, cep, cidade, estado,
          supervisao, coordenacao, status, 
          criado_em, atualizado_em
        FROM filiais 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY filial ASC
        LIMIT ${limitNum} OFFSET ${offset}
      `;

      const filiais = await executeQuery(query, params);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.json({
        success: true,
        data: filiais,
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
          estado: estado || null,
          supervisao: supervisao || null,
          coordenacao: coordenacao || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar filiais:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as filiais'
      });
    }
  }

  // Buscar filial por ID
  async buscarFilialPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          id, codigo_filial, cnpj, filial, razao_social, 
          logradouro, numero, bairro, cep, cidade, estado,
          supervisao, coordenacao, status, 
          criado_em, atualizado_em
        FROM filiais 
        WHERE id = ?
      `;

      const filiais = await executeQuery(query, [id]);

      if (filiais.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Filial não encontrada',
          message: 'A filial especificada não foi encontrada no sistema'
        });
      }

      // Buscar almoxarifados da filial
      const almoxarifadosQuery = `
        SELECT id, nome, status, criado_em, atualizado_em
        FROM almoxarifados 
        WHERE filial_id = ?
        ORDER BY nome ASC
      `;
      const almoxarifados = await executeQuery(almoxarifadosQuery, [id]);

      const filial = filiais[0];
      filial.almoxarifados = almoxarifados;
      filial.total_almoxarifados = almoxarifados.length;

      res.json({
        success: true,
        data: filial
      });

    } catch (error) {
      console.error('Erro ao buscar filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar a filial'
      });
    }
  }

  // Criar filial
  async criarFilial(req, res) {
    try {
      const {
        codigo_filial,
        cnpj,
        filial,
        razao_social,
        logradouro,
        numero,
        bairro,
        cep,
        cidade,
        estado,
        supervisao,
        coordenacao,
        status = 1
      } = req.body;

      // Validações específicas
      if (!filial || filial.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome da filial inválido',
          message: 'O nome da filial deve ter pelo menos 3 caracteres'
        });
      }

      if (!razao_social || razao_social.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Razão social inválida',
          message: 'A razão social deve ter pelo menos 3 caracteres'
        });
      }

      // Validar CNPJ se fornecido
      if (cnpj) {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
          return res.status(400).json({
            success: false,
            error: 'CNPJ inválido',
            message: 'O CNPJ deve ter 14 dígitos'
          });
        }
      }

      // Validar estado se fornecido
      if (estado && estado.length !== 2) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido',
          message: 'O estado deve ter 2 caracteres'
        });
      }

      // Verificar se já existe uma filial com o mesmo código
      if (codigo_filial) {
        const existingFilial = await executeQuery(
          'SELECT id FROM filiais WHERE codigo_filial = ?',
          [codigo_filial]
        );

        if (existingFilial.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Código da filial já existe',
            message: 'Já existe uma filial com este código'
          });
        }
      }

      // Inserir filial
      const insertQuery = `
        INSERT INTO filiais (
          codigo_filial, cnpj, filial, razao_social, 
          logradouro, numero, bairro, cep, cidade, estado,
          supervisao, coordenacao, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        codigo_filial, cnpj, filial, razao_social,
        logradouro, numero, bairro, cep, cidade, estado,
        supervisao, coordenacao, status
      ]);

      // Buscar filial criada
      const newFilial = await executeQuery(
        'SELECT * FROM filiais WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Filial criada com sucesso',
        data: newFilial[0]
      });

    } catch (error) {
      console.error('Erro ao criar filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar a filial'
      });
    }
  }

  // Atualizar filial
  async atualizarFilial(req, res) {
    try {
      const { id } = req.params;
      const {
        codigo_filial,
        cnpj,
        filial,
        razao_social,
        logradouro,
        numero,
        bairro,
        cep,
        cidade,
        estado,
        supervisao,
        coordenacao,
        status
      } = req.body;

      // Verificar se a filial existe
      const existingFilial = await executeQuery(
        'SELECT * FROM filiais WHERE id = ?',
        [id]
      );

      if (existingFilial.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Filial não encontrada',
          message: 'A filial especificada não foi encontrada'
        });
      }

      // Validações específicas
      if (filial && filial.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome da filial inválido',
          message: 'O nome da filial deve ter pelo menos 3 caracteres'
        });
      }

      if (razao_social && razao_social.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Razão social inválida',
          message: 'A razão social deve ter pelo menos 3 caracteres'
        });
      }

      // Validar CNPJ se fornecido
      if (cnpj) {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
          return res.status(400).json({
            success: false,
            error: 'CNPJ inválido',
            message: 'O CNPJ deve ter 14 dígitos'
          });
        }
      }

      // Validar estado se fornecido
      if (estado && estado.length !== 2) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido',
          message: 'O estado deve ter 2 caracteres'
        });
      }

      // Verificar se já existe outra filial com o mesmo código
      if (codigo_filial) {
        const existingFilialWithCode = await executeQuery(
          'SELECT id FROM filiais WHERE codigo_filial = ? AND id != ?',
          [codigo_filial, id]
        );

        if (existingFilialWithCode.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Código da filial já existe',
            message: 'Já existe outra filial com este código'
          });
        }
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateParams = [];

      if (codigo_filial !== undefined) {
        updateFields.push('codigo_filial = ?');
        updateParams.push(codigo_filial);
      }
      if (cnpj !== undefined) {
        updateFields.push('cnpj = ?');
        updateParams.push(cnpj);
      }
      if (filial !== undefined) {
        updateFields.push('filial = ?');
        updateParams.push(filial);
      }
      if (razao_social !== undefined) {
        updateFields.push('razao_social = ?');
        updateParams.push(razao_social);
      }
      if (logradouro !== undefined) {
        updateFields.push('logradouro = ?');
        updateParams.push(logradouro);
      }
      if (numero !== undefined) {
        updateFields.push('numero = ?');
        updateParams.push(numero);
      }
      if (bairro !== undefined) {
        updateFields.push('bairro = ?');
        updateParams.push(bairro);
      }
      if (cep !== undefined) {
        updateFields.push('cep = ?');
        updateParams.push(cep);
      }
      if (cidade !== undefined) {
        updateFields.push('cidade = ?');
        updateParams.push(cidade);
      }
      if (estado !== undefined) {
        updateFields.push('estado = ?');
        updateParams.push(estado);
      }
      if (supervisao !== undefined) {
        updateFields.push('supervisao = ?');
        updateParams.push(supervisao);
      }
      if (coordenacao !== undefined) {
        updateFields.push('coordenacao = ?');
        updateParams.push(coordenacao);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
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
        `UPDATE filiais SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Buscar filial atualizada
      const updatedFilial = await executeQuery(
        'SELECT * FROM filiais WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Filial atualizada com sucesso',
        data: updatedFilial[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar a filial'
      });
    }
  }

  // Excluir filial (soft delete)
  async excluirFilial(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a filial existe
      const filial = await executeQuery(
        'SELECT * FROM filiais WHERE id = ?',
        [id]
      );

      if (filial.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Filial não encontrada',
          message: 'A filial especificada não foi encontrada'
        });
      }

      // Verificar se há almoxarifados vinculados
      const almoxarifados = await executeQuery(
        'SELECT id FROM almoxarifados WHERE filial_id = ?',
        [id]
      );

      if (almoxarifados.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Filial possui dependências',
          message: `Não é possível excluir a filial. Existem ${almoxarifados.length} almoxarifado(s) vinculado(s) a ela.`,
          dependencies: {
            almoxarifados: almoxarifados.length
          }
        });
      }

      // Excluir filial
      await executeQuery('DELETE FROM filiais WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Filial excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir a filial'
      });
    }
  }

  // Buscar filiais ativas
  async buscarFiliaisAtivas(req, res) {
    try {
      const query = `
        SELECT 
          id, codigo_filial, cnpj, filial, razao_social, 
          logradouro, numero, bairro, cep, cidade, estado,
          supervisao, coordenacao, status, 
          criado_em, atualizado_em
        FROM filiais 
        WHERE status = 1
        ORDER BY filial ASC
      `;

      const filiais = await executeQuery(query);

      res.json({
        success: true,
        data: filiais
      });

    } catch (error) {
      console.error('Erro ao buscar filiais ativas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as filiais ativas'
      });
    }
  }

  // Buscar filiais por estado
  async buscarFiliaisPorEstado(req, res) {
    try {
      const { estado } = req.params;

      const query = `
        SELECT 
          id, codigo_filial, cnpj, filial, razao_social, 
          logradouro, numero, bairro, cep, cidade, estado,
          supervisao, coordenacao, status, 
          criado_em, atualizado_em
        FROM filiais 
        WHERE estado = ? AND status = 1
        ORDER BY filial ASC
      `;

      const filiais = await executeQuery(query, [estado]);

      res.json({
        success: true,
        data: filiais
      });

    } catch (error) {
      console.error('Erro ao buscar filiais por estado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as filiais por estado'
      });
    }
  }

  // Listar estados disponíveis
  async listarEstados(req, res) {
    try {
      const query = `
        SELECT DISTINCT estado 
        FROM filiais 
        WHERE estado IS NOT NULL AND estado != ''
        ORDER BY estado ASC
      `;

      const estados = await executeQuery(query);

      res.json({
        success: true,
        data: estados.map(item => item.estado)
      });

    } catch (error) {
      console.error('Erro ao listar estados:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os estados'
      });
    }
  }

  // Listar supervisões disponíveis
  async listarSupervisoes(req, res) {
    try {
      const query = `
        SELECT DISTINCT supervisao 
        FROM filiais 
        WHERE supervisao IS NOT NULL AND supervisao != ''
        ORDER BY supervisao ASC
      `;

      const supervisoes = await executeQuery(query);

      res.json({
        success: true,
        data: supervisoes.map(item => item.supervisao)
      });

    } catch (error) {
      console.error('Erro ao listar supervisões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as supervisões'
      });
    }
  }

  // Listar coordenações disponíveis
  async listarCoordenacoes(req, res) {
    try {
      const query = `
        SELECT DISTINCT coordenacao 
        FROM filiais 
        WHERE coordenacao IS NOT NULL AND coordenacao != ''
        ORDER BY coordenacao ASC
      `;

      const coordenacoes = await executeQuery(query);

      res.json({
        success: true,
        data: coordenacoes.map(item => item.coordenacao)
      });

    } catch (error) {
      console.error('Erro ao listar coordenações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as coordenações'
      });
    }
  }

  // Consultar CNPJ na API externa
  async consultarCNPJ(req, res) {
    try {
      const { cnpj } = req.params;
      
      // Limpar CNPJ (remover caracteres não numéricos)
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      
      if (cnpjLimpo.length !== 14) {
        return res.status(400).json({
          success: false,
          error: 'CNPJ inválido',
          message: 'CNPJ deve ter 14 dígitos'
        });
      }

      // Tentar buscar dados do CNPJ usando Brasil API
      let dadosCNPJ = null;
      
      try {
        const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
          timeout: 8000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.data && response.data.razao_social) {
          dadosCNPJ = {
            razao_social: response.data.razao_social,
            nome_fantasia: response.data.nome_fantasia,
            logradouro: response.data.logradouro,
            numero: response.data.numero,
            bairro: response.data.bairro,
            municipio: response.data.municipio,
            uf: response.data.uf,
            cep: response.data.cep,
            telefone: (() => {
              let telefone = null;
              
              if (response.data.ddd_telefone_1 && response.data.telefone_1) {
                telefone = `${response.data.ddd_telefone_1}${response.data.telefone_1}`;
              } else if (response.data.telefone) {
                telefone = response.data.telefone;
              } else if (response.data.ddd_telefone_1) {
                telefone = response.data.ddd_telefone_1;
              }
              
              if (telefone) {
                telefone = telefone.toString().replace(/undefined/g, '');
                telefone = telefone.replace(/\D/g, '');
                return telefone.length >= 10 ? telefone : null;
              }
              
              return null;
            })(),
            email: response.data.email
          };
        }
      } catch (error) {
        console.log('Erro ao buscar CNPJ na API externa:', error.message);
        
        return res.status(503).json({
          success: false,
          error: 'Serviço indisponível',
          message: 'Serviço de consulta CNPJ temporariamente indisponível. Tente novamente em alguns minutos.'
        });
      }

      if (dadosCNPJ) {
        res.json({
          success: true,
          data: dadosCNPJ
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'CNPJ não encontrado',
          message: 'CNPJ não encontrado ou dados indisponíveis'
        });
      }

    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível consultar o CNPJ'
      });
    }
  }

  // ===== MÉTODOS DE ALMOXARIFADOS =====

  // Listar almoxarifados de uma filial
  async listarAlmoxarifados(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          id, filial_id, nome, status, criado_em, atualizado_em
        FROM almoxarifados 
        WHERE filial_id = ?
        ORDER BY nome ASC
      `;

      const almoxarifados = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: almoxarifados
      });

    } catch (error) {
      console.error('Erro ao listar almoxarifados:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os almoxarifados'
      });
    }
  }

  // Criar almoxarifado
  async criarAlmoxarifado(req, res) {
    try {
      const { filialId } = req.params;
      const { nome } = req.body;

      if (!nome || nome.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Nome obrigatório',
          message: 'O nome do almoxarifado é obrigatório'
        });
      }

      // Verificar se a filial existe
      const filial = await executeQuery('SELECT id FROM filiais WHERE id = ?', [filialId]);
      if (filial.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Filial não encontrada',
          message: 'Filial não encontrada'
        });
      }

      // Verificar se já existe um almoxarifado com o mesmo nome na filial
      const almoxarifadoExistente = await executeQuery(
        'SELECT id FROM almoxarifados WHERE filial_id = ? AND nome = ?',
        [filialId, nome.trim()]
      );

      if (almoxarifadoExistente.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Almoxarifado já existe',
          message: 'Já existe um almoxarifado com este nome nesta filial'
        });
      }

      const query = `
        INSERT INTO almoxarifados (filial_id, nome, status, criado_em, atualizado_em)
        VALUES (?, ?, 1, NOW(), NOW())
      `;

      const result = await executeQuery(query, [filialId, nome.trim()]);

      // Buscar o almoxarifado criado
      const almoxarifado = await executeQuery(
        'SELECT * FROM almoxarifados WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        data: almoxarifado[0],
        message: 'Almoxarifado criado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar almoxarifado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar o almoxarifado'
      });
    }
  }

  // Atualizar almoxarifado
  async atualizarAlmoxarifado(req, res) {
    try {
      const { id } = req.params;
      const { nome, status } = req.body;

      if (!nome || nome.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Nome obrigatório',
          message: 'O nome do almoxarifado é obrigatório'
        });
      }

      // Verificar se o almoxarifado existe
      const almoxarifado = await executeQuery('SELECT * FROM almoxarifados WHERE id = ?', [id]);
      if (almoxarifado.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Almoxarifado não encontrado',
          message: 'Almoxarifado não encontrado'
        });
      }

      // Verificar se já existe outro almoxarifado com o mesmo nome na mesma filial
      const almoxarifadoExistente = await executeQuery(
        'SELECT id FROM almoxarifados WHERE filial_id = ? AND nome = ? AND id != ?',
        [almoxarifado[0].filial_id, nome.trim(), id]
      );

      if (almoxarifadoExistente.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Nome já existe',
          message: 'Já existe um almoxarifado com este nome nesta filial'
        });
      }

      const query = `
        UPDATE almoxarifados 
        SET nome = ?, status = ?, atualizado_em = NOW()
        WHERE id = ?
      `;

      await executeQuery(query, [nome.trim(), status, id]);

      // Buscar o almoxarifado atualizado
      const almoxarifadoAtualizado = await executeQuery(
        'SELECT * FROM almoxarifados WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        data: almoxarifadoAtualizado[0],
        message: 'Almoxarifado atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar almoxarifado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar o almoxarifado'
      });
    }
  }

  // Excluir almoxarifado
  async excluirAlmoxarifado(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o almoxarifado existe
      const almoxarifado = await executeQuery('SELECT * FROM almoxarifados WHERE id = ?', [id]);
      if (almoxarifado.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Almoxarifado não encontrado',
          message: 'Almoxarifado não encontrado'
        });
      }

      // Verificar se há itens no almoxarifado
      const itens = await executeQuery(
        'SELECT COUNT(*) as count FROM almoxarifado_itens WHERE almoxarifado_id = ?',
        [id]
      );

      if (itens[0].count > 0) {
        return res.status(400).json({
          success: false,
          error: 'Almoxarifado com itens',
          message: 'Não é possível excluir um almoxarifado que possui itens'
        });
      }

      await executeQuery('DELETE FROM almoxarifados WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Almoxarifado excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir almoxarifado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o almoxarifado'
      });
    }
  }

  // Listar itens de um almoxarifado
  async listarItensAlmoxarifado(req, res) {
    try {
      const { almoxarifadoId } = req.params;

      const query = `
        SELECT 
          ai.id, ai.almoxarifado_id, ai.produto_id, ai.quantidade,
          ai.criado_em, ai.atualizado_em,
          p.nome as produto_nome, p.codigo as produto_codigo,
          u.nome as unidade_nome
        FROM almoxarifado_itens ai
        INNER JOIN produtos p ON ai.produto_id = p.id
        LEFT JOIN unidades u ON p.unidade_id = u.id
        WHERE ai.almoxarifado_id = ?
        ORDER BY p.nome ASC
      `;

      const itens = await executeQuery(query, [almoxarifadoId]);

      res.json({
        success: true,
        data: itens
      });

    } catch (error) {
      console.error('Erro ao listar itens do almoxarifado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os itens do almoxarifado'
      });
    }
  }

  // Adicionar item ao almoxarifado
  async adicionarItemAlmoxarifado(req, res) {
    try {
      const { almoxarifadoId } = req.params;
      const { produto_id, quantidade } = req.body;

      if (!produto_id || !quantidade) {
        return res.status(400).json({
          success: false,
          error: 'Dados obrigatórios',
          message: 'Produto e quantidade são obrigatórios'
        });
      }

      // Verificar se o almoxarifado existe
      const almoxarifado = await executeQuery('SELECT id FROM almoxarifados WHERE id = ?', [almoxarifadoId]);
      if (almoxarifado.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Almoxarifado não encontrado',
          message: 'Almoxarifado não encontrado'
        });
      }

      // Verificar se o produto existe
      const produto = await executeQuery('SELECT id FROM produtos WHERE id = ?', [produto_id]);
      if (produto.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: 'Produto não encontrado'
        });
      }

      // Verificar se o item já existe no almoxarifado
      const itemExistente = await executeQuery(
        'SELECT id FROM almoxarifado_itens WHERE almoxarifado_id = ? AND produto_id = ?',
        [almoxarifadoId, produto_id]
      );

      if (itemExistente.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Item já existe',
          message: 'Este produto já está no almoxarifado'
        });
      }

      const query = `
        INSERT INTO almoxarifado_itens (almoxarifado_id, produto_id, quantidade, criado_em, atualizado_em)
        VALUES (?, ?, ?, NOW(), NOW())
      `;

      const result = await executeQuery(query, [almoxarifadoId, produto_id, quantidade]);

      // Buscar o item criado
      const item = await executeQuery(
        `SELECT 
          ai.id, ai.almoxarifado_id, ai.produto_id, ai.quantidade,
          ai.criado_em, ai.atualizado_em,
          p.nome as produto_nome, p.codigo as produto_codigo,
          u.nome as unidade_nome
        FROM almoxarifado_itens ai
        INNER JOIN produtos p ON ai.produto_id = p.id
        LEFT JOIN unidades u ON p.unidade_id = u.id
        WHERE ai.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        data: item[0],
        message: 'Item adicionado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao adicionar item ao almoxarifado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível adicionar o item ao almoxarifado'
      });
    }
  }

  // Remover item do almoxarifado
  async removerItemAlmoxarifado(req, res) {
    try {
      const { almoxarifadoId, itemId } = req.params;

      // Verificar se o item existe
      const item = await executeQuery(
        'SELECT id FROM almoxarifado_itens WHERE id = ? AND almoxarifado_id = ?',
        [itemId, almoxarifadoId]
      );

      if (item.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Item não encontrado',
          message: 'Item não encontrado'
        });
      }

      await executeQuery('DELETE FROM almoxarifado_itens WHERE id = ?', [itemId]);

      res.json({
        success: true,
        message: 'Item removido com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover item do almoxarifado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível remover o item do almoxarifado'
      });
    }
  }
}

module.exports = new FiliaisController(); 