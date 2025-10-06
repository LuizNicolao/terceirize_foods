const { query } = require('../config/database');

const listar = async (req, res) => {
  try {
    const tiposEntrega = await query(`
      SELECT id, nome, descricao 
      FROM tipos_entrega 
      WHERE ativo = 1 
      ORDER BY nome ASC
    `);

    res.json({
      success: true,
      data: tiposEntrega
    });
  } catch (error) {
    console.error('Erro ao buscar tipos de entrega:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar tipos de entrega'
    });
  }
};

module.exports = {
  listar
};
