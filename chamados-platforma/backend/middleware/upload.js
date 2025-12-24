/**
 * Middleware para upload de arquivos usando multer
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Diretório temporário para uploads
const TEMP_UPLOADS_DIR = path.join(__dirname, '../uploads/temp');

// Garantir que o diretório temporário existe
(async () => {
  try {
    await fs.mkdir(TEMP_UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório de uploads temporários:', error);
  }
})();

// Configuração de storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TEMP_UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro de arquivos permitidos
const fileFilter = (req, file, cb) => {
  // Permitir imagens, PDFs e documentos comuns
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens, PDFs e documentos são aceitos.'));
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
