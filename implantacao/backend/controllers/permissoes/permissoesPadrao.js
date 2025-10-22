/**
 * Definições de Permissões Padrão
 * Centraliza todas as permissões padrão por tipo e nível de acesso
 */

// Definir permissões padrão por tipo e nível de acesso
const PERMISSOES_PADRAO = {
  administrador: {
    I: {
      usuarios: { visualizar: true, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: false, editar: false, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: true, criar: true, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: true },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      filiais: { visualizar: true, criar: true, editar: true, excluir: true },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: true },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: true },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: true },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: true, criar: true, editar: true, excluir: true }
    }
  },
  coordenador: {
    I: {
      usuarios: { visualizar: true, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: false, editar: false, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: true, criar: true, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: true, criar: true, editar: true, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      filiais: { visualizar: true, criar: true, editar: true, excluir: true },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: true },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: true },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  },
  administrativo: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: false, editar: false, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: false, excluir: false },
      filiais: { visualizar: true, criar: true, editar: false, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: true, editar: false, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: false, editar: false, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  },
  gerente: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: false, editar: false, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      filiais: { visualizar: true, criar: true, editar: true, excluir: true },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: true },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: true },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  },
  supervisor: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: false, editar: false, excluir: false },
      filiais: { visualizar: true, criar: false, editar: false, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: false, editar: false, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: false },
      filiais: { visualizar: true, criar: true, editar: true, excluir: false },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: false },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: true, criar: true, editar: true, excluir: true },
      filiais: { visualizar: true, criar: true, editar: true, excluir: true },
      rotas_nutricionistas: { visualizar: true, criar: true, editar: true, excluir: true },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: true },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: true },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  },
  nutricionista: {
    I: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: false, criar: false, editar: false, excluir: false },
      filiais: { visualizar: false, criar: false, editar: false, excluir: false },
      rotas_nutricionistas: { visualizar: false, criar: false, editar: false, excluir: false },
      unidades_escolares: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: false, editar: false, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    II: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: false, criar: false, editar: false, excluir: false },
      filiais: { visualizar: false, criar: false, editar: false, excluir: false },
      rotas_nutricionistas: { visualizar: false, criar: false, editar: false, excluir: false },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: false },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: false },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: false },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: false },
      necessidades: { visualizar: true, criar: true, editar: true, excluir: false },
      calendario: { visualizar: true, criar: true, editar: true, excluir: false },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    },
    III: {
      usuarios: { visualizar: false, criar: false, editar: false, excluir: false },
      fornecedores: { visualizar: false, criar: false, editar: false, excluir: false },
      filiais: { visualizar: false, criar: false, editar: false, excluir: false },
      rotas_nutricionistas: { visualizar: false, criar: false, editar: false, excluir: false },
      unidades_escolares: { visualizar: true, criar: true, editar: true, excluir: true },
      produtos_origem: { visualizar: true, criar: false, editar: false, excluir: false },
      unidades_medida: { visualizar: true, criar: false, editar: false, excluir: false },
      grupos: { visualizar: true, criar: false, editar: false, excluir: false },
      subgrupos: { visualizar: true, criar: false, editar: false, excluir: false },
      classes: { visualizar: true, criar: false, editar: false, excluir: false },
      produtos_per_capita: { visualizar: true, criar: true, editar: true, excluir: true },
      recebimentos_escolas: { visualizar: true, criar: true, editar: true, excluir: true },
      registros_diarios: { visualizar: true, criar: true, editar: true, excluir: true },
      permissoes: { visualizar: false, criar: false, editar: false, excluir: false }
    }
  }
};

// Lista de todas as telas disponíveis no sistema
const TODAS_TELAS = [
  'usuarios',
  'fornecedores',
  'filiais',
  'rotas_nutricionistas',
  'unidades_escolares',
  'produtos_origem',
  'unidades_medida',
  'grupos',
  'subgrupos',
  'classes',
  'produtos_per_capita',
  'recebimentos_escolas',
  'registros_diarios',
  'necessidades',
  'calendario',
  'permissoes'
];

// Tipos de acesso disponíveis
const TIPOS_ACESSO = [
  { valor: 'administrador', descricao: 'Administrador' },
  { valor: 'coordenador', descricao: 'Coordenador' },
  { valor: 'administrativo', descricao: 'Administrativo' },
  { valor: 'gerente', descricao: 'Gerente' },
  { valor: 'supervisor', descricao: 'Supervisor' },
  { valor: 'nutricionista', descricao: 'Nutricionista' }
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
  { nome: 'fornecedores', descricao: 'Gerenciamento de Fornecedores' },
  { nome: 'filiais', descricao: 'Gerenciamento de Filiais' },
  { nome: 'rotas_nutricionistas', descricao: 'Gerenciamento de Rotas Nutricionistas' },
  { nome: 'unidades_escolares', descricao: 'Gerenciamento de Unidades Escolares' },
  { nome: 'produtos_origem', descricao: 'Consulta de Produtos Origem' },
  { nome: 'unidades_medida', descricao: 'Consulta de Unidades de Medida' },
  { nome: 'grupos', descricao: 'Consulta de Grupos' },
  { nome: 'subgrupos', descricao: 'Consulta de Subgrupos' },
  { nome: 'classes', descricao: 'Consulta de Classes' },
  { nome: 'produtos_per_capita', descricao: 'Gerenciamento de Produtos Per Capita' },
  { nome: 'recebimentos_escolas', descricao: 'Gerenciamento de Recebimentos Escolas' },
  { nome: 'registros_diarios', descricao: 'Registros Diários de Refeições' },
  { nome: 'necessidades', descricao: 'Geração de Necessidades' },
  { nome: 'calendario', descricao: 'Gerenciamento de Calendário' },
  { nome: 'permissoes', descricao: 'Gerenciamento de Permissões' }
];

module.exports = {
  PERMISSOES_PADRAO,
  TODAS_TELAS,
  TIPOS_ACESSO,
  NIVEIS_ACESSO,
  TELAS_COM_DESCRICOES
};