/**
 * Controller para Download de Arquivo de Nota Fiscal
 */

const { executeQuery } = require('../../config/database');
const { 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const fs = require('fs');
const path = require('path');

class NotaFiscalDownloadController {
  
  /**
   * Download do arquivo da nota fiscal
   */
  static downloadArquivo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar nota fiscal
    const notaFiscal = await executeQuery(
      'SELECT xml_path FROM notas_fiscais WHERE id = ?',
      [id]
    );

    if (notaFiscal.length === 0) {
      return notFoundResponse(res, 'Nota fiscal não encontrada');
    }

    const arquivoPath = notaFiscal[0].xml_path;

    if (!arquivoPath) {
      return errorResponse(res, 'Arquivo não encontrado para esta nota fiscal', STATUS_CODES.NOT_FOUND);
    }

    // Construir caminho absoluto do arquivo
    // O caminho salvo é relativo a partir de foods/
    // __dirname está em: foods/backend/controllers/notas-fiscais
    // Precisamos ir para: foods/
    const foodsRoot = path.join(__dirname, '../..');
    const caminhoCompleto = path.join(foodsRoot, arquivoPath);

    // Verificar se o arquivo existe
    if (!fs.existsSync(caminhoCompleto)) {
      return errorResponse(res, 'Arquivo não encontrado no servidor', STATUS_CODES.NOT_FOUND);
    }

    // Obter nome do arquivo do caminho completo
    const nomeArquivo = path.basename(caminhoCompleto);
    
    // Se o caminho no banco começar com ../, extrair o nome do caminho original também
    // para garantir que pegamos o nome correto
    const nomeArquivoOriginal = arquivoPath.includes('/') 
      ? arquivoPath.split('/').pop() 
      : arquivoPath;
    
    // Usar o nome original se disponível, senão usar o basename
    const nomeFinal = nomeArquivoOriginal && nomeArquivoOriginal !== nomeArquivo 
      ? nomeArquivoOriginal 
      : nomeArquivo;

    // Determinar Content-Type baseado na extensão
    const extensao = path.extname(nomeFinal).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.xml': 'application/xml'
    };
    const contentType = contentTypes[extensao] || 'application/octet-stream';

    // Configurar headers para download com nome do arquivo codificado para URL
    // Usar encodeURIComponent para caracteres especiais
    const nomeArquivoEncoded = encodeURIComponent(nomeFinal);
    res.setHeader('Content-Disposition', `attachment; filename="${nomeFinal}"; filename*=UTF-8''${nomeArquivoEncoded}`);
    res.setHeader('Content-Type', contentType);

    // Enviar arquivo
    res.sendFile(caminhoCompleto, (err) => {
      if (err) {
        if (!res.headersSent) {
          return errorResponse(res, 'Erro ao enviar arquivo', STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
      }
    });
  });
}

module.exports = NotaFiscalDownloadController;

