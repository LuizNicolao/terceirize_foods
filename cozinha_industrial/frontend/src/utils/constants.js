/**
 * Constantes do sistema
 * Centraliza constantes reutilizáveis
 */

// Tipos de acesso
export const TIPOS_ACESSO = {
  ADMINISTRADOR: 'administrador',
  COORDENADOR: 'coordenador',
  ADMINISTRATIVO: 'administrativo',
  GERENTE: 'gerente',
  SUPERVISOR: 'supervisor',
  NUTRICIONISTA: 'nutricionista'
};

// Níveis de acesso
export const NIVEIS_ACESSO = {
  I: 'I',
  II: 'II',
  III: 'III'
};

// Status
export const STATUS = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  BLOQUEADO: 'bloqueado'
};

// Tipos de recebimento
export const TIPOS_RECEBIMENTO = {
  COMPLETO: 'Completo',
  PARCIAL: 'Parcial'
};

// Tipos de entrega
export const TIPOS_ENTREGA = {
  HORTI: 'HORTI',
  PAO: 'PAO',
  PERECIVEL: 'PERECIVEL',
  BASE_SECA: 'BASE SECA',
  LIMPEZA: 'LIMPEZA'
};

// Períodos de refeição
export const PERIODOS_REFEICAO = {
  LANCHE_MANHA: 'lanche_manha',
  ALMOCO: 'almoco',
  LANCHE_TARDE: 'lanche_tarde',
  PARCIAL: 'parcial',
  EJA: 'eja'
};

// Labels dos períodos
export const PERIODOS_LABELS = {
  [PERIODOS_REFEICAO.LANCHE_MANHA]: 'Lanche Manhã',
  [PERIODOS_REFEICAO.ALMOCO]: 'Almoço',
  [PERIODOS_REFEICAO.LANCHE_TARDE]: 'Lanche Tarde',
  [PERIODOS_REFEICAO.PARCIAL]: 'Parcial',
  [PERIODOS_REFEICAO.EJA]: 'EJA'
};

// Opções de paginação
export const PAGINATION_OPTIONS = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 1000
};

// Configurações de validação
export const VALIDATION_CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL_CHARS: false
  },
  STRING: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255
  },
  PER_CAPITA: {
    MIN: 0,
    MAX: 999.999999,
    DECIMALS: 6
  }
};

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  REQUIRED: 'Campo obrigatório',
  INVALID_EMAIL: 'Email inválido',
  INVALID_CPF: 'CPF inválido',
  INVALID_CNPJ: 'CNPJ inválido',
  INVALID_PHONE: 'Telefone inválido',
  INVALID_DATE: 'Data inválida',
  INVALID_URL: 'URL inválida',
  INVALID_NUMBER: 'Número inválido',
  INVALID_STRING: 'Texto inválido',
  INVALID_ARRAY: 'Lista inválida',
  INVALID_OBJECT: 'Objeto inválido',
  PASSWORD_TOO_SHORT: 'Senha muito curta',
  PASSWORD_REQUIRE_UPPERCASE: 'Senha deve conter letra maiúscula',
  PASSWORD_REQUIRE_LOWERCASE: 'Senha deve conter letra minúscula',
  PASSWORD_REQUIRE_NUMBERS: 'Senha deve conter número',
  PASSWORD_REQUIRE_SPECIAL: 'Senha deve conter caractere especial',
  INVALID_TIPO_ACESSO: 'Tipo de acesso inválido',
  INVALID_NIVEL_ACESSO: 'Nível de acesso inválido',
  INVALID_STATUS: 'Status inválido',
  INVALID_TIPO_RECEBIMENTO: 'Tipo de recebimento inválido',
  INVALID_TIPO_ENTREGA: 'Tipo de entrega inválido',
  INVALID_PER_CAPITA: 'Per capita inválido'
};

// Mensagens de sucesso padrão
export const SUCCESS_MESSAGES = {
  CREATED: 'Registro criado com sucesso',
  UPDATED: 'Registro atualizado com sucesso',
  DELETED: 'Registro excluído com sucesso',
  SAVED: 'Registro salvo com sucesso',
  LOADED: 'Dados carregados com sucesso',
  EXPORTED: 'Dados exportados com sucesso',
  IMPORTED: 'Dados importados com sucesso'
};

// Configurações de API
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Configurações de upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  }
};

// Configurações de exportação
export const EXPORT_CONFIG = {
  XLSX: {
    DEFAULT_FILENAME: 'export',
    SHEET_NAME: 'Dados'
  },
  PDF: {
    DEFAULT_FILENAME: 'export',
    PAGE_SIZE: 'A4',
    MARGIN: 20
  }
};

// Configurações de tema
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: 'green',
    SECONDARY: 'blue',
    SUCCESS: 'green',
    WARNING: 'yellow',
    ERROR: 'red',
    INFO: 'blue'
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  }
};

// Configurações de notificação
export const NOTIFICATION_CONFIG = {
  DURATION: 5000,
  POSITION: 'top-right',
  MAX_TOASTS: 5
};

// Configurações de cache
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  MAX_ITEMS: 100
};

// Configurações de debounce
export const DEBOUNCE_CONFIG = {
  SEARCH: 300,
  INPUT: 500,
  SCROLL: 100
};

// Configurações de animação
export const ANIMATION_CONFIG = {
  DURATION: 300,
  EASING: 'ease-in-out'
};

// Configurações de formatação
export const FORMAT_CONFIG = {
  DATE: {
    LOCALE: 'pt-BR',
    TIMEZONE: 'America/Sao_Paulo'
  },
  NUMBER: {
    LOCALE: 'pt-BR',
    CURRENCY: 'BRL'
  }
};
