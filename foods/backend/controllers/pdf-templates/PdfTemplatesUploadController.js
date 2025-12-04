/**
 * Controller para upload de imagens do CKEditor em PDF Templates
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Diretório de upload de imagens para templates
const uploadDir = path.join(__dirname, '../../../arquivos/pdf-templates/imagens');

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
    cb(null, `image_${uniqueSuffix}${ext}`);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas imagens são aceitas.'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Middleware para upload de imagem única
const uploadImage = upload.single('upload');

// Middleware de tratamento de erros
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Arquivo muito grande',
        message: 'Tamanho máximo: 5MB'
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

/**
 * Upload de imagem para CKEditor
 * Retorna URL da imagem no formato esperado pelo CKEditor
 */
const uploadImageForCKEditor = async (req, res) => {
  uploadImage(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, () => {});
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado',
        message: 'Por favor, selecione uma imagem para upload'
      });
    }

    // Retornar URL da imagem no formato esperado pelo CKEditor
    // O CKEditor espera: { url: 'http://...' } ou { default: 'http://...' }
    const imageUrl = `/arquivos/pdf-templates/imagens/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;

    // CKEditor 5 espera o formato:
    return res.json({
      url: fullUrl
    });
  });
};

module.exports = {
  uploadImageForCKEditor,
  handleUploadError
};

