/**
 * Definições de Permissões Padrão para o Sistema Geracao_necessidade
 * Centraliza todas as permissões padrão por tipo e nível de acesso
 */

// Definir permissões padrão por tipo e nível de acesso
const PERMISSOES_PADRAO = {
  administrador: {
    I: {
      dashboard: { visualizar: true, criar: false, editar: false, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: true },
      usuarios: { visualizar: true, criar: true, editar: true, excluir: true },
      escolas: { visualizar: true, criar: true, editar: true, excluir: true },
      medias_escolas: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: true },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: true },
      solicitacoes_manutencao: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: true, criar: true, editar: true, excluir: true }
    }
  },
  coordenador: {
    I: {
      dashboard: { visualizar: true, criar: false, editar: false, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      usuarios: { visualizar: true, criar: false, editar: false, excluir: false },
      escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      medias_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      solicitacoes_manutencao: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  },
  supervisor: {
    I: {
      dashboard: { visualizar: true, criar: false, editar: false, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      escolas: { visualizar: true, criar: false, editar: false, excluir: false },
      medias_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      solicitacoes_manutencao: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  },
  nutricionista: {
    I: {
      dashboard: { visualizar: true, criar: false, editar: false, excluir: false },
      necessidades: { visualizar: false, criar: false, editar: false, excluir: false },
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      escolas: { visualizar: true, criar: false, editar: false, excluir: false },
      medias_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      solicitacoes_manutencao: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  }
};

// Lista de todas as telas disponíveis no sistema
const TODAS_TELAS = [
  'dashboard',
  'necessidades',
  'usuarios',
  'escolas',
  'medias_escolas',
  'produtos_per_capita',
  'recebimentos_escolas',
  'solicitacoes_manutencao',
  'permissoes'
];

// Tipos de acesso disponíveis
const TIPOS_ACESSO = [
  { valor: 'administrador', descricao: 'Administrador' },
  { valor: 'coordenador', descricao: 'Coordenador' },
  { valor: 'supervisor', descricao: 'Supervisor' },
  { valor: 'nutricionista', descricao: 'Nutricionista' }
];

// Níveis de acesso disponíveis
const NIVEIS_ACESSO = [
  { valor: 'I', descricao: 'Nível I' }
];

module.exports = {
  PERMISSOES_PADRAO,
  TODAS_TELAS,
  TIPOS_ACESSO,
  NIVEIS_ACESSO
};
