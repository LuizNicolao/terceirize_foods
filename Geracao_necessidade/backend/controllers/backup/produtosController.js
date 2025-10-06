const { query } = require('../config/database');

const listar = async (req, res) => {
  try {
    const produtos = await query(`
      SELECT id, nome, unidade_medida 
      FROM produtos 
      WHERE ativo = 1 
      ORDER BY nome ASC
    `);

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos'
    });
  }
};

const buscarPorGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params;
    
    // Buscar o nome do grupo pelo ID
    const grupos = await query(`
      SELECT DISTINCT tipo as nome
      FROM produtos 
      WHERE ativo = 1 
      ORDER BY tipo ASC
    `);
    
    const grupoNome = grupos[grupoId - 1]?.nome;
    
    if (!grupoNome) {
      return res.status(404).json({
        success: false,
        error: 'Grupo não encontrado',
        message: 'O grupo selecionado não existe'
      });
    }
    
    const produtos = await query(`
      SELECT id, nome, unidade_medida, tipo as grupo_nome
      FROM produtos
      WHERE ativo = 1 AND tipo = ?
      ORDER BY nome ASC
    `, [grupoNome]);

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos por grupo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos por grupo'
    });
  }
};

const buscarGrupos = async (req, res) => {
  try {
    // Usar os tipos de produtos como grupos
    const grupos = await query(`
      SELECT DISTINCT tipo as nome, tipo as id
      FROM produtos 
      WHERE ativo = 1 
      ORDER BY tipo ASC
    `);

    // Transformar para o formato esperado
    const gruposFormatados = grupos.map((grupo, index) => ({
      id: index + 1,
      nome: grupo.nome,
      descricao: `Grupo de produtos ${grupo.nome}`
    }));

    res.json({
      success: true,
      data: gruposFormatados
    });
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar grupos'
    });
  }
};

module.exports = {
  listar,
  buscarPorGrupo,
  buscarGrupos
};
