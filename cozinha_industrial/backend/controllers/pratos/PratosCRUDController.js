const { executeQuery, executeTransaction } = require('../../config/database');
const { successResponse, errorResponse, notFoundResponse, STATUS_CODES } = require('../../middleware/responseHandler');

/**
 * Controller CRUD para Pratos
 * Segue padrão de excelência do sistema
 */
class PratosCRUDController {
  /**
   * Criar novo prato
   */
  static async criar(req, res) {
    try {
      const {
        nome,
        descricao = null,
        tipo_prato_id = null,
        tipo_prato_nome = null,
        filiais = [],
        centros_custo = [],
        receitas = [],
        produtos = [],
        status = 1
      } = req.body;

      // Validar campos obrigatórios
      if (!nome || nome.trim() === '') {
        return errorResponse(res, 'Nome do prato é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      // Gerar código do prato automaticamente
      const ultimoPrato = await executeQuery(
        'SELECT codigo FROM pratos ORDER BY id DESC LIMIT 1'
      );

      let proximoNumero = 1;
      if (ultimoPrato.length > 0) {
        const ultimoCodigo = ultimoPrato[0].codigo;
        if (ultimoCodigo && ultimoCodigo.startsWith('P')) {
          const numero = parseInt(ultimoCodigo.substring(1));
          if (!isNaN(numero)) {
            proximoNumero = numero + 1;
          }
        }
      }

      const codigo = `P${proximoNumero.toString().padStart(3, '0')}`;

      // Buscar nome do tipo de prato se apenas ID foi fornecido
      let tipoPratoNome = tipo_prato_nome;
      if (tipo_prato_id && !tipoPratoNome) {
        const tipoPrato = await executeQuery(
          'SELECT tipo_prato FROM tipos_pratos WHERE id = ?',
          [tipo_prato_id]
        );
        if (tipoPrato.length > 0) {
          tipoPratoNome = tipoPrato[0].tipo_prato;
        }
      }

      // Inserir prato
      const result = await executeQuery(
        `INSERT INTO pratos (
          codigo, nome, descricao, tipo_prato_id, tipo_prato_nome, status
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [codigo, nome, descricao, tipo_prato_id, tipoPratoNome, status]
      );

      const pratoId = result.insertId;

      // Inserir filiais
      if (filiais && filiais.length > 0) {
        const filiaisQueries = filiais.map(filial => ({
          sql: `INSERT INTO pratos_filiais (prato_id, filial_id, filial_nome) VALUES (?, ?, ?)`,
          params: [pratoId, filial.id, filial.nome || '']
        }));
        await executeTransaction(filiaisQueries);
      }

      // Inserir centros de custo
      if (centros_custo && centros_custo.length > 0) {
        const centrosCustoQueries = centros_custo.map(centro => ({
          sql: `INSERT INTO pratos_centros_custo (prato_id, centro_custo_id, centro_custo_nome, filial_id, filial_nome) VALUES (?, ?, ?, ?, ?)`,
          params: [
            pratoId,
            centro.id,
            centro.nome || '',
            centro.filial_id || null,
            centro.filial_nome || null
          ]
        }));
        await executeTransaction(centrosCustoQueries);
      }

      // Inserir receitas
      if (receitas && receitas.length > 0) {
        const receitasQueries = receitas.map(receita => ({
          sql: `INSERT INTO pratos_receitas (prato_id, receita_id, receita_codigo, receita_nome) VALUES (?, ?, ?, ?)`,
          params: [
            pratoId,
            receita.id,
            receita.codigo || null,
            receita.nome || null
          ]
        }));
        await executeTransaction(receitasQueries);
      }

      // Inserir produtos
      if (produtos && produtos.length > 0) {
        const produtosQueries = produtos.map(produto => ({
          sql: `INSERT INTO produtos_pratos (
            prato_id,
            receita_id,
            produto_origem_id,
            produto_origem_nome,
            grupo_id,
            grupo_nome,
            subgrupo_id,
            subgrupo_nome,
            classe_id,
            classe_nome,
            unidade_medida_id,
            unidade_medida_sigla,
            centro_custo_id,
            centro_custo_nome,
            percapta
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [
            pratoId,
            produto.receita_id || null,
            produto.produto_origem_id,
            produto.produto_origem_nome || null,
            produto.grupo_id || null,
            produto.grupo_nome || null,
            produto.subgrupo_id || null,
            produto.subgrupo_nome || null,
            produto.classe_id || null,
            produto.classe_nome || null,
            produto.unidade_medida_id || null,
            produto.unidade_medida_sigla || null,
            produto.centro_custo_id,
            produto.centro_custo_nome || null,
            produto.percapta || null
          ]
        }));
        await executeTransaction(produtosQueries);
      }

      // Buscar prato completo criado
      const pratoCompleto = await PratosCRUDController.buscarPratoCompleto(pratoId);

      return successResponse(
        res,
        pratoCompleto,
        'Prato criado com sucesso',
        STATUS_CODES.CREATED
      );

    } catch (error) {
      console.error('Erro ao criar prato:', error);
      return errorResponse(res, 'Erro ao criar prato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar prato por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const prato = await PratosCRUDController.buscarPratoCompleto(id);

      if (!prato) {
        return notFoundResponse(res, 'Prato não encontrado');
      }

      return successResponse(res, prato, 'Prato encontrado com sucesso', STATUS_CODES.OK);

    } catch (error) {
      console.error('Erro ao buscar prato:', error);
      return errorResponse(res, 'Erro ao buscar prato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Atualizar prato
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        descricao,
        tipo_prato_id,
        tipo_prato_nome,
        filiais,
        centros_custo,
        receitas,
        produtos,
        status
      } = req.body;

      // Verificar se o prato existe
      const pratoExiste = await executeQuery(
        'SELECT id, codigo FROM pratos WHERE id = ?',
        [id]
      );

      if (pratoExiste.length === 0) {
        return notFoundResponse(res, 'Prato não encontrado');
      }

      // Atualizar prato
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
      if (tipo_prato_id !== undefined) {
        // Buscar nome do tipo de prato se apenas ID foi fornecido
        let tipoPratoNome = tipo_prato_nome;
        if (tipo_prato_id && !tipoPratoNome) {
          const tipoPrato = await executeQuery(
            'SELECT tipo_prato FROM tipos_pratos WHERE id = ?',
            [tipo_prato_id]
          );
          if (tipoPrato.length > 0) {
            tipoPratoNome = tipoPrato[0].tipo_prato;
          }
        }
        updateFields.push('tipo_prato_id = ?');
        updateValues.push(tipo_prato_id);
        updateFields.push('tipo_prato_nome = ?');
        updateValues.push(tipoPratoNome);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (updateFields.length > 0) {
        updateFields.push('data_atualizacao = NOW()');
        updateValues.push(id);

        await executeQuery(
          `UPDATE pratos SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // Atualizar relacionamentos se fornecidos
      if (filiais !== undefined) {
        // Remover filiais existentes
        await executeQuery('DELETE FROM pratos_filiais WHERE prato_id = ?', [id]);
        
        // Inserir novas filiais
        if (filiais && filiais.length > 0) {
          const filiaisQueries = filiais.map(filial => ({
            sql: `INSERT INTO pratos_filiais (prato_id, filial_id, filial_nome) VALUES (?, ?, ?)`,
            params: [id, filial.id, filial.nome || '']
          }));
          await executeTransaction(filiaisQueries);
        }
      }

      if (centros_custo !== undefined) {
        // Remover centros de custo existentes
        await executeQuery('DELETE FROM pratos_centros_custo WHERE prato_id = ?', [id]);
        
        // Inserir novos centros de custo
        if (centros_custo && centros_custo.length > 0) {
          const centrosCustoQueries = centros_custo.map(centro => ({
            sql: `INSERT INTO pratos_centros_custo (prato_id, centro_custo_id, centro_custo_nome, filial_id, filial_nome) VALUES (?, ?, ?, ?, ?)`,
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

      if (receitas !== undefined) {
        // Remover receitas existentes
        await executeQuery('DELETE FROM pratos_receitas WHERE prato_id = ?', [id]);
        
        // Inserir novas receitas
        if (receitas && receitas.length > 0) {
          const receitasQueries = receitas.map(receita => ({
            sql: `INSERT INTO pratos_receitas (prato_id, receita_id, receita_codigo, receita_nome) VALUES (?, ?, ?, ?)`,
            params: [
              id,
              receita.id,
              receita.codigo || null,
              receita.nome || null
            ]
          }));
          await executeTransaction(receitasQueries);
        }
      }

      if (produtos !== undefined) {
        // Remover produtos existentes
        await executeQuery('DELETE FROM produtos_pratos WHERE prato_id = ?', [id]);
        
        // Inserir novos produtos
        if (produtos && produtos.length > 0) {
          const produtosQueries = produtos.map(produto => ({
            sql: `INSERT INTO produtos_pratos (
              prato_id,
              receita_id,
              produto_origem_id,
              produto_origem_nome,
              grupo_id,
              grupo_nome,
              subgrupo_id,
              subgrupo_nome,
              classe_id,
              classe_nome,
              unidade_medida_id,
              unidade_medida_sigla,
              centro_custo_id,
              centro_custo_nome,
              percapta
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
              id,
              produto.receita_id || null,
              produto.produto_origem_id,
              produto.produto_origem_nome || null,
              produto.grupo_id || null,
              produto.grupo_nome || null,
              produto.subgrupo_id || null,
              produto.subgrupo_nome || null,
              produto.classe_id || null,
              produto.classe_nome || null,
              produto.unidade_medida_id || null,
              produto.unidade_medida_sigla || null,
              produto.centro_custo_id,
              produto.centro_custo_nome || null,
              produto.percapta || null
            ]
          }));
          await executeTransaction(produtosQueries);
        }
      }

      // Buscar prato atualizado
      const pratoAtualizado = await PratosCRUDController.buscarPratoCompleto(id);

      return successResponse(
        res,
        pratoAtualizado,
        'Prato atualizado com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao atualizar prato:', error);
      return errorResponse(res, 'Erro ao atualizar prato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Excluir prato
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o prato existe
      const pratoExiste = await executeQuery(
        'SELECT id FROM pratos WHERE id = ?',
        [id]
      );

      if (pratoExiste.length === 0) {
        return notFoundResponse(res, 'Prato não encontrado');
      }

      // As foreign keys com CASCADE vão deletar automaticamente os relacionamentos
      await executeQuery('DELETE FROM pratos WHERE id = ?', [id]);

      return successResponse(
        res,
        { id: parseInt(id) },
        'Prato excluído com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao excluir prato:', error);
      return errorResponse(res, 'Erro ao excluir prato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Método auxiliar para buscar prato completo com relacionamentos
   */
  static async buscarPratoCompleto(id) {
    // Buscar prato
    const pratos = await executeQuery(
      `SELECT 
        id,
        codigo,
        nome,
        descricao,
        tipo_prato_id,
        tipo_prato_nome,
        status,
        data_cadastro,
        data_atualizacao
      FROM pratos
      WHERE id = ?`,
      [id]
    );

    if (pratos.length === 0) {
      return null;
    }

    const prato = pratos[0];

    // Buscar filiais
    const filiais = await executeQuery(
      'SELECT filial_id as id, filial_nome as nome FROM pratos_filiais WHERE prato_id = ?',
      [id]
    );
    prato.filiais = filiais;

    // Buscar centros de custo
    const centrosCusto = await executeQuery(
      'SELECT centro_custo_id as id, centro_custo_nome as nome, filial_id, filial_nome FROM pratos_centros_custo WHERE prato_id = ?',
      [id]
    );
    prato.centros_custo = centrosCusto;

    // Buscar receitas
    const receitas = await executeQuery(
      'SELECT receita_id as id, receita_codigo as codigo, receita_nome as nome FROM pratos_receitas WHERE prato_id = ?',
      [id]
    );
    prato.receitas = receitas;

    // Buscar produtos
    const produtos = await executeQuery(
      `SELECT 
        id,
        receita_id,
        produto_origem_id,
        produto_origem_nome,
        grupo_id,
        grupo_nome,
        subgrupo_id,
        subgrupo_nome,
        classe_id,
        classe_nome,
        unidade_medida_id,
        unidade_medida_sigla,
        centro_custo_id,
        centro_custo_nome,
        percapta
      FROM produtos_pratos
      WHERE prato_id = ?`,
      [id]
    );
    prato.produtos = produtos;

    return prato;
  }
}

module.exports = PratosCRUDController;

