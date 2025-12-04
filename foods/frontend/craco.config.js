const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Configurar resolve para ignorar exports restritivos do package.json
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }

      // Desabilitar verificação estrita de exports - prioriza apenas campos tradicionais
      // Isso resolve problemas com ckeditor5, react-query, react-dom e outros pacotes
      webpackConfig.resolve.exportsFields = ['main', 'module', 'browser'];

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

