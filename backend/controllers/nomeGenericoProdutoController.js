const { executeQuery } = require('../config/database');

class NomeGenericoProdutoController {
  // Listar nomes genéricos com paginação, busca e filtros
  async listarNomesGenericos(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        grupo_id,
        subgrupo_id,
        classe_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(ngp.nome LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('ngp.status = ?');
        params.push(status);
      }

      // Filtro por grupo
      if (grupo_id) {
        whereConditions.push('ngp.grupo_id = ?');
        params.push(grupo_id);
      }

      // Filtro por subgrupo
      if (subgrupo_id) {
        whereConditions.push('ngp.subgrupo_id = ?');
        params.push(subgrupo_id);
      }

      // Filtro por classe
      if (classe_id) {
        whereConditions.push('ngp.classe_id = ?');
        params.push(classe_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM nome_generico_produto ngp
        LEFT JOIN grupos g ON ngp.grupo_id = g.id
        LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
        LEFT JOIN classes c ON ngp.classe_id = c.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          ngp.*,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          (SELECT COUNT(*) FROM produtos p WHERE p.nome_generico_id = ngp.id AND p.status = 1) as total_produtos
        FROM nome_generico_produto ngp
        LEFT JOIN grupos g ON ngp.grupo_id = g.id
        LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
        LEFT JOIN classes c ON ngp.classe_id = c.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ngp.nome ASC
        LIMIT ? OFFSET ?
      `;

      const nomesGenericos = await executeQuery(query, [...params, Number(limit), Number(offset)]);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: nomesGenericos,
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
          grupo_id: grupo_id || null,
          subgrupo_id: subgrupo_id || null,
          classe_id: classe_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar nomes genéricos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os nomes genéricos'
      });
    }
  }

  // Buscar nome genérico por ID
  async buscarNomeGenericoPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          ngp.*,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          (SELECT COUNT(*) FROM produtos p WHERE p.nome_generico_id = ngp.id AND p.status = 1) as total_produtos
        FROM nome_generico_produto ngp
        LEFT JOIN grupos g ON ngp.grupo_id = g.id
        LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
        LEFT JOIN classes c ON ngp.classe_id = c.id
        WHERE ngp.id = ?
      `;

      const nomesGenericos = await executeQuery(query, [id]);

      if (nomesGenericos.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Nome genérico não encontrado',
          message: 'O nome genérico especificado não foi encontrado no sistema'
        });
      }

      res.json({
        success: true,
        data: nomesGenericos[0]
      });

    } catch (error) {
      console.error('Erro ao buscar nome genérico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o nome genérico'
      });
    }
  }

  // Criar nome genérico
  async criarNomeGenerico(req, res) {
    try {
      const {
        nome,
        grupo_id,
        subgrupo_id,
        classe_id,
        status = 1
      } = req.body;

      // Validações específicas
      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Verificar se nome já existe
      const existingNome = await executeQuery(
        'SELECT id FROM nome_generico_produto WHERE nome = ?',
        [nome.trim()]
      );

      if (existingNome.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Nome já cadastrado',
          message: 'Já existe um nome genérico com este nome'
        });
      }

      // Verificar se o grupo existe (se fornecido)
      if (grupo_id) {
        const grupo = await executeQuery(
          'SELECT id FROM grupos WHERE id = ?',
          [grupo_id]
        );

        if (grupo.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Grupo não encontrado',
            message: 'O grupo especificado não foi encontrado'
          });
        }
      }

      // Verificar se o subgrupo existe (se fornecido)
      if (subgrupo_id) {
        const subgrupo = await executeQuery(
          'SELECT id FROM subgrupos WHERE id = ?',
          [subgrupo_id]
        );

        if (subgrupo.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Subgrupo não encontrado',
            message: 'O subgrupo especificado não foi encontrado'
          });
        }
      }

      // Verificar se a classe existe (se fornecida)
      if (classe_id) {
        const classe = await executeQuery(
          'SELECT id FROM classes WHERE id = ?',
          [classe_id]
        );

        if (classe.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Classe não encontrada',
            message: 'A classe especificada não foi encontrada'
          });
        }
      }

      // Inserir nome genérico
      const insertQuery = `
        INSERT INTO nome_generico_produto (
          nome, grupo_id, subgrupo_id, classe_id, status
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        nome.trim(),
        grupo_id,
        subgrupo_id,
        classe_id,
        status
      ]);

      // Buscar nome genérico criado
      const newNomeGenerico = await executeQuery(
        'SELECT ngp.*, g.nome as grupo_nome, sg.nome as subgrupo_nome, c.nome as classe_nome FROM nome_generico_produto ngp LEFT JOIN grupos g ON ngp.grupo_id = g.id LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id LEFT JOIN classes c ON ngp.classe_id = c.id WHERE ngp.id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Nome genérico criado com sucesso',
        data: newNomeGenerico[0]
      });

    } catch (error) {
      console.error('Erro ao criar nome genérico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar o nome genérico'
      });
    }
  }

  // Atualizar nome genérico
  async atualizarNomeGenerico(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        grupo_id,
        subgrupo_id,
        classe_id,
        status
      } = req.body;

      // Verificar se o nome genérico existe
      const existingNomeGenerico = await executeQuery(
        'SELECT * FROM nome_generico_produto WHERE id = ?',
        [id]
      );

      if (existingNomeGenerico.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Nome genérico não encontrado',
          message: 'O nome genérico especificado não foi encontrado'
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

      // Verificar se nome já existe em outro registro
      if (nome) {
        const nomeCheck = await executeQuery(
          'SELECT id FROM nome_generico_produto WHERE nome = ? AND id != ?',
          [nome.trim(), id]
        );

        if (nomeCheck.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Nome já cadastrado',
            message: 'Já existe outro nome genérico com este nome'
          });
        }
      }

      // Verificar se o grupo existe (se fornecido)
      if (grupo_id) {
        const grupo = await executeQuery(
          'SELECT id FROM grupos WHERE id = ?',
          [grupo_id]
        );

        if (grupo.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Grupo não encontrado',
            message: 'O grupo especificado não foi encontrado'
          });
        }
      }

      // Verificar se o subgrupo existe (se fornecido)
      if (subgrupo_id) {
        const subgrupo = await executeQuery(
          'SELECT id FROM subgrupos WHERE id = ?',
          [subgrupo_id]
        );

        if (subgrupo.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Subgrupo não encontrado',
            message: 'O subgrupo especificado não foi encontrado'
          });
        }
      }

      // Verificar se a classe existe (se fornecida)
      if (classe_id) {
        const classe = await executeQuery(
          'SELECT id FROM classes WHERE id = ?',
          [classe_id]
        );

        if (classe.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Classe não encontrada',
            message: 'A classe especificada não foi encontrada'
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
      if (grupo_id !== undefined) {
        updateFields.push('grupo_id = ?');
        updateParams.push(grupo_id);
      }
      if (subgrupo_id !== undefined) {
        updateFields.push('subgrupo_id = ?');
        updateParams.push(subgrupo_id);
      }
      if (classe_id !== undefined) {
        updateFields.push('classe_id = ?');
        updateParams.push(classe_id);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
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
        `UPDATE nome_generico_produto SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Buscar nome genérico atualizado
      const updatedNomeGenerico = await executeQuery(
        'SELECT ngp.*, g.nome as grupo_nome, sg.nome as subgrupo_nome, c.nome as classe_nome FROM nome_generico_produto ngp LEFT JOIN grupos g ON ngp.grupo_id = g.id LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id LEFT JOIN classes c ON ngp.classe_id = c.id WHERE ngp.id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Nome genérico atualizado com sucesso',
        data: updatedNomeGenerico[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar nome genérico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar o nome genérico'
      });
    }
  }

  // Excluir nome genérico
  async excluirNomeGenerico(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o nome genérico existe
      const nomeGenerico = await executeQuery(
        'SELECT * FROM nome_generico_produto WHERE id = ?',
        [id]
      );

      if (nomeGenerico.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Nome genérico não encontrado',
          message: 'O nome genérico especificado não foi encontrado'
        });
      }

      // Verificar se há produtos vinculados
      const produtosVinculados = await executeQuery(
        'SELECT COUNT(*) as total FROM produtos WHERE nome_generico_id = ?',
        [id]
      );

      if (produtosVinculados[0].total > 0) {
        return res.status(400).json({
          success: false,
          error: 'Nome genérico em uso',
          message: 'Não é possível excluir o nome genérico pois existem produtos vinculados a ele'
        });
      }

      // Excluir nome genérico
      await executeQuery('DELETE FROM nome_generico_produto WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Nome genérico excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir nome genérico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o nome genérico'
      });
    }
  }

  // Buscar nomes genéricos ativos
  async buscarNomesGenericosAtivos(req, res) {
    try {
      const query = `
        SELECT 
          ngp.id, ngp.nome, ngp.grupo_id, ngp.subgrupo_id, ngp.classe_id,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          (SELECT COUNT(*) FROM produtos p WHERE p.nome_generico_id = ngp.id AND p.status = 1) as total_produtos
        FROM nome_generico_produto ngp
        LEFT JOIN grupos g ON ngp.grupo_id = g.id
        LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
        LEFT JOIN classes c ON ngp.classe_id = c.id
        WHERE ngp.status = 1
        ORDER BY ngp.nome ASC
      `;

      const nomesGenericos = await executeQuery(query);

      res.json({
        success: true,
        data: nomesGenericos
      });

    } catch (error) {
      console.error('Erro ao buscar nomes genéricos ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os nomes genéricos ativos'
      });
    }
  }

  // Buscar nomes genéricos por grupo
  async buscarNomesGenericosPorGrupo(req, res) {
    try {
      const { grupoId } = req.params;

      const query = `
        SELECT 
          ngp.id, ngp.nome, ngp.grupo_id, ngp.subgrupo_id, ngp.classe_id,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          (SELECT COUNT(*) FROM produtos p WHERE p.nome_generico_id = ngp.id AND p.status = 1) as total_produtos
        FROM nome_generico_produto ngp
        LEFT JOIN grupos g ON ngp.grupo_id = g.id
        LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
        LEFT JOIN classes c ON ngp.classe_id = c.id
        WHERE ngp.grupo_id = ? AND ngp.status = 1
        ORDER BY ngp.nome ASC
      `;

      const nomesGenericos = await executeQuery(query, [grupoId]);

      res.json({
        success: true,
        data: nomesGenericos
      });

    } catch (error) {
      console.error('Erro ao buscar nomes genéricos por grupo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os nomes genéricos por grupo'
      });
    }
  }

  // Buscar nomes genéricos por subgrupo
  async buscarNomesGenericosPorSubgrupo(req, res) {
    try {
      const { subgrupoId } = req.params;

      const query = `
        SELECT 
          ngp.id, ngp.nome, ngp.grupo_id, ngp.subgrupo_id, ngp.classe_id,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          (SELECT COUNT(*) FROM produtos p WHERE p.nome_generico_id = ngp.id AND p.status = 1) as total_produtos
        FROM nome_generico_produto ngp
        LEFT JOIN grupos g ON ngp.grupo_id = g.id
        LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
        LEFT JOIN classes c ON ngp.classe_id = c.id
        WHERE ngp.subgrupo_id = ? AND ngp.status = 1
        ORDER BY ngp.nome ASC
      `;

      const nomesGenericos = await executeQuery(query, [subgrupoId]);

      res.json({
        success: true,
        data: nomesGenericos
      });

    } catch (error) {
      console.error('Erro ao buscar nomes genéricos por subgrupo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os nomes genéricos por subgrupo'
      });
    }
  }

  // Buscar nomes genéricos por classe
  async buscarNomesGenericosPorClasse(req, res) {
    try {
      const { classeId } = req.params;

      const query = `
        SELECT 
          ngp.id, ngp.nome, ngp.grupo_id, ngp.subgrupo_id, ngp.classe_id,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          (SELECT COUNT(*) FROM produtos p WHERE p.nome_generico_id = ngp.id AND p.status = 1) as total_produtos
        FROM nome_generico_produto ngp
        LEFT JOIN grupos g ON ngp.grupo_id = g.id
        LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
        LEFT JOIN classes c ON ngp.classe_id = c.id
        WHERE ngp.classe_id = ? AND ngp.status = 1
        ORDER BY ngp.nome ASC
      `;

      const nomesGenericos = await executeQuery(query, [classeId]);

      res.json({
        success: true,
        data: nomesGenericos
      });

    } catch (error) {
      console.error('Erro ao buscar nomes genéricos por classe:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os nomes genéricos por classe'
      });
    }
  }

  // Buscar produtos de um nome genérico
  async buscarProdutosNomeGenerico(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          p.id, p.nome, p.codigo, p.descricao, p.status,
          f.nome as fornecedor_nome,
          m.nome as marca_nome,
          u.sigla as unidade_sigla
        FROM produtos p
        LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
        LEFT JOIN marcas m ON p.marca_id = m.id
        LEFT JOIN unidades_medida u ON p.unidade_id = u.id
        WHERE p.nome_generico_id = ? AND p.status = 1
        ORDER BY p.nome ASC
      `;

      const produtos = await executeQuery(query, [id]);

      res.json({
        success: true,
        data: produtos
      });

    } catch (error) {
      console.error('Erro ao buscar produtos do nome genérico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os produtos do nome genérico'
      });
    }
  }

  // Buscar estatísticas dos nomes genéricos
  async buscarEstatisticasNomesGenericos(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_nomes_genericos,
          COUNT(CASE WHEN status = 1 THEN 1 END) as nomes_genericos_ativos,
          COUNT(CASE WHEN status = 0 THEN 1 END) as nomes_genericos_inativos,
          COUNT(CASE WHEN grupo_id IS NOT NULL THEN 1 END) as com_grupo,
          COUNT(CASE WHEN subgrupo_id IS NOT NULL THEN 1 END) as com_subgrupo,
          COUNT(CASE WHEN classe_id IS NOT NULL THEN 1 END) as com_classe,
          (SELECT COUNT(*) FROM produtos WHERE nome_generico_id IS NOT NULL AND status = 1) as total_produtos_vinculados
        FROM nome_generico_produto
      `;

      const estatisticas = await executeQuery(query);

      res.json({
        success: true,
        data: estatisticas[0]
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas dos nomes genéricos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as estatísticas dos nomes genéricos'
      });
    }
  }
}

module.exports = new NomeGenericoProdutoController(); 