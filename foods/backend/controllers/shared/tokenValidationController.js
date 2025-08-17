/**
 * Controller para validação de tokens
 * Centraliza a lógica de validação de tokens do sistema de cotação
 */
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../../config/database');

class TokenValidationController {
  /**
   * Valida token do sistema de cotação
   */
  static async validateCotacaoToken(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Token não fornecido' });
      }

      console.log('🔍 Validando token do sistema de cotação:', token.substring(0, 20) + '...');

      // Verificar se o token é válido
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET não definido nas variáveis de ambiente!');
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token decodificado:', { userId: decoded.userId });
      
      // Buscar usuário
      const users = await executeQuery(
        'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE id = ?',
        [decoded.userId]
      );

      if (users.length === 0) {
        console.log('❌ Usuário não encontrado:', decoded.userId);
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const user = users[0];
      console.log('✅ Usuário encontrado:', { id: user.id, nome: user.nome, status: user.status });

      if (user.status !== 'ativo') {
        console.log('❌ Usuário inativo:', user.status);
        return res.status(401).json({ error: 'Usuário inativo' });
      }

      console.log('✅ Token validado com sucesso para usuário:', user.nome);
      res.json({ 
        valid: true, 
        user: user 
      });

    } catch (error) {
      console.error('❌ Erro ao validar token:', error);
      res.status(401).json({ error: 'Token inválido' });
    }
  }

  /**
   * Busca segura de fornecedores (para sistema de cotação)
   */
  static async getPublicFornecedores(req, res) {
    try {
      const { search } = req.query;
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!search || search.length < 2) {
        return res.json([]);
      }

      // Verificar se o token foi fornecido
      if (!token) {
        console.log('❌ Tentativa de acesso sem token');
        return res.status(401).json({ error: 'Token de acesso não fornecido' });
      }

      // Validar o token
      try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
          throw new Error('JWT_SECRET não definido');
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('🔍 Token validado para usuário:', decoded.userId);
        
      } catch (tokenError) {
        console.log('❌ Token inválido:', tokenError.message);
        return res.status(401).json({ error: 'Token inválido' });
      }

      console.log('🔍 Busca segura de fornecedores:', search);
      
      const query = `
        SELECT 
          id, 
          razao_social, 
          nome_fantasia, 
          cnpj, 
          telefone, 
          email, 
          logradouro, 
          numero, 
          bairro, 
          municipio, 
          uf, 
          cep,
          status
        FROM fornecedores 
        WHERE status = 1 
          AND (
            razao_social LIKE ? OR 
            nome_fantasia LIKE ? OR 
            cnpj LIKE ?
          )
        ORDER BY razao_social 
        LIMIT 20
      `;
      
      const searchTerm = `%${search}%`;
      const fornecedores = await executeQuery(query, [searchTerm, searchTerm, searchTerm]);
      
      console.log('✅ Fornecedores encontrados:', fornecedores.length);
      
      res.json(fornecedores);
      
    } catch (error) {
      console.error('❌ Erro ao buscar fornecedores:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = TokenValidationController;
