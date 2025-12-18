const ConfiguracaoMediasRepository = require('../../repositories/configuracaoMediasRepo');

class ConfiguracaoMediasController {
  static async obterConfiguracao(req, res) {
    try {
      // Verificar se usuário é administrador
      if (req.user?.tipo_de_acesso !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem acessar esta configuração.'
        });
      }

      const { ano = new Date().getFullYear() } = req.query;
      
      const configuracao = await ConfiguracaoMediasRepository.obterPorAno(ano);
      
      res.json({
        success: true,
        data: configuracao
      });
    } catch (error) {
      console.error('Erro ao obter configuração de médias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async salvarConfiguracao(req, res) {
    try {
      // Verificar se usuário é administrador
      if (req.user?.tipo_de_acesso !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem salvar esta configuração.'
        });
      }

      const { ano, meses_ativos } = req.body;

      if (!ano || !Array.isArray(meses_ativos)) {
        return res.status(400).json({
          success: false,
          message: 'Ano e meses_ativos são obrigatórios'
        });
      }

      // Validar meses (1-12)
      const mesesInvalidos = meses_ativos.filter(mes => mes < 1 || mes > 12);
      if (mesesInvalidos.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Meses inválidos. Deve ser entre 1 e 12'
        });
      }

      await ConfiguracaoMediasRepository.salvarConfiguracao(ano, meses_ativos);
      
      res.json({
        success: true,
        message: 'Configuração salva com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar configuração de médias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async recalcularMedias(req, res) {
    try {
      // Verificar se usuário é administrador
      if (req.user?.tipo_de_acesso !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem recalcular médias.'
        });
      }

      const { escola_id } = req.query; // Opcional: recalcular apenas uma escola

      const resultado = await ConfiguracaoMediasRepository.recalcularMedias(
        escola_id ? parseInt(escola_id) : null
      );
      
      res.json({
        success: true,
        message: `Recálculo concluído: ${resultado.sucesso} sucesso(s), ${resultado.falhas} falha(s)`,
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao recalcular médias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = ConfiguracaoMediasController;

