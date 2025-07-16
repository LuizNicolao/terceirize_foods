const { executeQuery } = require('../config/database');

const unidadesExemplo = [
  { nome: 'Quilograma', sigla: 'KG' },
  { nome: 'Gramas', sigla: 'G' },
  { nome: 'Litro', sigla: 'L' },
  { nome: 'Mililitro', sigla: 'ML' },
  { nome: 'Unidade', sigla: 'UN' },
  { nome: 'Pacote', sigla: 'PCT' },
  { nome: 'Caixa', sigla: 'CX' },
  { nome: 'Metro', sigla: 'M' },
  { nome: 'Centímetro', sigla: 'CM' },
  { nome: 'Metro Quadrado', sigla: 'M²' }
];

const criarUnidades = async () => {
  try {
    console.log('Iniciando criação de unidades de medida...');
    
    for (const unidade of unidadesExemplo) {
      // Verificar se já existe
      const existing = await executeQuery(
        'SELECT id FROM unidades_medida WHERE sigla = ?',
        [unidade.sigla]
      );
      
      if (existing.length === 0) {
        await executeQuery(
          'INSERT INTO unidades_medida (nome, sigla) VALUES (?, ?)',
          [unidade.nome, unidade.sigla]
        );
        console.log(`✅ Unidade criada: ${unidade.nome} (${unidade.sigla})`);
      } else {
        console.log(`⚠️ Unidade já existe: ${unidade.nome} (${unidade.sigla})`);
      }
    }
    
    console.log('✅ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar unidades:', error);
    process.exit(1);
  }
};

criarUnidades(); 