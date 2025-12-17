=== TiposCardapioCRUDController.criar - INÍCIO ===
req.body completo: {
  "nome": "Tipo de Cardápio - CD TOLEDO - PREFEITURA DE TOLEDO - MARMITA G (1000 ML), MARMITA M (750 ML)",
  "filial_id": 2,
  "centro_custo_id": 3,
  "contrato_id": 3,
  "produtos_comerciais": [
    {
      "produto_comercial_id": 2
    },
    {
      "produto_comercial_id": 1
    }
  ],
  "vinculos": [
    {
      "unidade_id": 529,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 529,
      "produto_comercial_id": 1
    },
    {
      "unidade_id": 530,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 530,
      "produto_comercial_id": 1
    },
    {
      "unidade_id": 531,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 531,
      "produto_comercial_id": 1
    },
    {
      "unidade_id": 532,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 532,
      "produto_comercial_id": 1
    },
    {
      "unidade_id": 533,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 533,
      "produto_comercial_id": 1
    },
    {
      "unidade_id": 534,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 534,
      "produto_comercial_id": 1
    },
    {
      "unidade_id": 535,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 535,
      "produto_comercial_id": 1
    },
    {
      "unidade_id": 536,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 536,
      "produto_comercial_id": 1
    },
    {
      "unidade_id": 537,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 537,
      "produto_comercial_id": 1
    },
    {
      "unidade_id": 538,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 538,
      "produto_comercial_id": 1
    },
    {
      "unidade_id": 539,
      "produto_comercial_id": 2
    },
    {
      "unidade_id": 539,
      "produto_comercial_id": 1
    }
  ]
}
Dados extraídos:
  filial_id: 2
  centro_custo_id: 3
  contrato_id: 3
  unidades_ids: [] tipo: array length: 0
  produtos_comerciais: [ { produto_comercial_id: 2 }, { produto_comercial_id: 1 } ] length: 2
  vinculos: [
  { unidade_id: 529, produto_comercial_id: 2 },
  { unidade_id: 529, produto_comercial_id: 1 },
  { unidade_id: 530, produto_comercial_id: 2 },
  { unidade_id: 530, produto_comercial_id: 1 },
  { unidade_id: 531, produto_comercial_id: 2 },
  { unidade_id: 531, produto_comercial_id: 1 },
  { unidade_id: 532, produto_comercial_id: 2 },
  { unidade_id: 532, produto_comercial_id: 1 },
  { unidade_id: 533, produto_comercial_id: 2 },
  { unidade_id: 533, produto_comercial_id: 1 },
  { unidade_id: 534, produto_comercial_id: 2 },
  { unidade_id: 534, produto_comercial_id: 1 },
  { unidade_id: 535, produto_comercial_id: 2 },
  { unidade_id: 535, produto_comercial_id: 1 },
  { unidade_id: 536, produto_comercial_id: 2 },
  { unidade_id: 536, produto_comercial_id: 1 },
  { unidade_id: 537, produto_comercial_id: 2 },
  { unidade_id: 537, produto_comercial_id: 1 },
  { unidade_id: 538, produto_comercial_id: 2 },
  { unidade_id: 538, produto_comercial_id: 1 },
  { unidade_id: 539, produto_comercial_id: 2 },
  { unidade_id: 539, produto_comercial_id: 1 }
] length: 22
Tipo de cardápio criado com ID: 20
=== TiposCardapioCRUDController.criar - Vincular Unidades via vínculos ===
vinculos recebidos: [
  { unidade_id: 529, produto_comercial_id: 2 },
  { unidade_id: 529, produto_comercial_id: 1 },
  { unidade_id: 530, produto_comercial_id: 2 },
  { unidade_id: 530, produto_comercial_id: 1 },
  { unidade_id: 531, produto_comercial_id: 2 },
  { unidade_id: 531, produto_comercial_id: 1 },
  { unidade_id: 532, produto_comercial_id: 2 },
  { unidade_id: 532, produto_comercial_id: 1 },
  { unidade_id: 533, produto_comercial_id: 2 },
  { unidade_id: 533, produto_comercial_id: 1 },
  { unidade_id: 534, produto_comercial_id: 2 },
  { unidade_id: 534, produto_comercial_id: 1 },
  { unidade_id: 535, produto_comercial_id: 2 },
  { unidade_id: 535, produto_comercial_id: 1 },
  { unidade_id: 536, produto_comercial_id: 2 },
  { unidade_id: 536, produto_comercial_id: 1 },
  { unidade_id: 537, produto_comercial_id: 2 },
  { unidade_id: 537, produto_comercial_id: 1 },
  { unidade_id: 538, produto_comercial_id: 2 },
  { unidade_id: 538, produto_comercial_id: 1 },
  { unidade_id: 539, produto_comercial_id: 2 },
  { unidade_id: 539, produto_comercial_id: 1 }
]
tipoCardapioId: 20
unidadesUnicas extraídas: [
  529, 530, 531, 532,
  533, 534, 535, 536,
  537, 538, 539
]
unidadesComNomes: [
  { id: 529, nome: 'COZINHA TOLEDO' },
  { id: 530, nome: 'UPA 24 HRS ( FUNCIONARIOS )' },
  { id: 531, nome: 'UPA 24 HRS ( PACIENTES )' },
  {
    id: 532,
    nome: 'PAM - DR JORGE MILTON NUNES - MINI HOSPITAL ( FUNCIONARIOS )'
  },
  {
    id: 533,
    nome: 'PAM - DR JORGE MILTON NUNES - MINI HOSPITAL ( PACIENTES )'
  },
  { id: 534, nome: 'SECRETARIA DE SEGURANCA E TRANSITO' },
  { id: 535, nome: 'ALMOXARIFADO INFRAESTRUTURA' },
  { id: 536, nome: 'PATIO DE MAQUINAS' },
  { id: 537, nome: 'SECRETARIA DE SAUDE' },
  { id: 538, nome: 'CASA DE PASSAGEM' },
  { id: 539, nome: 'HIGIENIZACAO' }
]
Executando transação para vincular unidades via vínculos. Queries: [
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [ 20, 529, 'COZINHA TOLEDO', 4, 4 ]
  },
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [ 20, 530, 'UPA 24 HRS ( FUNCIONARIOS )', 4, 4 ]
  },
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [ 20, 531, 'UPA 24 HRS ( PACIENTES )', 4, 4 ]
  },
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [
      20,
      532,
      'PAM - DR JORGE MILTON NUNES - MINI HOSPITAL ( FUNCIONARIOS )',
      4,
      4
    ]
  },
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [
      20,
      533,
      'PAM - DR JORGE MILTON NUNES - MINI HOSPITAL ( PACIENTES )',
      4,
      4
    ]
  },
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [ 20, 534, 'SECRETARIA DE SEGURANCA E TRANSITO', 4, 4 ]
  },
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [ 20, 535, 'ALMOXARIFADO INFRAESTRUTURA', 4, 4 ]
  },
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [ 20, 536, 'PATIO DE MAQUINAS', 4, 4 ]
  },
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [ 20, 537, 'SECRETARIA DE SAUDE', 4, 4 ]
  },
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [ 20, 538, 'CASA DE PASSAGEM', 4, 4 ]
  },
  {
    sql: 'INSERT INTO tipos_cardapio_unidades \n' +
      '                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) \n' +
      '                  VALUES (?, ?, ?, ?, ?)\n' +
      '                  ON DUPLICATE KEY UPDATE\n' +
      '                    unidade_nome = VALUES(unidade_nome),\n' +
      '                    usuario_atualizador_id = VALUES(usuario_atualizador_id)',
    params: [ 20, 539, 'HIGIENIZACAO', 4, 4 ]
  }
]
Resultado da transação de vínculos de unidades: [
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 115,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  },
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 116,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  },
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 117,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  },
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 118,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  },
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 119,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  },
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 120,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  },
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 121,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  },
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 122,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  },
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 123,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  },
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 124,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  },
  ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 125,
    info: '',
    serverStatus: 3,
    warningStatus: 0,
    changedRows: 0
  }
]
=== Atualizando quantidades_servidas com tipo_cardapio_id ===
unidadesIds: [
  529, 530, 531, 532,
  533, 534, 535, 536,
  537, 538, 539
]
tipoCardapioId: 20
Nenhum período vinculado à unidade 529
Unidade 530, Período 35: 0 registros sem tipo_cardapio_id de 1 totais
- Unidade 530, Período 35: Todos os 1 registros já têm tipo_cardapio_id
Unidade 530, Período 36: 0 registros sem tipo_cardapio_id de 1 totais
- Unidade 530, Período 36: Todos os 1 registros já têm tipo_cardapio_id
Nenhum período vinculado à unidade 531
Unidade 532, Período 35: 0 registros sem tipo_cardapio_id de 1 totais
- Unidade 532, Período 35: Todos os 1 registros já têm tipo_cardapio_id
Unidade 532, Período 36: 0 registros sem tipo_cardapio_id de 1 totais
- Unidade 532, Período 36: Todos os 1 registros já têm tipo_cardapio_id
Nenhum período vinculado à unidade 533
Nenhum período vinculado à unidade 534
Nenhum período vinculado à unidade 535
Nenhum período vinculado à unidade 536
Nenhum período vinculado à unidade 537
Unidade 538, Período 35: 0 registros sem tipo_cardapio_id de 1 totais
- Unidade 538, Período 35: Todos os 1 registros já têm tipo_cardapio_id
Unidade 538, Período 36: 0 registros sem tipo_cardapio_id de 1 totais
- Unidade 538, Período 36: Todos os 1 registros já têm tipo_cardapio_id
Nenhum período vinculado à unidade 539
