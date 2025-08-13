/**
 * Controller CRUD de Marcas
 * Responsável por operações de Create, Update e Delete
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class MarcasCRUDController {
  
  /**
   * Criar nova marca
   */
  static criarMarca = asyncHandler(async (req, res) => {
    const { marca, fabricante, status = 1 } = req.body;

    // Verificar se marca já existe
    const existingMarca = await executeQuery(
      'SELECT id FROM marcas WHERE marca = ?',
      [marca]
    );

    if (existingMarca.length > 0) {
      return conflictResponse(res, 'Marca já cadastrada');
    }

    // Inserir marca
    const result = await executeQuery(
      'INSERT INTO marcas (marca, fabricante, status, criado_em) VALUES (?, ?, ?, NOW())',
      [marca, fabricante, status || 1]
    );

    const novaMarcaId = result.insertId;

    // Buscar marca criada
    const marcas = await executeQuery(
      `SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
       FROM marcas m
       LEFT JOIN produtos p ON m.marca = p.marca
       WHERE m.id = ?
       GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em`,
      [novaMarcaId]
    );

    const marcaCriada = marcas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(marcaCriada);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, marcaCriada.id);

    return successResponse(res, data, 'Marca criada com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar marca
   */
  static atualizarMarca = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { marca, fabricante, status } = req.body;
    const updateData = { marca, fabricante, status };

    // Verificar se marca existe
    const existingMarca = await executeQuery(
      'SELECT id, marca FROM marcas WHERE id = ?',
      [id]
    );

    if (existingMarca.length === 0) {
      return notFoundResponse(res, 'Marca não encontrada');
    }

    // Verificar se marca já existe (se estiver sendo alterada)
    if (updateData.marca) {
      const marcaCheck = await executeQuery(
        'SELECT id FROM marcas WHERE marca = ? AND id != ?',
        [updateData.marca, id]
      );

      if (marcaCheck.length > 0) {
        return conflictResponse(res, 'Marca já cadastrada');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = ['marca', 'fabricante', 'status'];

    Object.keys(updateData).forEach(key => {
      if (camposValidos.includes(key) && updateData[key] !== undefined) {
        let value = updateData[key];
        
        // Tratar valores vazios ou undefined
        if (value === '' || value === null || value === undefined) {
          value = null;
        } else if (typeof value === 'string') {
          value = value.trim();
          if (value === '') {
            value = null;
          }
        }
        
        updateFields.push(`${key} = ?`);
        updateParams.push(value);
      }
    });

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('atualizado_em = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE marcas SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar marca atualizada
    const marcas = await executeQuery(
      `SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
       FROM marcas m
       LEFT JOIN produtos p ON m.marca = p.marca
       WHERE m.id = ?
       GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em`,
      [id]
    );

    const marcaAtualizada = marcas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(marcaAtualizada);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, marcaAtualizada.id);

    return successResponse(res, data, 'Marca atualizada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Desativar marca (soft delete)
   */
  static excluirMarca = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se marca existe
    const existingMarca = await executeQuery(
      'SELECT id, marca FROM marcas WHERE id = ?',
      [id]
    );

    if (existingMarca.length === 0) {
      return notFoundResponse(res, 'Marca não encontrada');
    }

    // Verificar se marca está sendo usada em produtos ATIVOS
    const produtos = await executeQuery(
      'SELECT id, nome, status FROM produtos WHERE marca = ? AND status = 1',
      [existingMarca[0].marca]
    );

    if (produtos.length > 0) {
      let mensagem = `Marca não pode ser desativada pois possui ${produtos.length} produto(s) ativo(s) vinculado(s):`;
      mensagem += `\n- ${produtos.map(p => p.nome).join(', ')}`;
      mensagem += '\n\nPara desativar a marca, primeiro desative todos os produtos vinculados.';
      
      return errorResponse(res, mensagem, STATUS_CODES.BAD_REQUEST);
    }

    // Excluir marca (soft delete - alterar status para 0)
    await executeQuery(
      'UPDATE marcas SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Marca desativada com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    if (user.tipo_de_acesso === 'administrador') {
      return ['visualizar', 'criar', 'editar', 'excluir'];
    }

    return accessLevels[user.nivel_de_acesso] || [];
  }
}

module.exports = MarcasCRUDController;
