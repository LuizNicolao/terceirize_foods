const { query } = require('../config/database');

const listar = async (req, res) => {
  try {
    const escolas = await query(`
      SELECT id, nome_escola, rota, cidade, estado, email_nutricionista
      FROM escolas 
      WHERE ativo = 1 
      ORDER BY nome_escola ASC
    `);

    res.json({
      success: true,
      data: escolas
    });
  } catch (error) {
    console.error('Erro ao buscar escolas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar escolas'
    });
  }
};

module.exports = {
  listar
};
