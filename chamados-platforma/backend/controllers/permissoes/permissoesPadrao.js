/**
 * Definições de Permissões Padrão
 * Centraliza todas as permissões padrão por tipo e nível de acesso
 * Adaptado para chamados-platforma
 */

// Definir permissões padrão por tipo e nível de acesso
// Para chamados, incluir permissões específicas: assumir, concluir, reabrir, atribuir
const PERMISSOES_PADRAO = {
  administrador: {
    I: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: true, criar: true, editar: true, excluir: true },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: true,
        assumir: true, concluir: true, reabrir: true, atribuir: true
      }
    },
    II: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: true, criar: true, editar: true, excluir: true },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: true,
        assumir: true, concluir: true, reabrir: true, atribuir: true
      }
    },
    III: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: true, criar: true, editar: true, excluir: true },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: true,
        assumir: true, concluir: true, reabrir: true, atribuir: true
      }
    }
  },
  supervisor: {
    I: {
      usuarios: { visualizar: true, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: true, criar: false, editar: false, excluir: false },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: false,
        assumir: true, concluir: true, reabrir: true, atribuir: true
      }
    },
    II: {
      usuarios: { visualizar: true, criar: false, editar: true, excluir: false },
      permissoes: { visualizar: true, criar: false, editar: false, excluir: false },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: false,
        assumir: true, concluir: true, reabrir: true, atribuir: true
      }
    },
    III: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: true, criar: false, editar: true, excluir: false },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: true,
        assumir: true, concluir: true, reabrir: true, atribuir: true
      }
    }
  },
  tecnico: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: false,
        assumir: true, concluir: true, reabrir: true, atribuir: false
      }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: false,
        assumir: true, concluir: true, reabrir: true, atribuir: false
      }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: false,
        assumir: true, concluir: true, reabrir: true, atribuir: false
      }
    }
  },
  usuario: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false },
      chamados: { 
        visualizar: true, criar: true, editar: false, excluir: false,
        assumir: false, concluir: false, reabrir: true, atribuir: false
      }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: false,
        assumir: false, concluir: false, reabrir: true, atribuir: false
      }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false },
      chamados: { 
        visualizar: true, criar: true, editar: true, excluir: true,
        assumir: false, concluir: false, reabrir: true, atribuir: false
      }
    }
  }
};

// Lista de todas as telas disponíveis no sistema
const TODAS_TELAS = [
  'usuarios',
  'permissoes',
  'chamados'
];

// Tipos de acesso disponíveis
const TIPOS_ACESSO = [
  { valor: 'administrador', descricao: 'Administrador' },
  { valor: 'supervisor', descricao: 'Supervisor' },
  { valor: 'tecnico', descricao: 'Técnico/Desenvolvedor' },
  { valor: 'usuario', descricao: 'Usuário' }
];

// Níveis de acesso disponíveis
const NIVEIS_ACESSO = [
  { valor: 'I', descricao: 'Nível I - Básico' },
  { valor: 'II', descricao: 'Nível II - Intermediário' },
  { valor: 'III', descricao: 'Nível III - Avançado' }
];

// Lista de telas com descrições
const TELAS_COM_DESCRICOES = [
  { nome: 'usuarios', descricao: 'Gerenciamento de Usuários' },
  { nome: 'permissoes', descricao: 'Gerenciamento de Permissões' },
  { nome: 'chamados', descricao: 'Gerenciamento de Chamados' }
];

// Mapeamento de visualização de chamados por tipo de usuário
const VISUALIZACAO_CHAMADOS = {
  administrador: {
    descricao: 'Vê todos os chamados',
    filtro: null, // Sem filtro - vê tudo
    podeVerTodos: true
  },
  supervisor: {
    descricao: 'Vê chamados atribuídos a ele + chamados abertos do sistema',
    filtro: 'supervisor', // Filtro customizado
    podeVerTodos: false
  },
  tecnico: {
    descricao: 'Vê apenas chamados atribuídos a ele + sem responsável',
    filtro: 'tecnico', // Filtro customizado
    podeVerTodos: false
  },
  usuario: {
    descricao: 'Vê apenas chamados criados por ele',
    filtro: 'proprios', // Filtro customizado
    podeVerTodos: false
  }
};

module.exports = {
  PERMISSOES_PADRAO,
  TODAS_TELAS,
  TIPOS_ACESSO,
  NIVEIS_ACESSO,
  TELAS_COM_DESCRICOES,
  VISUALIZACAO_CHAMADOS
};
