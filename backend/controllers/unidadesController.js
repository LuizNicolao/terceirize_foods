const { executeQuery } = require('../config/database');

class UnidadesController {
  // Listar unidades com paginação, busca e filtros
  async listarUnidades(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status 
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(nome LIKE ? OR sigla LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('status = ?');
        params.push(status);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM unidades_medida 
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          id, nome, sigla, status, 
          criado_em, atualizado_em
        FROM unidades_medida 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY nome ASC
        LIMIT ? OFFSET ?
      `;

      const unidades = await executeQuery(query, [...params, parseInt(limit), offset]);

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
          status: status !== undefined && status !== '' ? status : null
        }
      });

    } catch (error) {
      console.error('Erro ao listar unidades:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as unidades'
      });
    }
  }

  // Buscar unidade por ID
  async buscarUnidadePorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          id, nome, sigla, status, 
          criado_em, atualizado_em
        FROM unidades_medida 
        WHERE id = ?
      `;

      const unidades = await executeQuery(query, [id]);

      if (unidades.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade não encontrada',
          message: 'A unidade especificada não foi encontrada no sistema'
        });
      }

      // Buscar produtos que usam esta unidade
      const produtosQuery = `
        SELECT id, nome, codigo_barras, status
        FROM produtos 
        WHERE unidade_id = ?
        ORDER BY nome ASC
      `;
      const produtos = await executeQuery(produtosQuery, [id]);

      const unidade = unidades[0];
      unidade.produtos = produtos;
      unidade.total_produtos = produtos.length;

      res.json({
        success: true,
        data: unidade
      });

    } catch (error) {
      console.error('Erro ao buscar unidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar a unidade'
      });
    }
  }

  // Criar unidade
  async criarUnidade(req, res) {
    try {
      const { nome, sigla, status = 1 } = req.body;

      // Validações específicas
      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome da unidade inválido',
          message: 'O nome da unidade deve ter pelo menos 3 caracteres'
        });
      }

      if (!sigla || sigla.trim().length < 1) {
        return res.status(400).json({
          success: false,
          error: 'Sigla inválida',
          message: 'A sigla é obrigatória e deve ter pelo menos 1 caractere'
        });
      }

      if (sigla.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Sigla muito longa',
          message: 'A sigla deve ter no máximo 10 caracteres'
        });
      }

      // Verificar se já existe uma unidade com a mesma sigla
      const existingUnidade = await executeQuery(
        'SELECT id FROM unidades_medida WHERE sigla = ?',
        [sigla.toUpperCase()]
      );

      if (existingUnidade.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Sigla já existe',
          message: 'Já existe uma unidade com esta sigla'
        });
      }

      // Inserir unidade
      const insertQuery = `
        INSERT INTO unidades_medida (nome, sigla, status) 
        VALUES (?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        nome.trim(),
        sigla.toUpperCase().trim(),
        status
      ]);

      // Buscar unidade criada
      const newUnidade = await executeQuery(
        'SELECT * FROM unidades_medida WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Unidade criada com sucesso',
        data: newUnidade[0]
      });

    } catch (error) {
      console.error('Erro ao criar unidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar a unidade'
      });
    }
  }

  // Atualizar unidade
  async atualizarUnidade(req, res) {
    try {
      const { id } = req.params;
      const { nome, sigla, status } = req.body;

      // Verificar se a unidade existe
      const existingUnidade = await executeQuery(
        'SELECT * FROM unidades_medida WHERE id = ?',
        [id]
      );

      if (existingUnidade.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade não encontrada',
          message: 'A unidade especificada não foi encontrada'
        });
      }

      // Validações específicas
      if (nome && nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome da unidade inválido',
          message: 'O nome da unidade deve ter pelo menos 3 caracteres'
        });
      }

      if (sigla) {
        if (sigla.trim().length < 1) {
          return res.status(400).json({
            success: false,
            error: 'Sigla inválida',
            message: 'A sigla deve ter pelo menos 1 caractere'
          });
        }

        if (sigla.length > 10) {
          return res.status(400).json({
            success: false,
            error: 'Sigla muito longa',
            message: 'A sigla deve ter no máximo 10 caracteres'
          });
        }
      }

      // Verificar se já existe outra unidade com a mesma sigla
      if (sigla) {
        const existingUnidadeWithSigla = await executeQuery(
          'SELECT id FROM unidades_medida WHERE sigla = ? AND id != ?',
          [sigla.toUpperCase().trim(), id]
        );

        if (existingUnidadeWithSigla.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Sigla já existe',
            message: 'Já existe outra unidade com esta sigla'
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
      if (sigla !== undefined) {
        updateFields.push('sigla = ?');
        updateParams.push(sigla.toUpperCase().trim());
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
        `UPDATE unidades_medida SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Buscar unidade atualizada
      const updatedUnidade = await executeQuery(
        'SELECT * FROM unidades_medida WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Unidade atualizada com sucesso',
        data: updatedUnidade[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar a unidade'
      });
    }
  }

  // Excluir unidade
  async excluirUnidade(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a unidade existe
      const unidade = await executeQuery(
        'SELECT * FROM unidades_medida WHERE id = ?',
        [id]
      );

      if (unidade.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade não encontrada',
          message: 'A unidade especificada não foi encontrada'
        });
      }

      // Verificar se há produtos vinculados
      const produtos = await executeQuery(
        'SELECT id FROM produtos WHERE unidade_id = ?',
        [id]
      );

      if (produtos.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Unidade possui dependências',
          message: `Não é possível excluir a unidade. Existem ${produtos.length} produto(s) vinculado(s) a ela.`,
          dependencies: {
            produtos: produtos.length
          }
        });
      }

      // Excluir unidade
      await executeQuery('DELETE FROM unidades_medida WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Unidade excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir a unidade'
      });
    }
  }

  // Buscar unidades ativas
  async buscarUnidadesAtivas(req, res) {
    try {
      const query = `
        SELECT 
          id, nome, sigla, status, 
          criado_em, atualizado_em
        FROM unidades_medida 
        WHERE status = 1
        ORDER BY nome ASC
      `;

      const unidades = await executeQuery(query);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades ativas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades ativas'
      });
    }
  }

  // Buscar unidades por tipo (peso, volume, etc.)
  async buscarUnidadesPorTipo(req, res) {
    try {
      const { tipo } = req.params;

      // Mapeamento de tipos para siglas comuns
      const tiposUnidades = {
        'peso': ['KG', 'G', 'TON', 'LB', 'OZ'],
        'volume': ['L', 'ML', 'M3', 'CM3', 'GAL'],
        'comprimento': ['M', 'CM', 'MM', 'KM', 'IN', 'FT'],
        'area': ['M2', 'CM2', 'KM2', 'HA', 'AC'],
        'tempo': ['H', 'MIN', 'S', 'DIA', 'SEM', 'MES', 'ANO'],
        'quantidade': ['UN', 'PCT', 'CX', 'KG', 'L']
      };

      const siglas = tiposUnidades[tipo.toLowerCase()] || [];

      if (siglas.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Tipo inválido',
          message: 'Tipo de unidade não reconhecido'
        });
      }

      const placeholders = siglas.map(() => '?').join(',');
      const query = `
        SELECT 
          id, nome, sigla, status, 
          criado_em, atualizado_em
        FROM unidades_medida 
        WHERE sigla IN (${placeholders}) AND status = 1
        ORDER BY nome ASC
      `;

      const unidades = await executeQuery(query, siglas);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades por tipo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades por tipo'
      });
    }
  }

  // Listar tipos de unidades disponíveis
  async listarTiposUnidades(req, res) {
    try {
      const tipos = [
        { id: 'peso', nome: 'Peso', descricao: 'Unidades de peso (kg, g, ton, etc.)' },
        { id: 'volume', nome: 'Volume', descricao: 'Unidades de volume (l, ml, m³, etc.)' },
        { id: 'comprimento', nome: 'Comprimento', descricao: 'Unidades de comprimento (m, cm, mm, etc.)' },
        { id: 'area', nome: 'Área', descricao: 'Unidades de área (m², cm², ha, etc.)' },
        { id: 'tempo', nome: 'Tempo', descricao: 'Unidades de tempo (h, min, s, etc.)' },
        { id: 'quantidade', nome: 'Quantidade', descricao: 'Unidades de quantidade (un, pct, cx, etc.)' }
      ];

      res.json({
        success: true,
        data: tipos
      });

    } catch (error) {
      console.error('Erro ao listar tipos de unidades:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os tipos de unidades'
      });
    }
  }

  // Buscar unidades mais utilizadas
  async buscarUnidadesMaisUtilizadas(req, res) {
    try {
      const { limit = 10 } = req.query;

      const query = `
        SELECT 
          u.id, u.nome, u.sigla, u.status,
          COUNT(p.id) as total_produtos
        FROM unidades_medida u
        LEFT JOIN produtos p ON u.id = p.unidade_id
        WHERE u.status = 1
        GROUP BY u.id, u.nome, u.sigla, u.status
        ORDER BY total_produtos DESC, u.nome ASC
        LIMIT ?
      `;

      const unidades = await executeQuery(query, [parseInt(limit)]);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades mais utilizadas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades mais utilizadas'
      });
    }
  }
}

module.exports = new UnidadesController(); 