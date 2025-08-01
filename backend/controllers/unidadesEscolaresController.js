const { executeQuery } = require('../config/database');

class UnidadesEscolaresController {
  // Listar unidades escolares com paginação, busca e filtros
  async listarUnidadesEscolares(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        estado,
        cidade,
        centro_distribuicao,
        rota_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(ue.nome_escola LIKE ? OR ue.cidade LIKE ? OR ue.estado LIKE ? OR ue.codigo_teknisa LIKE ? OR ue.centro_distribuicao LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('ue.status = ?');
        params.push(status);
      }

      // Filtro por estado
      if (estado) {
        whereConditions.push('ue.estado = ?');
        params.push(estado);
      }

      // Filtro por cidade
      if (cidade) {
        whereConditions.push('ue.cidade LIKE ?');
        params.push(`%${cidade}%`);
      }

      // Filtro por centro de distribuição
      if (centro_distribuicao) {
        whereConditions.push('ue.centro_distribuicao LIKE ?');
        params.push(`%${centro_distribuicao}%`);
      }

      // Filtro por rota
      if (rota_id) {
        whereConditions.push('ue.rota_id = ?');
        params.push(rota_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.pais, ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.rota_id, ue.regional, ue.lot, 
          ue.cc_senic, ue.codigo_senio, ue.abastecimento, ue.ordem_entrega, 
          ue.status, ue.observacoes, ue.created_at, ue.updated_at,
          r.nome as rota_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ue.nome_escola ASC
        LIMIT ? OFFSET ?
      `;

      const unidades = await executeQuery(query, [...params, Number(limit), Number(offset)]);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: unidades,
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
          estado: estado || null,
          cidade: cidade || null,
          centro_distribuicao: centro_distribuicao || null,
          rota_id: rota_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar unidades escolares:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as unidades escolares'
      });
    }
  }

  // Buscar unidade escolar por ID
  async buscarUnidadeEscolarPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.pais, ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.rota_id, ue.regional, ue.lot, 
          ue.cc_senic, ue.codigo_senio, ue.abastecimento, ue.ordem_entrega, 
          ue.status, ue.observacoes, ue.created_at, ue.updated_at,
          r.nome as rota_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        WHERE ue.id = ?
      `;

      const unidades = await executeQuery(query, [id]);

      if (unidades.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade escolar não encontrada',
          message: 'A unidade escolar especificada não foi encontrada no sistema'
        });
      }

      res.json({
        success: true,
        data: unidades[0]
      });

    } catch (error) {
      console.error('Erro ao buscar unidade escolar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar a unidade escolar'
      });
    }
  }

  // Criar unidade escolar
  async criarUnidadeEscolar(req, res) {
    try {
      const {
        codigo_teknisa,
        nome_escola,
        cidade,
        estado,
        pais = 'Brasil',
        endereco,
        numero,
        bairro,
        cep,
        centro_distribuicao,
        rota_id,
        regional,
        lot,
        cc_senic,
        codigo_senio,
        abastecimento,
        ordem_entrega = 0,
        status = 'ativo',
        observacoes
      } = req.body;

      // Validações específicas
      if (!codigo_teknisa || codigo_teknisa.trim().length < 1) {
        return res.status(400).json({
          success: false,
          error: 'Código Teknisa inválido',
          message: 'O código Teknisa é obrigatório e deve ter pelo menos 1 caractere'
        });
      }

      if (!nome_escola || nome_escola.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome da escola inválido',
          message: 'O nome da escola deve ter pelo menos 3 caracteres'
        });
      }

      if (!cidade || cidade.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Cidade inválida',
          message: 'A cidade deve ter pelo menos 2 caracteres'
        });
      }

      if (!estado || estado.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido',
          message: 'O estado deve ter pelo menos 2 caracteres'
        });
      }

      if (!endereco || endereco.trim().length < 5) {
        return res.status(400).json({
          success: false,
          error: 'Endereço inválido',
          message: 'O endereço deve ter pelo menos 5 caracteres'
        });
      }

      // Verificar se a rota existe (se fornecida)
      if (rota_id) {
        const rota = await executeQuery(
          'SELECT id FROM rotas WHERE id = ?',
          [rota_id]
        );

        if (rota.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Rota não encontrada',
            message: 'A rota especificada não foi encontrada'
          });
        }
      }

      // Verificar se código teknisa já existe
      const existingUnidade = await executeQuery(
        'SELECT id FROM unidades_escolares WHERE codigo_teknisa = ?',
        [codigo_teknisa.trim()]
      );

      if (existingUnidade.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Código Teknisa já existe',
          message: 'Já existe uma unidade escolar com este código Teknisa'
        });
      }

      // Inserir unidade escolar
      const insertQuery = `
        INSERT INTO unidades_escolares (
          codigo_teknisa, nome_escola, cidade, estado, pais, endereco, numero, bairro, cep,
          centro_distribuicao, rota_id, regional, lot, cc_senic, codigo_senio, abastecimento,
          ordem_entrega, status, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        codigo_teknisa.trim(),
        nome_escola.trim(),
        cidade.trim(),
        estado.trim(),
        pais.trim(),
        endereco.trim(),
        numero,
        bairro,
        cep,
        centro_distribuicao,
        rota_id,
        regional,
        lot,
        cc_senic,
        codigo_senio,
        abastecimento,
        ordem_entrega,
        status,
        observacoes
      ]);

      // Buscar unidade escolar criada
      const newUnidade = await executeQuery(
        'SELECT ue.*, r.nome as rota_nome FROM unidades_escolares ue LEFT JOIN rotas r ON ue.rota_id = r.id WHERE ue.id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Unidade escolar criada com sucesso',
        data: newUnidade[0]
      });

    } catch (error) {
      console.error('Erro ao criar unidade escolar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar a unidade escolar'
      });
    }
  }

  // Atualizar unidade escolar
  async atualizarUnidadeEscolar(req, res) {
    try {
      const { id } = req.params;
      const {
        codigo_teknisa,
        nome_escola,
        cidade,
        estado,
        pais,
        endereco,
        numero,
        bairro,
        cep,
        centro_distribuicao,
        rota_id,
        regional,
        lot,
        cc_senic,
        codigo_senio,
        abastecimento,
        ordem_entrega,
        status,
        observacoes
      } = req.body;

      // Verificar se a unidade escolar existe
      const existingUnidade = await executeQuery(
        'SELECT * FROM unidades_escolares WHERE id = ?',
        [id]
      );

      if (existingUnidade.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade escolar não encontrada',
          message: 'A unidade escolar especificada não foi encontrada'
        });
      }

      // Validações específicas
      if (codigo_teknisa && codigo_teknisa.trim().length < 1) {
        return res.status(400).json({
          success: false,
          error: 'Código Teknisa inválido',
          message: 'O código Teknisa deve ter pelo menos 1 caractere'
        });
      }

      if (nome_escola && nome_escola.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome da escola inválido',
          message: 'O nome da escola deve ter pelo menos 3 caracteres'
        });
      }

      if (cidade && cidade.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Cidade inválida',
          message: 'A cidade deve ter pelo menos 2 caracteres'
        });
      }

      if (estado && estado.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido',
          message: 'O estado deve ter pelo menos 2 caracteres'
        });
      }

      if (endereco && endereco.trim().length < 5) {
        return res.status(400).json({
          success: false,
          error: 'Endereço inválido',
          message: 'O endereço deve ter pelo menos 5 caracteres'
        });
      }

      // Verificar se a rota existe (se fornecida)
      if (rota_id) {
        const rota = await executeQuery(
          'SELECT id FROM rotas WHERE id = ?',
          [rota_id]
        );

        if (rota.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Rota não encontrada',
            message: 'A rota especificada não foi encontrada'
          });
        }
      }

      // Verificar se código teknisa já existe (se estiver sendo alterado)
      if (codigo_teknisa) {
        const codigoCheck = await executeQuery(
          'SELECT id FROM unidades_escolares WHERE codigo_teknisa = ? AND id != ?',
          [codigo_teknisa.trim(), id]
        );

        if (codigoCheck.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Código Teknisa já existe',
            message: 'Já existe outra unidade escolar com este código Teknisa'
          });
        }
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateParams = [];

      if (codigo_teknisa !== undefined) {
        updateFields.push('codigo_teknisa = ?');
        updateParams.push(codigo_teknisa.trim());
      }
      if (nome_escola !== undefined) {
        updateFields.push('nome_escola = ?');
        updateParams.push(nome_escola.trim());
      }
      if (cidade !== undefined) {
        updateFields.push('cidade = ?');
        updateParams.push(cidade.trim());
      }
      if (estado !== undefined) {
        updateFields.push('estado = ?');
        updateParams.push(estado.trim());
      }
      if (pais !== undefined) {
        updateFields.push('pais = ?');
        updateParams.push(pais.trim());
      }
      if (endereco !== undefined) {
        updateFields.push('endereco = ?');
        updateParams.push(endereco.trim());
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
      if (centro_distribuicao !== undefined) {
        updateFields.push('centro_distribuicao = ?');
        updateParams.push(centro_distribuicao);
      }
      if (rota_id !== undefined) {
        updateFields.push('rota_id = ?');
        updateParams.push(rota_id);
      }
      if (regional !== undefined) {
        updateFields.push('regional = ?');
        updateParams.push(regional);
      }
      if (lot !== undefined) {
        updateFields.push('lot = ?');
        updateParams.push(lot);
      }
      if (cc_senic !== undefined) {
        updateFields.push('cc_senic = ?');
        updateParams.push(cc_senic);
      }
      if (codigo_senio !== undefined) {
        updateFields.push('codigo_senio = ?');
        updateParams.push(codigo_senio);
      }
      if (abastecimento !== undefined) {
        updateFields.push('abastecimento = ?');
        updateParams.push(abastecimento);
      }
      if (ordem_entrega !== undefined) {
        updateFields.push('ordem_entrega = ?');
        updateParams.push(ordem_entrega);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }
      if (observacoes !== undefined) {
        updateFields.push('observacoes = ?');
        updateParams.push(observacoes);
      }

      // Sempre atualizar o timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum campo para atualizar',
          message: 'Nenhum campo foi fornecido para atualização'
        });
      }

      updateParams.push(id);
      await executeQuery(
        `UPDATE unidades_escolares SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Buscar unidade escolar atualizada
      const updatedUnidade = await executeQuery(
        'SELECT ue.*, r.nome as rota_nome FROM unidades_escolares ue LEFT JOIN rotas r ON ue.rota_id = r.id WHERE ue.id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Unidade escolar atualizada com sucesso',
        data: updatedUnidade[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar unidade escolar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar a unidade escolar'
      });
    }
  }

  // Excluir unidade escolar
  async excluirUnidadeEscolar(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a unidade escolar existe
      const unidade = await executeQuery(
        'SELECT * FROM unidades_escolares WHERE id = ?',
        [id]
      );

      if (unidade.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade escolar não encontrada',
          message: 'A unidade escolar especificada não foi encontrada'
        });
      }

      // Excluir unidade escolar
      await executeQuery('DELETE FROM unidades_escolares WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Unidade escolar excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir unidade escolar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir a unidade escolar'
      });
    }
  }

  // Buscar unidades escolares ativas
  async buscarUnidadesEscolaresAtivas(req, res) {
    try {
      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          r.nome as rota_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        WHERE ue.status = 'ativo'
        ORDER BY ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares ativas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares ativas'
      });
    }
  }

  // Buscar unidades escolares por estado
  async buscarUnidadesEscolaresPorEstado(req, res) {
    try {
      const { estado } = req.params;

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          r.nome as rota_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        WHERE ue.estado = ? AND ue.status = 'ativo'
        ORDER BY ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, [estado]);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares por estado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares por estado'
      });
    }
  }

  // Buscar unidades escolares por rota
  async buscarUnidadesEscolaresPorRota(req, res) {
    try {
      const { rotaId } = req.params;

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          r.nome as rota_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        WHERE ue.rota_id = ? AND ue.status = 'ativo'
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, [rotaId]);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares por rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares por rota'
      });
    }
  }

  // Listar estados disponíveis
  async listarEstados(req, res) {
    try {
      const query = `
        SELECT DISTINCT estado 
        FROM unidades_escolares 
        WHERE estado IS NOT NULL AND estado != '' AND status = 'ativo'
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

  // Listar centros de distribuição disponíveis
  async listarCentrosDistribuicao(req, res) {
    try {
      const query = `
        SELECT DISTINCT centro_distribuicao 
        FROM unidades_escolares 
        WHERE centro_distribuicao IS NOT NULL AND centro_distribuicao != '' AND status = 'ativo'
        ORDER BY centro_distribuicao ASC
      `;

      const centros = await executeQuery(query);

      res.json({
        success: true,
        data: centros.map(item => item.centro_distribuicao)
      });

    } catch (error) {
      console.error('Erro ao listar centros de distribuição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os centros de distribuição'
      });
    }
  }
}

module.exports = new UnidadesEscolaresController(); 