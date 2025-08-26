const { executeQuery } = require('../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/anexos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas PDF, DOC, XLS e imagens são aceitos.'));
    }
  }
});

class AnexosController {
  // GET /api/cotacoes/:id/anexos - Listar anexos de uma cotação
  static async getAnexos(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          a.id,
          a.cotacao_id,
          a.fornecedor_id,
          a.nome_arquivo,
          a.caminho_arquivo,
          a.tipo_arquivo,
          a.tamanho_arquivo,
          a.data_upload,
          a.usuario_upload,
          a.observacoes,
          f.nome as fornecedor_nome
        FROM anexos_cotacao a
        JOIN fornecedores f ON a.fornecedor_id = f.id
        WHERE a.cotacao_id = ?
        ORDER BY a.data_upload DESC
      `;

      const anexos = await executeQuery(query, [id]);
      res.json(anexos);
    } catch (error) {
      console.error('Erro ao buscar anexos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // POST /api/cotacoes/:id/anexos - Upload de anexo
  static async uploadAnexo(req, res) {
    try {
      const { id } = req.params;
      const { fornecedor_id, observacoes } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo foi enviado' });
      }

      if (!fornecedor_id) {
        return res.status(400).json({ message: 'ID do fornecedor é obrigatório' });
      }

      // Verificar se a cotação existe
      const cotacaoQuery = 'SELECT id FROM cotacoes WHERE id = ?';
      const [cotacao] = await executeQuery(cotacaoQuery, [id]);
      
      if (!cotacao) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }

      // Verificar se o fornecedor existe
      const fornecedorQuery = 'SELECT id FROM fornecedores WHERE id = ? AND cotacao_id = ?';
      const [fornecedor] = await executeQuery(fornecedorQuery, [fornecedor_id, id]);
      
      if (!fornecedor) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }

      // Inserir anexo no banco
      const insertQuery = `
        INSERT INTO anexos_cotacao (
          cotacao_id, fornecedor_id, nome_arquivo, caminho_arquivo,
          tipo_arquivo, tamanho_arquivo, usuario_upload, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        id,
        fornecedor_id,
        file.originalname,
        file.path,
        file.mimetype,
        file.size,
        req.user.name || 'Sistema',
        observacoes || ''
      ]);

      // Marcar validação como anexo enviado
      const updateValidacaoQuery = `
        UPDATE validacao_anexos 
        SET anexo_enviado = TRUE 
        WHERE cotacao_id = ? AND fornecedor_id = ?
      `;
      await executeQuery(updateValidacaoQuery, [id, fornecedor_id]);

      res.status(201).json({
        message: 'Anexo enviado com sucesso',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Erro ao fazer upload do anexo:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // GET /api/cotacoes/:id/anexos/:anexoId/download - Download de anexo
  static async downloadAnexo(req, res) {
    try {
      const { id, anexoId } = req.params;

      // Buscar informações do anexo
      const anexoQuery = 'SELECT nome_arquivo, caminho_arquivo FROM anexos_cotacao WHERE id = ? AND cotacao_id = ?';
      const [anexo] = await executeQuery(anexoQuery, [anexoId, id]);

      if (!anexo) {
        return res.status(404).json({ message: 'Anexo não encontrado' });
      }

      // Verificar se o arquivo existe
      if (!fs.existsSync(anexo.caminho_arquivo)) {
        return res.status(404).json({ message: 'Arquivo não encontrado' });
      }

      // Enviar arquivo para download
      res.download(anexo.caminho_arquivo, anexo.nome_arquivo);
    } catch (error) {
      console.error('Erro ao fazer download do anexo:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // DELETE /api/cotacoes/:id/anexos/:anexoId - Excluir anexo
  static async deleteAnexo(req, res) {
    try {
      const { id, anexoId } = req.params;

      // Buscar informações do anexo
      const anexoQuery = 'SELECT caminho_arquivo, fornecedor_id FROM anexos_cotacao WHERE id = ? AND cotacao_id = ?';
      const [anexo] = await executeQuery(anexoQuery, [anexoId, id]);

      if (!anexo) {
        return res.status(404).json({ message: 'Anexo não encontrado' });
      }

      // Excluir arquivo físico
      if (fs.existsSync(anexo.caminho_arquivo)) {
        fs.unlinkSync(anexo.caminho_arquivo);
      }

      // Excluir registro do banco
      const deleteQuery = 'DELETE FROM anexos_cotacao WHERE id = ?';
      await executeQuery(deleteQuery, [anexoId]);

      // Verificar se ainda há anexos para este fornecedor
      const anexosRestantesQuery = `
        SELECT COUNT(*) as total 
        FROM anexos_cotacao 
        WHERE cotacao_id = ? AND fornecedor_id = ?
      `;
      const [anexosRestantes] = await executeQuery(anexosRestantesQuery, [id, anexo.fornecedor_id]);

      // Se não há mais anexos, marcar validação como não enviado
      if (anexosRestantes.total === 0) {
        const updateValidacaoQuery = `
          UPDATE validacao_anexos 
          SET anexo_enviado = FALSE 
          WHERE cotacao_id = ? AND fornecedor_id = ?
        `;
        await executeQuery(updateValidacaoQuery, [id, anexo.fornecedor_id]);
      }

      res.json({ message: 'Anexo excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir anexo:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // GET /api/cotacoes/:id/validacao-anexos - Verificar validação de anexos
  static async getValidacaoAnexos(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          v.id,
          v.cotacao_id,
          v.fornecedor_id,
          v.produto_id,
          v.valor_anterior,
          v.valor_novo,
          v.anexo_obrigatorio,
          v.anexo_enviado,
          v.data_alteracao,
          f.nome as fornecedor_nome,
          COALESCE(p.nome, 'Produto não encontrado') as produto_nome
        FROM validacao_anexos v
        JOIN fornecedores f ON v.fornecedor_id = f.id
        LEFT JOIN produtos_fornecedores p ON v.produto_id = p.id
        WHERE v.cotacao_id = ?
        ORDER BY v.data_alteracao DESC
      `;

      const validacoes = await executeQuery(query, [id]);
      
      res.json(validacoes);
    } catch (error) {
      console.error('Erro ao buscar validações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // POST /api/cotacoes/:id/validar-anexos - Validar anexos obrigatórios
  static async validarAnexos(req, res) {
    try {
      const { id } = req.params;
      const { fornecedor_id, produto_id, valor_anterior, valor_novo } = req.body;

      // Verificar se houve alteração de valor
      const valorAlterado = parseFloat(valor_novo) !== parseFloat(valor_anterior);
      
      // Verificar se já existe validação para este fornecedor
      const existingQuery = `
        SELECT id FROM validacao_anexos 
        WHERE cotacao_id = ? AND fornecedor_id = ?
      `;
      const [existing] = await executeQuery(existingQuery, [id, fornecedor_id]);

      if (existing) {
        // Atualizar validação existente
        const updateQuery = `
          UPDATE validacao_anexos 
          SET valor_anterior = ?, valor_novo = ?, anexo_obrigatorio = TRUE, anexo_enviado = FALSE
          WHERE id = ?
        `;
        await executeQuery(updateQuery, [valor_anterior || 0, valor_novo || 0, existing.id]);
      } else {
        // Criar nova validação (sempre obrigatória para cada fornecedor)
        const insertQuery = `
          INSERT INTO validacao_anexos (
            cotacao_id, fornecedor_id, produto_id, valor_anterior, valor_novo, anexo_obrigatorio
          ) VALUES (?, ?, ?, ?, ?, TRUE)
        `;
        await executeQuery(insertQuery, [id, fornecedor_id, produto_id || null, valor_anterior || 0, valor_novo || 0]);
      }

      res.json({ 
        message: 'Validação processada com sucesso',
        anexo_obrigatorio: true
      });
    } catch (error) {
      console.error('Erro ao validar anexos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Função para verificar se todos os anexos obrigatórios foram enviados
  static async verificarAnexosObrigatorios(cotacaoId) {
    try {
      const query = `
        SELECT COUNT(*) as total_obrigatorios,
               SUM(CASE WHEN anexo_enviado = TRUE THEN 1 ELSE 0 END) as anexos_enviados
        FROM validacao_anexos 
        WHERE cotacao_id = ? AND anexo_obrigatorio = TRUE
      `;
      
      const [result] = await executeQuery(query, [cotacaoId]);
      
      return {
        total_obrigatorios: result.total_obrigatorios,
        anexos_enviados: result.anexos_enviados,
        todos_enviados: result.total_obrigatorios === result.anexos_enviados
      };
    } catch (error) {
      console.error('Erro ao verificar anexos obrigatórios:', error);
      throw error;
    }
  }
}

module.exports = { AnexosController, upload };
