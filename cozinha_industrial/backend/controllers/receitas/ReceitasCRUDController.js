const { executeQuery, executeTransaction } = require('../../config/database');
const { successResponse, errorResponse, notFoundResponse, STATUS_CODES } = require('../../middleware/responseHandler');

/**
 * Controller CRUD para Receitas
 * Segue padrão de excelência do sistema
 */
class ReceitasCRUDController {
  /**
   * Criar nova receita
   */
  static async criar(req, res) {
    try {
      const {
        nome,
        descricao = null,
        filiais = [],
        centros_custo = [],
        // Manter compatibilidade com dados antigos
        filial_id = null,
        filial_nome = null,
        centro_custo_id = null,
        centro_custo_nome = null,
        tipo_receita_id = null,
        tipo_receita_nome = null,
        status = 1,
        produtos = [],
        receita_original_id = null
      } = req.body;

      const userId = req.user.id;

      // Validar campos obrigatórios
      if (!nome || nome.trim() === '') {
        return errorResponse(res, 'Nome da receita é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      // Função auxiliar para normalizar valores
      const normalizarDescricao = (desc) => {
        if (!desc || desc.trim() === '') return null;
        return desc.trim();
      };

      const normalizarPercapta = (perc) => {
        if (perc === null || perc === undefined || perc === '') return null;
        const num = parseFloat(perc);
        return isNaN(num) ? null : Math.round(num * 1000) / 1000; // Arredondar para 3 casas decimais
      };

      // Função auxiliar para comparar duas receitas
      const receitasSaoIdenticas = (receita1, receita2) => {
        // Comparar campos principais
        const nomeIgual = receita1.nome.trim().toUpperCase() === receita2.nome.trim().toUpperCase();
        const descricaoIgual = normalizarDescricao(receita1.descricao) === normalizarDescricao(receita2.descricao);
        const tipoReceitaIgual = receita1.tipo_receita_id === (receita2.tipo_receita_id || null);
        const statusIgual = receita1.status === receita2.status;

        // Comparar filiais (arrays ou valores únicos para compatibilidade)
        const filiais1 = receita1.filiais || (receita1.filial_id ? [{ id: receita1.filial_id }] : []);
        const filiais2 = receita2.filiais || (receita2.filial_id ? [{ id: receita2.filial_id }] : []);
        const filiaisIds1 = new Set(filiais1.map(f => f.id).sort());
        const filiaisIds2 = new Set(filiais2.map(f => f.id).sort());
        const filiaisIguais = filiaisIds1.size === filiaisIds2.size && 
          Array.from(filiaisIds1).every(id => filiaisIds2.has(id));

        // Comparar centros de custo (arrays ou valores únicos para compatibilidade)
        const centrosCusto1 = receita1.centros_custo || (receita1.centro_custo_id ? [{ id: receita1.centro_custo_id }] : []);
        const centrosCusto2 = receita2.centros_custo || (receita2.centro_custo_id ? [{ id: receita2.centro_custo_id }] : []);
        const centrosCustoIds1 = new Set(centrosCusto1.map(cc => cc.id).sort());
        const centrosCustoIds2 = new Set(centrosCusto2.map(cc => cc.id).sort());
        const centrosCustoIguais = centrosCustoIds1.size === centrosCustoIds2.size && 
          Array.from(centrosCustoIds1).every(id => centrosCustoIds2.has(id));

        const camposIdenticos = nomeIgual && descricaoIgual && filiaisIguais && centrosCustoIguais && tipoReceitaIgual && statusIgual;

        // Comparar produtos (independente da ordem)
        let produtosIdenticos = false;
        const produtos1 = receita1.produtos || [];
        const produtos2 = receita2.produtos || [];

        if (produtos1.length === produtos2.length) {
          if (produtos1.length === 0) {
            produtosIdenticos = true;
          } else {
            // Criar mapas de produtos para comparação independente da ordem
            const produtosMap1 = new Map();
            produtos1.forEach(produto => {
              const percaptaNormalizado = normalizarPercapta(produto.percapta_sugerida);
              const key = `${produto.produto_origem_id}_${percaptaNormalizado}`;
              produtosMap1.set(key, (produtosMap1.get(key) || 0) + 1);
            });

            const produtosMap2 = new Map();
            produtos2.forEach(produto => {
              const percaptaNormalizado = normalizarPercapta(produto.percapta_sugerida);
              const key = `${produto.produto_origem_id}_${percaptaNormalizado}`;
              produtosMap2.set(key, (produtosMap2.get(key) || 0) + 1);
            });

            // Verificar se os mapas são idênticos
            if (produtosMap1.size === produtosMap2.size) {
              produtosIdenticos = Array.from(produtosMap1.entries()).every(([key, count]) => {
                return produtosMap2.get(key) === count;
              });
            }
          }
        }

        return camposIdenticos && produtosIdenticos;
      };

      // Validar se é uma receita duplicada idêntica à original
      if (receita_original_id && receita_original_id !== null && receita_original_id !== undefined) {
        const receitaOriginal = await ReceitasCRUDController.buscarReceitaCompleta(receita_original_id);
        
        if (receitaOriginal) {
          // Converter arrays para formato de comparação
          const filiaisArray = filiais && filiais.length > 0 ? filiais : (filial_id ? [{ id: filial_id }] : []);
          const centrosCustoArray = centros_custo && centros_custo.length > 0 ? centros_custo : (centro_custo_id ? [{ id: centro_custo_id }] : []);
          
          const receitaNova = {
            nome,
            descricao,
            filiais: filiaisArray,
            centros_custo: centrosCustoArray,
            tipo_receita_id,
            status,
            produtos
          };

          if (receitasSaoIdenticas(receitaOriginal, receitaNova)) {
            return errorResponse(
              res,
              'Não é permitido salvar uma receita duplicada totalmente igual à receita original. É necessário alterar pelo menos um campo.',
              STATUS_CODES.BAD_REQUEST
            );
          }
        }
      }

      // Validar se já existe uma receita idêntica no banco de dados
      const todasReceitas = await executeQuery(
        `SELECT id FROM receitas WHERE status = ?`,
        [status]
      );

      for (const receitaExistente of todasReceitas) {
        const receitaCompleta = await ReceitasCRUDController.buscarReceitaCompleta(receitaExistente.id);
        
        if (receitaCompleta) {
          // Converter arrays para formato de comparação
          const filiaisArray = filiais && filiais.length > 0 ? filiais : (filial_id ? [{ id: filial_id }] : []);
          const centrosCustoArray = centros_custo && centros_custo.length > 0 ? centros_custo : (centro_custo_id ? [{ id: centro_custo_id }] : []);
          
          const receitaNova = {
            nome,
            descricao,
            filiais: filiaisArray,
            centros_custo: centrosCustoArray,
            tipo_receita_id,
            status,
            produtos
          };

          if (receitasSaoIdenticas(receitaCompleta, receitaNova)) {
            return errorResponse(
              res,
              'Já existe uma receita idêntica cadastrada no sistema. É necessário alterar pelo menos um campo para criar uma nova receita.',
              STATUS_CODES.BAD_REQUEST
            );
          }
        }
      }

      // Gerar código da receita automaticamente
      const ultimaReceita = await executeQuery(
        'SELECT codigo FROM receitas ORDER BY id DESC LIMIT 1'
      );

      let proximoNumero = 1;
      if (ultimaReceita.length > 0) {
        const ultimoCodigo = ultimaReceita[0].codigo;
        if (ultimoCodigo && ultimoCodigo.startsWith('R')) {
          const numero = parseInt(ultimoCodigo.substring(1));
          if (!isNaN(numero)) {
            proximoNumero = numero + 1;
          }
        }
      }

      const codigo = `R${proximoNumero.toString().padStart(3, '0')}`;

      // Buscar nome do tipo de receita se apenas ID foi fornecido
      let tipoReceitaNome = tipo_receita_nome;
      if (tipo_receita_id && !tipoReceitaNome) {
        const tipoReceita = await executeQuery(
          'SELECT tipo_receita FROM tipos_receitas WHERE id = ?',
          [tipo_receita_id]
        );
        if (tipoReceita.length > 0) {
          tipoReceitaNome = tipoReceita[0].tipo_receita;
        }
      }

      // Converter dados antigos para arrays (compatibilidade)
      const filiaisArray = filiais && filiais.length > 0 ? filiais : (filial_id ? [{ id: filial_id, nome: filial_nome || '' }] : []);
      const centrosCustoArray = centros_custo && centros_custo.length > 0 ? centros_custo : (centro_custo_id ? [{ 
        id: centro_custo_id, 
        nome: centro_custo_nome || '',
        filial_id: filial_id || null,
        filial_nome: filial_nome || null
      }] : []);

      // Inserir receita (sem filial_id e centro_custo_id, serão nas tabelas relacionais)
      const result = await executeQuery(
        `INSERT INTO receitas (
          codigo, nome, descricao, tipo_receita_id, tipo_receita_nome, status
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [codigo, nome, descricao, tipo_receita_id, tipoReceitaNome, status]
      );

      const receitaId = result.insertId;

      // Inserir filiais relacionadas
      if (filiaisArray && filiaisArray.length > 0) {
        const filiaisQueries = filiaisArray.map(filial => ({
          sql: `INSERT INTO receitas_filiais (receita_id, filial_id, filial_nome) VALUES (?, ?, ?)`,
          params: [receitaId, filial.id, filial.nome || '']
        }));
        await executeTransaction(filiaisQueries);
      }

      // Inserir centros de custo relacionados
      if (centrosCustoArray && centrosCustoArray.length > 0) {
        const centrosCustoQueries = centrosCustoArray.map(centro => ({
          sql: `INSERT INTO receitas_centros_custo (receita_id, centro_custo_id, centro_custo_nome, filial_id, filial_nome) VALUES (?, ?, ?, ?, ?)`,
          params: [
            receitaId,
            centro.id,
            centro.nome || '',
            centro.filial_id || null,
            centro.filial_nome || null
          ]
        }));
        await executeTransaction(centrosCustoQueries);
      }

      // Inserir produtos da receita
      if (produtos && produtos.length > 0) {
        const produtosQueries = produtos.map(produto => ({
          sql: `INSERT INTO receitas_produtos (
            receita_id, 
            produto_origem, 
            produto_origem_id,
            grupo_id,
            grupo_nome,
            subgrupo_id,
            subgrupo_nome,
            classe_id,
            classe_nome,
            unidade_medida_id,
            unidade_medida_sigla,
            percapta_sugerida
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [
            receitaId,
            produto.produto_origem || null, // Manter para compatibilidade
            produto.produto_origem_id || null,
            produto.grupo_id || null,
            produto.grupo_nome || null,
            produto.subgrupo_id || null,
            produto.subgrupo_nome || null,
            produto.classe_id || null,
            produto.classe_nome || null,
            produto.unidade_medida_id || null,
            produto.unidade_medida_sigla || null,
            produto.percapta_sugerida || null
          ]
        }));

        await executeTransaction(produtosQueries);
      }

      // Buscar receita completa criada
      const receitaCompleta = await ReceitasCRUDController.buscarReceitaCompleta(receitaId);

      return successResponse(
        res,
        receitaCompleta,
        'Receita criada com sucesso',
        STATUS_CODES.CREATED
      );

    } catch (error) {
      console.error('Erro ao criar receita:', error);
      return errorResponse(res, 'Erro ao criar receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar receita por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const receita = await ReceitasCRUDController.buscarReceitaCompleta(id);

      if (!receita) {
        return notFoundResponse(res, 'Receita não encontrada');
      }

      return successResponse(res, receita, 'Receita encontrada com sucesso', STATUS_CODES.OK);

    } catch (error) {
      console.error('Erro ao buscar receita:', error);
      return errorResponse(res, 'Erro ao buscar receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Atualizar receita
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        descricao,
        filiais = [],
        centros_custo = [],
        // Manter compatibilidade com dados antigos
        filial_id = null,
        filial_nome = null,
        centro_custo_id = null,
        centro_custo_nome = null,
        tipo_receita_id,
        tipo_receita_nome,
        status,
        produtos
      } = req.body;

      // Verificar se a receita existe
      const receitaExiste = await executeQuery(
        'SELECT id, codigo FROM receitas WHERE id = ?',
        [id]
      );

      if (receitaExiste.length === 0) {
        return notFoundResponse(res, 'Receita não encontrada');
      }

      // Atualizar receita
      const updateFields = [];
      const updateValues = [];

      if (nome !== undefined) {
        updateFields.push('nome = ?');
        updateValues.push(nome);
      }
      if (descricao !== undefined) {
        updateFields.push('descricao = ?');
        updateValues.push(descricao);
      }
      // Buscar nome do tipo de receita se apenas ID foi fornecido
      if (tipo_receita_id !== undefined) {
        let tipoReceitaNome = tipo_receita_nome;
        if (tipo_receita_id && !tipoReceitaNome) {
          const tipoReceita = await executeQuery(
            'SELECT tipo_receita FROM tipos_receitas WHERE id = ?',
            [tipo_receita_id]
          );
          if (tipoReceita.length > 0) {
            tipoReceitaNome = tipoReceita[0].tipo_receita;
          }
        }
        updateFields.push('tipo_receita_id = ?');
        updateValues.push(tipo_receita_id);
        updateFields.push('tipo_receita_nome = ?');
        updateValues.push(tipoReceitaNome);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (updateFields.length > 0) {
        updateFields.push('data_atualizacao = NOW()');
        updateValues.push(id);

        await executeQuery(
          `UPDATE receitas SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // Atualizar relacionamentos se fornecidos
      if (filiais !== undefined) {
        // Converter dados antigos para arrays (compatibilidade)
        const filiaisArray = filiais && filiais.length > 0 ? filiais : (filial_id ? [{ id: filial_id, nome: filial_nome || '' }] : []);
        
        // Remover filiais existentes
        await executeQuery('DELETE FROM receitas_filiais WHERE receita_id = ?', [id]);
        
        // Inserir novas filiais
        if (filiaisArray && filiaisArray.length > 0) {
          const filiaisQueries = filiaisArray.map(filial => ({
            sql: `INSERT INTO receitas_filiais (receita_id, filial_id, filial_nome) VALUES (?, ?, ?)`,
            params: [id, filial.id, filial.nome || '']
          }));
          await executeTransaction(filiaisQueries);
        }
      }

      if (centros_custo !== undefined) {
        // Converter dados antigos para arrays (compatibilidade)
        const centrosCustoArray = centros_custo && centros_custo.length > 0 ? centros_custo : (centro_custo_id ? [{ 
          id: centro_custo_id, 
          nome: centro_custo_nome || '',
          filial_id: filial_id || null,
          filial_nome: filial_nome || null
        }] : []);
        
        // Remover centros de custo existentes
        await executeQuery('DELETE FROM receitas_centros_custo WHERE receita_id = ?', [id]);
        
        // Inserir novos centros de custo
        if (centrosCustoArray && centrosCustoArray.length > 0) {
          const centrosCustoQueries = centrosCustoArray.map(centro => ({
            sql: `INSERT INTO receitas_centros_custo (receita_id, centro_custo_id, centro_custo_nome, filial_id, filial_nome) VALUES (?, ?, ?, ?, ?)`,
            params: [
              id,
              centro.id,
              centro.nome || '',
              centro.filial_id || null,
              centro.filial_nome || null
            ]
          }));
          await executeTransaction(centrosCustoQueries);
        }
      }

      // Atualizar produtos da receita
      if (produtos !== undefined) {
        // Remover produtos existentes
        await executeQuery(
          'DELETE FROM receitas_produtos WHERE receita_id = ?',
          [id]
        );

        // Inserir novos produtos
        if (produtos && produtos.length > 0) {
          const produtosQueries = produtos.map(produto => ({
            sql: `INSERT INTO receitas_produtos (
              receita_id, 
              produto_origem, 
              produto_origem_id,
              grupo_id,
              grupo_nome,
              subgrupo_id,
              subgrupo_nome,
              classe_id,
              classe_nome,
              unidade_medida_id,
              unidade_medida_sigla,
              percapta_sugerida
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
              id,
              produto.produto_origem || null, // Manter para compatibilidade
              produto.produto_origem_id || null,
              produto.grupo_id || null,
              produto.grupo_nome || null,
              produto.subgrupo_id || null,
              produto.subgrupo_nome || null,
              produto.classe_id || null,
              produto.classe_nome || null,
              produto.unidade_medida_id || null,
              produto.unidade_medida_sigla || null,
              produto.percapta_sugerida || null
            ]
          }));

          await executeTransaction(produtosQueries);
        }
      }

      // Buscar receita atualizada
      const receitaAtualizada = await ReceitasCRUDController.buscarReceitaCompleta(id);

      return successResponse(
        res,
        receitaAtualizada,
        'Receita atualizada com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      return errorResponse(res, 'Erro ao atualizar receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Excluir receita
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a receita existe
      const receitaExiste = await executeQuery(
        'SELECT id FROM receitas WHERE id = ?',
        [id]
      );

      if (receitaExiste.length === 0) {
        return notFoundResponse(res, 'Receita não encontrada');
      }

      // Excluir produtos da receita primeiro
      await executeQuery(
        'DELETE FROM receitas_produtos WHERE receita_id = ?',
        [id]
      );

      // Excluir receita
      await executeQuery('DELETE FROM receitas WHERE id = ?', [id]);

      return successResponse(
        res,
        null,
        'Receita excluída com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      return errorResponse(res, 'Erro ao excluir receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Verificar se existe receita com produtos específicos para um centro de custo
   * Retorna a receita de referência se encontrada, null caso contrário
   */
  static async verificarReceitaPorCentroCustoEProdutos(req, res) {
    try {
      const { centro_custo_id, produtos } = req.body;

      if (!centro_custo_id) {
        return errorResponse(res, 'Centro de custo é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return errorResponse(res, 'Lista de produtos é obrigatória', STATUS_CODES.BAD_REQUEST);
      }

      // Extrair IDs únicos dos produtos
      const produtoIds = [...new Set(produtos.map(p => p.produto_origem_id).filter(id => id))];
      
      if (produtoIds.length === 0) {
        return errorResponse(res, 'Nenhum produto válido fornecido', STATUS_CODES.BAD_REQUEST);
      }

      // Buscar todas as receitas ativas para o centro de custo (usando tabela relacional)
      const receitasDoCentroCusto = await executeQuery(
        `SELECT r.id, r.codigo, r.nome, rcc.centro_custo_id 
         FROM receitas r
         INNER JOIN receitas_centros_custo rcc ON r.id = rcc.receita_id
         WHERE rcc.centro_custo_id = ? AND r.status = 1`,
        [centro_custo_id]
      );

      if (receitasDoCentroCusto.length === 0) {
        return successResponse(
          res,
          { existe: false, receita_referencia: null },
          'Nenhuma receita encontrada para este centro de custo',
          STATUS_CODES.OK
        );
      }

      // Para cada receita, verificar se contém os mesmos produtos
      for (const receita of receitasDoCentroCusto) {
        const produtosReceita = await executeQuery(
          `SELECT produto_origem_id 
           FROM receitas_produtos 
           WHERE receita_id = ?`,
          [receita.id]
        );

        const produtosIdsReceita = produtosReceita.map(p => p.produto_origem_id);
        
        // Verificar se os produtos são os mesmos (mesma quantidade e mesmos IDs)
        if (produtosIdsReceita.length === produtoIds.length) {
          const produtosReceitaSet = new Set(produtosIdsReceita);
          const produtosSet = new Set(produtoIds);
          
          // Verificar se todos os produtos estão presentes
          const todosProdutosPresentes = produtoIds.every(id => produtosReceitaSet.has(id));
          const mesmaQuantidade = produtosReceitaSet.size === produtosSet.size;
          
          if (todosProdutosPresentes && mesmaQuantidade) {
            // Encontrou uma receita com os mesmos produtos
            const receitaCompleta = await ReceitasCRUDController.buscarReceitaCompleta(receita.id);
            return successResponse(
              res,
              { existe: true, receita_referencia: receitaCompleta },
              'Receita encontrada para este centro de custo com os mesmos produtos',
              STATUS_CODES.OK
            );
          }
        }
      }

      // Se chegou aqui, não encontrou receita com os mesmos produtos
      // Buscar uma receita de referência (primeira receita que contém pelo menos um dos produtos)
      for (const receita of receitasDoCentroCusto) {
        const produtosReceita = await executeQuery(
          `SELECT produto_origem_id 
           FROM receitas_produtos 
           WHERE receita_id = ?`,
          [receita.id]
        );

        const produtosIdsReceita = produtosReceita.map(p => p.produto_origem_id);
        const temProdutosComuns = produtoIds.some(id => produtosIdsReceita.includes(id));
        
        if (temProdutosComuns) {
          const receitaCompleta = await ReceitasCRUDController.buscarReceitaCompleta(receita.id);
          return successResponse(
            res,
            { existe: false, receita_referencia: receitaCompleta },
            'Nenhuma receita encontrada com os mesmos produtos, mas encontrada receita de referência',
            STATUS_CODES.OK
          );
        }
      }

      // Não encontrou nenhuma receita de referência
      return successResponse(
        res,
        { existe: false, receita_referencia: null },
        'Nenhuma receita encontrada com produtos relacionados para este centro de custo',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao verificar receita por centro de custo e produtos:', error);
      return errorResponse(res, 'Erro ao verificar receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Método auxiliar para buscar receita completa com produtos
   */
  static async buscarReceitaCompleta(id) {
    // Buscar receita
    const receitas = await executeQuery(
      `SELECT 
        id,
        codigo,
        nome,
        descricao,
        tipo_receita_id,
        tipo_receita_nome,
        status,
        data_cadastro,
        data_atualizacao
      FROM receitas
      WHERE id = ?`,
      [id]
    );

    if (receitas.length === 0) {
      return null;
    }

    const receita = receitas[0];

    // Buscar filiais relacionadas
    const filiais = await executeQuery(
      'SELECT filial_id as id, filial_nome as nome FROM receitas_filiais WHERE receita_id = ?',
      [id]
    );
    receita.filiais = filiais;

    // Buscar centros de custo relacionados
    const centrosCusto = await executeQuery(
      'SELECT centro_custo_id as id, centro_custo_nome as nome, filial_id, filial_nome FROM receitas_centros_custo WHERE receita_id = ?',
      [id]
    );
    receita.centros_custo = centrosCusto;

    // Manter compatibilidade com código antigo (usar primeira filial e centro de custo)
    if (filiais.length > 0) {
      receita.filial_id = filiais[0].id;
      receita.filial_nome = filiais[0].nome;
    }
    if (centrosCusto.length > 0) {
      receita.centro_custo_id = centrosCusto[0].id;
      receita.centro_custo_nome = centrosCusto[0].nome;
    }

    // Buscar produtos da receita
    const produtos = await executeQuery(
      `SELECT 
        id,
        produto_origem,
        produto_origem_id,
        grupo_id,
        grupo_nome,
        subgrupo_id,
        subgrupo_nome,
        classe_id,
        classe_nome,
        unidade_medida_id,
        unidade_medida_sigla,
        percapta_sugerida
      FROM receitas_produtos
      WHERE receita_id = ?
      ORDER BY id`,
      [id]
    );

    receita.produtos = produtos;

    return receita;
  }
}

module.exports = ReceitasCRUDController;

