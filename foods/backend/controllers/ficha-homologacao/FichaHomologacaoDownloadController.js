/**
 * Controller para Download de Arquivos de Ficha de Homologação
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

class FichaHomologacaoDownloadController {
  
  /**
   * Download de arquivo da ficha de homologação
   * @param {string} tipo - Tipo de arquivo: foto_embalagem, foto_produto_cru, foto_produto_cozido, pdf_avaliacao_antiga
   */
  static downloadArquivo = asyncHandler(async (req, res) => {
    const { id, tipo } = req.params;

    // Validar tipo de arquivo
    const tiposPermitidos = ['foto_embalagem', 'foto_produto_cru', 'foto_produto_cozido', 'pdf_avaliacao_antiga'];
    if (!tiposPermitidos.includes(tipo)) {
      return errorResponse(res, 'Tipo de arquivo inválido', STATUS_CODES.BAD_REQUEST);
    }

    // Buscar ficha de homologação
    const fichaHomologacao = await executeQuery(
      `SELECT ${tipo} FROM ficha_homologacao WHERE id = ?`,
      [id]
    );

    if (fichaHomologacao.length === 0) {
      return notFoundResponse(res, 'Ficha de homologação não encontrada');
    }

    const arquivoPath = fichaHomologacao[0][tipo];

    if (!arquivoPath) {
      return errorResponse(res, 'Arquivo não encontrado para esta ficha de homologação', STATUS_CODES.NOT_FOUND);
    }

    // Construir caminho absoluto do arquivo
    // O caminho salvo é relativo a partir de foods/
    const foodsRoot = path.join(__dirname, '../..');
    const caminhoCompleto = path.join(foodsRoot, arquivoPath);

    // Verificar se o arquivo existe
    if (!fs.existsSync(caminhoCompleto)) {
      return errorResponse(res, 'Arquivo não encontrado no servidor', STATUS_CODES.NOT_FOUND);
    }

    // Obter nome do arquivo do caminho completo
    const nomeArquivo = path.basename(caminhoCompleto);
    
    // Determinar Content-Type baseado na extensão
    const extensao = path.extname(nomeArquivo).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf'
    };
    const contentType = contentTypes[extensao] || 'application/octet-stream';

    // Configurar headers para download/exibição
    const nomeArquivoEncoded = encodeURIComponent(nomeArquivo);
    
    // Para imagens, usar inline para exibir no navegador
    // Para PDFs, usar attachment para download
    const disposition = extensao === '.pdf' ? 'attachment' : 'inline';
    res.setHeader('Content-Disposition', `${disposition}; filename="${nomeArquivo}"; filename*=UTF-8''${nomeArquivoEncoded}`);
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

module.exports = FichaHomologacaoDownloadController;

