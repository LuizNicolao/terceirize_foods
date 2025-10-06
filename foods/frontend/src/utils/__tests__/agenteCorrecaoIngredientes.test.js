/**
 * Testes para o Agente Híbrido Inteligente de Correção de Ingredientes - CUSTO ZERO
 */

import { 
  agenteCorrecaoIngredientes, 
  obterEstatisticasAgente, 
  obterInfoAgente,
  adicionarCorrecao,
  limparBaseConhecimento,
  exportarBaseConhecimento
} from '../agenteCorrecaoIngredientes';

describe('Agente de Correção de Ingredientes', () => {
  
  test('deve corrigir ingredientes com contexto de arroz', () => {
    const entrada = 'arroz, colorido, integral';
    const resultado = agenteCorrecaoIngredientes(entrada);
    expect(resultado).toBe('arroz, arroz colorido, arroz integral');
  });

  test('deve corrigir ingredientes com contexto de frango', () => {
    const entrada = 'frango, desfiado, acebolado';
    const resultado = agenteCorrecaoIngredientes(entrada);
    expect(resultado).toBe('frango, frango desfiado, frango acebolado');
  });

  test('deve corrigir ingredientes com contexto de abobrinha', () => {
    const entrada = 'abobrinha, cubos, tomate, cubos';
    const resultado = agenteCorrecaoIngredientes(entrada);
    expect(resultado).toBe('abobrinha, abobrinha em cubos, tomate, tomate em cubos');
  });

  test('deve corrigir ingredientes com contexto de carne', () => {
    const entrada = 'carne, cubos, refogado, moída';
    const resultado = agenteCorrecaoIngredientes(entrada);
    expect(resultado).toBe('carne, carne em cubos, carne refogada, carne moída');
  });

  test('deve corrigir ingredientes com contexto de cenoura', () => {
    const entrada = 'cenoura, ralada, fatiado';
    const resultado = agenteCorrecaoIngredientes(entrada);
    expect(resultado).toBe('cenoura, cenoura ralada, cenoura fatiada');
  });

  test('deve corrigir ingredientes com contexto de milho', () => {
    const entrada = 'milho, congelado, ervilha, congelado';
    const resultado = agenteCorrecaoIngredientes(entrada);
    expect(resultado).toBe('milho, milho congelado, ervilha, ervilha congelada');
  });

  test('deve manter ingredientes já corretos', () => {
    const entrada = 'arroz, feijão, tempero verde, banana';
    const resultado = agenteCorrecaoIngredientes(entrada);
    expect(resultado).toBe('arroz, feijão, tempero verde, banana');
  });

  test('deve corrigir grafia de frutas', () => {
    const entrada = 'maca, tangerina, pessego';
    const resultado = agenteCorrecaoIngredientes(entrada);
    expect(resultado).toBe('maçã, tangerina, pêssego');
  });

  test('deve retornar string vazia para entrada vazia', () => {
    const resultado = agenteCorrecaoIngredientes('');
    expect(resultado).toBe('');
  });

  test('deve retornar string vazia para entrada null', () => {
    const resultado = agenteCorrecaoIngredientes(null);
    expect(resultado).toBe('');
  });

  test('deve remover duplicatas', () => {
    const entrada = 'arroz, arroz, feijão, feijão';
    const resultado = agenteCorrecaoIngredientes(entrada);
    expect(resultado).toBe('arroz, feijão');
  });

  test('deve obter estatísticas corretas', () => {
    const entrada = 'arroz, colorido, frango, desfiado';
    const stats = obterEstatisticasAgente(entrada);
    expect(stats.ingredientesOriginais).toBe(4);
    expect(stats.ingredientesCorrigidos).toBe(4);
    expect(stats.diferenca).toBe(0);
  });

  test('deve processar caso complexo real', () => {
    const entrada = 'arroz, colorido, frango, integral, desfiado, abobrinha, cubos, milho, tempero verde, congelado, feijão, agrião, maçã';
    const resultado = agenteCorrecaoIngredientes(entrada);
    
    // Verifica se as correções principais foram aplicadas
    expect(resultado).toContain('arroz colorido');
    expect(resultado).toContain('arroz integral');
    expect(resultado).toContain('frango desfiado');
    expect(resultado).toContain('abobrinha em cubos');
    expect(resultado).toContain('milho congelado');
  });

  test('deve corrigir erros de digitação', () => {
    const entrada = 'arrroz, feijao, maca, pessego';
    const resultado = agenteCorrecaoIngredientes(entrada);
    
    expect(resultado).toContain('arroz');
    expect(resultado).toContain('feijão');
    expect(resultado).toContain('maçã');
    expect(resultado).toContain('pêssego');
  });

  test('deve obter informações do agente', () => {
    const info = obterInfoAgente();
    
    expect(info.nome).toBe('Agente Híbrido Inteligente - Custo Zero');
    expect(info.custo).toBe('R$ 0,00');
    expect(info.estrategias).toHaveLength(4);
    expect(info.versao).toBe('1.0.0');
  });

  test('deve aprender novos padrões', () => {
    limparBaseConhecimento();
    
    adicionarCorrecao('picado', 'cebola picada', { temCebola: true });
    
    const entrada = 'cebola, picado';
    const resultado = agenteCorrecaoIngredientes(entrada);
    
    expect(resultado).toContain('cebola picada');
  });

  test('deve exportar base de conhecimento', () => {
    limparBaseConhecimento();
    adicionarCorrecao('teste', 'teste corrigido', {});
    
    const exportado = exportarBaseConhecimento();
    
    expect(exportado).toHaveProperty('baseConhecimento');
    expect(exportado).toHaveProperty('padroesAprendidos');
    expect(exportado).toHaveProperty('timestamp');
  });

  test('deve limpar base de conhecimento', () => {
    adicionarCorrecao('teste', 'teste corrigido', {});
    limparBaseConhecimento();
    
    const stats = obterEstatisticasAgente('teste');
    expect(stats.padroesAprendidos).toBe(0);
  });

  test('deve obter estatísticas completas', () => {
    const entrada = 'arroz, colorido, frango, desfiado';
    const stats = obterEstatisticasAgente(entrada);
    
    expect(stats).toHaveProperty('ingredientesOriginais');
    expect(stats).toHaveProperty('ingredientesCorrigidos');
    expect(stats).toHaveProperty('diferenca');
    expect(stats).toHaveProperty('taxaCorrecao');
    expect(stats).toHaveProperty('padroesAprendidos');
    expect(stats).toHaveProperty('bancoIngredientes');
  });
});
