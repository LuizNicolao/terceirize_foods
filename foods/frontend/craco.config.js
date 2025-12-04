const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Configurar resolve para ignorar exports restritivos do package.json
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }

      // Configurar exportsFields para ser mais permissivo
      // Prioriza 'main' e 'module' antes de 'exports' para evitar problemas com exports inválidos
      webpackConfig.resolve.exportsFields = ['main', 'module', 'browser', 'exports'];

      // Configurar conditionNames para ser mais permissivo
      if (!webpackConfig.resolve.conditionNames) {
        webpackConfig.resolve.conditionNames = ['require', 'node', 'default'];
      }

      // Adicionar alias para ckeditor5 para garantir resolução correta
      if (!webpackConfig.resolve.alias) {
        webpackConfig.resolve.alias = {};
      }
      
      // Alias para ckeditor5 apontando diretamente para o arquivo dist
      webpackConfig.resolve.alias['ckeditor5'] = path.resolve(__dirname, 'node_modules/ckeditor5/dist/ckeditor5.js');

      return webpackConfig;
    }
  }
};

