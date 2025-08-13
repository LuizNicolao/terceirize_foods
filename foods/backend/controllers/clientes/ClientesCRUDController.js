/**
 * Controller CRUD de Clientes
 * Responsável por criar, atualizar e excluir clientes
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  conflictResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ClientesCRUDController {
  
  /**
   * Criar novo cliente
   */
  static criarCliente = asyncHandler(async (req, res) => {
    const {
      cnpj, razao_social, nome_fantasia, logradouro, numero, bairro, 
      municipio, uf, cep, email, telefone, status
    } = req.body;

    // Limpar CNPJ
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    // Verificar se CNPJ já existe
    const existingCliente = await executeQuery(
      'SELECT id FROM clientes WHERE cnpj = ?',
      [cnpjLimpo]
    );

    if (existingCliente.length > 0) {
      return conflictResponse(res, 'CNPJ já cadastrado');
    }

    // Verificar se razão social já existe
    const existingRazaoSocial = await executeQuery(
      'SELECT id FROM clientes WHERE razao_social = ?',
      [razao_social]
    );

    if (existingRazaoSocial.length > 0) {
      return conflictResponse(res, 'Razão social já cadastrada');
    }

    // Inserir cliente
    const result = await executeQuery(
      `INSERT INTO clientes (cnpj, razao_social, nome_fantasia, logradouro, numero, bairro, 
                             municipio, uf, cep, email, telefone, status, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        cnpjLimpo, 
        razao_social, 
        nome_fantasia && nome_fantasia.trim() ? nome_fantasia.trim() : null,
        logradouro && logradouro.trim() ? logradouro.trim() : null,
        numero && numero.trim() ? numero.trim() : null,
        bairro && bairro.trim() ? bairro.trim() : null,
        municipio && municipio.trim() ? municipio.trim() : null,
        uf && uf.trim() ? uf.trim().toUpperCase() : null,
        cep && cep.trim() ? cep.trim() : null,
        email && email.trim() ? email.trim() : null,
        telefone && telefone.trim() ? telefone.trim() : null,
        status || 1
      ]
    );

    const novoClienteId = result.insertId;

    // Buscar cliente criado
    const clientes = await executeQuery(
      'SELECT * FROM clientes WHERE id = ?',
      [novoClienteId]
    );

    const cliente = clientes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(cliente);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, cliente.id);

    return successResponse(res, data, 'Cliente criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar cliente
   */
  static atualizarCliente = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se cliente existe
    const existingCliente = await executeQuery(
      'SELECT id, cnpj, razao_social FROM clientes WHERE id = ?',
      [id]
    );

    if (existingCliente.length === 0) {
      return notFoundResponse(res, 'Cliente não encontrado');
    }

    // Verificar se CNPJ já existe (se estiver sendo alterado)
    if (updateData.cnpj) {
      const cnpjLimpo = updateData.cnpj.replace(/\D/g, '');
      const cnpjCheck = await executeQuery(
        'SELECT id FROM clientes WHERE cnpj = ? AND id != ?',
        [cnpjLimpo, id]
      );

      if (cnpjCheck.length > 0) {
        return conflictResponse(res, 'CNPJ já cadastrado');
      }
      updateData.cnpj = cnpjLimpo; // Atualizar com CNPJ limpo
    }

    // Verificar se razão social já existe (se estiver sendo alterada)
    if (updateData.razao_social) {
      const razaoSocialCheck = await executeQuery(
        'SELECT id FROM clientes WHERE razao_social = ? AND id != ?',
        [updateData.razao_social, id]
      );

      if (razaoSocialCheck.length > 0) {
        return conflictResponse(res, 'Razão social já cadastrada');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];

    // Lista de campos válidos da tabela clientes
    const camposValidos = [
      'cnpj', 'razao_social', 'nome_fantasia', 'logradouro', 'numero', 
      'bairro', 'municipio', 'uf', 'cep', 'email', 'telefone', 'status'
    ];

    Object.keys(updateData).forEach(key => {
      // Verificar se o campo é válido para a tabela
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
        
        if (key === 'uf' && value) {
          updateFields.push(`${key} = ?`);
          updateParams.push(value.toUpperCase());
        } else {
          updateFields.push(`${key} = ?`);
          updateParams.push(value);
        }
      }
    });

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('atualizado_em = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE clientes SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar cliente atualizado
    const clientes = await executeQuery(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    const cliente = clientes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(cliente);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, cliente.id);

    return successResponse(res, data, 'Cliente atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir cliente
   */
  static excluirCliente = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se cliente existe
    const existingCliente = await executeQuery(
      'SELECT id FROM clientes WHERE id = ?',
      [id]
    );

    if (existingCliente.length === 0) {
      return notFoundResponse(res, 'Cliente não encontrado');
    }

    // Verificar se cliente está sendo usado em outras tabelas
    // Aqui você pode adicionar verificações específicas se necessário

    // Excluir cliente (soft delete - alterar status para 0)
    await executeQuery(
      'UPDATE clientes SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Cliente excluído com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões baseada no usuário
    // Por enquanto, retorna permissões básicas
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = ClientesCRUDController;
