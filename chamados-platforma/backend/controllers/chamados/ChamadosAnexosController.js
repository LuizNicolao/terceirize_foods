/**
 * Controller de Anexos de Chamados
 * Responsável por gerenciar anexos dos chamados
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const path = require('path');
const fs = require('fs').promises;

// Diretório para armazenar anexos (relativo à raiz do projeto)
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'chamados');

// Função para garantir que o diretório existe
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório de uploads:', error);
  }
};

// Garantir que o diretório existe na inicialização
ensureUploadsDir();

class ChamadosAnexosController {
  
  /**
   * Listar anexos de um chamado
   */
  static listarAnexos = asyncHandler(async (req, res) => {
    const { chamadoId } = req.params;

    // Verificar se chamado existe
    const chamado = await executeQuery(
      'SELECT id FROM chamados WHERE id = ? AND ativo = 1',
      [chamadoId]
    );

    if (chamado.length === 0) {
      return notFoundResponse(res, 'Chamado não encontrado');
    }

    const anexos = await executeQuery(
      `SELECT 
        id,
        chamado_id,
        comentario_id,
        tipo_anexo,
        nome_arquivo,
        caminho_arquivo,
        tipo_arquivo,
        tamanho,
        data_upload
      FROM chamados_anexos 
      WHERE chamado_id = ? AND ativo = 1
      ORDER BY data_upload DESC`,
      [chamadoId]
    );

    return successResponse(res, anexos, 'Anexos listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Upload de anexo para um chamado
   */
  static uploadAnexo = asyncHandler(async (req, res) => {
    const { chamadoId } = req.params;
    const file = req.file;
    const { tipo_anexo } = req.body; // Receber tipo_anexo do body (problema ou correcao)

    if (!file) {
      return errorResponse(res, 'Nenhum arquivo foi enviado', STATUS_CODES.BAD_REQUEST);
    }

    // Validar tipo_anexo (deve ser 'problema' ou 'correcao', padrão é 'problema')
    const tipoAnexoValido = tipo_anexo === 'correcao' ? 'correcao' : 'problema';

    // Verificar se chamado existe
    const chamado = await executeQuery(
      'SELECT id FROM chamados WHERE id = ? AND ativo = 1',
      [chamadoId]
    );

    if (chamado.length === 0) {
      // Deletar arquivo se chamado não existir
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error('Erro ao deletar arquivo:', error);
      }
      return notFoundResponse(res, 'Chamado não encontrado');
    }

    // Garantir que o diretório de uploads existe
    await ensureUploadsDir();
    
    // Criar diretório específico para o chamado
    const chamadoDir = path.join(UPLOADS_DIR, chamadoId.toString());
    await fs.mkdir(chamadoDir, { recursive: true });

    // Mover arquivo para o diretório do chamado
    const novoCaminho = path.join(chamadoDir, file.filename);
    await fs.rename(file.path, novoCaminho);

    // Usar caminho relativo para armazenar no banco
    const caminhoRelativo = path.join('chamados', chamadoId.toString(), file.filename);

    // Inserir registro do anexo
    const result = await executeQuery(
      `INSERT INTO chamados_anexos 
        (chamado_id, tipo_anexo, nome_arquivo, caminho_arquivo, tipo_arquivo, tamanho, data_upload) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        chamadoId,
        tipoAnexoValido,
        file.originalname,
        caminhoRelativo,
        file.mimetype,
        file.size
      ]
    );

    const anexoId = result.insertId;

    // Buscar anexo criado
    const anexos = await executeQuery(
      'SELECT * FROM chamados_anexos WHERE id = ?',
      [anexoId]
    );

    const anexo = anexos[0];

    // Atualizar data_atualizacao do chamado
    await executeQuery(
      'UPDATE chamados SET data_atualizacao = NOW() WHERE id = ?',
      [chamadoId]
    );

    return successResponse(res, anexo, 'Anexo enviado com sucesso', STATUS_CODES.CREATED);
  });

  /**
   * Download de anexo
   */
  static downloadAnexo = asyncHandler(async (req, res) => {
    const { chamadoId, anexoId } = req.params;

    // Buscar anexo
    const anexos = await executeQuery(
      'SELECT * FROM chamados_anexos WHERE id = ? AND chamado_id = ? AND ativo = 1',
      [anexoId, chamadoId]
    );

    if (anexos.length === 0) {
      return notFoundResponse(res, 'Anexo não encontrado');
    }

    const anexo = anexos[0];

    // Construir caminho completo do arquivo
    const caminhoCompleto = path.isAbsolute(anexo.caminho_arquivo) 
      ? anexo.caminho_arquivo 
      : path.join(UPLOADS_DIR, anexo.caminho_arquivo.replace(/^chamados[\\/]/, ''));

    // Verificar se arquivo existe
    try {
      await fs.access(caminhoCompleto);
      
      // Se for uma imagem e não tiver o header de download, servir como imagem
      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(anexo.nome_arquivo);
      if (isImage && req.query.preview === 'true') {
        return res.sendFile(path.resolve(caminhoCompleto));
      }
      
      return res.download(caminhoCompleto, anexo.nome_arquivo);
    } catch (error) {
      console.error('Erro ao acessar arquivo:', error);
      return notFoundResponse(res, 'Arquivo não encontrado no servidor');
    }
  });

  /**
   * Excluir anexo
   */
  static excluirAnexo = asyncHandler(async (req, res) => {
    const { chamadoId, anexoId } = req.params;

    // Buscar anexo
    const anexos = await executeQuery(
      'SELECT * FROM chamados_anexos WHERE id = ? AND chamado_id = ? AND ativo = 1',
      [anexoId, chamadoId]
    );

    if (anexos.length === 0) {
      return notFoundResponse(res, 'Anexo não encontrado');
    }

    const anexo = anexos[0];

    // Soft delete
    await executeQuery(
      'UPDATE chamados_anexos SET ativo = 0 WHERE id = ? AND chamado_id = ?',
      [anexoId, chamadoId]
    );

    // Tentar deletar arquivo físico
    try {
      const caminhoCompleto = path.isAbsolute(anexo.caminho_arquivo) 
        ? anexo.caminho_arquivo 
        : path.join(UPLOADS_DIR, anexo.caminho_arquivo.replace(/^chamados[\\/]/, ''));
      await fs.unlink(caminhoCompleto);
    } catch (error) {
      console.error('Erro ao deletar arquivo físico:', error);
      // Não falhar se o arquivo não existir
    }

    // Atualizar data_atualizacao do chamado
    await executeQuery(
      'UPDATE chamados SET data_atualizacao = NOW() WHERE id = ?',
      [chamadoId]
    );

    return successResponse(res, null, 'Anexo excluído com sucesso', STATUS_CODES.OK);
  });

}

module.exports = ChamadosAnexosController;
