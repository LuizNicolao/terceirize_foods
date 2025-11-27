/**
 * Middleware de Upload de Arquivos de Nota Fiscal
 * Configura o multer para upload de arquivos PDF e XML
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Diretório de upload
const uploadDir = path.join(__dirname, '../../arquivos/notas-fiscais');

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
    // O nome do arquivo será definido no controller após obter os dados da nota fiscal
    // Por enquanto, usar um nome temporário
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para aceitar apenas arquivos PDF e XML
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.xml'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas arquivos PDF e XML são permitidos.'), false);
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

// Middleware para upload de arquivo de nota fiscal
const uploadNotaFiscal = upload.single('arquivo_nota_fiscal');

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
  uploadNotaFiscal,
  handleUploadError,
  uploadDir
};

