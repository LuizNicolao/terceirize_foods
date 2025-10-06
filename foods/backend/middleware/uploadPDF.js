/**
 * Middleware de Upload de Arquivos PDF
 * Configura o multer para upload de arquivos PDF
 */

const multer = require('multer');
const path = require('path');

// Configuração do storage em memória para processamento direto
const storage = multer.memoryStorage();

// Filtro para aceitar apenas arquivos PDF
const fileFilter = (req, file, cb) => {
  // Verificar extensão do arquivo
  const allowedExtensions = ['.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas arquivos PDF são permitidos.'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 1 // Apenas 1 arquivo por vez
  }
});

// Middleware para upload de arquivos PDF
const uploadPDF = upload.single('pdf');

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
        message: 'Apenas um arquivo pode ser enviado por vez'
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
  uploadPDF,
  handleUploadError
};
