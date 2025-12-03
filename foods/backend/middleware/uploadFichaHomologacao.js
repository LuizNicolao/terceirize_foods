/**
 * Middleware de Upload de Arquivos de Ficha de Homologação
 * Configura o multer para upload de imagens e PDFs
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Diretório de upload
const uploadDir = path.join(__dirname, '../../arquivos/fichas-homologacao');

// Criar diretório se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fieldName = file.fieldname;
    
    // Nome do arquivo: campo_timestamp_random.extensao
    cb(null, `${fieldName}_${uniqueSuffix}${ext}`);
  }
});

// Filtro para aceitar apenas imagens e PDFs
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas imagens (JPG, PNG, GIF, WEBP) e PDFs são permitidos.'), false);
  }
};

// Configuração do multer para múltiplos arquivos
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por arquivo
    files: 4 // Máximo 4 arquivos (3 fotos + 1 PDF)
  }
});

// Middleware para upload de arquivos de ficha de homologação
// Aceita: foto_embalagem, foto_produto_cru, foto_produto_cozido, pdf_avaliacao_antiga
const uploadFichaHomologacao = upload.fields([
  { name: 'foto_embalagem', maxCount: 1 },
  { name: 'foto_produto_cru', maxCount: 1 },
  { name: 'foto_produto_cozido', maxCount: 1 },
  { name: 'pdf_avaliacao_antiga', maxCount: 1 }
]);

// Middleware de tratamento de erros do multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Arquivo muito grande',
        message: 'O arquivo excede o tamanho máximo permitido de 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Muitos arquivos',
        message: 'Máximo de 4 arquivos permitidos'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Campo de arquivo inválido',
        message: 'Campo de arquivo não reconhecido'
      });
    }
  }
  
  if (error.message.includes('Tipo de arquivo não suportado')) {
    return res.status(400).json({
      success: false,
      error: 'Tipo de arquivo inválido',
      message: error.message
    });
  }
  
  next(error);
};

module.exports = {
  uploadFichaHomologacao,
  handleUploadError,
  uploadDir
};

