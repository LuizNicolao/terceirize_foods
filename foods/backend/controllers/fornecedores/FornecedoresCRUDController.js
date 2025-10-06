/**
 * Controller CRUD de Fornecedores
 * Responsável por criar, atualizar e excluir fornecedores
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

class FornecedoresCRUDController {
  
  /**
   * Criar novo fornecedor
   */
  static criarFornecedor = asyncHandler(async (req, res) => {
    const {
      cnpj, razao_social, nome_fantasia, logradouro, numero, bairro, 
      municipio, uf, cep, email, telefone, status
    } = req.body;

    // Verificar se CNPJ já existe (apenas se fornecido)
    if (cnpj) {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      
      const existingFornecedor = await executeQuery(
        'SELECT id FROM fornecedores WHERE cnpj = ?',
        [cnpjLimpo]
      );

      if (existingFornecedor.length > 0) {
        return conflictResponse(res, 'CNPJ já cadastrado');
      }
    }

    // Verificar se razão social já existe
    const existingRazaoSocial = await executeQuery(
      'SELECT id FROM fornecedores WHERE razao_social = ?',
      [razao_social]
    );

    if (existingRazaoSocial.length > 0) {
      return conflictResponse(res, 'Razão social já cadastrada');
    }

    // Inserir fornecedor
    const result = await executeQuery(
      `INSERT INTO fornecedores (cnpj, razao_social, nome_fantasia, logradouro, numero, bairro, 
                                 municipio, uf, cep, email, telefone, status, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        cnpj ? cnpj.replace(/\D/g, '') : null, 
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

    const novoFornecedorId = result.insertId;

    // Buscar fornecedor criado
    const fornecedores = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [novoFornecedorId]
    );

    const fornecedor = fornecedores[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(fornecedor);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, fornecedor.id);

    return successResponse(res, data, 'Fornecedor criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar fornecedor
   */
  static atualizarFornecedor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se fornecedor existe
    const existingFornecedor = await executeQuery(
      'SELECT id, cnpj, razao_social FROM fornecedores WHERE id = ?',
      [id]
    );

    if (existingFornecedor.length === 0) {
      return notFoundResponse(res, 'Fornecedor não encontrado');
    }

    // Verificar se CNPJ já existe (se estiver sendo alterado)
    if (updateData.cnpj) {
      const cnpjLimpo = updateData.cnpj.replace(/\D/g, '');
      const cnpjCheck = await executeQuery(
        'SELECT id FROM fornecedores WHERE cnpj = ? AND id != ?',
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
        'SELECT id FROM fornecedores WHERE razao_social = ? AND id != ?',
        [updateData.razao_social, id]
      );

      if (razaoSocialCheck.length > 0) {
        return conflictResponse(res, 'Razão social já cadastrada');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];

    // Lista de campos válidos da tabela fornecedores
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
      `UPDATE fornecedores SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar fornecedor atualizado
    const fornecedores = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [id]
    );

    const fornecedor = fornecedores[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(fornecedor);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, fornecedor.id);

    return successResponse(res, data, 'Fornecedor atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir fornecedor
   */
  static excluirFornecedor = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se fornecedor existe
    const existingFornecedor = await executeQuery(
      'SELECT id FROM fornecedores WHERE id = ?',
      [id]
    );

    if (existingFornecedor.length === 0) {
      return notFoundResponse(res, 'Fornecedor não encontrado');
    }

    // Verificar se fornecedor está sendo usado em produtos
    const hasProducts = await executeQuery(
      'SELECT COUNT(*) as count FROM produtos WHERE fornecedor_id = ?',
      [id]
    );

    if (hasProducts[0].count > 0) {
      return errorResponse(res, 'Fornecedor não pode ser excluído pois possui produtos cadastrados', STATUS_CODES.BAD_REQUEST);
    }

    // Excluir fornecedor (soft delete - alterar status para 0)
    await executeQuery(
      'UPDATE fornecedores SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Fornecedor excluído com sucesso', STATUS_CODES.NO_CONTENT);
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

module.exports = FornecedoresCRUDController;
