const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Configurar resolve para ignorar exports restritivos do package.json
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }

      // Configurar exportsFields para permitir importações que não estão nos exports
      // Isso resolve o problema com ckeditor5 que tem exports muito restritivos
      if (!webpackConfig.resolve.exportsFields) {
        webpackConfig.resolve.exportsFields = ['exports', 'module', 'main', 'browser'];
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

